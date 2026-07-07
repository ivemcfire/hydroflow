import { z } from 'zod';

// Topic convention: hydroflow/<deviceId>/<sensorType>
// e.g. hydroflow/tank_A/level_low  payload "ON" | "OFF" | a number string.
// Pure parsing — unit-tested, no I/O.

export interface SensorReading {
  deviceId: string;
  sensorType: string;
  raw: string;
  // Normalized numeric value: ON=1, OFF=0, numeric strings parsed; null if
  // the payload is neither (stored raw for forensics, not charted).
  value: number | null;
}

const segment = z.string().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/);

export function parseSensorTopic(topic: string, raw: string): SensorReading | null {
  const parts = topic.split('/');
  if (parts.length !== 3 || parts[0] !== 'hydroflow') return null;
  const deviceId = segment.safeParse(parts[1]);
  const sensorType = segment.safeParse(parts[2]);
  if (!deviceId.success || !sensorType.success) return null;
  // Command topics are outbound (backend → actuators) — never ingest them.
  if (deviceId.data === 'cmd') return null;

  return {
    deviceId: deviceId.data,
    sensorType: sensorType.data,
    raw,
    value: normalizeValue(raw),
  };
}

export function normalizeValue(raw: string): number | null {
  if (raw === 'ON') return 1;
  if (raw === 'OFF') return 0;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}
