import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { NutritionLog } from '../models/NutritionLog';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export const logFood = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { foodName, calories, protein, carbs, fat, quantity, unit, mealType, loggedAt, notes } = req.body;

  if (!userId) return next(new AppError('User not authenticated', 401));

  const log = await NutritionLog.create({
    userId,
    foodName,
    calories,
    protein,
    carbs,
    fat,
    quantity,
    unit,
    mealType,
    loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
    notes
  });

  res.status(201).json({ status: 'success', data: { log } });
});

export const getNutritionLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { startDate, endDate, mealType } = req.query;
  if (!userId) return next(new AppError('User not authenticated', 401));

  const filter: any = { userId };
  if (mealType) filter.mealType = mealType;
  if (startDate || endDate) {
    filter.loggedAt = {};
    if (startDate) filter.loggedAt.$gte = new Date(startDate as string);
    if (endDate) filter.loggedAt.$lte = new Date(endDate as string);
  }

  const logs = await NutritionLog.find(filter).sort({ loggedAt: -1 });
  res.status(200).json({ status: 'success', results: logs.length, data: { logs } });
});

export const deleteNutritionLog = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { id } = req.params;
  if (!userId) return next(new AppError('User not authenticated', 401));
  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError('Invalid log ID', 400));

  const log = await NutritionLog.findOneAndDelete({ _id: id, userId });
  if (!log) return next(new AppError('Log not found or unauthorized', 404));

  res.status(204).json({ status: 'success', data: null });
});
