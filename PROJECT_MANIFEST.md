# HydroFlow Project Manifest

## Overview
**HydroFlow** is a full-stack IoT ecosystem designed for precision irrigation management. It provides a real-time monitoring and control interface for distributed irrigation nodes, integrating hardware simulation, MQTT-based communication, and a cloud-native backend.

## Architecture
- **Frontend**: 
    - **Framework**: React 18 with Vite.
    - **Styling**: Tailwind CSS (Mobile-first, dark-themed dashboard).
    - **Visualizations**: Recharts for historical telemetry and D3 for complex data grids.
    - **State Management**: React Context API for global system state and real-time updates.
- **Backend**: 
    - **Framework**: Node.js / Express with TypeScript.
    - **Database**: Google Firestore (NoSQL) for persistent storage of telemetry, configurations, and logs.
    - **IoT Bridge**: MQTT (via `mqtt.js`) for low-latency communication with hardware nodes.
    - **Real-time Sync**: WebSockets (Socket.io) for pushing server-side events to the UI.
- **IoT Simulation**: 
    - **Engine**: A server-side simulation loop that generates realistic environmental data (Soil Moisture, Tank Levels, etc.).
    - **Communication**: Publishes sensor data to MQTT topics and listens for actuator commands.

## Core Logic & Functionality
### 1. IoT Communication Loop
- **Ingress**: The MQTT service subscribes to `hydroflow/sensors/#`. When a message arrives, it is parsed and saved to the `sensor_logs` collection in Firestore.
- **Egress**: UI actions (e.g., toggling a pump) trigger a POST request to the backend, which then publishes a command to the corresponding `hydroflow/control/#` MQTT topic.
- **Automation**: A server-side rule engine (planned) evaluates sensor thresholds to trigger actuator actions automatically.

### 2. Data Management
- **Persistence**: Firestore stores the "Source of Truth" for system configuration (`nodes`, `pumps`) and historical data (`sensor_logs`, `activity`).
- **Real-time Updates**: The frontend utilizes Firestore `onSnapshot` listeners and WebSockets to ensure the UI reflects the physical state of the field within milliseconds.

### 3. System Health & Environment
- **Blue-Green Deployment**: The system reads the `APP_COLOR` environment variable. A visual banner in the UI indicates whether the user is interacting with the "Blue" or "Green" production environment.
- **Health Monitoring**: A dedicated controller aggregates pump status and sensor trends to provide a high-level "System Health" score.

## Design Principles
- **Aesthetic**: "Technical Dashboard" meets "Hardware Specialist Tool." High-contrast dark mode with neon accents for active states.
- **Responsiveness**: Mobile-first design ensuring field technicians can manage the system via tablets or smartphones.
- **Modularity**: Clean separation between the IoT communication layer, the API business logic, and the presentation layer.

## Directory Structure
- `/src/frontend/`: React source code, components, and hooks.
- `/src/backend/`: Express server, Firebase configuration, and MQTT services.
- `/src/backend/services/`: Core logic for MQTT and Simulation.
- `/infra/`: Deployment manifests for Docker and k3s (local edge server).
- `firestore.rules`: Security definitions for database access.
- `firebase-blueprint.json`: Intermediate representation of the data schema.

## Current Status
- [x] Full-stack integration with Firebase Firestore.
- [x] MQTT-based IoT communication bridge implemented.
- [x] Real-time sensor simulation engine active.
- [x] Responsive dashboard with pump control and telemetry visualization.
- [x] Blue-Green deployment signaling implemented.
- [ ] Advanced AI Insights (Gemini API integration) - *In Progress*.
- [ ] Predictive Maintenance analytics - *Planned*.
