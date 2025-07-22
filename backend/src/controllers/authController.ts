import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User, IUser } from '@/models/User';
import { AppError, asyncHandler } from '@/middleware/errorHandler';
import { generateToken, generateRefreshToken, blacklistToken, AuthenticatedRequest } from '@/middleware/auth';
import { logger } from '@/utils/logger';
import { sendEmail } from '@/services/emailService';
import { getRedisClient } from '@/utils/redis';

const createSendToken = (user: IUser, statusCode: number, res: Response, message: string = 'Success') => {
  const token = generateToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());
  
  const cookieOptions = {
    expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN ? parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000)),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const
  };

  res.cookie('token', token, cookieOptions);
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });

  // Remove password from output
  user.password = undefined;

  logger.info('User authenticated', {
    userId: user._id,
    email: user.email,
    role: user.role,
    ip: res.req?.ip
  });

  res.status(statusCode).json({
    status: 'success',
    message,
    token,
    refreshToken,
    data: {
      user
    }
  });
};

export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, passwordConfirm, dateOfBirth, gender, height, weight, fitnessLevel, goals } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  // Create new user
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    dateOfBirth,
    gender,
    height,
    weight,
    fitnessLevel,
    goals: goals || ['general_fitness']
  });

  // Generate email verification token
  const verifyToken = newUser.createEmailVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  try {
    // Send verification email
    const verifyURL = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verifyToken}`;
    
    await sendEmail({
      email: newUser.email,
      subject: 'Welcome to FitTracker Pro! Please verify your email',
      template: 'welcome',
      data: {
        name: newUser.name,
        verifyURL,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@fittrackerpro.com'
      }
    });

    logger.info('New user registered', {
      userId: newUser._id,
      email: newUser.email,
      name: newUser.name
    });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully! Please check your email to verify your account.',
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          verified: newUser.verified
        }
      }
    });

  } catch (error) {
    // If email fails, clean up verification token
    newUser.emailVerificationToken = undefined;
    newUser.emailVerificationExpires = undefined;
    await newUser.save({ validateBeforeSave: false });

    logger.error('Failed to send verification email', { error, userId: newUser._id });
    return next(new AppError('There was an error sending the verification email. Please contact support.', 500));
  }
});

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

  if (!user) {
    logger.warn('Login attempt with non-existent email', { email, ip: req.ip });
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) Check if account is locked
  if (user.isLocked()) {
    logger.warn('Login attempt on locked account', { email, userId: user._id, ip: req.ip });
    return next(new AppError('Account temporarily locked due to too many failed login attempts. Please try again later.', 423));
  }

  // 4) Verify password
  const isPasswordCorrect = await user.correctPassword(password, user.password);
  
  if (!isPasswordCorrect) {
    logger.warn('Failed login attempt', { email, userId: user._id, ip: req.ip });
    await user.incrementLoginAttempts();
    return next(new AppError('Incorrect email or password', 401));
  }

  // 5) Check if account is active
  if (!user.active) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 401));
  }

  // 6) Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // 7) Log successful login
  logger.info('Successful login', {
    userId: user._id,
    email: user.email,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // 8) If everything ok, send token to client
  createSendToken(user, 200, res, 'Logged in successfully');
});

export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.token;
  
  if (token) {
    // Blacklist the token
    await blacklistToken(token);
    
    logger.info('User logged out', {
      userId: req.user?._id,
      email: req.user?.email
    });
  }

  // Clear cookies
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // Don't reveal whether email exists or not for security
    return res.status(200).json({
      status: 'success',
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: 'FitTracker Pro - Password Reset Request (valid for 10 minutes)',
      template: 'passwordReset',
      data: {
        name: user.name,
        resetURL,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@fittrackerpro.com'
      }
    });

    logger.info('Password reset email sent', {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to email!'
    });

  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    logger.error('Failed to send password reset email', { error, userId: user._id });
    return next(new AppError('There was an error sending the email. Try again later.', 500));
  }
});

export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  logger.info('Password reset successful', {
    userId: user._id,
    email: user.email,
    ip: req.ip
  });

  // 3) Log the user in, send JWT
  createSendToken(user, 200, res, 'Password reset successful');
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, verify email
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.verified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  logger.info('Email verified successfully', {
    userId: user._id,
    email: user.email,
    ip: req.ip
  });

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully!'
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
    
    if (decoded.type !== 'refresh') {
      return next(new AppError('Invalid refresh token', 401));
    }

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.active) {
      return next(new AppError('User no longer exists', 401));
    }

    // Generate new tokens
    const newToken = generateToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    logger.info('Token refreshed', {
      userId: user._id,
      email: user.email
    });

    res.status(200).json({
      status: 'success',
      token: newToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    return next(new AppError('Invalid refresh token', 401));
  }
});

export const updatePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  logger.info('Password updated', {
    userId: user._id,
    email: user.email,
    ip: req.ip
  });

  // 4) Log user in, send JWT
  createSendToken(user, 200, res, 'Password updated successfully');
});