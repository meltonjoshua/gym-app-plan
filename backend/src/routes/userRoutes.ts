import { Router } from 'express';

const router = Router();

// TODO: Implement user routes
router.get('/profile', (req, res) => {
  res.status(200).json({ message: 'User profile endpoint - TODO' });
});

export { router as userRoutes };