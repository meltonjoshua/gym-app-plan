import { Router } from 'express';

const router = Router();

// TODO: Implement social routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Social endpoints - TODO' });
});

export { router as socialRoutes };