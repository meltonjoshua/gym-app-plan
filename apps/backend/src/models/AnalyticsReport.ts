import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAnalyticsReport extends Document {
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom';
  reportName: string;
  userId?: string; // For user-specific reports
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  metrics: {
    totalUsers?: number;
    activeUsers?: number;
    newUsers?: number;
    retentionRate?: number;
    churnRate?: number;
    revenue?: number;
    subscriptions?: {
      total: number;
      new: number;
      cancelled: number;
      upgraded: number;
      downgraded: number;
    };
    workouts?: {
      total: number;
      completed: number;
      avgDuration: number;
      popularExercises: string[];
    };
    nutrition?: {
      totalLogs: number;
      avgCalories: number;
      goalAchievement: number;
    };
    engagement?: {
      avgSessionDuration: number;
      avgEventsPerUser: number;
      bounceRate: number;
    };
  };
  data: Record<string, any>;
  generatedAt: Date;
  generatedBy?: string;
  format: 'json' | 'csv' | 'pdf';
  status: 'generating' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IAnalyticsReportModel extends Model<IAnalyticsReport> {
  createReport(reportData: Partial<IAnalyticsReport>): Promise<IAnalyticsReport>;
  getReportsByType(reportType: string, userId?: string, limit?: number): Promise<IAnalyticsReport[]>;
  getLatestReport(reportType: string, userId?: string): Promise<IAnalyticsReport | null>;
}

const AnalyticsReportSchema = new Schema<IAnalyticsReport>({
  reportType: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    index: true
  },
  reportName: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  dateRange: {
    startDate: {
      type: Date,
      required: true,
      index: true
    },
    endDate: {
      type: Date,
      required: true,
      index: true
    }
  },
  metrics: {
    totalUsers: Number,
    activeUsers: Number,
    newUsers: Number,
    retentionRate: Number,
    churnRate: Number,
    revenue: Number,
    subscriptions: {
      total: Number,
      new: Number,
      cancelled: Number,
      upgraded: Number,
      downgraded: Number
    },
    workouts: {
      total: Number,
      completed: Number,
      avgDuration: Number,
      popularExercises: [String]
    },
    nutrition: {
      totalLogs: Number,
      avgCalories: Number,
      goalAchievement: Number
    },
    engagement: {
      avgSessionDuration: Number,
      avgEventsPerUser: Number,
      bounceRate: Number
    }
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  generatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  format: {
    type: String,
    enum: ['json', 'csv', 'pdf'],
    default: 'json'
  },
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating',
    index: true
  },
  error: String
}, {
  timestamps: true,
  collection: 'analytics_reports'
});

// Compound indexes
AnalyticsReportSchema.index({ reportType: 1, 'dateRange.startDate': -1 });
AnalyticsReportSchema.index({ userId: 1, reportType: 1, createdAt: -1 });

// TTL index to clean up old reports after 1 year
AnalyticsReportSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 }); // 1 year

// Static methods
AnalyticsReportSchema.statics.createReport = function(reportData: Partial<IAnalyticsReport>) {
  return this.create({
    ...reportData,
    generatedAt: new Date(),
    status: 'generating'
  });
};

AnalyticsReportSchema.statics.getReportsByType = function(
  reportType: string,
  userId?: string,
  limit?: number
) {
  const query: any = { reportType };
  if (userId) {
    query.userId = userId;
  }
  
  let queryBuilder = this.find(query).sort({ createdAt: -1 });
  
  if (limit) {
    queryBuilder = queryBuilder.limit(limit);
  }
  
  return queryBuilder;
};

AnalyticsReportSchema.statics.getLatestReport = function(
  reportType: string,
  userId?: string
) {
  const query: any = { 
    reportType,
    status: 'completed'
  };
  
  if (userId) {
    query.userId = userId;
  }
  
  return this.findOne(query).sort({ generatedAt: -1 });
};

export const AnalyticsReport = mongoose.model<IAnalyticsReport, IAnalyticsReportModel>('AnalyticsReport', AnalyticsReportSchema);
