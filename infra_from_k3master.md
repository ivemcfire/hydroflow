# HydroFlow — Homelab Infrastructure Reference
# SOURCE: Claude AI context from k3master — raw capture 2026-03-12
# Merged into INFRA.md — keep this file as audit trail only

Last updated by: Claude (Sonnet 4.6) — live cluster audit, 2026-03-12

---

## 1. Network Topology

```
192.168.100.0/24 — LAN
│
├── 192.168.100.52    k3master (SSH)    ← credentials.md entry (may be stale; see §5)
├── 192.168.100.115   acergo16          Dev host (VS Code Dev Container)
├── 192.168.100.152   jumphost          Bastion / SSH Gateway / Uptime Kuma (netbook)
├── 192.168.100.203   winpc             Windows PC — Ollama also runs here (WSL)
├── 192.168.100.204   k3master          K3s Control Plane — x86_64 Laptop (Headless)
│                                       open-webui LoadBalancer also assigned here
│
├── MetalLB pool: 192.168.100.200–220 (assigned to LoadBalancer services)
│   ├── 192.168.100.200   Traefik         (ingress controller — kube-system, default)
│   ├── 192.168.100.201   Grafana         (monitoring namespace)
│   ├── 192.168.100.202   guitar-frontend (default namespace)
│   ├── 192.168.100.204   open-webui      (default namespace — same as k3master node IP)
│   ├── 192.168.100.205   Uptime Kuma     (default namespace — on one61)
│   ├── 192.168.100.206   Gitea           (default namespace — on one6t)
│   ├── 192.168.100.207   Mosquitto       (hydroflow namespace — fixed via MetalLB annotation)
│   └── 192.168.100.208   hydroflow-frontend (hydroflow namespace — NOT YET DEPLOYED)
│
└── K3s internal overlay (pod/node CIDR — used for inter-node routing)
    ├── 10.0.1.1   k3master
    ├── 10.0.1.2   one6t
    ├── 10.0.2.2   one62
    └── 10.0.3.2   one61
```

---

## 2. Cluster Nodes

| Hostname  | Role          | LAN IP           | Internal IP | OS                    | Arch  | K3s version   | Kernel          | Hardware                               |
|-----------|---------------|------------------|-------------|-----------------------|-------|---------------|-----------------|----------------------------------------|
| jumphost  | bastion       | 192.168.100.152  | —           | TBD                   | —     | —             | —               | SSH gateway / Uptime Kuma (netbook)    |
| k3master  | control-plane | 192.168.100.204  | 10.0.1.1    | Ubuntu 24.04.3 LTS    | amd64 | v1.34.3+k3s3  | 6.8.0-101       | x86_64 Laptop (headless)               |
| one6t     | worker        | —                | 10.0.1.2    | postmarketOS v25.12   | arm64 | v1.35.0+k3s3  | 6.16.7-sdm845   | OnePlus 6T (Snapdragon 845, 8GB RAM)   |
| one62     | worker        | —                | 10.0.2.2    | postmarketOS v25.12   | arm64 | v1.35.0+k3s3  | 6.16.7-sdm845   | OnePlus 6 (Snapdragon 845, 6GB RAM)    |
| one61     | worker        | —                | 10.0.3.2    | postmarketOS v25.12   | arm64 | v1.35.0+k3s3  | 6.16.7-sdm845   | OnePlus 6 (Snapdragon 845, 6GB RAM)    |

**Container runtime:** containerd://2.1.5-k3s1 on all nodes.

---

## 3. Live Resource Snapshot (2026-03-12)

| Node     | CPU (cores) | CPU %  | Memory used | Memory %  | Allocatable CPU | Allocatable RAM |
|----------|-------------|--------|-------------|-----------|-----------------|-----------------|
| k3master | 187m        | 2%     | 4126Mi      | 54%       | 8               | ~7.6 GB         |
| one61    | 189m        | 2%     | 1655Mi      | 21%       | 8               | ~7.6 GB         |
| one62    | 295m        | 3%     | 1691Mi      | 22%       | 8               | ~7.6 GB         |
| one6t    | 204m        | 2%     | 1667Mi      | 30%       | 8               | ~5.5 GB         |

---

## 4. Live Pod Placement (2026-03-12)

