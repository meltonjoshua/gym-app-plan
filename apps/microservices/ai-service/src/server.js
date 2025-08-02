const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/ai-service.log' })
  ]
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// AI-specific rate limiting (more restrictive for compute-intensive operations)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 AI requests per windowMs
  message: {
    error: 'AI rate limit exceeded',
    message: 'Too many AI requests. AI operations are compute-intensive.'
  }
});
app.use(aiLimiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' })); // Larger limit for image uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info({
    service: 'ai-service',
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
    service: 'ai-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: ['recommendations', 'form-analysis', 'coaching', 'nutrition', 'analytics']
  });
});

// AI routes
app.use('/api/v1/ai/recommendations', require('./routes/recommendations'));
app.use('/api/v1/ai/form-analysis', require('./routes/form-analysis'));
app.use('/api/v1/ai/coaching', require('./routes/coaching'));
app.use('/api/v1/ai/nutrition', require('./routes/nutrition'));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error({
    service: 'ai-service',
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  res.status(500).json({
    error: 'AI Service Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'AI processing failed'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `AI route ${req.originalUrl} not found`,
    availableRoutes: [
      '/api/v1/ai/recommendations', 
      '/api/v1/ai/form-analysis', 
      '/api/v1/ai/coaching', 
      '/api/v1/ai/nutrition'
    ]
  });
});

app.listen(PORT, () => {
  logger.info(`🤖 AI Service running on port ${PORT}`);
  logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
});
