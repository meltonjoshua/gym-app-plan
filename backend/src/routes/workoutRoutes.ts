import { Router } from 'express';

const router = Router();

// TODO: Implement workout routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Workout endpoints - TODO' });
});

export { router as workoutRoutes };