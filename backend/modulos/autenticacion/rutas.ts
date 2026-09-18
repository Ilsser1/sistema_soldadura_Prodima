import { createSession, sessionUserId, revokeSession } from './sesiones.js';
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
      token: createSession(usuario.id),
      user: usuario,
      usuario
    });
  }));

router.post('/api/auth/refresh', withDatabase((req: Request, res: Response) => {
    const id = sessionUserId(req)!;
    revokeSession(req);
    return res.json({ status: 'ok', token: createSession(id) });
  }));

router.post('/api/auth/logout', withDatabase((req: Request, res: Response) => {
    const user = getReqUser(req);
    const id = sessionUserId(req)!;
    revokeSession(req);
    db.registrarBitacora(id, user, 'LOGOUT', 'Autenticación', null, getClientIp(req), 'Cierre de sesión del usuario.');
    return res.json({ status: 'logged_out' });
  }));

router.get('/api/auth/me', withDatabase((req: Request, res: Response) => {
    const user = db.getUsuarioById(sessionUserId(req)!);
    return res.json(user);
  }));

export default router;
