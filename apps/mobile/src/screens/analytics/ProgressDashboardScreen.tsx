import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, ProgressChart } from 'react-native-chart-kit';

// Types
interface ProgressData {
  workouts: {
    thisWeek: number;
    lastWeek: number;
    weeklyGoal: number;
    completionRate: number;
    totalMinutes: number;
    averageIntensity: number;
  };
  nutrition: {
    caloriesConsumed: number;
    caloriesGoal: number;
    proteinGoal: number;
    proteinConsumed: number;
    mealsLogged: number;
    hydrationGoal: number;
    hydrationConsumed: number;
  };
  body: {
    currentWeight: number;
    goalWeight: number;
    startingWeight: number;
    bodyFatPercentage?: number;
    muscleMass?: number;
  };
  streaks: {
    currentWorkoutStreak: number;
    longestWorkoutStreak: number;
    currentNutritionStreak: number;
    longestNutritionStreak: number;
  };
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    earnedDate: string;
    category: 'workout' | 'nutrition' | 'milestone' | 'consistency';
    icon: string;
  }>;
  weeklyTrend: Array<{
    date: string;
    workouts: number;
    calories: number;
    weight?: number;
  }>;
}

interface Props {
  navigation: any;
  route: any;
}

const ProgressDashboardScreen: React.FC<Props> = ({ navigation, route }) => {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'workouts' | 'nutrition' | 'weight'>('workouts');

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockData: ProgressData = {
        workouts: {
          thisWeek: 4,
          lastWeek: 3,
          weeklyGoal: 5,
          completionRate: 0.8,
          totalMinutes: 240,
          averageIntensity: 7.5
        },
        nutrition: {
          caloriesConsumed: 1847,
          caloriesGoal: 2000,
          proteinGoal: 120,
          proteinConsumed: 95,
          mealsLogged: 3,
          hydrationGoal: 8,
          hydrationConsumed: 6
        },
        body: {
          currentWeight: 75.2,
          goalWeight: 70,
          startingWeight: 80,
          bodyFatPercentage: 18.5,
          muscleMass: 32.8
        },
        streaks: {
          currentWorkoutStreak: 7,
          longestWorkoutStreak: 12,
          currentNutritionStreak: 4,
          longestNutritionStreak: 8
        },
        achievements: [
          {
            id: '1',
            title: 'First Week Complete',
            description: 'Completed your first week of workouts',
            earnedDate: '2025-07-25',
            category: 'milestone',
            icon: 'emoji-events'
          },
          {
            id: '2',
            title: 'Consistency Champion',
            description: '7 days in a row of logging meals',
            earnedDate: '2025-07-30',
            category: 'consistency',
            icon: 'timeline'
          },
          {
            id: '3',
            title: 'Protein Power',
            description: 'Hit your protein goal 5 days this week',
            earnedDate: '2025-07-28',
            category: 'nutrition',
            icon: 'fitness-center'
          }
        ],
        weeklyTrend: [
          { date: '2025-07-25', workouts: 1, calories: 1950, weight: 75.8 },
          { date: '2025-07-26', workouts: 0, calories: 2100, weight: 75.6 },
          { date: '2025-07-27', workouts: 1, calories: 1800, weight: 75.4 },
          { date: '2025-07-28', workouts: 1, calories: 1900, weight: 75.3 },
          { date: '2025-07-29', workouts: 0, calories: 2050, weight: 75.2 },
          { date: '2025-07-30', workouts: 1, calories: 1847, weight: 75.2 },
          { date: '2025-07-31', workouts: 0, calories: 0 }
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setProgressData(mockData);
    } catch (error) {
      console.error('Error loading progress data:', error);
      Alert.alert('Error', 'Failed to load progress data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProgressData();
  };

  const getProgressColor = (current: number, goal: number): string => {
    const percentage = current / goal;
    if (percentage >= 1) return '#4CAF50';
    if (percentage >= 0.7) return '#FFA726';
    return '#FF6B6B';
  };

  const renderProgressCircle = (current: number, goal: number, label: string, unit: string = '') => {
    const percentage = Math.min(current / goal, 1);
    const color = getProgressColor(current, goal);

    return (
      <View style={styles.progressCircleContainer}>
        <ProgressChart
          data={{
            labels: [label],
            data: [percentage]
          }}
          width={100}
          height={100}
          strokeWidth={8}
          radius={32}
          chartConfig={{
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            color: (opacity = 1) => color,
            strokeWidth: 2,
            barPercentage: 0.5,
          }}
          hideLegend={true}
        />
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressValue}>{current}{unit}</Text>
          <Text style={styles.progressGoal}>/{goal}{unit}</Text>
        </View>
        <Text style={styles.progressLabel}>{label}</Text>
      </View>
    );
  };

  const renderMetricChart = () => {
    if (!progressData) return null;

    let chartData;
    let yAxisSuffix = '';
    let color = '#667eea';

    switch (selectedMetric) {
      case 'workouts':
        chartData = {
          labels: progressData.weeklyTrend.map(item => new Date(item.date).getDate().toString()),
          datasets: [{
            data: progressData.weeklyTrend.map(item => item.workouts),
            color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
            strokeWidth: 2
          }]
        };
        break;
      case 'nutrition':
        chartData = {
          labels: progressData.weeklyTrend.map(item => new Date(item.date).getDate().toString()),
          datasets: [{
            data: progressData.weeklyTrend.map(item => item.calories),
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            strokeWidth: 2
          }]
        };
        yAxisSuffix = 'cal';
        color = '#4CAF50';
        break;
      case 'weight':
        chartData = {
          labels: progressData.weeklyTrend.map(item => new Date(item.date).getDate().toString()),
          datasets: [{
            data: progressData.weeklyTrend.map(item => item.weight || progressData.body.currentWeight),
            color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
            strokeWidth: 2
          }]
        };
        yAxisSuffix = 'kg';
        color = '#FF6B6B';
        break;
    }

    return (
      <View style={styles.chartContainer}>
        <View style={styles.metricSelector}>
          {[
            { key: 'workouts', label: 'Workouts', icon: 'fitness-center' },
            { key: 'nutrition', label: 'Calories', icon: 'restaurant' },
            { key: 'weight', label: 'Weight', icon: 'monitor-weight' }
          ].map((metric) => (
            <TouchableOpacity
              key={metric.key}
              style={[
                styles.metricButton,
                selectedMetric === metric.key && styles.metricButtonActive
              ]}
              onPress={() => setSelectedMetric(metric.key as any)}
            >
              <MaterialIcons 
                name={metric.icon as any} 
                size={16} 
                color={selectedMetric === metric.key ? '#667eea' : '#666'} 
              />
              <Text style={[
                styles.metricButtonText,
                selectedMetric === metric.key && styles.metricButtonTextActive
              ]}>
                {metric.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={200}
          yAxisSuffix={yAxisSuffix}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: selectedMetric === 'weight' ? 1 : 0,
            color: (opacity = 1) => `${color}${Math.round(opacity * 255).toString(16)}`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: color
            }
          }}
          style={styles.chart}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  if (!progressData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load progress data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProgressData}>
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
            <Text style={styles.headerTitle}>Progress Dashboard</Text>
            <Text style={styles.headerSubtitle}>Track your fitness journey</Text>
          </View>

          <TouchableOpacity 
            style={styles.shareButton}
            onPress={() => Alert.alert('Share', 'Share progress feature coming soon!')}
          >
            <MaterialIcons name="share" size={24} color="white" />
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
        {/* Today's Progress */}
        <View style={styles.todaySection}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.progressGrid}>
            {renderProgressCircle(
              progressData.workouts.thisWeek, 
              progressData.workouts.weeklyGoal, 
              'Workouts'
            )}
            {renderProgressCircle(
              progressData.nutrition.caloriesConsumed, 
              progressData.nutrition.caloriesGoal, 
              'Calories'
            )}
            {renderProgressCircle(
              progressData.nutrition.hydrationConsumed, 
              progressData.nutrition.hydrationGoal, 
              'Water', 
              ' cups'
            )}
          </View>
        </View>

        {/* Weekly Trend Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Trend</Text>
          {renderMetricChart()}
        </View>

        {/* Streaks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Streaks</Text>
          <View style={styles.streaksContainer}>
            <View style={styles.streakCard}>
              <MaterialIcons name="fitness-center" size={24} color="#667eea" />
              <View style={styles.streakInfo}>
                <Text style={styles.streakValue}>{progressData.streaks.currentWorkoutStreak}</Text>
                <Text style={styles.streakLabel}>Workout Days</Text>
              </View>
              <Text style={styles.streakRecord}>Best: {progressData.streaks.longestWorkoutStreak}</Text>
            </View>

            <View style={styles.streakCard}>
              <MaterialIcons name="restaurant" size={24} color="#4CAF50" />
              <View style={styles.streakInfo}>
                <Text style={styles.streakValue}>{progressData.streaks.currentNutritionStreak}</Text>
                <Text style={styles.streakLabel}>Nutrition Days</Text>
              </View>
              <Text style={styles.streakRecord}>Best: {progressData.streaks.longestNutritionStreak}</Text>
            </View>
          </View>
        </View>

        {/* Body Composition */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body Composition</Text>
          <View style={styles.bodyStatsContainer}>
            <View style={styles.bodyStatCard}>
              <Text style={styles.bodyStatLabel}>Current Weight</Text>
              <Text style={styles.bodyStatValue}>{progressData.body.currentWeight} kg</Text>
              <Text style={styles.bodyStatChange}>
                {progressData.body.currentWeight - progressData.body.startingWeight > 0 ? '+' : ''}
                {(progressData.body.currentWeight - progressData.body.startingWeight).toFixed(1)} kg
              </Text>
            </View>

            <View style={styles.bodyStatCard}>
              <Text style={styles.bodyStatLabel}>Goal Progress</Text>
              <Text style={styles.bodyStatValue}>
                {Math.round(((progressData.body.startingWeight - progressData.body.currentWeight) / 
                (progressData.body.startingWeight - progressData.body.goalWeight)) * 100)}%
              </Text>
              <Text style={styles.bodyStatChange}>
                {(progressData.body.goalWeight - progressData.body.currentWeight).toFixed(1)} kg to go
              </Text>
            </View>

            {progressData.body.bodyFatPercentage && (
              <View style={styles.bodyStatCard}>
                <Text style={styles.bodyStatLabel}>Body Fat</Text>
                <Text style={styles.bodyStatValue}>{progressData.body.bodyFatPercentage}%</Text>
                <Text style={styles.bodyStatChange}>Healthy range</Text>
              </View>
            )}
          </View>
        </View>

        {/* Recent Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <View style={styles.achievementsContainer}>
            {progressData.achievements.slice(0, 3).map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <View style={styles.achievementIcon}>
                  <MaterialIcons name={achievement.icon as any} size={24} color="#FFA726" />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  <Text style={styles.achievementDate}>
                    {new Date(achievement.earnedDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('Achievements')}
          >
            <Text style={styles.viewAllButtonText}>View All Achievements</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#667eea" />
          </TouchableOpacity>
        </View>
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
  shareButton: {
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
    fontSize: 16,
    color: '#666',
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
  todaySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressCircleContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  progressTextContainer: {
    position: 'absolute',
    top: 35,
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  progressGoal: {
    fontSize: 12,
    color: '#666',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricSelector: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  metricButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  metricButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  metricButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
  },
  metricButtonTextActive: {
    color: '#667eea',
  },
  chart: {
    borderRadius: 8,
  },
  streaksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakCard: {
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
  streakInfo: {
    alignItems: 'center',
    marginVertical: 8,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  streakLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  streakRecord: {
    fontSize: 10,
    color: '#999',
  },
  bodyStatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bodyStatCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bodyStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  bodyStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bodyStatChange: {
    fontSize: 11,
    color: '#999',
  },
  achievementsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#fff3e0',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  achievementDate: {
    fontSize: 10,
    color: '#999',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  viewAllButtonText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
    marginRight: 4,
  },
});

export default ProgressDashboardScreen;
