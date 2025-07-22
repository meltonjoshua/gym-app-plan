import { Router } from 'express';

const router = Router();

// TODO: Implement trainer routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Trainer marketplace endpoints - TODO' });
});

export { router as trainerRoutes };