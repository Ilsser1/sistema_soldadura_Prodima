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
        let status = 200;
        let body: unknown;
        let replied = false;
        const buffered = {
          status(value: number) { status = value; return buffered; },
          json(value: unknown) { body = value; replied = true; return buffered; },
        };
        await dbContext.run(new IndustrialDatabase(data), () => handler(req, buffered as unknown as Response));
        if (!replied) throw new Error('Missing API response');
        if (status >= 400) throw new RejectedResponse(status, body);
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

