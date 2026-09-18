import rutas from './modulos/index.js';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { checkDatabase, pool } from './database/conexion.js';

async function startServer() {
  const app = express();
  await checkDatabase();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());
  app.use(rutas);

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
