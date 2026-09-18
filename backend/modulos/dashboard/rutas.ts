import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../../database/operaciones.js';
import { withDatabase } from '../../database/transaccion-http.js';

const router = Router();

router.get('/api/dashboard', withDatabase((_req: Request, res: Response) => {
    res.json(db.getDashboardStats());
  }));

export default router;
