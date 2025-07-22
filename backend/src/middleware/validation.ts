import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './errorHandler';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: (error as any).param,
      message: error.msg,
      value: (error as any).value
    }));

    return next(new AppError(`Validation failed: ${errorMessages.map(e => e.message).join(', ')}`, 400));
  }
  
  next();
};