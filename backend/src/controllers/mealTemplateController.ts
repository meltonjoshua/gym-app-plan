import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// Import models
import { MealTemplate } from '../models/MealTemplate';
import { FoodLog } from '../models/FoodLog';
import { Food } from '../models/Food';

// Meal Template Controllers

export const createMealTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { name, description, mealType, foods, isPublic = false, tags = [] } = req.body;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  if (!name || !mealType || !foods || !Array.isArray(foods) || foods.length === 0) {
    return next(new AppError('Name, meal type, and foods array are required', 400));
  }

  try {
    // Validate all foods exist
    const foodIds = foods.map(f => f.foodId);
    const validFoods = await Food.find({ _id: { $in: foodIds } });
    
    if (validFoods.length !== foodIds.length) {
      return next(new AppError('One or more foods not found', 400));
    }

    const mealTemplate = await MealTemplate.create({
      userId,
      name,
      description,
      mealType,
      foods,
      isPublic,
      tags: tags.map((tag: string) => tag.toLowerCase().trim())
    });

    await mealTemplate.populate('foods.foodId', 'description brandName nutritionPer100g');

    logger.info('Meal template created', {
      userId,
      templateId: mealTemplate._id,
      name,
      mealType,
      foodsCount: foods.length
    });

    res.status(201).json({
      status: 'success',
      data: {
        mealTemplate
      }
    });

  } catch (error) {
    logger.error('Create meal template error:', error);
    return next(new AppError('Failed to create meal template', 500));
  }
});

export const getUserMealTemplates = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { mealType, sortBy = 'useCount' } = req.query;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  try {
    let templates;

    if (sortBy === 'recent') {
      templates = await MealTemplate.find({ 
        userId,
        ...(mealType && mealType !== 'all' && { mealType })
      })
      .populate('foods.foodId', 'description brandName nutritionPer100g')
      .sort({ lastUsed: -1, createdAt: -1 });
    } else if (sortBy === 'name') {
      templates = await MealTemplate.find({ 
        userId,
        ...(mealType && mealType !== 'all' && { mealType })
      })
      .populate('foods.foodId', 'description brandName nutritionPer100g')
      .sort({ name: 1 });
    } else {
      templates = await MealTemplate.getUserTemplates(userId.toString(), mealType as string);
    }

    res.status(200).json({
      status: 'success',
      results: templates.length,
      data: {
        mealTemplates: templates
      }
    });

  } catch (error) {
    logger.error('Get user meal templates error:', error);
    return next(new AppError('Failed to get meal templates', 500));
  }
});

export const getPublicMealTemplates = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { mealType, limit = 20, search } = req.query;

  try {
    let templates;

    if (search) {
      templates = await MealTemplate.searchTemplates(search as string);
    } else {
      templates = await MealTemplate.getPublicTemplates(mealType as string, parseInt(limit as string));
    }

    res.status(200).json({
      status: 'success',
      results: templates.length,
      data: {
        mealTemplates: templates
      }
    });

  } catch (error) {
    logger.error('Get public meal templates error:', error);
    return next(new AppError('Failed to get public meal templates', 500));
  }
});

export const getMealTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid template ID', 400));
  }

  try {
    const template = await MealTemplate.findById(id)
      .populate('foods.foodId', 'description brandName nutritionPer100g servingSizes')
      .populate('userId', 'username');

    if (!template) {
      return next(new AppError('Meal template not found', 404));
    }

    // Check if user can access this template
    if (!template.isPublic && template.userId._id.toString() !== userId?.toString()) {
      return next(new AppError('Access denied', 403));
    }

    res.status(200).json({
      status: 'success',
      data: {
        mealTemplate: template
      }
    });

  } catch (error) {
    logger.error('Get meal template error:', error);
    return next(new AppError('Failed to get meal template', 500));
  }
});

export const updateMealTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?._id;
  const updates = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid template ID', 400));
  }

  try {
    const template = await MealTemplate.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    ).populate('foods.foodId', 'description brandName nutritionPer100g');

    if (!template) {
      return next(new AppError('Meal template not found or unauthorized', 404));
    }

    logger.info('Meal template updated', {
      userId,
      templateId: id,
      updates: Object.keys(updates)
    });

    res.status(200).json({
      status: 'success',
      data: {
        mealTemplate: template
      }
    });

  } catch (error) {
    logger.error('Update meal template error:', error);
    return next(new AppError('Failed to update meal template', 500));
  }
});

export const deleteMealTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid template ID', 400));
  }

  try {
    const template = await MealTemplate.findOneAndDelete({ _id: id, userId });

    if (!template) {
      return next(new AppError('Meal template not found or unauthorized', 404));
    }

    logger.info('Meal template deleted', {
      userId,
      templateId: id,
      templateName: template.name
    });

    res.status(204).json({
      status: 'success',
      data: null
    });

  } catch (error) {
    logger.error('Delete meal template error:', error);
    return next(new AppError('Failed to delete meal template', 500));
  }
});

