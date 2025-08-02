import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LineChart, BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== ADVANCED AI ANALYTICS DASHBOARD =====
// Comprehensive analytics with ML insights, predictions, and actionable recommendations

export interface AnalyticsData {
  workoutMetrics: WorkoutMetrics;
  progressMetrics: ProgressMetrics;
  nutritionMetrics: NutritionMetrics;
  performanceMetrics: PerformanceMetrics;
  healthMetrics: HealthMetrics;
  predictions: PredictionMetrics;
  insights: InsightData[];
  goals: GoalProgress[];
}

export interface WorkoutMetrics {
  totalWorkouts: number;
  totalDuration: number; // minutes
  averageIntensity: number;
  consistencyScore: number; // 0-100%
  favoriteWorkoutType: string;
  weeklyFrequency: number;
  monthlyTrend: number[]; // last 12 months
  workoutTypeDistribution: WorkoutTypeData[];
  intensityOverTime: DateValue[];
  durationOverTime: DateValue[];
}

export interface ProgressMetrics {
  strengthGains: StrengthGain[];
  weightProgress: WeightProgress;
  bodyComposition: BodyComposition;
  cardiovascularImprovement: CardioProgress;
  flexibilityGains: FlexibilityGain[];
  overallProgressScore: number; // 0-100%
  milestonesAchieved: Milestone[];
  personalRecords: PersonalRecord[];
}

export interface NutritionMetrics {
  averageDailyCalories: number;
  macroBalance: MacroBalance;
  hydrationScore: number; // 0-100%
  mealConsistency: number; // 0-100%
  nutritionQuality: number; // 0-100%
  calorieDeficitSurplus: number; // negative = deficit
  weeklyNutritionTrend: DateValue[];
  topFoods: FoodFrequency[];
}

export interface PerformanceMetrics {
  enduranceScore: number; // 0-100%
  strengthScore: number; // 0-100%
  powerScore: number; // 0-100%
  recoveryScore: number; // 0-100%
  performanceTrend: DateValue[];
  vo2MaxEstimate: number;
  heartRateVariability: number;
  restingHeartRate: number;
}

export interface HealthMetrics {
  sleepQuality: number; // 0-100%
  stressLevel: number; // 0-100%
  energyLevel: number; // 0-100%
  recoveryStatus: 'excellent' | 'good' | 'fair' | 'poor';
  injuryRisk: number; // 0-100%
  burnoutRisk: number; // 0-100%
  healthTrend: DateValue[];
  biomarkers: Biomarker[];
}

export interface PredictionMetrics {
  goalCompletionProbability: GoalPrediction[];
  injuryRiskPrediction: RiskPrediction;
  plateauWarning: PlateauWarning | null;
  optimalRestDayPrediction: Date[];
  performancePeakPrediction: DateValue[];
  weightLossPrediction?: WeightPrediction;
  strengthGainPrediction?: StrengthPrediction;
}

export interface InsightData {
  id: string;
  type: 'positive' | 'warning' | 'improvement' | 'achievement';
  category: 'workout' | 'nutrition' | 'recovery' | 'performance' | 'health';
  title: string;
  description: string;
  actionable: boolean;
  recommendations?: string[];
  confidence: number; // 0-1
  impact: 'high' | 'medium' | 'low';
  priority: number; // 1-10
  date: Date;
}

export interface DateValue {
  date: string;
  value: number;
}

