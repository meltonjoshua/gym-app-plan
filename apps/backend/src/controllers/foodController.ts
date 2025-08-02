import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Food, FoodModel, IFood } from '../models/Food';
import { usdaFoodDataService } from '../services/usdaFoodDataService';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

// Food Search Controllers

export const searchFoods = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { 
    q: query, 
    category, 
    dataType, 
    source = 'all',
    limit = 20, 
    skip = 0 
  } = req.query;

  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return next(new AppError('Search query must be at least 2 characters long', 400));
  }

  const searchLimit = Math.min(parseInt(limit as string) || 20, 50);
  const searchSkip = parseInt(skip as string) || 0;

  try {
    let foods: IFood[] = [];
    let total = 0;
    let sources: string[] = [];

    // Search local database first
    if (source === 'all' || source === 'local') {
      const localResults = await FoodModel.searchFoods(query.trim(), {
        category,
        dataType,
        limit: searchLimit,
        skip: searchSkip
      });

      foods = foods.concat(localResults);
      sources.push('local');
    }

    // Search USDA database if needed and available
    if ((source === 'all' || source === 'usda') && foods.length < searchLimit) {
      try {
        const usdaResults = await usdaFoodDataService.searchFoods({
          query: query.trim(),
          dataType: dataType ? [dataType as string] : undefined,
          pageSize: searchLimit - foods.length,
          pageNumber: 1
        });

        // Convert USDA results to our format and add to results
        const transformedFoods = usdaResults.foods.map(food => ({
          _id: `usda:${food.fdcId}`,
          fdcId: food.fdcId,
          description: food.description,
          brandName: food.brandName,
          brandOwner: food.brandOwner,
          foodCategory: food.foodCategory,
          dataType: food.dataType,
          isCustom: false,
          isVerified: true,
          searchCount: 0,
          source: 'usda'
        }));

        foods = foods.concat(transformedFoods as any);
        total = usdaResults.totalHits;
        sources.push('usda');
      } catch (error) {
        logger.warn('USDA search failed, using local results only:', error);
      }
    }

    // Update search counts for local foods
    const localFoodIds = foods
      .filter(food => food._id && typeof food._id === 'object')
      .map(food => food._id);
    
    if (localFoodIds.length > 0) {
      await Food.updateMany(
        { _id: { $in: localFoodIds } },
        { 
          $inc: { searchCount: 1 },
          $set: { lastSearched: new Date() }
        }
      );
    }

    res.status(200).json({
      status: 'success',
      results: foods.length,
      total,
      sources,
      data: {
        foods: foods.slice(0, searchLimit)
      }
    });

  } catch (error) {
    logger.error('Food search error:', error);
    return next(new AppError('Food search failed', 500));
  }
});

export const getFoodDetails = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    let food: IFood | null = null;

    // Check if it's a USDA ID
    if (id.startsWith('usda:')) {
      const fdcId = parseInt(id.replace('usda:', ''));
      
      // First check if we have it locally
      food = await Food.findOne({ fdcId });
      
      if (!food) {
        // Fetch from USDA and cache locally
        const usdaFood = await usdaFoodDataService.getFoodDetails(fdcId);
        const foodData = usdaFoodDataService.transformToFoodModel(usdaFood);
        
        // Save to local database for future use
        food = await Food.create(foodData);
      }
    } else {
      // Local MongoDB ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError('Invalid food ID', 400));
      }
      
      food = await Food.findById(id);
    }

    if (!food) {
      return next(new AppError('Food not found', 404));
    }

    // Increment search count
    await food.incrementSearchCount();

    res.status(200).json({
      status: 'success',
      data: {
        food
      }
    });

  } catch (error) {
    logger.error('Get food details error:', error);
    return next(new AppError('Failed to get food details', 500));
  }
});

export const getFoodNutrition = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { quantity = 100, unit = 'g' } = req.query;

  const food = await Food.findById(id);
  if (!food) {
    return next(new AppError('Food not found', 404));
  }

  const quantityNum = parseFloat(quantity as string);
  if (isNaN(quantityNum) || quantityNum <= 0) {
    return next(new AppError('Invalid quantity', 400));
  }

  const nutrition = food.getNutritionForQuantity(quantityNum, unit as string);

  res.status(200).json({
    status: 'success',
    data: {
      food: {
        id: food._id,
        description: food.description,
        brandName: food.brandName
      },
      quantity: quantityNum,
      unit,
      nutrition
    }
  });
});

// Custom Food Management

export const createCustomFood = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const {
    description,
    brandName,
    foodCategory,
    nutritionPer100g,
    servingSizes,
    ingredients
  } = req.body;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  if (!description || !nutritionPer100g) {
    return next(new AppError('Description and nutrition data are required', 400));
  }

  const customFood = await Food.create({
    description,
    brandName,
    foodCategory,
    dataType: 'custom',
    nutritionPer100g,
    servingSizes: servingSizes || [],
    searchTerms: description.toLowerCase().split(/\s+/),
    ingredients: ingredients || [],
    userId,
    isCustom: true,
    isVerified: false
  });

  logger.info('Custom food created', {
    userId,
    foodId: customFood._id,
    description: customFood.description
  });

  res.status(201).json({
    status: 'success',
    data: {
      food: customFood
    }
  });
});

export const getUserCustomFoods = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const foods = await Food.find({ userId, isCustom: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Food.countDocuments({ userId, isCustom: true });

  res.status(200).json({
    status: 'success',
    results: foods.length,
    totalResults: total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      foods
    }
  });
});

export const updateCustomFood = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?._id;
  const updates = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid food ID', 400));
  }

  const food = await Food.findOneAndUpdate(
    { _id: id, userId, isCustom: true },
    updates,
    { new: true, runValidators: true }
  );

  if (!food) {
    return next(new AppError('Custom food not found or unauthorized', 404));
  }

  logger.info('Custom food updated', {
    userId,
    foodId: food._id,
    updates: Object.keys(updates)
  });

  res.status(200).json({
    status: 'success',
    data: {
      food
    }
  });
});

export const deleteCustomFood = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid food ID', 400));
  }

  const food = await Food.findOneAndDelete({ _id: id, userId, isCustom: true });

  if (!food) {
    return next(new AppError('Custom food not found or unauthorized', 404));
  }

  logger.info('Custom food deleted', {
    userId,
    foodId: id
  });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Food Categories and Autocomplete

export const getFoodCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const categories = await Food.distinct('foodCategory');
  
  res.status(200).json({
    status: 'success',
    data: {
      categories: categories.filter(cat => cat).sort()
    }
  });
});

export const getFoodSuggestions = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { q: query, limit = 10 } = req.query;

  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return res.status(200).json({
      status: 'success',
      data: { suggestions: [] }
    });
  }

  const suggestions = await Food.find(
    { $text: { $search: query.trim() } },
    { 
      description: 1,
      brandName: 1,
      score: { $meta: 'textScore' }
    }
  )
  .sort({ score: { $meta: 'textScore' }, searchCount: -1 })
  .limit(parseInt(limit as string) || 10)
  .lean();

  const formattedSuggestions = suggestions.map(food => ({
    id: food._id,
    text: food.brandName ? `${food.description} (${food.brandName})` : food.description,
    description: food.description,
    brandName: food.brandName
  }));

  res.status(200).json({
    status: 'success',
    data: {
      suggestions: formattedSuggestions
    }
  });
});
