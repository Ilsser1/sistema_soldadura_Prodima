import { sessionUserId } from '../modulos/autenticacion/sesiones.js';
import { technicianScope } from '../modulos/autenticacion/alcance.js';
import type { Request, Response, RequestHandler } from 'express';
import { dbContext, IndustrialDatabase } from './operaciones.js';
import { transaction } from './conexion.js';

class RejectedResponse extends Error {
  constructor(public status: number, public body: unknown) { super('Request rejected'); }
}
export function withDatabase(handler: (req: Request, res: Response) => unknown): RequestHandler {
  return async (req, res) => {
    try {
      const reply = await transaction(async data => {
        const publicLogin = req.path === '/api/auth/login';
        const user = data.usuarios.find(u => u.id === sessionUserId(req) && u.estado === 'Activo');
        if (!publicLogin && !user) throw new RejectedResponse(401, { error: 'Inicie sesion nuevamente.' });
        const technician = !publicLogin && user && user.rol !== 'Administrador' && user.rol !== 'Supervisor';
        const scope = technician ? technicianScope(data, user.id) : data;
        if (user) {
          req.headers['x-user-name'] = user.username;
          req.headers['x-user-role'] = user.rol;
        }
        if (technician && req.method !== 'GET' && !req.path.startsWith('/api/auth/')) {
          const alertOperation = (req.method === 'PUT' || req.method === 'DELETE') && /^\/api\/alertas(?:\/\d+(?:\/leer)?|\/leer-todas)?$/.test(req.path);
          if (!alertOperation) throw new RejectedResponse(403, { error: 'Operacion reservada a administracion o supervision.' });
        }
        const visibleAlertIds = new Set(scope.alertas.map(a => a.id));
        let status = 200;
        let body: unknown;
        let replied = false;
        const buffered = {
          status(value: number) { status = value; return buffered; },
          json(value: unknown) { body = value; replied = true; return buffered; },
        };
        await dbContext.run(new IndustrialDatabase(scope), () => handler(req, buffered as unknown as Response));
        if (!replied) throw new Error('Missing API response');
        if (status >= 400) throw new RejectedResponse(status, body);
        if (technician) data.alertas = data.alertas.filter(a => !visibleAlertIds.has(a.id)).concat(scope.alertas);
        return { status, body };
      });
      res.status(reply.status).json(reply.body);
    } catch (error: any) {
      if (error instanceof RejectedResponse) { res.status(error.status).json(error.body); return; }
      console.error('MySQL request failed:', error.code || 'DATABASE_ERROR');
      const duplicate = error.code === 'ER_DUP_ENTRY';
      res.status(duplicate ? 409 : 503).json({ error: duplicate ? 'Ya existe un registro con esos datos.' : 'No se pudo completar la operación en MySQL. Revise la conexión y el esquema.' });
    }
  };
}

