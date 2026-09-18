import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../../database/operaciones.js';
import { withDatabase } from '../../database/transaccion-http.js';
import { getClientIp, getReqUser } from '../../compartido/http.js';

const router = Router();

router.get('/api/mantenimientos', withDatabase((_req: Request, res: Response) => {
    res.json(db.getMantenimientos());
  }));

router.post('/api/mantenimientos', withDatabase((req: Request, res: Response) => {
    try {
      const nuevo = db.crearMantenimiento(req.body, getClientIp(req), getReqUser(req));
      res.status(201).json(nuevo);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

router.put('/api/mantenimientos/:id', withDatabase((req: Request, res: Response) => {
    try {
      const act = db.actualizarMantenimiento(Number(req.params.id), req.body, getClientIp(req), getReqUser(req));
      res.json(act);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

router.delete('/api/mantenimientos/:id', withDatabase((req: Request, res: Response) => {
    try {
      const ok = db.eliminarMantenimiento(Number(req.params.id), getClientIp(req), getReqUser(req));
      if (!ok) {
        return res.status(404).json({ error: 'Mantenimiento no encontrado' });
      }
      res.json({ status: 'ok', id: Number(req.params.id) });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

export default router;
