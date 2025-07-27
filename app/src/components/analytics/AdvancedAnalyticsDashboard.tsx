import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LineChart, BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

interface AnalyticsData {
  workoutStats: WorkoutStats;
  nutritionStats: NutritionStats;
  progressStats: ProgressStats;
  healthStats: HealthStats;
  aiInsights: AIInsight[];
  trends: TrendData[];
}

interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number; // minutes
  avgWorkoutsPerWeek: number;
  favoriteExercises: Array<{ name: string; count: number }>;
  strengthProgress: Array<{ date: string; value: number }>;
  consistencyScore: number;
  intensityTrends: Array<{ date: string; intensity: number }>;
}

interface NutritionStats {
  avgCalories: number;
  macroDistribution: { protein: number; carbs: number; fat: number };
  waterIntakeAvg: number;
  nutritionScore: number;
  caloricTrends: Array<{ date: string; calories: number }>;
}

interface ProgressStats {
  weightChange: number;
  bodyFatChange: number;
  muscleGainChange: number;
  strengthGains: Array<{ exercise: string; improvement: number }>;
  measurementChanges: { [key: string]: number };
}

interface HealthStats {
  avgHeartRate: number;
  sleepQuality: number;
  stressLevel: number;
  recoveryScore: number;
  stepsAvg: number;
  activeMinutesAvg: number;
}

