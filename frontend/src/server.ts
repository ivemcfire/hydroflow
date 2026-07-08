import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';
import {createProxyMiddleware} from 'http-proxy-middleware';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Same-origin reverse proxy to the backend: the dashboard calls relative
// /api + /ws (see state.ts), so one LB IP serves everything and the browser
// never needs a cross-origin base URL. BACKEND_URL is the in-cluster Service.
const BACKEND_URL =
  process.env['BACKEND_URL'] ??
  'http://hydroflow-backend.hydroflow.svc.cluster.local:3000';

const apiProxy = createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
});
const wsProxy = createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  ws: true,
});
app.use('/api', apiProxy);
app.use('/healthz', apiProxy);
app.use('/ws', wsProxy);

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  const server = app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
  // WebSocket upgrade for the /ws proxy — express routing never sees
  // upgrade requests, they must be wired on the HTTP server itself.
  server.on('upgrade', wsProxy.upgrade);
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
