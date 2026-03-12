# HydroFlow — Homelab Infrastructure Reference

Last updated by: Claude (Sonnet 4.6) — full stack deployed + chain verified, 2026-03-12

---

## 1. Network Topology

```
192.168.100.0/24 — LAN
│
├── 192.168.100.52    k3master          (stale SSH entry in credentials.md — use .204)
├── 192.168.100.115   acergo16          Dev host — VS Code Dev Container
├── 192.168.100.152   jump              Bastion / SSH Gateway (Debian 13 trixie, amd64)
│                                       Also runs: Docker, Uptime Kuma on :3001 (netbook)
├── 192.168.100.203   winpc             Windows PC — Ollama runs here via WSL (:11434)
├── 192.168.100.204   k3master          K3s Control Plane — x86_64 Laptop (Headless)
│                                       Also runs: Ollama in-cluster (ClusterIP 10.43.61.168)
├── 192.168.100.206   gitea             Gitea — on one6t ⚠ emptyDir (no persistence)
│
├── MetalLB pool: 192.168.100.200–220
│   ├── 192.168.100.200   Traefik           K3s default ingress (LIVE, no routes yet)
│   ├── 192.168.100.201   Grafana           (monitoring ns)
│   ├── 192.168.100.202   guitar-frontend   (default ns — k3master)
│   ├── 192.168.100.204   open-webui        (default ns — k3master, same IP as node!)
│   ├── 192.168.100.205   uptime-kuma       (default ns — one61) ⚠ emptyDir
│   ├── 192.168.100.206   gitea             (default ns — one6t)  ⚠ emptyDir
│   ├── 192.168.100.207   mosquitto         (hydroflow ns — fixed annotation)
│   └── 192.168.100.208   hydroflow-frontend (hydroflow ns — NOT DEPLOYED)
│       guitar-backend = <pending> ← missing MetalLB annotation
│
└── K3s internal overlay (pod/node CIDR)
    ├── 10.0.1.1   k3master
    ├── 10.0.1.2   one6t
    ├── 10.0.2.2   one62
    └── 10.0.3.2   one61
```

---

## 2. Cluster Nodes

| Hostname  | Role          | LAN IP           | Internal IP | OS                       | Arch  | K3s version   | Hardware                             |
|-----------|---------------|------------------|-------------|--------------------------|-------|---------------|--------------------------------------|
| jump      | bastion       | 192.168.100.152  | —           | Debian 13 trixie    | x86   | —             | 6.12.73+deb13 | SSH gateway + Docker + Uptime Kuma :3001 |
| k3master  | control-plane | 192.168.100.204  | 10.0.1.1    | Ubuntu 24.04.3 LTS  | amd64 | v1.34.3+k3s3  | 6.8.0-101     | x86_64 Laptop (headless)                 |
| one61     | worker        | —                | 10.0.3.2    | postmarketOS v25.12 | arm64 | v1.35.0+k3s3  | 6.16.7-sdm845 | OnePlus 6 (Snapdragon 845, 6GB RAM)      |
| one62     | worker        | —                | 10.0.2.2    | postmarketOS v25.12 | arm64 | v1.35.0+k3s3  | 6.16.7-sdm845 | OnePlus 6 (Snapdragon 845, 6GB RAM)      |
| one6t     | worker        | —                | 10.0.1.2    | postmarketOS v25.12 | arm64 | v1.35.0+k3s3  | 6.16.7-sdm845 | OnePlus 6T (Snapdragon 845, 8GB RAM)     |

**Container runtime:** `containerd://2.1.5-k3s1` on all nodes.

**Worker OS:** postmarketOS = Alpine Linux userland, musl libc.
Use `node:20-alpine`. Do NOT use amd64-only images on phones.
**All app images must be multi-arch:** `--platform linux/amd64,linux/arm64`

All application workloads run on phone workers only (k3master excluded via nodeAffinity).

