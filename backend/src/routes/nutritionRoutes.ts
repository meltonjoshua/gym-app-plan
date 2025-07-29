import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { logFood, getNutritionLogs, deleteNutritionLog } from '../controllers/nutritionController';

const router = Router();

router.use(authenticate);

router.post('/logs', logFood);
router.get('/logs', getNutritionLogs);
router.delete('/logs/:id', deleteNutritionLog);

export { router as nutritionRoutes };