# Stage 1: Build
FROM node:25-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:25-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built files and production deps
COPY --from=builder --chown=nodejs:nodejs /app/package.json /app/package-lock.json ./
RUN npm ci --only=production

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/templates ./templates
COPY --from=builder --chown=nodejs:nodejs /app/examples ./examples

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node dist/cli.js --version || exit 1

# Default command
CMD ["node", "dist/cli.js"]