---

## 3. Live Resource Snapshot (2026-03-12)

| Node     | CPU used | CPU % | Memory used | Memory % | Allocatable CPU | Allocatable RAM |
|----------|----------|-------|-------------|----------|-----------------|-----------------|
| k3master | 187m     | 2%    | 4126Mi      | 54%      | 8               | ~7.6 GB         |
| one61    | 189m     | 2%    | 1655Mi      | **21%**  | 8               | ~7.6 GB         |
| one62    | 295m     | 3%    | 1691Mi      | **22%**  | 8               | ~7.6 GB         |
| one6t    | 204m     | 2%    | 1667Mi      | **30%**  | 8               | ~5.5 GB         |

---

## 4. Live Pod Placement & Deployment Strategy (2026-03-12)

```
┌──────────────────────────────────────────────────────────────────────┐
│  k3master  (amd64 — 54% mem — CONTROL PLANE)                        │
│  ├── guitar-backend     :8000  (default ns + fluent-bit sidecar)    │
│  ├── guitar-frontend    :80    (default ns — LB 192.168.100.202)    │
│  ├── loki-0             :3100  (default ns — StatefulSet)           │
│  ├── loki-canary                                                     │
│  ├── open-webui         :8080  (default ns — LB 192.168.100.204)    │
│  ├── prometheus-0       :9090  (monitoring ns)                      │
│  └── grafana            :80    (monitoring ns — LB 192.168.100.201) │
├──────────────────────────────────────────────────────────────────────┤
│  one6t  (arm64 — 30% mem — EDGE / PROXY TIER)                      │
│  ├── hydroflow-backend  :3000  (hydroflow ns — Express + React SPA) │
│  ├── mosquitto          :1883  (hydroflow ns — LB 192.168.100.207)  │
│  └── gitea              :3000  (default ns — LB 192.168.100.206)    │
├──────────────────────────────────────────────────────────────────────┤
│  one62  (arm64 — 22% mem — DATA TIER)                              │
│  ├── postgres           :5432  (hydroflow ns — PVC-pinned)          │
│  ├── prometheus-operator        (monitoring ns)                     │
│  └── kube-state-metrics         (monitoring ns)                     │
├──────────────────────────────────────────────────────────────────────┤
│  one61  (arm64 — 21% mem — MOST FREE)                              │
│  ├── uptime-kuma            :3001  (default ns — LB .205)          │
│  ├── loki-results-cache            (default ns)                    │
│  └── hydroflow-antigravity  :3001  (hydroflow ns — LIVE ✓)        │
└──────────────────────────────────────────────────────────────────────┘

DaemonSets on ALL 4 nodes:
  node-exporter         (monitoring ns)
  loki-canary           (default ns)
  nvidia-device-plugin  (kube-system — phones have no GPU, harmless)
  metallb-speaker       (metallb-system)
```

---

## 5. Dev Environment

```
Host:      acergo16 (192.168.100.115)
Container: a4b408877fd1 / elegant_carson  (VS Code devpod)
OS:        Ubuntu 24.04.3 LTS
Repo:      /home/vscode/hydroflow
Branch:    dev  (tracking upstream/feat — git@github.com:ivemcfire/hydroflow.git)
```

**kubectl:** kubeconfig from `user@192.168.100.204:/etc/rancher/k3s/k3s.yaml`,
server set to `https://192.168.100.204:6443`. At `~/.kube/config`.

**SSH:** `ssh user@192.168.100.204` — key `~/.ssh/id_ed25519` authorised.

---

## 6. Git & Registry

| Service | URL | Purpose |
|---------|-----|---------|
| Gitea   | http://192.168.100.206 | Self-hosted git + container registry ⚠ emptyDir |
| GitHub  | git@github.com:ivemcfire/hydroflow.git | Primary remote |

