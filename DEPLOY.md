# HydroFlow — Deployment Reference

Last updated: Claude (Sonnet 4.6) — 2026-03-12

---

## Overview

Three-service backend stack deployed to a k3s homelab cluster (multi-arch: amd64 control-plane + arm64 phone workers).

```
Express backend (one6t :3000)
  └─→ Fastify/Antigravity (one61 :3001)
        └─→ PostgreSQL (one62 :5432)

Express → Gemini 2.5 Flash (external API) for AI insights
ESP32 sensors → Mosquitto (one6t :1883) → backend
```

---

## 1. Image Registry

| Registry | URL | Auth |
|----------|-----|------|
| Gitea (self-hosted) | `http://192.168.100.206` | k8s secret `gitea-registry` in `hydroflow` ns |

**⚠ HTTP only** — Gitea does not have TLS. Docker daemon on k3master must have:
```json
{ "insecure-registries": ["192.168.100.206"] }
```

**Image naming convention:**
```
192.168.100.206/ivemcfire/<service>:<tag>
```

| Service | Image |
|---------|-------|
| Express backend | `192.168.100.206/ivemcfire/hydroflow-backend:latest` |
| Fastify/Antigravity | `192.168.100.206/ivemcfire/hydroflow-antigravity:latest` |

---

## 2. Multi-Arch Build Process

All images must target `linux/amd64` + `linux/arm64` because:
- k3master (control plane) = amd64
- Phone workers (one61, one62, one6t) = arm64 / musl libc

**Use `node:20-alpine` base images only.** Never use Debian-based node images on phone workers.

Docker is not available in the dev container. All builds run via SSH on k3master.

### Step-by-step build pipeline

```bash
# 1. Package source (from dev container)
tar --exclude='node_modules' --exclude='dist' --exclude='.git' \
    -czf /tmp/<service>.tar.gz <files...>

# 2. Transfer to k3master
scp /tmp/<service>.tar.gz user@192.168.100.52:~/<service>.tar.gz
ssh user@192.168.100.52 "mkdir -p ~/hydroflow-builds/<service> && \
  tar -xzf ~/<service>.tar.gz -C ~/hydroflow-builds/<service>"

# 3. Build per-arch (on k3master, inside ~/hydroflow-builds/<service>/)
docker build --platform linux/amd64 -f Dockerfile \
  -t 192.168.100.206/ivemcfire/<service>:amd64 .

docker build --platform linux/arm64 -f Dockerfile \
  -t 192.168.100.206/ivemcfire/<service>:arm64 .

# 4. Push arch-specific tags
docker push 192.168.100.206/ivemcfire/<service>:amd64
docker push 192.168.100.206/ivemcfire/<service>:arm64

# 5. Create multi-arch manifest (uses buildkit — respects insecure registry config)
docker buildx imagetools create \
  --tag 192.168.100.206/ivemcfire/<service>:latest \
  192.168.100.206/ivemcfire/<service>:amd64 \
  192.168.100.206/ivemcfire/<service>:arm64
```

> **Why not `docker buildx build --push` directly?**
> buildkit containers do not inherit Docker daemon's `insecure-registries`. Pushing multi-arch in one step tries HTTPS and fails with `no route to host :443`. The per-arch build → push → `imagetools create` workaround uses the daemon for push (which has insecure config) and buildkit only for manifest assembly.

---

## 3. Services

### 3.1 Express Backend (`hydroflow-backend`)

| Property | Value |
|----------|-------|
| Source | `src/backend/` (monorepo root) |
| Dockerfile | `Dockerfile.backend` (repo root) |
| Build output | `dist/backend/server.js` (via `tsc --project tsconfig.server.json`) |
| Port | 3000 |
| Node | one6t (arm64 — preferred by affinity) |
| k8s manifest | `~/hydroflow/INFRA/k8s/backend.yaml` on k3master |
| Image | `192.168.100.206/ivemcfire/hydroflow-backend:latest` |

**Environment variables (set in deployment):**

| Variable | Source | Value |
|----------|--------|-------|
| `PORT` | literal | `3000` |
| `NODE_ENV` | literal | `production` |
| `MQTT_URL` | literal | `mqtt://192.168.100.207:1883` |
| `DB_HOST` | literal | `postgres.hydroflow.svc.cluster.local` |
| `DB_PORT` | literal | `5432` |
| `DB_NAME` | `postgres-secret` | `POSTGRES_DB` |
| `DB_USER` | `postgres-secret` | `POSTGRES_USER` |
| `DB_PASSWORD` | `postgres-secret` | `POSTGRES_PASSWORD` |
| `FASTIFY_URL` | literal | `http://hydroflow-antigravity.hydroflow.svc.cluster.local:3001` |
| `GEMINI_API_KEY` | `gemini-secret` | `GEMINI_API_KEY` |
| `APP_COLOR` | literal | `blue` (or `green` for test) |

**Health probes:**
- Liveness: `GET /healthz` — port 3000, initial 15s, period 20s
- Readiness: `GET /readyz` — port 3000, initial 10s, period 10s

