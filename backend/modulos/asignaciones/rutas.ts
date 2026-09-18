import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../../database/operaciones.js';
import { withDatabase } from '../../database/transaccion-http.js';
import { getClientIp, getReqUser } from '../../compartido/http.js';

const router = Router();

router.get('/api/asignaciones', withDatabase((_req: Request, res: Response) => {
    res.json(db.getAsignaciones());
  }));

router.post('/api/asignaciones', withDatabase((req: Request, res: Response) => {
    try {
      const { tecnico_id, maquina_id, motivo, observaciones } = req.body;
      const asig = db.crearAsignacion(
        Number(tecnico_id),
        Number(maquina_id),
        motivo || 'Asignación de trabajo operativo',
        getReqUser(req),
        observaciones || '',
        getClientIp(req)
      );
      res.status(201).json(asig);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

router.put('/api/asignaciones/:id/finalizar', withDatabase((req: Request, res: Response) => {
    try {
      const { observaciones } = req.body;
      const fin = db.finalizarAsignacion(Number(req.params.id), getReqUser(req), observaciones || '', getClientIp(req));
      res.json(fin);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

export default router;
