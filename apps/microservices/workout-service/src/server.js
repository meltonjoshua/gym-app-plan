const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/workout-service.log' })
  ]
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: {
    error: 'Too many workout requests',
    message: 'Rate limit exceeded for workout operations.'
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info({
    service: 'workout-service',
    method: req.method,
    url: req.url,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'workout-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: ['exercises', 'routines', 'tracking', 'analytics']
  });
});

// Workout routes
app.use('/api/v1/workouts', require('./routes/workouts'));
app.use('/api/v1/exercises', require('./routes/exercises'));
app.use('/api/v1/routines', require('./routes/routines'));
app.use('/api/v1/tracking', require('./routes/tracking'));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error({
    service: 'workout-service',
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: ['/api/v1/workouts', '/api/v1/exercises', '/api/v1/routines', '/api/v1/tracking']
  });
});

app.listen(PORT, () => {
  logger.info(`💪 Workout Service running on port ${PORT}`);
  logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
});
