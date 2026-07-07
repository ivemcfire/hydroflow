import mqtt, { type MqttClient } from 'mqtt';
import { config } from './config.js';
import { parseSensorTopic } from './topic.js';
import type { ActuatorCommand } from './refill-logic.js';

// Same failure mode as chickenFlow (2026-07-04): mqtt.js can wedge in a
// reconnect loop against a stale resolved address. After a sustained streak
// of failed reconnects, rebuild the client to force DNS re-resolution.
const RECREATE_AFTER_CLOSES = 12;
const RECREATE_DELAY_MS = 5_000;

let client: MqttClient | null = null;
let closesSinceConnect = 0;
let lastConnectedAt: Date | null = null;
let lastError: string | null = null;

export interface MqttStatus {
  connected: boolean;
  lastConnectedAt: string | null;
  lastError: string | null;
}

export function getMqttStatus(): MqttStatus {
  return {
    connected: client?.connected ?? false,
    lastConnectedAt: lastConnectedAt?.toISOString() ?? null,
    lastError,
  };
}

export type ReadingHandler = (reading: ReturnType<typeof parseSensorTopic>) => void;

export function startMqttBridge(onReading: ReadingHandler): void {
  if (client) return;

  console.log(`[MQTT] connecting to ${config.MQTT_URL}`);
  client = mqtt.connect(config.MQTT_URL, {
    clientId: `hydroflow-backend-${Math.random().toString(16).slice(2, 8)}`,
    keepalive: 30,
    reconnectPeriod: 5000,
    connectTimeout: 10_000,
  });

  client.on('connect', () => {
    console.log('[MQTT] connected');
    closesSinceConnect = 0;
    lastConnectedAt = new Date();
    lastError = null;
    client?.subscribe('hydroflow/#', { qos: 1 }, (err) => {
      if (err) console.error('[MQTT] subscribe failed:', err.message);
      else console.log('[MQTT] subscribed to hydroflow/#');
    });
  });

  client.on('error', (err) => {
    lastError = err.message;
    console.error('[MQTT] error:', err.message);
  });

  client.on('close', () => {
    closesSinceConnect += 1;
    if (closesSinceConnect >= RECREATE_AFTER_CLOSES) {
      console.warn('[MQTT] reconnect loop stuck — recreating client');
      const stuck = client;
      client = null;
      closesSinceConnect = 0;
      stuck?.end(true);
      setTimeout(() => startMqttBridge(onReading), RECREATE_DELAY_MS);
    }
  });

  client.on('message', (topic, buf) => {
    const reading = parseSensorTopic(topic, buf.toString());
    if (!reading) {
      // Own publishes on hydroflow/cmd/* land here too — expected, silent.
      if (!topic.startsWith('hydroflow/cmd/')) {
        console.warn(`[MQTT] ignoring unrecognized topic ${topic}`);
      }
      return;
    }
    onReading(reading);
  });
}

// Actuator commands: hydroflow/cmd/<actuator>, JSON payload. No actuator
// firmware subscribes yet (valve/pump hardware is future) — but publishing
// for real replaces the old console.log mocks, so new firmware only needs to
// subscribe. QoS 1: a dropped OFF command must not silently leave a pump on.
export function publishActuatorCommand(cmd: ActuatorCommand): boolean {
  if (!client || !client.connected) {
    console.warn(`[MQTT] cannot publish ${cmd.actuator} ${cmd.state} — not connected`);
    return false;
  }
  client.publish(
    `hydroflow/cmd/${cmd.actuator}`,
    JSON.stringify({ state: cmd.state, reason: cmd.reason, ts: new Date().toISOString() }),
    { qos: 1 },
    (err) => {
      if (err) console.error('[MQTT] command publish failed:', err.message);
    },
  );
  return true;
}
