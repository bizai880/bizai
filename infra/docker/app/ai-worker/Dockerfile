# infra/docker/app/ai-worker/Dockerfile
# Multi-stage build for AI Worker

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY ../../packages/shared/package.json ./packages/shared/
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages

# Copy source code
COPY ../../apps/ai-worker .
COPY ../../packages/shared ./packages/shared

# Build TypeScript
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 worker

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Copy necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set permissions
RUN chown -R worker:nodejs /app
USER worker

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error()})"

# Start worker
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/index.js"]

# Development stage
FROM node:20-alpine AS development
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY ../../packages/shared/package.json ./packages/shared/

# Install all dependencies
RUN npm ci

# Copy source code
COPY ../../apps/ai-worker .
COPY ../../packages/shared ./packages/shared

# Expose port
EXPOSE 3001

# Start development
CMD ["npm", "run", "dev"]