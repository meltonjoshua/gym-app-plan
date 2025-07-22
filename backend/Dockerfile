# Production Backend Dockerfile
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S fittracker -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=fittracker:nodejs /app/dist ./dist
COPY --from=builder --chown=fittracker:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=fittracker:nodejs /app/package*.json ./

# Create logs directory
RUN mkdir -p logs && chown -R fittracker:nodejs logs

# Switch to non-root user
USER fittracker

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
CMD ["npm", "start"]