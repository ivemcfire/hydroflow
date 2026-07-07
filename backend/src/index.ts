import express from 'express';
import { createServer } from 'node:http';
import { config } from './config.js';
import { initDb, insertTelemetry, logActivity } from './db.js';
import { startMqttBridge, publishActuatorCommand } from './mqtt-bridge.js';
import { apiRouter } from './routes.js';
import { attachWs, broadcast } from './ws.js';
import { onLevelLow, onLevelHigh, onTick, type TankStates, type RefillDecision } from './refill-logic.js';

const app = express();
app.use(express.json());
app.use(apiRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API] error:', err.message);
  res.status(500).json({ error: 'InternalServerError' });
});

const tankStates: TankStates = new Map();

function execute(decision: RefillDecision): void {
  for (const cmd of decision.commands) publishActuatorCommand(cmd);
  for (const a of decision.activities) {
    void logActivity(a.chain, a.action, a.trigger).catch((err: Error) =>
      console.error('[DB] activity log failed:', err.message),
    );
  }
  for (const alert of decision.alerts) {
    console.log(`[${alert.severity === 'critical' ? 'CRITICAL' : 'INFO'}] ${alert.text}`);
    broadcast('system:alert', alert);
  }
}

await initDb();

startMqttBridge((reading) => {
  if (!reading) return;
  void insertTelemetry(reading.deviceId, reading.sensorType, reading.value).catch((err: Error) =>
    console.error('[DB] telemetry insert failed:', err.message),
  );
  broadcast('sensor:reading', reading);

  const now = Date.now();
  if (reading.sensorType === 'level_low' && reading.raw === 'ON') {
    execute(onLevelLow(tankStates, reading.deviceId, now));
  } else if (reading.sensorType === 'level_high' && reading.raw === 'ON') {
    execute(onLevelHigh(tankStates, reading.deviceId, now));
  }
});

// Time-based safety sweep — fill timeout fires even with zero sensor traffic.
setInterval(() => execute(onTick(tankStates, Date.now())), config.AUTOMATION_TICK_MS);

const httpServer = createServer(app);
attachWs(httpServer);
httpServer.listen(config.PORT, () => {
  console.log(`[SERVER] HydroFlow backend on :${config.PORT}`);
});

const shutdown = (signal: string): void => {
  console.log(`[shutdown] ${signal}`);
  httpServer.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
