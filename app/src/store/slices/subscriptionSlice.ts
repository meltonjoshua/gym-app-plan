import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Subscription tier types
export type SubscriptionTier = 'free' | 'premium' | 'professional' | 'enterprise';

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
  recommended?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  invoiceUrl?: string;
}

export interface SubscriptionUsage {
  workoutsCompleted: number;
  workoutsLimit: number;
  aiRecommendations: number;
  aiRecommendationsLimit: number;
  storageUsed: number; // in MB
  storageLimit: number; // in MB
  apiCalls: number;
  apiCallsLimit: number;
}

export interface SubscriptionState {
  currentSubscription: SubscriptionPlan | null;
  availablePlans: SubscriptionPlan[];
  paymentMethods: PaymentMethod[];
  billingHistory: BillingHistory[];
  usage: SubscriptionUsage;
  isYearlyBilling: boolean;
  loading: boolean;
  error: string | null;
  lastBillingDate?: string;
  nextBillingDate?: string;
  cancelAtPeriodEnd: boolean;
  trialEndDate?: string;
}

const defaultUsage: SubscriptionUsage = {
  workoutsCompleted: 0,
  workoutsLimit: -1, // -1 means unlimited
  aiRecommendations: 0,
  aiRecommendationsLimit: -1,
  storageUsed: 0,
  storageLimit: 1024, // 1GB
  apiCalls: 0,
  apiCallsLimit: -1
};

const availablePlans: SubscriptionPlan[] = [
  {
    id: 'free',
    tier: 'free',
    name: 'Free',
    price: 0,
    interval: 'monthly',
    features: [
      'Basic workout tracking',
      'Exercise library access',
      'Limited progress analytics',
      'Community features',
      '100MB storage'
    ]
  },
  {
    id: 'premium',
    tier: 'premium',
    name: 'Premium',
    price: 9.99,
    interval: 'monthly',
    popular: true,
    features: [
      'All Free features',
      'AI workout recommendations',
      'Advanced analytics',
      'Nutrition tracking',
      'Wearable integration',
      'Priority support',
      '1GB storage',
      'Export capabilities'
    ]
  },
  {
    id: 'professional',
    tier: 'professional',
    name: 'Professional',
    price: 19.99,
    interval: 'monthly',
    features: [
      'All Premium features',
      'Virtual personal trainer',
      'Custom meal planning',
      'Professional nutrition AI',
      'Advanced form analysis',
      'White-label options',
      '5GB storage',
      'API access (10,000 calls/month)'
    ]
  },
  {
    id: 'enterprise',
    tier: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    interval: 'monthly',
    recommended: true,
    features: [
      'All Professional features',
      'Corporate wellness dashboard',
      'Team management',
      'Advanced security & compliance',
      'Custom integrations',
      'Dedicated support',
      'Unlimited storage',
      'Unlimited API access',
      'SLA guarantee'
    ]
  }
];

