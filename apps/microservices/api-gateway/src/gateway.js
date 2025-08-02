const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/gateway.log' })
  ]
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.'
  }
});
app.use(globalLimiter);

// Request logging middleware
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Service configuration
const services = {
  userService: {
    target: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    healthCheck: '/health'
  },
  workoutService: {
    target: process.env.WORKOUT_SERVICE_URL || 'http://localhost:3002',
    healthCheck: '/health'
  },
  aiService: {
    target: process.env.AI_SERVICE_URL || 'http://localhost:3003',
    healthCheck: '/health'
  },
  notificationService: {
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
    healthCheck: '/health'
  }
};

// API Gateway health check
app.get('/health', async (req, res) => {
  const serviceHealth = {};
  
  // Check health of all services
  for (const [serviceName, config] of Object.entries(services)) {
    try {
      // TODO: Implement actual health checks
      serviceHealth[serviceName] = 'healthy';
    } catch (error) {
      serviceHealth[serviceName] = 'unhealthy';
    }
  }
  
  res.json({
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: serviceHealth
  });
});

// Proxy configuration for User Service
app.use('/api/v1/users', createProxyMiddleware({
  target: services.userService.target,
  changeOrigin: true,
  onError: (err, req, res) => {
    logger.error('User Service Proxy Error:', err);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'User service is currently unavailable'
    });
  }
}));

app.use('/api/v1/auth', createProxyMiddleware({
  target: services.userService.target,
  changeOrigin: true,
  onError: (err, req, res) => {
    logger.error('Auth Service Proxy Error:', err);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Authentication service is currently unavailable'
    });
  }
}));

app.use('/api/v1/profiles', createProxyMiddleware({
  target: services.userService.target,
  changeOrigin: true,
  onError: (err, req, res) => {
    logger.error('Profile Service Proxy Error:', err);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Profile service is currently unavailable'
    });
  }
}));

// Proxy configuration for Workout Service
app.use('/api/v1/workouts', createProxyMiddleware({
  target: services.workoutService.target,
  changeOrigin: true,
  onError: (err, req, res) => {
    logger.error('Workout Service Proxy Error:', err);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Workout service is currently unavailable'
    });
  }
}));

// Proxy configuration for AI Service
app.use('/api/v1/ai', createProxyMiddleware({
  target: services.aiService.target,
  changeOrigin: true,
  onError: (err, req, res) => {
    logger.error('AI Service Proxy Error:', err);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'AI service is currently unavailable'
    });
  }
}));

// Proxy configuration for Notification Service
app.use('/api/v1/notifications', createProxyMiddleware({
  target: services.notificationService.target,
  changeOrigin: true,
  onError: (err, req, res) => {
    logger.error('Notification Service Proxy Error:', err);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Notification service is currently unavailable'
    });
  }
}));

// Proxy configuration for Notification Service
app.use('/api/v1/notifications', createProxyMiddleware({
  target: services.notificationService.target,
  changeOrigin: true,
  onError: (err, req, res) => {
    logger.error('Notification Service Proxy Error:', err);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Notification service is currently unavailable'
    });
  }
}));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/api/v1/users',
      '/api/v1/auth',
      '/api/v1/profiles',
      '/api/v1/workouts',
      '/api/v1/ai',
      '/api/v1/notifications'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Gateway Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong in the API Gateway'
  });
});

app.listen(PORT, () => {
  logger.info(`🌐 API Gateway running on port ${PORT}`);
  logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
  logger.info('🔗 Service routes configured:');
  logger.info('  - /api/v1/users -> User Service');
  logger.info('  - /api/v1/auth -> User Service');
  logger.info('  - /api/v1/profiles -> User Service');
  logger.info('  - /api/v1/workouts -> Workout Service');
  logger.info('  - /api/v1/ai -> AI Service');
  logger.info('  - /api/v1/notifications -> Notification Service');
});
