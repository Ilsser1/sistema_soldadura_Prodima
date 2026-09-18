import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../../database/operaciones.js';
import { withDatabase } from '../../database/transaccion-http.js';
import { getClientIp, getReqUser } from '../../compartido/http.js';

const router = Router();

router.get('/api/contratos', withDatabase((_req: Request, res: Response) => {
    res.json(db.getContratos());
  }));

router.post('/api/contratos', withDatabase((req: Request, res: Response) => {
    try {
      const nuevo = db.crearContrato(req.body, getClientIp(req), getReqUser(req));
      res.status(201).json(nuevo);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

router.put('/api/contratos/:id', withDatabase((req: Request, res: Response) => {
    try {
      const act = db.actualizarContrato(Number(req.params.id), req.body, getClientIp(req), getReqUser(req));
      res.json(act);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

export default router;
