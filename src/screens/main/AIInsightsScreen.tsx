import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setRecommendations, setPredictions } from '../../store/slices/aiSlice';
import { generateSimulatedData } from '../../store/slices/wearableSlice';
import { sampleRecommendations } from '../../data/sampleData';

const { width } = Dimensions.get('window');

interface AIInsightsScreenProps {
  navigation: any;
}

export default function AIInsightsScreen({ navigation }: AIInsightsScreenProps) {
  const dispatch = useDispatch();
  const { recommendations, predictions, isLoading } = useSelector((state: RootState) => state.ai);
  const { todaysData } = useSelector((state: RootState) => state.wearable);
  const { entries } = useSelector((state: RootState) => state.progress);
  const { currentUser } = useSelector((state: RootState) => state.user);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<'performance' | 'health' | 'recommendations'>('performance');

  useEffect(() => {
    loadAIInsights();
    generateWearableData();
  }, []);

  const loadAIInsights = () => {
    if (recommendations.length === 0) {
      dispatch(setRecommendations(sampleRecommendations));
    }
    
    // Generate sample predictions
    if (predictions.length === 0) {
      const samplePredictions = [
        {
          goalId: 'goal1',
          predictedCompletionDate: new Date('2024-09-15'),
          confidence: 0.78,
          currentTrajectory: 'on_track' as const,
          adjustmentSuggestions: [
            'Increase workout frequency by 1 session per week',
            'Focus more on compound movements',
            'Ensure adequate rest between sessions'
          ]
        }
      ];
      dispatch(setPredictions(samplePredictions));
    }
  };

  const generateWearableData = () => {
    if (!todaysData && currentUser) {
      dispatch(generateSimulatedData({ 
        userId: currentUser.id, 
        deviceType: 'smartwatch' 
      }));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    loadAIInsights();
    generateWearableData();
    setRefreshing(false);
  };

  // Generate sample chart data
  const performanceData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [75, 82, 78, 85, 80, 88, 92],
      strokeWidth: 3,
      color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    }]
  };

  const heartRateData = {
    labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
    datasets: [{
      data: todaysData?.data.heartRate?.slice(6, 22).filter((_, i) => i % 3 === 0) || [70, 75, 80, 85, 78, 72],
      strokeWidth: 2,
      color: (opacity = 1) => `rgba(255, 48, 64, ${opacity})`,
    }]
  };

  const workoutDistribution = [
    { name: 'Strength', count: 15, color: '#667eea', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Cardio', count: 8, color: '#52c41a', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Flexibility', count: 5, color: '#fa8c16', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Core', count: 7, color: '#722ed1', legendFontColor: '#333', legendFontSize: 12 },
  ];

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  const renderInsightCard = (title: string, value: string, subtitle: string, icon: string, color: string, trend?: 'up' | 'down' | 'stable') => (
    <View style={[styles.insightCard, { borderLeftColor: color }]}>
      <View style={styles.insightHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <View style={styles.insightTrend}>
          {trend && (
            <Ionicons 
              name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove'} 
              size={16} 
              color={trend === 'up' ? '#52c41a' : trend === 'down' ? '#ff4d4f' : '#666'} 
            />
          )}
        </View>
      </View>
      <Text style={styles.insightValue}>{value}</Text>
      <Text style={styles.insightTitle}>{title}</Text>
      <Text style={styles.insightSubtitle}>{subtitle}</Text>
    </View>
  );

  const renderPerformanceInsights = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.insightsGrid}>
        {renderInsightCard('Fitness Score', '84/100', '+5 from last week', 'analytics', '#667eea', 'up')}
        {renderInsightCard('Weekly Goal', '80%', '4/5 workouts done', 'trophy', '#52c41a', 'stable')}
        {renderInsightCard('Consistency', '92%', 'Excellent streak', 'flame', '#fa8c16', 'up')}
        {renderInsightCard('Recovery', '78%', 'Good recovery rate', 'heart', '#ff4d4f', 'stable')}
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weekly Performance Trend</Text>
        <LineChart
          data={performanceData}
          width={width - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Workout Distribution (Last Month)</Text>
        <PieChart
          data={workoutDistribution}
          width={width - 40}
          height={220}
          chartConfig={chartConfig}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );

  const renderHealthInsights = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.insightsGrid}>
        {renderInsightCard('Avg Heart Rate', '74 BPM', 'Resting: 65 BPM', 'heart', '#ff4d4f', 'stable')}
        {renderInsightCard('Daily Steps', '8,547', 'Goal: 10,000', 'walk', '#52c41a', 'up')}
        {renderInsightCard('Sleep Quality', '7.5h', 'Good recovery', 'moon', '#722ed1', 'up')}
        {renderInsightCard('Calories', '2,134', 'Above baseline', 'flame', '#fa8c16', 'up')}
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Heart Rate Throughout Day</Text>
        <LineChart
          data={heartRateData}
          width={width - 40}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(255, 48, 64, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.healthInsightsContainer}>
        <Text style={styles.sectionTitle}>Health Insights</Text>
        
        <View style={styles.healthInsightCard}>
          <Ionicons name="checkmark-circle" size={24} color="#52c41a" />
          <View style={styles.healthInsightContent}>
            <Text style={styles.healthInsightTitle}>Great Cardio Health</Text>
            <Text style={styles.healthInsightDescription}>
              Your resting heart rate of 65 BPM indicates excellent cardiovascular fitness.
            </Text>
          </View>
        </View>

        <View style={styles.healthInsightCard}>
          <Ionicons name="warning" size={24} color="#fa8c16" />
          <View style={styles.healthInsightContent}>
            <Text style={styles.healthInsightTitle}>Hydration Reminder</Text>
            <Text style={styles.healthInsightDescription}>
              You're 20% behind your daily hydration goal. Drink more water for better recovery.
            </Text>
          </View>
        </View>

        <View style={styles.healthInsightCard}>
          <Ionicons name="moon" size={24} color="#722ed1" />
          <View style={styles.healthInsightContent}>
            <Text style={styles.healthInsightTitle}>Sleep Pattern Analysis</Text>
            <Text style={styles.healthInsightDescription}>
              Your 7.5h average sleep supports optimal recovery and performance gains.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderRecommendations = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>AI-Powered Recommendations</Text>
      
      {recommendations.map((rec) => (
        <View key={rec.id} style={styles.recommendationCard}>
          <View style={styles.recommendationHeader}>
            <View style={styles.recommendationTitleContainer}>
              <Ionicons 
                name={rec.recommendationType === 'next_workout' ? 'fitness' : 
                      rec.recommendationType === 'rest_day' ? 'bed' : 
                      rec.recommendationType === 'progression' ? 'trending-up' : 'bulb'} 
                size={22} 
                color="#667eea" 
              />
              <Text style={styles.recommendationTitle}>{rec.title}</Text>
            </View>
            <View style={styles.confidenceContainer}>
              <Ionicons name="analytics" size={14} color="#52c41a" />
              <Text style={styles.confidenceText}>
                {Math.round(rec.confidence * 100)}%
              </Text>
            </View>
          </View>
          
          <Text style={styles.recommendationDescription}>{rec.description}</Text>
          
          <View style={styles.reasoningContainer}>
            <Text style={styles.reasoningTitle}>Analysis:</Text>
            {rec.reasoning.map((reason, index) => (
              <Text key={index} style={styles.reasoningItem}>• {reason}</Text>
            ))}
          </View>
          
          <View style={styles.recommendationActions}>
            <TouchableOpacity style={styles.acceptButton}>
              <Ionicons name="checkmark" size={16} color="white" />
              <Text style={styles.acceptButtonText}>Apply</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.moreInfoButton}>
              <Ionicons name="information-circle-outline" size={16} color="#667eea" />
              <Text style={styles.moreInfoText}>More Info</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {predictions.length > 0 && (
        <View style={styles.predictionsSection}>
          <Text style={styles.sectionTitle}>Goal Predictions</Text>
          {predictions.map((pred) => (
            <View key={pred.goalId} style={styles.predictionCard}>
              <View style={styles.predictionHeader}>
                <Text style={styles.predictionTitle}>Current Goal Progress</Text>
                <View style={[styles.trajectoryBadge, { 
                  backgroundColor: pred.currentTrajectory === 'on_track' ? '#f6ffed' : 
                                  pred.currentTrajectory === 'ahead' ? '#e6f7ff' : '#fff2e8',
                  borderColor: pred.currentTrajectory === 'on_track' ? '#52c41a' : 
                              pred.currentTrajectory === 'ahead' ? '#1890ff' : '#fa8c16'
                }]}>
                  <Text style={[styles.trajectoryText, { 
                    color: pred.currentTrajectory === 'on_track' ? '#52c41a' : 
                           pred.currentTrajectory === 'ahead' ? '#1890ff' : '#fa8c16'
                  }]}>
                    {pred.currentTrajectory.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.predictionDescription}>
                Predicted completion: {pred.predictedCompletionDate.toLocaleDateString()} 
                (Confidence: {Math.round(pred.confidence * 100)}%)
              </Text>
              
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Optimization Suggestions:</Text>
                {pred.adjustmentSuggestions.map((suggestion, index) => (
                  <Text key={index} style={styles.suggestionItem}>• {suggestion}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderTabButton = (tab: typeof selectedInsight, label: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, selectedInsight === tab && styles.activeTabButton]}
      onPress={() => setSelectedInsight(tab)}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={selectedInsight === tab ? '#667eea' : '#666'} 
      />
      <Text style={[styles.tabLabel, selectedInsight === tab && styles.activeTabLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (selectedInsight) {
      case 'performance':
        return renderPerformanceInsights();
      case 'health':
        return renderHealthInsights();
      case 'recommendations':
        return renderRecommendations();
      default:
        return renderPerformanceInsights();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Insights</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.tabContainer}>
        {renderTabButton('performance', 'Performance', 'analytics')}
        {renderTabButton('health', 'Health', 'heart')}
        {renderTabButton('recommendations', 'AI Tips', 'bulb')}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  settingsButton: {
    padding: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#f0f7ff',
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#667eea',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  insightCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    borderLeftWidth: 4,
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
    marginBottom: 10,
  },
  insightTrend: {
    padding: 4,
  },
  insightValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  insightSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
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
    marginBottom: 15,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  healthInsightsContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  healthInsightCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthInsightContent: {
    flex: 1,
    marginLeft: 12,
  },
  healthInsightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  healthInsightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  recommendationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6ffed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    color: '#52c41a',
    fontWeight: '600',
    marginLeft: 4,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  reasoningContainer: {
    backgroundColor: '#f8f9ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  reasoningTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 6,
  },
  reasoningItem: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 2,
  },
  recommendationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  moreInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  moreInfoText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  predictionsSection: {
    marginTop: 20,
  },
  predictionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#fa8c16',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  trajectoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  trajectoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  predictionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  suggestionsContainer: {
    backgroundColor: '#fff7e6',
    borderRadius: 8,
    padding: 12,
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fa8c16',
    marginBottom: 6,
  },
  suggestionItem: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 2,
  },
});