**Key API routes:**
```
GET  /healthz             — liveness probe
GET  /readyz              — readiness probe
GET  /api/status          — {"status":"ok","color":"blue"}
GET  /api/ai/insights     — calls Fastify /api/context + Gemini 2.5 Flash
GET  /api/pumps           — pump states
POST /api/pumps/:id/toggle — toggle pump
POST /api/login           — auth
POST /api/register        — create user
```

**Build + deploy:**
```bash
# Compile TypeScript (from repo root, dev container)
rm -f tsconfig.server.tsbuildinfo
node_modules/.bin/tsc --project tsconfig.server.json

# Package, transfer, build, push (see §2)
# Files to include: package.json, package-lock.json, tsconfig*.json,
#                   src/backend/, Dockerfile.backend

# Redeploy
kubectl rollout restart deployment/hydroflow-backend -n hydroflow
kubectl rollout status  deployment/hydroflow-backend -n hydroflow
```

---

### 3.2 Fastify / Antigravity (`hydroflow-antigravity`)

| Property | Value |
|----------|-------|
| Source | `src/backend/antigravity/` |
| Dockerfile | `src/backend/antigravity/Dockerfile` |
| Build output | compiled via `tsc` inside Docker (multi-stage) |
| Port | 3001 |
| Node | one61 (arm64 — preferred by affinity, excluded from one62/postgres) |
| k8s manifest | `src/backend/antigravity/k8s/antigravity.yaml` |
| Image | `192.168.100.206/ivemcfire/hydroflow-antigravity:latest` |

**Environment variables:**

| Variable | Source | Value |
|----------|--------|-------|
| `FASTIFY_PORT` | literal | `3001` |
| `POSTGRES_USER` | `postgres-secret` | `POSTGRES_USER` |
| `POSTGRES_PASSWORD` | `postgres-secret` | `POSTGRES_PASSWORD` |
| `POSTGRES_DB` | `postgres-secret` | `POSTGRES_DB` |
| `DATABASE_URL` | k8s `$(VAR)` substitution | `postgres://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@postgres.hydroflow.svc.cluster.local:5432/$(POSTGRES_DB)` |

**Health probes:**
- Liveness: `GET /health` — port 3001, initial 20s, period 20s, failureThreshold 3
- Readiness: `GET /health` — port 3001, initial 15s, period 10s, failureThreshold 5

**Key API routes:**
```
GET  /health          — {"status":"ok","db":"connected"}
POST /api/users/register
POST /api/users/login
GET  /api/sensors
GET  /api/flowlogs
GET  /api/alerts
GET  /api/context     — {sensors, flowLogs, alerts, timestamp} (used by AI proxy)
```

**Build + deploy:**
```bash
# Package, transfer, build, push (see §2)
# Context: src/backend/antigravity/
# Files to include: all (node_modules excluded by .dockerignore or --exclude)

# Redeploy
kubectl rollout restart deployment/hydroflow-antigravity -n hydroflow
kubectl rollout status  deployment/hydroflow-antigravity -n hydroflow
```

---

### 3.3 PostgreSQL (`postgres`)

