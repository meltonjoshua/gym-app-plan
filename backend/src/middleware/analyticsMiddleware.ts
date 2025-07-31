import { Request, Response, NextFunction } from 'express';
import { AnalyticsEvent } from '../models/AnalyticsEvent';
import { logger } from '../utils/logger';

// Extend Request type to include session
declare global {
  namespace Express {
    interface Request {
      sessionID?: string;
      user?: any;
    }
  }
}

interface AnalyticsData {
  userId?: string;
  eventType: string;
  eventCategory: 'workout' | 'nutrition' | 'subscription' | 'navigation' | 'feature_usage' | 'error';
  eventAction: string;
  eventLabel?: string;
  value?: number;
  metadata?: Record<string, any>;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  timestamp?: Date;
}

class AnalyticsTracker {
  private static instance: AnalyticsTracker;
  private eventQueue: AnalyticsData[] = [];
  private batchSize = 10;
  private flushInterval = 5000; // 5 seconds

  private constructor() {
    // Start batch processing
    setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  public static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker();
    }
    return AnalyticsTracker.instance;
  }

  public track(eventData: AnalyticsData): void {
    const enrichedEvent: AnalyticsData = {
      ...eventData,
      timestamp: eventData.timestamp || new Date()
    };

    this.eventQueue.push(enrichedEvent);

    if (this.eventQueue.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToProcess = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await AnalyticsEvent.insertMany(eventsToProcess);
      logger.info(`Flushed ${eventsToProcess.length} analytics events`);
    } catch (error) {
      logger.error('Failed to flush analytics events:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...eventsToProcess);
    }
  }

  public async forceFlush(): Promise<void> {
    await this.flushEvents();
  }
}

export const analyticsTracker = AnalyticsTracker.getInstance();

// Middleware to automatically track API requests
export const trackApiRequest = (
  eventCategory: AnalyticsData['eventCategory'],
  eventAction?: string
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    
    // Track request start
    const baseEventData: Partial<AnalyticsData> = {
      userId: req.user?.id,
      eventCategory,
      eventAction: eventAction || `${req.method} ${req.route?.path || req.path}`,
      sessionId: req.sessionID,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      metadata: {
        method: req.method,
        path: req.path,
        query: req.query,
        userAgent: req.get('User-Agent')
      }
    };

    // Override res.end to capture response data
    const originalEnd = res.end;
    res.end = function(this: Response, chunk?: any, encoding?: BufferEncoding | (() => void), cb?: () => void) {
      const duration = Date.now() - startTime;
      
      // Track API response
      analyticsTracker.track({
        ...baseEventData,
        eventType: 'api_request',
        eventLabel: `${res.statusCode}`,
        value: duration,
        metadata: {
          ...baseEventData.metadata,
          statusCode: res.statusCode,
          duration,
          responseSize: res.get('Content-Length')
        }
      } as AnalyticsData);

      return originalEnd.call(this, chunk, encoding as BufferEncoding, cb);
    };

    next();
  };
};

// Helper functions for specific event tracking
export const trackWorkoutEvent = (
  userId: string,
  action: 'start' | 'complete' | 'pause' | 'resume' | 'cancel',
  workoutData?: any
): void => {
  analyticsTracker.track({
    userId,
    eventType: 'workout_interaction',
    eventCategory: 'workout',
    eventAction: action,
    eventLabel: workoutData?.workoutType || workoutData?.name,
    value: workoutData?.duration,
    metadata: {
      workoutId: workoutData?.id,
      exerciseCount: workoutData?.exercises?.length,
      difficulty: workoutData?.difficulty,
      tags: workoutData?.tags
    }
  });
};

export const trackNutritionEvent = (
  userId: string,
  action: 'log_meal' | 'scan_barcode' | 'add_custom_food' | 'update_goal',
  nutritionData?: any
): void => {
  analyticsTracker.track({
    userId,
    eventType: 'nutrition_interaction',
    eventCategory: 'nutrition',
    eventAction: action,
    eventLabel: nutritionData?.foodName || nutritionData?.mealType,
    value: nutritionData?.calories,
    metadata: {
      mealType: nutritionData?.mealType,
      foodId: nutritionData?.foodId,
      quantity: nutritionData?.quantity,
      macros: nutritionData?.macros
    }
  });
};

export const trackSubscriptionEvent = (
  userId: string,
  action: 'subscribe' | 'cancel' | 'upgrade' | 'downgrade' | 'reactivate',
  subscriptionData?: any
): void => {
  analyticsTracker.track({
    userId,
    eventType: 'subscription_interaction',
    eventCategory: 'subscription',
    eventAction: action,
    eventLabel: subscriptionData?.planName,
    value: subscriptionData?.amount,
    metadata: {
      planId: subscriptionData?.planId,
      billingInterval: subscriptionData?.interval,
      paymentMethod: subscriptionData?.paymentMethod,
      previousPlan: subscriptionData?.previousPlan
    }
  });
};

export const trackFeatureUsage = (
  userId: string,
  feature: string,
  action: string,
  metadata?: Record<string, any>
): void => {
  analyticsTracker.track({
    userId,
    eventType: 'feature_usage',
    eventCategory: 'feature_usage',
    eventAction: `${feature}_${action}`,
    eventLabel: feature,
    metadata: {
      feature,
      action,
      ...metadata
    }
  });
};

export const trackError = (
  error: Error,
  userId?: string,
  context?: Record<string, any>
): void => {
  analyticsTracker.track({
    userId,
    eventType: 'error',
    eventCategory: 'error',
    eventAction: 'application_error',
    eventLabel: error.name,
    metadata: {
      errorMessage: error.message,
      errorStack: error.stack,
      context
    }
  });
};

// Navigation tracking for mobile app
export const trackNavigation = (
  userId: string,
  fromScreen: string,
  toScreen: string,
  navigationMethod?: string
): void => {
  analyticsTracker.track({
    userId,
    eventType: 'navigation',
    eventCategory: 'navigation',
    eventAction: 'screen_change',
    eventLabel: `${fromScreen} -> ${toScreen}`,
    metadata: {
      fromScreen,
      toScreen,
      navigationMethod
    }
  });
};

export default {
  trackApiRequest,
  trackWorkoutEvent,
  trackNutritionEvent,
  trackSubscriptionEvent,
  trackFeatureUsage,
  trackError,
  trackNavigation,
  analyticsTracker
};
