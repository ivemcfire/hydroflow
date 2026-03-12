# HydroFlow DevOps Handover (Opus 4.6)

## 1. Architecture Flow
`User -> Express API (Port 3000) -> Fastify Backend (Port 3001) -> PostgreSQL Database (Port 5432)`

## 2. Branching Strategy (Blue/Green k3s)
*   **`main`**: AI Studio UI volatile sandbox. Ignore.
*   **`feat`**: Antigravity Full-Stack development branch.
*   **`dev`**: Deploy this to the **Green (Testing)** Cluster.
*   **`prod`**: Deploy this to the **Blue (Live)** Cluster.

## 3. Environment Variables Required

### Express Proxy (`/`)
*   `NODE_ENV=production`
*   `PORT=3000`
*   `GEMINI_API_KEY=<valid_token>`
*   `FASTIFY_URL=http://<fastify_service_name>:3001`

### Fastify Backend (`/src/backend/antigravity/`)
*   `FASTIFY_PORT=3001`
*   `DATABASE_URL=postgres://<user>:<pass>@<pg_service>:5432/hydroflow`

## 4. Build & Start Commands

*   **Service 1 (Express)**:
    *   Path: `/`
    *   Build: `npm install && npm run build`
    *   Start: `npm run start`
*   **Service 2 (Fastify)**:
    *   Path: `/src/backend/antigravity/`
    *   Build: `npm install && npm run build`
    *   Start: `npm run start`

## 5. CRITICAL ACTION: Revert Fastify Database Mocks
Before deploying to k3s, you **MUST** revert the hardcoded database mocks inside `/src/backend/antigravity/src/` to re-enable live PostgreSQL connections:

1.  **`server.ts`**: Uncomment `server.register(dbConnector);`
2.  **`routes/users.ts`**: Delete the hardcoded mock JSON arrays in `/login` and `/register`. Restore the commented `fastify.pg.query` SQL logic.
3.  **`routes/context.ts`**: Delete the hardcoded mock sensor data arrays. Restore the three `SELECT` queries for `Sensors`, `FlowLogs`, and `SystemAlerts`.
4.  **PostgreSQL**: Ensure `Users`, `Sensors`, `FlowLogs`, and `SystemAlerts` tables are initialized in the database before the Fastify pod healthchecks execute.
