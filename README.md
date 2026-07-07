# HydroFlow

Intelligent homelab irrigation: ESP32-S2 Mini tank sensors publish water
levels over MQTT; a TypeScript backend records telemetry, runs the refill
automation, and serves a live Angular dashboard. Runs on a k3s cluster.

## Structure

| Path | What |
|---|---|
| `firmware/tank-a-s2-mini/` | ESP32-S2 Mini sensor firmware (PlatformIO) |
| `backend/` | Node.js/TypeScript: MQTT ingest → Postgres, refill state machine, REST + WebSocket API, Gemini insight |
| `frontend/` | Angular dashboard (SSR) — live mirror of backend state |
| `docs/mqtt-topics.md` | The firmware ↔ backend MQTT contract |

Kubernetes manifests live in the separate `homelab-config` repo
(`apps/hydroflow-backend/`, `apps/hydroflow-frontend/`) — not here.

## Data flow

1. Float switch flips → firmware publishes `hydroflow/tank_A/level_low` (`ON`/`OFF`).
2. Backend validates, stores in Postgres, broadcasts on `/ws`.
3. `level_low` ON starts the refill chain: `hydroflow/cmd/Valve_tank_A_Inlet`
   + `hydroflow/cmd/Pump_Main` ON (QoS 1); `level_high` ON — or a 20-minute
   timeout — stops it.
4. Dashboard shows live tank state, automation activity, and an optional
   Gemini one-liner.

## Development

```bash
cd backend  && npm install && npm run dev    # API on :3000
cd frontend && npm install && npm run dev    # dashboard, proxies /api + /ws
```

Gates (CI enforces before building images): `npm run lint && npm test && npm run build` in both.

## Releases

Push to `main` → GitHub Actions runs the gates, then builds multi-arch
(amd64 + arm64) images to `ghcr.io/ivemcfire/hydroflow-{backend,frontend}`
with sha-pinned tags. Deploy = bump the pin in homelab-config and
`kubectl apply`.

## Status

- [x] tank_A level_low sensor live end to end
- [x] Refill automation (tested state machine; commands published for real)
- [x] Dashboard on real data
- [ ] level_high probe + valve/pump actuator hardware
- [ ] Camera/level fusion, more tanks

*(Historical note: branch `antigravity` holds an unrelated React/SQLite
prototype that predates this line — kept for reference, not maintained.)*
