# =============================================================================
# HydroFlow Backend — Multi-stage Dockerfile
# Target arch: linux/arm64 (OnePlus 6/6T phone workers, sdm845)
# Base: node:20-slim (Debian slim, smaller than alpine but glibc-safe for pg)
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1 — deps
# Install ONLY production dependencies. Isolated so the layer is cacheable
# and never carries devDependencies into the final image.
# -----------------------------------------------------------------------------
FROM node:20-slim AS deps

WORKDIR /app

COPY package*.json ./

# ci = reproducible install from lockfile; omit dev deps
RUN npm ci --omit=dev && \
    # Clean npm cache to shrink layer
    npm cache clean --force


# -----------------------------------------------------------------------------
# Stage 2 — runner (final image)
# Copies only the production node_modules + source. No build tools, no cache.
# -----------------------------------------------------------------------------
FROM node:20-slim AS runner

# Metadata
LABEL org.opencontainers.image.title="hydroflow-backend" \
      org.opencontainers.image.description="HydroFlow IoT MQTT→PostgreSQL bridge" \
      org.opencontainers.image.source="https://192.168.100.206/hydroflow/backend"

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Create a non-root user — never run Node apps as root in containers
RUN addgroup --system --gid 1001 hydroflow && \
    adduser  --system --uid 1001 --ingroup hydroflow hydroflow

# Copy production deps from Stage 1
COPY --from=deps --chown=hydroflow:hydroflow /app/node_modules ./node_modules

# Copy application source
COPY --chown=hydroflow:hydroflow server.js db.js automations.js ./
COPY --chown=hydroflow:hydroflow package.json ./

USER hydroflow

EXPOSE 3000

# Healthcheck so Docker / containerd knows the process state
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/healthz', r => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "server.js"]
