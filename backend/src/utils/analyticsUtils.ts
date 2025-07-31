import { AnalyticsEvent } from '../models/AnalyticsEvent';
import { UserSession } from '../models/UserSession';
import mongoose from 'mongoose';

export interface TimeSeriesData {
  date: Date;
  value: number;
  label?: string;
}

export interface CohortData {
  cohort: string;
  period: number;
  users: number;
  retentionRate: number;
}

export interface FunnelStep {
  step: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
}

/**
 * Analytics utility functions for data processing and calculations
 */
export class AnalyticsUtils {

  /**
   * Generate time series data for a given metric
   */
  static async generateTimeSeries(
    collection: string,
    dateField: string,
    valueField: string,
    startDate: Date,
    endDate: Date,
    interval: 'hour' | 'day' | 'week' | 'month' = 'day',
    filters: Record<string, any> = {}
  ): Promise<TimeSeriesData[]> {
    
    const model = collection === 'events' ? AnalyticsEvent : UserSession;
    
    let groupBy: any;
    switch (interval) {
      case 'hour':
        groupBy = {
          year: { $year: `$${dateField}` },
          month: { $month: `$${dateField}` },
          day: { $dayOfMonth: `$${dateField}` },
          hour: { $hour: `$${dateField}` }
        };
        break;
      case 'week':
        groupBy = {
          year: { $year: `$${dateField}` },
          week: { $week: `$${dateField}` }
        };
        break;
      case 'month':
        groupBy = {
          year: { $year: `$${dateField}` },
          month: { $month: `$${dateField}` }
        };
        break;
      default: // day
        groupBy = {
          year: { $year: `$${dateField}` },
          month: { $month: `$${dateField}` },
          day: { $dayOfMonth: `$${dateField}` }
        };
    }

    const pipeline = [
      {
        $match: {
          [dateField]: {
            $gte: startDate,
            $lte: endDate
          },
          ...filters
        }
      },
      {
        $group: {
          _id: groupBy,
          value: valueField === 'count' ? { $sum: 1 } : { $sum: `$${valueField}` },
          avgValue: valueField === 'count' ? { $sum: 1 } : { $avg: `$${valueField}` }
        }
      },
      {
        $addFields: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
              hour: '$_id.hour'
            }
          }
        }
      },
      {
        $sort: { date: 1 as 1 } // Explicitly type as MongoDB sort direction
      }
    ];

    const results = await model.aggregate(pipeline);
    
    return results.map(item => ({
      date: item.date,
      value: item.value,
      label: this.formatDateLabel(item.date, interval)
    }));
  }

  /**
   * Calculate cohort analysis data
   */
  static async generateCohortAnalysis(
    cohortPeriod: 'month' | 'week' = 'month',
    analysisMonths: number = 12
  ): Promise<CohortData[]> {
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - analysisMonths);

    // This is a simplified cohort analysis
    // In a real implementation, you'd track user registration cohorts
    // and their retention over time periods
    
    const pipeline = [
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            userId: '$userId',
            cohort: {
              $dateToString: {
                format: cohortPeriod === 'month' ? '%Y-%m' : '%Y-%U',
                date: '$timestamp'
              }
            },
            period: {
              $dateToString: {
                format: cohortPeriod === 'month' ? '%Y-%m' : '%Y-%U',
                date: '$timestamp'
              }
            }
          }
        }
      },
      {
        $group: {
          _id: {
            cohort: '$_id.cohort',
            period: '$_id.period'
          },
          users: { $sum: 1 }
        }
      }
    ];

    const results = await AnalyticsEvent.aggregate(pipeline);
    
    // Process results into cohort format
    const cohortMap = new Map<string, Map<string, number>>();
    
    results.forEach(item => {
      const cohort = item._id.cohort;
      const period = item._id.period;
      
      if (!cohortMap.has(cohort)) {
        cohortMap.set(cohort, new Map());
      }
      
      cohortMap.get(cohort)!.set(period, item.users);
    });

    // Convert to cohort data format
    const cohortData: CohortData[] = [];
    
    cohortMap.forEach((periods, cohort) => {
      const sortedPeriods = Array.from(periods.entries()).sort();
      const initialUsers = sortedPeriods[0]?.[1] || 0;
      
      sortedPeriods.forEach(([period, users], index) => {
        cohortData.push({
          cohort,
          period: index,
          users,
          retentionRate: initialUsers > 0 ? users / initialUsers : 0
        });
      });
    });

    return cohortData;
  }

  /**
   * Calculate conversion funnel data
   */
  static async generateFunnelAnalysis(
    funnelSteps: string[],
    dateRange: { startDate: Date; endDate: Date },
    userId?: string
  ): Promise<FunnelStep[]> {
    
    const baseQuery: any = {
      timestamp: {
        $gte: dateRange.startDate,
        $lte: dateRange.endDate
      },
      eventAction: { $in: funnelSteps }
    };

    if (userId) {
      baseQuery.userId = new mongoose.Types.ObjectId(userId);
    }

    const results = await AnalyticsEvent.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: '$eventAction',
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $addFields: {
          userCount: { $size: '$uniqueUsers' }
        }
      },
      {
        $project: {
          step: '$_id',
          users: '$userCount'
        }
      }
    ]);

    // Convert to funnel format with conversion rates
    const stepMap = new Map(results.map(r => [r.step, r.users]));
    const totalUsers = stepMap.get(funnelSteps[0]) || 0;

    return funnelSteps.map((step, index) => {
      const users = stepMap.get(step) || 0;
      const prevUsers = index > 0 ? (stepMap.get(funnelSteps[index - 1]) || 0) : totalUsers;
      
      return {
        step,
        users,
        conversionRate: totalUsers > 0 ? users / totalUsers : 0,
        dropoffRate: prevUsers > 0 ? 1 - (users / prevUsers) : 0
      };
    });
  }

  /**
   * Calculate user retention rates
   */
  static async calculateRetentionRates(
    periodType: 'day' | 'week' | 'month',
    periods: number = 12,
    userCohort?: Date
  ): Promise<{ period: number; retentionRate: number }[]> {
    
    const results: { period: number; retentionRate: number }[] = [];
    
    // This is a simplified implementation
    // In production, you'd analyze actual user return patterns
    
    for (let i = 1; i <= periods; i++) {
      // Mock retention calculation
      // Real implementation would track users who return in each period
      const baseRate = 0.8;
      const decay = Math.pow(0.95, i);
      const retentionRate = baseRate * decay;
      
      results.push({
        period: i,
        retentionRate
      });
    }

    return results;
  }

  /**
   * Segment users based on behavior patterns
   */
  static async segmentUsers(
    dateRange: { startDate: Date; endDate: Date }
  ): Promise<Record<string, { users: string[]; characteristics: any }>> {
    
    const userMetrics = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate
          }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalEvents: { $sum: 1 },
          categories: { $addToSet: '$eventCategory' },
          avgSessionDuration: { $avg: '$value' },
          firstEvent: { $min: '$timestamp' },
          lastEvent: { $max: '$timestamp' }
        }
      },
      {
        $addFields: {
          daysSinceFirst: {
            $divide: [
              { $subtract: [new Date(), '$firstEvent'] },
              1000 * 60 * 60 * 24
            ]
          },
          categoryCount: { $size: '$categories' }
        }
      }
    ]);

    // Segment users into groups
    const segments: Record<string, { users: string[]; characteristics: any }> = {
      powerUsers: { users: [], characteristics: { minEvents: 100, minCategories: 4 } },
      regularUsers: { users: [], characteristics: { minEvents: 20, maxEvents: 99 } },
      newUsers: { users: [], characteristics: { maxDays: 7 } },
      inactiveUsers: { users: [], characteristics: { maxEvents: 5 } }
    };

    userMetrics.forEach(user => {
      const userId = user._id.toString();
      
      if (user.totalEvents >= 100 && user.categoryCount >= 4) {
        segments.powerUsers.users.push(userId);
      } else if (user.totalEvents >= 20) {
        segments.regularUsers.users.push(userId);
      } else if (user.daysSinceFirst <= 7) {
        segments.newUsers.users.push(userId);
      } else {
        segments.inactiveUsers.users.push(userId);
      }
    });

    return segments;
  }

  /**
   * Calculate statistical aggregations
   */
  static calculateStats(values: number[]): {
    mean: number;
    median: number;
    mode: number;
    standardDeviation: number;
    min: number;
    max: number;
    percentiles: { p25: number; p50: number; p75: number; p90: number; p95: number };
  } {
    if (values.length === 0) {
      return {
        mean: 0, median: 0, mode: 0, standardDeviation: 0,
        min: 0, max: 0,
        percentiles: { p25: 0, p50: 0, p75: 0, p90: 0, p95: 0 }
      };
    }

    const sorted = values.sort((a, b) => a - b);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    
    // Calculate mode
    const frequency: Record<number, number> = {};
    values.forEach(val => frequency[val] = (frequency[val] || 0) + 1);
    const mode = Number(Object.keys(frequency).reduce((a, b) => 
      frequency[Number(a)] > frequency[Number(b)] ? a : b
    ));

    // Calculate standard deviation
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    // Calculate percentiles
    const getPercentile = (p: number) => sorted[Math.floor(sorted.length * p / 100)];

    return {
      mean,
      median,
      mode,
      standardDeviation,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      percentiles: {
        p25: getPercentile(25),
        p50: getPercentile(50),
        p75: getPercentile(75),
        p90: getPercentile(90),
        p95: getPercentile(95)
      }
    };
  }

  /**
   * Format date label based on interval
   */
  private static formatDateLabel(date: Date, interval: string): string {
    const options: Intl.DateTimeFormatOptions = {};
    
    switch (interval) {
      case 'hour':
        return date.toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          hour: 'numeric' 
        });
      case 'week':
        return `Week ${Math.ceil(date.getDate() / 7)} ${date.toLocaleString('en-US', { month: 'short' })}`;
      case 'month':
        return date.toLocaleString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
      default: // day
        return date.toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
    }
  }

  /**
   * Validate and sanitize analytics data
   */
  static sanitizeAnalyticsData(data: any): any {
    // Remove sensitive information
    const sanitized = { ...data };
    
    // Remove or hash sensitive fields
    if (sanitized.ipAddress) {
      sanitized.ipAddress = this.hashIP(sanitized.ipAddress);
    }
    
    if (sanitized.userAgent) {
      sanitized.userAgent = this.sanitizeUserAgent(sanitized.userAgent);
    }

    return sanitized;
  }

  private static hashIP(ip: string): string {
    // Simple IP hashing for privacy
    return ip.split('.').map(octet => 
      parseInt(octet).toString(16).padStart(2, '0')
    ).join('');
  }

  private static sanitizeUserAgent(userAgent: string): string {
    // Remove version numbers and specific identifiers
    return userAgent
      .replace(/\/[\d.]+/g, '/x.x.x')
      .replace(/\([^)]+\)/g, '(...)');
  }
}

export default AnalyticsUtils;