export const cloneMealTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?._id;
  const { name, isPublic = false } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid template ID', 400));
  }

  try {
    const originalTemplate = await MealTemplate.findById(id);

    if (!originalTemplate) {
      return next(new AppError('Template not found', 404));
    }

    // Check if user can access this template
    if (!originalTemplate.isPublic && originalTemplate.userId.toString() !== userId?.toString()) {
      return next(new AppError('Access denied', 403));
    }

    // Create cloned template
    const clonedTemplate = await MealTemplate.create({
      userId,
      name: name || `${originalTemplate.name} (Copy)`,
      description: originalTemplate.description,
      mealType: originalTemplate.mealType,
      foods: originalTemplate.foods,
      isPublic,
      tags: originalTemplate.tags
    });

    await clonedTemplate.populate('foods.foodId', 'description brandName nutritionPer100g');

    // Increment use count of original template
    await originalTemplate.incrementUseCount();

    logger.info('Meal template cloned', {
      userId,
      originalTemplateId: id,
      clonedTemplateId: clonedTemplate._id,
      newName: clonedTemplate.name
    });

    res.status(201).json({
      status: 'success',
      data: {
        mealTemplate: clonedTemplate
      }
    });

  } catch (error) {
    logger.error('Clone meal template error:', error);
    return next(new AppError('Failed to clone meal template', 500));
  }
});

export const applyMealTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?._id;
  const { date, mealType: targetMealType } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid template ID', 400));
  }

  if (!date) {
    return next(new AppError('Date is required', 400));
  }

  try {
    const template = await MealTemplate.findById(id);

    if (!template) {
      return next(new AppError('Template not found', 404));
    }

    // Check if user can access this template
    if (!template.isPublic && template.userId.toString() !== userId?.toString()) {
      return next(new AppError('Access denied', 403));
    }

    const targetDate = new Date(date);
    const finalMealType = targetMealType || template.mealType;

    // Create food log entries from template
    const foodLogEntries = template.foods.map(food => ({
      userId,
      foodId: food.foodId,
      quantity: food.quantity,
      unit: food.unit,
      mealType: finalMealType,
      date: targetDate,
      notes: food.notes ? `${food.notes} (from template: ${template.name})` : `From template: ${template.name}`,
      source: 'template',
      templateId: template._id
    }));

    // Create all food logs
    const createdLogs = await FoodLog.insertMany(foodLogEntries);

    // Increment template use count
    await template.incrementUseCount();

    logger.info('Meal template applied', {
      userId,
      templateId: id,
      date: targetDate,
      mealType: finalMealType,
      itemsCreated: createdLogs.length
    });

    res.status(201).json({
      status: 'success',
      data: {
        foodLogs: createdLogs,
        template: {
          id: template._id,
          name: template.name,
          mealType: template.mealType
        },
        summary: {
          appliedDate: targetDate,
          appliedMealType: finalMealType,
          itemsCreated: createdLogs.length
        }
      }
    });

  } catch (error) {
    logger.error('Apply meal template error:', error);
    return next(new AppError('Failed to apply meal template', 500));
  }
});

export const createTemplateFromMeal = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { date, mealType, name, description, isPublic = false, tags = [] } = req.body;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  if (!date || !mealType || !name) {
    return next(new AppError('Date, meal type, and name are required', 400));
  }

  try {
    const sourceDate = new Date(date);

    // Find all food logs for the specified meal
    const foodLogs = await FoodLog.find({
      userId,
      date: {
        $gte: new Date(sourceDate.setHours(0, 0, 0, 0)),
        $lt: new Date(sourceDate.setHours(23, 59, 59, 999))
      },
      mealType
    });

    if (foodLogs.length === 0) {
      return next(new AppError('No food logs found for the specified meal', 404));
    }

    // Convert food logs to template foods
    const templateFoods = foodLogs.map((log: any) => ({
      foodId: log.foodId,
      quantity: log.quantity,
      unit: log.unit,
      notes: log.notes
    }));

    // Create meal template
    const mealTemplate = await MealTemplate.create({
      userId,
      name,
      description,
      mealType,
      foods: templateFoods,
      isPublic,
      tags: tags.map((tag: string) => tag.toLowerCase().trim())
    });

    await mealTemplate.populate('foods.foodId', 'description brandName nutritionPer100g');

    logger.info('Meal template created from existing meal', {
      userId,
      sourceDate,
      sourceMealType: mealType,
      templateId: mealTemplate._id,
      name,
      itemsCount: templateFoods.length
    });

    res.status(201).json({
      status: 'success',
      data: {
        mealTemplate
      }
    });

  } catch (error) {
    logger.error('Create template from meal error:', error);
    return next(new AppError('Failed to create template from meal', 500));
  }
});

export const getMostUsedTemplates = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { limit = 10 } = req.query;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  try {
    const templates = await MealTemplate.getMostUsedTemplates(userId.toString(), parseInt(limit as string));

    res.status(200).json({
      status: 'success',
      results: templates.length,
      data: {
        mealTemplates: templates
      }
    });

  } catch (error) {
    logger.error('Get most used templates error:', error);
    return next(new AppError('Failed to get most used templates', 500));
  }
});

export const searchMealTemplates = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { q: query, includeOwn = true } = req.query;

  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return next(new AppError('Search query must be at least 2 characters long', 400));
  }

  try {
    const searchUserId = includeOwn === 'true' ? userId?.toString() : undefined;
    const templates = await MealTemplate.searchTemplates(query.trim(), searchUserId);

    res.status(200).json({
      status: 'success',
      results: templates.length,
      data: {
        mealTemplates: templates
      }
    });

  } catch (error) {
    logger.error('Search meal templates error:', error);
    return next(new AppError('Failed to search meal templates', 500));
  }
});
