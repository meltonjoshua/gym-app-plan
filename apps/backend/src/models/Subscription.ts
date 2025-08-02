import mongoose, { Document, Schema } from 'mongoose';

// Subscription plans available in the app
export enum SubscriptionPlan {
  FREE = 'free',
  PREMIUM = 'premium',
  PRO = 'pro'
}

// Subscription status from Stripe
export enum SubscriptionStatus {
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  TRIALING = 'trialing',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid'
}

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  isActive: boolean;
  isPremium: boolean;
  isTrialing: boolean;
  daysUntilExpiry: number;
  
  // Methods
  hasFeatureAccess(feature: string): boolean;
  getRemainingTrialDays(): number;
  canUpgrade(): boolean;
  canDowngrade(): boolean;
}

const subscriptionSchema = new Schema<ISubscription>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  stripeCustomerId: {
    type: String,
    required: true,
    index: true
  },
  stripeSubscriptionId: {
    type: String,
    sparse: true,
    index: true
  },
  stripePriceId: {
    type: String,
    sparse: true
  },
  plan: {
    type: String,
    enum: Object.values(SubscriptionPlan),
    default: SubscriptionPlan.FREE,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(SubscriptionStatus),
    default: SubscriptionStatus.ACTIVE,
    required: true
  },
  currentPeriodStart: {
    type: Date
  },
  currentPeriodEnd: {
    type: Date
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  canceledAt: {
    type: Date
  },
  trialStart: {
    type: Date
  },
  trialEnd: {
    type: Date
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: Check if subscription is active
subscriptionSchema.virtual('isActive').get(function(this: ISubscription) {
  return [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING].includes(this.status);
});

// Virtual: Check if user has premium features
subscriptionSchema.virtual('isPremium').get(function(this: ISubscription) {
  return this.plan !== SubscriptionPlan.FREE && this.isActive;
});

// Virtual: Check if user is in trial period
subscriptionSchema.virtual('isTrialing').get(function(this: ISubscription) {
  return this.status === SubscriptionStatus.TRIALING && 
         this.trialEnd && 
         new Date() < this.trialEnd;
});

// Virtual: Days until subscription expires
subscriptionSchema.virtual('daysUntilExpiry').get(function(this: ISubscription) {
  if (!this.currentPeriodEnd) return 0;
  const now = new Date();
  const expiry = new Date(this.currentPeriodEnd);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method: Check if user has access to a specific feature
subscriptionSchema.methods.hasFeatureAccess = function(this: ISubscription, feature: string): boolean {
  // Define feature access by plan
  const featureAccess = {
    [SubscriptionPlan.FREE]: [
      'basic_workouts',
      'basic_nutrition',
      'basic_analytics',
      'community_access'
    ],
    [SubscriptionPlan.PREMIUM]: [
      'basic_workouts',
      'basic_nutrition',
      'basic_analytics',
      'community_access',
      'advanced_analytics',
      'meal_planning',
      'ai_coaching',
      'unlimited_workouts',
      'export_data'
    ],
    [SubscriptionPlan.PRO]: [
      'basic_workouts',
      'basic_nutrition',
      'basic_analytics',
      'community_access',
      'advanced_analytics',
      'meal_planning',
      'ai_coaching',
      'unlimited_workouts',
      'export_data',
      'form_analysis',
      'personal_training',
      'priority_support',
      'white_label_access'
    ]
  };

  if (!this.isActive) {
    return featureAccess[SubscriptionPlan.FREE].includes(feature);
  }

  return featureAccess[this.plan].includes(feature);
};

// Method: Get remaining trial days
subscriptionSchema.methods.getRemainingTrialDays = function(this: ISubscription): number {
  if (!this.isTrialing || !this.trialEnd) return 0;
  const now = new Date();
  const trialEnd = new Date(this.trialEnd);
  const diffTime = trialEnd.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

// Method: Check if user can upgrade subscription
subscriptionSchema.methods.canUpgrade = function(this: ISubscription): boolean {
  if (!this.isActive) return true;
  
  switch (this.plan) {
    case SubscriptionPlan.FREE:
      return true;
    case SubscriptionPlan.PREMIUM:
      return true;
    case SubscriptionPlan.PRO:
      return false;
    default:
      return false;
  }
};

// Method: Check if user can downgrade subscription
subscriptionSchema.methods.canDowngrade = function(this: ISubscription): boolean {
  if (!this.isActive) return false;
  
  switch (this.plan) {
    case SubscriptionPlan.FREE:
      return false;
    case SubscriptionPlan.PREMIUM:
      return true;
    case SubscriptionPlan.PRO:
      return true;
    default:
      return false;
  }
};

// Indexes for performance
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });
subscriptionSchema.index({ plan: 1, status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });

export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
export default Subscription;
