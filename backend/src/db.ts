import pg from 'pg';
import { config } from './config.js';

// Existing table shapes are kept (real telemetry data may exist) — changes
// here must stay additive (CREATE/INDEX IF NOT EXISTS only).
export const pool = new pg.Pool(
  config.DATABASE_URL
    ? { connectionString: config.DATABASE_URL, max: 10 }
    : {
        host: config.DB_HOST,
        port: config.DB_PORT,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        database: config.DB_NAME,
        max: 10,
      },
);

export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS telemetry (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      device_id VARCHAR(50),
      sensor_type VARCHAR(50),
      value REAL
    );
    CREATE INDEX IF NOT EXISTS telemetry_device_sensor_ts_idx
      ON telemetry (device_id, sensor_type, timestamp DESC);
    CREATE TABLE IF NOT EXISTS activities (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      chain_name VARCHAR(100),
      action VARCHAR(255),
      trigger VARCHAR(255)
    );
    CREATE INDEX IF NOT EXISTS activities_ts_idx ON activities (timestamp DESC);
  `);
  console.log('[DB] Tables ready');
}

export async function insertTelemetry(deviceId: string, sensorType: string, value: number | null): Promise<void> {
  await pool.query(
    'INSERT INTO telemetry (device_id, sensor_type, value) VALUES ($1, $2, $3)',
    [deviceId, sensorType, value],
  );
}

export async function logActivity(chain: string, action: string, trigger: string): Promise<void> {
  await pool.query(
    'INSERT INTO activities (chain_name, action, trigger) VALUES ($1, $2, $3)',
    [chain, action, trigger],
  );
}

export interface LatestReading {
  device_id: string;
  sensor_type: string;
  value: number | null;
  timestamp: string;
}

export async function latestReadings(): Promise<LatestReading[]> {
  const { rows } = await pool.query<LatestReading>(`
    SELECT DISTINCT ON (device_id, sensor_type)
      device_id, sensor_type, value, timestamp
    FROM telemetry
    ORDER BY device_id, sensor_type, timestamp DESC
  `);
  return rows;
}

export async function telemetryHistory(
  deviceId: string,
  sensorType: string,
  limit: number,
): Promise<LatestReading[]> {
  const { rows } = await pool.query<LatestReading>(
    `SELECT device_id, sensor_type, value, timestamp FROM telemetry
     WHERE device_id = $1 AND sensor_type = $2
     ORDER BY timestamp DESC LIMIT $3`,
    [deviceId, sensorType, limit],
  );
  return rows;
}

export async function recentActivities(limit: number): Promise<unknown[]> {
  const { rows } = await pool.query(
    'SELECT * FROM activities ORDER BY timestamp DESC LIMIT $1',
    [limit],
  );
  return rows;
}
