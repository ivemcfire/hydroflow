// Real backend contracts only (backend/src/routes.ts, ws.ts, db.ts). Nothing
// in this file describes hardware or features the backend does not expose.

/** Row shape returned by GET /api/state and GET /api/telemetry. */
export interface LatestReading {
  device_id: string;
  sensor_type: string;
  value: number | null;
  timestamp: string;
}

/** Row shape returned by GET /api/activities (automation log). */
export interface ActivityRow {
  id: number;
  timestamp: string;
  chain_name: string;
  action: string;
  trigger: string;
}

/** Payload of a 'system:alert' WS event. */
export type AlertSeverity = 'info' | 'critical';

export interface BackendAlertPayload {
  severity: AlertSeverity;
  text: string;
}

/** Client-side view model for an alert (adds id/read for display; the
 * backend does not persist alerts, so this list only holds what arrived
 * over the WS connection since the page loaded). */
export interface AppAlert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  text: string;
  read: boolean;
}

/** Payload of a 'sensor:reading' WS event. */
export interface SensorReadingPayload {
  deviceId: string;
  sensorType: string;
  raw: string;
  value: number | null;
}

/** A device known only because it has appeared in /api/state — never invented. */
export interface DeviceSummary {
  deviceId: string;
  sensors: LatestReading[];
}

/** Status of a single sensor/actuator row shown in the device detail panel.
 * `planned` rows describe hardware that is documented as future work
 * (CONTEXT.md / backend comments) but does not exist yet — they are never
 * toggleable. */
export interface DeviceStatusRow {
  id: string;
  name: string;
  kind: 'sensor' | 'actuator';
  state: 'on' | 'off' | 'unknown';
  planned: boolean;
}

export type WsConnectionState = 'connecting' | 'open' | 'closed';
