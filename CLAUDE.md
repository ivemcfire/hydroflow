# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

**HydroFlow** — homelab irrigation IoT: ESP32-S2 Mini tank sensors publish MQTT,
a TypeScript backend ingests telemetry into Postgres and runs the refill
automation, an Angular dashboard shows live state. Runs on the k3s homelab
cluster (ns `hydroflow`; backend LB `192.168.100.208:3000`, frontend LB
`192.168.100.214`).

**This repo is PUBLIC on GitHub.** No credentials, keys, or tokens — ever.
Cluster secrets are documented as stubs in
`homelab-config/apps/hydroflow-backend/secrets-stub.yaml`.

**Git remotes:** `github` is the writable remote; the gitea `origin` is a
read-only mirror (pushes 403). Branch `antigravity` (+ `prod`) preserves an
unrelated React/SQLite prototype that once occupied `main` — do not merge or
"fix" it; it is a museum piece.

## Architecture

- Device → broker: topics `hydroflow/<deviceId>/<sensorType>`, payload
  `"ON"`/`"OFF"` or a number string. Broker: ns `infra`, LB
  `192.168.100.207` (ESP32s hardcode it). Contract: `docs/mqtt-topics.md` —
  change only in lock-step with firmware and `backend/src/topic.ts`.
- Backend → actuators: `hydroflow/cmd/<actuator>` (QoS 1, JSON). No actuator
  hardware exists yet; the pump/valve the refill chain commands are planned.
- The refill automation is a pure state machine
  (`backend/src/refill-logic.ts`, vitest-covered): `level_low` ON starts a
  refill (inlet valve + pump ON), `level_high` ON stops it, and a clock sweep
  enforces the 20-min fill timeout even with zero sensor traffic.
- The frontend decides nothing: `state.ts` hydrates from REST, listens on
  `/ws` (backoff reconnect + re-hydrate), renders honestly (the tank card
  shows float-switch bands, not an invented percentage).
- In-cluster MQTT uses the `mosquitto.infra` DNS name — never the LB IP
  (hair-pins and RSTs on some nodes; see manifest comments).

## Key files

| File | Role |
|---|---|
| `backend/src/refill-logic.ts` + spec | Pure automation core — start here for behavior changes |
| `backend/src/topic.ts` + spec | Topic parsing/validation (rejects malformed segments, never ingests `cmd/`) |
| `backend/src/mqtt-bridge.ts` | Broker client (self-recreates on stuck reconnect), command publishing |
| `backend/src/routes.ts` | `/healthz` (DB + MQTT liveness, 503 when deaf >10 min), `/api/state`, `/api/telemetry`, `/api/activities`, `/api/ai/insight` |
| `backend/src/gemini.ts` | Server-side Gemini insight (`GEMINI_API_KEY` optional, degrades gracefully) |
| `frontend/src/app/state.ts` | The dashboard store (REST + WS mirror) |
| `firmware/tank-a-s2-mini/` | tank_A sensor firmware (PlatformIO, native USB CDC flags matter) |

## Commands

Backend (`backend/`): `npm run dev | build | test | lint`
Frontend (`frontend/`): `npm run dev | build | test | lint` (dev proxies `/api`+`/ws` to :3000)

## Deployment

CI (`.github/workflows/build.yml`): lint+test+build gates, then multi-arch
(amd64+arm64) images → `ghcr.io/ivemcfire/hydroflow-{backend,frontend}`,
sha-pinned tags only. **Manifests live exclusively in
`homelab-config/apps/hydroflow-backend|frontend/`** — this repo deploys
nothing. Release = bump the sha pin there, `kubectl apply`. See
`homelab-config/apps/hydroflow-backend/MIGRATION-wp3.md`.

## Rules

- zod on every inbound boundary; no unchecked casts.
- Migrations/DDL stay additive — the `telemetry` table holds real sensor data.
- Gates before merge: backend and frontend `lint && test && build` green
  (CI enforces this before any image exists).
