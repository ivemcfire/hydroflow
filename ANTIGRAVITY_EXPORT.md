# HydroFlow Technical Export for Antigravity IDE

This document provides a comprehensive technical overview of the **HydroFlow** project for continued development within the Antigravity IDE.

## 1. Project Architecture
HydroFlow is a full-stack IoT application utilizing a **React** frontend and a **Node.js/Express** backend, integrated with **Firebase Firestore** and **MQTT**.

### Tech Stack
- **Frontend**: React 18, Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, Firebase Admin SDK.
- **Database**: Google Firestore (NoSQL).
- **IoT Protocol**: MQTT (via `mqtt.js`) for hardware communication.
- **Real-time**: Firestore `onSnapshot` (Client) and WebSockets (Server).

## 2. Core Components & Services

### Backend Services (`/src/backend/services/`)
- **Firebase Service**: Handles Firestore initialization and Admin SDK access.
- **MQTT Service**: Manages connections to the MQTT broker, subscribes to sensor topics, and publishes control commands.
- **Simulation Engine**: A server-side loop that simulates environmental data (Soil Moisture, Tank Levels) and publishes to MQTT.

### Frontend Architecture (`/src/frontend/`)
- **AppContext**: Centralized state management for system health, pumps, and telemetry.
- **API Service**: REST client for interacting with the Express backend.
- **Real-time Listeners**: Hooks that subscribe to Firestore collections for live UI updates.

## 3. Data Schema (Firestore)
The database structure is defined in `firebase-blueprint.json`. Key collections include:
- `/nodes`: Irrigation hardware nodes.
- `/pumps`: Actuators (pumps/valves) and their states.
- `/sensor_logs`: Historical telemetry data.
- `/activity`: System event logs.
- `/notifications`: User alerts.

## 4. Environment & Configuration
- **Firebase**: Configuration is stored in `firebase-applet-config.json`.
- **Environment Variables**: Defined in `.env.example`.
    - `APP_COLOR`: Used for Blue-Green deployment signaling.
    - `PROJECT_ID`: Firebase project identifier.
- **Security**: Firestore rules are defined in `firestore.rules`.

## 5. Development Workflow in Antigravity
- **Build**: `npm run build` compiles both frontend and backend.
- **Dev**: `npm run dev` starts the Express server with Vite middleware.
- **Verification**: Use `lint_applet` and `compile_applet` to ensure code quality.

## 6. Pending Development Tasks
1.  **AI Insights**: Integrate Gemini API to analyze `sensor_logs` and provide predictive maintenance alerts.
2.  **Automation Engine**: Implement server-side logic to process `NodeRule` entities and trigger MQTT commands.
3.  **User Authentication**: Enhance Firebase Auth integration for multi-user role-based access.
4.  **Mobile Optimization**: Refine Tailwind layouts for specialized field-tablet views.

## 7. Critical Implementation Notes
- **MQTT Topics**: Sensors publish to `hydroflow/sensors/{nodeId}/{sensorType}`. Controls listen on `hydroflow/control/{nodeId}/{componentId}`.
- **Simulation**: The simulation engine is active by default in the dev server. It can be toggled via environment variables if a real MQTT broker is connected.
- **Blue-Green Banner**: Ensure the `APP_COLOR` logic in `SystemStatus.tsx` is preserved during UI refactors.
