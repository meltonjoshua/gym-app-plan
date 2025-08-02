import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Subscription, { SubscriptionPlan, SubscriptionStatus } from '../models/Subscription';
import PaymentTransaction, { TransactionType, TransactionStatus, PaymentMethod } from '../models/PaymentTransaction';
import { User } from '../models/User';
import { stripeService } from '../services/stripeService';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import { logger } from '../utils/logger';

/**
 * Handle Stripe webhooks
 */
export const handleStripeWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const sig = req.headers['stripe-signature'];
  
  if (!sig) {
    return next(new AppError('No Stripe signature found', 400));
  }

  try {
    const event = await stripeService.constructWebhookEvent(req.body, sig as string);
    
    logger.info(`Received Stripe webhook: ${event.type}`, { eventId: event.id });

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await stripeService.handleSubscriptionUpdate(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await stripeService.handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await stripeService.handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await stripeService.handlePaymentFailed(event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        await stripeService.handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await stripeService.handlePaymentIntentFailed(event.data.object);
        break;
      
      default:
        logger.warn(`Unhandled Stripe webhook event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    logger.error('Stripe webhook error', { error: error.message });
    return next(new AppError('Webhook error', 400));
  }
});

/**
 * Create payment intent for one-time payments
 */
export const createPaymentIntent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { amount, currency = 'usd', description } = req.body;
  const userId = req.user!.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Create or get Stripe customer
    const stripeCustomer = await stripeService.createOrGetCustomer(user);
    
    // Create payment intent
    const paymentIntent = await stripeService.createPaymentIntent(
      amount,
      currency,
      stripeCustomer.id,
      description
    );

    // Create transaction record
    const transaction = new PaymentTransaction({
      userId,
      stripePaymentIntentId: paymentIntent.id,
      type: TransactionType.ONE_TIME,
      status: TransactionStatus.PENDING,
      amount,
      currency,
      description: description || 'One-time payment',
      paymentMethod: PaymentMethod.CARD,
      metadata: {
        source: 'app',
        createdVia: 'payment_intent'
      }
    });

    await transaction.save();

    res.status(201).json({
      status: 'success',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        transactionId: transaction._id
      }
    });

  } catch (error: any) {
    logger.error('Failed to create payment intent', {
      userId,
      amount,
      currency,
      error: error.message
    });
    return next(new AppError('Failed to create payment intent', 500));
  }
});

/**
 * Confirm payment completion
 */
export const confirmPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { paymentIntentId } = req.body;
  const userId = req.user!.id;

  try {
    // Get payment intent from Stripe
    const paymentIntent = await stripeService.getPaymentIntent(paymentIntentId);
    
    // Find corresponding transaction
    const transaction = await PaymentTransaction.findOne({
      stripePaymentIntentId: paymentIntentId,
      userId
    });

    if (!transaction) {
      return next(new AppError('Transaction not found', 404));
    }

    // Update transaction status
    transaction.status = paymentIntent.status === 'succeeded' ? 
      TransactionStatus.SUCCEEDED : TransactionStatus.FAILED;
    transaction.processedAt = new Date();

    await transaction.save();

    res.status(200).json({
      status: 'success',
      data: {
        transaction: {
          id: transaction._id,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currency,
          processedAt: transaction.processedAt
        }
      }
    });

  } catch (error: any) {
    logger.error('Failed to confirm payment', {
      userId,
      paymentIntentId,
      error: error.message
    });
    return next(new AppError('Failed to confirm payment', 500));
  }
});

/**
 * Get payment history for user
 */
export const getPaymentHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  const { limit = 10, page = 1, type } = req.query;

  const query: any = { userId };
  if (type) {
    query.type = type;
  }

  const transactions = await PaymentTransaction.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await PaymentTransaction.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: {
      transactions: transactions.map(transaction => ({
        id: transaction._id,
        type: transaction.type,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        description: transaction.description,
        createdAt: transaction.createdAt,
        processedAt: transaction.processedAt,
        amountFormatted: transaction.amountFormatted
      })),
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalCount: total,
        limit: Number(limit)
      }
    }
  });
});

/**
 * Get payment transaction details
 */
export const getPaymentTransaction = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { transactionId } = req.params;
  const userId = req.user!.id;

  const transaction = await PaymentTransaction.findOne({
    _id: transactionId,
    userId
  });

  if (!transaction) {
    return next(new AppError('Transaction not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      transaction: {
        id: transaction._id,
        type: transaction.type,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        description: transaction.description,
        paymentMethod: transaction.paymentMethod,
        createdAt: transaction.createdAt,
        processedAt: transaction.processedAt,
        amountFormatted: transaction.amountFormatted
      }
    }
  });
});

/**
 * Get user invoices
 */
export const getInvoices = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  const { limit = 10, page = 1 } = req.query;

  try {
    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      return res.status(200).json({
        status: 'success',
        data: {
          invoices: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalCount: 0
          }
        }
      });
    }

    const invoices = await stripeService.getCustomerInvoices(
      user.stripeCustomerId,
      Number(limit),
      Number(page)
    );

    res.status(200).json({
      status: 'success',
      data: {
        invoices: invoices.data.map(invoice => ({
          id: invoice.id,
          status: invoice.status,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          description: invoice.description,
          periodStart: new Date(invoice.period_start * 1000),
          periodEnd: new Date(invoice.period_end * 1000),
          created: new Date(invoice.created * 1000),
          hostedInvoiceUrl: invoice.hosted_invoice_url,
          invoicePdf: invoice.invoice_pdf
        })),
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil((invoices.data.length / Number(limit))),
          totalCount: invoices.data.length,
          hasMore: invoices.has_more
        }
      }
    });

  } catch (error: any) {
    logger.error('Failed to get invoices', {
      userId,
      error: error.message
    });
    return next(new AppError('Failed to get invoices', 500));
  }
});

/**
 * Get specific invoice
 */
export const getInvoice = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { invoiceId } = req.params;
  const userId = req.user!.id;

  try {
    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      return next(new AppError('Customer not found', 404));
    }

    const invoice = await stripeService.getInvoice(invoiceId);
    
    // Verify invoice belongs to user
    if (invoice.customer !== user.stripeCustomerId) {
      return next(new AppError('Invoice not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        invoice: {
          id: invoice.id,
          status: invoice.status,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          description: invoice.description,
          periodStart: new Date(invoice.period_start * 1000),
          periodEnd: new Date(invoice.period_end * 1000),
          created: new Date(invoice.created * 1000),
          hostedInvoiceUrl: invoice.hosted_invoice_url,
          invoicePdf: invoice.invoice_pdf,
          lines: invoice.lines.data.map(line => ({
            description: line.description,
            amount: line.amount,
            quantity: line.quantity,
            period: {
              start: new Date(line.period.start * 1000),
              end: new Date(line.period.end * 1000)
            }
          }))
        }
      }
    });

  } catch (error: any) {
    logger.error('Failed to get invoice', {
      userId,
      invoiceId,
      error: error.message
    });
    return next(new AppError('Failed to get invoice', 500));
  }
});

/**
 * Download invoice PDF
 */
export const downloadInvoice = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { invoiceId } = req.params;
  const userId = req.user!.id;

  try {
    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      return next(new AppError('Customer not found', 404));
    }

    const invoice = await stripeService.getInvoice(invoiceId);
    
    // Verify invoice belongs to user
    if (invoice.customer !== user.stripeCustomerId) {
      return next(new AppError('Invoice not found', 404));
    }

    if (!invoice.invoice_pdf) {
      return next(new AppError('Invoice PDF not available', 404));
    }

    // Redirect to Stripe-hosted PDF
    res.redirect(invoice.invoice_pdf);

  } catch (error: any) {
    logger.error('Failed to download invoice', {
      userId,
      invoiceId,
      error: error.message
    });
    return next(new AppError('Failed to download invoice', 500));
  }
});

/**
 * Create customer portal session
 */
export const createCustomerPortalSession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  const { returnUrl } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Create or get Stripe customer
    const stripeCustomer = await stripeService.createOrGetCustomer(user);
    
    // Create customer portal session
    const session = await stripeService.createCustomerPortalSession(
      stripeCustomer.id,
      returnUrl
    );

    res.status(200).json({
      status: 'success',
      data: {
        url: session.url
      }
    });

  } catch (error: any) {
    logger.error('Failed to create customer portal session', {
      userId,
      error: error.message
    });
    return next(new AppError('Failed to create customer portal session', 500));
  }
});

/**
 * Get subscription plans
 */
export const getSubscriptionPlans = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await stripeService.getSubscriptionPlans();

    res.status(200).json({
      status: 'success',
      data: {
        plans
      }
    });

  } catch (error: any) {
    logger.error('Failed to get subscription plans', {
      error: error.message
    });
    return next(new AppError('Failed to get subscription plans', 500));
  }
});

/**
 * Get pricing information
 */
export const getPricing = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pricing = await stripeService.getPricing();

    res.status(200).json({
      status: 'success',
      data: {
        pricing
      }
    });

  } catch (error: any) {
    logger.error('Failed to get pricing', {
      error: error.message
    });
    return next(new AppError('Failed to get pricing', 500));
  }
});

/**
 * Check feature access for user
 */
export const checkFeatureAccess = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { feature } = req.params;
  const userId = req.user!.id;

  const subscription = await Subscription.findOne({ userId })
    .sort({ createdAt: -1 });

  let hasAccess = false;
  
  if (!subscription) {
    // Free tier access
    const freeFeatures = ['basic_workouts', 'basic_nutrition', 'basic_analytics', 'community_access'];
    hasAccess = freeFeatures.includes(feature);
  } else {
    hasAccess = subscription.hasFeatureAccess(feature);
  }

  res.json({
    status: 'success',
    data: {
      feature,
      hasAccess,
      subscription: subscription ? {
        plan: subscription.plan,
        status: subscription.status,
        isActive: subscription.isActive,
        isPremium: subscription.isPremium
      } : {
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        isActive: true,
        isPremium: false
      }
    }
  });
});
