import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Subscription, { SubscriptionPlan, SubscriptionStatus } from '../models/Subscription';
import PaymentTransaction, { TransactionType, TransactionStatus } from '../models/PaymentTransaction';
import { User } from '../models/User';
import { stripeService } from '../services/stripeService';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import { logger } from '../utils/logger';

/**
 * Create a new subscription
 */
export const createSubscription = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { plan, billing = 'monthly', trialDays } = req.body;
  const userId = req.user!.id;

  // Validate plan
  if (plan === SubscriptionPlan.FREE) {
    return next(new AppError('Cannot create paid subscription for free plan', 400));
  }

  if (!Object.values(SubscriptionPlan).includes(plan)) {
    return next(new AppError('Invalid subscription plan', 400));
  }

  // Get user
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if user already has an active subscription
  const existingSubscription = await Subscription.findOne({
    userId,
    status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] }
  });

  if (existingSubscription) {
    return next(new AppError('User already has an active subscription', 400));
  }

  try {
    // Create or get Stripe customer
    const stripeCustomer = await stripeService.createOrGetCustomer(user);
    
    // Create Stripe subscription
    const stripeSubscription = await stripeService.createSubscription(
      stripeCustomer.id,
      plan,
      billing,
      trialDays
    );

    // Create subscription record in database
    const subscription = new Subscription({
      userId,
      stripeCustomerId: stripeCustomer.id,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: stripeSubscription.items.data[0].price.id,
      plan,
      status: stripeSubscription.status as SubscriptionStatus,
      currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      trialStart: (stripeSubscription as any).trial_start ? new Date((stripeSubscription as any).trial_start * 1000) : undefined,
      trialEnd: (stripeSubscription as any).trial_end ? new Date((stripeSubscription as any).trial_end * 1000) : undefined,
      metadata: {
        billing,
        source: 'app'
      }
    });

    await subscription.save();

    // Update user's stripe customer ID if not set
    if (!user.stripeCustomerId) {
      user.stripeCustomerId = stripeCustomer.id;
      await user.save();
    }

    logger.info(`Subscription created successfully for user ${userId}`, {
      subscriptionId: subscription._id,
      stripeSubscriptionId: stripeSubscription.id,
      plan,
      billing
    });

    res.status(201).json({
      status: 'success',
      data: {
        subscription: {
          id: subscription._id,
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          trialEnd: subscription.trialEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
        },
        clientSecret: (stripeSubscription.latest_invoice as any)?.payment_intent?.client_secret
      }
    });

  } catch (error: any) {
    logger.error('Failed to create subscription', {
      userId,
      plan,
      billing,
      error: error.message
    });
    return next(new AppError('Failed to create subscription', 500));
  }
});

/**
 * Get current user subscription
 */
export const getCurrentSubscription = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user!.id;

  const subscription = await Subscription.findOne({
    userId,
    status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING, SubscriptionStatus.PAST_DUE] }
  }).sort({ createdAt: -1 });

  if (!subscription) {
    return res.status(200).json({
      status: 'success',
      data: {
        subscription: null,
        plan: SubscriptionPlan.FREE
      }
    });
  }

  // Sync with Stripe if needed
  if (subscription.stripeSubscriptionId) {
    try {
      const stripeSubscription = await stripeService.getSubscription(subscription.stripeSubscriptionId);
      
      // Update subscription if status changed
      if (stripeSubscription.status !== subscription.status) {
        subscription.status = stripeSubscription.status as SubscriptionStatus;
        subscription.currentPeriodStart = new Date((stripeSubscription as any).current_period_start * 1000);
        subscription.currentPeriodEnd = new Date((stripeSubscription as any).current_period_end * 1000);
        subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
        await subscription.save();
      }
    } catch (error) {
      logger.warn(`Failed to sync subscription with Stripe: ${subscription.stripeSubscriptionId}`, error);
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      subscription: {
        id: subscription._id,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        trialEnd: subscription.trialEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        isActive: subscription.isActive,
        isPremium: subscription.isPremium,
        isTrialing: subscription.isTrialing,
        daysUntilExpiry: subscription.daysUntilExpiry
      }
    }
  });
});

/**
 * Update subscription (upgrade/downgrade)
 */
