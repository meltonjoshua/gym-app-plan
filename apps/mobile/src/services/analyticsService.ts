import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../config/api';

// Types
export interface AnalyticsEvent {
  id: string;
  userId: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface UserEngagementMetrics {
  totalSessions: number;
  averageSessionDuration: number;
  screenViews: Record<string, number>;
  featureUsage: Record<string, number>;
  retentionRate: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
}

export interface WorkoutAnalytics {
  totalWorkouts: number;
  totalDuration: number;
  averageDuration: number;
  favoriteExercises: Array<{
    exercise: string;
    count: number;
    averageWeight?: number;
    averageReps?: number;
  }>;
  workoutFrequency: Record<string, number>;
  progressMetrics: {
    strengthGains: Record<string, number>;
    enduranceImprovement: number;
    consistencyScore: number;
  };
  weeklyTrend: Array<{
    week: string;
    workouts: number;
    duration: number;
    intensity: number;
  }>;
}

export interface NutritionAnalytics {
  averageCalories: number;
  macroBreakdown: {
    protein: number;
    carbs: number;
    fat: number;
  };
  mealTimingPatterns: Record<string, number>;
  hydrationTrends: Array<{
    date: string;
    intake: number;
    goal: number;
  }>;
  nutritionGoalsAchievement: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  weeklyNutritionTrend: Array<{
    week: string;
    averageCalories: number;
    proteinIntake: number;
    goalAchievement: number;
  }>;
}

export interface ProgressAnalytics {
  weightProgress: Array<{
    date: string;
    weight: number;
    bodyFat?: number;
    muscleMass?: number;
  }>;
  measurementProgress: Record<string, Array<{
    date: string;
    value: number;
  }>>;
  goalsProgress: Array<{
    goalId: string;
    goalType: string;
    target: number;
    current: number;
    progress: number;
    dueDate: string;
  }>;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    achievedDate: string;
    category: string;
  }>;
}

