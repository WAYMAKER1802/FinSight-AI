# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Final image
FROM node:20-alpine

LABEL maintainer="FinSight AI Team <dev@finsight.ai>"
LABEL version="1.0.0"
LABEL description="FinSight AI — Backend API Server"

# Non-root user for security
RUN addgroup -g 1001 nodejs && adduser -S finsight -u 1001

WORKDIR /app

# Copy dependencies and app source
COPY --from=builder --chown=finsight:nodejs /app/node_modules ./node_modules
COPY --chown=finsight:nodejs . .

# Create necessary directories
RUN mkdir -p logs uploads/reports uploads/avatars && \
    chown -R finsight:nodejs logs uploads

# Switch to non-root user
USER finsight

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/v1/health/ping || exit 1

CMD ["node", "server.js"]
