import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

// Types
interface AnalyticsData {
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  engagement: {
    totalUsers: number;
    activeUsers: number;
    averageSessionDuration: number;
    averageEventsPerUser: number;
    retentionRate: number;
    bounceRate: number;
  };
  features: {
    topUsed: Array<{
      feature: string;
      usageCount: number;
      uniqueUsers: number;
      averageTimeSpent?: number;
    }>;
  };
  workouts: Array<{
    _id: string;
    count: number;
    totalDuration: number;
    avgDuration: number;
  }>;
  nutrition: Array<{
    _id: string;
    count: number;
    totalCalories: number;
    avgCalories: number;
  }>;
}

interface Props {
  navigation: any;
  route: any;
}

const UserAnalyticsScreen: React.FC<Props> = ({ navigation, route }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'workouts' | 'nutrition' | 'engagement'>('overview');

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Mock API call - replace with actual API integration
      const mockData: AnalyticsData = {
        period: selectedPeriod,
        dateRange: {
          startDate: new Date(Date.now() - (selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90) * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        },
        engagement: {
          totalUsers: 1,
          activeUsers: 1,
          averageSessionDuration: 1245000, // milliseconds
          averageEventsPerUser: 125,
          retentionRate: 0.85,
          bounceRate: 0.15
        },
        features: {
          topUsed: [
            { feature: 'Workout Tracking', usageCount: 45, uniqueUsers: 1, averageTimeSpent: 1800 },
            { feature: 'Nutrition Logging', usageCount: 32, uniqueUsers: 1, averageTimeSpent: 600 },
            { feature: 'Progress Photos', usageCount: 8, uniqueUsers: 1, averageTimeSpent: 300 },
            { feature: 'AI Recommendations', usageCount: 15, uniqueUsers: 1, averageTimeSpent: 450 }
          ]
        },
        workouts: [
          { _id: 'start', count: 48, totalDuration: 86400, avgDuration: 1800 },
          { _id: 'complete', count: 42, totalDuration: 75600, avgDuration: 1800 },
          { _id: 'pause', count: 6, totalDuration: 0, avgDuration: 0 }
        ],
        nutrition: [
          { _id: 'log_meal', count: 85, totalCalories: 127500, avgCalories: 1500 },
          { _id: 'scan_barcode', count: 12, totalCalories: 9600, avgCalories: 800 },
          { _id: 'add_custom_food', count: 8, totalCalories: 4000, avgCalories: 500 }
        ]
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      Alert.alert('Error', 'Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAnalyticsData();
  }, [selectedPeriod]);

  const formatDuration = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {['7d', '30d', '90d'].map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period && styles.periodButtonTextActive
          ]}>
            {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTabSelector = () => (
    <View style={styles.tabSelector}>
      {[
        { key: 'overview', label: 'Overview', icon: 'dashboard' },
        { key: 'workouts', label: 'Workouts', icon: 'fitness-center' },
        { key: 'nutrition', label: 'Nutrition', icon: 'restaurant' },
        { key: 'engagement', label: 'Usage', icon: 'analytics' }
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tabButton,
            activeTab === tab.key && styles.tabButtonActive
          ]}
          onPress={() => setActiveTab(tab.key as any)}
        >
          <MaterialIcons 
            name={tab.icon as any} 
            size={20} 
            color={activeTab === tab.key ? '#667eea' : '#666'} 
          />
          <Text style={[
            styles.tabButtonText,
            activeTab === tab.key && styles.tabButtonTextActive
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverviewTab = () => {
    if (!analyticsData) return null;

    const chartData = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        data: [20, 45, 28, 42],
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
        strokeWidth: 2
      }]
    };

    return (
      <View style={styles.tabContent}>
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <MaterialIcons name="timeline" size={24} color="#667eea" />
            <Text style={styles.summaryValue}>{analyticsData.engagement.averageEventsPerUser}</Text>
            <Text style={styles.summaryLabel}>Activities</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <MaterialIcons name="schedule" size={24} color="#4CAF50" />
            <Text style={styles.summaryValue}>{formatDuration(analyticsData.engagement.averageSessionDuration)}</Text>
            <Text style={styles.summaryLabel}>Avg Session</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <MaterialIcons name="trending-up" size={24} color="#FF6B6B" />
            <Text style={styles.summaryValue}>{Math.round(analyticsData.engagement.retentionRate * 100)}%</Text>
            <Text style={styles.summaryLabel}>Consistency</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <MaterialIcons name="star" size={24} color="#FFA726" />
            <Text style={styles.summaryValue}>{analyticsData.features.topUsed.length}</Text>
            <Text style={styles.summaryLabel}>Features Used</Text>
          </View>
        </View>

        {/* Activity Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Activity Trend</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={200}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#667eea'
              }
            }}
            style={styles.chart}
          />
        </View>

        {/* Top Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Most Used Features</Text>
          {analyticsData.features.topUsed.slice(0, 5).map((feature, index) => (
            <View key={feature.feature} style={styles.featureItem}>
              <View style={styles.featureInfo}>
                <Text style={styles.featureName}>{feature.feature}</Text>
                <Text style={styles.featureStats}>
                  {feature.usageCount} times • {formatDuration((feature.averageTimeSpent || 0) * 1000)}
                </Text>
              </View>
              <View style={styles.featureRank}>
                <Text style={styles.featureRankText}>#{index + 1}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderWorkoutsTab = () => {
    if (!analyticsData) return null;

    const workoutData = {
      labels: ['Started', 'Completed', 'Paused'],
      datasets: [{
        data: analyticsData.workouts.map(w => w.count)
      }]
    };

    return (
      <View style={styles.tabContent}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{analyticsData.workouts.find(w => w._id === 'complete')?.count || 0}</Text>
            <Text style={styles.statLabel}>Completed Workouts</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {formatDuration((analyticsData.workouts.find(w => w._id === 'complete')?.totalDuration || 0) * 1000)}
            </Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Workout Statistics</Text>
          <BarChart
            data={workoutData}
            width={screenWidth - 40}
            height={200}
            yAxisLabel="Workouts"
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            style={styles.chart}
          />
        </View>
      </View>
    );
  };

  const renderNutritionTab = () => {
    if (!analyticsData) return null;

    const totalMeals = analyticsData.nutrition.reduce((sum, item) => sum + item.count, 0);
    const avgCalories = analyticsData.nutrition.reduce((sum, item) => sum + item.totalCalories, 0) / totalMeals;

    return (
      <View style={styles.tabContent}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalMeals}</Text>
            <Text style={styles.statLabel}>Meals Logged</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.round(avgCalories)}</Text>
            <Text style={styles.statLabel}>Avg Calories/Day</Text>
          </View>
        </View>

        <View style={styles.nutritionList}>
          {analyticsData.nutrition.map((item) => (
            <View key={item._id} style={styles.nutritionItem}>
              <View style={styles.nutritionInfo}>
                <Text style={styles.nutritionAction}>
                  {item._id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
                <Text style={styles.nutritionStats}>
                  {item.count} times • {Math.round(item.avgCalories)} cal avg
                </Text>
              </View>
              <Text style={styles.nutritionTotal}>{formatNumber(item.totalCalories)} cal</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderEngagementTab = () => {
    if (!analyticsData) return null;

    return (
      <View style={styles.tabContent}>
        <View style={styles.engagementMetrics}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <MaterialIcons name="schedule" size={20} color="#667eea" />
              <Text style={styles.metricTitle}>Session Duration</Text>
            </View>
            <Text style={styles.metricValue}>
              {formatDuration(analyticsData.engagement.averageSessionDuration)}
            </Text>
            <Text style={styles.metricSubtext}>Average per session</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <MaterialIcons name="repeat" size={20} color="#4CAF50" />
              <Text style={styles.metricTitle}>Consistency Rate</Text>
            </View>
            <Text style={styles.metricValue}>
              {Math.round(analyticsData.engagement.retentionRate * 100)}%
            </Text>
            <Text style={styles.metricSubtext}>Weekly return rate</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <MaterialIcons name="touch-app" size={20} color="#FF6B6B" />
              <Text style={styles.metricTitle}>Engagement Score</Text>
            </View>
            <Text style={styles.metricValue}>
              {analyticsData.engagement.averageEventsPerUser}
            </Text>
            <Text style={styles.metricSubtext}>Actions per session</Text>
          </View>
        </View>

        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>Insights</Text>
          
          <View style={styles.insightCard}>
            <MaterialIcons name="trending-up" size={24} color="#4CAF50" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Great Progress!</Text>
              <Text style={styles.insightText}>
                Your consistency rate is 15% above average. Keep up the great work!
              </Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <MaterialIcons name="lightbulb-outline" size={24} color="#FFA726" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Tip for Better Results</Text>
              <Text style={styles.insightText}>
                Try logging meals more consistently to improve your nutrition tracking accuracy.
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !analyticsData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading your analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Your Analytics</Text>
            <Text style={styles.headerSubtitle}>Track your fitness journey</Text>
          </View>

          <TouchableOpacity style={styles.infoButton}>
            <MaterialIcons name="info-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#667eea']}
          />
        }
      >
        {renderPeriodSelector()}
        {renderTabSelector()}
        
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'workouts' && renderWorkoutsTab()}
        {activeTab === 'nutrition' && renderNutritionTab()}
        {activeTab === 'engagement' && renderEngagementTab()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  infoButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#667eea',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#f0f4ff',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginTop: 4,
  },
  tabButtonTextActive: {
    color: '#667eea',
  },
  tabContent: {
    marginBottom: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
  },
  featuresContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  featureInfo: {
    flex: 1,
  },
  featureName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  featureStats: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  featureRank: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  featureRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  nutritionList: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nutritionInfo: {
    flex: 1,
  },
  nutritionAction: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  nutritionStats: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  nutritionTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
  },
  engagementMetrics: {
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 12,
    color: '#666',
  },
  insightsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});

export default UserAnalyticsScreen;
