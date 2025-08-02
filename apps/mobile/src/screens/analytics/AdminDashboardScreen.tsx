import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import analyticsAPI from '../../services/analyticsAPI';

interface Props {
  navigation: any;
  route: any;
}

interface BusinessMetrics {
  revenue: {
    total: number;
    monthly: number;
    daily: number;
    growth: number;
  };
  users: {
    total: number;
    active: number;
    new: number;
    churn: number;
  };
  subscriptions: {
    active: number;
    new: number;
    cancelled: number;
    revenue: number;
  };
  engagement: {
    averageSessionTime: number;
    screenViews: number;
    featureUsage: Record<string, number>;
    retention: {
      day1: number;
      day7: number;
      day30: number;
    };
  };
  trends: Array<{
    date: string;
    revenue: number;
    users: number;
    sessions: number;
  }>;
}

const AdminDashboardScreen: React.FC<Props> = ({ navigation, route }) => {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'revenue' | 'engagement'>('overview');

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadBusinessMetrics();
  }, [selectedPeriod]);

  const loadBusinessMetrics = async () => {
    try {
      setLoading(true);
      
      // Get business metrics data
      const data = await analyticsAPI.getBusinessMetrics({
        timeRange: {
          startDate: new Date(Date.now() - getPeriodInMs(selectedPeriod)),
          endDate: new Date(),
        },
      });
      
      setMetrics(data || getMockBusinessMetrics());
    } catch (error) {
      console.error('Error loading business metrics:', error);
      setMetrics(getMockBusinessMetrics());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBusinessMetrics();
  };

  const getPeriodInMs = (period: string): number => {
    switch (period) {
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      case '30d': return 30 * 24 * 60 * 60 * 1000;
      case '90d': return 90 * 24 * 60 * 60 * 1000;
      default: return 30 * 24 * 60 * 60 * 1000;
    }
  };

  const getMockBusinessMetrics = (): BusinessMetrics => ({
    revenue: {
      total: 125430,
      monthly: 34520,
      daily: 1150,
      growth: 0.23,
    },
    users: {
      total: 8547,
      active: 6821,
      new: 342,
      churn: 0.05,
    },
    subscriptions: {
      active: 1256,
      new: 89,
      cancelled: 23,
      revenue: 31400,
    },
    engagement: {
      averageSessionTime: 12.5,
      screenViews: 45230,
      featureUsage: {
        'workout_tracking': 2340,
        'nutrition_logging': 1890,
        'progress_viewing': 1456,
        'social_features': 987,
        'premium_analytics': 567,
      },
      retention: {
        day1: 0.85,
        day7: 0.67,
        day30: 0.42,
      },
    },
    trends: [
      { date: '2025-07-01', revenue: 980, users: 234, sessions: 1456 },
      { date: '2025-07-02', revenue: 1120, users: 267, sessions: 1623 },
      { date: '2025-07-03', revenue: 1050, users: 245, sessions: 1534 },
      { date: '2025-07-04', revenue: 1340, users: 298, sessions: 1789 },
      { date: '2025-07-05', revenue: 1180, users: 276, sessions: 1654 },
      { date: '2025-07-06', revenue: 890, users: 203, sessions: 1345 },
      { date: '2025-07-07', revenue: 1450, users: 312, sessions: 1876 },
    ],
  });

  const renderMetricCard = (
    title: string,
    value: string | number,
    change?: number,
    icon?: string,
    color?: string
  ) => (
    <View style={[styles.metricCard, color && { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        {icon && (
          <MaterialIcons 
            name={icon as any} 
            size={24} 
            color={color || '#667eea'} 
          />
        )}
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      {change !== undefined && (
        <View style={styles.metricChange}>
          <MaterialIcons 
            name={change >= 0 ? 'trending-up' : 'trending-down'} 
            size={16} 
            color={change >= 0 ? '#4CAF50' : '#FF6B6B'} 
          />
          <Text style={[
            styles.metricChangeText,
            { color: change >= 0 ? '#4CAF50' : '#FF6B6B' }
          ]}>
            {Math.abs(change * 100).toFixed(1)}%
          </Text>
        </View>
      )}
    </View>
  );

  const renderRevenueChart = () => {
    if (!metrics) return null;

    const chartData = {
      labels: metrics.trends.map(item => new Date(item.date).getDate().toString()),
      datasets: [{
        data: metrics.trends.map(item => item.revenue),
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2
      }]
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Revenue Trend</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={200}
          yAxisSuffix="$"
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#4CAF50'
            }
          }}
          style={styles.chart}
        />
      </View>
    );
  };

  const renderUserChart = () => {
    if (!metrics) return null;

    const chartData = {
      labels: metrics.trends.map(item => new Date(item.date).getDate().toString()),
      datasets: [{
        data: metrics.trends.map(item => item.users),
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
        strokeWidth: 2
      }]
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>New Users</Text>
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
              r: '4',
              strokeWidth: '2',
              stroke: '#667eea'
            }
          }}
          style={styles.chart}
        />
      </View>
    );
  };

  const renderFeatureUsageChart = () => {
    if (!metrics) return null;

    const features = Object.entries(metrics.engagement.featureUsage);
    const colors = ['#667eea', '#4CAF50', '#FFA726', '#FF6B6B', '#9C27B0'];
    
    const chartData = features.map(([feature, usage], index) => ({
      name: feature.replace('_', ' '),
      count: usage,
      color: colors[index % colors.length],
      legendFontColor: '#333',
      legendFontSize: 12,
    }));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Feature Usage</Text>
        <PieChart
          data={chartData}
          width={screenWidth - 40}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>
    );
  };

  const renderRetentionChart = () => {
    if (!metrics) return null;

    const chartData = {
      labels: ['Day 1', 'Day 7', 'Day 30'],
      datasets: [{
        data: [
          metrics.engagement.retention.day1 * 100,
          metrics.engagement.retention.day7 * 100,
          metrics.engagement.retention.day30 * 100,
        ],
        colors: [
          (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          (opacity = 1) => `rgba(255, 167, 38, ${opacity})`,
          (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
        ]
      }]
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>User Retention</Text>
        <BarChart
          data={chartData}
          width={screenWidth - 40}
          height={200}
          yAxisLabel="Retention"
          yAxisSuffix="%"
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            }
          }}
          style={styles.chart}
        />
      </View>
    );
  };

  const renderOverviewTab = () => (
    <View>
      {/* Revenue Metrics */}
      <View style={styles.metricsGrid}>
        {renderMetricCard(
          'Total Revenue',
          `$${metrics?.revenue.total.toLocaleString()}`,
          metrics?.revenue.growth,
          'attach-money',
          '#4CAF50'
        )}
        {renderMetricCard(
          'Monthly Revenue',
          `$${metrics?.revenue.monthly.toLocaleString()}`,
          undefined,
          'calendar-today',
          '#4CAF50'
        )}
      </View>

      {/* User Metrics */}
      <View style={styles.metricsGrid}>
        {renderMetricCard(
          'Total Users',
          metrics?.users.total.toLocaleString() || '0',
          undefined,
          'people',
          '#667eea'
        )}
        {renderMetricCard(
          'Active Users',
          metrics?.users.active.toLocaleString() || '0',
          undefined,
          'person',
          '#667eea'
        )}
      </View>

      {/* Charts */}
      {renderRevenueChart()}
      {renderUserChart()}
    </View>
  );

  const renderUsersTab = () => (
    <View>
      <View style={styles.metricsGrid}>
        {renderMetricCard(
          'New Users',
          metrics?.users.new.toLocaleString() || '0',
          undefined,
          'person-add',
          '#4CAF50'
        )}
        {renderMetricCard(
          'Churn Rate',
          `${((metrics?.users.churn || 0) * 100).toFixed(1)}%`,
          undefined,
          'person-remove',
          '#FF6B6B'
        )}
      </View>

      {renderRetentionChart()}
      {renderUserChart()}
    </View>
  );

  const renderRevenueTab = () => (
    <View>
      <View style={styles.metricsGrid}>
        {renderMetricCard(
          'Subscription Revenue',
          `$${metrics?.subscriptions.revenue.toLocaleString()}`,
          undefined,
          'subscriptions',
          '#4CAF50'
        )}
        {renderMetricCard(
          'Active Subscriptions',
          metrics?.subscriptions.active.toLocaleString() || '0',
          undefined,
          'credit-card',
          '#667eea'
        )}
      </View>

      <View style={styles.metricsGrid}>
        {renderMetricCard(
          'New Subscriptions',
          metrics?.subscriptions.new.toLocaleString() || '0',
          undefined,
          'add-circle',
          '#4CAF50'
        )}
        {renderMetricCard(
          'Cancelled',
          metrics?.subscriptions.cancelled.toLocaleString() || '0',
          undefined,
          'cancel',
          '#FF6B6B'
        )}
      </View>

      {renderRevenueChart()}
    </View>
  );

  const renderEngagementTab = () => (
    <View>
      <View style={styles.metricsGrid}>
        {renderMetricCard(
          'Avg Session Time',
          `${metrics?.engagement.averageSessionTime.toFixed(1)}min`,
          undefined,
          'timer',
          '#FFA726'
        )}
        {renderMetricCard(
          'Screen Views',
          metrics?.engagement.screenViews.toLocaleString() || '0',
          undefined,
          'visibility',
          '#9C27B0'
        )}
      </View>

      {renderFeatureUsageChart()}
      {renderRetentionChart()}
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview': return renderOverviewTab();
      case 'users': return renderUsersTab();
      case 'revenue': return renderRevenueTab();
      case 'engagement': return renderEngagementTab();
      default: return renderOverviewTab();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
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
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>Business Intelligence</Text>
          </View>

          <TouchableOpacity 
            style={styles.exportButton}
            onPress={() => Alert.alert('Export', 'Export functionality coming soon!')}
          >
            <MaterialIcons name="file-download" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['7d', '30d', '90d'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period as any)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive
              ]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {[
            { key: 'overview', label: 'Overview', icon: 'dashboard' },
            { key: 'users', label: 'Users', icon: 'people' },
            { key: 'revenue', label: 'Revenue', icon: 'attach-money' },
            { key: 'engagement', label: 'Engagement', icon: 'bar-chart' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                selectedTab === tab.key && styles.activeTab
              ]}
              onPress={() => setSelectedTab(tab.key as any)}
            >
              <MaterialIcons 
                name={tab.icon as any} 
                size={16} 
                color={selectedTab === tab.key ? '#667eea' : 'rgba(255, 255, 255, 0.7)'} 
              />
              <Text style={[
                styles.tabText,
                selectedTab === tab.key && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
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
        {renderTabContent()}
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
    marginBottom: 20,
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
  exportButton: {
    padding: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: 'white',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  periodButtonTextActive: {
    color: '#667eea',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#667eea',
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
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
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
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricChangeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 12,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 8,
  },
});

export default AdminDashboardScreen;
