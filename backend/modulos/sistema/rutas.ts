import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../../database/operaciones.js';
import { withDatabase } from '../../database/transaccion-http.js';
import { checkDatabase } from '../../database/conexion.js';

const router = Router();

router.get("/api/health", async (_req, res) => {
    try { await checkDatabase(); res.json({status:"ok",database:"mysql"}); }
    catch { res.status(503).json({error:"MySQL no disponible"}); }
  });

router.post('/api/sistema/limpiar-todo', withDatabase((_req: Request, res: Response) => {
    try {
      const result = db.borrarTodo();
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

export default router;
