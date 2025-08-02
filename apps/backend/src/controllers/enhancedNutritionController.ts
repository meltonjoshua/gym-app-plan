import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// Import models
import { FoodLog } from '../models/FoodLog';
import { Food } from '../models/Food';
import { FoodFavorite } from '../models/FoodFavorite';
import { MealTemplate } from '../models/MealTemplate';
import { Recipe } from '../models/Recipe';

// Types for batch operations
interface IBatchFoodLogEntry {
  foodId: string;
  quantity: number;
  unit: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  notes?: string;
}

interface IBatchLogRequest {
  foods: IBatchFoodLogEntry[];
  date: string;
  notes?: string;
}

// Enhanced Nutrition Logging Controllers

export const batchLogFoods = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { foods, date, notes }: IBatchLogRequest = req.body;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  if (!foods || !Array.isArray(foods) || foods.length === 0) {
    return next(new AppError('Foods array is required and must not be empty', 400));
  }

  if (foods.length > 20) {
    return next(new AppError('Cannot log more than 20 foods at once', 400));
  }

  try {
    const logDate = date ? new Date(date) : new Date();
    const foodLogs = [];
    const errors = [];

    // Validate and create food logs
    for (let i = 0; i < foods.length; i++) {
      const food = foods[i];
      
      try {
        // Validate food exists
        const foodExists = await Food.findById(food.foodId);
        if (!foodExists) {
          errors.push(`Food at index ${i} not found`);
          continue;
        }

        // Create food log entry
        const foodLog = new FoodLog({
          userId,
          foodId: food.foodId,
          quantity: food.quantity,
          unit: food.unit,
          mealType: food.mealType,
          date: logDate,
          notes: food.notes,
          source: 'batch_log'
        });

        await foodLog.save();
        foodLogs.push(foodLog);

        // Update food favorite if exists
        const favorite = await FoodFavorite.findOne({ userId, foodId: food.foodId });
        if (favorite) {
          await favorite.incrementUseCount();
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Error logging food at index ${i}: ${errorMessage}`);
      }
    }

    logger.info('Batch food logging completed', {
      userId,
      totalFoods: foods.length,
      successfulLogs: foodLogs.length,
      errors: errors.length
    });

    res.status(201).json({
      status: 'success',
      data: {
        foodLogs,
        summary: {
          total: foods.length,
          successful: foodLogs.length,
          failed: errors.length,
          errors: errors.length > 0 ? errors : undefined
        }
      }
    });

  } catch (error) {
    logger.error('Batch food logging error:', error);
    return next(new AppError('Failed to log foods', 500));
  }
});

export const logRecipeAsMeal = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { recipeId, servings = 1, mealType, date, notes } = req.body;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  if (!recipeId || !mealType) {
    return next(new AppError('Recipe ID and meal type are required', 400));
  }

  try {
    const recipe = await Recipe.findById(recipeId).populate('ingredients.foodId');
    if (!recipe) {
      return next(new AppError('Recipe not found', 404));
    }

    const logDate = date ? new Date(date) : new Date();
    const foodLogs = [];

    // Log each ingredient as a separate food log entry
    for (const ingredient of recipe.ingredients) {
      const adjustedQuantity = (ingredient.quantity * servings) / recipe.servings;
      
      const foodLog = new FoodLog({
        userId,
        foodId: ingredient.foodId._id,
        quantity: adjustedQuantity,
        unit: ingredient.unit,
        mealType,
        date: logDate,
        notes: notes ? `${notes} (from recipe: ${recipe.name})` : `From recipe: ${recipe.name}`,
        source: 'recipe',
        recipeId: recipe._id,
        recipeServings: servings
      });

      await foodLog.save();
      foodLogs.push(foodLog);
    }

    // Update recipe use count
    await Recipe.findByIdAndUpdate(recipeId, { 
      $inc: { useCount: 1 },
      $set: { lastUsed: new Date() }
    });

    logger.info('Recipe logged as meal', {
      userId,
      recipeId,
      recipeServed: servings,
      ingredientsLogged: foodLogs.length
    });

    res.status(201).json({
      status: 'success',
      data: {
        foodLogs,
        recipe: {
          id: recipe._id,
          name: recipe.name,
          servings: servings
        },
        summary: {
          ingredientsLogged: foodLogs.length,
          totalServings: servings
        }
      }
    });

  } catch (error) {
    logger.error('Recipe logging error:', error);
    return next(new AppError('Failed to log recipe', 500));
  }
});

export const duplicateMeal = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { sourceDate, targetDate, mealType, newMealType } = req.body;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  if (!sourceDate || !targetDate || !mealType) {
    return next(new AppError('Source date, target date, and meal type are required', 400));
  }

  try {
    const sourceDateObj = new Date(sourceDate);
    const targetDateObj = new Date(targetDate);
    const targetMealType = newMealType || mealType;

    // Find all food logs for the specified meal
    const sourceFoodLogs = await FoodLog.find({
      userId,
      date: {
        $gte: new Date(sourceDateObj.setHours(0, 0, 0, 0)),
        $lt: new Date(sourceDateObj.setHours(23, 59, 59, 999))
      },
      mealType
    }).populate('foodId');

    if (sourceFoodLogs.length === 0) {
      return next(new AppError('No food logs found for the specified meal', 404));
    }

    // Create duplicate food logs
    const duplicatedLogs = [];
    for (const originalLog of sourceFoodLogs) {
      const duplicateLog = new FoodLog({
        userId,
        foodId: originalLog.foodId._id,
        quantity: originalLog.quantity,
        unit: originalLog.unit,
        mealType: targetMealType,
        date: targetDateObj,
        notes: originalLog.notes ? `${originalLog.notes} (duplicated)` : 'Duplicated meal',
        source: 'duplicate',
        originalLogId: originalLog._id
      });

      await duplicateLog.save();
      duplicatedLogs.push(duplicateLog);
    }

    logger.info('Meal duplicated', {
      userId,
      sourceDate: sourceDateObj,
      targetDate: targetDateObj,
      mealType,
      targetMealType,
      itemsCount: duplicatedLogs.length
    });

    res.status(201).json({
      status: 'success',
      data: {
        duplicatedLogs,
        summary: {
          sourceDate: sourceDateObj,
          targetDate: targetDateObj,
          sourceMealType: mealType,
          targetMealType,
          itemsDuplicated: duplicatedLogs.length
        }
      }
    });

  } catch (error) {
    logger.error('Meal duplication error:', error);
    return next(new AppError('Failed to duplicate meal', 500));
  }
});

export const duplicateDay = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { sourceDate, targetDate } = req.body;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  if (!sourceDate || !targetDate) {
    return next(new AppError('Source date and target date are required', 400));
  }

  try {
    const sourceDateObj = new Date(sourceDate);
    const targetDateObj = new Date(targetDate);

    // Find all food logs for the source date
    const sourceFoodLogs = await FoodLog.find({
      userId,
      date: {
        $gte: new Date(sourceDateObj.setHours(0, 0, 0, 0)),
        $lt: new Date(sourceDateObj.setHours(23, 59, 59, 999))
      }
    }).populate('foodId');

    if (sourceFoodLogs.length === 0) {
      return next(new AppError('No food logs found for the specified date', 404));
    }

    // Create duplicate food logs for entire day
    const duplicatedLogs = [];
    for (const originalLog of sourceFoodLogs) {
      const duplicateLog = new FoodLog({
        userId,
        foodId: originalLog.foodId._id,
        quantity: originalLog.quantity,
        unit: originalLog.unit,
        mealType: originalLog.mealType,
        date: targetDateObj,
        notes: originalLog.notes ? `${originalLog.notes} (duplicated day)` : 'Duplicated from another day',
        source: 'duplicate_day',
        originalLogId: originalLog._id
      });

      await duplicateLog.save();
      duplicatedLogs.push(duplicateLog);
    }

    // Group by meal type for summary
    const mealSummary: Record<string, number> = duplicatedLogs.reduce((acc, log) => {
      acc[log.mealType] = (acc[log.mealType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    logger.info('Day duplicated', {
      userId,
      sourceDate: sourceDateObj,
      targetDate: targetDateObj,
      totalItems: duplicatedLogs.length,
      mealBreakdown: mealSummary
    });

    res.status(201).json({
      status: 'success',
      data: {
        duplicatedLogs,
        summary: {
          sourceDate: sourceDateObj,
          targetDate: targetDateObj,
          totalItemsDuplicated: duplicatedLogs.length,
          mealBreakdown: mealSummary
        }
      }
    });

  } catch (error) {
    logger.error('Day duplication error:', error);
    return next(new AppError('Failed to duplicate day', 500));
  }
});

// Food Favorites Management

export const addFoodToFavorites = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { foodId, customName, defaultQuantity = 100, defaultUnit = 'g', category = 'general', notes } = req.body;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  if (!foodId) {
    return next(new AppError('Food ID is required', 400));
  }

  try {
    // Check if food exists
    const food = await Food.findById(foodId);
    if (!food) {
      return next(new AppError('Food not found', 404));
    }

    // Check if already in favorites
    const existingFavorite = await FoodFavorite.findOne({ userId, foodId });
    if (existingFavorite) {
      return next(new AppError('Food is already in favorites', 400));
    }

    const favorite = await FoodFavorite.create({
      userId,
      foodId,
      customName,
      defaultQuantity,
      defaultUnit,
      category,
      notes,
      useCount: 0
    });

    await favorite.populate('food', 'description brandName foodCategory nutritionPer100g');

    logger.info('Food added to favorites', {
      userId,
      foodId,
      customName
    });

    res.status(201).json({
      status: 'success',
      data: {
        favorite
      }
    });

  } catch (error) {
    logger.error('Add to favorites error:', error);
    return next(new AppError('Failed to add food to favorites', 500));
  }
});

export const getUserFavorites = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { category, sortBy = 'useCount' } = req.query;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  try {
    let favorites;
    
    if (sortBy === 'recent') {
      favorites = await FoodFavorite.getRecentlyUsedFavorites(userId.toString(), 50);
    } else if (sortBy === 'name') {
      favorites = await FoodFavorite.getUserFavorites(userId.toString(), category as string);
      favorites.sort((a, b) => {
        const aName = a.customName || (a as any).food?.description || '';
        const bName = b.customName || (b as any).food?.description || '';
        return aName.localeCompare(bName);
      });
    } else {
      favorites = await FoodFavorite.getUserFavorites(userId.toString(), category as string);
    }

    res.status(200).json({
      status: 'success',
      results: favorites.length,
      data: {
        favorites
      }
    });

  } catch (error) {
    logger.error('Get favorites error:', error);
    return next(new AppError('Failed to get favorites', 500));
  }
});

export const updateFavorite = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?._id;
  const updates = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid favorite ID', 400));
  }

  try {
    const favorite = await FoodFavorite.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    ).populate('food', 'description brandName foodCategory nutritionPer100g');

    if (!favorite) {
      return next(new AppError('Favorite not found', 404));
    }

    logger.info('Favorite updated', {
      userId,
      favoriteId: id,
      updates: Object.keys(updates)
    });

    res.status(200).json({
      status: 'success',
      data: {
        favorite
      }
    });

  } catch (error) {
    logger.error('Update favorite error:', error);
    return next(new AppError('Failed to update favorite', 500));
  }
});

export const removeFavorite = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid favorite ID', 400));
  }

  try {
    const favorite = await FoodFavorite.findOneAndDelete({ _id: id, userId });

    if (!favorite) {
      return next(new AppError('Favorite not found', 404));
    }

    logger.info('Favorite removed', {
      userId,
      favoriteId: id
    });

    res.status(204).json({
      status: 'success',
      data: null
    });

  } catch (error) {
    logger.error('Remove favorite error:', error);
    return next(new AppError('Failed to remove favorite', 500));
  }
});

// Quick Access and Suggestions

export const getRecentFoods = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { limit = 10 } = req.query;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  try {
    // Get recent food logs with unique foods
    const recentLogs = await FoodLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId.toString()) } },
      { $sort: { createdAt: -1 } },
      { $group: {
        _id: '$foodId',
        lastUsed: { $first: '$createdAt' },
        lastQuantity: { $first: '$quantity' },
        lastUnit: { $first: '$unit' },
        lastMealType: { $first: '$mealType' },
        useCount: { $sum: 1 }
      }},
      { $sort: { lastUsed: -1 } },
      { $limit: parseInt(limit as string) || 10 },
      { $lookup: {
        from: 'foods',
        localField: '_id',
        foreignField: '_id',
        as: 'food'
      }},
      { $unwind: '$food' }
    ]);

    res.status(200).json({
      status: 'success',
      results: recentLogs.length,
      data: {
        recentFoods: recentLogs
      }
    });

  } catch (error) {
    logger.error('Get recent foods error:', error);
    return next(new AppError('Failed to get recent foods', 500));
  }
});

export const getFrequentFoods = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { limit = 10 } = req.query;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  try {
    // Get most frequently logged foods
    const frequentLogs = await FoodLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId.toString()) } },
      { $group: {
        _id: '$foodId',
        useCount: { $sum: 1 },
        lastUsed: { $max: '$createdAt' },
        avgQuantity: { $avg: '$quantity' },
        commonUnit: { $first: '$unit' },
        commonMealType: { $first: '$mealType' }
      }},
      { $sort: { useCount: -1, lastUsed: -1 } },
      { $limit: parseInt(limit as string) || 10 },
      { $lookup: {
        from: 'foods',
        localField: '_id',
        foreignField: '_id',
        as: 'food'
      }},
      { $unwind: '$food' }
    ]);

    res.status(200).json({
      status: 'success',
      results: frequentLogs.length,
      data: {
        frequentFoods: frequentLogs
      }
    });

  } catch (error) {
    logger.error('Get frequent foods error:', error);
    return next(new AppError('Failed to get frequent foods', 500));
  }
});

export const getQuickSuggestions = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { mealType, time } = req.query;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  try {
    // Get suggestions based on meal type and time patterns
    const suggestions: {
      favorites: any[];
      recent: any[];
      popular: any[];
    } = {
      favorites: [],
      recent: [],
      popular: []
    };

    // Get favorites for this meal type
    if (mealType) {
      suggestions.favorites = await FoodFavorite.find({ 
        userId, 
        category: mealType 
      })
      .populate('food', 'description brandName nutritionPer100g')
      .sort({ useCount: -1 })
      .limit(5);
    }

    // Get recent foods
    suggestions.recent = await FoodLog.aggregate([
      { $match: { 
        userId: new mongoose.Types.ObjectId(userId.toString()),
        ...(mealType && { mealType })
      }},
      { $sort: { createdAt: -1 } },
      { $group: {
        _id: '$foodId',
        lastUsed: { $first: '$createdAt' },
        lastQuantity: { $first: '$quantity' },
        lastUnit: { $first: '$unit' }
      }},
      { $sort: { lastUsed: -1 } },
      { $limit: 5 },
      { $lookup: {
        from: 'foods',
        localField: '_id',
        foreignField: '_id',
        as: 'food'
      }},
      { $unwind: '$food' }
    ]);

    // Get popular foods for this meal type
    suggestions.popular = await FoodLog.aggregate([
      { $match: { 
        ...(mealType && { mealType }),
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      }},
      { $group: {
        _id: '$foodId',
        useCount: { $sum: 1 }
      }},
      { $sort: { useCount: -1 } },
      { $limit: 5 },
      { $lookup: {
        from: 'foods',
        localField: '_id',
        foreignField: '_id',
        as: 'food'
      }},
      { $unwind: '$food' }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        suggestions
      }
    });

  } catch (error) {
    logger.error('Get quick suggestions error:', error);
    return next(new AppError('Failed to get suggestions', 500));
  }
});
