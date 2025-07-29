import express from 'express';
import { authenticate } from '../middleware/auth';
import * as enhancedNutritionController from '../controllers/enhancedNutritionController';
import * as mealTemplateController from '../controllers/mealTemplateController';

const router = express.Router();

// Enhanced Food Logging Routes

// Batch operations
router.post('/batch-log', authenticate, enhancedNutritionController.batchLogFoods);
router.post('/log-recipe', authenticate, enhancedNutritionController.logRecipeAsMeal);

// Meal duplication
router.post('/duplicate-meal', authenticate, enhancedNutritionController.duplicateMeal);
router.post('/duplicate-day', authenticate, enhancedNutritionController.duplicateDay);

// Food Favorites Management
router.route('/favorites')
  .get(authenticate, enhancedNutritionController.getUserFavorites)
  .post(authenticate, enhancedNutritionController.addFoodToFavorites);

router.route('/favorites/:id')
  .put(authenticate, enhancedNutritionController.updateFavorite)
  .delete(authenticate, enhancedNutritionController.removeFavorite);

// Quick access and suggestions
router.get('/recent-foods', authenticate, enhancedNutritionController.getRecentFoods);
router.get('/frequent-foods', authenticate, enhancedNutritionController.getFrequentFoods);
router.get('/quick-suggestions', authenticate, enhancedNutritionController.getQuickSuggestions);

// Meal Template Routes

// Public template access (no auth required for viewing public templates)
router.get('/meal-templates/public', mealTemplateController.getPublicMealTemplates);
router.get('/meal-templates/search', mealTemplateController.searchMealTemplates);

// User-specific template management (auth required)
router.route('/meal-templates')
  .get(authenticate, mealTemplateController.getUserMealTemplates)
  .post(authenticate, mealTemplateController.createMealTemplate);

router.get('/meal-templates/most-used', authenticate, mealTemplateController.getMostUsedTemplates);
router.post('/meal-templates/from-meal', authenticate, mealTemplateController.createTemplateFromMeal);

router.route('/meal-templates/:id')
  .get(authenticate, mealTemplateController.getMealTemplate)
  .put(authenticate, mealTemplateController.updateMealTemplate)
  .delete(authenticate, mealTemplateController.deleteMealTemplate);

router.post('/meal-templates/:id/clone', authenticate, mealTemplateController.cloneMealTemplate);
router.post('/meal-templates/:id/apply', authenticate, mealTemplateController.applyMealTemplate);

export default router;
