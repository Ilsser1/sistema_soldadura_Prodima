import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './db.js';
import { withDatabase } from './http-db.js';
import { checkDatabase, pool } from './mysql.js';

async function startServer() {
  const app = express();
  await checkDatabase();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());
  app.get("/api/health", async (_req, res) => {
    try { await checkDatabase(); res.json({status:"ok",database:"mysql"}); }
    catch { res.status(503).json({error:"MySQL no disponible"}); }
  });

  const getClientIp = (req: Request) => (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

  const getReqUser = (req: Request) => (req.headers['x-user-name'] as string) || 'admin';


  app.post('/api/auth/login', withDatabase((req: Request, res: Response) => {
    const { username, email, correo, password } = req.body;
    const term = String(username || email || correo || "").toLowerCase().trim();
    const usuario = db.autenticar(term, password);

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas, correo no asignado o usuario inactivo.' });
    }

    db.registrarBitacora(usuario.id, `${usuario.nombre} ${usuario.apellido} (${usuario.username})`, 'LOGIN', 'Autenticación', null, getClientIp(req), `Inicio de sesión exitoso con rol ${usuario.rol}.`);

    return res.json({
      token: `jwt_token_simulado_${usuario.id}_${Date.now()}`,
      user: usuario,
      usuario
    });
  }));

  app.post('/api/auth/refresh', withDatabase((_req: Request, res: Response) => {
    return res.json({ status: 'ok', token: `jwt_refreshed_${Date.now()}` });
  }));

  app.post('/api/auth/logout', withDatabase((req: Request, res: Response) => {
    const user = getReqUser(req);
    db.registrarBitacora(1, user, 'LOGOUT', 'Autenticación', null, getClientIp(req), 'Cierre de sesión del usuario.');
    return res.json({ status: 'logged_out' });
  }));

  app.get('/api/auth/me', withDatabase((_req: Request, res: Response) => {
    const user = db.getUsuarioById(1);
    return res.json(user);
  }));

  app.get('/api/usuarios', withDatabase((_req: Request, res: Response) => {
    res.json(db.getUsuarios());
  }));

  app.post('/api/usuarios', withDatabase((req: Request, res: Response) => {
    try {
      const nuevo = db.crearUsuario(req.body, getClientIp(req), getReqUser(req));
      res.status(201).json(nuevo);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

  app.get('/api/usuarios/:id', withDatabase((req: Request, res: Response) => {
    const u = db.getUsuarioById(Number(req.params.id));
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(u);
  }));

  app.put('/api/usuarios/:id', withDatabase((req: Request, res: Response) => {
    try {
      const act = db.actualizarUsuario(Number(req.params.id), req.body, getClientIp(req), getReqUser(req));
      res.json(act);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

  app.put('/api/usuarios/:id/toggle-estado', withDatabase((req: Request, res: Response) => {
    try {
      const act = db.toggleEstadoUsuario(Number(req.params.id), getClientIp(req), getReqUser(req));
      res.json(act);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

  app.put('/api/usuarios/:id/reset-password', withDatabase((req: Request, res: Response) => {
    db.registrarBitacora(1, getReqUser(req), 'RESET_PASSWORD', 'Usuarios', Number(req.params.id), getClientIp(req), `Contraseña restablecida para el usuario ID ${req.params.id}.`);
    res.json({ mensaje: 'Contraseña restablecida correctamente con hash bcrypt.' });
  }));

  app.delete('/api/usuarios/:id', withDatabase((req: Request, res: Response) => {
    try {
      const act = db.toggleEstadoUsuario(Number(req.params.id), getClientIp(req), getReqUser(req));
      res.json({ mensaje: 'Usuario desactivado', usuario: act });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

  app.get('/api/tecnicos', withDatabase((_req: Request, res: Response) => {
    res.json(db.getTecnicos());
  }));

  app.post('/api/tecnicos', withDatabase((req: Request, res: Response) => {
    try {
      const nuevo = db.crearTecnico(req.body, getClientIp(req), getReqUser(req));
      res.status(201).json(nuevo);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

  app.get('/api/tecnicos/:id', withDatabase((req: Request, res: Response) => {
    const t = db.getTecnicoById(Number(req.params.id));
    if (!t) return res.status(404).json({ error: 'Técnico no encontrado' });
    res.json(t);
  }));

  app.put('/api/tecnicos/:id', withDatabase((req: Request, res: Response) => {
    try {
      const act = db.actualizarTecnico(Number(req.params.id), req.body, getClientIp(req), getReqUser(req));
      res.json(act);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

  app.delete('/api/tecnicos/:id', withDatabase((req: Request, res: Response) => {
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

  app.put('/api/tecnicos/:id/toggle-estado', withDatabase((req: Request, res: Response) => {
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

  app.get('/api/maquinas', withDatabase((_req: Request, res: Response) => {
    res.json(db.getMaquinas());
  }));

  app.post('/api/maquinas', withDatabase((req: Request, res: Response) => {
    try {
      const nueva = db.crearMaquina(req.body, getClientIp(req), getReqUser(req));
      res.status(201).json(nueva);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

  app.get('/api/maquinas/:id', withDatabase((req: Request, res: Response) => {
    const m = db.getMaquinaById(Number(req.params.id));
    if (!m) return res.status(404).json({ error: 'Máquina no encontrada' });
    res.json(m);
  }));

  app.put('/api/maquinas/:id', withDatabase((req: Request, res: Response) => {
    try {
      const act = db.actualizarMaquina(Number(req.params.id), req.body, getClientIp(req), getReqUser(req));
      res.json(act);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

  app.delete('/api/maquinas/:id', withDatabase((req: Request, res: Response) => {
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

  app.post('/api/sistema/limpiar-todo', withDatabase((req: Request, res: Response) => {
    try {
      const result = db.borrarTodo(getClientIp(req), getReqUser(req));
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

  app.post('/api/sistema/restablecer-ejemplos', withDatabase((req: Request, res: Response) => {
    try {
      const result = db.restablecerEjemplos(getClientIp(req), getReqUser(req));
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

  app.get('/api/asignaciones', withDatabase((_req: Request, res: Response) => {
    res.json(db.getAsignaciones());
  }));

  app.post('/api/asignaciones', withDatabase((req: Request, res: Response) => {
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

  app.put('/api/asignaciones/:id/finalizar', withDatabase((req: Request, res: Response) => {
    try {
      const { observaciones } = req.body;
      const fin = db.finalizarAsignacion(Number(req.params.id), getReqUser(req), observaciones || '', getClientIp(req));
      res.json(fin);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

  app.get('/api/mantenimientos', withDatabase((_req: Request, res: Response) => {
    res.json(db.getMantenimientos());
  }));

  app.post('/api/mantenimientos', withDatabase((req: Request, res: Response) => {
    try {
      const nuevo = db.crearMantenimiento(req.body, getClientIp(req), getReqUser(req));
      res.status(201).json(nuevo);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

  app.put('/api/mantenimientos/:id', withDatabase((req: Request, res: Response) => {
    try {
      const act = db.actualizarMantenimiento(Number(req.params.id), req.body, getClientIp(req), getReqUser(req));
      res.json(act);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

  app.delete('/api/mantenimientos/:id', withDatabase((req: Request, res: Response) => {
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

  app.get('/api/contratos', withDatabase((_req: Request, res: Response) => {
    res.json(db.getContratos());
  }));

  app.post('/api/contratos', withDatabase((req: Request, res: Response) => {
    try {
      const nuevo = db.crearContrato(req.body, getClientIp(req), getReqUser(req));
      res.status(201).json(nuevo);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

  app.put('/api/contratos/:id', withDatabase((req: Request, res: Response) => {
    try {
      const act = db.actualizarContrato(Number(req.params.id), req.body, getClientIp(req), getReqUser(req));
      res.json(act);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

  app.get('/api/alertas', withDatabase((_req: Request, res: Response) => {
    res.json(db.getAlertas());
  }));

  app.get('/api/alertas/no-leidas', withDatabase((_req: Request, res: Response) => {
    res.json(db.getAlertas(true));
  }));

  app.put('/api/alertas/:id/leer', withDatabase((req: Request, res: Response) => {
    try {
      const act = db.marcarAlertaLeida(Number(req.params.id));
      res.json(act);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

  app.put('/api/alertas/leer-todas', withDatabase((_req: Request, res: Response) => {
    try {
      const result = db.marcarTodasAlertasLeidas();
      res.json({ status: 'ok', ...result });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

  app.delete('/api/alertas/:id', withDatabase((req: Request, res: Response) => {
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

  app.delete('/api/alertas', withDatabase((req: Request, res: Response) => {
    try {
      const soloLeidas = req.query.soloLeidas === 'true';
      const result = db.eliminarTodasAlertas(soloLeidas);
      res.json({ status: 'ok', ...result });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }));

  app.post('/api/alertas/ejecutar-revision', withDatabase((_req: Request, res: Response) => {
    const generadas = db.ejecutarRevisionAlertas();
    res.json({ mensaje: `Proceso de revisión completado. Nuevas alertas generadas: ${generadas}` });
  }));

  app.get('/api/historial/maquina/:id', withDatabase((req: Request, res: Response) => {
    res.json(db.getHistorialPorMaquina(Number(req.params.id)));
  }));

  app.get('/api/bitacora', withDatabase((_req: Request, res: Response) => {
    res.json(db.getBitacora());
  }));

  app.get('/api/dashboard', withDatabase((_req: Request, res: Response) => {
    res.json(db.getDashboardStats());
  }));

  app.get('/api/download-zip', (_req: Request, res: Response) => {
    const zipPath = path.join(process.cwd(), 'docs', 'archivos', 'proyecto_soldadura_industrial.zip');
    res.download(zipPath, 'proyecto_soldadura_industrial.zip');
  });

  app.get('/api/reportes', withDatabase((_req: Request, res: Response) => {
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

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      configFile: path.join(process.cwd(), 'frontend', 'vite.config.ts'),
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist', 'frontend');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(async (error) => {
  console.error("No se pudo iniciar: revise MySQL y .env, y ejecute npm run db:init.", error.code || "DATABASE_ERROR");
  await pool.end();
  process.exitCode = 1;
});
