import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUserSession extends Document {
  userId?: string;
  sessionId: string;
  deviceInfo: {
    platform?: string;
    osVersion?: string;
    appVersion?: string;
    deviceModel?: string;
    screenResolution?: string;
  };
  location?: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
  };
  startTime: Date;
  endTime?: Date;
  duration?: number;
  isActive: boolean;
  totalEvents: number;
  lastActivity: Date;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IUserSessionModel extends Model<IUserSession> {
  createSession(sessionData: Partial<IUserSession>): Promise<IUserSession>;
  endSession(sessionId: string): Promise<IUserSession | null>;
  updateActivity(sessionId: string): Promise<IUserSession | null>;
  getActiveUserSessions(userId?: string): Promise<IUserSession[]>;
  getUserSessionStats(userId: string, days?: number): Promise<any[]>;
}

const UserSessionSchema = new Schema<IUserSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  deviceInfo: {
    platform: String,
    osVersion: String,
    appVersion: String,
    deviceModel: String,
    screenResolution: String
  },
  location: {
    country: String,
    region: String,
    city: String,
    timezone: String
  },
  startTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  endTime: {
    type: Date,
    index: true
  },
  duration: {
    type: Number // in milliseconds
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  totalEvents: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  },
  userAgent: String,
  ipAddress: String
}, {
  timestamps: true,
  collection: 'user_sessions'
});

// Compound indexes
UserSessionSchema.index({ userId: 1, startTime: -1 });
UserSessionSchema.index({ isActive: 1, lastActivity: -1 });

// TTL index to clean up old sessions after 6 months
UserSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 15552000 }); // 6 months

// Virtual for session duration
UserSessionSchema.virtual('sessionDuration').get(function() {
  if (this.endTime) {
    return this.endTime.getTime() - this.startTime.getTime();
  }
  return this.lastActivity.getTime() - this.startTime.getTime();
});

// Static methods
UserSessionSchema.statics.createSession = function(sessionData: Partial<IUserSession>) {
  return this.create({
    ...sessionData,
    startTime: new Date(),
    isActive: true,
    totalEvents: 0
  });
};

UserSessionSchema.statics.endSession = function(sessionId: string) {
  const endTime = new Date();
  return this.findOneAndUpdate(
    { sessionId, isActive: true },
    { 
      endTime,
      isActive: false,
      duration: { $subtract: [endTime, '$startTime'] }
    },
    { new: true }
  );
};

UserSessionSchema.statics.updateActivity = function(sessionId: string) {
  return this.findOneAndUpdate(
    { sessionId, isActive: true },
    { 
      lastActivity: new Date(),
      $inc: { totalEvents: 1 }
    },
    { new: true }
  );
};

UserSessionSchema.statics.getActiveUserSessions = function(userId?: string) {
  const query: any = { isActive: true };
  if (userId) {
    query.userId = userId;
  }
  return this.find(query).sort({ lastActivity: -1 });
};

UserSessionSchema.statics.getUserSessionStats = function(userId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        startTime: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        avgDuration: { $avg: '$duration' },
        totalDuration: { $sum: '$duration' },
        avgEventsPerSession: { $avg: '$totalEvents' },
        totalEvents: { $sum: '$totalEvents' },
        platforms: { $addToSet: '$deviceInfo.platform' },
        countries: { $addToSet: '$location.country' }
      }
    }
  ]);
};

export const UserSession = mongoose.model<IUserSession, IUserSessionModel>('UserSession', UserSessionSchema);
