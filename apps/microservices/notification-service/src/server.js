const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3004;

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/notification-service.log' })
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
  max: 300, // limit each IP to 300 notification requests per windowMs
  message: {
    error: 'Too many notification requests',
    message: 'Rate limit exceeded for notification operations.'
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info({
    service: 'notification-service',
    method: req.method,
    url: req.url,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  next();
});

// Socket.IO connection handling
let connectedUsers = new Map();

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined with socket ${socket.id}`);
  });
  
  socket.on('disconnect', () => {
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'notification-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: ['push-notifications', 'email', 'real-time', 'webhooks'],
    connectedClients: connectedUsers.size
  });
});

// Make io available to routes
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// Notification routes
app.use('/api/v1/notifications', require('./routes/notifications'));
app.use('/api/v1/push', require('./routes/push'));
app.use('/api/v1/email', require('./routes/email'));
app.use('/api/v1/realtime', require('./routes/realtime'));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error({
    service: 'notification-service',
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  res.status(500).json({
    error: 'Notification Service Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Notification failed'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Notification route ${req.originalUrl} not found`,
    availableRoutes: ['/api/v1/notifications', '/api/v1/push', '/api/v1/email', '/api/v1/realtime']
  });
});

server.listen(PORT, () => {
  logger.info(`🔔 Notification Service running on port ${PORT}`);
  logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
  logger.info(`🌐 WebSocket server ready for real-time notifications`);
});