export const updateSubscription = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { subscriptionId } = req.params;
  const { plan, billing } = req.body;
  const userId = req.user!.id;

  const subscription = await Subscription.findOne({
    _id: subscriptionId,
    userId,
    status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] }
  });

  if (!subscription) {
    return next(new AppError('Subscription not found or not active', 404));
  }

  if (!subscription.stripeSubscriptionId) {
    return next(new AppError('Stripe subscription not found', 400));
  }

  try {
    // Update subscription in Stripe
    const updatedStripeSubscription = await stripeService.updateSubscription(
      subscription.stripeSubscriptionId,
      plan,
      billing
    );

    // Update subscription in database
    subscription.plan = plan || subscription.plan;
    subscription.stripePriceId = updatedStripeSubscription.items.data[0].price.id;
    subscription.currentPeriodStart = new Date((updatedStripeSubscription as any).current_period_start * 1000);
    subscription.currentPeriodEnd = new Date((updatedStripeSubscription as any).current_period_end * 1000);
    subscription.cancelAtPeriodEnd = updatedStripeSubscription.cancel_at_period_end;
    subscription.metadata = {
      ...subscription.metadata,
      billing: billing || subscription.metadata.billing,
      lastModified: new Date().toISOString()
    };

    await subscription.save();

    logger.info(`Subscription updated successfully`, {
      subscriptionId: subscription._id,
      userId,
      newPlan: plan,
      newBilling: billing
    });

    res.status(200).json({
      status: 'success',
      data: {
        subscription: {
          id: subscription._id,
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
        }
      }
    });

  } catch (error: any) {
    logger.error('Failed to update subscription', {
      subscriptionId,
      userId,
      error: error.message
    });
    return next(new AppError('Failed to update subscription', 500));
  }
});

/**
 * Cancel subscription
 */
export const cancelSubscription = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { subscriptionId } = req.params;
  const { cancelImmediately = false } = req.body;
  const userId = req.user!.id;

  const subscription = await Subscription.findOne({
    _id: subscriptionId,
    userId,
    status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] }
  });

  if (!subscription) {
    return next(new AppError('Subscription not found or not active', 404));
  }

  if (!subscription.stripeSubscriptionId) {
    return next(new AppError('Stripe subscription not found', 400));
  }

  try {
    let canceledStripeSubscription;
    
    if (cancelImmediately) {
      // Cancel immediately
      canceledStripeSubscription = await stripeService.cancelSubscriptionImmediately(
        subscription.stripeSubscriptionId
      );
      subscription.status = SubscriptionStatus.CANCELED;
      subscription.canceledAt = new Date();
    } else {
      // Cancel at period end
      canceledStripeSubscription = await stripeService.cancelSubscriptionAtPeriodEnd(
        subscription.stripeSubscriptionId
      );
      subscription.cancelAtPeriodEnd = true;
    }

    subscription.metadata = {
      ...subscription.metadata,
      canceledAt: new Date().toISOString(),
      cancelationType: cancelImmediately ? 'immediate' : 'at_period_end'
    };

    await subscription.save();

    logger.info(`Subscription canceled successfully`, {
      subscriptionId: subscription._id,
      userId,
      cancelImmediately
    });

    res.status(200).json({
      status: 'success',
      data: {
        subscription: {
          id: subscription._id,
          plan: subscription.plan,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          canceledAt: subscription.canceledAt,
          currentPeriodEnd: subscription.currentPeriodEnd
        }
      }
    });

  } catch (error: any) {
    logger.error('Failed to cancel subscription', {
      subscriptionId,
      userId,
      error: error.message
    });
    return next(new AppError('Failed to cancel subscription', 500));
  }
});

/**
 * Reactivate subscription
 */
export const reactivateSubscription = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { subscriptionId } = req.params;
  const userId = req.user!.id;

  const subscription = await Subscription.findOne({
    _id: subscriptionId,
    userId,
    cancelAtPeriodEnd: true,
    status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] }
  });

  if (!subscription) {
    return next(new AppError('Subscription not found or cannot be reactivated', 404));
  }

  if (!subscription.stripeSubscriptionId) {
    return next(new AppError('Stripe subscription not found', 400));
  }

  try {
    // Reactivate subscription in Stripe
    const reactivatedStripeSubscription = await stripeService.reactivateSubscription(
      subscription.stripeSubscriptionId
    );

    // Update subscription in database
    subscription.cancelAtPeriodEnd = false;
    subscription.canceledAt = undefined;
    subscription.metadata = {
      ...subscription.metadata,
      reactivatedAt: new Date().toISOString()
    };

    await subscription.save();

    logger.info(`Subscription reactivated successfully`, {
      subscriptionId: subscription._id,
      userId
    });

    res.status(200).json({
      status: 'success',
      data: {
        subscription: {
          id: subscription._id,
          plan: subscription.plan,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          currentPeriodEnd: subscription.currentPeriodEnd
        }
      }
    });

  } catch (error: any) {
    logger.error('Failed to reactivate subscription', {
      subscriptionId,
      userId,
      error: error.message
    });
    return next(new AppError('Failed to reactivate subscription', 500));
  }
});
