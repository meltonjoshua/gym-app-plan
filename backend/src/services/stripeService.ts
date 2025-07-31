import Stripe from 'stripe';
import productionConfig from '../config/production';
import { IUser } from '../models/User';
import { ISubscription, SubscriptionPlan, SubscriptionStatus } from '../models/Subscription';
import { IPaymentTransaction, TransactionType, TransactionStatus, PaymentMethod } from '../models/PaymentTransaction';
import Subscription from '../models/Subscription';
import PaymentTransaction from '../models/PaymentTransaction';
import { logger } from '../utils/logger';

class StripeService {
  private stripe: Stripe;
  
  // Subscription price IDs (these should be configured in Stripe dashboard)
  private readonly PRICE_IDS: Record<SubscriptionPlan, { monthly: string; yearly: string }> = {
    [SubscriptionPlan.FREE]: {
      monthly: '',
      yearly: ''
    },
    [SubscriptionPlan.PREMIUM]: {
      monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || 'price_premium_monthly',
      yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY || 'price_premium_yearly'
    },
    [SubscriptionPlan.PRO]: {
      monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
      yearly: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly'
    }
  };

  constructor() {
    if (!productionConfig.payments.stripe.secretKey) {
      throw new Error('Stripe secret key is required');
    }
    
    this.stripe = new Stripe(productionConfig.payments.stripe.secretKey, {
      apiVersion: '2025-06-30.basil',
      typescript: true
    });
    
    logger.info('Stripe service initialized successfully');
  }

