import { Router } from 'express';
import { body } from 'express-validator';
import * as paymentController from '../controllers/paymentController';
import * as subscriptionController from '../controllers/subscriptionController';
import { authenticate } from '../middleware/auth';
import { rateLimit } from 'express-rate-limit';

const router = Router();

// Rate limiting for payment endpoints
const paymentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 payment requests per windowMs
  message: 'Too many payment requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Webhook endpoint (no auth required)
router.post('/webhook', 
  paymentController.handleStripeWebhook
);

// Payment Intent Routes
router.post('/create-payment-intent',
  authenticate,
  paymentRateLimit,
  [
    body('amount').isInt({ min: 1 }).withMessage('Amount must be a positive integer'),
    body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    body('description').optional().isString().withMessage('Description must be a string')
  ],
  paymentController.createPaymentIntent
);

router.post('/confirm-payment',
  authenticate,
  paymentRateLimit,
  [
    body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required')
  ],
  paymentController.confirmPayment
);

// Subscription Management Routes
router.post('/subscriptions',
  authenticate,
  paymentRateLimit,
  [
    body('plan').isIn(['premium', 'pro']).withMessage('Plan must be premium or pro'),
    body('billing').optional().isIn(['monthly', 'yearly']).withMessage('Billing must be monthly or yearly'),
    body('trialDays').optional().isInt({ min: 0, max: 30 }).withMessage('Trial days must be between 0 and 30')
  ],
  subscriptionController.createSubscription
);

router.get('/subscriptions/current',
  authenticate,
  subscriptionController.getCurrentSubscription
);

router.patch('/subscriptions/:subscriptionId',
  authenticate,
  [
    body('plan').optional().isIn(['premium', 'pro']).withMessage('Plan must be premium or pro'),
    body('billing').optional().isIn(['monthly', 'yearly']).withMessage('Billing must be monthly or yearly')
  ],
  subscriptionController.updateSubscription
);

router.delete('/subscriptions/:subscriptionId',
  authenticate,
  subscriptionController.cancelSubscription
);

router.post('/subscriptions/:subscriptionId/reactivate',
  authenticate,
  subscriptionController.reactivateSubscription
);

// Payment History Routes
router.get('/transactions',
  authenticate,
  paymentController.getPaymentHistory
);

router.get('/transactions/:transactionId',
  authenticate,
  paymentController.getPaymentTransaction
);

// Invoice Routes
router.get('/invoices',
  authenticate,
  paymentController.getInvoices
);

router.get('/invoices/:invoiceId',
  authenticate,
  paymentController.getInvoice
);

router.get('/invoices/:invoiceId/download',
  authenticate,
  paymentController.downloadInvoice
);

// Customer Portal
router.post('/customer-portal',
  authenticate,
  paymentController.createCustomerPortalSession
);

// Subscription Plans and Pricing
router.get('/plans',
  paymentController.getSubscriptionPlans
);

router.get('/pricing',
  paymentController.getPricing
);

export { router as paymentRoutes };