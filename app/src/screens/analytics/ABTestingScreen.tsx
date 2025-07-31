import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, LineChart } from 'react-native-chart-kit';
import analyticsAPI from '../../services/analyticsAPI';

interface Props {
  navigation: any;
  route: any;
}

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  createdDate: string;
  startDate?: string;
  endDate?: string;
  variants: Array<{
    id: string;
    name: string;
    description: string;
    trafficAllocation: number;
    participants: number;
    conversions: number;
    conversionRate: number;
  }>;
  metrics: {
    primaryMetric: string;
    secondaryMetrics: string[];
  };
  results: {
    winner?: string;
    confidence: number;
    improvement: number;
    significance: boolean;
  };
  targetAudience: {
    userSegment: string;
    sampleSize: number;
    currentParticipants: number;
  };
}

const ABTestingScreen: React.FC<Props> = ({ navigation, route }) => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed' | 'draft'>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadABTests();
  }, [selectedTab]);

  const loadABTests = async () => {
    try {
      setLoading(true);
      
      const data = await analyticsAPI.getAllABTests(selectedTab);
      setTests(data || getMockABTests());
    } catch (error) {
      console.error('Error loading A/B tests:', error);
      setTests(getMockABTests());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadABTests();
  };

  const getMockABTests = (): ABTest[] => [
    {
      id: 'test-1',
      name: 'New Onboarding Flow',
      description: 'Testing simplified vs detailed onboarding process',
      status: 'active',
      createdDate: '2025-07-15',
      startDate: '2025-07-20',
      endDate: '2025-08-20',
      variants: [
        {
          id: 'control',
          name: 'Control (Current)',
          description: 'Existing detailed onboarding',
          trafficAllocation: 50,
          participants: 1247,
          conversions: 892,
          conversionRate: 0.715,
        },
        {
          id: 'variant-a',
          name: 'Simplified Flow',
          description: 'Streamlined 3-step onboarding',
          trafficAllocation: 50,
          participants: 1283,
          conversions: 1051,
          conversionRate: 0.819,
        },
      ],
      metrics: {
        primaryMetric: 'Onboarding Completion Rate',
        secondaryMetrics: ['Time to First Workout', 'Day 7 Retention'],
      },
      results: {
        winner: 'variant-a',
        confidence: 0.95,
        improvement: 0.104,
        significance: true,
      },
      targetAudience: {
        userSegment: 'New Users',
        sampleSize: 2500,
        currentParticipants: 2530,
      },
    },
    {
      id: 'test-2',
      name: 'Premium CTA Placement',
      description: 'Testing different premium upgrade call-to-action positions',
      status: 'active',
      createdDate: '2025-07-10',
      startDate: '2025-07-18',
      endDate: '2025-08-18',
      variants: [
        {
          id: 'control',
          name: 'Bottom Banner',
          description: 'CTA at bottom of analytics screen',
          trafficAllocation: 33.3,
          participants: 834,
          conversions: 67,
          conversionRate: 0.080,
        },
        {
          id: 'variant-a',
          name: 'Top Banner',
          description: 'CTA at top of analytics screen',
          trafficAllocation: 33.3,
          participants: 856,
          conversions: 94,
          conversionRate: 0.110,
        },
        {
          id: 'variant-b',
          name: 'Modal Popup',
          description: 'CTA as modal after key actions',
          trafficAllocation: 33.4,
          participants: 867,
          conversions: 78,
          conversionRate: 0.090,
        },
      ],
      metrics: {
        primaryMetric: 'Premium Conversion Rate',
        secondaryMetrics: ['User Engagement', 'Session Duration'],
      },
      results: {
        confidence: 0.78,
        improvement: 0.030,
        significance: false,
      },
      targetAudience: {
        userSegment: 'Free Users',
        sampleSize: 2500,
        currentParticipants: 2557,
      },
    },
    {
      id: 'test-3',
      name: 'Workout Reminder Timing',
      description: 'Testing optimal timing for workout reminder notifications',
      status: 'completed',
      createdDate: '2025-06-01',
      startDate: '2025-06-05',
      endDate: '2025-07-05',
      variants: [
        {
          id: 'control',
          name: 'Evening (6 PM)',
          description: 'Reminder sent at 6 PM',
          trafficAllocation: 33.3,
          participants: 1456,
          conversions: 523,
          conversionRate: 0.359,
        },
        {
          id: 'variant-a',
          name: 'Morning (8 AM)',
          description: 'Reminder sent at 8 AM',
          trafficAllocation: 33.3,
          participants: 1478,
          conversions: 621,
          conversionRate: 0.420,
        },
        {
          id: 'variant-b',
          name: 'Personalized',
          description: 'Based on user\'s historical workout time',
          trafficAllocation: 33.4,
          participants: 1489,
          conversions: 745,
          conversionRate: 0.500,
        },
      ],
      metrics: {
        primaryMetric: 'Workout Completion Rate',
        secondaryMetrics: ['Notification Open Rate', 'App Engagement'],
      },
      results: {
        winner: 'variant-b',
        confidence: 0.99,
        improvement: 0.141,
        significance: true,
      },
      targetAudience: {
        userSegment: 'Active Users',
        sampleSize: 4500,
        currentParticipants: 4423,
      },
    },
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'completed': return '#667eea';
      case 'paused': return '#FFA726';
      case 'draft': return '#999';
      default: return '#999';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'active': return 'play-arrow';
      case 'completed': return 'check-circle';
      case 'paused': return 'pause';
      case 'draft': return 'edit';
      default: return 'help';
    }
  };

  const renderTestCard = (test: ABTest) => (
    <TouchableOpacity
      key={test.id}
      style={styles.testCard}
      onPress={() => setSelectedTest(test)}
    >
      <View style={styles.testHeader}>
        <View style={styles.testTitleContainer}>
          <Text style={styles.testName}>{test.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(test.status) }]}>
            <MaterialIcons 
              name={getStatusIcon(test.status) as any} 
              size={12} 
              color="white" 
            />
            <Text style={styles.statusText}>
              {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.testDescription}>{test.description}</Text>
      </View>

      <View style={styles.testMetrics}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Participants</Text>
          <Text style={styles.metricValue}>
            {test.targetAudience.currentParticipants.toLocaleString()}
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Variants</Text>
          <Text style={styles.metricValue}>{test.variants.length}</Text>
        </View>
        {test.results.confidence && (
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Confidence</Text>
            <Text style={styles.metricValue}>
              {Math.round(test.results.confidence * 100)}%
            </Text>
          </View>
        )}
      </View>

      {test.status === 'active' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${(test.targetAudience.currentParticipants / test.targetAudience.sampleSize) * 100}%`
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round((test.targetAudience.currentParticipants / test.targetAudience.sampleSize) * 100)}% Complete
          </Text>
        </View>
      )}

      {test.results.significance && test.results.winner && (
        <View style={styles.winnerContainer}>
          <MaterialIcons name="emoji-events" size={16} color="#FFA726" />
          <Text style={styles.winnerText}>
            Winner: {test.variants.find(v => v.id === test.results.winner)?.name}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderTestDetails = () => {
    if (!selectedTest) return null;

    const chartData = {
      labels: selectedTest.variants.map(v => v.name),
      datasets: [{
        data: selectedTest.variants.map(v => v.conversionRate * 100),
        colors: selectedTest.variants.map((_, index) => 
          (opacity = 1) => index === 0 ? `rgba(102, 126, 234, ${opacity})` : 
                          index === 1 ? `rgba(76, 175, 80, ${opacity})` : 
                          `rgba(255, 167, 38, ${opacity})`
        )
      }]
    };

    return (
      <Modal
        visible={!!selectedTest}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedTest(null)}
              >
                <MaterialIcons name="close" size={24} color="white" />
              </TouchableOpacity>
              
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>{selectedTest.name}</Text>
                <Text style={styles.modalSubtitle}>{selectedTest.description}</Text>
              </View>

              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedTest.status) }]}>
                <Text style={styles.statusText}>
                  {selectedTest.status.charAt(0).toUpperCase() + selectedTest.status.slice(1)}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <ScrollView style={styles.modalContent}>
            {/* Conversion Rate Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Conversion Rates by Variant</Text>
              <BarChart
                data={chartData}
                width={screenWidth - 40}
                height={200}
                yAxisLabel=""
                yAxisSuffix="%"
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16
                  }
                }}
                style={styles.chart}
              />
            </View>

            {/* Variant Details */}
            <View style={styles.variantsContainer}>
              <Text style={styles.sectionTitle}>Variant Performance</Text>
              {selectedTest.variants.map((variant, index) => (
                <View key={variant.id} style={styles.variantCard}>
                  <View style={styles.variantHeader}>
                    <Text style={styles.variantName}>{variant.name}</Text>
                    {selectedTest.results.winner === variant.id && (
                      <View style={styles.winnerBadge}>
                        <MaterialIcons name="emoji-events" size={16} color="#FFA726" />
                        <Text style={styles.winnerBadgeText}>Winner</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.variantDescription}>{variant.description}</Text>
                  
                  <View style={styles.variantMetrics}>
                    <View style={styles.variantMetric}>
                      <Text style={styles.variantMetricLabel}>Traffic</Text>
                      <Text style={styles.variantMetricValue}>{variant.trafficAllocation}%</Text>
                    </View>
                    <View style={styles.variantMetric}>
                      <Text style={styles.variantMetricLabel}>Participants</Text>
                      <Text style={styles.variantMetricValue}>{variant.participants}</Text>
                    </View>
                    <View style={styles.variantMetric}>
                      <Text style={styles.variantMetricLabel}>Conversions</Text>
                      <Text style={styles.variantMetricValue}>{variant.conversions}</Text>
                    </View>
                    <View style={styles.variantMetric}>
                      <Text style={styles.variantMetricLabel}>Rate</Text>
                      <Text style={[
                        styles.variantMetricValue,
                        { color: variant.conversionRate > 0.5 ? '#4CAF50' : '#FFA726' }
                      ]}>
                        {(variant.conversionRate * 100).toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Statistical Results */}
            {selectedTest.results.confidence && (
              <View style={styles.resultsContainer}>
                <Text style={styles.sectionTitle}>Statistical Results</Text>
                <View style={styles.resultsCard}>
                  <View style={styles.resultMetrics}>
                    <View style={styles.resultMetric}>
                      <Text style={styles.resultLabel}>Confidence Level</Text>
                      <Text style={[
                        styles.resultValue,
                        { color: selectedTest.results.confidence >= 0.95 ? '#4CAF50' : '#FFA726' }
                      ]}>
                        {Math.round(selectedTest.results.confidence * 100)}%
                      </Text>
                    </View>
                    {selectedTest.results.improvement && (
                      <View style={styles.resultMetric}>
                        <Text style={styles.resultLabel}>Improvement</Text>
                        <Text style={[
                          styles.resultValue,
                          { color: selectedTest.results.improvement > 0 ? '#4CAF50' : '#FF6B6B' }
                        ]}>
                          {selectedTest.results.improvement > 0 ? '+' : ''}{(selectedTest.results.improvement * 100).toFixed(1)}%
                        </Text>
                      </View>
                    )}
                    <View style={styles.resultMetric}>
                      <Text style={styles.resultLabel}>Significant</Text>
                      <View style={styles.significanceIndicator}>
                        <MaterialIcons 
                          name={selectedTest.results.significance ? 'check-circle' : 'cancel'} 
                          size={16} 
                          color={selectedTest.results.significance ? '#4CAF50' : '#FF6B6B'} 
                        />
                        <Text style={[
                          styles.resultValue,
                          { color: selectedTest.results.significance ? '#4CAF50' : '#FF6B6B' }
                        ]}>
                          {selectedTest.results.significance ? 'Yes' : 'No'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {selectedTest.status === 'active' && (
                <>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.pauseButton]}
                    onPress={() => Alert.alert('Pause Test', 'Pause test functionality coming soon!')}
                  >
                    <MaterialIcons name="pause" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Pause Test</Text>
                  </TouchableOpacity>
                  
                  {selectedTest.results.significance && (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.concludeButton]}
                      onPress={() => Alert.alert('Conclude Test', 'Conclude test functionality coming soon!')}
                    >
                      <MaterialIcons name="stop" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Conclude Test</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.exportButton]}
                onPress={() => Alert.alert('Export', 'Export results functionality coming soon!')}
              >
                <MaterialIcons name="file-download" size={20} color="white" />
                <Text style={styles.actionButtonText}>Export Results</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading A/B tests...</Text>
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
            <Text style={styles.headerTitle}>A/B Testing</Text>
            <Text style={styles.headerSubtitle}>Experimentation framework</Text>
          </View>

          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {[
            { key: 'active', label: 'Active', count: tests.filter(t => t.status === 'active').length },
            { key: 'completed', label: 'Completed', count: tests.filter(t => t.status === 'completed').length },
            { key: 'draft', label: 'Draft', count: tests.filter(t => t.status === 'draft').length },
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
        {tests.filter(test => test.status === selectedTab).map(renderTestCard)}
        
        {tests.filter(test => test.status === selectedTab).length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="science" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No {selectedTab} tests found</Text>
            <Text style={styles.emptySubtext}>
              {selectedTab === 'draft' 
                ? 'Create your first test to get started' 
                : `No ${selectedTab} tests at the moment`}
            </Text>
          </View>
        )}
      </ScrollView>

      {renderTestDetails()}
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
  testCard: {
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
  testHeader: {
    marginBottom: 12,
  },
  testTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
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
  testDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  testMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  winnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  winnerText: {
    fontSize: 12,
    color: '#FFA726',
    fontWeight: '500',
    marginLeft: 4,
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
  },
  modalHeaderText: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 20,
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
    marginBottom: 12,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  variantsContainer: {
    marginBottom: 20,
  },
  variantCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  variantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  winnerBadgeText: {
    fontSize: 11,
    color: '#FFA726',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  variantDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  variantMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  variantMetric: {
    alignItems: 'center',
  },
  variantMetricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  variantMetricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  resultsContainer: {
    marginBottom: 20,
  },
  resultsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resultMetric: {
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  significanceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  pauseButton: {
    backgroundColor: '#FFA726',
  },
  concludeButton: {
    backgroundColor: '#FF6B6B',
  },
  exportButton: {
    backgroundColor: '#667eea',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default ABTestingScreen;