export interface WorkoutTypeData {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

export interface StrengthGain {
  exercise: string;
  initialMax: number;
  currentMax: number;
  gainPercentage: number;
  timeframe: number; // days
}

export interface WeightProgress {
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  totalLoss: number;
  weeklyAverage: number;
  trend: 'losing' | 'gaining' | 'maintaining';
  progressToGoal: number; // 0-100%
}

export interface BodyComposition {
  bodyFatPercentage?: number;
  muscleMassPercentage?: number;
  visceralFat?: number;
  bmi: number;
  changes: BodyCompositionChange[];
}

export interface BodyCompositionChange {
  metric: string;
  change: number;
  timeframe: string;
  trend: 'improving' | 'stable' | 'declining';
}

export interface CardioProgress {
  vo2MaxImprovement: number;
  restingHeartRateChange: number;
  enduranceGains: EnduranceGain[];
  recoveryTimeImprovement: number;
}

export interface EnduranceGain {
  activity: string;
  improvement: number;
  metric: 'distance' | 'time' | 'pace';
  timeframe: number; // days
}

export interface FlexibilityGain {
  bodyPart: string;
  initialScore: number;
  currentScore: number;
  improvement: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  achievedDate: Date;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface PersonalRecord {
  id: string;
  exercise: string;
  previousRecord: number;
  newRecord: number;
  improvement: number;
  achievedDate: Date;
  unit: string;
}

export interface MacroBalance {
  protein: number; // percentage
  carbs: number; // percentage
  fat: number; // percentage
  fiber: number; // grams
  idealBalance: {
    protein: [number, number]; // min, max percentage
    carbs: [number, number];
    fat: [number, number];
  };
}

export interface FoodFrequency {
  food: string;
  frequency: number;
  category: string;
  nutritionScore: number; // 0-100%
}

export interface Biomarker {
  name: string;
  value: number;
  unit: string;
  optimal: [number, number]; // min, max
  status: 'optimal' | 'good' | 'fair' | 'poor';
  trend: 'improving' | 'stable' | 'declining';
}

export interface GoalPrediction {
  goalId: string;
  goalName: string;
  probability: number; // 0-100%
  estimatedCompletion: Date;
  confidence: number; // 0-1
  factors: string[];
}

export interface RiskPrediction {
  overallRisk: number; // 0-100%
  categories: RiskCategory[];
  preventiveMeasures: string[];
  timeframe: string;
}

export interface RiskCategory {
  category: string;
  risk: number; // 0-100%
  factors: string[];
}

export interface PlateauWarning {
  exercise: string;
  plateauDuration: number; // days
  likelihood: number; // 0-100%
  recommendations: string[];
}

export interface WeightPrediction {
  targetDate: Date;
  predictedWeight: number;
  confidence: number;
  trajectory: DateValue[];
}

export interface StrengthPrediction {
  exercise: string;
  predictedMax: number;
  timeframe: number; // days
  confidence: number;
}

export interface GoalProgress {
  id: string;
  name: string;
  category: string;
  targetValue: number;
  currentValue: number;
  progress: number; // 0-100%
  onTrack: boolean;
  estimatedCompletion: Date;
  trend: 'ahead' | 'on_track' | 'behind';
}

interface AnalyticsDashboardProps {
  userId: string;
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  onTimeRangeChange: (range: 'week' | 'month' | 'quarter' | 'year') => void;
}

const { width: screenWidth } = Dimensions.get('window');
const chartConfig = {
  backgroundColor: '#000000',
  backgroundGradientFrom: '#1E2923',
  backgroundGradientTo: '#08130D',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#ffa726',
  },
};

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  userId,
  timeRange,
  onTimeRangeChange,
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'performance' | 'health' | 'predictions'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [userId, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await generateAnalyticsData(userId, timeRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const memoizedChartData = useMemo(() => {
    if (!analyticsData) return null;
    
    return {
      progressChart: {
        labels: ['Strength', 'Endurance', 'Flexibility', 'Nutrition'],
        data: [
          analyticsData.performanceMetrics.strengthScore / 100,
          analyticsData.performanceMetrics.enduranceScore / 100,
          analyticsData.progressMetrics.overallProgressScore / 100,
          analyticsData.nutritionMetrics.nutritionQuality / 100,
        ],
      },
      workoutTrendChart: {
        labels: analyticsData.workoutMetrics.intensityOverTime.slice(-7).map(d => 
          new Date(d.date).toLocaleDateString('en', { weekday: 'short' })
        ),
        datasets: [{
          data: analyticsData.workoutMetrics.intensityOverTime.slice(-7).map(d => d.value),
          color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
          strokeWidth: 3,
        }],
      },
      workoutDistribution: analyticsData.workoutMetrics.workoutTypeDistribution.map(item => ({
        name: item.type,
        population: item.count,
        color: item.color,
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      })),
    };
  }, [analyticsData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Analyzing your data...</Text>
      </View>
    );
  }

  if (!analyticsData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="analytics-outline" size={64} color="#999" />
        <Text style={styles.errorText}>No data available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadAnalyticsData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Dashboard</Text>
        <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
          <Ionicons 
            name={refreshing ? "hourglass-outline" : "refresh-outline"} 
            size={24} 
            color="#007AFF" 
          />
        </TouchableOpacity>
      </View>

      {/* Time Range Selector */}
      <View style={styles.timeRangeSelector}>
        {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.timeRangeButtonActive,
            ]}
            onPress={() => onTimeRangeChange(range)}
          >
            <Text
              style={[
                styles.timeRangeButtonText,
                timeRange === range && styles.timeRangeButtonTextActive,
              ]}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        {(['overview', 'performance', 'health', 'predictions'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedTab === tab && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Ionicons
              name={getTabIcon(tab) as any}
              size={20}
              color={selectedTab === tab ? '#007AFF' : '#999'}
            />
            <Text
              style={[
                styles.tabButtonText,
                selectedTab === tab && styles.tabButtonTextActive,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && (
          <OverviewTab analyticsData={analyticsData} chartData={memoizedChartData} />
        )}
        {selectedTab === 'performance' && (
          <PerformanceTab analyticsData={analyticsData} />
        )}
        {selectedTab === 'health' && (
          <HealthTab analyticsData={analyticsData} />
        )}
        {selectedTab === 'predictions' && (
          <PredictionsTab analyticsData={analyticsData} />
        )}
      </ScrollView>
    </View>
  );
};

// ===== TAB COMPONENTS =====

const OverviewTab: React.FC<{ analyticsData: AnalyticsData; chartData: any }> = ({
  analyticsData,
  chartData,
}) => (
  <View>
    {/* Key Metrics Cards */}
    <View style={styles.metricsGrid}>
      <MetricCard
        title="Workout Streak"
        value={`${analyticsData.workoutMetrics.consistencyScore}%`}
        subtitle="Consistency Score"
        icon="fitness-outline"
        color="#4CAF50"
        trend={analyticsData.workoutMetrics.weeklyFrequency > 3 ? 'up' : 'down'}
      />
      <MetricCard
        title="Progress Score"
        value={`${analyticsData.progressMetrics.overallProgressScore}%`}
        subtitle="Overall Progress"
        icon="trending-up-outline"
        color="#2196F3"
        trend="up"
      />
      <MetricCard
        title="Nutrition Quality"
        value={`${analyticsData.nutritionMetrics.nutritionQuality}%`}
        subtitle="Diet Score"
        icon="nutrition-outline"
        color="#FF9800"
        trend={analyticsData.nutritionMetrics.nutritionQuality > 70 ? 'up' : 'down'}
      />
      <MetricCard
        title="Recovery Status"
        value={analyticsData.healthMetrics.recoveryStatus}
        subtitle="Current State"
        icon="moon-outline"
        color="#9C27B0"
        trend={analyticsData.healthMetrics.sleepQuality > 7 ? 'up' : 'down'}
      />
    </View>

    {/* Progress Chart */}
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Overall Progress</Text>
      {chartData && (
        <ProgressChart
          data={chartData.progressChart}
          width={screenWidth - 40}
          height={220}
          strokeWidth={16}
          radius={32}
          chartConfig={chartConfig}
          hideLegend={false}
        />
      )}
    </View>

    {/* Workout Intensity Trend */}
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Weekly Workout Intensity</Text>
      {chartData && chartData.workoutTrendChart && (
        <LineChart
          data={chartData.workoutTrendChart}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
        />
      )}
    </View>

    {/* Recent Insights */}
    <View style={styles.insightsContainer}>
      <Text style={styles.sectionTitle}>Recent Insights</Text>
      {analyticsData.insights.slice(0, 3).map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </View>
  </View>
);

const PerformanceTab: React.FC<{ analyticsData: AnalyticsData }> = ({ analyticsData }) => (
  <View>
    {/* Performance Metrics */}
    <View style={styles.performanceGrid}>
      <PerformanceMetricCard
        title="Strength"
        score={analyticsData.performanceMetrics.strengthScore}
        icon="barbell-outline"
        color="#FF5722"
      />
      <PerformanceMetricCard
        title="Endurance"
        score={analyticsData.performanceMetrics.enduranceScore}
        icon="heart-outline"
        color="#F44336"
      />
      <PerformanceMetricCard
        title="Power"
        score={analyticsData.performanceMetrics.powerScore}
        icon="flash-outline"
        color="#FF9800"
      />
      <PerformanceMetricCard
        title="Recovery"
        score={analyticsData.performanceMetrics.recoveryScore}
        icon="refresh-outline"
        color="#4CAF50"
      />
    </View>

    {/* Strength Gains */}
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Strength Gains</Text>
      <View style={styles.strengthGainsList}>
        {analyticsData.progressMetrics.strengthGains.slice(0, 5).map((gain, index) => (
          <StrengthGainItem key={index} gain={gain} />
        ))}
      </View>
    </View>

    {/* Personal Records */}
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Recent Personal Records</Text>
      <View style={styles.personalRecordsList}>
        {analyticsData.progressMetrics.personalRecords.slice(0, 5).map((record) => (
          <PersonalRecordItem key={record.id} record={record} />
        ))}
      </View>
    </View>

    {/* Cardiovascular Metrics */}
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Cardiovascular Health</Text>
      <View style={styles.cardioMetrics}>
        <CardioMetricRow
          label="VO2 Max Estimate"
          value={`${analyticsData.performanceMetrics.vo2MaxEstimate} ml/kg/min`}
          trend={analyticsData.progressMetrics.cardiovascularImprovement.vo2MaxImprovement > 0 ? 'up' : 'stable'}
        />
        <CardioMetricRow
          label="Resting Heart Rate"
          value={`${analyticsData.performanceMetrics.restingHeartRate} bpm`}
          trend={analyticsData.progressMetrics.cardiovascularImprovement.restingHeartRateChange < 0 ? 'up' : 'stable'}
        />
        <CardioMetricRow
          label="Heart Rate Variability"
          value={`${analyticsData.performanceMetrics.heartRateVariability} ms`}
          trend="stable"
        />
      </View>
    </View>
  </View>
);

const HealthTab: React.FC<{ analyticsData: AnalyticsData }> = ({ analyticsData }) => (
  <View>
    {/* Health Score Overview */}
    <View style={styles.healthScoreContainer}>
      <Text style={styles.chartTitle}>Health Overview</Text>
      <View style={styles.healthScores}>
        <HealthScoreCircle
          label="Sleep Quality"
          score={analyticsData.healthMetrics.sleepQuality}
          color="#9C27B0"
        />
        <HealthScoreCircle
          label="Energy Level"
          score={analyticsData.healthMetrics.energyLevel}
          color="#FF9800"
        />
        <HealthScoreCircle
          label="Stress Level"
          score={100 - analyticsData.healthMetrics.stressLevel}
          color="#4CAF50"
        />
      </View>
    </View>

    {/* Risk Assessment */}
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Risk Assessment</Text>
      <View style={styles.riskContainer}>
        <RiskIndicator
          label="Injury Risk"
          risk={analyticsData.healthMetrics.injuryRisk}
          icon="warning-outline"
        />
        <RiskIndicator
          label="Burnout Risk"
          risk={analyticsData.healthMetrics.burnoutRisk}
          icon="flame-outline"
        />
      </View>
    </View>

    {/* Biomarkers */}
    {analyticsData.healthMetrics.biomarkers.length > 0 && (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Health Biomarkers</Text>
        <View style={styles.biomarkersList}>
          {analyticsData.healthMetrics.biomarkers.map((biomarker, index) => (
            <BiomarkerItem key={index} biomarker={biomarker} />
          ))}
        </View>
      </View>
    )}

    {/* Nutrition Breakdown */}
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Nutrition Analysis</Text>
      <View style={styles.nutritionBreakdown}>
        <MacroBar
          label="Protein"
          percentage={analyticsData.nutritionMetrics.macroBalance.protein}
          optimal={analyticsData.nutritionMetrics.macroBalance.idealBalance.protein}
          color="#E91E63"
        />
        <MacroBar
          label="Carbs"
          percentage={analyticsData.nutritionMetrics.macroBalance.carbs}
          optimal={analyticsData.nutritionMetrics.macroBalance.idealBalance.carbs}
          color="#2196F3"
        />
        <MacroBar
          label="Fat"
          percentage={analyticsData.nutritionMetrics.macroBalance.fat}
          optimal={analyticsData.nutritionMetrics.macroBalance.idealBalance.fat}
          color="#FF9800"
        />
      </View>
    </View>
  </View>
);

const PredictionsTab: React.FC<{ analyticsData: AnalyticsData }> = ({ analyticsData }) => (
  <View>
    {/* Goal Completion Predictions */}
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Goal Completion Predictions</Text>
      <View style={styles.goalPredictionsList}>
        {analyticsData.predictions.goalCompletionProbability.map((prediction) => (
          <GoalPredictionCard key={prediction.goalId} prediction={prediction} />
        ))}
      </View>
    </View>

    {/* Plateau Warning */}
    {analyticsData.predictions.plateauWarning && (
      <View style={styles.warningContainer}>
        <Ionicons name="warning-outline" size={24} color="#FF9800" />
        <Text style={styles.warningTitle}>Plateau Alert</Text>
        <Text style={styles.warningText}>
          Your {analyticsData.predictions.plateauWarning.exercise} progress may be plateauing.
          Consider these recommendations:
        </Text>
        {analyticsData.predictions.plateauWarning.recommendations.map((rec, index) => (
          <Text key={index} style={styles.recommendationText}>• {rec}</Text>
        ))}
      </View>
    )}

    {/* Injury Risk Prediction */}
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Injury Risk Analysis</Text>
      <View style={styles.injuryRiskContainer}>
        <View style={styles.overallRisk}>
          <Text style={styles.riskScore}>
            {analyticsData.predictions.injuryRiskPrediction.overallRisk}%
          </Text>
          <Text style={styles.riskLabel}>Overall Risk</Text>
        </View>
        <View style={styles.riskCategories}>
          {analyticsData.predictions.injuryRiskPrediction.categories.map((category, index) => (
            <RiskCategoryItem key={index} category={category} />
          ))}
        </View>
      </View>
    </View>

    {/* Optimal Rest Days */}
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Recommended Rest Days</Text>
      <View style={styles.restDaysContainer}>
        {analyticsData.predictions.optimalRestDayPrediction.slice(0, 7).map((date, index) => (
          <RestDayItem key={index} date={date} />
        ))}
      </View>
    </View>

    {/* Weight/Strength Predictions */}
    {(analyticsData.predictions.weightLossPrediction || analyticsData.predictions.strengthGainPrediction) && (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Future Projections</Text>
        {analyticsData.predictions.weightLossPrediction && (
          <PredictionCard
            title="Weight Progress"
            prediction={`${analyticsData.predictions.weightLossPrediction.predictedWeight} kg`}
            confidence={analyticsData.predictions.weightLossPrediction.confidence}
            timeframe={analyticsData.predictions.weightLossPrediction.targetDate.toLocaleDateString()}
          />
        )}
        {analyticsData.predictions.strengthGainPrediction && (
          <PredictionCard
            title={`${analyticsData.predictions.strengthGainPrediction.exercise} Max`}
            prediction={`${analyticsData.predictions.strengthGainPrediction.predictedMax} kg`}
            confidence={analyticsData.predictions.strengthGainPrediction.confidence}
            timeframe={`${analyticsData.predictions.strengthGainPrediction.timeframe} days`}
          />
        )}
      </View>
    )}
  </View>
);

// ===== COMPONENT HELPERS =====

const MetricCard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: string;
  trend: 'up' | 'down' | 'stable';
}> = ({ title, value, subtitle, icon, color, trend }) => (
  <View style={[styles.metricCard, { borderColor: color }]}>
    <View style={styles.metricHeader}>
      <Ionicons name={icon as any} size={24} color={color} />
      <Ionicons
        name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove'}
        size={16}
        color={trend === 'up' ? '#4CAF50' : trend === 'down' ? '#F44336' : '#999'}
      />
    </View>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricSubtitle}>{subtitle}</Text>
  </View>
);

const InsightCard: React.FC<{ insight: InsightData }> = ({ insight }) => (
  <View style={[styles.insightCard, { borderLeftColor: getInsightColor(insight.type) }]}>
    <View style={styles.insightHeader}>
      <Ionicons name={getInsightIcon(insight.type) as any} size={20} color={getInsightColor(insight.type)} />
      <Text style={styles.insightTitle}>{insight.title}</Text>
      <Text style={styles.insightPriority}>{insight.impact.toUpperCase()}</Text>
    </View>
    <Text style={styles.insightDescription}>{insight.description}</Text>
    {insight.actionable && insight.recommendations && (
      <View style={styles.insightRecommendations}>
        {insight.recommendations.slice(0, 2).map((rec, index) => (
          <Text key={index} style={styles.recommendationText}>• {rec}</Text>
        ))}
      </View>
    )}
  </View>
);

// ===== UTILITY FUNCTIONS =====

const getTabIcon = (tab: string): string => {
  const icons: Record<string, string> = {
    overview: 'analytics-outline',
    performance: 'fitness-outline',
    health: 'heart-outline',
    predictions: 'telescope-outline',
  };
  return icons[tab] || 'circle-outline';
};

const getInsightColor = (type: string): string => {
  const colors: Record<string, string> = {
    positive: '#4CAF50',
    warning: '#FF9800',
    improvement: '#2196F3',
    achievement: '#9C27B0',
  };
  return colors[type] || '#999';
};

const getInsightIcon = (type: string): string => {
  const icons: Record<string, string> = {
    positive: 'checkmark-circle-outline',
    warning: 'warning-outline',
    improvement: 'trending-up-outline',
    achievement: 'trophy-outline',
  };
  return icons[type] || 'information-circle-outline';
};

// ===== MOCK DATA GENERATION =====

const generateAnalyticsData = async (userId: string, timeRange: string): Promise<AnalyticsData> => {
  // Mock comprehensive analytics data generation
  // In real implementation, this would fetch and process actual user data
  
  return {
    workoutMetrics: {
      totalWorkouts: 45,
      totalDuration: 2250, // minutes
      averageIntensity: 7.2,
      consistencyScore: 85,
      favoriteWorkoutType: 'Strength Training',
      weeklyFrequency: 4.2,
      monthlyTrend: [12, 15, 18, 16, 20, 19, 22, 18, 21, 17, 19, 23],
      workoutTypeDistribution: [
        { type: 'Strength', count: 20, percentage: 44, color: '#FF5722' },
        { type: 'Cardio', count: 15, percentage: 33, color: '#2196F3' },
        { type: 'HIIT', count: 8, percentage: 18, color: '#FF9800' },
        { type: 'Yoga', count: 2, percentage: 5, color: '#9C27B0' },
      ],
      intensityOverTime: [
        { date: '2024-01-15', value: 7.2 },
        { date: '2024-01-16', value: 8.1 },
        { date: '2024-01-17', value: 6.8 },
        { date: '2024-01-18', value: 7.5 },
        { date: '2024-01-19', value: 8.3 },
        { date: '2024-01-20', value: 7.0 },
        { date: '2024-01-21', value: 7.8 },
      ],
      durationOverTime: [
        { date: '2024-01-15', value: 45 },
        { date: '2024-01-16', value: 60 },
        { date: '2024-01-17', value: 30 },
        { date: '2024-01-18', value: 50 },
        { date: '2024-01-19', value: 65 },
        { date: '2024-01-20', value: 40 },
        { date: '2024-01-21', value: 55 },
      ],
    },
    progressMetrics: {
      strengthGains: [
        { exercise: 'Bench Press', initialMax: 80, currentMax: 95, gainPercentage: 18.8, timeframe: 90 },
        { exercise: 'Squat', initialMax: 100, currentMax: 125, gainPercentage: 25.0, timeframe: 90 },
        { exercise: 'Deadlift', initialMax: 120, currentMax: 145, gainPercentage: 20.8, timeframe: 90 },
      ],
      weightProgress: {
        startWeight: 85,
        currentWeight: 82,
        targetWeight: 75,
        totalLoss: 3,
        weeklyAverage: 0.5,
        trend: 'losing',
        progressToGoal: 30,
      },
      bodyComposition: {
        bmi: 24.2,
        bodyFatPercentage: 15.5,
        muscleMassPercentage: 42.3,
        changes: [
          { metric: 'Body Fat', change: -2.1, timeframe: '3 months', trend: 'improving' },
          { metric: 'Muscle Mass', change: 1.8, timeframe: '3 months', trend: 'improving' },
        ],
      },
      cardiovascularImprovement: {
        vo2MaxImprovement: 8.5,
        restingHeartRateChange: -5,
        enduranceGains: [
          { activity: 'Running', improvement: 15, metric: 'time', timeframe: 60 },
        ],
        recoveryTimeImprovement: 12,
      },
      flexibilityGains: [
        { bodyPart: 'Hamstrings', initialScore: 6, currentScore: 8, improvement: 33 },
        { bodyPart: 'Shoulders', initialScore: 7, currentScore: 8.5, improvement: 21 },
      ],
      overallProgressScore: 78,
      milestonesAchieved: [
        {
          id: '1',
          title: '100kg Squat',
          description: 'First time squatting bodyweight',
          achievedDate: new Date('2024-01-10'),
          category: 'Strength',
          difficulty: 'medium',
        },
      ],
      personalRecords: [
        {
          id: '1',
          exercise: 'Bench Press',
          previousRecord: 90,
          newRecord: 95,
          improvement: 5.6,
          achievedDate: new Date('2024-01-20'),
          unit: 'kg',
        },
      ],
    },
    nutritionMetrics: {
      averageDailyCalories: 2150,
      macroBalance: {
        protein: 28,
        carbs: 45,
        fat: 27,
        fiber: 28,
        idealBalance: {
          protein: [25, 30],
          carbs: [40, 50],
          fat: [20, 30],
        },
      },
      hydrationScore: 75,
      mealConsistency: 68,
      nutritionQuality: 82,
      calorieDeficitSurplus: -200,
      weeklyNutritionTrend: [
        { date: '2024-01-15', value: 2100 },
        { date: '2024-01-16', value: 2200 },
        { date: '2024-01-17', value: 2050 },
        { date: '2024-01-18', value: 2180 },
        { date: '2024-01-19', value: 2150 },
        { date: '2024-01-20', value: 2120 },
        { date: '2024-01-21', value: 2170 },
      ],
      topFoods: [
        { food: 'Chicken Breast', frequency: 15, category: 'Protein', nutritionScore: 95 },
        { food: 'Brown Rice', frequency: 12, category: 'Carbs', nutritionScore: 85 },
        { food: 'Avocado', frequency: 8, category: 'Fat', nutritionScore: 90 },
      ],
    },
    performanceMetrics: {
      enduranceScore: 72,
      strengthScore: 84,
      powerScore: 68,
      recoveryScore: 75,
      performanceTrend: [
        { date: '2024-01-15', value: 70 },
        { date: '2024-01-16', value: 73 },
        { date: '2024-01-17', value: 75 },
        { date: '2024-01-18', value: 72 },
        { date: '2024-01-19', value: 78 },
        { date: '2024-01-20', value: 76 },
        { date: '2024-01-21', value: 80 },
      ],
      vo2MaxEstimate: 48.5,
      heartRateVariability: 42,
      restingHeartRate: 58,
    },
    healthMetrics: {
      sleepQuality: 78,
      stressLevel: 35,
      energyLevel: 82,
      recoveryStatus: 'good',
      injuryRisk: 15,
      burnoutRisk: 25,
      healthTrend: [
        { date: '2024-01-15', value: 75 },
        { date: '2024-01-16', value: 78 },
        { date: '2024-01-17', value: 72 },
        { date: '2024-01-18', value: 80 },
        { date: '2024-01-19', value: 85 },
        { date: '2024-01-20', value: 82 },
        { date: '2024-01-21', value: 84 },
      ],
      biomarkers: [
        { name: 'Blood Pressure', value: 120, unit: 'mmHg', optimal: [90, 140], status: 'optimal', trend: 'stable' },
        { name: 'Resting HR', value: 58, unit: 'bpm', optimal: [50, 70], status: 'optimal', trend: 'improving' },
      ],
    },
    predictions: {
      goalCompletionProbability: [
        {
          goalId: '1',
          goalName: 'Lose 10kg',
          probability: 85,
          estimatedCompletion: new Date('2024-04-15'),
          confidence: 0.8,
          factors: ['Consistent deficit', 'Regular exercise', 'Good adherence'],
        },
      ],
      injuryRiskPrediction: {
        overallRisk: 15,
        categories: [
          { category: 'Lower Back', risk: 20, factors: ['Heavy deadlifts', 'Tight hamstrings'] },
          { category: 'Shoulders', risk: 10, factors: ['Good mobility', 'Proper form'] },
        ],
        preventiveMeasures: ['Improve hamstring flexibility', 'Focus on core strength'],
        timeframe: 'Next 30 days',
      },
      plateauWarning: {
        exercise: 'Bench Press',
        plateauDuration: 14,
        likelihood: 65,
        recommendations: ['Increase training volume', 'Add pause reps', 'Check nutrition'],
      },
      optimalRestDayPrediction: [
        new Date('2024-01-22'),
        new Date('2024-01-24'),
        new Date('2024-01-27'),
      ],
      performancePeakPrediction: [
        { date: '2024-01-25', value: 88 },
        { date: '2024-01-28', value: 85 },
        { date: '2024-01-30', value: 90 },
      ],
      weightLossPrediction: {
        targetDate: new Date('2024-04-15'),
        predictedWeight: 75,
        confidence: 0.85,
        trajectory: [
          { date: '2024-02-01', value: 81 },
          { date: '2024-03-01', value: 78 },
          { date: '2024-04-01', value: 75.5 },
          { date: '2024-04-15', value: 75 },
        ],
      },
    },
    insights: [
      {
        id: '1',
        type: 'positive',
        category: 'workout',
        title: 'Excellent Consistency',
        description: 'You\'ve maintained 85% workout consistency this month - keep it up!',
        actionable: false,
        confidence: 0.95,
        impact: 'high',
        priority: 8,
        date: new Date(),
      },
      {
        id: '2',
        type: 'improvement',
        category: 'nutrition',
        title: 'Hydration Opportunity',
        description: 'Your hydration is below optimal. Aim for 2.5L daily.',
        actionable: true,
        recommendations: ['Set hourly water reminders', 'Track intake in app'],
        confidence: 0.8,
        impact: 'medium',
        priority: 6,
        date: new Date(),
      },
    ],
    goals: [
      {
        id: '1',
        name: 'Lose 10kg',
        category: 'Weight Loss',
        targetValue: 75,
        currentValue: 82,
        progress: 30,
        onTrack: true,
        estimatedCompletion: new Date('2024-04-15'),
        trend: 'on_track',
      },
    ],
  };
};

// Additional helper components would be implemented here...
const PerformanceMetricCard: React.FC<any> = () => <View />;
const StrengthGainItem: React.FC<any> = () => <View />;
const PersonalRecordItem: React.FC<any> = () => <View />;
const CardioMetricRow: React.FC<any> = () => <View />;
const HealthScoreCircle: React.FC<any> = () => <View />;
const RiskIndicator: React.FC<any> = () => <View />;
const BiomarkerItem: React.FC<any> = () => <View />;
const MacroBar: React.FC<any> = () => <View />;
const GoalPredictionCard: React.FC<any> = () => <View />;
const RiskCategoryItem: React.FC<any> = () => <View />;
const RestDayItem: React.FC<any> = () => <View />;
const PredictionCard: React.FC<any> = () => <View />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
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
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#007AFF',
  },
  timeRangeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  timeRangeButtonTextActive: {
    color: 'white',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tabButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  chartContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  insightsContainer: {
    padding: 16,
  },
  insightCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  insightPriority: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  insightRecommendations: {
    marginTop: 8,
  },
  recommendationText: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 2,
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  strengthGainsList: {
    marginTop: 8,
  },
  personalRecordsList: {
    marginTop: 8,
  },
  cardioMetrics: {
    marginTop: 8,
  },
  healthScoreContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  healthScores: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  riskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  biomarkersList: {
    marginTop: 8,
  },
  nutritionBreakdown: {
    marginTop: 16,
  },
  goalPredictionsList: {
    marginTop: 8,
  },
  warningContainer: {
    backgroundColor: '#FFF3CD',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginLeft: 8,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#BF360C',
    marginBottom: 12,
    lineHeight: 20,
  },
  injuryRiskContainer: {
    marginTop: 16,
  },
  overallRisk: {
    alignItems: 'center',
    marginBottom: 20,
  },
  riskScore: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  riskLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  riskCategories: {
    marginTop: 16,
  },
  restDaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 8,
  },
});

export default AnalyticsDashboard;