| Property | Value |
|----------|-------|
| Image | `postgres:15-alpine` (from infrastructure.yaml) |
| Port | 5432 |
| Node | one62 (PVC-pinned via local-path, do NOT reschedule) |
| PVC | `postgres-pvc` — 5Gi, `local-path` StorageClass |
| Secret | `postgres-secret` (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`) |

**Database schema (as of 2026-03-12):**

Express tables (pre-existing):
- `activities`, `sensor_readings`, `telemetry`

Fastify tables (created 2026-03-12 via `kubectl exec`):
```sql
CREATE TABLE IF NOT EXISTS Users (
  id SERIAL PRIMARY KEY, username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, role TEXT DEFAULT 'view_only');

CREATE TABLE IF NOT EXISTS Sensors (
  id SERIAL PRIMARY KEY, name TEXT, type TEXT, location TEXT,
  value REAL, unit TEXT, status TEXT, last_updated TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS FlowLogs (
  id SERIAL PRIMARY KEY, sensor_id INT, flow_rate REAL, volume REAL,
  logged_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS SystemAlerts (
  id SERIAL PRIMARY KEY, severity TEXT, message TEXT, resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now());
```

**Access:**
```bash
kubectl exec -n hydroflow deployment/postgres -- \
  psql -U hydroflow_user -d hydroflow
```

---

### 3.4 Mosquitto (`mosquitto`)

| Property | Value |
|----------|-------|
| Port | 1883 (LoadBalancer 192.168.100.207) |
| Node | one6t |
| PVC | `mosquitto-pvc` — 1Gi, `local-path` |
| Auth | `allow_anonymous: true` (LAN-only, acceptable) |

---

## 4. Kubernetes Secrets

```bash
# postgres-secret (DB credentials)
kubectl get secret postgres-secret -n hydroflow

# gitea-registry (image pull secret)
kubectl get secret gitea-registry -n hydroflow

# gemini-secret (Gemini AI API key)
kubectl get secret gemini-secret -n hydroflow
```

**Create / rotate gemini-secret:**
```bash
kubectl create secret generic gemini-secret -n hydroflow \
  --from-literal=GEMINI_API_KEY='<key>' \
  --dry-run=client -o yaml | kubectl apply -f -
kubectl rollout restart deployment/hydroflow-backend -n hydroflow
```

**Create / rotate postgres-secret:**
```bash
kubectl create secret generic postgres-secret -n hydroflow \
  --from-literal=POSTGRES_DB=hydroflow \
  --from-literal=POSTGRES_USER=hydroflow_user \
  --from-literal=POSTGRES_PASSWORD='<new-password>' \
  --dry-run=client -o yaml | kubectl apply -f -
kubectl rollout restart deployment/hydroflow-backend -n hydroflow
kubectl rollout restart deployment/hydroflow-antigravity -n hydroflow
kubectl rollout restart deployment/postgres -n hydroflow
```

**Create gitea-registry pull secret:**
```bash
kubectl create secret docker-registry gitea-registry -n hydroflow \
  --docker-server=192.168.100.206 \
  --docker-username=ivemcfire \
  --docker-password='<gitea-password>'
```

---

## 5. Node Affinity Rules

All application pods use `nodeAffinity` to exclude the control plane:
```yaml
requiredDuringSchedulingIgnoredDuringExecution:
  nodeSelectorTerms:
    - matchExpressions:
        - key: node-role.kubernetes.io/control-plane
          operator: DoesNotExist
```

Additional preferences:

| Service | Preferred Node | Anti-affinity |
|---------|---------------|---------------|
| hydroflow-backend | one6t (weight 80) | away from postgres (weight 80) |
| hydroflow-antigravity | one61 (weight 80) | away from postgres (weight 100) |
| postgres | one62 | — (pinned via PVC) |
| mosquitto | one6t | — (pinned via PVC) |

---

## 6. Rolling Update Strategy

All deployments use:
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 0
    maxSurge: 1
```
Zero downtime: new pod must be Ready before old pod terminates.
`preStop: sleep 5` + `terminationGracePeriodSeconds: 30` for graceful drain.

---

## 7. Verifying Deployments

```bash
# Check all hydroflow pods
kubectl get pods -n hydroflow

# Fastify health (DB connectivity)
kubectl exec -n hydroflow deployment/hydroflow-antigravity -- \
  wget -qO- http://127.0.0.1:3001/health
# Expected: {"status":"ok","db":"connected"}

# Fastify context (sensor/flow/alert data)
kubectl exec -n hydroflow deployment/hydroflow-antigravity -- \
  wget -qO- http://127.0.0.1:3001/api/context
# Expected: {"sensors":[...],"flowLogs":[...],"alerts":[...],"timestamp":"..."}

# Express health probes
kubectl exec -n hydroflow deployment/hydroflow-backend -- \
  node -e "require('http').get('http://localhost:3000/healthz', r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>console.log(d))})"
# Expected: {"status":"ok"}

# Full chain: Express → Fastify → Postgres → Gemini
kubectl exec -n hydroflow deployment/hydroflow-backend -- \
  node -e "require('http').get('http://localhost:3000/api/ai/insights', r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>console.log(d.substring(0,300)))})"
# Expected: JSON array of 3 AI insights

# Express → Fastify DNS resolution
kubectl exec -n hydroflow deployment/hydroflow-backend -- \
  node -e "require('http').get('http://hydroflow-antigravity.hydroflow.svc.cluster.local:3001/health', r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>console.log(d))})"
```

---

## 8. k8s Manifest Locations

| File | Location | Contents |
|------|----------|----------|
| Express backend | `~/hydroflow/INFRA/k8s/backend.yaml` on k3master | Deployment + ClusterIP |
| Fastify/Antigravity | `src/backend/antigravity/k8s/antigravity.yaml` in repo | Deployment + ClusterIP |
| Infrastructure | `~/hydroflow/INFRA/k8s/infrastructure.yaml` on k3master | Mosquitto + PostgreSQL |
| Frontend | `~/hydroflow/INFRA/k8s/frontend.yaml` on k3master | LB at 192.168.100.208 |

Apply:
```bash
kubectl apply -f src/backend/antigravity/k8s/antigravity.yaml
```

---

## 9. Resource Limits

| Service | CPU request | CPU limit | Memory request | Memory limit |
|---------|-------------|-----------|----------------|--------------|
| hydroflow-backend | 50m | 300m | 64Mi | 256Mi |
| hydroflow-antigravity | 50m | 300m | 64Mi | 256Mi |

Sized for arm64 phone workers (Snapdragon 845, 6–8GB RAM).

---

## 10. Outstanding Deployment Work

| Item | Priority |
|------|----------|
| Deploy `hydroflow-frontend` (manifest exists at INFRA/k8s/frontend.yaml) | HIGH |
| Add Traefik IngressRoutes for external access | HIGH |
| Rotate postgres default password | HIGH |
| Add PVC for Gitea (currently emptyDir — registry data volatile) | HIGH |
| Set up CI/CD pipeline (currently all manual on k3master) | MEDIUM |
| Clean stale ReplicaSets: `kubectl delete rs -n hydroflow $(kubectl get rs -n hydroflow --no-headers \| awk '$2==0{print $1}')` | LOW |
