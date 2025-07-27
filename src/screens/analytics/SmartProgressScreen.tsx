import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const { width } = Dimensions.get('window');

interface ProgressMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
}

interface WorkoutTrend {
  date: string;
  volume: number;
  intensity: number;
  duration: number;
}

interface AIInsight {
  id: string;
  type: 'strength' | 'endurance' | 'frequency' | 'recovery' | 'form';
  title: string;
  description: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
}

interface SmartProgressScreenProps {
  navigation: any;
}

export default function SmartProgressScreen({ navigation }: SmartProgressScreenProps) {
  const { userId } = useSelector((state: RootState) => state.auth);
  
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  const [metrics, setMetrics] = useState<ProgressMetric[]>([]);
  const [workoutTrends, setWorkoutTrends] = useState<WorkoutTrend[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, [selectedTimeframe]);

  const loadProgressData = async () => {
    setIsLoading(true);
    
    // Simulate API calls for demo
    setTimeout(() => {
      setMetrics([
        {
          id: '1',
          name: 'Total Volume',
          value: 12450,
          change: 8.2,
          unit: 'kg',
          trend: 'up',
          icon: 'barbell',
          color: '#667eea',
        },
        {
          id: '2',
          name: 'Workout Frequency',
          value: 4.2,
          change: 5.0,
          unit: 'per week',
          trend: 'up',
          icon: 'calendar',
          color: '#10b981',
        },
        {
          id: '3',
          name: 'Avg Session Duration',
          value: 52,
          change: -3.1,
          unit: 'minutes',
          trend: 'down',
          icon: 'time',
          color: '#f59e0b',
        },
        {
          id: '4',
          name: 'Recovery Score',
          value: 85,
          change: 12.5,
          unit: '%',
          trend: 'up',
          icon: 'heart',
          color: '#ef4444',
        },
        {
          id: '5',
          name: 'Form Accuracy',
          value: 92,
          change: 4.3,
          unit: '%',
          trend: 'up',
          icon: 'checkmark-circle',
          color: '#8b5cf6',
        },
        {
          id: '6',
          name: 'Goal Progress',
          value: 68,
          change: 15.2,
          unit: '%',
          trend: 'up',
          icon: 'trophy',
          color: '#f97316',
        },
      ]);

      // Mock workout trends
      const trends: WorkoutTrend[] = [];
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        trends.push({
          date: date.toISOString().split('T')[0],
          volume: Math.random() * 5000 + 8000,
          intensity: Math.random() * 3 + 7,
          duration: Math.random() * 30 + 40,
        });
      }
      setWorkoutTrends(trends);

      setAiInsights([
        {
          id: '1',
          type: 'strength',
          title: 'Progressive Overload Opportunity',
          description: 'Your bench press has plateaued for 3 weeks',
          recommendation: 'Increase weight by 2.5kg or add 2 more reps',
          priority: 'high',
          confidence: 94,
        },
        {
          id: '2',
          type: 'recovery',
          title: 'Optimal Recovery Pattern',
          description: 'Your best performances occur after 48-hour rest periods',
          recommendation: 'Schedule high-intensity sessions with 2-day gaps',
          priority: 'medium',
          confidence: 87,
        },
        {
          id: '3',
          type: 'form',
          title: 'Form Improvement Detected',
          description: 'Squat depth has improved 15% in the last month',
          recommendation: 'Continue current mobility routine',
          priority: 'low',
          confidence: 92,
        },
        {
          id: '4',
          type: 'frequency',
          title: 'Workout Consistency Boost',
          description: 'Adding one more weekly session could accelerate progress by 23%',
          recommendation: 'Schedule a light recovery workout on Sundays',
          priority: 'medium',
          confidence: 78,
        },
      ]);

      setIsLoading(false);
    }, 1000);
  };

  const renderMetricCard = (metric: ProgressMetric) => (
    <View key={metric.id} style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: metric.color + '20' }]}>
          <Ionicons name={metric.icon as any} size={20} color={metric.color} />
        </View>
        <View style={styles.trendIndicator}>
          <Ionicons 
            name={metric.trend === 'up' ? 'trending-up' : metric.trend === 'down' ? 'trending-down' : 'remove'} 
            size={16} 
            color={metric.trend === 'up' ? '#10b981' : metric.trend === 'down' ? '#ef4444' : '#6b7280'} 
          />
          <Text style={[
            styles.changeText,
            { color: metric.trend === 'up' ? '#10b981' : metric.trend === 'down' ? '#ef4444' : '#6b7280' }
          ]}>
            {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
          </Text>
        </View>
      </View>
      
      <Text style={styles.metricValue}>
        {metric.value.toLocaleString()}
      </Text>
      <Text style={styles.metricUnit}>{metric.unit}</Text>
      <Text style={styles.metricName}>{metric.name}</Text>
    </View>
  );

  const renderInsightCard = (insight: AIInsight) => (
    <TouchableOpacity 
      key={insight.id} 
      style={styles.insightCard}
      onPress={() => Alert.alert(insight.title, `${insight.description}\n\nRecommendation: ${insight.recommendation}`)}
    >
      <View style={styles.insightHeader}>
        <View style={[
          styles.priorityBadge,
          { backgroundColor: insight.priority === 'high' ? '#fef3c7' : insight.priority === 'medium' ? '#dbeafe' : '#f3f4f6' }
        ]}>
          <Text style={[
            styles.priorityText,
            { color: insight.priority === 'high' ? '#d97706' : insight.priority === 'medium' ? '#2563eb' : '#4b5563' }
          ]}>
            {insight.priority.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.confidenceText}>{insight.confidence}% confidence</Text>
      </View>
      
      <Text style={styles.insightTitle}>{insight.title}</Text>
      <Text style={styles.insightDescription}>{insight.description}</Text>
      
      <View style={styles.insightFooter}>
        <Ionicons name="bulb" size={16} color="#667eea" />
        <Text style={styles.recommendationText} numberOfLines={2}>
          {insight.recommendation}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const timeframes = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'quarter', label: 'Quarter' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
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
        <Text style={styles.headerTitle}>Smart Progress Analytics</Text>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => Alert.alert('Export', 'Progress report exported successfully!')}
        >
          <Ionicons name="download" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Timeframe Selector */}
        <View style={styles.timeframeSelector}>
          {timeframes.map((timeframe) => (
            <TouchableOpacity
              key={timeframe.key}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe.key && styles.timeframeButtonActive
              ]}
              onPress={() => setSelectedTimeframe(timeframe.key as any)}
            >
              <Text style={[
                styles.timeframeText,
                selectedTimeframe === timeframe.key && styles.timeframeTextActive
              ]}>
                {timeframe.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Performance Metrics</Text>
          <View style={styles.metricsGrid}>
            {metrics.map(renderMetricCard)}
          </View>
        </View>

        {/* Progress Chart Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training Volume Trend</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="analytics" size={48} color="#d1d5db" />
              <Text style={styles.chartPlaceholderText}>
                Interactive chart showing volume progression
              </Text>
              <Text style={styles.chartSubtext}>
                Based on {workoutTrends.length} workout sessions
              </Text>
            </View>
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Performance Insights</Text>
            <TouchableOpacity
              onPress={() => Alert.alert('AI Analysis', 'Advanced AI analysis based on your workout patterns, form data, and recovery metrics.')}
            >
              <Ionicons name="information-circle" size={20} color="#667eea" />
            </TouchableOpacity>
          </View>
          
          {aiInsights.map(renderInsightCard)}
        </View>

        {/* Achievement Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <View style={styles.achievementContainer}>
            <View style={styles.achievementCard}>
              <Ionicons name="medal" size={32} color="#f59e0b" />
              <Text style={styles.achievementTitle}>Consistency Master</Text>
              <Text style={styles.achievementDescription}>
                Worked out 4+ times/week for 3 weeks straight
              </Text>
            </View>
            
            <View style={styles.achievementCard}>
              <Ionicons name="trending-up" size={32} color="#10b981" />
              <Text style={styles.achievementTitle}>Strength Surge</Text>
              <Text style={styles.achievementDescription}>
                Increased total volume by 25% this month
              </Text>
            </View>
            
            <View style={styles.achievementCard}>
              <Ionicons name="checkmark-circle" size={32} color="#8b5cf6" />
              <Text style={styles.achievementTitle}>Form Perfect</Text>
              <Text style={styles.achievementDescription}>
                Maintained 90%+ form accuracy for 2 weeks
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('SmartWorkout')}
          >
            <Ionicons name="play" size={20} color="white" />
            <Text style={styles.actionButtonText}>Start Smart Workout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => Alert.alert('Goals', 'View and update your fitness goals')}
          >
            <Ionicons name="trophy" size={20} color="#667eea" />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              Update Goals
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  exportButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  timeframeButtonActive: {
    backgroundColor: '#667eea',
  },
  timeframeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  timeframeTextActive: {
    color: 'white',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: (width - 52) / 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  metricUnit: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  metricName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  chartPlaceholderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 12,
    textAlign: 'center',
  },
  chartSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
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
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  confidenceText: {
    fontSize: 12,
    color: '#6b7280',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  insightDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  insightFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendationText: {
    fontSize: 14,
    color: '#667eea',
    marginLeft: 8,
    flex: 1,
    fontStyle: 'italic',
  },
  achievementContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 52) / 3 - 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
    textAlign: 'center',
  },
  achievementDescription: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 14,
  },
  actionSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  actionButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#667eea',
  },
});
