import { Request, Response } from 'express';
import { MealPlanModel, IMealPlan } from '../models/MealPlan';
import { RecipeModel } from '../models/Recipe';
import { AuthenticatedRequest } from '../middleware/auth';

export const mealPlanController = {
  // Create a new meal plan
  createMealPlan: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        name,
        description,
        startDate,
        endDate,
        isTemplate = false,
        isPublic = false,
        templateCategory,
        weeklyNutritionGoals,
        dietaryPreferences,
        allergens
      } = req.body;

      // Validate required fields
      if (!name || !startDate || !endDate) {
        return res.status(400).json({
          message: 'Missing required fields: name, startDate, endDate'
        });
      }

      // Validate date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        return res.status(400).json({
          message: 'Start date must be before end date'
        });
      }

      // Generate days array
      const days = [];
      const currentDate = new Date(start);
      
      while (currentDate <= end) {
        days.push({
          date: new Date(currentDate),
          meals: [],
          actualNutrition: {
            calories: 0,
            protein: 0,
            carbohydrates: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0
          }
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const mealPlan = new MealPlanModel({
        name,
        description,
        userId: req.user._id,
        startDate: start,
        endDate: end,
        days,
        isTemplate,
        isPublic,
        templateCategory,
        weeklyNutritionGoals,
        dietaryPreferences: dietaryPreferences || [],
        allergens: allergens || []
      });

      const savedMealPlan = await mealPlan.save();

      res.status(201).json({
        message: 'Meal plan created successfully',
        mealPlan: savedMealPlan
      });
    } catch (error) {
      console.error('Error creating meal plan:', error);
      res.status(500).json({ 
        message: 'Error creating meal plan',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get user's meal plans
  getUserMealPlans: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { page = 1, limit = 20, isTemplate, active } = req.query;
      
      const filter: any = {
        userId: req.user._id,
        isTemplate: isTemplate === 'true' ? true : isTemplate === 'false' ? false : undefined
      };

      // Filter for active meal plans (current date within plan range)
      if (active === 'true') {
        const now = new Date();
        filter.startDate = { $lte: now };
        filter.endDate = { $gte: now };
      }

      // Remove undefined values
      Object.keys(filter).forEach(key => filter[key] === undefined && delete filter[key]);

      const mealPlans = await MealPlanModel.find(filter)
        .sort({ startDate: -1 })
        .limit(parseInt(limit as string))
        .skip((parseInt(page as string) - 1) * parseInt(limit as string))
        .populate('days.meals.recipeId', 'name category difficulty nutritionPerServing');
      
      const total = await MealPlanModel.countDocuments(filter);

      res.json({
        mealPlans,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error('Error getting meal plans:', error);
      res.status(500).json({ 
        message: 'Error getting meal plans',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Search public meal plan templates
  searchMealPlanTemplates: async (req: Request, res: Response) => {
    try {
      const { 
        q: search, 
        category, 
        dietaryPreferences,
        page = 1, 
        limit = 20 
      } = req.query;
      
      const options = {
        isTemplate: true,
        isPublic: true,
        templateCategory: category as string,
        dietaryPreferences: dietaryPreferences ? (dietaryPreferences as string).split(',') : undefined,
        limit: parseInt(limit as string),
        skip: (parseInt(page as string) - 1) * parseInt(limit as string)
      };

      const mealPlans = await MealPlanModel.searchMealPlans(search as string || '', options);
      
      const filter: any = { isTemplate: true, isPublic: true };
      if (category) filter.templateCategory = category;
      if (dietaryPreferences) {
        filter.dietaryPreferences = { $in: (dietaryPreferences as string).split(',') };
      }
      
      const total = await MealPlanModel.countDocuments(filter);

      res.json({
        mealPlans,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error('Error searching meal plan templates:', error);
      res.status(500).json({ 
        message: 'Error searching meal plan templates',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get meal plan by ID
  getMealPlan: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      const mealPlan = await MealPlanModel.findById(id)
        .populate('days.meals.recipeId', 'name description category difficulty nutritionPerServing ingredients instructions');

      if (!mealPlan) {
        return res.status(404).json({ message: 'Meal plan not found' });
      }

      // Check access permissions
      if (!mealPlan.isPublic && mealPlan.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json({ mealPlan });
    } catch (error) {
      console.error('Error getting meal plan:', error);
      res.status(500).json({ 
        message: 'Error getting meal plan',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Update meal plan
  updateMealPlan: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const mealPlan = await MealPlanModel.findById(id);
      if (!mealPlan) {
        return res.status(404).json({ message: 'Meal plan not found' });
      }

      // Check ownership
      if (mealPlan.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Validate date changes if provided
      if (updateData.startDate || updateData.endDate) {
        const startDate = updateData.startDate ? new Date(updateData.startDate) : mealPlan.startDate;
        const endDate = updateData.endDate ? new Date(updateData.endDate) : mealPlan.endDate;
        
        if (startDate >= endDate) {
          return res.status(400).json({
            message: 'Start date must be before end date'
          });
        }
      }

      Object.assign(mealPlan, updateData);
      const updatedMealPlan = await mealPlan.save();

      res.json({
        message: 'Meal plan updated successfully',
        mealPlan: updatedMealPlan
      });
    } catch (error) {
      console.error('Error updating meal plan:', error);
      res.status(500).json({ 
        message: 'Error updating meal plan',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Delete meal plan
  deleteMealPlan: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      const mealPlan = await MealPlanModel.findById(id);
      if (!mealPlan) {
        return res.status(404).json({ message: 'Meal plan not found' });
      }

      // Check ownership
      if (mealPlan.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await MealPlanModel.findByIdAndDelete(id);

      res.json({ message: 'Meal plan deleted successfully' });
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      res.status(500).json({ 
        message: 'Error deleting meal plan',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Add meal to specific day
  addMealToDay: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { date, meal } = req.body;

      // Validate meal data
      if (!date || !meal || !meal.mealType || !meal.servings) {
        return res.status(400).json({
          message: 'Missing required fields: date, meal.mealType, meal.servings'
        });
      }

      // Validate recipe exists if recipeId provided
      if (meal.recipeId) {
        const recipe = await RecipeModel.findById(meal.recipeId);
        if (!recipe) {
          return res.status(400).json({ message: 'Recipe not found' });
        }
      }

      const mealPlan = await MealPlanModel.findById(id);
      if (!mealPlan) {
        return res.status(404).json({ message: 'Meal plan not found' });
      }

      // Check ownership
      if (mealPlan.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Add meal to day
      await mealPlan.addMealToDay(new Date(date), {
        mealType: meal.mealType,
        recipeId: meal.recipeId,
        customMeal: meal.customMeal,
        servings: meal.servings,
        notes: meal.notes,
        isCompleted: false
      });

      await mealPlan.populate('days.meals.recipeId', 'name nutritionPerServing');

      res.json({
        message: 'Meal added successfully',
        mealPlan
      });
    } catch (error) {
      console.error('Error adding meal to day:', error);
      res.status(500).json({ 
        message: 'Error adding meal to day',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Mark meal as completed
  markMealComplete: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { date, mealIndex } = req.body;

      if (!date || mealIndex === undefined) {
        return res.status(400).json({
          message: 'Missing required fields: date, mealIndex'
        });
      }

      const mealPlan = await MealPlanModel.findById(id);
      if (!mealPlan) {
        return res.status(404).json({ message: 'Meal plan not found' });
      }

      // Check ownership
      if (mealPlan.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await mealPlan.markMealComplete(new Date(date), parseInt(mealIndex));

      res.json({
        message: 'Meal marked as complete',
        completionRate: mealPlan.getCompletionRate()
      });
    } catch (error) {
      console.error('Error marking meal complete:', error);
      res.status(500).json({ 
        message: 'Error marking meal complete',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Generate shopping list for meal plan
  generateShoppingList: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      const mealPlan = await MealPlanModel.findById(id);
      if (!mealPlan) {
        return res.status(404).json({ message: 'Meal plan not found' });
      }

      // Check ownership
      if (mealPlan.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const shoppingList = await mealPlan.generateShoppingList();

      res.json({
        message: 'Shopping list generated successfully',
        shoppingList,
        totalItems: shoppingList.length,
        lastGenerated: mealPlan.lastShoppingListGenerated
      });
    } catch (error) {
      console.error('Error generating shopping list:', error);
      res.status(500).json({ 
        message: 'Error generating shopping list',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get meal plan statistics
  getMealPlanStats: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      const mealPlan = await MealPlanModel.findById(id)
        .populate('days.meals.recipeId', 'name nutritionPerServing');

      if (!mealPlan) {
        return res.status(404).json({ message: 'Meal plan not found' });
      }

      // Check access permissions
      if (!mealPlan.isPublic && mealPlan.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Calculate statistics
      await mealPlan.calculatePlanNutrition();

      const totalDays = mealPlan.days.length;
      const completionRate = mealPlan.getCompletionRate();
      
      // Calculate average daily nutrition
      const avgDailyNutrition = {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0
      };

      if (totalDays > 0) {
        mealPlan.days.forEach(day => {
          if (day.actualNutrition) {
            avgDailyNutrition.calories += day.actualNutrition.calories;
            avgDailyNutrition.protein += day.actualNutrition.protein;
            avgDailyNutrition.carbohydrates += day.actualNutrition.carbohydrates;
            avgDailyNutrition.fat += day.actualNutrition.fat;
            avgDailyNutrition.fiber += day.actualNutrition.fiber;
            avgDailyNutrition.sugar += day.actualNutrition.sugar;
            avgDailyNutrition.sodium += day.actualNutrition.sodium;
          }
        });

        Object.keys(avgDailyNutrition).forEach(key => {
          avgDailyNutrition[key as keyof typeof avgDailyNutrition] = Math.round(
            (avgDailyNutrition[key as keyof typeof avgDailyNutrition] / totalDays) * 10
          ) / 10;
        });
      }

      // Count meals by type
      const mealTypeCount = {
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        snack: 0
      };

      mealPlan.days.forEach(day => {
        day.meals.forEach(meal => {
          mealTypeCount[meal.mealType]++;
        });
      });

      res.json({
        stats: {
          totalDays,
          completionRate,
          avgDailyNutrition,
          mealTypeCount,
          totalMeals: Object.values(mealTypeCount).reduce((sum, count) => sum + count, 0),
          lastShoppingListGenerated: mealPlan.lastShoppingListGenerated
        }
      });
    } catch (error) {
      console.error('Error getting meal plan stats:', error);
      res.status(500).json({ 
        message: 'Error getting meal plan statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Clone meal plan template
  cloneMealPlanTemplate: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { startDate, endDate, name } = req.body;

      if (!startDate || !endDate) {
        return res.status(400).json({
          message: 'Missing required fields: startDate, endDate'
        });
      }

      const template = await MealPlanModel.findById(id);
      if (!template || !template.isTemplate || !template.isPublic) {
        return res.status(404).json({ message: 'Template not found or not accessible' });
      }

      // Calculate duration difference
      const templateDuration = template.endDate.getTime() - template.startDate.getTime();
      const newStart = new Date(startDate);
      const newEnd = endDate ? new Date(endDate) : new Date(newStart.getTime() + templateDuration);

      // Generate new days array
      const days: any[] = [];
      const currentDate = new Date(newStart);
      
      while (currentDate <= newEnd) {
        days.push({
          date: new Date(currentDate),
          meals: [],
          actualNutrition: {
            calories: 0,
            protein: 0,
            carbohydrates: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0
          }
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Copy meals from template (cycling if different duration)
      const templateDays = template.days.length;
      days.forEach((day, index) => {
        const templateDayIndex = index % templateDays;
        const templateDay = template.days[templateDayIndex];
        
        if (templateDay) {
          day.meals = templateDay.meals.map(meal => ({
            mealType: meal.mealType,
            recipeId: meal.recipeId,
            customMeal: meal.customMeal,
            servings: meal.servings,
            notes: meal.notes,
            isCompleted: false,
            completedAt: undefined
          }));
        }
      });

      const clonedMealPlan = new MealPlanModel({
        name: name || `${template.name} (Copy)`,
        description: template.description,
        userId: req.user._id,
        startDate: newStart,
        endDate: newEnd,
        days,
        isTemplate: false,
        isPublic: false,
        weeklyNutritionGoals: template.weeklyNutritionGoals,
        dietaryPreferences: template.dietaryPreferences,
        allergens: template.allergens
      });

      await clonedMealPlan.calculatePlanNutrition();
      const savedMealPlan = await clonedMealPlan.save();

      // Increment usage count on template
      template.timesUsed += 1;
      await template.save();

      res.status(201).json({
        message: 'Meal plan created from template successfully',
        mealPlan: savedMealPlan
      });
    } catch (error) {
      console.error('Error cloning meal plan template:', error);
      res.status(500).json({ 
        message: 'Error cloning meal plan template',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
