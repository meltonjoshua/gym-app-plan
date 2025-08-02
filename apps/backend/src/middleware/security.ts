import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
// import xss from 'xss-clean'; // Deprecated package, using custom sanitization
import hpp from 'hpp';
import cors from 'cors';
import compression from 'compression';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { User } from '../models/User';
import { SecurityAuditLog } from '../models/SecurityAuditLog';

// Custom XSS protection since xss-clean is deprecated
const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  
  next();
};

const logger = {
  warn: (message: string, data?: any) => console.warn(`[WARN] ${message}`, data),
  error: (message: string, data?: any) => console.error(`[ERROR] ${message}`, data),
  info: (message: string, data?: any) => console.info(`[INFO] ${message}`, data)
};

// Advanced Security Configuration
export class SecurityMiddleware {
  
  // Comprehensive Helmet Configuration
  static helmetConfig = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.openai.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: { policy: "require-corp" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
  });

  // Advanced Rate Limiting
  static createRateLimit = (windowMs: number, max: number, message: string) => {
    return rateLimit({
      windowMs,
      max,
      message: { error: message },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Skip rate limiting for health checks and monitoring
        return req.path === '/health' || req.path === '/metrics';
      },
      keyGenerator: (req) => {
        // Use IP + User Agent for more accurate rate limiting
        return `${req.ip}-${req.get('User-Agent') || 'unknown'}`;
      },
      handler: async (req, res) => {
        await SecurityMiddleware.logSecurityEvent({
          type: 'RATE_LIMIT_EXCEEDED',
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
          timestamp: new Date(),
        });
        res.status(429).json({ error: message });
      }
    });
  };

  // Authentication Rate Limits
  static authRateLimit = SecurityMiddleware.createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // 5 attempts
    'Too many authentication attempts, please try again later'
  );

  static generalRateLimit = SecurityMiddleware.createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests
    'Too many requests, please try again later'
  );

  static apiRateLimit = SecurityMiddleware.createRateLimit(
    1 * 60 * 1000, // 1 minute
    60, // 60 requests per minute
    'API rate limit exceeded'
  );

  // CORS Configuration with Security
  static corsConfig = cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'https://fittracker.app',
        'https://www.fittracker.app',
        'https://admin.fittracker.app'
      ];
      
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
      'X-CSRF-Token'
    ],
    exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining']
  });

  // Input Sanitization and Validation
  static sanitizeInput = [
    mongoSanitize(), // Prevent NoSQL injection
    xssProtection, // Clean user input from malicious HTML
    hpp({ // Prevent HTTP Parameter Pollution
      whitelist: ['sort', 'fields', 'page', 'limit', 'category']
    })
  ];

  // JWT Token Security
  static verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Check if user exists and is active
      const user = await User.findById(decoded.userId).select('-password');
      if (!user || !user.active) {
        await SecurityMiddleware.logSecurityEvent({
          type: 'INVALID_TOKEN_ACCESS',
          userId: decoded.userId,
          ip: req.ip,
          timestamp: new Date(),
        });
        return res.status(401).json({ error: 'Invalid token or user deactivated.' });
      }

      // Check if password was changed after token was issued
      if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
        return res.status(401).json({ error: 'Password was changed. Please log in again.' });
      }

      req.user = user;
      next();
    } catch (error) {
      await SecurityMiddleware.logSecurityEvent({
        type: 'TOKEN_VERIFICATION_FAILED',
        ip: req.ip,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      });
      res.status(401).json({ error: 'Invalid token.' });
    }
  };

  // Two-Factor Authentication
  static generate2FASecret = async (userId: string, email: string) => {
    const secret = speakeasy.generateSecret({
      name: `FitTracker (${email})`,
      issuer: 'FitTracker Pro',
      length: 32
    });

    // Store secret in user document (encrypted)
    await User.findByIdAndUpdate(userId, {
      twoFactorSecret: secret.base32,
      twoFactorEnabled: false // Will be enabled after verification
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
    
    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32
    };
  };

  static verify2FA = (token: string, secret: string): boolean => {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps (60 seconds) tolerance
    });
  };

  static require2FA = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (user?.twoFactorEnabled) {
      const token = req.header('X-2FA-Token');
      
      if (!token) {
        return res.status(401).json({ 
          error: 'Two-factor authentication required',
          requiresTwoFactor: true 
        });
      }

      const isValid = SecurityMiddleware.verify2FA(token, user.twoFactorSecret);
      
      if (!isValid) {
        await SecurityMiddleware.logSecurityEvent({
          type: 'INVALID_2FA_ATTEMPT',
          userId: user._id,
          ip: req.ip,
          timestamp: new Date(),
        });
        return res.status(401).json({ error: 'Invalid two-factor authentication code' });
      }
    }
    
    next();
  };

  // Role-Based Access Control
  static requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = req.user;
      
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      next();
    };
  };

  // Security Audit Logging
  static logSecurityEvent = async (event: {
    type: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
    path?: string;
    error?: string;
    timestamp: Date;
  }) => {
    try {
      await SecurityAuditLog.create(event);
      logger.warn('Security Event', event);
    } catch (error) {
      logger.error('Failed to log security event:', error);
    }
  };

  // Request Logging Middleware
  static requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logData = {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        statusCode: res.statusCode,
        duration,
        timestamp: new Date(),
        userId: req.user?._id
      };

      // Log suspicious activity
      if (res.statusCode >= 400 || duration > 5000) {
        SecurityMiddleware.logSecurityEvent({
          type: 'SUSPICIOUS_REQUEST',
          ...logData
        });
      }
    });
    
    next();
  };

  // Password Security Validation
  static validatePassword = [
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  ];

  // Email Validation
  static validateEmail = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
  ];

  // Generic Validation Error Handler
  static handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  };

  // Session Security
  static sessionConfig = {
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict' as const
    },
    name: 'sessionId' // Change default session name
  };

  // Compression with Security
  static compressionConfig = compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      // Don't compress responses with this request header
      if (req.headers['x-no-compression']) {
        return false;
      }
      // Use compression filter function
      return compression.filter(req, res);
    }
  });
}

// Validation schemas for common operations
export const ValidationSchemas = {
  registration: [
    SecurityMiddleware.validateEmail,
    SecurityMiddleware.validatePassword,
    body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
    body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
    SecurityMiddleware.handleValidationErrors
  ],

  login: [
    SecurityMiddleware.validateEmail,
    body('password').notEmpty().withMessage('Password is required'),
    SecurityMiddleware.handleValidationErrors
  ],

  passwordReset: [
    SecurityMiddleware.validatePassword,
    body('token').notEmpty().withMessage('Reset token is required'),
    SecurityMiddleware.handleValidationErrors
  ],

  profileUpdate: [
    body('firstName').optional().trim().isLength({ min: 1 }),
    body('lastName').optional().trim().isLength({ min: 1 }),
    body('email').optional().isEmail().normalizeEmail(),
    SecurityMiddleware.handleValidationErrors
  ]
};

export default SecurityMiddleware;
