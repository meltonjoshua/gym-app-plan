import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { userRoutes } from './userRoutes';
import { workoutRoutes } from './workoutRoutes';
import { nutritionRoutes } from './nutritionRoutes';
import { foodRoutes } from './foodRoutes';
import recipeRoutes from './recipeRoutes';
import mealPlanRoutes from './mealPlanRoutes';
import enhancedNutritionRoutes from './enhancedNutritionRoutes';
import { socialRoutes } from './socialRoutes';
import { trainerRoutes } from './trainerRoutes';
import { paymentRoutes } from './paymentRoutes';
import { analyticsRoutes } from './analyticsRoutes';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/workouts', workoutRoutes);
router.use('/nutrition', nutritionRoutes);
router.use('/nutrition-enhanced', enhancedNutritionRoutes);
router.use('/foods', foodRoutes);
router.use('/recipes', recipeRoutes);
router.use('/meal-plans', mealPlanRoutes);
router.use('/social', socialRoutes);
router.use('/trainers', trainerRoutes);
router.use('/payments', paymentRoutes);
router.use('/analytics', analyticsRoutes);

export { router as apiRoutes };