import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AppError, asyncHandler } from './errorHandler';
import { User } from '@/models/User';
import { getRedisClient } from '@/utils/redis';
import { logger } from '@/utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: any;
  token?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'fittracker-pro',
    audience: 'fittracker-pro-users'
  } as jwt.SignOptions);
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: '30d',
    issuer: 'fittracker-pro',
    audience: 'fittracker-pro-users'
  });
};

export const verifyToken = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

export const authenticate = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // 1) Getting token and check if it exists
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  try {
    // 2) Verification token
    const decoded = await verifyToken(token);
    
    // 3) Check if token is blacklisted (for logout functionality)
    const redisClient = getRedisClient();
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    
    if (isBlacklisted) {
      return next(new AppError('Token has been revoked. Please log in again.', 401));
    }

    // 4) Check if user still exists
    const currentUser = await User.findById(decoded.userId).select('+active');
    if (!currentUser) {
      return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    // 5) Check if user is active
    if (!currentUser.active) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 401));
    }

    // 6) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('User recently changed password! Please log in again.', 401));
    }

    // Grant access to protected route
    req.user = currentUser;
    req.token = token;
    
    // Log successful authentication
    logger.debug('User authenticated successfully', {
      userId: currentUser._id,
      email: currentUser.email,
      ip: req.ip
    });
    
    next();
  } catch (error) {
    logger.error('Authentication failed:', { error, token: token?.substring(0, 20) + '...' });
    return next(new AppError('Invalid token. Please log in again!', 401));
  }
});

export const restrictTo = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Access denied. No user found.', 403));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

export const optionalAuth = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = await verifyToken(token);
      const currentUser = await User.findById(decoded.userId);
      if (currentUser && currentUser.active) {
        req.user = currentUser;
      }
    } catch (error) {
      // Token is invalid but this is optional auth, so we continue
      logger.debug('Optional auth failed, continuing without user:', error);
    }
  }

  next();
});

export const blacklistToken = async (token: string): Promise<void> => {
  try {
    const redisClient = getRedisClient();
    const decoded = await verifyToken(token);
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    
    if (expiresIn > 0) {
      await redisClient.setEx(`blacklist:${token}`, expiresIn, 'blacklisted');
    }
  } catch (error) {
    logger.error('Error blacklisting token:', error);
  }
};