  /**
   * Create or retrieve a Stripe customer
   */
  async createOrGetCustomer(user: IUser): Promise<Stripe.Customer> {
    try {
      // Check if user already has a Stripe customer ID
      if (user.stripeCustomerId) {
        try {
          const customer = await this.stripe.customers.retrieve(user.stripeCustomerId);
          if (!customer.deleted) {
            return customer as Stripe.Customer;
          }
        } catch (error) {
          logger.warn(`Failed to retrieve existing Stripe customer ${user.stripeCustomerId}`, error);
        }
      }

      // Create new customer
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: (user._id as any).toString(),
          source: 'fittracker-pro'
        }
      });

      logger.info(`Created new Stripe customer ${customer.id} for user ${user._id}`);
      return customer;
    } catch (error) {
      logger.error('Error creating/getting Stripe customer:', error);
      throw error;
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(
    customerId: string,
    plan: SubscriptionPlan,
    billing: 'monthly' | 'yearly' = 'monthly',
    trialDays?: number
  ): Promise<Stripe.Subscription> {
    try {
      const priceId = this.PRICE_IDS[plan][billing];
      
      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          plan,
          billing,
          source: 'fittracker-pro'
        }
      };

      if (trialDays && trialDays > 0) {
        subscriptionParams.trial_period_days = trialDays;
      }

      const subscription = await this.stripe.subscriptions.create(subscriptionParams);
      logger.info(`Created subscription ${subscription.id} for customer ${customerId}`);
      return subscription;
    } catch (error) {
      logger.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Get a subscription
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      logger.error('Error retrieving subscription:', error);
      throw error;
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId: string,
    plan?: SubscriptionPlan,
    billing?: 'monthly' | 'yearly'
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      
      if (plan && billing) {
        const priceId = this.PRICE_IDS[plan][billing];
        
        return await this.stripe.subscriptions.update(subscriptionId, {
          items: [{
            id: subscription.items.data[0].id,
            price: priceId
          }],
          proration_behavior: 'create_prorations'
        });
      }
      
      return subscription;
    } catch (error) {
      logger.error('Error updating subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription immediately
   */
  async cancelSubscriptionImmediately(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.cancel(subscriptionId);
    } catch (error) {
      logger.error('Error canceling subscription immediately:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription at period end
   */
  async cancelSubscriptionAtPeriodEnd(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
    } catch (error) {
      logger.error('Error canceling subscription at period end:', error);
      throw error;
    }
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false
      });
    } catch (error) {
      logger.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  /**
   * Create payment intent for one-time payments
   */
  async createPaymentIntent(
    amount: number,
    currency: string,
    customerId: string,
    description?: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        description,
        automatic_payment_methods: {
          enabled: true
        },
        metadata: {
          source: 'fittracker_app'
        }
      });
    } catch (error) {
      logger.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Get payment intent
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ['charges']
      });
    } catch (error) {
      logger.error('Error retrieving payment intent:', error);
      throw error;
    }
  }

  /**
   * Get customer invoices
   */
  async getCustomerInvoices(
    customerId: string,
    limit: number = 10,
    page: number = 1
  ): Promise<Stripe.ApiList<Stripe.Invoice>> {
    try {
      return await this.stripe.invoices.list({
        customer: customerId,
        limit,
        starting_after: page > 1 ? undefined : undefined // Implement proper pagination if needed
      });
    } catch (error) {
      logger.error('Error getting customer invoices:', error);
      throw error;
    }
  }

  /**
   * Get invoice
   */
  async getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    try {
      return await this.stripe.invoices.retrieve(invoiceId);
    } catch (error) {
      logger.error('Error getting invoice:', error);
      throw error;
    }
  }

  /**
   * Create customer portal session
   */
  async createCustomerPortalSession(
    customerId: string,
    returnUrl?: string
  ): Promise<Stripe.BillingPortal.Session> {
    try {
      return await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl || `${process.env.FRONTEND_URL}/account/billing`
      });
    } catch (error) {
      logger.error('Error creating customer portal session:', error);
      throw error;
    }
  }

  /**
   * Get subscription plans
   */
  async getSubscriptionPlans(): Promise<any[]> {
    try {
      const products = await this.stripe.products.list({
        active: true,
        type: 'service'
      });

      const plans = await Promise.all(
        products.data.map(async (product) => {
          const prices = await this.stripe.prices.list({
            product: product.id,
            active: true
          });

          return {
            id: product.id,
            name: product.name,
            description: product.description,
            features: product.metadata.features ? JSON.parse(product.metadata.features) : [],
            prices: prices.data.map(price => ({
              id: price.id,
              amount: price.unit_amount,
              currency: price.currency,
              interval: price.recurring?.interval,
              intervalCount: price.recurring?.interval_count
            }))
          };
        })
      );

      return plans;
    } catch (error) {
      logger.error('Error getting subscription plans:', error);
      throw error;
    }
  }

  /**
   * Get pricing information
   */
  async getPricing(): Promise<any> {
    try {
      return {
        plans: {
          [SubscriptionPlan.FREE]: {
            name: 'Free',
            price: 0,
            features: [
              'Basic workout tracking',
              'Basic nutrition logging',
              'Community access',
              'Limited analytics'
            ]
          },
          [SubscriptionPlan.PREMIUM]: {
            name: 'Premium',
            monthlyPrice: 999, // $9.99
            yearlyPrice: 9999, // $99.99
            features: [
              'Advanced workout analytics',
              'Unlimited workout history',
              'Advanced meal planning',
              'Priority support',
              'Custom workout plans'
            ]
          },
          [SubscriptionPlan.PRO]: {
            name: 'Pro',
            monthlyPrice: 1999, // $19.99
            yearlyPrice: 19999, // $199.99
            features: [
              'All Premium features',
              'AI-powered form analysis',
              'Personal trainer consultations',
              'Advanced AI coaching',
              'Custom nutrition plans',
              'Priority feature access'
            ]
          }
        },
        currency: 'usd'
      };
    } catch (error) {
      logger.error('Error getting pricing:', error);
      throw error;
    }
  }

  /**
   * Get webhook construct event
   */
  constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        productionConfig.payments.stripe.webhookSecret
      );
    } catch (error) {
      logger.error('Error constructing webhook event:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  /**
   * Handle subscription update webhook
   */
  async handleSubscriptionUpdate(stripeSubscription: Stripe.Subscription): Promise<void> {
    try {
      const subscription = await Subscription.findOne({
        stripeSubscriptionId: stripeSubscription.id
      });

      if (subscription) {
        subscription.status = stripeSubscription.status as SubscriptionStatus;
        subscription.currentPeriodStart = new Date((stripeSubscription as any).current_period_start * 1000);
        subscription.currentPeriodEnd = new Date((stripeSubscription as any).current_period_end * 1000);
        subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
        
        if ((stripeSubscription as any).canceled_at) {
          subscription.canceledAt = new Date((stripeSubscription as any).canceled_at * 1000);
        }

        await subscription.save();
        logger.info(`Subscription updated via webhook: ${subscription._id}`);
      }
    } catch (error) {
      logger.error('Error handling subscription update webhook:', error);
      throw error;
    }
  }

  /**
   * Handle subscription deleted webhook
   */
  async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<void> {
    try {
      const subscription = await Subscription.findOne({
        stripeSubscriptionId: stripeSubscription.id
      });

      if (subscription) {
        subscription.status = SubscriptionStatus.CANCELED;
        subscription.canceledAt = new Date();
        await subscription.save();
        logger.info(`Subscription canceled via webhook: ${subscription._id}`);
      }
    } catch (error) {
      logger.error('Error handling subscription deleted webhook:', error);
      throw error;
    }
  }

  /**
   * Handle payment succeeded webhook
   */
  async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    try {
      if ((invoice as any).subscription) {
        // Create payment transaction record
        const subscription = await Subscription.findOne({
          stripeSubscriptionId: (invoice as any).subscription as string
        });

        if (subscription) {
          const transaction = new PaymentTransaction({
            userId: subscription.userId,
            subscriptionId: subscription._id,
            stripeInvoiceId: invoice.id,
            stripeChargeId: (invoice as any).charge as string,
            type: TransactionType.SUBSCRIPTION,
            status: TransactionStatus.SUCCEEDED,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            description: invoice.description || `Payment for ${subscription.plan} subscription`,
            paymentMethod: PaymentMethod.CARD,
            processedAt: new Date(),
            metadata: {
              invoiceNumber: invoice.number,
              periodStart: new Date(invoice.period_start * 1000),
              periodEnd: new Date(invoice.period_end * 1000)
            }
          });

          await transaction.save();
          logger.info(`Payment transaction created via webhook: ${transaction._id}`);
        }
      }
    } catch (error) {
      logger.error('Error handling payment succeeded webhook:', error);
      throw error;
    }
  }

  /**
   * Handle payment failed webhook
   */
  async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    try {
      if ((invoice as any).subscription) {
        const subscription = await Subscription.findOne({
          stripeSubscriptionId: (invoice as any).subscription as string
        });

        if (subscription) {
          const transaction = new PaymentTransaction({
            userId: subscription.userId,
            subscriptionId: subscription._id,
            stripeInvoiceId: invoice.id,
            type: TransactionType.SUBSCRIPTION,
            status: TransactionStatus.FAILED,
            amount: invoice.amount_due,
            currency: invoice.currency,
            description: invoice.description || `Failed payment for ${subscription.plan} subscription`,
            paymentMethod: PaymentMethod.CARD,
            failureReason: 'Payment failed',
            metadata: {
              invoiceNumber: invoice.number,
              attemptCount: (invoice as any).attempt_count
            }
          });

          await transaction.save();
          logger.warn(`Failed payment transaction created via webhook: ${transaction._id}`);
        }
      }
    } catch (error) {
      logger.error('Error handling payment failed webhook:', error);
      throw error;
    }
  }

  /**
   * Handle payment intent succeeded webhook
   */
  async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const transaction = await PaymentTransaction.findOne({
        stripePaymentIntentId: paymentIntent.id
      });

      if (transaction) {
        transaction.status = TransactionStatus.SUCCEEDED;
        transaction.processedAt = new Date();
        
        // PaymentIntent from webhook doesn't always include charges expanded
        // We'll just update the status for now
        await transaction.save();
        logger.info(`Payment intent succeeded via webhook: ${transaction._id}`);
      }
    } catch (error) {
      logger.error('Error handling payment intent succeeded webhook:', error);
      throw error;
    }
  }

  /**
   * Handle payment intent failed webhook
   */
  async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const transaction = await PaymentTransaction.findOne({
        stripePaymentIntentId: paymentIntent.id
      });

      if (transaction) {
        transaction.status = TransactionStatus.FAILED;
        transaction.failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
        await transaction.save();
        logger.warn(`Payment intent failed via webhook: ${transaction._id}`);
      }
    } catch (error) {
      logger.error('Error handling payment intent failed webhook:', error);
      throw error;
    }
  }

  /**
   * Get Stripe instance for advanced operations
   */
  getStripeInstance(): Stripe {
    return this.stripe;
  }
}

// Export singleton instance
export const stripeService = new StripeService();
export default stripeService;
