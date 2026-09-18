import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../../database/operaciones.js';
import { withDatabase } from '../../database/transaccion-http.js';

const router = Router();

router.get('/api/historial/maquina/:id', withDatabase((req: Request, res: Response) => {
    res.json(db.getHistorialPorMaquina(Number(req.params.id)));
  }));

export default router;
