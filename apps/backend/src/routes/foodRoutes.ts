import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  searchFoods,
  getFoodDetails,
  getFoodNutrition,
  createCustomFood,
  getUserCustomFoods,
  updateCustomFood,
  deleteCustomFood,
  getFoodCategories,
  getFoodSuggestions
} from '../controllers/foodController';

const router = Router();

// Public food search and data endpoints
router.get('/search', searchFoods);
router.get('/suggestions', getFoodSuggestions);
router.get('/categories', getFoodCategories);
router.get('/:id', getFoodDetails);
router.get('/:id/nutrition', getFoodNutrition);

// Protected custom food management endpoints
router.use(authenticate);

router.post('/custom', createCustomFood);
router.get('/custom/my-foods', getUserCustomFoods);
router.put('/custom/:id', updateCustomFood);
router.delete('/custom/:id', deleteCustomFood);

export { router as foodRoutes };
