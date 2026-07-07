import { Router } from 'express';
import { z } from 'zod';
import { pool, latestReadings, telemetryHistory, recentActivities } from './db.js';
import { getMqttStatus } from './mqtt-bridge.js';
import { generateInsight } from './gemini.js';
import { config } from './config.js';

export const apiRouter = Router();

const startedAt = Date.now();

// Liveness: DB + MQTT. A backend that can't hear the broker is deaf to every
// sensor — sustained MQTT loss fails the probe so k8s restarts the pod
// (chickenFlow deaf-pod lesson).
apiRouter.get('/healthz', async (_req, res) => {
  let dbOk = true;
  try {
    await pool.query('SELECT 1');
  } catch {
    dbOk = false;
  }
  const mqtt = getMqttStatus();
  const disconnectedSince = mqtt.lastConnectedAt
    ? new Date(mqtt.lastConnectedAt).getTime()
    : startedAt;
  const mqttOk = mqtt.connected || Date.now() - disconnectedSince < config.MQTT_UNHEALTHY_AFTER_MS;
  const ok = dbOk && mqttOk;
  res.status(ok ? 200 : 503).json({ status: ok ? 'ok' : 'error', db: dbOk, mqtt });
});

// Readiness: DB reachable (kept for manifest back-compat).
apiRouter.get('/readyz', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ready', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'not ready', db: (err as Error).message });
  }
});

// Latest value per device/sensor — dashboard hydration.
apiRouter.get('/api/state', async (_req, res, next) => {
  try {
    res.json(await latestReadings());
  } catch (err) {
    next(err);
  }
});

const historyQuery = z.object({
  device: z.string().regex(/^[A-Za-z0-9_-]+$/),
  sensor: z.string().regex(/^[A-Za-z0-9_-]+$/),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
});

apiRouter.get('/api/telemetry', async (req, res, next) => {
  try {
    const q = historyQuery.safeParse(req.query);
    if (!q.success) {
      res.status(400).json({ error: 'BadRequest', issues: q.error.issues });
      return;
    }
    res.json(await telemetryHistory(q.data.device, q.data.sensor, q.data.limit));
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/api/activities', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query['limit'] ?? 50), 200);
    res.json(await recentActivities(limit));
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/api/ai/insight', async (_req, res, next) => {
  try {
    const result = await generateInsight();
    if (result.error) {
      res.status(503).json({ error: result.error });
      return;
    }
    res.json({ text: result.text });
  } catch (err) {
    next(err);
  }
});