**Image naming:** `192.168.100.206/ivemcfire/<service>:latest`
**Registry secret:** `gitea-registry` (`kubernetes.io/dockerconfigjson`) in `hydroflow` ns.
**Builder:** `hydroflow-builder` — buildx multi-arch on k3master.
Push requires `registry.insecure=true` (Gitea is HTTP, not HTTPS).

**Host repo:** `~/hydroflow` on k3master, `main` branch.
`backend/` (Express), `INFRA/k8s/` (infrastructure.yaml, backend.yaml, frontend.yaml).

---

## 7. Namespaces

| Namespace      | Age  | Purpose                                   |
|----------------|------|-------------------------------------------|
| default        | 26d  | Loki StatefulSet (loki-chunks-cache-0 ⚠ Pending) |
| hydroflow      | 4d   | Application workloads                     |
| monitoring     | 24d  | Prometheus + Grafana stack                |
| metallb-system | 25d  | Bare-metal LoadBalancer                   |
| kube-system    | 26d  | K3s system + Traefik ingress              |

---

## 8. Running Services

### `hydroflow` namespace

| Name                  | Type         | External IP       | Port      | Node  | PVC                 | Notes                  |
|-----------------------|--------------|-------------------|-----------|-------|---------------------|------------------------|
| hydroflow-backend     | ClusterIP    | —                 | 3000      | one6t | —                   | Express + AI proxy — LIVE ✓ |
| hydroflow-antigravity | ClusterIP    | —                 | 3001      | one61 | —                   | Fastify IoT API — LIVE ✓    |
| hydroflow-frontend    | LoadBalancer | 192.168.100.208   | 80→4000   | —     | —                   | ⚠ Manifest only, not deployed |
| postgres              | ClusterIP    | —                 | 5432      | one62 | postgres-pvc (5Gi)  | Default pw ⚠ see §Security  |
| mosquitto             | LoadBalancer | 192.168.100.207   | 1883      | one6t | mosquitto-pvc (1Gi) | allow_anonymous: true        |

**Secrets:** `postgres-secret` (DB, USER, PASSWORD), `gitea-registry` (pull creds), `gemini-secret` (GEMINI_API_KEY)
**ConfigMaps:** `mosquitto-config`

### `default` namespace

| Name            | Type         | External IP       | Port(s)    | Node     | Notes                                         |
|-----------------|--------------|-------------------|------------|----------|-----------------------------------------------|
| gitea           | LoadBalancer | 192.168.100.206   | 80, 22     | one6t    | ⚠ emptyDir — all repo/registry data volatile  |
| guitar-backend  | LoadBalancer | `<pending>`       | 8000       | k3master | fluent-bit sidecar → Loki; missing MetalLB annotation |
| guitar-frontend | LoadBalancer | 192.168.100.202   | 80         | k3master |                                               |
| open-webui      | LoadBalancer | 192.168.100.204   | 80→8080    | k3master | `OLLAMA_BASE_URL=http://192.168.100.203:11434` (winpc) |
| uptime-kuma     | LoadBalancer | 192.168.100.205   | 80→3001    | one61    | ⚠ emptyDir — monitoring history volatile      |
| loki            | ClusterIP    | —                 | 3100, 9095 | k3master | StatefulSet — logs for guitar-backend         |
| ollama          | ClusterIP    | 10.43.61.168      | 11434      | k3master | In-cluster Ollama; open-webui may use winpc instead |
| loki-chunks-cache-0 | —        | —                 | —          | —        | ⚠ Pending — memcached resource/storage issue  |

### `monitoring` namespace

| Name                | Type         | External IP       | Port | Node     |
|---------------------|--------------|-------------------|------|----------|
| monitoring-grafana  | LoadBalancer | 192.168.100.201   | 80   | k3master |
| prometheus          | StatefulSet  | —                 | 9090 | k3master |
| prometheus-operator | ClusterIP    | —                 | 443  | one62    |
| kube-state-metrics  | ClusterIP    | —                 | 8080 | one62    |
| node-exporter       | DaemonSet    | —                 | 9100 | all nodes|

