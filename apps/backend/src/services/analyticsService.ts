import { AnalyticsEvent } from '../models/AnalyticsEvent';
import { UserSession } from '../models/UserSession';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { PaymentTransaction } from '../models/PaymentTransaction';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface UserEngagementMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  averageSessionDuration: number;
  averageEventsPerUser: number;
  retentionRate: number;
  bounceRate: number;
}

interface BusinessMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  churnRate: number;
  lifetimeValue: number;
  conversionRate: number;
}

interface FeatureUsageMetrics {
  topFeatures: Array<{
    feature: string;
    usageCount: number;
    uniqueUsers: number;
    averageTimeSpent?: number;
  }>;
  featureAdoption: Record<string, number>;
  featureRetention: Record<string, number>;
}

export class AnalyticsService {
  
  /**
   * Get comprehensive user engagement metrics
   */
  static async getUserEngagementMetrics(dateRange: DateRange, userId?: string): Promise<UserEngagementMetrics> {
    try {
      const baseQuery: any = {
        timestamp: {
          $gte: dateRange.startDate,
          $lte: dateRange.endDate
        }
      };

      if (userId) {
        baseQuery.userId = new mongoose.Types.ObjectId(userId);
      }

      // Get total unique users who had events
      const activeUsers = await AnalyticsEvent.distinct('userId', baseQuery);

      // Get new users (registered in this period)
      const newUsers = await User.countDocuments({
        createdAt: {
          $gte: dateRange.startDate,
          $lte: dateRange.endDate
        }
      });

      // Get session metrics
      const sessionMetrics = await UserSession.aggregate([
        {
          $match: {
            startTime: {
              $gte: dateRange.startDate,
              $lte: dateRange.endDate
            },
            ...(userId && { userId: new mongoose.Types.ObjectId(userId) })
          }
        },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            avgDuration: { $avg: '$duration' },
            avgEventsPerSession: { $avg: '$totalEvents' },
            uniqueUsers: { $addToSet: '$userId' }
          }
        }
      ]);

