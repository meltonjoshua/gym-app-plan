import express from 'express';
import { mealPlanController } from '../controllers/mealPlanController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes (no authentication required)
// Search public meal plan templates
router.get('/templates/search', mealPlanController.searchMealPlanTemplates);

// Protected routes (authentication required)
// Create a new meal plan
router.post('/', authenticate, mealPlanController.createMealPlan);

// Get user's meal plans
router.get('/my-plans', authenticate, mealPlanController.getUserMealPlans);

// Clone meal plan from template
router.post('/templates/:id/clone', authenticate, mealPlanController.cloneMealPlanTemplate);

// Get meal plan by ID (handles both public templates and private plans)
router.get('/:id', authenticate, mealPlanController.getMealPlan);

// Update meal plan
router.put('/:id', authenticate, mealPlanController.updateMealPlan);

// Delete meal plan
router.delete('/:id', authenticate, mealPlanController.deleteMealPlan);

// Add meal to specific day
router.post('/:id/meals', authenticate, mealPlanController.addMealToDay);

// Mark meal as completed
router.post('/:id/complete-meal', authenticate, mealPlanController.markMealComplete);

// Generate shopping list for meal plan
router.get('/:id/shopping-list', authenticate, mealPlanController.generateShoppingList);

// Get meal plan statistics
router.get('/:id/stats', authenticate, mealPlanController.getMealPlanStats);

export default router;
