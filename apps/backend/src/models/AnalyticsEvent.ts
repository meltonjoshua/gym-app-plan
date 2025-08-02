import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAnalyticsEvent extends Document {
  userId?: string;
  sessionId?: string;
  eventType: string;
  eventCategory: 'workout' | 'nutrition' | 'subscription' | 'navigation' | 'feature_usage' | 'error';
  eventAction: string;
  eventLabel?: string;
  value?: number;
  metadata?: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface IAnalyticsEventModel extends Model<IAnalyticsEvent> {
  getEventsByUser(userId: string, startDate?: Date, endDate?: Date): Promise<IAnalyticsEvent[]>;
  getEventsByCategory(category: string, startDate?: Date, endDate?: Date, limit?: number): Promise<IAnalyticsEvent[]>;
  getAggregatedEvents(groupBy: string[], startDate?: Date, endDate?: Date, filters?: Record<string, any>): Promise<any[]>;
  getUserEngagementMetrics(userId: string, days?: number): Promise<any[]>;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  sessionId: {
    type: String,
    index: true
  },
  eventType: {
    type: String,
    required: true,
    index: true
  },
  eventCategory: {
    type: String,
    required: true,
    enum: ['workout', 'nutrition', 'subscription', 'navigation', 'feature_usage', 'error'],
    index: true
  },
  eventAction: {
    type: String,
    required: true,
    index: true
  },
  eventLabel: {
    type: String,
    index: true
  },
  value: {
    type: Number
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  userAgent: String,
  ipAddress: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'analytics_events'
});

// Compound indexes for common query patterns
AnalyticsEventSchema.index({ userId: 1, timestamp: -1 });
AnalyticsEventSchema.index({ eventCategory: 1, eventAction: 1, timestamp: -1 });
AnalyticsEventSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsEventSchema.index({ timestamp: -1 });

// TTL index to automatically delete old events after 2 years
AnalyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 }); // 2 years

// Static methods for analytics queries
AnalyticsEventSchema.statics.getEventsByUser = function(userId: string, startDate?: Date, endDate?: Date) {
  const query: any = { userId };
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }
  
  return this.find(query).sort({ timestamp: -1 });
};

AnalyticsEventSchema.statics.getEventsByCategory = function(
  category: string, 
  startDate?: Date, 
  endDate?: Date,
  limit?: number
) {
  const query: any = { eventCategory: category };
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }
  
  let queryBuilder = this.find(query).sort({ timestamp: -1 });
  
  if (limit) {
    queryBuilder = queryBuilder.limit(limit);
  }
  
  return queryBuilder;
};

AnalyticsEventSchema.statics.getAggregatedEvents = function(
  groupBy: string[],
  startDate?: Date,
  endDate?: Date,
  filters?: Record<string, any>
) {
  const matchStage: any = { ...filters };
  
  if (startDate || endDate) {
    matchStage.timestamp = {};
    if (startDate) matchStage.timestamp.$gte = startDate;
    if (endDate) matchStage.timestamp.$lte = endDate;
  }
  
  const groupStage: any = {
    _id: {},
    count: { $sum: 1 },
    totalValue: { $sum: '$value' },
    avgValue: { $avg: '$value' },
    uniqueUsers: { $addToSet: '$userId' }
  };
  
  groupBy.forEach(field => {
    groupStage._id[field] = `$${field}`;
  });
  
  return this.aggregate([
    { $match: matchStage },
    { $group: groupStage },
    { $addFields: { uniqueUserCount: { $size: '$uniqueUsers' } } },
    { $project: { uniqueUsers: 0 } }, // Remove the array to save space
    { $sort: { count: -1 } }
  ]);
};

AnalyticsEventSchema.statics.getUserEngagementMetrics = function(userId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        },
        eventCount: { $sum: 1 },
        categories: { $addToSet: '$eventCategory' },
        workoutEvents: {
          $sum: {
            $cond: [{ $eq: ['$eventCategory', 'workout'] }, 1, 0]
          }
        },
        nutritionEvents: {
          $sum: {
            $cond: [{ $eq: ['$eventCategory', 'nutrition'] }, 1, 0]
          }
        },
        featureUsageEvents: {
          $sum: {
            $cond: [{ $eq: ['$eventCategory', 'feature_usage'] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

export const AnalyticsEvent = mongoose.model<IAnalyticsEvent, IAnalyticsEventModel>('AnalyticsEvent', AnalyticsEventSchema);
