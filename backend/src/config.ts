import { z } from 'zod';

// All environment configuration in one validated place. Fail fast on typos —
// a backend that silently falls back to localhost defaults in the cluster is
// how the old deployment ran against the wrong broker for weeks.
const envSchema = z.object({
  MQTT_URL: z.string().default('mqtt://mosquitto.infra.svc.cluster.local:1883'),
  PORT: z.coerce.number().int().default(3000),
  // Either DATABASE_URL or the discrete DB_* vars (legacy manifest shape).
  DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().int().default(5432),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string().default('hydroflow'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  // Sweep interval for time-based automation safety checks (fill timeout).
  AUTOMATION_TICK_MS: z.coerce.number().int().default(30_000),
  MQTT_UNHEALTHY_AFTER_MS: z.coerce.number().int().default(10 * 60 * 1000),
});

export const config = envSchema.parse(process.env);
