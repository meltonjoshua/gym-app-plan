/**
 * iOS Subscription Service - RevenueCat Integration
 * Handles iOS App Store in-app purchases and subscriptions
 */

import { Platform } from 'react-native';

export interface SubscriptionProduct {
  identifier: string;
  price: string;
  priceString: string;
  currencyCode: string;
  title: string;
  description: string;
  billingPeriod: 'monthly' | 'yearly';
  trialPeriod?: string;
  introductoryPrice?: {
    price: string;
    period: string;
    cycles: number;
  };
}

export interface PurchaserInfo {
  originalAppUserId: string;
  firstSeen: string;
  latestExpirationDate?: string;
  activeSubscriptions: string[];
  allPurchasedProductIds: string[];
  entitlements: {
    active: { [key: string]: EntitlementInfo };
    all: { [key: string]: EntitlementInfo };
  };
}

export interface EntitlementInfo {
  identifier: string;
  productIdentifier: string;
  isActive: boolean;
  willRenew: boolean;
  latestPurchaseDate: string;
  expirationDate?: string;
  store: 'app_store' | 'play_store';
}

export class IOSSubscriptionService {
  private static instance: IOSSubscriptionService;
  private isConfigured = false;
  private apiKey: string = '';
  
  public static getInstance(): IOSSubscriptionService {
    if (!IOSSubscriptionService.instance) {
      IOSSubscriptionService.instance = new IOSSubscriptionService();
    }
    return IOSSubscriptionService.instance;
  }

  /**
   * Initialize RevenueCat SDK for iOS
   */
  public async initialize(apiKey: string, appUserId?: string): Promise<void> {
    if (Platform.OS !== 'ios') {
      throw new Error('IOSSubscriptionService is only available on iOS');
    }

    try {
      this.apiKey = apiKey;
      
      // In a real implementation, this would initialize RevenueCat
      // await Purchases.setDebugLogsEnabled(__DEV__);
      // await Purchases.configure({ apiKey, appUserId });
      
      this.isConfigured = true;
      console.log('✅ iOS Subscription Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize iOS Subscription Service:', error);
      throw error;
    }
  }

  /**
   * Get available subscription products from App Store
   */
  public async getProducts(): Promise<SubscriptionProduct[]> {
    this.ensureConfigured();

    try {
      // Mock data for now - in real implementation would fetch from RevenueCat
      const mockProducts: SubscriptionProduct[] = [
        {
          identifier: 'fittracker_pro_monthly',
          price: '9.99',
          priceString: '$9.99',
          currencyCode: 'USD',
          title: 'FitTracker Pro Monthly',
          description: 'Monthly subscription to FitTracker Pro with all premium features',
          billingPeriod: 'monthly',
          trialPeriod: '7 days',
          introductoryPrice: {
            price: '0.00',
            period: '7 days',
            cycles: 1
          }
        },
        {
          identifier: 'fittracker_pro_yearly',
          price: '99.99',
          priceString: '$99.99',
          currencyCode: 'USD',
          title: 'FitTracker Pro Yearly',
          description: 'Yearly subscription to FitTracker Pro - Save 17%!',
          billingPeriod: 'yearly',
          trialPeriod: '7 days',
          introductoryPrice: {
            price: '0.00',
            period: '7 days',
            cycles: 1
          }
        },
        {
          identifier: 'fittracker_professional',
          price: '19.99',
          priceString: '$19.99',
          currencyCode: 'USD',
          title: 'FitTracker Professional',
          description: 'Professional tier with AI coaching and advanced analytics',
          billingPeriod: 'monthly'
        }
      ];

      return mockProducts;
    } catch (error) {
      console.error('❌ Failed to get subscription products:', error);
      throw error;
    }
  }

  /**
   * Purchase a subscription product
   */
  public async purchaseProduct(productId: string): Promise<PurchaserInfo> {
    this.ensureConfigured();

    try {
      console.log(`🛒 Purchasing product: ${productId}`);
      
      // In real implementation:
      // const { purchaserInfo } = await Purchases.purchaseProduct(productId);
      
      // Mock successful purchase
      const mockPurchaserInfo: PurchaserInfo = {
        originalAppUserId: 'user_123',
        firstSeen: new Date().toISOString(),
        latestExpirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        activeSubscriptions: [productId],
        allPurchasedProductIds: [productId],
        entitlements: {
          active: {
            'pro': {
              identifier: 'pro',
              productIdentifier: productId,
              isActive: true,
              willRenew: true,
              latestPurchaseDate: new Date().toISOString(),
              expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              store: 'app_store'
            }
          },
          all: {}
        }
      };

      console.log('✅ Purchase completed successfully');
      return mockPurchaserInfo;
    } catch (error) {
      console.error('❌ Purchase failed:', error);
      throw error;
    }
  }

