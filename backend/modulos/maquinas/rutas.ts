import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../../database/operaciones.js';
import { withDatabase } from '../../database/transaccion-http.js';
import { getClientIp, getReqUser } from '../../compartido/http.js';

const router = Router();

router.get('/api/maquinas', withDatabase((_req: Request, res: Response) => {
    res.json(db.getMaquinas());
  }));

router.post('/api/maquinas', withDatabase((req: Request, res: Response) => {
    try {
      const nueva = db.crearMaquina(req.body, getClientIp(req), getReqUser(req));
      res.status(201).json(nueva);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

router.get('/api/maquinas/:id', withDatabase((req: Request, res: Response) => {
    const m = db.getMaquinaById(Number(req.params.id));
    if (!m) return res.status(404).json({ error: 'Máquina no encontrada' });
    res.json(m);
  }));

router.put('/api/maquinas/:id', withDatabase((req: Request, res: Response) => {
    try {
      const act = db.actualizarMaquina(Number(req.params.id), req.body, getClientIp(req), getReqUser(req));
      res.json(act);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

router.delete('/api/maquinas/:id', withDatabase((req: Request, res: Response) => {
    try {
      const permanente = req.query.permanente !== 'false';
      if (permanente) {
        const result = db.eliminarMaquina(Number(req.params.id), getClientIp(req), getReqUser(req));
        res.json(result);
      } else {
        const act = db.actualizarMaquina(Number(req.params.id), { estado: 'Baja' }, getClientIp(req), getReqUser(req));
        res.json({ mensaje: 'Máquina dada de baja', maquina: act });
      }
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

export default router;
