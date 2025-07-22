import { Router } from 'express';

const router = Router();

// TODO: Implement payment routes with Stripe
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Payment endpoints - TODO' });
});

export { router as paymentRoutes };