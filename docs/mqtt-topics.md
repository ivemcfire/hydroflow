# HydroFlow MQTT contract

Single source of truth for the firmware ↔ backend topic contract. Any change
lands in firmware, `backend/src/topic.ts`, and this file in the same commit.

**Broker**: `mosquitto` in the `infra` namespace.
- LAN (ESP32): `mqtt://192.168.100.207:1883` (hardcoded in firmware)
- Cluster-internal (backend): `mqtt://mosquitto.infra.svc.cluster.local:1883`
  (never the LB IP from inside the cluster — hair-pin RST)

## Sensor topics (device → backend)

```
hydroflow/<deviceId>/<sensorType>
```

- Segments: `[A-Za-z0-9_-]{1,64}`. Exactly 3 levels. Anything else is dropped.
- Payload: `"ON"` | `"OFF"` | a number string (e.g. `"23.5"`).
  Backend normalizes ON→1, OFF→0 for storage; unparseable payloads store NULL.
- Known sensors today:

| Topic | Meaning |
|---|---|
| `hydroflow/tank_A/level_low` | Float switch: ON = water below the low probe (500 ms debounce on-device) |
| `hydroflow/tank_A/level_high` | Planned: ON = water at the high probe |

Backend actions: insert into `telemetry`, broadcast `sensor:reading` on
`/ws`; `level_low` ON triggers the refill chain, `level_high` ON stops it.

## Command topics (backend → actuators)

```
hydroflow/cmd/<actuator>        QoS 1, not retained
```

Payload:
```json
{ "state": "ON", "reason": "tank_A level_low", "ts": "2026-07-07T12:00:00Z" }
```

Actuators the refill chain commands (no hardware yet — future firmware
subscribes here): `Valve_<tankId>_Inlet`, `Pump_Main`.

QoS 1 because a dropped OFF command must not silently leave a pump running.
The backend never ingests `hydroflow/cmd/*` (guarded in the topic parser).
