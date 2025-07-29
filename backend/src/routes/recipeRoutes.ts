import express from 'express';
import { recipeController } from '../controllers/recipeController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes (no authentication required)
// Search public recipes
router.get('/search', recipeController.searchPublicRecipes);

// Get popular recipes
router.get('/popular', recipeController.getPopularRecipes);

// Get recipe nutrition for different servings (public recipes only need recipe ID)
router.get('/:id/nutrition', recipeController.getRecipeNutrition);

// Protected routes (authentication required)
// Create a new recipe
router.post('/', authenticate, recipeController.createRecipe);

// Get user's recipes
router.get('/my-recipes', authenticate, recipeController.getUserRecipes);

// Get recipe by ID (handles both public and private access)
router.get('/:id', authenticate, recipeController.getRecipe);

// Update recipe
router.put('/:id', authenticate, recipeController.updateRecipe);

// Delete recipe
router.delete('/:id', authenticate, recipeController.deleteRecipe);

// Mark recipe as made
router.post('/:id/made', authenticate, recipeController.markRecipeAsMade);

// Rate recipe
router.post('/:id/rate', authenticate, recipeController.rateRecipe);

export default router;
