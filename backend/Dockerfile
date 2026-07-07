# =============================================================================
# HydroFlow Backend — Multi-stage Dockerfile (TypeScript)
# Target arch: linux/arm64 (OnePlus 6/6T phone workers, sdm845)
# Base: node:20-slim (Debian slim, smaller than alpine but glibc-safe for pg)
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1 — build
# Full install (incl. dev deps) + tsc compile.
# -----------------------------------------------------------------------------
FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2 — deps
# Production-only node_modules, cacheable, no toolchain.
# -----------------------------------------------------------------------------
FROM node:20-slim AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# -----------------------------------------------------------------------------
# Stage 3 — runner (final image)
# -----------------------------------------------------------------------------
FROM node:20-slim AS runner

LABEL org.opencontainers.image.title="hydroflow-backend" \
      org.opencontainers.image.description="HydroFlow IoT MQTT→PostgreSQL bridge + automation + dashboard API" \
      org.opencontainers.image.source="https://github.com/ivemcfire/hydroflow"

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Create a non-root user — never run Node apps as root in containers
RUN addgroup --system --gid 1001 hydroflow && \
    adduser  --system --uid 1001 --ingroup hydroflow hydroflow

COPY --from=deps  --chown=hydroflow:hydroflow /app/node_modules ./node_modules
COPY --from=build --chown=hydroflow:hydroflow /app/dist ./dist
COPY --chown=hydroflow:hydroflow package.json ./

USER hydroflow

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/healthz', r => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/index.js"]
