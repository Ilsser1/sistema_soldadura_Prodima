import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../../database/operaciones.js';
import { withDatabase } from '../../database/transaccion-http.js';
import { getClientIp, getReqUser } from '../../compartido/http.js';

const router = Router();

router.post('/api/auth/login', withDatabase((req: Request, res: Response) => {
    const { username, email, correo, password } = req.body;
    const term = String(username || email || correo || "").toLowerCase().trim();
    const usuario = db.autenticar(term, password);

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas, correo no asignado o usuario inactivo.' });
    }

    db.registrarBitacora(usuario.id, `${usuario.nombre} ${usuario.apellido} (${usuario.username})`, 'LOGIN', 'Autenticación', null, getClientIp(req), `Inicio de sesión exitoso con rol ${usuario.rol}.`);

    return res.json({
      token: `jwt_token_simulado_${usuario.id}_${Date.now()}`,
      user: usuario,
      usuario
    });
  }));

router.post('/api/auth/refresh', withDatabase((_req: Request, res: Response) => {
    return res.json({ status: 'ok', token: `jwt_refreshed_${Date.now()}` });
  }));

router.post('/api/auth/logout', withDatabase((req: Request, res: Response) => {
    const user = getReqUser(req);
    db.registrarBitacora(1, user, 'LOGOUT', 'Autenticación', null, getClientIp(req), 'Cierre de sesión del usuario.');
    return res.json({ status: 'logged_out' });
  }));

router.get('/api/auth/me', withDatabase((_req: Request, res: Response) => {
    const user = db.getUsuarioById(1);
    return res.json(user);
  }));

export default router;
