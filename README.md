# HydroFlow IoT Management System

HydroFlow is a modular, scalable IoT application for managing water pumps, irrigation nodes, automation rules, and monitoring flow rates. It features a modern React frontend and is designed to connect to an MQTT-to-Postgres backend pipeline.

## Features
- **Dashboard**: Real-time overview of irrigation nodes, AI insights, weather, and system health.
- **Hardware Management**: Control and monitor pumps, valves, soil sensors, and tank sensors.
- **Zone Control**: Group hardware into logical zones for easier management.
- **Automation Rules**: Create "If This Then That" rules based on sensor readings.
- **Scheduling**: Set up time-based watering schedules.
- **Admin Panel**: Manage users, system settings, and view audit logs.
- **Blue-Green Ready**: The UI reads the `APP_COLOR` environment variable to indicate the active deployment environment.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Framer Motion, Lucide React.
- **Backend (Target)**: Node.js, Express, PostgreSQL, WebSockets, MQTT.

## Getting Started (Frontend Development)

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Clone the repository.
2. Navigate to the frontend directory: `cd src/frontend` (or run from root if configured).
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env` and configure your variables.
5. Start the development server: `npm run dev`

## Handoff Documentation
If you are taking over backend development or DevOps responsibilities, please refer to the following documents:
- [HANDOFF.md](./HANDOFF.md): Detailed instructions for Backend (Gemini AI) and DevOps (Opus AI).
- [PROJECT_MANIFEST.md](./PROJECT_MANIFEST.md): High-level project structure and status.
- [ANTIGRAVITY_EXPORT.md](./ANTIGRAVITY_EXPORT.md): Logic components and database requirements export.

## Deployment
The application is designed for containerized deployment. See `HANDOFF.md` for Docker and CI/CD requirements.
