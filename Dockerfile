# ── Build stage ───────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

COPY src/ ./src/

RUN npm run build

# ── Production stage ──────────────────────────────────
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Copy compiled JS from builder
COPY --from=builder /app/dist ./dist

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Start compiled JS
CMD ["node", "dist/server.js"]
