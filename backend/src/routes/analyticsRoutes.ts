import { Router } from 'express';

const router = Router();

// TODO: Implement analytics routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Analytics endpoints - TODO' });
});

export { router as analyticsRoutes };