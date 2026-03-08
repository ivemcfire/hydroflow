'use strict';

const mqtt    = require('mqtt');
const { Pool } = require('pg');
const express  = require('express');

// ---------------------------------------------------------------------------
// Config — injected via K8s env vars / secrets
// ---------------------------------------------------------------------------
const MQTT_URL     = process.env.MQTT_URL     || 'mqtt://localhost:1883';
const DATABASE_URL = process.env.DATABASE_URL;
const PORT         = process.env.PORT         || 3000;

if (!DATABASE_URL) {
  console.error('[FATAL] DATABASE_URL is not set');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// PostgreSQL connection pool
// ---------------------------------------------------------------------------
const db = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

async function initDB() {
  const client = await db.connect();
  try {
    // Verify connection
    const { rows } = await client.query('SELECT NOW() AS server_time');
    console.log(`[DB]   Connected — server time: ${rows[0].server_time}`);

    // Create sensor_readings table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS sensor_readings (
        id          BIGSERIAL PRIMARY KEY,
        sensor_id   TEXT        NOT NULL,
        topic       TEXT        NOT NULL,
        payload     JSONB       NOT NULL,
        received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_id
        ON sensor_readings (sensor_id, received_at DESC);
    `);
    console.log('[DB]   Table sensor_readings ready');
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// MQTT client
// ---------------------------------------------------------------------------
function initMQTT() {
  const client = mqtt.connect(MQTT_URL, {
    clientId:      `hydroflow-backend-${process.pid}`,
    reconnectPeriod: 3000,
    connectTimeout:  10000,
  });

  client.on('connect', () => {
    console.log(`[MQTT] Connected to ${MQTT_URL}`);
    // Subscribe to all HydroFlow sensor topics
    client.subscribe('hydroflow/#', { qos: 1 }, (err) => {
      if (err) {
        console.error('[MQTT] Subscribe error:', err.message);
      } else {
        console.log('[MQTT] Subscribed to hydroflow/#');
      }
    });
  });

  client.on('message', async (topic, message) => {
    const raw = message.toString();
    console.log(`[MQTT] ${topic} → ${raw}`);

    // Parse sensor_id from topic: hydroflow/<sensor_id>/...
    const parts    = topic.split('/');
    const sensorId = parts[1] ?? 'unknown';

    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      // Wrap plain text values in a JSON object
      payload = { value: raw };
    }

    try {
      await db.query(
        `INSERT INTO sensor_readings (sensor_id, topic, payload)
         VALUES ($1, $2, $3)`,
        [sensorId, topic, payload]
      );
    } catch (err) {
      console.error('[DB]   Insert failed:', err.message);
    }
  });

  client.on('reconnect', () => console.log('[MQTT] Reconnecting…'));
  client.on('offline',   () => console.log('[MQTT] Offline'));
  client.on('error',     (err) => console.error('[MQTT] Error:', err.message));

  return client;
}

// ---------------------------------------------------------------------------
// Express — health & readiness endpoints (used by K8s probes)
// ---------------------------------------------------------------------------
const app = express();
app.use(express.json());

// Liveness: process is alive
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

// Readiness: DB reachable
app.get('/readyz', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ready', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'not ready', db: err.message });
  }
});

// Latest readings per sensor (simple diagnostic endpoint)
app.get('/api/readings', async (_req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT DISTINCT ON (sensor_id)
        sensor_id, topic, payload, received_at
      FROM sensor_readings
      ORDER BY sensor_id, received_at DESC
      LIMIT 50
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Boot sequence
// ---------------------------------------------------------------------------
(async () => {
  console.log('=== HydroFlow Backend starting ===');
  console.log(`[MQTT] Target: ${MQTT_URL}`);
  try {
    const parsed = new URL(DATABASE_URL);
    parsed.password = '***';
    console.log(`[DB]   Target: ${parsed.toString()}`);
  } catch {
    console.log('[DB]   Target: [unparseable url]');
  }

  try {
    await initDB();
  } catch (err) {
    console.error('[FATAL] DB init failed:', err.message);
    process.exit(1);
  }

  initMQTT();

  app.listen(PORT, () => {
    console.log(`[HTTP] Listening on :${PORT}  (health: /healthz  readiness: /readyz)`);
  });
})();

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------
process.on('SIGTERM', async () => {
  console.log('[SHUTDOWN] SIGTERM received — draining connections…');
  await db.end();
  process.exit(0);
});
