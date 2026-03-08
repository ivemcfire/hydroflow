# =============================================================================
# HydroFlow Frontend — Angular SSR Multi-stage Dockerfile
# Target arch: linux/arm64 (OnePlus 6/6T phone workers, sdm845)
# Base: node:20-slim
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1 — builder
# Installs all deps and runs ng build (production SSR).
# GEMINI_API_KEY is baked into the bundle at build time via angular.json define.
# -----------------------------------------------------------------------------
FROM node:20-slim AS builder

ARG GEMINI_API_KEY=""
ENV GEMINI_API_KEY=${GEMINI_API_KEY}

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# -----------------------------------------------------------------------------
# Stage 2 — runner (final image)
# Copies only the built SSR artifacts. No source, no devDependencies.
# -----------------------------------------------------------------------------
FROM node:20-slim AS runner

LABEL org.opencontainers.image.title="hydroflow-frontend" \
      org.opencontainers.image.description="HydroFlow Angular SSR dashboard" \
      org.opencontainers.image.source="https://192.168.100.206/hydroflow/frontend"

WORKDIR /app

ENV NODE_ENV=production \
    PORT=4000

# Non-root user
RUN addgroup --system --gid 1001 hydroflow && \
    adduser  --system --uid 1001 --ingroup hydroflow hydroflow

# Copy built SSR output
COPY --from=builder --chown=hydroflow:hydroflow /app/dist/app ./dist/app

# Install only the production SSR runtime deps (express, @angular/ssr)
COPY --from=builder --chown=hydroflow:hydroflow /app/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

USER hydroflow

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/', r => process.exit(r.statusCode < 500 ? 0 : 1))"

CMD ["node", "dist/app/server/server.mjs"]
