import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Switch,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, PieChart } from 'react-native-chart-kit';
import analyticsAPI from '../../services/analyticsAPI';

interface Props {
  navigation: any;
  route: any;
}

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  schedule: {
    frequency: string;
    time: string;
    timezone: string;
    enabled: boolean;
  };
  recipients: string[];
  metrics: string[];
  lastRun: string;
  nextRun: string;
  status: 'active' | 'paused' | 'failed';
  format: 'pdf' | 'excel' | 'email';
  filters: {
    dateRange: string;
    userSegment?: string;
    regions?: string[];
  };
}

interface ReportPreview {
  title: string;
  period: string;
  keyMetrics: {
    totalUsers: number;
    activeUsers: number;
    revenue: number;
    retention: number;
  };
  trends: {
    userGrowth: number[];
    revenueGrowth: number[];
  };
  insights: string[];
}

const AutomatedReportsScreen: React.FC<Props> = ({ navigation, route }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'active' | 'scheduled' | 'templates'>('active');
  const [previewData, setPreviewData] = useState<ReportPreview | null>(null);

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadReports();
    loadPreviewData();
  }, [selectedTab]);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      const data = await analyticsAPI.getAutomatedReports(selectedTab);
      setReports(data || getMockReports());
    } catch (error) {
      console.error('Error loading reports:', error);
      setReports(getMockReports());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadPreviewData = async () => {
    try {
      const data = await analyticsAPI.getReportPreview();
      setPreviewData(data || getMockPreviewData());
    } catch (error) {
      console.error('Error loading preview data:', error);
      setPreviewData(getMockPreviewData());
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
    loadPreviewData();
  };

  const getMockReports = (): Report[] => [
    {
      id: 'report-1',
      name: 'Daily Business Summary',
      description: 'Daily overview of key business metrics and user activity',
      type: 'daily',
      schedule: {
        frequency: 'daily',
        time: '09:00',
        timezone: 'UTC',
        enabled: true,
      },
      recipients: ['admin@fittracker.com', 'team@fittracker.com'],
      metrics: ['Daily Active Users', 'Revenue', 'New Signups', 'Retention Rate'],
      lastRun: '2025-07-24T09:00:00Z',
      nextRun: '2025-07-25T09:00:00Z',
      status: 'active',
      format: 'email',
      filters: {
        dateRange: 'last_24_hours',
      },
    },
    {
      id: 'report-2',
      name: 'Weekly Performance Report',
      description: 'Comprehensive weekly analysis with trends and insights',
      type: 'weekly',
      schedule: {
        frequency: 'weekly',
        time: '08:00',
        timezone: 'UTC',
        enabled: true,
      },
      recipients: ['ceo@fittracker.com', 'marketing@fittracker.com'],
      metrics: ['User Growth', 'Revenue Trends', 'Feature Usage', 'Churn Analysis'],
      lastRun: '2025-07-21T08:00:00Z',
      nextRun: '2025-07-28T08:00:00Z',
      status: 'active',
      format: 'pdf',
      filters: {
        dateRange: 'last_7_days',
        userSegment: 'all_users',
      },
    },
    {
      id: 'report-3',
      name: 'Monthly Executive Dashboard',
      description: 'High-level executive summary with strategic insights',
      type: 'monthly',
      schedule: {
        frequency: 'monthly',
        time: '10:00',
        timezone: 'UTC',
        enabled: true,
      },
      recipients: ['ceo@fittracker.com', 'board@fittracker.com'],
      metrics: ['MRR Growth', 'Customer LTV', 'Market Share', 'Strategic KPIs'],
      lastRun: '2025-07-01T10:00:00Z',
      nextRun: '2025-08-01T10:00:00Z',
      status: 'active',
      format: 'pdf',
      filters: {
        dateRange: 'last_30_days',
        userSegment: 'all_users',
        regions: ['US', 'EU', 'APAC'],
      },
    },
    {
      id: 'report-4',
      name: 'User Engagement Report',
      description: 'Detailed analysis of user behavior and feature adoption',
      type: 'weekly',
      schedule: {
        frequency: 'weekly',
        time: '16:00',
        timezone: 'UTC',
        enabled: false,
      },
      recipients: ['product@fittracker.com', 'ux@fittracker.com'],
      metrics: ['Session Duration', 'Feature Usage', 'User Flows', 'Engagement Score'],
      lastRun: '2025-07-14T16:00:00Z',
      nextRun: '2025-07-28T16:00:00Z',
      status: 'paused',
      format: 'excel',
      filters: {
        dateRange: 'last_7_days',
        userSegment: 'active_users',
      },
    },
  ];

  const getMockPreviewData = (): ReportPreview => ({
    title: 'Business Intelligence Summary',
    period: 'July 1-24, 2025',
    keyMetrics: {
      totalUsers: 8547,
      activeUsers: 6234,
      revenue: 125430,
      retention: 0.73,
    },
    trends: {
      userGrowth: [850, 920, 1050, 1150, 1200, 1300, 1420],
      revenueGrowth: [15200, 16800, 18200, 19500, 20100, 21800, 23500],
    },
    insights: [
      'User growth accelerated by 18% week-over-week',
      'Premium conversion rate increased to 12.3%',
      'Mobile engagement up 25% compared to last month',
      'Workout completion rate reached all-time high of 89%',
      'Customer satisfaction score improved to 4.7/5',
    ],
  });

  const toggleReportStatus = async (reportId: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      const newStatus = report.status === 'active' ? 'paused' : 'active';
      
      // Update local state
      setReports(prev => prev.map(r => 
        r.id === reportId 
          ? { ...r, status: newStatus, schedule: { ...r.schedule, enabled: newStatus === 'active' } }
          : r
      ));

      // Call API
      await analyticsAPI.updateReportStatus(reportId, newStatus);
      
      Alert.alert(
        'Success',
        `Report ${newStatus === 'active' ? 'activated' : 'paused'} successfully`
      );
    } catch (error) {
      console.error('Error updating report status:', error);
      Alert.alert('Error', 'Failed to update report status');
    }
  };

  const runReportNow = async (reportId: string) => {
    try {
      await analyticsAPI.runReportNow(reportId);
      Alert.alert('Success', 'Report is being generated and will be sent shortly');
    } catch (error) {
      console.error('Error running report:', error);
      Alert.alert('Error', 'Failed to run report');
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'paused': return '#FFA726';
      case 'failed': return '#FF6B6B';
      default: return '#999';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'active': return 'play-arrow';
      case 'paused': return 'pause';
      case 'failed': return 'error';
      default: return 'help';
    }
  };

  const getFrequencyIcon = (type: string): string => {
    switch (type) {
      case 'daily': return 'today';
      case 'weekly': return 'date-range';
      case 'monthly': return 'calendar-month';
      default: return 'schedule';
    }
  };

  const renderReportCard = (report: Report) => (
    <View key={report.id} style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportTitleContainer}>
          <MaterialIcons 
            name={getFrequencyIcon(report.type) as any} 
            size={20} 
            color="#667eea" 
          />
          <Text style={styles.reportName}>{report.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
            <MaterialIcons 
              name={getStatusIcon(report.status) as any} 
              size={12} 
              color="white" 
            />
            <Text style={styles.statusText}>
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.reportDescription}>{report.description}</Text>
      </View>

      <View style={styles.reportDetails}>
        <View style={styles.detailItem}>
          <MaterialIcons name="schedule" size={16} color="#666" />
          <Text style={styles.detailText}>
            {report.schedule.frequency} at {report.schedule.time}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialIcons name="people" size={16} color="#666" />
          <Text style={styles.detailText}>
            {report.recipients.length} recipient{report.recipients.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialIcons name="assessment" size={16} color="#666" />
          <Text style={styles.detailText}>
            {report.metrics.length} metric{report.metrics.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <View style={styles.reportActions}>
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>
            {report.status === 'active' ? 'Active' : 'Paused'}
          </Text>
          <Switch
            value={report.status === 'active'}
            onValueChange={() => toggleReportStatus(report.id)}
            trackColor={{ false: '#ccc', true: '#667eea' }}
            thumbColor={report.status === 'active' ? '#fff' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => runReportNow(report.id)}
        >
          <MaterialIcons name="play-arrow" size={16} color="#667eea" />
          <Text style={styles.actionButtonText}>Run Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Edit Report', 'Edit functionality coming soon!')}
        >
          <MaterialIcons name="edit" size={16} color="#667eea" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.reportTiming}>
        <Text style={styles.timingText}>
          Last run: {new Date(report.lastRun).toLocaleDateString()}
        </Text>
        <Text style={styles.timingText}>
          Next run: {new Date(report.nextRun).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const renderPreviewSection = () => {
    if (!previewData) return null;

    const userGrowthData = {
      labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
      datasets: [{
        data: previewData.trends.userGrowth,
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
        strokeWidth: 3,
      }]
    };

    const revenueData = {
      labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
      datasets: [{
        data: previewData.trends.revenueGrowth,
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 3,
      }]
    };

    return (
      <View style={styles.previewSection}>
        <Text style={styles.sectionTitle}>Latest Report Preview</Text>
        
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>{previewData.title}</Text>
            <Text style={styles.previewPeriod}>{previewData.period}</Text>
          </View>

          {/* Key Metrics */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {previewData.keyMetrics.totalUsers.toLocaleString()}
              </Text>
              <Text style={styles.metricLabel}>Total Users</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {previewData.keyMetrics.activeUsers.toLocaleString()}
              </Text>
              <Text style={styles.metricLabel}>Active Users</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                ${previewData.keyMetrics.revenue.toLocaleString()}
              </Text>
              <Text style={styles.metricLabel}>Revenue</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {Math.round(previewData.keyMetrics.retention * 100)}%
              </Text>
              <Text style={styles.metricLabel}>Retention</Text>
            </View>
          </View>

          {/* Charts */}
          <View style={styles.chartsContainer}>
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>User Growth Trend</Text>
              <LineChart
                data={userGrowthData}
                width={screenWidth - 80}
                height={150}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: '#667eea'
                  }
                }}
                style={styles.chart}
                bezier
              />
            </View>

            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>Revenue Growth</Text>
              <LineChart
                data={revenueData}
                width={screenWidth - 80}
                height={150}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: '#4CAF50'
                  }
                }}
                style={styles.chart}
                bezier
              />
            </View>
          </View>

          {/* Key Insights */}
          <View style={styles.insightsContainer}>
            <Text style={styles.insightsTitle}>Key Insights</Text>
            {previewData.insights.map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <MaterialIcons name="lightbulb" size={16} color="#FFA726" />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading automated reports...</Text>
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
            <Text style={styles.headerTitle}>Automated Reports</Text>
            <Text style={styles.headerSubtitle}>Business intelligence delivery</Text>
          </View>

          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => Alert.alert('Create Report', 'Create new report functionality coming soon!')}
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {[
            { key: 'active', label: 'Active', count: reports.filter(r => r.status === 'active').length },
            { key: 'scheduled', label: 'All', count: reports.length },
            { key: 'templates', label: 'Templates', count: 3 },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                selectedTab === tab.key && styles.activeTab
              ]}
              onPress={() => setSelectedTab(tab.key as any)}
            >
              <Text style={[
                styles.tabText,
                selectedTab === tab.key && styles.activeTabText
              ]}>
                {tab.label} ({tab.count})
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
        {selectedTab === 'active' && renderPreviewSection()}
        
        {selectedTab !== 'templates' ? (
          <>
            {reports
              .filter(report => selectedTab === 'active' ? report.status === 'active' : true)
              .map(renderReportCard)}
            
            {reports.filter(report => selectedTab === 'active' ? report.status === 'active' : true).length === 0 && (
              <View style={styles.emptyState}>
                <MaterialIcons name="assessment" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No {selectedTab} reports found</Text>
                <Text style={styles.emptySubtext}>
                  {selectedTab === 'active' 
                    ? 'No active automated reports at the moment' 
                    : 'Create your first automated report to get started'}
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.templatesContainer}>
            <Text style={styles.sectionTitle}>Report Templates</Text>
            
            {[
              {
                name: 'Daily Metrics Summary',
                description: 'Key business metrics delivered daily',
                metrics: ['DAU', 'Revenue', 'Signups'],
              },
              {
                name: 'Weekly Performance Review',
                description: 'Comprehensive weekly analysis',
                metrics: ['Growth', 'Retention', 'Engagement'],
              },
              {
                name: 'Monthly Executive Brief',
                description: 'High-level strategic overview',
                metrics: ['MRR', 'LTV', 'Churn'],
              },
            ].map((template, index) => (
              <TouchableOpacity
                key={index}
                style={styles.templateCard}
                onPress={() => Alert.alert('Use Template', 'Template functionality coming soon!')}
              >
                <View style={styles.templateHeader}>
                  <MaterialIcons name="description" size={24} color="#667eea" />
                  <Text style={styles.templateName}>{template.name}</Text>
                </View>
                <Text style={styles.templateDescription}>{template.description}</Text>
                <View style={styles.templateMetrics}>
                  {template.metrics.map((metric, idx) => (
                    <View key={idx} style={styles.metricTag}>
                      <Text style={styles.metricTagText}>{metric}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  createButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
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
  previewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  previewPeriod: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  chartsContainer: {
    marginBottom: 20,
  },
  chartSection: {
    marginBottom: 20,
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
  insightsContainer: {
    marginTop: 20,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  reportCard: {
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
  reportHeader: {
    marginBottom: 12,
  },
  reportTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  reportDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  reportActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f2ff',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#667eea',
    marginLeft: 4,
    fontWeight: '500',
  },
  reportTiming: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  timingText: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  templatesContainer: {
    marginTop: 20,
  },
  templateCard: {
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
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  templateMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metricTag: {
    backgroundColor: '#f0f2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  metricTagText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
  },
});

export default AutomatedReportsScreen;