### `kube-system` namespace

| Name    | Type         | External IP       | Port(s) | Notes                                        |
|---------|--------------|-------------------|---------|----------------------------------------------|
| Traefik | LoadBalancer | 192.168.100.200   | 80, 443 | K3s default ingress — LIVE, no IngressRoutes |
| CoreDNS | ClusterIP    | —                 | 53      | Cluster DNS                                  |

---

## 9. Application Architecture

```
LAN / Internet
      │
      ▼
192.168.100.200  Traefik (ingress — live, no IngressRoutes yet)
      │
      ▼  [no route yet — backend accessed direct via ClusterIP]
┌─────────────────────────────────────────────┐
│  hydroflow-backend  (ClusterIP :3000) ✓     │  one6t
│  Express — React SPA + AI proxy            │
│  FASTIFY_URL → antigravity.hydroflow:3001  │
│  GEMINI_API_KEY → gemini-secret            │
│  /api/ai/insights  /api/pumps  /api/login  │
│  /healthz  /readyz                         │
└──────────────┬──────────────────────────────┘
               │ http://hydroflow-antigravity.hydroflow.svc.cluster.local:3001
               ▼
┌─────────────────────────────────────────────┐
│  hydroflow-antigravity  (ClusterIP :3001) ✓ │  one61
│  Fastify — IoT data API                    │
│  /api/users  /api/sensors  /api/flowlogs   │
│  /api/alerts  /api/context  /health        │
└──────────────┬──────────────────────────────┘
               │ postgres://$(USER):$(PASS)@postgres.hydroflow:5432/$(DB)
               ▼
┌─────────────────────────────────────────────┐
│  postgres  (ClusterIP :5432) ✓              │  one62
│  Tables (Express): activities,              │
│    sensor_readings, telemetry               │
│  Tables (Fastify, init 2026-03-12):         │
│    Users, Sensors, FlowLogs, SystemAlerts   │
└─────────────────────────────────────────────┘

ESP32 sensors → MQTT :1883 → mosquitto (one6t, 192.168.100.207)

AI: Express calls Gemini 2.5 Flash (external API) via GEMINI_API_KEY
    Prompt: system context from /api/context → 3 structured insights (JSON)

Ollama AI (ambiguous):
  Option A → in-cluster ClusterIP 10.43.61.168 on k3master
  Option B → open-webui points to 192.168.100.203 (Windows PC WSL)
  ← resolve before wiring to app
```

---

## 10. Hardware Observability — Battery Metrics DaemonSet

**Chip:** `bq27411-0`

| Metric   | sysfs path |
|----------|-----------|
| Capacity | `/sys/class/power_supply/bq27411-0/capacity` |
| Status   | `/sys/class/power_supply/bq27411-0/status`   |

**Two-container DaemonSet pattern:**
```
Container 1 — busybox writer
  hostPath /sys → /host/sys (readOnly)
  emptyDir → /metrics
  Reads sysfs, writes .prom files

Container 2 — prom/node-exporter reader
  emptyDir → /var/lib/node_exporter/textfile
  --collector.textfile.directory=/var/lib/node_exporter/textfile
  Prometheus scrapes this
```

---

## 11. Manifest & Script Locations (on k3master ~/...)

