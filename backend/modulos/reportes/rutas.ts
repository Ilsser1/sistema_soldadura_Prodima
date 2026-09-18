import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../../database/operaciones.js';
import { withDatabase } from '../../database/transaccion-http.js';

const router = Router();

router.get('/api/reportes', withDatabase((_req: Request, res: Response) => {
    res.json({
      tecnicos: db.getTecnicos(),
      maquinas: db.getMaquinas(),
      asignaciones: db.getAsignaciones(),
      mantenimientos: db.getMantenimientos(),
      contratos: db.getContratos(),
      alertas: db.getAlertas(),
      bitacora: db.getBitacora()
    });
  }));

export default router;
