import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Switch
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  recommended?: boolean;
  popular?: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

const SubscriptionManagementScreen: React.FC = () => {
  const [currentSubscription, setCurrentSubscription] = React.useState<SubscriptionTier | null>(null);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
  const [isYearlyBilling, setIsYearlyBilling] = React.useState(false);
  const [subscriptionTiers, setSubscriptionTiers] = React.useState<SubscriptionTier[]>([
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'monthly',
      features: [
        'Basic workout tracking',
        'Exercise library access',
        'Limited progress analytics',
        'Community features'
      ]
    },
    {
      id: 'premium',
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
        'Priority support'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 19.99,
      interval: 'monthly',
      features: [
        'All Premium features',
        'Virtual personal trainer',
        'Custom meal planning',
        'Professional nutrition AI',
        'Advanced form analysis',
        'Export capabilities'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 49.99,
      interval: 'monthly',
      recommended: true,
      features: [
        'All Professional features',
        'Corporate wellness dashboard',
        'Team management',
        'Advanced analytics',
        'API access',
        'Custom integrations',
        'Dedicated support'
      ]
    }
  ]);

  React.useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      // Simulate loading current subscription
      setCurrentSubscription(subscriptionTiers[1]); // Premium subscription
      
      // Simulate loading payment methods
      setPaymentMethods([
        {
          id: 'pm_1',
          type: 'card',
          brand: 'visa',
          last4: '4242',
          expiryMonth: 12,
          expiryYear: 2025
        }
      ]);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    }
  };

  const handleUpgrade = (tier: SubscriptionTier) => {
    Alert.alert(
      'Upgrade Subscription',
      `Are you sure you want to upgrade to ${tier.name} for $${tier.price}/${tier.interval}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Upgrade', 
          onPress: () => processSubscriptionChange(tier)
        }
      ]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        { 
          text: 'Cancel', 
          style: 'destructive',
          onPress: () => processCancellation()
        }
      ]
    );
  };

  const processSubscriptionChange = async (tier: SubscriptionTier) => {
    try {
      // Simulate subscription change
      setCurrentSubscription(tier);
      Alert.alert('Success', `Successfully upgraded to ${tier.name}!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to process subscription change. Please try again.');
    }
  };

  const processCancellation = async () => {
    try {
      // Simulate cancellation
      setCurrentSubscription(subscriptionTiers[0]); // Free tier
      Alert.alert('Subscription Canceled', 'Your subscription has been canceled. You will retain access until the end of your billing period.');
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
    }
  };

  const addPaymentMethod = () => {
    Alert.alert('Add Payment Method', 'This would open payment method selection');
  };

  const renderSubscriptionTier = (tier: SubscriptionTier) => (
    <View key={tier.id} style={[
      styles.tierCard,
      currentSubscription?.id === tier.id && styles.currentTierCard,
      tier.recommended && styles.recommendedTier
    ]}>
      {tier.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}
      {tier.recommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>RECOMMENDED</Text>
        </View>
      )}
      
      <Text style={styles.tierName}>{tier.name}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.priceAmount}>
          ${isYearlyBilling ? (tier.price * 12 * 0.8).toFixed(2) : tier.price.toFixed(2)}
        </Text>
        <Text style={styles.priceInterval}>
          /{isYearlyBilling ? 'year' : 'month'}
        </Text>
        {isYearlyBilling && tier.price > 0 && (
          <Text style={styles.savings}>Save 20%</Text>
        )}
      </View>
      
      <View style={styles.featuresContainer}>
        {tier.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      
      {currentSubscription?.id === tier.id ? (
        <View style={styles.currentSubscriptionButton}>
          <Text style={styles.currentSubscriptionText}>Current Plan</Text>
        </View>
      ) : tier.id === 'free' && (currentSubscription?.price ?? 0) > 0 ? (
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={handleCancelSubscription}
        >
          <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={[styles.upgradeButton, tier.recommended && styles.recommendedButton]}
          onPress={() => handleUpgrade(tier)}
        >
          <Text style={[styles.upgradeButtonText, tier.recommended && styles.recommendedButtonText]}>
            {tier.id === 'free' ? 'Downgrade' : 'Upgrade'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPaymentMethod = (method: PaymentMethod) => (
    <View key={method.id} style={styles.paymentMethodCard}>
      <View style={styles.paymentMethodInfo}>
        <MaterialIcons 
          name={method.type === 'card' ? 'credit-card' : 'account-balance-wallet'} 
          size={24} 
          color="#666" 
        />
        <View style={styles.paymentMethodDetails}>
          <Text style={styles.paymentMethodType}>
            {method.brand?.toUpperCase()} •••• {method.last4}
          </Text>
          {method.expiryMonth && method.expiryYear && (
            <Text style={styles.paymentMethodExpiry}>
              Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity>
        <MaterialIcons name="more-vert" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Subscription Management</Text>
        <Text style={styles.headerSubtitle}>
          Manage your subscription and billing
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Billing Toggle */}
        <View style={styles.billingToggleContainer}>
          <Text style={styles.billingToggleLabel}>Annual Billing (Save 20%)</Text>
          <Switch
            value={isYearlyBilling}
            onValueChange={setIsYearlyBilling}
            trackColor={{ false: '#ccc', true: '#667eea' }}
            thumbColor={isYearlyBilling ? '#fff' : '#f4f3f4'}
          />
        </View>

        {/* Subscription Tiers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          {subscriptionTiers.map(renderSubscriptionTier)}
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Methods</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={addPaymentMethod}
            >
              <MaterialIcons name="add" size={20} color="#667eea" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {paymentMethods.length > 0 ? (
            paymentMethods.map(renderPaymentMethod)
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="credit-card" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No payment methods added</Text>
              <TouchableOpacity 
                style={styles.addPaymentButton}
                onPress={addPaymentMethod}
              >
                <Text style={styles.addPaymentButtonText}>Add Payment Method</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Billing History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing History</Text>
          <View style={styles.billingHistoryCard}>
            <View style={styles.billingHistoryItem}>
              <View>
                <Text style={styles.billingHistoryDate}>Dec 15, 2024</Text>
                <Text style={styles.billingHistoryDescription}>Premium Subscription</Text>
              </View>
              <Text style={styles.billingHistoryAmount}>$9.99</Text>
            </View>
            <View style={styles.billingHistoryItem}>
              <View>
                <Text style={styles.billingHistoryDate}>Nov 15, 2024</Text>
                <Text style={styles.billingHistoryDescription}>Premium Subscription</Text>
              </View>
              <Text style={styles.billingHistoryAmount}>$9.99</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 30,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    padding: 20,
  },
  billingToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  billingToggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f4ff',
    borderRadius: 20,
  },
  addButtonText: {
    color: '#667eea',
    fontWeight: '500',
    marginLeft: 4,
  },
  tierCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  currentTierCard: {
    borderColor: '#4CAF50',
  },
  recommendedTier: {
    borderColor: '#667eea',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tierName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  priceInterval: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  savings: {
    backgroundColor: '#4CAF50',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  upgradeButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  recommendedButton: {
    backgroundColor: '#667eea',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recommendedButtonText: {
    color: 'white',
  },
  currentSubscriptionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  currentSubscriptionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentMethodCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodDetails: {
    marginLeft: 12,
  },
  paymentMethodType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  paymentMethodExpiry: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 15,
  },
  addPaymentButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addPaymentButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  billingHistoryCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  billingHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  billingHistoryDate: {
    fontSize: 14,
    color: '#666',
  },
  billingHistoryDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  billingHistoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default SubscriptionManagementScreen;