export interface PremiumAnalytics {
  aiRecommendations: Array<{
    id: string;
    type: 'workout' | 'nutrition' | 'recovery';
    title: string;
    description: string;
    confidence: number;
    actionItems: string[];
    estimatedImpact: string;
  }>;
  personalizedInsights: Array<{
    id: string;
    category: string;
    insight: string;
    dataPoints: string[];
    recommendations: string[];
    priority: 'high' | 'medium' | 'low';
  }>;
  predictiveAnalytics: {
    goalAchievementProbability: Record<string, number>;
    optimalWorkoutTimes: string[];
    injuryRiskFactors: Array<{
      factor: string;
      risk: number;
      prevention: string[];
    }>;
    plateauPrediction: {
      likelihood: number;
      timeframe: string;
      preventionStrategies: string[];
    };
  };
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private eventQueue: Partial<AnalyticsEvent>[] = [];
  private sessionStartTime: Date | null = null;
  private currentScreen: string = '';
  private isOnline: boolean = true;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Event Tracking
  async trackEvent(
    category: string,
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const event: Partial<AnalyticsEvent> = {
        category,
        action,
        label,
        value,
        metadata,
        timestamp: new Date(),
      };

      // Add to queue for offline support
      this.eventQueue.push(event);

      // Try to send immediately if online
      if (this.isOnline) {
        await this.flushEvents();
      }

      // Store locally for persistence
      await this.storeEventLocally(event);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  async trackScreenView(screenName: string): Promise<void> {
    if (this.currentScreen) {
      // Track time spent on previous screen
      const timeSpent = Date.now() - (this.sessionStartTime?.getTime() || Date.now());
      await this.trackEvent('navigation', 'screen_time', this.currentScreen, timeSpent);
    }

    this.currentScreen = screenName;
    this.sessionStartTime = new Date();

    await this.trackEvent('navigation', 'screen_view', screenName);
  }

  async trackWorkoutEvent(
    action: string,
    workoutData?: {
      workoutId?: string;
      duration?: number;
      exercises?: string[];
      intensity?: number;
    }
  ): Promise<void> {
    await this.trackEvent('workout', action, undefined, undefined, workoutData);
  }

  async trackNutritionEvent(
    action: string,
    nutritionData?: {
      mealType?: string;
      calories?: number;
      macros?: { protein: number; carbs: number; fat: number };
    }
  ): Promise<void> {
    await this.trackEvent('nutrition', action, undefined, undefined, nutritionData);
  }

  async trackUserEngagement(
    action: string,
    engagementData?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent('engagement', action, undefined, undefined, engagementData);
  }

  // Analytics Data Retrieval
  async getUserEngagementMetrics(
    startDate?: Date,
    endDate?: Date
  ): Promise<UserEngagementMetrics> {
    try {
      const response = await apiClient.get('/analytics/engagement', {
        params: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching engagement metrics:', error);
      return this.getMockEngagementMetrics();
    }
  }

  async getWorkoutAnalytics(
    userId: string,
    period: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<WorkoutAnalytics> {
    try {
      const response = await apiClient.get(`/analytics/workouts/${userId}`, {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching workout analytics:', error);
      return this.getMockWorkoutAnalytics();
    }
  }

  async getNutritionAnalytics(
    userId: string,
    period: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<NutritionAnalytics> {
    try {
      const response = await apiClient.get(`/analytics/nutrition/${userId}`, {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching nutrition analytics:', error);
      return this.getMockNutritionAnalytics();
    }
  }

  async getProgressAnalytics(userId: string): Promise<ProgressAnalytics> {
    try {
      const response = await apiClient.get(`/analytics/progress/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching progress analytics:', error);
      return this.getMockProgressAnalytics();
    }
  }

  async getPremiumAnalytics(userId: string): Promise<PremiumAnalytics> {
    try {
      const response = await apiClient.get(`/analytics/premium/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching premium analytics:', error);
      return this.getMockPremiumAnalytics();
    }
  }

  // Offline Support
  async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    try {
      const events = [...this.eventQueue];
      await apiClient.post('/analytics/events/batch', { events });
      this.eventQueue = [];
      
      // Clear locally stored events
      await AsyncStorage.removeItem('pendingAnalyticsEvents');
    } catch (error) {
      console.error('Error flushing analytics events:', error);
      this.isOnline = false;
    }
  }

  async loadPendingEvents(): Promise<void> {
    try {
      const storedEvents = await AsyncStorage.getItem('pendingAnalyticsEvents');
      if (storedEvents) {
        this.eventQueue = JSON.parse(storedEvents);
      }
    } catch (error) {
      console.error('Error loading pending events:', error);
    }
  }

  private async storeEventLocally(event: Partial<AnalyticsEvent>): Promise<void> {
    try {
      const existingEvents = await AsyncStorage.getItem('pendingAnalyticsEvents');
      const events = existingEvents ? JSON.parse(existingEvents) : [];
      events.push(event);
      
      // Keep only last 100 events to prevent storage overflow
      const trimmedEvents = events.slice(-100);
      await AsyncStorage.setItem('pendingAnalyticsEvents', JSON.stringify(trimmedEvents));
    } catch (error) {
      console.error('Error storing event locally:', error);
    }
  }

  // Network Status
  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
    if (isOnline && this.eventQueue.length > 0) {
      this.flushEvents();
    }
  }

  // Mock Data (for development/offline mode)
  private getMockEngagementMetrics(): UserEngagementMetrics {
    return {
      totalSessions: 45,
      averageSessionDuration: 8.5,
      screenViews: {
        'Dashboard': 120,
        'Workouts': 89,
        'Nutrition': 67,
        'Progress': 45,
        'Analytics': 23,
      },
      featureUsage: {
        'workout_creation': 34,
        'meal_logging': 67,
        'progress_tracking': 45,
        'analytics_view': 23,
      },
      retentionRate: 0.78,
      dailyActiveUsers: 1,
      weeklyActiveUsers: 1,
      monthlyActiveUsers: 1,
    };
  }

  private getMockWorkoutAnalytics(): WorkoutAnalytics {
    return {
      totalWorkouts: 32,
      totalDuration: 1920, // minutes
      averageDuration: 60,
      favoriteExercises: [
        { exercise: 'Push-ups', count: 28, averageReps: 15 },
        { exercise: 'Squats', count: 25, averageReps: 20 },
        { exercise: 'Bench Press', count: 20, averageWeight: 70, averageReps: 10 },
      ],
      workoutFrequency: {
        'Monday': 8,
        'Tuesday': 6,
        'Wednesday': 7,
        'Thursday': 5,
        'Friday': 6,
        'Saturday': 0,
        'Sunday': 0,
      },
      progressMetrics: {
        strengthGains: {
          'Bench Press': 15,
          'Squat': 20,
          'Deadlift': 25,
        },
        enduranceImprovement: 18,
        consistencyScore: 0.85,
      },
      weeklyTrend: [
        { week: '2025-07-01', workouts: 3, duration: 180, intensity: 7.2 },
        { week: '2025-07-08', workouts: 4, duration: 240, intensity: 7.5 },
        { week: '2025-07-15', workouts: 4, duration: 220, intensity: 7.8 },
        { week: '2025-07-22', workouts: 5, duration: 280, intensity: 8.0 },
      ],
    };
  }

  private getMockNutritionAnalytics(): NutritionAnalytics {
    return {
      averageCalories: 1950,
      macroBreakdown: {
        protein: 25,
        carbs: 45,
        fat: 30,
      },
      mealTimingPatterns: {
        'Breakfast': 7.5,
        'Lunch': 13.0,
        'Dinner': 19.5,
        'Snacks': 16.0,
      },
      hydrationTrends: [
        { date: '2025-07-25', intake: 6, goal: 8 },
        { date: '2025-07-26', intake: 7, goal: 8 },
        { date: '2025-07-27', intake: 8, goal: 8 },
        { date: '2025-07-28', intake: 6, goal: 8 },
        { date: '2025-07-29', intake: 9, goal: 8 },
        { date: '2025-07-30', intake: 7, goal: 8 },
        { date: '2025-07-31', intake: 6, goal: 8 },
      ],
      nutritionGoalsAchievement: {
        calories: 0.85,
        protein: 0.92,
        carbs: 0.78,
        fat: 0.88,
      },
      weeklyNutritionTrend: [
        { week: '2025-07-01', averageCalories: 1850, proteinIntake: 110, goalAchievement: 0.80 },
        { week: '2025-07-08', averageCalories: 1920, proteinIntake: 115, goalAchievement: 0.83 },
        { week: '2025-07-15', averageCalories: 1980, proteinIntake: 120, goalAchievement: 0.87 },
        { week: '2025-07-22', averageCalories: 1950, proteinIntake: 118, goalAchievement: 0.85 },
      ],
    };
  }

  private getMockProgressAnalytics(): ProgressAnalytics {
    return {
      weightProgress: [
        { date: '2025-07-01', weight: 80.0, bodyFat: 20.5, muscleMass: 30.2 },
        { date: '2025-07-08', weight: 79.2, bodyFat: 20.1, muscleMass: 30.8 },
        { date: '2025-07-15', weight: 78.5, bodyFat: 19.8, muscleMass: 31.2 },
        { date: '2025-07-22', weight: 77.8, bodyFat: 19.2, muscleMass: 31.8 },
        { date: '2025-07-29', weight: 77.1, bodyFat: 18.8, muscleMass: 32.4 },
      ],
      measurementProgress: {
        'Waist': [
          { date: '2025-07-01', value: 85 },
          { date: '2025-07-15', value: 83 },
          { date: '2025-07-29', value: 81 },
        ],
        'Chest': [
          { date: '2025-07-01', value: 102 },
          { date: '2025-07-15', value: 103 },
          { date: '2025-07-29', value: 104 },
        ],
      },
      goalsProgress: [
        {
          goalId: 'weight-loss',
          goalType: 'Weight Loss',
          target: 70,
          current: 77.1,
          progress: 0.72,
          dueDate: '2025-12-31',
        },
        {
          goalId: 'muscle-gain',
          goalType: 'Muscle Gain',
          target: 35,
          current: 32.4,
          progress: 0.69,
          dueDate: '2025-12-31',
        },
      ],
      milestones: [
        {
          id: '1',
          title: 'First 5kg Lost',
          description: 'Successfully lost your first 5 kilograms',
          achievedDate: '2025-07-20',
          category: 'weight-loss',
        },
        {
          id: '2',
          title: '30 Workouts Completed',
          description: 'Completed 30 workout sessions',
          achievedDate: '2025-07-25',
          category: 'consistency',
        },
      ],
    };
  }

  private getMockPremiumAnalytics(): PremiumAnalytics {
    return {
      aiRecommendations: [
        {
          id: '1',
          type: 'workout',
          title: 'Increase Progressive Overload',
          description: 'Your strength gains have plateaued. Consider increasing weight by 5-10%.',
          confidence: 0.89,
          actionItems: [
            'Increase bench press weight by 5kg',
            'Add extra set to compound exercises',
            'Focus on time under tension',
          ],
          estimatedImpact: 'High - could improve strength gains by 15-20%',
        },
        {
          id: '2',
          type: 'nutrition',
          title: 'Optimize Post-Workout Nutrition',
          description: 'Your recovery could be improved with better post-workout nutrition timing.',
          confidence: 0.76,
          actionItems: [
            'Consume 20-30g protein within 30 minutes post-workout',
            'Include fast-digesting carbs post-workout',
            'Consider protein shake for convenience',
          ],
          estimatedImpact: 'Medium - could improve recovery by 10-15%',
        },
      ],
      personalizedInsights: [
        {
          id: '1',
          category: 'Performance',
          insight: 'Your workout performance is 23% better on days when you sleep 7+ hours.',
          dataPoints: ['Sleep duration', 'Workout intensity', 'Mood ratings'],
          recommendations: [
            'Prioritize 7-9 hours of sleep',
            'Establish consistent bedtime routine',
            'Track sleep quality metrics',
          ],
          priority: 'high',
        },
        {
          id: '2',
          category: 'Nutrition',
          insight: 'You consistently under-consume protein on weekends.',
          dataPoints: ['Daily protein intake', 'Day of week patterns'],
          recommendations: [
            'Prep protein-rich weekend meals',
            'Set weekend nutrition reminders',
            'Consider protein supplements',
          ],
          priority: 'medium',
        },
      ],
      predictiveAnalytics: {
        goalAchievementProbability: {
          'weight-loss': 0.82,
          'muscle-gain': 0.67,
          'strength-improvement': 0.91,
        },
        optimalWorkoutTimes: ['07:00', '17:30', '19:00'],
        injuryRiskFactors: [
          {
            factor: 'Insufficient warm-up time',
            risk: 0.34,
            prevention: [
              'Extend warm-up to 10-15 minutes',
              'Include dynamic stretching',
              'Gradually increase intensity',
            ],
          },
        ],
        plateauPrediction: {
          likelihood: 0.28,
          timeframe: '4-6 weeks',
          preventionStrategies: [
            'Vary workout routines every 4 weeks',
            'Progressive overload implementation',
            'Periodized training approach',
          ],
        },
      },
    };
  }
}

export default AnalyticsService.getInstance();