interface AIInsight {
  id: string;
  type: 'recommendation' | 'warning' | 'achievement' | 'trend';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface TrendData {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  change: number;
  period: string;
}

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'workouts' | 'nutrition' | 'progress' | 'health'>('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate loading analytics data
      setTimeout(() => {
        const mockData: AnalyticsData = generateMockAnalyticsData();
        setAnalyticsData(mockData);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Analytics loading error:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load analytics data');
    }
  };

  const generateMockAnalyticsData = (): AnalyticsData => {
    const today = new Date();
    const dates = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return {
      workoutStats: {
        totalWorkouts: 24,
        totalDuration: 1680, // 28 hours
        avgWorkoutsPerWeek: 4.2,
        favoriteExercises: [
          { name: 'Squat', count: 18 },
          { name: 'Deadlift', count: 15 },
          { name: 'Bench Press', count: 12 },
          { name: 'Pull Up', count: 10 },
        ],
        strengthProgress: dates.map((date, i) => ({
          date,
          value: 100 + i * 2 + Math.random() * 10,
        })),
        consistencyScore: 87,
        intensityTrends: dates.map((date, i) => ({
          date,
          intensity: 6 + Math.sin(i / 7) * 2 + Math.random(),
        })),
      },
      nutritionStats: {
        avgCalories: 2150,
        macroDistribution: { protein: 30, carbs: 45, fat: 25 },
        waterIntakeAvg: 2.8, // liters
        nutritionScore: 82,
        caloricTrends: dates.map((date, i) => ({
          date,
          calories: 2000 + Math.sin(i / 7) * 300 + Math.random() * 200,
        })),
      },
      progressStats: {
        weightChange: -3.2, // kg lost
        bodyFatChange: -2.1, // percentage points
        muscleGainChange: 1.8, // kg gained
        strengthGains: [
          { exercise: 'Squat', improvement: 15 },
          { exercise: 'Deadlift', improvement: 20 },
          { exercise: 'Bench Press', improvement: 10 },
        ],
        measurementChanges: {
          chest: 2.5,
          waist: -3.2,
          arms: 1.8,
          thighs: 2.1,
        },
      },
      healthStats: {
        avgHeartRate: 72,
        sleepQuality: 85,
        stressLevel: 35,
        recoveryScore: 78,
        stepsAvg: 8450,
        activeMinutesAvg: 45,
      },
      aiInsights: [
        {
          id: '1',
          type: 'recommendation',
          title: 'Optimize Recovery',
          description: 'Your workout intensity has increased 15% this week. Consider adding an extra rest day.',
          actionable: true,
          priority: 'high',
        },
        {
          id: '2',
          type: 'achievement',
          title: 'Strength Milestone',
          description: 'You\'ve achieved a 20kg increase in deadlift over the past month!',
          actionable: false,
          priority: 'medium',
        },
        {
          id: '3',
          type: 'warning',
          title: 'Nutrition Deficit',
          description: 'Protein intake is 18% below your target. Consider adding protein-rich snacks.',
          actionable: true,
          priority: 'medium',
        },
        {
          id: '4',
          type: 'trend',
          title: 'Consistency Improving',
          description: 'Your workout consistency has improved by 23% this month. Keep it up!',
          actionable: false,
          priority: 'low',
        },
      ],
      trends: [
        { metric: 'Workout Frequency', direction: 'up', change: 15, period: 'month' },
        { metric: 'Strength Progress', direction: 'up', change: 12, period: 'month' },
        { metric: 'Body Weight', direction: 'down', change: 3.2, period: 'month' },
        { metric: 'Sleep Quality', direction: 'up', change: 8, period: 'week' },
      ],
    };
  };

  const chartConfig = {
    backgroundGradientFrom: '#667eea',
    backgroundGradientTo: '#764ba2',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
  };

  const renderOverviewTab = () => {
    if (!analyticsData) return null;

    return (
      <ScrollView style={styles.tabContent}>
        {/* Key Metrics Cards */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="fitness" size={24} color="#667eea" />
            <Text style={styles.metricValue}>{analyticsData.workoutStats.totalWorkouts}</Text>
            <Text style={styles.metricLabel}>Total Workouts</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="time" size={24} color="#667eea" />
            <Text style={styles.metricValue}>{Math.round(analyticsData.workoutStats.totalDuration / 60)}h</Text>
            <Text style={styles.metricLabel}>Training Time</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="trending-up" size={24} color="#667eea" />
            <Text style={styles.metricValue}>{analyticsData.progressStats.weightChange}kg</Text>
            <Text style={styles.metricLabel}>Weight Change</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="heart" size={24} color="#667eea" />
            <Text style={styles.metricValue}>{analyticsData.healthStats.recoveryScore}%</Text>
            <Text style={styles.metricLabel}>Recovery Score</Text>
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          {analyticsData.aiInsights.map((insight) => (
            <View key={insight.id} style={[styles.insightCard, { borderLeftColor: getInsightColor(insight.type) }]}>
              <View style={styles.insightHeader}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(insight.priority) }]}>
                  <Text style={styles.priorityText}>{insight.priority.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.insightDescription}>{insight.description}</Text>
            </View>
          ))}
        </View>

        {/* Trends Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trends Summary</Text>
          {analyticsData.trends.map((trend, index) => (
            <View key={index} style={styles.trendItem}>
              <View style={styles.trendLeft}>
                <Text style={styles.trendMetric}>{trend.metric}</Text>
                <Text style={styles.trendPeriod}>Past {trend.period}</Text>
              </View>
              <View style={styles.trendRight}>
                <Ionicons 
                  name={trend.direction === 'up' ? 'trending-up' : trend.direction === 'down' ? 'trending-down' : 'remove'} 
                  size={20} 
                  color={trend.direction === 'up' ? '#4CAF50' : trend.direction === 'down' ? '#f44336' : '#FFC107'} 
                />
                <Text style={[styles.trendValue, { color: getTrendColor(trend.direction) }]}>
                  {trend.change}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderWorkoutsTab = () => {
    if (!analyticsData) return null;

    const strengthData = {
      labels: analyticsData.workoutStats.strengthProgress.slice(-7).map(p => new Date(p.date).getDate().toString()),
      datasets: [{
        data: analyticsData.workoutStats.strengthProgress.slice(-7).map(p => p.value),
      }],
    };

    const exerciseData = analyticsData.workoutStats.favoriteExercises.map((exercise, index) => ({
      name: exercise.name,
      count: exercise.count,
      color: `hsl(${index * 60}, 70%, 50%)`,
      legendFontColor: '#333',
      legendFontSize: 12,
    }));

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Strength Progress (Last 7 Days)</Text>
          <LineChart
            data={strengthData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Exercises</Text>
          <PieChart
            data={exerciseData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Metrics</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{analyticsData.workoutStats.avgWorkoutsPerWeek}</Text>
              <Text style={styles.metricLabel}>Avg/Week</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{analyticsData.workoutStats.consistencyScore}%</Text>
              <Text style={styles.metricLabel}>Consistency</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{Math.round(analyticsData.workoutStats.totalDuration / analyticsData.workoutStats.totalWorkouts)}</Text>
              <Text style={styles.metricLabel}>Avg Duration (min)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderNutritionTab = () => {
    if (!analyticsData) return null;

    const macroData = {
      data: [
        analyticsData.nutritionStats.macroDistribution.protein / 100,
        analyticsData.nutritionStats.macroDistribution.carbs / 100,
        analyticsData.nutritionStats.macroDistribution.fat / 100,
      ],
    };

    const caloricData = {
      labels: analyticsData.nutritionStats.caloricTrends.slice(-7).map(c => new Date(c.date).getDate().toString()),
      datasets: [{
        data: analyticsData.nutritionStats.caloricTrends.slice(-7).map(c => c.calories),
      }],
    };

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Calories (Last 7 Days)</Text>
          <LineChart
            data={caloricData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Macro Distribution</Text>
          <ProgressChart
            data={macroData}
            width={screenWidth - 40}
            height={220}
            strokeWidth={16}
            radius={32}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1, index = 0) => {
                const colors = ['#FF6384', '#36A2EB', '#FFCE56'];
                return colors[index] || `rgba(255, 255, 255, ${opacity})`;
              },
            }}
            hideLegend={false}
            style={styles.chart}
          />
          <View style={styles.macroLegend}>
            <View style={styles.macroItem}>
              <View style={[styles.macroColor, { backgroundColor: '#FF6384' }]} />
              <Text>Protein ({analyticsData.nutritionStats.macroDistribution.protein}%)</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={[styles.macroColor, { backgroundColor: '#36A2EB' }]} />
              <Text>Carbs ({analyticsData.nutritionStats.macroDistribution.carbs}%)</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={[styles.macroColor, { backgroundColor: '#FFCE56' }]} />
              <Text>Fat ({analyticsData.nutritionStats.macroDistribution.fat}%)</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition Metrics</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{analyticsData.nutritionStats.avgCalories}</Text>
              <Text style={styles.metricLabel}>Avg Calories</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{analyticsData.nutritionStats.waterIntakeAvg}L</Text>
              <Text style={styles.metricLabel}>Water/Day</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{analyticsData.nutritionStats.nutritionScore}%</Text>
              <Text style={styles.metricLabel}>Nutrition Score</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderProgressTab = () => {
    if (!analyticsData) return null;

    const strengthGainsData = {
      labels: analyticsData.progressStats.strengthGains.map(s => s.exercise),
      datasets: [{
        data: analyticsData.progressStats.strengthGains.map(s => s.improvement),
      }],
    };

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Strength Gains (kg)</Text>
          <BarChart
            data={strengthGainsData}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix="kg"
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body Composition Changes</Text>
          <View style={styles.progressGrid}>
            <View style={styles.progressCard}>
              <Text style={styles.progressLabel}>Weight</Text>
              <Text style={[styles.progressValue, { color: analyticsData.progressStats.weightChange < 0 ? '#4CAF50' : '#f44336' }]}>
                {analyticsData.progressStats.weightChange > 0 ? '+' : ''}{analyticsData.progressStats.weightChange} kg
              </Text>
            </View>
            <View style={styles.progressCard}>
              <Text style={styles.progressLabel}>Body Fat</Text>
              <Text style={[styles.progressValue, { color: analyticsData.progressStats.bodyFatChange < 0 ? '#4CAF50' : '#f44336' }]}>
                {analyticsData.progressStats.bodyFatChange > 0 ? '+' : ''}{analyticsData.progressStats.bodyFatChange}%
              </Text>
            </View>
            <View style={styles.progressCard}>
              <Text style={styles.progressLabel}>Muscle Mass</Text>
              <Text style={[styles.progressValue, { color: analyticsData.progressStats.muscleGainChange > 0 ? '#4CAF50' : '#f44336' }]}>
                +{analyticsData.progressStats.muscleGainChange} kg
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Measurements Changes (cm)</Text>
          {Object.entries(analyticsData.progressStats.measurementChanges).map(([part, change]) => (
            <View key={part} style={styles.measurementItem}>
              <Text style={styles.measurementLabel}>{part.charAt(0).toUpperCase() + part.slice(1)}</Text>
              <Text style={[styles.measurementValue, { color: change > 0 ? '#4CAF50' : '#f44336' }]}>
                {change > 0 ? '+' : ''}{change} cm
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderHealthTab = () => {
    if (!analyticsData) return null;

    const healthScores = {
      data: [
        analyticsData.healthStats.sleepQuality / 100,
        analyticsData.healthStats.recoveryScore / 100,
        (100 - analyticsData.healthStats.stressLevel) / 100, // Invert stress level
      ],
    };

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Scores</Text>
          <ProgressChart
            data={healthScores}
            width={screenWidth - 40}
            height={220}
            strokeWidth={16}
            radius={32}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1, index = 0) => {
                const colors = ['#4CAF50', '#2196F3', '#FF9800'];
                return colors[index] || `rgba(255, 255, 255, ${opacity})`;
              },
            }}
            hideLegend={false}
            style={styles.chart}
          />
          <View style={styles.healthLegend}>
            <View style={styles.healthItem}>
              <View style={[styles.healthColor, { backgroundColor: '#4CAF50' }]} />
              <Text>Sleep Quality ({analyticsData.healthStats.sleepQuality}%)</Text>
            </View>
            <View style={styles.healthItem}>
              <View style={[styles.healthColor, { backgroundColor: '#2196F3' }]} />
              <Text>Recovery ({analyticsData.healthStats.recoveryScore}%)</Text>
            </View>
            <View style={styles.healthItem}>
              <View style={[styles.healthColor, { backgroundColor: '#FF9800' }]} />
              <Text>Low Stress ({100 - analyticsData.healthStats.stressLevel}%)</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Metrics</Text>
          <View style={styles.healthMetrics}>
            <View style={styles.healthMetric}>
              <Ionicons name="heart" size={24} color="#f44336" />
              <Text style={styles.healthMetricValue}>{analyticsData.healthStats.avgHeartRate}</Text>
              <Text style={styles.healthMetricLabel}>Avg Heart Rate</Text>
            </View>
            <View style={styles.healthMetric}>
              <Ionicons name="walk" size={24} color="#4CAF50" />
              <Text style={styles.healthMetricValue}>{analyticsData.healthStats.stepsAvg.toLocaleString()}</Text>
              <Text style={styles.healthMetricLabel}>Daily Steps</Text>
            </View>
            <View style={styles.healthMetric}>
              <Ionicons name="time" size={24} color="#2196F3" />
              <Text style={styles.healthMetricValue}>{analyticsData.healthStats.activeMinutesAvg}</Text>
              <Text style={styles.healthMetricLabel}>Active Minutes</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'recommendation': return '#2196F3';
      case 'warning': return '#FF9800';
      case 'achievement': return '#4CAF50';
      case 'trend': return '#9C27B0';
      default: return '#757575';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#757575';
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return '#4CAF50';
      case 'down': return '#f44336';
      case 'stable': return '#FFC107';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>Advanced Analytics</Text>
        <View style={styles.timeRangeContainer}>
          {(['week', 'month', 'year'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[styles.timeRangeButton, selectedTimeRange === range && styles.timeRangeButtonActive]}
              onPress={() => setSelectedTimeRange(range)}
            >
              <Text style={[styles.timeRangeText, selectedTimeRange === range && styles.timeRangeTextActive]}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {([
          { key: 'overview', icon: 'analytics', label: 'Overview' },
          { key: 'workouts', icon: 'fitness', label: 'Workouts' },
          { key: 'nutrition', icon: 'restaurant', label: 'Nutrition' },
          { key: 'progress', icon: 'trending-up', label: 'Progress' },
          { key: 'health', icon: 'heart', label: 'Health' },
        ] as const).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, selectedTab === tab.key && styles.tabButtonActive]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={selectedTab === tab.key ? '#667eea' : '#757575'} 
            />
            <Text style={[styles.tabLabel, selectedTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {selectedTab === 'overview' && renderOverviewTab()}
      {selectedTab === 'workouts' && renderWorkoutsTab()}
      {selectedTab === 'nutrition' && renderNutritionTab()}
      {selectedTab === 'progress' && renderProgressTab()}
      {selectedTab === 'health' && renderHealthTab()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#fff',
  },
  timeRangeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: '#667eea',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#667eea',
  },
  tabLabel: {
    fontSize: 10,
    color: '#757575',
    marginTop: 2,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#667eea',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 8,
    marginTop: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    margin: '1%',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  insightCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  trendLeft: {
    flex: 1,
  },
  trendMetric: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  trendPeriod: {
    fontSize: 12,
    color: '#666',
  },
  trendRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  macroLegend: {
    marginTop: 16,
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressCard: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    minWidth: 80,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  measurementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  measurementLabel: {
    fontSize: 16,
    color: '#333',
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  healthLegend: {
    marginTop: 16,
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  healthMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  healthMetric: {
    alignItems: 'center',
  },
  healthMetricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  healthMetricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default AdvancedAnalyticsDashboard;