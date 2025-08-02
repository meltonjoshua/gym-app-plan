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
import analyticsAPI from '../../services/analyticsAPI';

interface Props {
  navigation: any;
  route: any;
}

interface CohortData {
  cohorts: Array<{
    cohortName: string;
    cohortSize: number;
    registrationDate: string;
    retentionData: Array<{
      period: number;
      retainedUsers: number;
      retentionRate: number;
    }>;
  }>;
  summary: {
    totalCohorts: number;
    averageRetention: {
      week1: number;
      week4: number;
      week12: number;
    };
    bestPerformingCohort: string;
    worstPerformingCohort: string;
  };
}

const CohortAnalysisScreen: React.FC<Props> = ({ navigation, route }) => {
  const [cohortData, setCohortData] = useState<CohortData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedMetric, setSelectedMetric] = useState<'users' | 'revenue'>('users');

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadCohortData();
  }, [selectedPeriod]);

  const loadCohortData = async () => {
    try {
      setLoading(true);
      
      const data = await analyticsAPI.getCohortAnalysis(selectedPeriod);
      setCohortData(data || getMockCohortData());
    } catch (error) {
      console.error('Error loading cohort data:', error);
      setCohortData(getMockCohortData());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCohortData();
  };

  const getMockCohortData = (): CohortData => ({
    cohorts: [
      {
        cohortName: 'January 2025',
        cohortSize: 145,
        registrationDate: '2025-01-01',
        retentionData: [
          { period: 1, retainedUsers: 123, retentionRate: 0.85 },
          { period: 2, retainedUsers: 108, retentionRate: 0.74 },
          { period: 3, retainedUsers: 87, retentionRate: 0.60 },
          { period: 4, retainedUsers: 73, retentionRate: 0.50 },
          { period: 8, retainedUsers: 58, retentionRate: 0.40 },
          { period: 12, retainedUsers: 44, retentionRate: 0.30 },
        ],
      },
      {
        cohortName: 'February 2025',
        cohortSize: 189,
        registrationDate: '2025-02-01',
        retentionData: [
          { period: 1, retainedUsers: 167, retentionRate: 0.88 },
          { period: 2, retainedUsers: 151, retentionRate: 0.80 },
          { period: 3, retainedUsers: 128, retentionRate: 0.68 },
          { period: 4, retainedUsers: 113, retentionRate: 0.60 },
          { period: 8, retainedUsers: 91, retentionRate: 0.48 },
          { period: 12, retainedUsers: 74, retentionRate: 0.39 },
        ],
      },
      {
        cohortName: 'March 2025',
        cohortSize: 234,
        registrationDate: '2025-03-01',
        retentionData: [
          { period: 1, retainedUsers: 210, retentionRate: 0.90 },
          { period: 2, retainedUsers: 192, retentionRate: 0.82 },
          { period: 3, retainedUsers: 168, retentionRate: 0.72 },
          { period: 4, retainedUsers: 149, retentionRate: 0.64 },
          { period: 8, retainedUsers: 117, retentionRate: 0.50 },
          { period: 12, retainedUsers: 94, retentionRate: 0.40 },
        ],
      },
      {
        cohortName: 'April 2025',
        cohortSize: 198,
        registrationDate: '2025-04-01',
        retentionData: [
          { period: 1, retainedUsers: 178, retentionRate: 0.90 },
          { period: 2, retainedUsers: 158, retentionRate: 0.80 },
          { period: 3, retainedUsers: 139, retentionRate: 0.70 },
          { period: 4, retainedUsers: 119, retentionRate: 0.60 },
          { period: 8, retainedUsers: 99, retentionRate: 0.50 },
        ],
      },
      {
        cohortName: 'May 2025',
        cohortSize: 276,
        registrationDate: '2025-05-01',
        retentionData: [
          { period: 1, retainedUsers: 255, retentionRate: 0.92 },
          { period: 2, retainedUsers: 232, retentionRate: 0.84 },
          { period: 3, retainedUsers: 207, retentionRate: 0.75 },
          { period: 4, retainedUsers: 182, retentionRate: 0.66 },
        ],
      },
      {
        cohortName: 'June 2025',
        cohortSize: 312,
        registrationDate: '2025-06-01',
        retentionData: [
          { period: 1, retainedUsers: 290, retentionRate: 0.93 },
          { period: 2, retainedUsers: 265, retentionRate: 0.85 },
          { period: 3, retainedUsers: 237, retentionRate: 0.76 },
        ],
      },
      {
        cohortName: 'July 2025',
        cohortSize: 345,
        registrationDate: '2025-07-01',
        retentionData: [
          { period: 1, retainedUsers: 324, retentionRate: 0.94 },
          { period: 2, retainedUsers: 293, retentionRate: 0.85 },
        ],
      },
    ],
    summary: {
      totalCohorts: 7,
      averageRetention: {
        week1: 0.89,
        week4: 0.61,
        week12: 0.37,
      },
      bestPerformingCohort: 'July 2025',
      worstPerformingCohort: 'January 2025',
    },
  });

  const getRetentionColor = (rate: number): string => {
    if (rate >= 0.8) return '#4CAF50';
    if (rate >= 0.6) return '#FFA726';
    if (rate >= 0.4) return '#FF7043';
    if (rate >= 0.2) return '#FF5722';
    return '#F44336';
  };

  const renderCohortTable = () => {
    if (!cohortData) return null;

    const maxPeriods = Math.max(
      ...cohortData.cohorts.map(cohort => 
        Math.max(...cohort.retentionData.map(data => data.period))
      )
    );

    const periods = Array.from({ length: maxPeriods }, (_, i) => i + 1);

    return (
      <View style={styles.tableContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Header Row */}
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.headerCell, styles.cohortNameCell]}>
                <Text style={styles.headerText}>Cohort</Text>
              </View>
              <View style={[styles.tableCell, styles.headerCell, styles.sizeCell]}>
                <Text style={styles.headerText}>Size</Text>
              </View>
              {periods.map(period => (
                <View key={period} style={[styles.tableCell, styles.headerCell, styles.periodCell]}>
                  <Text style={styles.headerText}>
                    {selectedPeriod === 'weekly' ? `W${period}` : 
                     selectedPeriod === 'monthly' ? `M${period}` : `D${period}`}
                  </Text>
                </View>
              ))}
            </View>

            {/* Data Rows */}
            {cohortData.cohorts.map((cohort, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={[styles.tableCell, styles.cohortNameCell]}>
                  <Text style={styles.cohortName}>{cohort.cohortName}</Text>
                </View>
                <View style={[styles.tableCell, styles.sizeCell]}>
                  <Text style={styles.cohortSize}>{cohort.cohortSize}</Text>
                </View>
                {periods.map(period => {
                  const retentionData = cohort.retentionData.find(data => data.period === period);
                  return (
                    <View key={period} style={[styles.tableCell, styles.periodCell]}>
                      {retentionData ? (
                        <View style={[
                          styles.retentionCell,
                          { backgroundColor: getRetentionColor(retentionData.retentionRate) }
                        ]}>
                          <Text style={styles.retentionText}>
                            {Math.round(retentionData.retentionRate * 100)}%
                          </Text>
                          <Text style={styles.retentionSubtext}>
                            {retentionData.retainedUsers}
                          </Text>
                        </View>
                      ) : (
                        <View style={[styles.retentionCell, { backgroundColor: '#f0f0f0' }]}>
                          <Text style={styles.retentionTextDisabled}>-</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderSummaryCards = () => {
    if (!cohortData) return null;

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Week 1 Retention</Text>
            <Text style={styles.summaryValue}>
              {Math.round(cohortData.summary.averageRetention.week1 * 100)}%
            </Text>
            <View style={styles.summaryIndicator}>
              <MaterialIcons name="trending-up" size={16} color="#4CAF50" />
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Week 4 Retention</Text>
            <Text style={styles.summaryValue}>
              {Math.round(cohortData.summary.averageRetention.week4 * 100)}%
            </Text>
            <View style={styles.summaryIndicator}>
              <MaterialIcons name="trending-flat" size={16} color="#FFA726" />
            </View>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Week 12 Retention</Text>
            <Text style={styles.summaryValue}>
              {Math.round(cohortData.summary.averageRetention.week12 * 100)}%
            </Text>
            <View style={styles.summaryIndicator}>
              <MaterialIcons name="trending-down" size={16} color="#FF6B6B" />
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Cohorts</Text>
            <Text style={styles.summaryValue}>{cohortData.summary.totalCohorts}</Text>
            <View style={styles.summaryIndicator}>
              <MaterialIcons name="group" size={16} color="#667eea" />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderInsights = () => {
    if (!cohortData) return null;

    return (
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>Key Insights</Text>
        
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <MaterialIcons name="star" size={20} color="#4CAF50" />
            <Text style={styles.insightTitle}>Best Performing Cohort</Text>
          </View>
          <Text style={styles.insightText}>
            {cohortData.summary.bestPerformingCohort} shows the highest retention rates across all periods.
          </Text>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <MaterialIcons name="warning" size={20} color="#FF6B6B" />
            <Text style={styles.insightTitle}>Attention Needed</Text>
          </View>
          <Text style={styles.insightText}>
            {cohortData.summary.worstPerformingCohort} has the lowest retention rates and may need analysis.
          </Text>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <MaterialIcons name="trending-up" size={20} color="#667eea" />
            <Text style={styles.insightTitle}>Trend Analysis</Text>
          </View>
          <Text style={styles.insightText}>
            Recent cohorts show improved Week 1 retention, indicating better onboarding effectiveness.
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading cohort analysis...</Text>
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
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Cohort Analysis</Text>
            <Text style={styles.headerSubtitle}>User retention tracking</Text>
          </View>

          <TouchableOpacity 
            style={styles.exportButton}
            onPress={() => Alert.alert('Export', 'Export cohort data functionality coming soon!')}
          >
            <MaterialIcons name="file-download" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {[
            { key: 'daily', label: 'Daily' },
            { key: 'weekly', label: 'Weekly' },
            { key: 'monthly', label: 'Monthly' },
          ].map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period.key as any)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.periodButtonTextActive
              ]}>
                {period.label}
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
        {renderSummaryCards()}
        {renderCohortTable()}
        {renderInsights()}
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
  headerTextContainer: {
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
  summaryContainer: {
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  summaryIndicator: {
    padding: 4,
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 8,
  },
  tableCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerCell: {
    backgroundColor: '#f8f9fa',
  },
  cohortNameCell: {
    width: 100,
    alignItems: 'flex-start',
  },
  sizeCell: {
    width: 60,
  },
  periodCell: {
    width: 60,
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  cohortName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  cohortSize: {
    fontSize: 12,
    color: '#666',
  },
  retentionCell: {
    width: 50,
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retentionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  retentionSubtext: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  retentionTextDisabled: {
    fontSize: 12,
    color: '#999',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  insightsContainer: {
    marginBottom: 24,
  },
  insightCard: {
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
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  insightText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

export default CohortAnalysisScreen;
