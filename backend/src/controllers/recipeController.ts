import { Request, Response } from 'express';
import { RecipeModel, IRecipe } from '../models/Recipe';
import { Food } from '../models/Food';
import { AuthenticatedRequest } from '../middleware/auth';

export const recipeController = {
  // Create a new recipe
  createRecipe: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        name,
        description,
        category,
        cuisine,
        servings,
        prepTime,
        cookTime,
        difficulty,
        ingredients,
        instructions,
        imageUrl,
        tags,
        isPublic = false
      } = req.body;

      // Validate required fields
      if (!name || !category || !servings || !difficulty || !ingredients || !instructions) {
        return res.status(400).json({
          message: 'Missing required fields: name, category, servings, difficulty, ingredients, instructions'
        });
      }

      // Validate ingredients exist
      const foodIds = ingredients.map((ing: any) => ing.foodId);
      const foods = await Food.find({ _id: { $in: foodIds } });
      
      if (foods.length !== foodIds.length) {
        return res.status(400).json({
          message: 'One or more food items not found'
        });
      }

      // Validate instructions have proper step numbers
      instructions.sort((a: any, b: any) => a.stepNumber - b.stepNumber);
      const expectedSteps = instructions.map((_: any, index: number) => index + 1);
      const actualSteps = instructions.map((inst: any) => inst.stepNumber);
      
      if (!actualSteps.every((step: number, index: number) => step === expectedSteps[index])) {
        return res.status(400).json({
          message: 'Instructions must have consecutive step numbers starting from 1'
        });
      }

      const recipe = new RecipeModel({
        name,
        description,
        category,
        cuisine,
        servings,
        prepTime,
        cookTime,
        difficulty,
        ingredients,
        instructions,
        imageUrl,
        tags: tags || [],
        userId: req.user._id,
        isPublic,
        nutritionPerServing: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
        nutritionTotal: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
      });

      // Save will trigger nutrition calculation via pre-save middleware
      const savedRecipe = await recipe.save();
      
      await savedRecipe.populate('ingredients.foodId', 'description brandName');

      res.status(201).json({
        message: 'Recipe created successfully',
        recipe: savedRecipe
      });
    } catch (error) {
      console.error('Error creating recipe:', error);
      res.status(500).json({ 
        message: 'Error creating recipe',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get user's recipes
  getUserRecipes: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { category, difficulty, search, page = 1, limit = 20 } = req.query;
      
      const options = {
        userId: req.user._id,
        isPublic: false, // Only user's private recipes
        category: category as string,
        difficulty: difficulty as string,
        limit: parseInt(limit as string),
        skip: (parseInt(page as string) - 1) * parseInt(limit as string)
      };

      const recipes = await RecipeModel.searchRecipes(search as string || '', options);
      
      const total = await RecipeModel.countDocuments({
        userId: req.user._id,
        isPublic: false,
        ...(category && { category }),
        ...(difficulty && { difficulty })
      });

      res.json({
        recipes,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error('Error getting user recipes:', error);
      res.status(500).json({ 
        message: 'Error getting recipes',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Search public recipes
  searchPublicRecipes: async (req: Request, res: Response) => {
    try {
      const { 
        q: search, 
        category, 
        difficulty, 
        cuisine,
        maxTime,
        minRating,
        page = 1, 
        limit = 20 
      } = req.query;
      
      const options = {
        isPublic: true,
        category: category as string,
        difficulty: difficulty as string,
        cuisine: cuisine as string,
        maxTime: maxTime ? parseInt(maxTime as string) : undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        limit: parseInt(limit as string),
        skip: (parseInt(page as string) - 1) * parseInt(limit as string)
      };

      const recipes = await RecipeModel.searchRecipes(search as string || '', options);
      
      const filter: any = { isPublic: true };
      if (category) filter.category = category;
      if (difficulty) filter.difficulty = difficulty;
      if (cuisine) filter.cuisine = cuisine;
      if (maxTime) filter.totalTime = { $lte: parseInt(maxTime as string) };
      if (minRating) filter.avgRating = { $gte: parseFloat(minRating as string) };
      
      const total = await RecipeModel.countDocuments(filter);

      res.json({
        recipes,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error('Error searching public recipes:', error);
      res.status(500).json({ 
        message: 'Error searching recipes',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get recipe by ID
  getRecipe: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      const recipe = await RecipeModel.findById(id)
        .populate('ingredients.foodId', 'description brandName fdcId source');

      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      // Check access permissions
      if (!recipe.isPublic && recipe.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json({ recipe });
    } catch (error) {
      console.error('Error getting recipe:', error);
      res.status(500).json({ 
        message: 'Error getting recipe',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Update recipe
  updateRecipe: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const recipe = await RecipeModel.findById(id);
      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      // Check ownership
      if (recipe.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Validate ingredients if being updated
      if (updateData.ingredients) {
        const foodIds = updateData.ingredients.map((ing: any) => ing.foodId);
        const foods = await Food.find({ _id: { $in: foodIds } });
        
        if (foods.length !== foodIds.length) {
          return res.status(400).json({
            message: 'One or more food items not found'
          });
        }
      }

      // Validate instructions if being updated
      if (updateData.instructions) {
        updateData.instructions.sort((a: any, b: any) => a.stepNumber - b.stepNumber);
        const expectedSteps = updateData.instructions.map((_: any, index: number) => index + 1);
        const actualSteps = updateData.instructions.map((inst: any) => inst.stepNumber);
        
        if (!actualSteps.every((step: number, index: number) => step === expectedSteps[index])) {
          return res.status(400).json({
            message: 'Instructions must have consecutive step numbers starting from 1'
          });
        }
      }

      Object.assign(recipe, updateData);
      const updatedRecipe = await recipe.save();
      
      await updatedRecipe.populate('ingredients.foodId', 'description brandName');

      res.json({
        message: 'Recipe updated successfully',
        recipe: updatedRecipe
      });
    } catch (error) {
      console.error('Error updating recipe:', error);
      res.status(500).json({ 
        message: 'Error updating recipe',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Delete recipe
  deleteRecipe: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      const recipe = await RecipeModel.findById(id);
      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      // Check ownership
      if (recipe.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await RecipeModel.findByIdAndDelete(id);

      res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
      console.error('Error deleting recipe:', error);
      res.status(500).json({ 
        message: 'Error deleting recipe',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Mark recipe as made
  markRecipeAsMade: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      const recipe = await RecipeModel.findById(id);
      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      // Check access permissions
      if (!recipe.isPublic && recipe.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await recipe.incrementTimesMade();

      res.json({
        message: 'Recipe marked as made',
        timesMade: recipe.timesMade,
        lastMade: recipe.lastMade
      });
    } catch (error) {
      console.error('Error marking recipe as made:', error);
      res.status(500).json({ 
        message: 'Error marking recipe as made',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Rate recipe
  rateRecipe: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { rating } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ 
          message: 'Rating must be between 1 and 5' 
        });
      }

      const recipe = await RecipeModel.findById(id);
      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      // Check access permissions
      if (!recipe.isPublic && recipe.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Simple rating update (in production, you'd want to track individual user ratings)
      const currentTotal = (recipe.avgRating || 0) * recipe.ratingCount;
      const newTotal = currentTotal + rating;
      const newCount = recipe.ratingCount + 1;
      
      recipe.avgRating = Math.round((newTotal / newCount) * 10) / 10;
      recipe.ratingCount = newCount;
      
      await recipe.save();

      res.json({
        message: 'Recipe rated successfully',
        avgRating: recipe.avgRating,
        ratingCount: recipe.ratingCount
      });
    } catch (error) {
      console.error('Error rating recipe:', error);
      res.status(500).json({ 
        message: 'Error rating recipe',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get recipe nutrition for different serving sizes
  getRecipeNutrition: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { servings } = req.query;

      const recipe = await RecipeModel.findById(id);
      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      if (!servings) {
        return res.json({
          originalServings: recipe.servings,
          nutritionPerServing: recipe.nutritionPerServing,
          nutritionTotal: recipe.nutritionTotal
        });
      }

      const requestedServings = parseFloat(servings as string);
      if (requestedServings <= 0) {
        return res.status(400).json({ message: 'Servings must be greater than 0' });
      }

      // Calculate nutrition for requested servings
      const multiplier = requestedServings / recipe.servings;
      
      const adjustedNutrition = Object.keys(recipe.nutritionTotal).reduce((acc, key) => {
        const value = (recipe.nutritionTotal as any)[key];
        acc[key] = Math.round((value * multiplier) * 10) / 10;
        return acc;
      }, {} as any);

      const nutritionPerServing = Object.keys(adjustedNutrition).reduce((acc, key) => {
        acc[key] = Math.round((adjustedNutrition[key] / requestedServings) * 10) / 10;
        return acc;
      }, {} as any);

      res.json({
        originalServings: recipe.servings,
        requestedServings,
        nutritionPerServing,
        nutritionTotal: adjustedNutrition
      });
    } catch (error) {
      console.error('Error calculating recipe nutrition:', error);
      res.status(500).json({ 
        message: 'Error calculating nutrition',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get popular recipes
  getPopularRecipes: async (req: Request, res: Response) => {
    try {
      const { category, limit = 10 } = req.query;

      const filter: any = { isPublic: true };
      if (category) filter.category = category;

      const recipes = await RecipeModel.find(filter)
        .sort({ timesMade: -1, avgRating: -1 })
        .limit(parseInt(limit as string))
        .populate('ingredients.foodId', 'description brandName')
        .select('-searchTerms');

      res.json({ recipes });
    } catch (error) {
      console.error('Error getting popular recipes:', error);
      res.status(500).json({ 
        message: 'Error getting popular recipes',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
