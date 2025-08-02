import React, { useEffect, useCallback, useRef, useState } from 'react';
import analyticsService from '../services/analyticsService';

interface UseAnalyticsOptions {
  autoTrackScreenViews?: boolean;
  enableOfflineTracking?: boolean;
}

interface UseAnalyticsReturn {
  trackEvent: (category: string, action: string, label?: string, value?: number, metadata?: Record<string, any>) => Promise<void>;
  trackScreenView: (screenName: string, metadata?: Record<string, any>) => Promise<void>;
  trackWorkout: (workoutData: any) => Promise<void>;
  trackNutrition: (nutritionData: any) => Promise<void>;
  trackUserEngagement: (action: string, data?: Record<string, any>) => Promise<void>;
}

export const useAnalytics = (options: UseAnalyticsOptions = {}): UseAnalyticsReturn => {
  const {
    autoTrackScreenViews = true,
    enableOfflineTracking = true,
  } = options;

  const screenStartTime = useRef<Date>(new Date());
  const currentScreen = useRef<string>('');

  useEffect(() => {
    // Initialize analytics service
    if (enableOfflineTracking) {
      analyticsService.loadPendingEvents();
    }

    // Network status handling would be implemented based on React Native's NetInfo
    // For now, we'll assume online status
    analyticsService.setOnlineStatus(true);
  }, [enableOfflineTracking]);

  const trackEvent = useCallback(async (
    category: string,
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, any>
  ) => {
    try {
      await analyticsService.trackEvent(category, action, label, value, metadata);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, []);

  const trackScreenView = useCallback(async (
    screenName: string,
    metadata?: Record<string, any>
  ) => {
    try {
      // Track time spent on previous screen
      if (currentScreen.current && autoTrackScreenViews) {
        const timeSpent = Date.now() - screenStartTime.current.getTime();
        await trackEvent('navigation', 'screen_time', currentScreen.current, timeSpent);
      }

      // Track new screen view
      currentScreen.current = screenName;
      screenStartTime.current = new Date();
      
      await analyticsService.trackScreenView(screenName);
      
      if (metadata) {
        await trackEvent('navigation', 'screen_view_details', screenName, undefined, metadata);
      }
    } catch (error) {
      console.error('Error tracking screen view:', error);
    }
  }, [trackEvent, autoTrackScreenViews]);

  const trackWorkout = useCallback(async (workoutData: {
    workoutId?: string;
    duration?: number;
    exercises?: string[];
    intensity?: number;
    calories?: number;
    type?: string;
  }) => {
    try {
      await analyticsService.trackWorkoutEvent('workout_completed', workoutData);
      
      // Track additional workout metrics
      if (workoutData.duration) {
        await trackEvent('workout', 'duration_tracked', workoutData.type, workoutData.duration);
      }
      
      if (workoutData.intensity) {
        await trackEvent('workout', 'intensity_rated', workoutData.type, workoutData.intensity);
      }
      
      if (workoutData.exercises && workoutData.exercises.length > 0) {
        await trackEvent('workout', 'exercises_completed', workoutData.type, workoutData.exercises.length);
      }
    } catch (error) {
      console.error('Error tracking workout:', error);
    }
  }, [trackEvent]);

  const trackNutrition = useCallback(async (nutritionData: {
    mealType?: string;
    calories?: number;
    macros?: { protein: number; carbs: number; fat: number };
    goalAchievement?: number;
  }) => {
    try {
      await analyticsService.trackNutritionEvent('meal_logged', nutritionData);
      
      // Track nutrition goals achievement
      if (nutritionData.goalAchievement !== undefined) {
        await trackEvent('nutrition', 'goal_progress', nutritionData.mealType, nutritionData.goalAchievement);
      }
      
      // Track macro tracking behavior
      if (nutritionData.macros) {
        await trackEvent('nutrition', 'macros_tracked', nutritionData.mealType);
      }
    } catch (error) {
      console.error('Error tracking nutrition:', error);
    }
  }, [trackEvent]);

  const trackUserEngagement = useCallback(async (
    action: string,
    data?: Record<string, any>
  ) => {
    try {
      await analyticsService.trackUserEngagement(action, data);
    } catch (error) {
      console.error('Error tracking user engagement:', error);
    }
  }, []);

  return {
    trackEvent,
    trackScreenView,
    trackWorkout,
    trackNutrition,
    trackUserEngagement,
  };
};

// Higher-order component for automatic screen tracking
export const withAnalytics = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  screenName: string,
  options: UseAnalyticsOptions = {}
) => {
  const AnalyticsWrappedComponent = (props: P) => {
    const { trackScreenView } = useAnalytics(options);

    useEffect(() => {
      trackScreenView(screenName);
    }, [trackScreenView]);

    return React.createElement(WrappedComponent, props);
  };

  AnalyticsWrappedComponent.displayName = `withAnalytics(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return AnalyticsWrappedComponent;
};

// Hook for analytics data fetching
export const useAnalyticsData = (userId: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [engagement, workouts, nutrition, progress] = await Promise.all([
        analyticsService.getUserEngagementMetrics(),
        analyticsService.getWorkoutAnalytics(userId),
        analyticsService.getNutritionAnalytics(userId),
        analyticsService.getProgressAnalytics(userId),
      ]);

      setData({
        engagement,
        workouts,
        nutrition,
        progress,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics data');
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalyticsData,
  };
};

export default useAnalytics;
