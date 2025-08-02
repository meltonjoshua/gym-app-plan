# Optimized Production Backend Dockerfile
FROM node:18-alpine AS dependencies

# Install build dependencies
RUN apk add --no-cache python3 make g++ 

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies for building
RUN npm ci --include=dev

# Builder stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./

# Copy source code
COPY . .

# Build the application with optimizations
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S fittracker -u 1001

# Set working directory
WORKDIR /app

# Copy built application with proper ownership
COPY --from=builder --chown=fittracker:nodejs /app/dist ./dist
COPY --from=builder --chown=fittracker:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=fittracker:nodejs /app/package*.json ./

# Create necessary directories
RUN mkdir -p logs tmp uploads && chown -R fittracker:nodejs logs tmp uploads

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=5000
ENV UV_THREADPOOL_SIZE=128

# Switch to non-root user
USER fittracker

# Expose port
EXPOSE 5000

# Enhanced health check with retries
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { \
    if (res.statusCode === 200) { \
      console.log('Health check passed'); \
      process.exit(0); \
    } else { \
      console.log('Health check failed with status:', res.statusCode); \
      process.exit(1); \
    } \
  }).on('error', (err) => { \
    console.log('Health check error:', err.message); \
    process.exit(1); \
  })"

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application with optimized Node.js flags
CMD ["node", "--max-old-space-size=512", "--gc-interval=100", "dist/server.js"]