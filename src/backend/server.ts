// File: src/backend/server.ts
import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const APP_COLOR = process.env.APP_COLOR || 'blue';

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// System Status endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', color: APP_COLOR });
});

// Health/readiness probes
app.get('/healthz', (req, res) => res.json({ status: 'ok' }));
app.get('/readyz', (req, res) => res.json({ status: 'ok' }));

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const frontendPath = path.join(__dirname, '../../dist/frontend');
    app.use(express.static(frontendPath));
    app.use((req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = require('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware enabled');
  }

  app.listen(PORT, () => {
    console.log(`[${APP_COLOR.toUpperCase()}] Backend server running on port ${PORT}`);
  });
}

startServer();
