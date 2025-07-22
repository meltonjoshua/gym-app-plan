import { Router } from 'express';

const router = Router();

// TODO: Implement nutrition routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Nutrition endpoints - TODO' });
});

export { router as nutritionRoutes };