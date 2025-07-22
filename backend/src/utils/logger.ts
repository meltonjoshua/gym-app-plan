import winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

// Create the logger
export const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { 
    service: 'fittracker-pro-backend',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: isProduction ? logFormat : consoleFormat,
      silent: process.env.NODE_ENV === 'test'
    }),
    
    // File transports for production
    ...(isProduction ? [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: logFormat
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: logFormat
      })
    ] : [])
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: 'logs/exceptions.log',
      format: logFormat
    })
  ],
  
  rejectionHandlers: [
    new winston.transports.File({
      filename: 'logs/rejections.log',
      format: logFormat
    })
  ]
});

// Performance logging helper
export const logPerformance = (operation: string, startTime: number) => {
  const duration = Date.now() - startTime;
  logger.debug(`Performance: ${operation} completed in ${duration}ms`);
};

// Request logging helper
export const logRequest = (method: string, url: string, statusCode: number, duration: number, userId?: string) => {
  logger.info('HTTP Request', {
    method,
    url,
    statusCode,
    duration,
    userId: userId || 'anonymous',
    timestamp: new Date().toISOString()
  });
};