const initialState: SubscriptionState = {
  currentSubscription: null,
  availablePlans,
  paymentMethods: [],
  billingHistory: [],
  usage: defaultUsage,
  isYearlyBilling: false,
  loading: false,
  error: null,
  cancelAtPeriodEnd: false
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Subscription management
    setCurrentSubscription: (state, action: PayloadAction<SubscriptionPlan>) => {
      state.currentSubscription = action.payload;
      state.usage = getUsageLimitsForTier(action.payload.tier);
    },
    updateSubscription: (state, action: PayloadAction<SubscriptionPlan>) => {
      state.currentSubscription = action.payload;
      state.usage = { ...state.usage, ...getUsageLimitsForTier(action.payload.tier) };
    },
    cancelSubscription: (state) => {
      state.cancelAtPeriodEnd = true;
    },
    reactivateSubscription: (state) => {
      state.cancelAtPeriodEnd = false;
    },
    
    // Billing preferences
    setYearlyBilling: (state, action: PayloadAction<boolean>) => {
      state.isYearlyBilling = action.payload;
      // Update available plans with yearly pricing
      state.availablePlans = state.availablePlans.map(plan => ({
        ...plan,
        interval: action.payload ? 'yearly' : 'monthly',
        price: action.payload ? plan.price * 12 * 0.8 : getMonthlyPrice(plan.tier) // 20% discount for yearly
      }));
    },

    // Payment methods
    addPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      // If this is the first payment method, make it default
      const isFirstMethod = state.paymentMethods.length === 0;
      const newMethod = { ...action.payload, isDefault: isFirstMethod };
      
      // If setting as default, remove default from others
      if (newMethod.isDefault) {
        state.paymentMethods = state.paymentMethods.map(method => ({
          ...method,
          isDefault: false
        }));
      }
      
      state.paymentMethods.push(newMethod);
    },
    removePaymentMethod: (state, action: PayloadAction<string>) => {
      const removedMethod = state.paymentMethods.find(m => m.id === action.payload);
      state.paymentMethods = state.paymentMethods.filter(m => m.id !== action.payload);
      
      // If we removed the default method, make the first remaining method default
      if (removedMethod?.isDefault && state.paymentMethods.length > 0) {
        state.paymentMethods[0].isDefault = true;
      }
    },
    setDefaultPaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethods = state.paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === action.payload
      }));
    },
    updatePaymentMethod: (state, action: PayloadAction<{ id: string; updates: Partial<PaymentMethod> }>) => {
      const { id, updates } = action.payload;
      const methodIndex = state.paymentMethods.findIndex(m => m.id === id);
      if (methodIndex !== -1) {
        state.paymentMethods[methodIndex] = { ...state.paymentMethods[methodIndex], ...updates };
      }
    },

    // Billing history
    setBillingHistory: (state, action: PayloadAction<BillingHistory[]>) => {
      state.billingHistory = action.payload.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    },
    addBillingRecord: (state, action: PayloadAction<BillingHistory>) => {
      state.billingHistory.unshift(action.payload);
      // Keep only the last 50 records
      if (state.billingHistory.length > 50) {
        state.billingHistory = state.billingHistory.slice(0, 50);
      }
    },

    // Usage tracking
    updateUsage: (state, action: PayloadAction<Partial<SubscriptionUsage>>) => {
      state.usage = { ...state.usage, ...action.payload };
    },
    incrementUsage: (state, action: PayloadAction<keyof SubscriptionUsage>) => {
      const key = action.payload;
      if (typeof state.usage[key] === 'number') {
        (state.usage[key] as number)++;
      }
    },
    resetUsage: (state) => {
      state.usage = {
        ...state.usage,
        workoutsCompleted: 0,
        aiRecommendations: 0,
        apiCalls: 0
      };
    },

    // Billing dates
    setBillingDates: (state, action: PayloadAction<{ last?: string; next?: string; trialEnd?: string }>) => {
      const { last, next, trialEnd } = action.payload;
      if (last) state.lastBillingDate = last;
      if (next) state.nextBillingDate = next;
      if (trialEnd) state.trialEndDate = trialEnd;
    },

    // Reset state (for logout)
    resetSubscriptionState: () => initialState
  }
});

// Helper functions
function getUsageLimitsForTier(tier: SubscriptionTier): SubscriptionUsage {
  const limits = {
    free: {
      workoutsCompleted: 0,
      workoutsLimit: 10,
      aiRecommendations: 0,
      aiRecommendationsLimit: 5,
      storageUsed: 0,
      storageLimit: 100, // 100MB
      apiCalls: 0,
      apiCallsLimit: 0
    },
    premium: {
      workoutsCompleted: 0,
      workoutsLimit: -1, // unlimited
      aiRecommendations: 0,
      aiRecommendationsLimit: 50,
      storageUsed: 0,
      storageLimit: 1024, // 1GB
      apiCalls: 0,
      apiCallsLimit: 1000
    },
    professional: {
      workoutsCompleted: 0,
      workoutsLimit: -1,
      aiRecommendations: 0,
      aiRecommendationsLimit: -1,
      storageUsed: 0,
      storageLimit: 5120, // 5GB
      apiCalls: 0,
      apiCallsLimit: 10000
    },
    enterprise: {
      workoutsCompleted: 0,
      workoutsLimit: -1,
      aiRecommendations: 0,
      aiRecommendationsLimit: -1,
      storageUsed: 0,
      storageLimit: -1, // unlimited
      apiCalls: 0,
      apiCallsLimit: -1
    }
  };

  return limits[tier];
}

