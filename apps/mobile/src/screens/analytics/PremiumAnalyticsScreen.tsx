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
import analyticsService, { PremiumAnalytics } from '../../services/analyticsService';

interface Props {
  navigation: any;
  route: any;
}

const PremiumAnalyticsScreen: React.FC<Props> = ({ navigation, route }) => {
  const [analyticsData, setAnalyticsData] = useState<PremiumAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'insights' | 'predictions' | 'recommendations'>('insights');

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadPremiumAnalytics();
  }, []);

  const loadPremiumAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get user ID from route params or auth context
      const userId = route.params?.userId || 'current-user';
      
      const data = await analyticsService.getPremiumAnalytics(userId);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading premium analytics:', error);
      Alert.alert('Error', 'Failed to load premium analytics. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPremiumAnalytics();
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
    switch (priority) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFA726';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return '#4CAF50';
    if (confidence >= 0.6) return '#FFA726';
    return '#FF6B6B';
  };

  const renderGoalProbabilityChart = () => {
    if (!analyticsData?.predictiveAnalytics.goalAchievementProbability) return null;

    const goals = Object.entries(analyticsData.predictiveAnalytics.goalAchievementProbability);
    const chartData = {
      labels: goals.map(([goal]) => goal.replace('-', ' ')),
      datasets: [{
        data: goals.map(([, probability]) => probability * 100),
        colors: goals.map(() => (opacity = 1) => `rgba(102, 126, 234, ${opacity})`),
      }]
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Goal Achievement Probability</Text>
        <BarChart
          data={chartData}
          width={screenWidth - 40}
          height={200}
          yAxisLabel="Probability"
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

  const renderPersonalizedInsights = () => {
    if (!analyticsData?.personalizedInsights) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personalized Insights</Text>
        {analyticsData.personalizedInsights.map((insight) => (
          <View key={insight.id} style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <View style={styles.insightCategory}>
                <Text style={styles.insightCategoryText}>{insight.category}</Text>
              </View>
              <View style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(insight.priority) }
              ]}>
                <Text style={styles.priorityText}>{insight.priority.toUpperCase()}</Text>
              </View>
            </View>

            <Text style={styles.insightText}>{insight.insight}</Text>

            <View style={styles.dataPointsContainer}>
              <Text style={styles.dataPointsTitle}>Based on:</Text>
              {insight.dataPoints.map((point, index) => (
                <Text key={index} style={styles.dataPoint}>• {point}</Text>
              ))}
            </View>

            <View style={styles.recommendationsContainer}>
              <Text style={styles.recommendationsTitle}>Recommendations:</Text>
              {insight.recommendations.map((rec, index) => (
                <Text key={index} style={styles.recommendation}>✓ {rec}</Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderAIRecommendations = () => {
    if (!analyticsData?.aiRecommendations) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI-Powered Recommendations</Text>
        {analyticsData.aiRecommendations.map((recommendation) => (
          <View key={recommendation.id} style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <View style={styles.recommendationType}>
                <MaterialIcons 
                  name={
                    recommendation.type === 'workout' ? 'fitness-center' :
                    recommendation.type === 'nutrition' ? 'restaurant' : 'bedtime'
                  } 
                  size={20} 
                  color="#667eea" 
                />
                <Text style={styles.recommendationTypeText}>{recommendation.type}</Text>
              </View>
              <View style={[
                styles.confidenceBadge,
                { backgroundColor: getConfidenceColor(recommendation.confidence) }
              ]}>
                <Text style={styles.confidenceText}>
                  {Math.round(recommendation.confidence * 100)}%
                </Text>
              </View>
            </View>

            <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
            <Text style={styles.recommendationDescription}>{recommendation.description}</Text>

            <View style={styles.actionItemsContainer}>
              <Text style={styles.actionItemsTitle}>Action Items:</Text>
              {recommendation.actionItems.map((item, index) => (
                <View key={index} style={styles.actionItem}>
                  <MaterialIcons name="check-circle-outline" size={16} color="#4CAF50" />
                  <Text style={styles.actionItemText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={styles.impactContainer}>
              <MaterialIcons name="trending-up" size={16} color="#FFA726" />
              <Text style={styles.impactText}>{recommendation.estimatedImpact}</Text>
            </View>

            <TouchableOpacity 
              style={styles.implementButton}
              onPress={() => Alert.alert('Implementation', 'Feature coming soon!')}
            >
              <Text style={styles.implementButtonText}>Implement Suggestion</Text>
              <MaterialIcons name="arrow-forward" size={16} color="white" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderPredictiveAnalytics = () => {
    if (!analyticsData?.predictiveAnalytics) return null;

    const { plateauPrediction, injuryRiskFactors, optimalWorkoutTimes } = analyticsData.predictiveAnalytics;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Predictive Analytics</Text>

        {/* Goal Achievement Probability Chart */}
        {renderGoalProbabilityChart()}

        {/* Plateau Prediction */}
        <View style={styles.predictionCard}>
          <View style={styles.predictionHeader}>
            <MaterialIcons name="trending-flat" size={24} color="#FFA726" />
            <Text style={styles.predictionTitle}>Plateau Prediction</Text>
          </View>
          
          <View style={styles.predictionContent}>
            <Text style={styles.predictionLikelihood}>
              {Math.round(plateauPrediction.likelihood * 100)}% likelihood
            </Text>
            <Text style={styles.predictionTimeframe}>
              Expected timeframe: {plateauPrediction.timeframe}
            </Text>
          </View>

          <View style={styles.preventionContainer}>
            <Text style={styles.preventionTitle}>Prevention Strategies:</Text>
            {plateauPrediction.preventionStrategies.map((strategy, index) => (
              <Text key={index} style={styles.preventionStrategy}>• {strategy}</Text>
            ))}
          </View>
        </View>

        {/* Optimal Workout Times */}
        <View style={styles.optimalTimesCard}>
          <View style={styles.optimalTimesHeader}>
            <MaterialIcons name="schedule" size={24} color="#4CAF50" />
            <Text style={styles.optimalTimesTitle}>Optimal Workout Times</Text>
          </View>
          
          <View style={styles.timesContainer}>
            {optimalWorkoutTimes.map((time, index) => (
              <View key={index} style={styles.timeChip}>
                <Text style={styles.timeText}>{time}</Text>
              </View>
            ))}
          </View>
          
          <Text style={styles.timesDescription}>
            Based on your performance patterns and energy levels
          </Text>
        </View>

        {/* Injury Risk Factors */}
        {injuryRiskFactors.map((factor, index) => (
          <View key={index} style={styles.riskCard}>
            <View style={styles.riskHeader}>
              <MaterialIcons name="warning" size={24} color="#FF6B6B" />
              <Text style={styles.riskTitle}>Injury Risk Factor</Text>
              <View style={styles.riskLevel}>
                <Text style={styles.riskLevelText}>
                  {Math.round(factor.risk * 100)}% Risk
                </Text>
              </View>
            </View>
            
            <Text style={styles.riskFactor}>{factor.factor}</Text>
            
            <View style={styles.preventionContainer}>
              <Text style={styles.preventionTitle}>Prevention:</Text>
              {factor.prevention.map((prev, prevIndex) => (
                <Text key={prevIndex} style={styles.preventionStrategy}>• {prev}</Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'insights':
        return renderPersonalizedInsights();
      case 'predictions':
        return renderPredictiveAnalytics();
      case 'recommendations':
        return renderAIRecommendations();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading AI-powered insights...</Text>
      </View>
    );
  }

  if (!analyticsData) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#666" />
        <Text style={styles.errorText}>Failed to load premium analytics</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPremiumAnalytics}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Premium Analytics</Text>
            <Text style={styles.headerSubtitle}>AI-powered insights & predictions</Text>
          </View>

          <View style={styles.premiumBadge}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.premiumText}>PRO</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {[
            { key: 'insights', label: 'Insights', icon: 'lightbulb-outline' },
            { key: 'predictions', label: 'Predictions', icon: 'timeline' },
            { key: 'recommendations', label: 'AI Tips', icon: 'psychology' },
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
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
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
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 12,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightCategory: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  insightCategoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  insightText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  dataPointsContainer: {
    marginBottom: 12,
  },
  dataPointsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  dataPoint: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  recommendationsContainer: {
    marginTop: 8,
  },
  recommendationsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  recommendation: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 8,
  },
  recommendationCard: {
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
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationTypeText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confidenceText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  actionItemsContainer: {
    marginBottom: 12,
  },
  actionItemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  actionItemText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  impactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#fff8e1',
    borderRadius: 6,
  },
  impactText: {
    fontSize: 12,
    color: '#FFA726',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  implementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 10,
    borderRadius: 8,
  },
  implementButtonText: {
    color: 'white',
    fontWeight: '500',
    marginRight: 4,
  },
  predictionCard: {
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
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  predictionContent: {
    marginBottom: 12,
  },
  predictionLikelihood: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFA726',
    marginBottom: 4,
  },
  predictionTimeframe: {
    fontSize: 14,
    color: '#666',
  },
  preventionContainer: {
    marginTop: 12,
  },
  preventionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  preventionStrategy: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  optimalTimesCard: {
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
  optimalTimesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optimalTimesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  timeChip: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  timesDescription: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  riskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  riskLevel: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  riskLevelText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  riskFactor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
});

export default PremiumAnalyticsScreen;
