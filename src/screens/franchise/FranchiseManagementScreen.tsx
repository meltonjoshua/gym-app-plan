import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  FlatList,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface FranchiseLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  manager: string;
  memberCount: number;
  monthlyRevenue: number;
  profitMargin: number;
  memberRetention: number;
  customerSatisfaction: number;
  status: 'active' | 'pending' | 'inactive';
  openDate: string;
}

interface PerformanceMetric {
  locationId: string;
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  target: number;
}

const FranchiseManagementScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = React.useState<'overview' | 'locations' | 'performance' | 'branding'>('overview');
  
  const franchiseOverview = {
    totalLocations: 47,
    activeLocations: 43,
    totalMembers: 52840,
    monthlyRevenue: 1247600,
    averageProfit: 24.8,
    brandConsistency: 87.3,
    customerSatisfaction: 4.5,
    memberRetention: 86.7
  };

  const locations: FranchiseLocation[] = [
    {
      id: 'loc_001',
      name: 'FitTracker Downtown Seattle',
      address: '123 Pine Street',
      city: 'Seattle',
      state: 'WA',
      manager: 'Sarah Johnson',
      memberCount: 1250,
      monthlyRevenue: 28500,
      profitMargin: 22.4,
      memberRetention: 88.3,
      customerSatisfaction: 4.6,
      status: 'active',
      openDate: '2022-03-15'
    },
    {
      id: 'loc_002',
      name: 'FitTracker Portland Central',
      address: '456 Broadway Ave',
      city: 'Portland',
      state: 'OR',
      manager: 'Mike Chen',
      memberCount: 980,
      monthlyRevenue: 22100,
      profitMargin: 18.7,
      memberRetention: 85.1,
      customerSatisfaction: 4.4,
      status: 'active',
      openDate: '2021-11-20'
    },
    {
      id: 'loc_003',
      name: 'FitTracker San Francisco Mission',
      address: '789 Mission Street',
      city: 'San Francisco',
      state: 'CA',
      manager: 'Emily Rodriguez',
      memberCount: 1450,
      monthlyRevenue: 35200,
      profitMargin: 28.9,
      memberRetention: 91.2,
      customerSatisfaction: 4.7,
      status: 'active',
      openDate: '2022-01-10'
    },
    {
      id: 'loc_004',
      name: 'FitTracker Denver Tech Center',
      address: '321 Tech Center Dr',
      city: 'Denver',
      state: 'CO',
      manager: 'David Kim',
      memberCount: 1150,
      monthlyRevenue: 26800,
      profitMargin: 25.1,
      memberRetention: 87.9,
      customerSatisfaction: 4.5,
      status: 'active',
      openDate: '2022-07-05'
    },
    {
      id: 'loc_005',
      name: 'FitTracker Austin Downtown',
      address: '654 Congress Ave',
      city: 'Austin',
      state: 'TX',
      manager: 'Lisa Wong',
      memberCount: 890,
      monthlyRevenue: 19200,
      profitMargin: 20.3,
      memberRetention: 82.6,
      customerSatisfaction: 4.3,
      status: 'pending',
      openDate: '2024-02-01'
    }
  ];

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [985000, 1020000, 1125000, 1180000, 1205000, 1247600],
      strokeWidth: 3,
      color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`
    }]
  };

  const locationPerformanceData = {
    labels: ['SEA', 'PORT', 'SF', 'DEN', 'AUS'],
    datasets: [{
      data: [28.5, 22.1, 35.2, 26.8, 19.2]
    }]
  };

  const performanceMetrics: PerformanceMetric[] = [
    { locationId: 'loc_001', metric: 'Revenue Growth', value: 12.8, trend: 'up', target: 15.0 },
    { locationId: 'loc_002', metric: 'Member Retention', value: 85.1, trend: 'stable', target: 88.0 },
    { locationId: 'loc_003', metric: 'Customer Satisfaction', value: 4.7, trend: 'up', target: 4.5 },
    { locationId: 'loc_004', metric: 'Profit Margin', value: 25.1, trend: 'up', target: 23.0 },
    { locationId: 'loc_005', metric: 'Member Acquisition', value: 145, trend: 'down', target: 180 }
  ];

  const renderOverviewCard = (title: string, value: string | number, icon: string, change?: string) => (
    <View style={styles.overviewCard}>
      <View style={styles.overviewCardHeader}>
        <MaterialIcons name={icon as any} size={24} color="#667eea" />
        {change && (
          <View style={[styles.changeIndicator, { backgroundColor: change.startsWith('+') ? '#4CAF50' : '#FF6B6B' }]}>
            <Text style={styles.changeText}>{change}</Text>
          </View>
        )}
      </View>
      <Text style={styles.overviewCardValue}>{value}</Text>
      <Text style={styles.overviewCardTitle}>{title}</Text>
    </View>
  );

  const renderLocationCard = ({ item }: { item: FranchiseLocation }) => (
    <TouchableOpacity style={styles.locationCard}>
      <View style={styles.locationHeader}>
        <View style={styles.locationInfo}>
          <Text style={styles.locationName}>{item.name}</Text>
          <Text style={styles.locationAddress}>{item.city}, {item.state}</Text>
          <Text style={styles.locationManager}>Manager: {item.manager}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'active' ? '#4CAF50' : item.status === 'pending' ? '#FF9800' : '#f44336' }
        ]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.locationMetrics}>
        <View style={styles.locationMetric}>
          <Text style={styles.metricValue}>{item.memberCount}</Text>
          <Text style={styles.metricLabel}>Members</Text>
        </View>
        <View style={styles.locationMetric}>
          <Text style={styles.metricValue}>${(item.monthlyRevenue / 1000).toFixed(1)}K</Text>
          <Text style={styles.metricLabel}>Revenue</Text>
        </View>
        <View style={styles.locationMetric}>
          <Text style={styles.metricValue}>{item.profitMargin}%</Text>
          <Text style={styles.metricLabel}>Profit</Text>
        </View>
        <View style={styles.locationMetric}>
          <Text style={styles.metricValue}>{item.customerSatisfaction}</Text>
          <Text style={styles.metricLabel}>Rating</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.viewDetailsButton}>
        <Text style={styles.viewDetailsText}>View Details</Text>
        <MaterialIcons name="arrow-forward-ios" size={14} color="#667eea" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPerformanceMetric = (metric: PerformanceMetric) => {
    const location = locations.find(loc => loc.id === metric.locationId);
    return (
      <View key={`${metric.locationId}-${metric.metric}`} style={styles.performanceCard}>
        <View style={styles.performanceHeader}>
          <View>
            <Text style={styles.performanceLocation}>{location?.name.replace('FitTracker ', '') || 'Unknown'}</Text>
            <Text style={styles.performanceMetric}>{metric.metric}</Text>
          </View>
          <View style={styles.trendContainer}>
            <MaterialIcons 
              name={metric.trend === 'up' ? 'trending-up' : metric.trend === 'down' ? 'trending-down' : 'trending-flat'} 
              size={20} 
              color={metric.trend === 'up' ? '#4CAF50' : metric.trend === 'down' ? '#FF6B6B' : '#666'} 
            />
          </View>
        </View>
        <View style={styles.performanceValues}>
          <Text style={styles.performanceValue}>{metric.value}</Text>
          <Text style={styles.performanceTarget}>Target: {metric.target}</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                backgroundColor: metric.value >= metric.target ? '#4CAF50' : '#FF9800'
              }
            ]} 
          />
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <View>
            {/* Overview Cards */}
            <View style={styles.overviewGrid}>
              {renderOverviewCard('Total Locations', franchiseOverview.totalLocations, 'store', undefined)}
              {renderOverviewCard('Total Members', franchiseOverview.totalMembers.toLocaleString(), 'people', '+8.2%')}
              {renderOverviewCard('Monthly Revenue', `$${(franchiseOverview.monthlyRevenue / 1000).toFixed(0)}K`, 'attach-money', '+12.5%')}
              {renderOverviewCard('Avg Profit Margin', `${franchiseOverview.averageProfit}%`, 'trending-up', '+2.1%')}
              {renderOverviewCard('Customer Satisfaction', franchiseOverview.customerSatisfaction, 'star', '+0.3%')}
              {renderOverviewCard('Member Retention', `${franchiseOverview.memberRetention}%`, 'group', '+1.8%')}
            </View>

            {/* Revenue Chart */}
            <View style={styles.chartSection}>
              <Text style={styles.sectionTitle}>Revenue Trends</Text>
              <View style={styles.chartContainer}>
                <LineChart
                  data={revenueData}
                  width={width - 40}
                  height={200}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                    strokeWidth: 3,
                    barPercentage: 0.5,
                    useShadowColorFromDataset: false,
                  }}
                  bezier
                  style={styles.chart}
                />
              </View>
            </View>
          </View>
        );

      case 'locations':
        return (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Locations</Text>
              <TouchableOpacity style={styles.addButton}>
                <MaterialIcons name="add" size={20} color="#667eea" />
                <Text style={styles.addButtonText}>Add Location</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={locations}
              renderItem={renderLocationCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.locationsList}
            />
          </View>
        );

      case 'performance':
        return (
          <View>
            <Text style={styles.sectionTitle}>Performance Analytics</Text>
            
            {/* Performance Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Revenue by Location (K)</Text>
              <BarChart
                data={locationPerformanceData}
                width={width - 40}
                height={200}
                chartConfig={{
                  backgroundColor: 'transparent',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                  strokeWidth: 2,
                  barPercentage: 0.7,
                }}
                style={styles.chart}
                verticalLabelRotation={0}
              />
            </View>

            {/* Performance Metrics */}
            <View style={styles.performanceMetrics}>
              <Text style={styles.subsectionTitle}>Key Performance Indicators</Text>
              {performanceMetrics.map(renderPerformanceMetric)}
            </View>
          </View>
        );

      case 'branding':
        return (
          <View>
            <Text style={styles.sectionTitle}>Brand Management</Text>
            
            {/* Brand Consistency Score */}
            <View style={styles.brandCard}>
              <View style={styles.brandHeader}>
                <MaterialIcons name="branding-watermark" size={24} color="#667eea" />
                <Text style={styles.brandTitle}>Brand Consistency Score</Text>
              </View>
              <Text style={styles.brandScore}>{franchiseOverview.brandConsistency}%</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${franchiseOverview.brandConsistency}%`, backgroundColor: '#4CAF50' }]} 
                />
              </View>
            </View>

            {/* Branding Guidelines */}
            <View style={styles.brandingSection}>
              <Text style={styles.subsectionTitle}>Branding Guidelines</Text>
              
              <TouchableOpacity style={styles.brandingItem}>
                <MaterialIcons name="palette" size={20} color="#667eea" />
                <Text style={styles.brandingItemText}>Color Palette & Logo Usage</Text>
                <MaterialIcons name="arrow-forward-ios" size={16} color="#ccc" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.brandingItem}>
                <MaterialIcons name="font-download" size={20} color="#667eea" />
                <Text style={styles.brandingItemText}>Typography Guidelines</Text>
                <MaterialIcons name="arrow-forward-ios" size={16} color="#ccc" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.brandingItem}>
                <MaterialIcons name="campaign" size={20} color="#667eea" />
                <Text style={styles.brandingItemText}>Marketing Materials</Text>
                <MaterialIcons name="arrow-forward-ios" size={16} color="#ccc" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.brandingItem}>
                <MaterialIcons name="store" size={20} color="#667eea" />
                <Text style={styles.brandingItemText}>Store Layout Standards</Text>
                <MaterialIcons name="arrow-forward-ios" size={16} color="#ccc" />
              </TouchableOpacity>
            </View>

            {/* White-Label Customization */}
            <View style={styles.brandingSection}>
              <Text style={styles.subsectionTitle}>White-Label Customization</Text>
              
              <TouchableOpacity style={styles.customizationButton}>
                <Text style={styles.customizationButtonText}>Customize App Branding</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Franchise Management</Text>
        <Text style={styles.headerSubtitle}>FitTracker Pro Network</Text>
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {([
            { key: 'overview', label: 'Overview', icon: 'dashboard' },
            { key: 'locations', label: 'Locations', icon: 'store' },
            { key: 'performance', label: 'Performance', icon: 'analytics' },
            { key: 'branding', label: 'Branding', icon: 'branding-watermark' }
          ] as const).map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
              onPress={() => setSelectedTab(tab.key)}
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#667eea',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
    marginBottom: 20,
  },
  overviewCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    margin: 5,
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  changeIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  changeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  overviewCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  overviewCardTitle: {
    fontSize: 12,
    color: '#666',
  },
  chartSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  chart: {
    borderRadius: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  locationsList: {
    maxHeight: 600,
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  locationManager: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  locationMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  locationMetric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  viewDetailsText: {
    color: '#667eea',
    fontWeight: '500',
    marginRight: 5,
  },
  performanceMetrics: {
    marginTop: 20,
  },
  performanceCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  performanceLocation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  performanceMetric: {
    fontSize: 12,
    color: '#666',
  },
  trendContainer: {
    alignItems: 'center',
  },
  performanceValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  performanceTarget: {
    fontSize: 12,
    color: '#666',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  brandCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  brandScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 15,
  },
  brandingSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  brandingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  brandingItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  customizationButton: {
    backgroundColor: '#667eea',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  customizationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FranchiseManagementScreen;
