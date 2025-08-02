import { Request, Response } from 'express';
import { AnalyticsEvent } from '../models/AnalyticsEvent';
import { UserSession } from '../models/UserSession';
import { AnalyticsReport } from '../models/AnalyticsReport';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { PaymentTransaction } from '../models/PaymentTransaction';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import mongoose from 'mongoose';

// Get analytics dashboard data
export const getAnalyticsDashboard = catchAsync(async (req: Request, res: Response) => {
  const { period = '30d', userId } = req.query;
  
  let days = 30;
  if (period === '7d') days = 7;
  else if (period === '90d') days = 90;
  else if (period === '1y') days = 365;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Build base query
  const baseQuery: any = {
    timestamp: { $gte: startDate }
  };
  
  if (userId) {
    baseQuery.userId = new mongoose.Types.ObjectId(userId as string);
  }
  
  // Get event counts by category
  const eventsByCategory = await AnalyticsEvent.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: '$eventCategory',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $addFields: {
        uniqueUserCount: { $size: '$uniqueUsers' }
      }
    },
    {
      $project: { uniqueUsers: 0 }
    }
  ]);
  
  // Get daily event trends
  const dailyTrends = await AnalyticsEvent.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        },
        totalEvents: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        workoutEvents: {
          $sum: { $cond: [{ $eq: ['$eventCategory', 'workout'] }, 1, 0] }
        },
        nutritionEvents: {
          $sum: { $cond: [{ $eq: ['$eventCategory', 'nutrition'] }, 1, 0] }
        }
      }
    },
    {
      $addFields: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        uniqueUserCount: { $size: '$uniqueUsers' }
      }
    },
    {
      $project: { uniqueUsers: 0 }
    },
    { $sort: { date: 1 } }
  ]);
  
  // Get user engagement metrics
  const engagementMetrics = await UserSession.aggregate([
    {
      $match: {
        startTime: { $gte: startDate },
        ...(userId && { userId: new mongoose.Types.ObjectId(userId as string) })
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        avgDuration: { $avg: '$duration' },
        totalDuration: { $sum: '$duration' },
        avgEventsPerSession: { $avg: '$totalEvents' },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $addFields: {
        uniqueUserCount: { $size: '$uniqueUsers' }
      }
    },
    {
      $project: { uniqueUsers: 0 }
    }
  ]);
  
  // Get top features used
  const topFeatures = await AnalyticsEvent.aggregate([
    {
      $match: {
        ...baseQuery,
        eventCategory: 'feature_usage'
      }
    },
    {
      $group: {
        _id: '$eventLabel',
        usageCount: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $addFields: {
        uniqueUserCount: { $size: '$uniqueUsers' }
      }
    },
    {
      $project: { uniqueUsers: 0 }
    },
    { $sort: { usageCount: -1 } },
    { $limit: 10 }
  ]);
  
  res.json({
    success: true,
    data: {
      period,
      dateRange: {
        startDate,
        endDate: new Date()
      },
      overview: {
        eventsByCategory,
        engagement: engagementMetrics[0] || {}
      },
      trends: {
        daily: dailyTrends
      },
      features: {
        topUsed: topFeatures
      }
    }
  });
});

// Get user-specific analytics
export const getUserAnalytics = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { period = '30d' } = req.query;
  
  let days = 30;
  if (period === '7d') days = 7;
  else if (period === '90d') days = 90;
  else if (period === '1y') days = 365;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Get user engagement metrics
  const engagementMetrics = await AnalyticsEvent.getUserEngagementMetrics(userId, days);
  
  // Get session statistics
  const sessionStats = await UserSession.getUserSessionStats(userId, days);
  
  // Get workout analytics
  const workoutAnalytics = await AnalyticsEvent.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        eventCategory: 'workout',
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$eventAction',
        count: { $sum: 1 },
        totalDuration: { $sum: '$value' },
        avgDuration: { $avg: '$value' }
      }
    }
  ]);
  
  // Get nutrition analytics
  const nutritionAnalytics = await AnalyticsEvent.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        eventCategory: 'nutrition',
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$eventAction',
        count: { $sum: 1 },
        totalCalories: { $sum: '$value' },
        avgCalories: { $avg: '$value' }
      }
    }
  ]);
  
  res.json({
    success: true,
    data: {
      userId,
      period,
      engagement: engagementMetrics,
      sessions: sessionStats[0] || {},
      workouts: workoutAnalytics,
      nutrition: nutritionAnalytics
    }
  });
});

