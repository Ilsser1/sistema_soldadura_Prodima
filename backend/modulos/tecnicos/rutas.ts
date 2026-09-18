import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../../database/operaciones.js';
import { withDatabase } from '../../database/transaccion-http.js';
import { getClientIp, getReqUser } from '../../compartido/http.js';

const router = Router();

router.get('/api/tecnicos', withDatabase((_req: Request, res: Response) => {
    res.json(db.getTecnicos());
  }));

router.post('/api/tecnicos', withDatabase((req: Request, res: Response) => {
    try {
      const nuevo = db.crearTecnico(req.body, getClientIp(req), getReqUser(req));
      res.status(201).json(nuevo);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

router.get('/api/tecnicos/:id', withDatabase((req: Request, res: Response) => {
    const t = db.getTecnicoById(Number(req.params.id));
    if (!t) return res.status(404).json({ error: 'Técnico no encontrado' });
    res.json(t);
  }));

router.put('/api/tecnicos/:id', withDatabase((req: Request, res: Response) => {
    try {
      const act = db.actualizarTecnico(Number(req.params.id), req.body, getClientIp(req), getReqUser(req));
      res.json(act);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

router.delete('/api/tecnicos/:id', withDatabase((req: Request, res: Response) => {
    try {
      const permanente = req.query.permanente !== 'false';
      if (permanente) {
        const result = db.eliminarTecnico(Number(req.params.id), getClientIp(req), getReqUser(req));
        res.json(result);
      } else {
        const act = db.actualizarTecnico(Number(req.params.id), { estado: 'Inactivo' }, getClientIp(req), getReqUser(req));
        res.json({ mensaje: 'Técnico desactivado', tecnico: act });
      }
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

router.put('/api/tecnicos/:id/toggle-estado', withDatabase((req: Request, res: Response) => {
    try {
      const t = db.getTecnicoById(Number(req.params.id));
      if (!t) return res.status(404).json({ error: 'Técnico no encontrado' });
      const nuevoEstado = t.estado === 'Activo' ? 'Inactivo' : 'Activo';
      const act = db.actualizarTecnico(Number(req.params.id), { estado: nuevoEstado }, getClientIp(req), getReqUser(req));
      res.json(act);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

export default router;