function getMonthlyPrice(tier: SubscriptionTier): number {
  const prices = {
    free: 0,
    premium: 9.99,
    professional: 19.99,
    enterprise: 49.99
  };
  return prices[tier];
}

// Selectors
export const selectCurrentSubscription = (state: { subscription: SubscriptionState }) => 
  state.subscription.currentSubscription;

export const selectAvailablePlans = (state: { subscription: SubscriptionState }) => 
  state.subscription.availablePlans;

export const selectPaymentMethods = (state: { subscription: SubscriptionState }) => 
  state.subscription.paymentMethods;

export const selectDefaultPaymentMethod = (state: { subscription: SubscriptionState }) => 
  state.subscription.paymentMethods.find(method => method.isDefault);

export const selectBillingHistory = (state: { subscription: SubscriptionState }) => 
  state.subscription.billingHistory;

export const selectUsage = (state: { subscription: SubscriptionState }) => 
  state.subscription.usage;

export const selectIsSubscriptionActive = (state: { subscription: SubscriptionState }) => 
  state.subscription.currentSubscription && state.subscription.currentSubscription.tier !== 'free';

export const selectCanAccessFeature = (feature: string) => (state: { subscription: SubscriptionState }) => {
  const subscription = state.subscription.currentSubscription;
  if (!subscription) return false;
  
  const featureAccess = {
    'ai_recommendations': ['premium', 'professional', 'enterprise'],
    'virtual_trainer': ['professional', 'enterprise'],
    'advanced_analytics': ['premium', 'professional', 'enterprise'],
    'api_access': ['professional', 'enterprise'],
    'white_label': ['professional', 'enterprise'],
    'corporate_dashboard': ['enterprise'],
    'unlimited_storage': ['enterprise']
  };
  
  const allowedTiers = featureAccess[feature as keyof typeof featureAccess];
  return allowedTiers ? allowedTiers.includes(subscription.tier) : false;
};

export const selectUsagePercentage = (usageType: keyof SubscriptionUsage) => 
  (state: { subscription: SubscriptionState }) => {
    const usage = state.subscription.usage;
    const used = usage[usageType] as number;
    const limit = usage[`${usageType}Limit` as keyof SubscriptionUsage] as number;
    
    if (limit === -1) return 0; // unlimited
    if (limit === 0) return 100; // no access
    
    return Math.min((used / limit) * 100, 100);
  };

export const selectIsNearUsageLimit = (usageType: keyof SubscriptionUsage, threshold = 80) => 
  (state: { subscription: SubscriptionState }) => {
    const percentage = selectUsagePercentage(usageType)(state);
    return percentage >= threshold;
  };

export const selectDaysUntilNextBilling = (state: { subscription: SubscriptionState }) => {
  const nextBillingDate = state.subscription.nextBillingDate;
  if (!nextBillingDate) return null;
  
  const today = new Date();
  const nextBilling = new Date(nextBillingDate);
  const diffTime = nextBilling.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const selectIsTrialActive = (state: { subscription: SubscriptionState }) => {
  const trialEndDate = state.subscription.trialEndDate;
  if (!trialEndDate) return false;
  
  const today = new Date();
  const trialEnd = new Date(trialEndDate);
  
  return trialEnd > today;
};

export const {
  setLoading,
  setError,
  clearError,
  setCurrentSubscription,
  updateSubscription,
  cancelSubscription,
  reactivateSubscription,
  setYearlyBilling,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  updatePaymentMethod,
  setBillingHistory,
  addBillingRecord,
  updateUsage,
  incrementUsage,
  resetUsage,
  setBillingDates,
  resetSubscriptionState
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