// Generate analytics report
export const generateReport = catchAsync(async (req: Request, res: Response) => {
  const { reportType, dateRange, format = 'json', userId } = req.body;
  
  if (!reportType || !dateRange) {
    throw new AppError('Report type and date range are required', 400);
  }
  
  const report = await AnalyticsReport.createReport({
    reportType,
    reportName: `${reportType} Report - ${new Date().toISOString().split('T')[0]}`,
    userId: userId || undefined,
    dateRange,
    format,
    generatedBy: req.user?.id
  });
  
  // Background job to generate report data
  generateReportData(report._id?.toString() || '');
  
  res.status(202).json({
    success: true,
    message: 'Report generation started',
    data: {
      reportId: report._id,
      status: 'generating'
    }
  });
});

// Get report status and data
export const getReport = catchAsync(async (req: Request, res: Response) => {
  const { reportId } = req.params;
  
  const report = await AnalyticsReport.findById(reportId);
  
  if (!report) {
    throw new AppError('Report not found', 404);
  }
  
  res.json({
    success: true,
    data: report
  });
});

// Get available reports
export const getReports = catchAsync(async (req: Request, res: Response) => {
  const { reportType, userId, limit = 20, page = 1 } = req.query;
  
  const query: any = {};
  if (reportType) query.reportType = reportType;
  if (userId) query.userId = userId;
  
  const reports = await AnalyticsReport.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .populate('generatedBy', 'name email')
    .populate('userId', 'name email');
  
  const total = await AnalyticsReport.countDocuments(query);
  
  res.json({
    success: true,
    data: {
      reports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

// Get real-time analytics
export const getRealTimeAnalytics = catchAsync(async (req: Request, res: Response) => {
  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);
  
  // Active users in last 24 hours
  const activeUsers = await AnalyticsEvent.distinct('userId', {
    timestamp: { $gte: last24Hours }
  });
  
  // Current active sessions
  const activeSessions = await UserSession.countDocuments({
    isActive: true,
    lastActivity: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // Last 30 minutes
  });
  
  // Recent events
  const recentEvents = await AnalyticsEvent.find({
    timestamp: { $gte: last24Hours }
  })
    .sort({ timestamp: -1 })
    .limit(100)
    .populate('userId', 'name email');
  
  // Event counts by hour for last 24 hours
  const hourlyEvents = await AnalyticsEvent.aggregate([
    {
      $match: {
        timestamp: { $gte: last24Hours }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
          hour: { $hour: '$timestamp' }
        },
        count: { $sum: 1 },
        categories: { $addToSet: '$eventCategory' }
      }
    },
    {
      $addFields: {
        timestamp: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day',
            hour: '$_id.hour'
          }
        }
      }
    },
    { $sort: { timestamp: 1 } }
  ]);
  
  res.json({
    success: true,
    data: {
      activeUsers: activeUsers.length,
      activeSessions,
      recentEvents,
      hourlyTrends: hourlyEvents,
      lastUpdated: new Date()
    }
  });
});

// Background function to generate report data
async function generateReportData(reportId: string): Promise<void> {
  try {
    const report = await AnalyticsReport.findById(reportId);
    if (!report) return;
    
    const { dateRange, reportType, userId } = report;
    const baseQuery: any = {
      timestamp: {
        $gte: dateRange.startDate,
        $lte: dateRange.endDate
      }
    };
    
    if (userId) {
      baseQuery.userId = userId;
    }
    
    // Generate comprehensive report data
    const data: any = {
      summary: {},
      details: {},
      charts: {}
    };
    
    // Get basic metrics
    const totalEvents = await AnalyticsEvent.countDocuments(baseQuery);
    const uniqueUsers = await AnalyticsEvent.distinct('userId', baseQuery);
    
    data.summary = {
      totalEvents,
      uniqueUsers: uniqueUsers.length,
      dateRange: dateRange
    };
    
    // Get detailed breakdowns
    data.details.eventsByCategory = await AnalyticsEvent.getAggregatedEvents(
      ['eventCategory'],
      dateRange.startDate,
      dateRange.endDate,
      userId ? { userId } : {}
    );
    
    data.details.eventsByAction = await AnalyticsEvent.getAggregatedEvents(
      ['eventAction'],
      dateRange.startDate,
      dateRange.endDate,
      userId ? { userId } : {}
    );
    
    // Update report with generated data
    await AnalyticsReport.findByIdAndUpdate(reportId, {
      data,
      status: 'completed',
      generatedAt: new Date()
    });
    
  } catch (error) {
    console.error('Error generating report:', error);
    await AnalyticsReport.findByIdAndUpdate(reportId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default {
  getAnalyticsDashboard,
  getUserAnalytics,
  generateReport,
  getReport,
  getReports,
  getRealTimeAnalytics
};
