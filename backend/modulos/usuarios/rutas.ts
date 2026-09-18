import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../../database/operaciones.js';
import { withDatabase } from '../../database/transaccion-http.js';
import { getClientIp, getReqUser } from '../../compartido/http.js';

const router = Router();

router.get('/api/usuarios', withDatabase((_req: Request, res: Response) => {
    res.json(db.getUsuarios());
  }));

router.post('/api/usuarios', withDatabase((req: Request, res: Response) => {
    try {
      const nuevo = db.crearUsuario(req.body, getClientIp(req), getReqUser(req));
      res.status(201).json(nuevo);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

router.get('/api/usuarios/:id', withDatabase((req: Request, res: Response) => {
    const u = db.getUsuarioById(Number(req.params.id));
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(u);
  }));

router.put('/api/usuarios/:id', withDatabase((req: Request, res: Response) => {
    try {
      const act = db.actualizarUsuario(Number(req.params.id), req.body, getClientIp(req), getReqUser(req));
      res.json(act);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

router.put('/api/usuarios/:id/toggle-estado', withDatabase((req: Request, res: Response) => {
    try {
      const act = db.toggleEstadoUsuario(Number(req.params.id), getClientIp(req), getReqUser(req));
      res.json(act);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

router.delete('/api/usuarios/:id', withDatabase((req: Request, res: Response) => {
    try {
      const act = db.toggleEstadoUsuario(Number(req.params.id), getClientIp(req), getReqUser(req));
      res.json({ mensaje: 'Usuario desactivado', usuario: act });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

export default router;
