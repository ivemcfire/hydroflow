# HydroFlow - Handoff Document

This document serves as the official handoff from the Lead Frontend Engineer to the Backend Developer (Antigravity IDE / Gemini AI) and the DevOps Engineer (Opus AI).

## 1. Project Overview
**HydroFlow** is a modular, scalable IoT dashboard designed to manage and monitor irrigation nodes, hardware components (pumps, valves, sensors), automation rules, and system health. 

The frontend is built with **React 18**, **Tailwind CSS**, and **Recharts**, utilizing a clean monorepo architecture. It is currently populated with mock data and is ready to be wired up to a real backend and deployed.

---

## 2. Handoff to Backend Developer (Gemini AI)

**Role:** Backend Developer (Node.js/Express)
**Goal:** Replace the frontend mock data with real REST API endpoints and WebSocket streams connected to an MQTT-to-Postgres pipeline.

### Required Backend Architecture
*   **Framework:** Node.js with Express (Skeleton already exists in `src/backend/server.ts`).
*   **Database:** PostgreSQL (for storing nodes, hardware configurations, automation rules, schedules, and historical telemetry).
*   **Real-time Data:** WebSockets (Socket.io or native `ws`) to stream live telemetry and status updates to the frontend.
*   **IoT Integration:** An MQTT client (e.g., `mqtt.js`) subscribing to hardware topics, processing the data, and saving it to Postgres while simultaneously broadcasting it via WebSockets.

### Frontend Integration Points (To Be Implemented)
The frontend currently uses a mock API service located at `src/frontend/src/services/api.ts`. You need to implement the following REST endpoints and WebSocket events in `src/backend/routes/api.ts`:

**REST Endpoints (Base URL: `process.env.VITE_API_URL`)**
1.  `GET /api/system/status` - Returns overall system health, uptime, and the `APP_COLOR` (Blue/Green).
2.  `GET /api/nodes` - Returns all irrigation nodes and their assigned hardware.
3.  `POST /api/nodes` - Create a new node.
4.  `PUT /api/nodes/:id` - Update node details.
5.  `GET /api/hardware` - Returns all hardware components (pumps, valves, sensors) and their current state.
6.  `POST /api/hardware/toggle` - Toggle a pump or valve ON/OFF.
7.  `GET /api/automations` - Returns all automation rules.
8.  `POST /api/automations` - Create a new rule.
9.  `GET /api/schedules` - Returns all watering schedules.
10. `GET /api/analytics/historical` - Returns historical chart data (soil humidity, water consumption, etc.) for Recharts.

**WebSocket Events (Base URL: `process.env.VITE_WS_URL`)**
*   `hardware:update` - Broadcasts real-time changes to sensor values (e.g., soil moisture changes, tank levels) or actuator states (pump turned on/off).
*   `system:alert` - Broadcasts AI insights or critical system anomalies (e.g., "Pump pressure dropped").

### State Management Note
The frontend uses React Context (`AppContext.tsx`) to manage global state. When you implement the WebSocket listener, dispatch actions to the context to update the UI reactively without polling.

---

## 3. Handoff to DevOps Engineer (Opus AI)

**Role:** DevOps Engineer
**Goal:** Containerize the application, set up the CI/CD pipeline for GitHub, and configure a Blue-Green deployment strategy.

### Deployment Requirements
*   **Monorepo Structure:** The project is structured as a monorepo. Ensure your build scripts account for the `src/frontend` and `src/backend` (to be created) directories.
*   **Dockerization:** 
    *   Create a `Dockerfile.frontend` using a multi-stage build (Node.js for building, Nginx for serving the static files).
    *   Create a `Dockerfile.backend` for the Node.js/Express server.
    *   Provide a `docker-compose.yml` for local development orchestration (Frontend, Backend, Postgres, Mosquitto MQTT Broker).
*   **Blue-Green Deployment:**
    *   The frontend is already configured to read the `APP_COLOR` environment variable (via the backend `/api/system/status` endpoint) to display a Blue or Green banner indicating the active environment.
    *   Set up the routing/ingress (e.g., Nginx, Traefik, or AWS ALB) to handle traffic switching between the Blue and Green containers.
*   **Environment Variables:**
    *   Ensure the CI/CD pipeline injects the variables defined in `.env.example` (e.g., `VITE_API_URL`, `VITE_WS_URL`, `APP_COLOR`, `DATABASE_URL`, `MQTT_BROKER_URL`).

### GitHub Push Prep
*   The `.gitignore` is standard for Node/React projects.
*   Ensure all secrets are removed from the codebase and rely entirely on GitHub Secrets during the Actions workflow.

---

## 4. Next Steps
1.  **Backend:** Review `src/frontend/src/services/api.ts` and the mock data structures in the components (`Hardware.tsx`, `Sidebar.tsx`, etc.) to understand the expected JSON schemas.
2.  **DevOps:** Review `package.json` for the frontend build commands (`npm run build`) and prepare the Dockerfiles.
3.  **Both:** Coordinate on the exact WebSocket URL and API routing structure for the ingress controller.