```
k3master  (amd64 — 54% mem)
  guitar-backend     :8000  (default ns — with fluent-bit sidecar)
  guitar-frontend    :80    (default ns)
  loki-0             :3100  (default ns — StatefulSet, 2 containers)
  loki-canary
  open-webui         :8080  (default ns)
  prometheus-0       :9090  (monitoring ns)
  grafana            :80    (monitoring ns, 3 containers)

one6t  (arm64 — 30% mem)
  hydroflow-backend  :3000  (hydroflow ns)
  mosquitto          :1883  (hydroflow ns)
  gitea              :3000  (default ns)

one62  (arm64 — 22% mem)
  postgres           :5432  (hydroflow ns — PVC-pinned)
  prometheus-operator        (monitoring ns)
  kube-state-metrics         (monitoring ns)

one61  (arm64 — 21% mem — MOST FREE)
  uptime-kuma        :3001  (default ns)
  loki-results-cache         (default ns)
  [target for hydroflow-antigravity]

DaemonSets (ALL nodes): node-exporter, loki-canary, nvidia-device-plugin, metallb-speaker
```

---

## 5. Running Services — default namespace

| Name            | Type         | External IP       | Port(s)   | Node     | Notes                                 |
|-----------------|--------------|-------------------|-----------|----------|---------------------------------------|
| gitea           | LoadBalancer | 192.168.100.206   | 80, 22    | one6t    | emptyDir — no persistence             |
| guitar-backend  | LoadBalancer | `<pending>`       | 8000      | k3master | fluent-bit sidecar → Loki             |
| guitar-frontend | LoadBalancer | 192.168.100.202   | 80        | k3master |                                       |
| open-webui      | LoadBalancer | 192.168.100.204   | 80→8080   | k3master | OLLAMA_BASE_URL=http://192.168.100.203:11434 |
| uptime-kuma     | LoadBalancer | 192.168.100.205   | 80→3001   | one61    | emptyDir — no persistence             |
| loki            | ClusterIP    | —                 | 3100,9095 | k3master | StatefulSet. loki-chunks-cache-0 Pending |
| ollama          | ClusterIP    | 10.43.61.168      | 11434     | k3master | In-cluster inference service          |

---

## 6. Manifest & Config File Locations (on k3master)

| Path | Contents |
|------|----------|
| `~/hydroflow/INFRA/k8s/infrastructure.yaml` | Mosquitto + PostgreSQL |
| `~/hydroflow/INFRA/k8s/backend.yaml` | hydroflow-backend deployment + ClusterIP |
| `~/hydroflow/INFRA/k8s/frontend.yaml` | hydroflow-frontend LoadBalancer (.208) |
| `~/hydroflow-infrastructure.yaml` | Older copy — includes encoded postgres-secret |
| `~/gitea.yaml` | Gitea deployment + LB (.206) |
| `~/kuma.yaml` | Uptime Kuma deployment + LB (.205) |
| `~/hello-phones.yaml` | Test nginx DaemonSet across phone nodes |
| `~/homelab-config/apps/` | gitea, open-webui, uptime-kuma, guitar-backend/frontend |
| `~/homelab-config/monitoring/` | fluent-bit-config.yaml (guitar sidecar) |
| `~/sidecar-manifests/` | fluent-bit sidecar + Loki reference |
| `~/redeploy-all.sh` | Guitar app full rebuild (tar+SCP) |
| `~/redeploy-backend.sh` | Guitar backend rebuild |
| `~/redeploy-frontend.sh` | Guitar frontend rebuild |

---

## 7. Credentials (from credentials.md on k3master)

| Service       | URL / Host               | User      | Extra                           |
|---------------|--------------------------|-----------|---------------------------------|
| Gitea         | http://192.168.100.206   | ivemcfire | Also container registry         |
| Grafana       | http://192.168.100.201   | user      |                                 |
| Open WebUI    | http://192.168.100.204   | user      |                                 |
| Uptime Kuma   | http://192.168.100.205   | user      | K3s cluster instance            |
| Uptime Kuma   | http://192.168.100.152:3001 | user   | Netbook (jumphost) instance     |
| K3master SSH  | 192.168.100.204          | user      | credentials.md says .52 — stale |
| Jumpbox SSH   | 192.168.100.152          | user      |                                 |
| Windows PC    | 192.168.100.203          | —         | WoL MAC: FC:34:97:B5:A5:43      |
| GitHub        | github.com               | ivemcfire |                                 |
