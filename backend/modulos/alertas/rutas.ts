import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../../database/operaciones.js';
import { withDatabase } from '../../database/transaccion-http.js';

const router = Router();

router.get('/api/alertas', withDatabase((_req: Request, res: Response) => {
    res.json(db.getAlertas());
  }));

router.get('/api/alertas/no-leidas', withDatabase((_req: Request, res: Response) => {
    res.json(db.getAlertas(true));
  }));

router.put('/api/alertas/:id/leer', withDatabase((req: Request, res: Response) => {
    try {
      const act = db.marcarAlertaLeida(Number(req.params.id));
      res.json(act);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

router.put('/api/alertas/leer-todas', withDatabase((_req: Request, res: Response) => {
    try {
      const result = db.marcarTodasAlertasLeidas();
      res.json({ status: 'ok', ...result });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

router.delete('/api/alertas/:id', withDatabase((req: Request, res: Response) => {
    try {
      const ok = db.eliminarAlerta(Number(req.params.id));
      if (!ok) {
        return res.status(404).json({ error: 'Alerta no encontrada' });
      }
      res.json({ status: 'ok', id: Number(req.params.id) });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

router.delete('/api/alertas', withDatabase((req: Request, res: Response) => {
    try {
      const soloLeidas = req.query.soloLeidas === 'true';
      const result = db.eliminarTodasAlertas(soloLeidas);
      res.json({ status: 'ok', ...result });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

router.post('/api/alertas/ejecutar-revision', withDatabase((_req: Request, res: Response) => {
    const generadas = db.ejecutarRevisionAlertas();
    res.json({ mensaje: `Proceso de revisión completado. Nuevas alertas generadas: ${generadas}` });
  }));

export default router;