| Path | Contents |
|------|----------|
| `hydroflow/INFRA/k8s/infrastructure.yaml` | Mosquitto + PostgreSQL (PVCs, deployments, services) |
| `hydroflow/INFRA/k8s/backend.yaml` | hydroflow-backend deployment + ClusterIP |
| `hydroflow/INFRA/k8s/frontend.yaml` | hydroflow-frontend LB (.208:80→4000) |
| `hydroflow-infrastructure.yaml` | Older copy — contains encoded postgres-secret |
| `gitea.yaml` | Gitea deployment + LB (.206) |
| `kuma.yaml` | Uptime Kuma deployment + LB (.205) |
| `hello-phones.yaml` | Test nginx DaemonSet across phone nodes |
| `homelab-config/apps/` | gitea, open-webui, uptime-kuma, guitar-backend/frontend yamls |
| `homelab-config/monitoring/` | fluent-bit-config.yaml (guitar-backend sidecar) |
| `sidecar-manifests/` | fluent-bit sidecar + Loki reference patterns |
| `redeploy-all.sh` | Guitar app full rebuild (tar + SCP) |
| `redeploy-backend.sh` | Guitar backend rebuild |
| `redeploy-frontend.sh` | Guitar frontend rebuild |

---

## 12. Credentials Reference

> Stored in plaintext at `~/homelab-secrets/credentials.md` on k3master.

| Service      | URL / Host                  | User      | Notes                                       |
|--------------|-----------------------------|-----------|---------------------------------------------|
| Gitea        | http://192.168.100.206      | ivemcfire | Also container registry                     |
| Grafana      | http://192.168.100.201      | user      |                                             |
| Open WebUI   | http://192.168.100.204      | user      |                                             |
| Uptime Kuma  | http://192.168.100.205      | user      | K3s cluster instance (one61)                |
| Uptime Kuma  | http://192.168.100.152:3001 | user      | Netbook (jumphost) standalone instance      |
| K3master SSH | 192.168.100.204             | user      | ⚠ credentials.md lists .52 — stale         |
| Jumpbox SSH  | 192.168.100.152             | user      |                                             |
| Windows PC   | 192.168.100.203             | —         | WoL MAC: `FC:34:97:B5:A5:43`               |
| GitHub       | github.com                  | ivemcfire |                                             |
| postgres     | postgres.hydroflow.svc:5432 | hydroflow_user | Default pw: `Ch@ngeMe!2025` ⚠ rotate  |

---

## 13. Security Notes

| Item | Risk | Action |
|------|------|--------|
| postgres default password `Ch@ngeMe!2025` | HIGH — default from infrastructure.yaml, likely unchanged | Rotate immediately: `kubectl create secret generic postgres-secret --dry-run=client -o yaml ... \| kubectl apply -f -` |
| Gitea emptyDir | HIGH — all git data + registry lost on pod restart | Add PVC before any serious use |
| Uptime Kuma emptyDir | MEDIUM — monitoring history lost on restart | Add PVC |
| Mosquitto allow_anonymous | LOW on LAN | Acceptable for ESP32 sensors; harden before external exposure |
| Ollama origin ambiguous (.204 vs .203) | MEDIUM | Clarify and document which is authoritative |

---

## 16. Branching / Deployment Strategy

| Branch | Target            | Description            |
|--------|-------------------|------------------------|
| main   | AI Studio sandbox | Volatile, ignore       |
| feat   | Active dev        | Source of truth        |
| dev    | Green (Testing)   | Deploy to test cluster |
| prod   | Blue (Live)       | Stable releases only   |

---

## 17. Storage

| PVC           | Size | StorageClass | Service       | Node  | Notes                          |
|---------------|------|--------------|---------------|-------|--------------------------------|
| postgres-pvc  | 5Gi  | local-path   | postgres      | one62 | Pinned — do not reschedule     |
| mosquitto-pvc | 1Gi  | local-path   | mosquitto     | one6t | Pinned — do not reschedule     |
| Gitea         | —    | emptyDir     | gitea         | —     | ⚠ No persistence               |
| Uptime Kuma   | —    | emptyDir     | uptime-kuma   | one61 | ⚠ No persistence               |

`local-path` = data on node's local disk. Pod rescheduled to a different phone = empty volume.

---

## 14. Known Gaps & Outstanding Work

