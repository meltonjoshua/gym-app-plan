import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';
import cluster from 'cluster';
import os from 'os';

// Performance optimization imports
import CacheService from './services/CacheService';
import { OptimizedDatabaseConfig } from './config/OptimizedDatabaseConfig';
import performanceMiddleware, { createPerformanceDashboard, createHealthCheck } from './middleware/performanceMiddleware';
import cacheMiddleware, { CacheConfigs, CacheWarmer } from './middleware/cacheMiddleware';

// Existing imports
import { connectDatabase } from './utils/database';
import { connectRedis } from './utils/redis';
import { setupSocketHandlers } from './services/socketService';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { apiRoutes } from './routes';
import { trackApiRequest } from './middleware/analyticsMiddleware';

// Load environment variables
dotenv.config();

/**
 * Optimized Server Configuration
 * Phase 14B: Performance Optimization Implementation
 */

const ENABLE_CLUSTERING = process.env.ENABLE_CLUSTERING === 'true';
const NUM_WORKERS = parseInt(process.env.NUM_WORKERS || '0') || os.cpus().length;

/**
 * Setup clustering for multi-core performance
 */
if (ENABLE_CLUSTERING && cluster.isPrimary) {
  console.log(`🚀 Master process ${process.pid} starting ${NUM_WORKERS} workers...`);
  
  // Fork workers
  for (let i = 0; i < NUM_WORKERS; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`💀 Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
    console.log('🔄 Starting a new worker...');
    cluster.fork();
  });
  
  // Graceful shutdown of all workers
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down workers...');
    for (const id in cluster.workers) {
      cluster.workers[id]?.kill();
    }
  });
} else {
  // Worker process or single process mode
  startWorker();
}

async function startWorker() {
  const app = express();
  const server = createServer(app);
  const io = new SocketServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    },
    // Socket.IO performance optimizations
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
  });

  const PORT = process.env.PORT || 5000;

  // Initialize performance monitoring (before other middleware)
  app.use(performanceMiddleware());

  // Security middleware with performance optimizations
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // Enhanced rate limiting with memory store
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks and monitoring
      return req.path === '/health' || req.path === '/metrics';
    }
  });
  app.use('/api/', limiter);

  // AI-specific rate limiting (more restrictive)
  const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 AI requests per minute
    message: 'AI request limit exceeded. Please wait before making more AI requests.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/v1/ai/', aiLimiter);

  // CORS configuration
  app.use(cors({
    origin: function (origin, callback) {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));

  // High-performance compression
  app.use(compression({
    level: 6, // Balanced compression level
    threshold: 1024, // Only compress files larger than 1KB
    filter: (req, res) => {
      // Don't compress images or already compressed files
      const contentType = res.getHeader('content-type');
      if (typeof contentType === 'string') {
        return !contentType.includes('image/') && !contentType.includes('video/');
      }
      return true;
    }
  }));

  // Request parsing with size limits
  app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf, encoding) => {
      // Add request validation if needed
      if (buf && buf.length) {
        (req as any).rawBody = buf;
      }
    }
  }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Performance monitoring dashboard (admin only)
  app.get('/metrics', createPerformanceDashboard());
  app.get('/health', createHealthCheck());

  // Enhanced health check with performance metrics
  app.get('/health/detailed', async (req, res) => {
    const cache = CacheService.getInstance();
    const cacheHealth = await cache.healthCheck();
    const dbConfig = OptimizedDatabaseConfig.getInstance();
    const dbStats = await dbConfig.getConnectionStats();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      worker: cluster.worker?.id || 'single',
      cache: cacheHealth,
      database: dbStats,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    });
  });

  // Analytics tracking for all API requests
  app.use('/api/', trackApiRequest('navigation'));

  // Apply caching to specific routes for better performance
  app.use('/api/v1/exercises', CacheConfigs.exerciseLibrary);
  app.use('/api/v1/workouts', CacheConfigs.userWorkouts);
  app.use('/api/v1/ai/recommendations', CacheConfigs.workoutRecommendations);
  app.use('/api/v1/nutrition', CacheConfigs.nutritionData);
  app.use('/api/v1/config', CacheConfigs.systemConfig);

  // API routes
  app.use('/api/v1', apiRoutes);

  // Socket.IO setup with performance optimizations
  setupSocketHandlers(io);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  // 404 handler with caching
  app.use('*', cacheMiddleware({ ttl: 3600 }), (req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested resource was not found on this server.',
      timestamp: new Date().toISOString()
    });
  });

  // Graceful shutdown with cleanup
  async function gracefulShutdown(signal: string) {
    logger.info(`${signal} received. Shutting down gracefully...`);
    
    // Stop accepting new connections
    server.close(() => {
      logger.info('HTTP server closed');
    });

    try {
      // Cleanup cache
      const cache = CacheService.getInstance();
      await cache.shutdown();
      
      // Cleanup database connections
      const dbConfig = OptimizedDatabaseConfig.getInstance();
      await dbConfig.closeAllConnections();
      
      logger.info('Cleanup completed. Process terminated');
      process.exit(0);
    } catch (error) {
      logger.error('Error during cleanup:', error);
      process.exit(1);
    }
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Start server with optimizations
  async function startOptimizedServer() {
    try {
      // Initialize cache service
      const cache = CacheService.getInstance();
      await cache.initialize();
      logger.info('✅ Cache service initialized');

      // Initialize optimized database configuration
      const dbConfig = OptimizedDatabaseConfig.getInstance();
      await dbConfig.initialize();
      logger.info('✅ Optimized database configuration initialized');

      // Connect to database with connection pooling
      await connectDatabase();
      logger.info('✅ Database connected with optimization');

      // Connect to Redis
      await connectRedis();
      logger.info('✅ Redis connected successfully');

      // Warm cache with frequently accessed data
      const cacheWarmer = new CacheWarmer();
      await cacheWarmer.warmCache();
      logger.info('✅ Cache warming completed');

      // Start HTTP server
      server.listen(PORT, () => {
        const workerId = cluster.worker?.id ? ` (Worker ${cluster.worker.id})` : '';
        logger.info(`🚀 FitTracker Pro Backend Server running on port ${PORT}${workerId}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`Health check: http://localhost:${PORT}/health`);
        logger.info(`Performance metrics: http://localhost:${PORT}/metrics`);
        logger.info(`Process ID: ${process.pid}`);
        
        // Log performance targets
        logger.info('📈 Performance targets: <100ms API response, <1s AI analysis, 100+ concurrent users');
      });

      // Set up periodic cleanup
      setInterval(() => {
        // Clean up old performance metrics
        const monitor = require('./middleware/performanceMiddleware').performanceMonitor;
        monitor.clearOldMetrics(24); // Keep last 24 hours
        
        // Force garbage collection if enabled
        if (global.gc) {
          global.gc();
        }
      }, 60 * 60 * 1000); // Every hour

    } catch (error) {
      logger.error('❌ Failed to start optimized server:', error);
      process.exit(1);
    }
  }

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });

  // Start the optimized server
  await startOptimizedServer();

  return { app, io, server };
}

export default startWorker;
