import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const { width } = Dimensions.get('window');

interface WorkoutAnalyticsScreenProps {
  navigation: any;
}

interface AnalyticsData {
  weeklyVolume: number[];
  monthlyProgress: number[];
  exerciseDistribution: { name: string; count: number; color: string }[];
  strengthProgress: { exercise: string; weight: number; date: string }[];
  caloriesBurned: number[];
}

export default function WorkoutAnalyticsScreen({ navigation }: WorkoutAnalyticsScreenProps) {
  const { workoutPlans, exercises } = useSelector((state: RootState) => state.workouts);
  const { entries } = useSelector((state: RootState) => state.progress);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<'week' | 'month' | 'year'>('month');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    weeklyVolume: [],
    monthlyProgress: [],
    exerciseDistribution: [],
    strengthProgress: [],
    caloriesBurned: [],
  });

  useEffect(() => {
    generateAnalyticsData();
  }, [selectedTimeFrame, workoutPlans, entries]);

  const generateAnalyticsData = () => {
    // Generate sample analytics data based on the selected timeframe
    const data: AnalyticsData = {
      weeklyVolume: generateWeeklyVolumeData(),
      monthlyProgress: generateMonthlyProgressData(),
      exerciseDistribution: generateExerciseDistributionData(),
      strengthProgress: generateStrengthProgressData(),
      caloriesBurned: generateCaloriesBurnedData(),
    };
    setAnalyticsData(data);
  };

  const generateWeeklyVolumeData = (): number[] => {
    // Sample weekly volume data (in minutes)
    switch (selectedTimeFrame) {
      case 'week':
        return [45, 60, 30, 75, 45, 90, 0]; // Last 7 days
      case 'month':
        return [280, 320, 290, 350]; // Last 4 weeks
      case 'year':
        return [1200, 1350, 1180, 1450, 1320, 1500, 1280, 1380, 1420, 1600, 1450, 1500]; // Last 12 months
      default:
        return [280, 320, 290, 350];
    }
  };

  const generateMonthlyProgressData = (): number[] => {
    // Sample progress scores
    return [75, 78, 82, 85, 88, 90, 92, 94, 96, 94, 97, 95];
  };

  const generateExerciseDistributionData = () => {
    return [
      { name: 'Strength', count: 45, color: '#667eea' },
      { name: 'Cardio', count: 30, color: '#52c41a' },
      { name: 'Core', count: 20, color: '#fa8c16' },
      { name: 'Flexibility', count: 15, color: '#722ed1' },
      { name: 'HIIT', count: 25, color: '#ff4d4f' },
    ];
  };

  const generateStrengthProgressData = () => {
    return [
      { exercise: 'Bench Press', weight: 185, date: '2025-07-20' },
      { exercise: 'Squat', weight: 225, date: '2025-07-18' },
      { exercise: 'Deadlift', weight: 275, date: '2025-07-15' },
      { exercise: 'Overhead Press', weight: 135, date: '2025-07-12' },
    ];
  };

  const generateCaloriesBurnedData = (): number[] => {
    switch (selectedTimeFrame) {
      case 'week':
        return [320, 450, 280, 520, 380, 600, 0];
      case 'month':
        return [2100, 2350, 2180, 2500];
      case 'year':
        return [8500, 9200, 8800, 9500, 9100, 9800, 9200, 9600, 9400, 10200, 9800, 10000];
      default:
        return [2100, 2350, 2180, 2500];
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    generateAnalyticsData();
    setRefreshing(false);
  };

  const getTimeFrameLabels = () => {
    switch (selectedTimeFrame) {
      case 'week':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case 'month':
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      case 'year':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      default:
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    }
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
      fontWeight: '600',
    },
  };

  const progressChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(82, 196, 26, ${opacity})`,
  };

  const caloriesChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(255, 77, 79, ${opacity})`,
  };

  const renderStatCard = (title: string, value: string, subtitle: string, icon: string, color: string, trend?: number) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        {trend !== undefined && (
          <View style={styles.trendContainer}>
            <Ionicons 
              name={trend > 0 ? 'trending-up' : trend < 0 ? 'trending-down' : 'remove'} 
              size={16} 
              color={trend > 0 ? '#52c41a' : trend < 0 ? '#ff4d4f' : '#666'} 
            />
            <Text style={[styles.trendText, { color: trend > 0 ? '#52c41a' : trend < 0 ? '#ff4d4f' : '#666' }]}>
              {trend > 0 ? '+' : ''}{trend}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  const renderTimeFrameSelector = () => (
    <View style={styles.timeFrameSelector}>
      {(['week', 'month', 'year'] as const).map((timeFrame) => (
        <TouchableOpacity
          key={timeFrame}
          style={[
            styles.timeFrameButton,
            selectedTimeFrame === timeFrame && styles.timeFrameButtonActive,
          ]}
          onPress={() => setSelectedTimeFrame(timeFrame)}
        >
          <Text
            style={[
              styles.timeFrameButtonText,
              selectedTimeFrame === timeFrame && styles.timeFrameButtonTextActive,
            ]}
          >
            {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
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
        <Text style={styles.headerTitle}>Workout Analytics</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => {
            Alert.alert('Share', 'Analytics sharing coming soon!');
          }}
        >
          <Ionicons name="share-outline" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Time Frame Selector */}
        {renderTimeFrameSelector()}

        {/* Key Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.statsGrid}>
            {renderStatCard(
              'Total Workouts',
              '28',
              'This month',
              'fitness',
              '#667eea',
              12
            )}
            {renderStatCard(
              'Avg Duration',
              '52min',
              'Per workout',
              'time',
              '#52c41a',
              8
            )}
            {renderStatCard(
              'Calories Burned',
              '9,240',
              'This month',
              'flame',
              '#ff4d4f',
              15
            )}
            {renderStatCard(
              'Consistency',
              '85%',
              'Weekly average',
              'trophy',
              '#fa8c16',
              5
            )}
          </View>
        </View>

        {/* Workout Volume Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Workout Volume</Text>
          <Text style={styles.chartSubtitle}>
            {selectedTimeFrame === 'week' ? 'Minutes per day' : 
             selectedTimeFrame === 'month' ? 'Minutes per week' : 'Hours per month'}
          </Text>
          <BarChart
            data={{
              labels: getTimeFrameLabels(),
              datasets: [{ data: analyticsData.weeklyVolume }],
            }}
            width={width - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
            showBarTops={false}
          />
        </View>

        {/* Progress Trend Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Fitness Progress</Text>
          <Text style={styles.chartSubtitle}>Progress score over time</Text>
          <LineChart
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              datasets: [{ data: analyticsData.monthlyProgress }],
            }}
            width={width - 40}
            height={220}
            chartConfig={progressChartConfig}
            style={styles.chart}
            bezier
          />
        </View>

        {/* Exercise Distribution */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Exercise Distribution</Text>
          <Text style={styles.chartSubtitle}>Workout types this month</Text>
          <PieChart
            data={analyticsData.exerciseDistribution.map(item => ({
              name: item.name,
              population: item.count,
              color: item.color,
              legendFontColor: '#333',
              legendFontSize: 12,
            }))}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </View>

        {/* Calories Burned Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Calories Burned</Text>
          <Text style={styles.chartSubtitle}>
            {selectedTimeFrame === 'week' ? 'Daily calories' : 
             selectedTimeFrame === 'month' ? 'Weekly calories' : 'Monthly calories'}
          </Text>
          <LineChart
            data={{
              labels: getTimeFrameLabels(),
              datasets: [{ data: analyticsData.caloriesBurned }],
            }}
            width={width - 40}
            height={220}
            chartConfig={caloriesChartConfig}
            style={styles.chart}
            bezier
          />
        </View>

        {/* Strength Progress */}
        <View style={styles.strengthProgressContainer}>
          <Text style={styles.sectionTitle}>Strength Progress</Text>
          <Text style={styles.sectionSubtitle}>Recent personal records</Text>
          {analyticsData.strengthProgress.map((record, index) => (
            <View key={index} style={styles.strengthRecord}>
              <View style={styles.strengthRecordInfo}>
                <Text style={styles.strengthRecordExercise}>{record.exercise}</Text>
                <Text style={styles.strengthRecordDate}>
                  {new Date(record.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.strengthRecordWeight}>
                <Text style={styles.strengthRecordWeightText}>{record.weight} lbs</Text>
                <Ionicons name="trending-up" size={16} color="#52c41a" />
              </View>
            </View>
          ))}
        </View>

        {/* Insights & Recommendations */}
        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons name="bulb" size={20} color="#fa8c16" />
              <Text style={styles.insightTitle}>Weekly Pattern</Text>
            </View>
            <Text style={styles.insightText}>
              You're most consistent with Tuesday and Thursday workouts. Consider scheduling your most challenging sessions on these days.
            </Text>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons name="trending-up" size={20} color="#52c41a" />
              <Text style={styles.insightTitle}>Progress Trend</Text>
            </View>
            <Text style={styles.insightText}>
              Your fitness score has improved 22% this quarter. Keep up the excellent work with compound movements.
            </Text>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons name="flash" size={20} color="#667eea" />
              <Text style={styles.insightTitle}>Optimization</Text>
            </View>
            <Text style={styles.insightText}>
              Adding 15 minutes of flexibility work could improve your recovery time by an estimated 18%.
            </Text>
          </View>
        </View>

        {/* Goals Progress */}
        <View style={styles.goalsContainer}>
          <Text style={styles.sectionTitle}>Monthly Goals</Text>
          
          <View style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalTitle}>Workout Frequency</Text>
              <Text style={styles.goalSubtitle}>20 workouts this month</Text>
            </View>
            <View style={styles.goalProgress}>
              <View style={styles.goalProgressBar}>
                <View style={[styles.goalProgressFill, { width: '70%' }]} />
              </View>
              <Text style={styles.goalProgressText}>14/20</Text>
            </View>
          </View>

          <View style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalTitle}>Strength Gains</Text>
              <Text style={styles.goalSubtitle}>Increase bench press by 10lbs</Text>
            </View>
            <View style={styles.goalProgress}>
              <View style={styles.goalProgressBar}>
                <View style={[styles.goalProgressFill, { width: '60%' }]} />
              </View>
              <Text style={styles.goalProgressText}>6/10 lbs</Text>
            </View>
          </View>

          <View style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalTitle}>Cardio Endurance</Text>
              <Text style={styles.goalSubtitle}>Run 5K under 25 minutes</Text>
            </View>
            <View style={styles.goalProgress}>
              <View style={styles.goalProgressBar}>
                <View style={[styles.goalProgressFill, { width: '85%' }]} />
              </View>
              <Text style={styles.goalProgressText}>25:30</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  timeFrameSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 10,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeFrameButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  timeFrameButtonActive: {
    backgroundColor: '#667eea',
  },
  timeFrameButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  timeFrameButtonTextActive: {
    color: 'white',
  },
  statsContainer: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    backgroundColor: 'white',
    width: (width - 50) / 2,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  chartContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
  },
  chart: {
    borderRadius: 10,
  },
  strengthProgressContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  strengthRecord: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  strengthRecordInfo: {
    flex: 1,
  },
  strengthRecordExercise: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  strengthRecordDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  strengthRecordWeight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  strengthRecordWeightText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#52c41a',
  },
  insightsContainer: {
    margin: 15,
  },
  insightCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  insightText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  goalsContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  goalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  goalProgress: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  goalProgressBar: {
    width: 60,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 5,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 3,
  },
  goalProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
});