      // Get event metrics
      const eventMetrics = await AnalyticsEvent.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$userId',
            eventCount: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            avgEventsPerUser: { $avg: '$eventCount' },
            totalUsers: { $sum: 1 }
          }
        }
      ]);

      // Calculate retention rate (users who returned after first session)
      const retentionData = await this.calculateRetentionRate(dateRange, userId);

      // Calculate bounce rate (single-event sessions)
      const bounceRate = await this.calculateBounceRate(dateRange, userId);

      const sessionData = sessionMetrics[0] || {};
      const eventData = eventMetrics[0] || {};

      return {
        totalUsers: await User.countDocuments(userId ? { _id: userId } : {}),
        activeUsers: activeUsers.length,
        newUsers,
        averageSessionDuration: sessionData.avgDuration || 0,
        averageEventsPerUser: eventData.avgEventsPerUser || 0,
        retentionRate: retentionData,
        bounceRate
      };

    } catch (error) {
      logger.error('Error calculating user engagement metrics:', error);
      throw error;
    }
  }

  /**
   * Get business metrics including revenue and subscription data
   */
  static async getBusinessMetrics(dateRange: DateRange): Promise<BusinessMetrics> {
    try {
      // Get revenue data
      const revenueData = await PaymentTransaction.aggregate([
        {
          $match: {
            createdAt: {
              $gte: dateRange.startDate,
              $lte: dateRange.endDate
            },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            transactionCount: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' }
          }
        }
      ]);

      // Get MRR (Monthly Recurring Revenue)
      const mrrData = await Subscription.aggregate([
        {
          $match: {
            status: 'active',
            createdAt: { $lte: dateRange.endDate }
          }
        },
        {
          $group: {
            _id: null,
            monthlyRevenue: {
              $sum: {
                $cond: [
                  { $eq: ['$interval', 'monthly'] },
                  '$amount',
                  { $divide: ['$amount', 12] } // Convert yearly to monthly
                ]
              }
            }
          }
        }
      ]);

      // Get churn rate
      const churnRate = await this.calculateChurnRate(dateRange);

      // Get conversion rate (users who subscribed vs total users)
      const conversionRate = await this.calculateConversionRate(dateRange);

      // Get average revenue per user
      const totalUsers = await User.countDocuments();
      const revenue = revenueData[0]?.totalRevenue || 0;
      const arpu = totalUsers > 0 ? revenue / totalUsers : 0;

      // Calculate customer lifetime value
      const ltv = await this.calculateLifetimeValue(dateRange);

      return {
        totalRevenue: revenue,
        monthlyRecurringRevenue: mrrData[0]?.monthlyRevenue || 0,
        averageRevenuePerUser: arpu,
        churnRate,
        lifetimeValue: ltv,
        conversionRate
      };

    } catch (error) {
      logger.error('Error calculating business metrics:', error);
      throw error;
    }
  }

  /**
   * Get feature usage analytics
   */
  static async getFeatureUsageMetrics(dateRange: DateRange, userId?: string): Promise<FeatureUsageMetrics> {
    try {
      const baseQuery: any = {
        eventCategory: 'feature_usage',
        timestamp: {
          $gte: dateRange.startDate,
          $lte: dateRange.endDate
        }
      };

      if (userId) {
        baseQuery.userId = new mongoose.Types.ObjectId(userId);
      }

      // Get top features by usage
      const topFeatures = await AnalyticsEvent.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$eventLabel',
            usageCount: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            averageTimeSpent: { $avg: '$value' }
          }
        },
        {
          $addFields: {
            uniqueUserCount: { $size: '$uniqueUsers' }
          }
        },
        {
          $project: {
            feature: '$_id',
            usageCount: 1,
            uniqueUsers: '$uniqueUserCount',
            averageTimeSpent: 1,
            _id: 0
          }
        },
        { $sort: { usageCount: -1 } },
        { $limit: 20 }
      ]);

      // Get feature adoption rates
      const featureAdoption = await this.calculateFeatureAdoption(dateRange, userId);

      // Get feature retention rates
      const featureRetention = await this.calculateFeatureRetention(dateRange, userId);

      return {
        topFeatures,
        featureAdoption,
        featureRetention
      };

    } catch (error) {
      logger.error('Error calculating feature usage metrics:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive dashboard data
   */
  static async getDashboardData(dateRange: DateRange, userId?: string) {
    try {
      const [
        engagement,
        business,
        features,
        realtimeData
      ] = await Promise.all([
        this.getUserEngagementMetrics(dateRange, userId),
        userId ? null : this.getBusinessMetrics(dateRange), // Only for admin dashboard
        this.getFeatureUsageMetrics(dateRange, userId),
        this.getRealtimeMetrics()
      ]);

      return {
        dateRange,
        engagement,
        business,
        features,
        realtime: realtimeData
      };

    } catch (error) {
      logger.error('Error generating dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get real-time metrics for live dashboard
   */
  static async getRealtimeMetrics() {
    try {
      const now = new Date();
      const last30Minutes = new Date(now.getTime() - 30 * 60 * 1000);
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [
        activeUsers30m,
        activeUsers24h,
        activeSessions,
        recentEvents
      ] = await Promise.all([
        AnalyticsEvent.distinct('userId', { timestamp: { $gte: last30Minutes } }),
        AnalyticsEvent.distinct('userId', { timestamp: { $gte: last24Hours } }),
        UserSession.countDocuments({ 
          isActive: true, 
          lastActivity: { $gte: last30Minutes } 
        }),
        AnalyticsEvent.find({ timestamp: { $gte: last24Hours } })
          .sort({ timestamp: -1 })
          .limit(50)
          .select('eventType eventCategory eventAction timestamp userId')
      ]);

      return {
        activeUsers30m: activeUsers30m.length,
        activeUsers24h: activeUsers24h.length,
        activeSessions,
        recentEvents,
        lastUpdated: now
      };

    } catch (error) {
      logger.error('Error getting realtime metrics:', error);
      throw error;
    }
  }

  // Private helper methods
  private static async calculateRetentionRate(dateRange: DateRange, userId?: string): Promise<number> {
    // Calculate user retention (users who came back after first session)
    // Implementation would analyze user session patterns
    return 0.75; // Placeholder - implement full logic
  }

  private static async calculateBounceRate(dateRange: DateRange, userId?: string): Promise<number> {
    // Calculate bounce rate (single-event sessions)
    // Implementation would analyze session event counts
    return 0.25; // Placeholder - implement full logic
  }

  private static async calculateChurnRate(dateRange: DateRange): Promise<number> {
    // Calculate subscription churn rate
    const startOfPeriod = new Date(dateRange.startDate);
    const endOfPeriod = new Date(dateRange.endDate);

    const startActiveSubscriptions = await Subscription.countDocuments({
      status: 'active',
      createdAt: { $lte: startOfPeriod }
    });

    const cancelledInPeriod = await Subscription.countDocuments({
      status: 'cancelled',
      updatedAt: {
        $gte: startOfPeriod,
        $lte: endOfPeriod
      }
    });

    return startActiveSubscriptions > 0 ? cancelledInPeriod / startActiveSubscriptions : 0;
  }

  private static async calculateConversionRate(dateRange: DateRange): Promise<number> {
    const totalUsers = await User.countDocuments({
      createdAt: {
        $gte: dateRange.startDate,
        $lte: dateRange.endDate
      }
    });

    const subscribedUsers = await Subscription.distinct('userId', {
      createdAt: {
        $gte: dateRange.startDate,
        $lte: dateRange.endDate
      }
    });

    return totalUsers > 0 ? subscribedUsers.length / totalUsers : 0;
  }

  private static async calculateLifetimeValue(dateRange: DateRange): Promise<number> {
    // Calculate average customer lifetime value
    // This would involve analyzing average subscription duration and revenue
    return 150; // Placeholder - implement full logic
  }

  private static async calculateFeatureAdoption(dateRange: DateRange, userId?: string): Promise<Record<string, number>> {
    // Calculate feature adoption rates
    return {}; // Placeholder - implement full logic
  }

  private static async calculateFeatureRetention(dateRange: DateRange, userId?: string): Promise<Record<string, number>> {
    // Calculate feature retention rates
    return {}; // Placeholder - implement full logic
  }
}

export default AnalyticsService;