  /**
   * Restore previous purchases
   */
  public async restorePurchases(): Promise<PurchaserInfo> {
    this.ensureConfigured();

    try {
      console.log('🔄 Restoring purchases...');
      
      // In real implementation:
      // const purchaserInfo = await Purchases.restorePurchases();
      
      // Mock restored purchases
      const mockPurchaserInfo: PurchaserInfo = {
        originalAppUserId: 'user_123',
        firstSeen: '2024-01-01T00:00:00.000Z',
        latestExpirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        activeSubscriptions: ['fittracker_pro_monthly'],
        allPurchasedProductIds: ['fittracker_pro_monthly', 'fittracker_pro_yearly'],
        entitlements: {
          active: {
            'pro': {
              identifier: 'pro',
              productIdentifier: 'fittracker_pro_monthly',
              isActive: true,
              willRenew: true,
              latestPurchaseDate: '2024-07-01T00:00:00.000Z',
              expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
              store: 'app_store'
            }
          },
          all: {}
        }
      };

      console.log('✅ Purchases restored successfully');
      return mockPurchaserInfo;
    } catch (error) {
      console.error('❌ Failed to restore purchases:', error);
      throw error;
    }
  }

  /**
   * Get current purchaser info
   */
  public async getPurchaserInfo(): Promise<PurchaserInfo> {
    this.ensureConfigured();

    try {
      // In real implementation:
      // const purchaserInfo = await Purchases.getPurchaserInfo();
      
      // Mock current purchaser info
      const mockPurchaserInfo: PurchaserInfo = {
        originalAppUserId: 'user_123',
        firstSeen: '2024-01-01T00:00:00.000Z',
        activeSubscriptions: [],
        allPurchasedProductIds: [],
        entitlements: {
          active: {},
          all: {}
        }
      };

      return mockPurchaserInfo;
    } catch (error) {
      console.error('❌ Failed to get purchaser info:', error);
      throw error;
    }
  }

  /**
   * Check if user has active subscription
   */
  public async hasActiveSubscription(): Promise<boolean> {
    try {
      const purchaserInfo = await this.getPurchaserInfo();
      return purchaserInfo.activeSubscriptions.length > 0;
    } catch (error) {
      console.error('❌ Failed to check subscription status:', error);
      return false;
    }
  }

  /**
   * Check if user has specific entitlement
   */
  public async hasEntitlement(entitlementId: string): Promise<boolean> {
    try {
      const purchaserInfo = await this.getPurchaserInfo();
      return purchaserInfo.entitlements.active[entitlementId]?.isActive || false;
    } catch (error) {
      console.error('❌ Failed to check entitlement:', error);
      return false;
    }
  }

  /**
   * Set user attributes for analytics and targeting
   */
  public async setAttributes(attributes: { [key: string]: string | null }): Promise<void> {
    this.ensureConfigured();

    try {
      // In real implementation:
      // await Purchases.setAttributes(attributes);
      
      console.log('✅ User attributes set:', attributes);
    } catch (error) {
      console.error('❌ Failed to set user attributes:', error);
      throw error;
    }
  }

  /**
   * Set push token for targeted campaigns
   */
  public async setPushToken(pushToken: string): Promise<void> {
    this.ensureConfigured();

    try {
      // In real implementation:
      // await Purchases.setPushToken(pushToken);
      
      console.log('✅ Push token set for subscription campaigns');
    } catch (error) {
      console.error('❌ Failed to set push token:', error);
      throw error;
    }
  }

  /**
   * Handle subscription changes and updates
   */
  public async handleSubscriptionUpdate(
    oldProductId: string, 
    newProductId: string
  ): Promise<PurchaserInfo> {
    this.ensureConfigured();

    try {
      console.log(`🔄 Updating subscription from ${oldProductId} to ${newProductId}`);
      
      // In real implementation would handle the upgrade/downgrade
      // This would typically involve calling purchaseProduct with upgrade parameters
      
      const purchaserInfo = await this.purchaseProduct(newProductId);
      console.log('✅ Subscription updated successfully');
      
      return purchaserInfo;
    } catch (error) {
      console.error('❌ Failed to update subscription:', error);
      throw error;
    }
  }

  private ensureConfigured(): void {
    if (!this.isConfigured) {
      throw new Error('IOSSubscriptionService not configured. Call initialize() first.');
    }
  }
}

export default IOSSubscriptionService.getInstance();