| # | Issue | Status |
|---|-------|--------|
| 1 | Fastify/Antigravity not deployed | ✅ DONE — `1/1 Running` on one61, `/health` → `{db: connected}` |
| 2 | `FASTIFY_URL` not set on hydroflow-backend | ✅ DONE — patched via `kubectl set env` |
| 3 | `GEMINI_API_KEY` not set on hydroflow-backend | ✅ DONE — `gemini-secret` created, env patched |
| 4 | No IngressRoutes defined | OPEN — Traefik live at .200 but nothing routed through it |
| 5 | No green/blue namespace split | OPEN — only one hydroflow namespace, no env isolation |
| 6 | Mosquitto unauthenticated | LOW — acceptable on LAN; harden before external exposure |
| 7 | Stale ReplicaSets in hydroflow | OPEN — clean with: `kubectl delete rs -n hydroflow $(kubectl get rs -n hydroflow --no-headers \| awk '$2==0{print $1}')` |
| 8 | postgres default password not rotated | ⚠ HIGH — see §Security |
| 9 | Gitea + Uptime Kuma on emptyDir | ⚠ HIGH — data loss on pod restart; add PVCs |
| 10 | guitar-backend LB `<pending>` | OPEN — missing MetalLB `loadBalancerIP` annotation |
| 11 | hydroflow-frontend not deployed | OPEN — manifest at `INFRA/k8s/frontend.yaml` (.208:80→4000) |
| 12 | loki-chunks-cache-0 Pending | OPEN — likely memcached resource/storage constraint |
| 13 | Ollama endpoint ambiguous | OPEN — resolve .204 in-cluster vs .203 winpc before wiring |
| 14 | No CI/CD pipeline | OPEN — manual builds via docker buildx on k3master |
| 15 | postgres-pvc on local-path, no backup | OPEN — data loss if one62 dies |
| 16 | jump secondary IP 192.168.100.149 | LOW — DHCP secondary on same NIC, purpose unclear |
| 17 | NVIDIA device plugin on phone nodes | LOW — phones have no GPU; harmless but wasteful |
| 18 | credentials.md lists k3master as .52 | OPEN — correct LAN IP is .204; update credentials.md |
| 19 | DB tables: Express schema coexists with Fastify schema | INFO — both sets of tables present; no conflict |
| 20 | hydroflow-backend image missing Dockerfile in repo | ✅ DONE — `Dockerfile.backend` added at repo root |

---

## 15. Useful Commands

```bash
# Cluster overview
kubectl get nodes -o wide
kubectl top nodes
kubectl get all --all-namespaces

# hydroflow
kubectl get all -n hydroflow
kubectl logs -n hydroflow deployment/hydroflow-backend -f
kubectl exec -n hydroflow deployment/postgres -- psql -U hydroflow_user -d hydroflow

# Traefik
kubectl get all -n kube-system | grep traefik
kubectl get ingressroute --all-namespaces

# Loki issue
kubectl describe pod loki-chunks-cache-0 -n default

# SSH
ssh user@192.168.100.204   # k3master
ssh user@192.168.100.152   # jumphost

# Build & push (on k3master, insecure registry)
docker buildx build \
  --builder hydroflow-builder \
  --platform linux/amd64,linux/arm64 \
  --output type=image,name=192.168.100.206/ivemcfire/<service>:latest,push=true,registry.insecure=true \
  <build-context>/

# Apply manifests
kubectl apply -f INFRA/k8s/

# Clean stale ReplicaSets
kubectl delete rs -n hydroflow $(kubectl get rs -n hydroflow --no-headers | awk '$2==0 {print $1}')

# Rotate postgres password
kubectl create secret generic postgres-secret -n hydroflow \
  --from-literal=POSTGRES_DB=hydroflow \
  --from-literal=POSTGRES_USER=hydroflow_user \
  --from-literal=POSTGRES_PASSWORD='<new-strong-password>' \
  --dry-run=client -o yaml | kubectl apply -f -
```
