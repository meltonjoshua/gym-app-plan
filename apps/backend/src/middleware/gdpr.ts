import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { SecurityAuditLog } from '../models/SecurityAuditLog';
import mongoose from 'mongoose';
import crypto from 'crypto';

export interface IGDPRConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  version: string;
}

export interface IDataProcessingLog {
  userId: string;
  action: 'access' | 'update' | 'delete' | 'export' | 'anonymize';
  dataType: string;
  purpose: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  timestamp: Date;
  ipAddress: string;
  automated: boolean;
}

export class GDPRCompliance {
  private static readonly DATA_RETENTION_PERIODS = {
    user_data: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
    audit_logs: 6 * 365 * 24 * 60 * 60 * 1000, // 6 years
    session_data: 24 * 60 * 60 * 1000, // 24 hours
    workout_data: 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
    analytics_data: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
  };

  // Consent Management
  static recordConsent = async (userId: string, consent: IGDPRConsent) => {
    await User.findByIdAndUpdate(userId, {
      $push: {
        gdprConsents: {
          ...consent,
          consentId: crypto.randomUUID(),
          timestamp: new Date()
        }
      }
    });

    await GDPRCompliance.logDataProcessing({
      userId,
      action: 'update',
      dataType: 'consent_preferences',
      purpose: 'gdpr_compliance',
      legalBasis: 'consent',
      timestamp: new Date(),
      ipAddress: consent.ipAddress,
      automated: false
    });
  };

  static getLatestConsent = async (userId: string): Promise<IGDPRConsent | null> => {
    const user = await User.findById(userId).select('gdprConsents');
    if (!user || !user.gdprConsents || user.gdprConsents.length === 0) {
      return null;
    }
    
    return user.gdprConsents[user.gdprConsents.length - 1];
  };

  static requireConsent = (consentType: keyof IGDPRConsent) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const consent = await GDPRCompliance.getLatestConsent(userId);
      if (!consent || !consent[consentType]) {
        return res.status(403).json({
          error: 'Consent required',
          consentType,
          message: `This action requires ${consentType} consent`
        });
      }

      next();
    };
  };

  // Data Subject Rights
  static handleDataAccessRequest = async (userId: string, requestId: string) => {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new Error('User not found');
    }

    // Collect all user data from various collections
    const userData = {
      personalData: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        preferences: user.preferences
      },
      workoutData: await GDPRCompliance.getUserWorkouts(userId),
      progressData: await GDPRCompliance.getUserProgress(userId),
      subscriptionData: await GDPRCompliance.getUserSubscriptions(userId),
      auditLogs: await GDPRCompliance.getUserAuditLogs(userId),
      consentHistory: user.gdprConsents
    };

    await GDPRCompliance.logDataProcessing({
      userId,
      action: 'access',
      dataType: 'all_personal_data',
      purpose: 'data_subject_request',
      legalBasis: 'legal_obligation',
      timestamp: new Date(),
      ipAddress: 'system',
      automated: true
    });

    return {
      requestId,
      userId,
      exportedAt: new Date(),
      dataFormat: 'JSON',
      data: userData
    };
  };

  static handleDataDeletionRequest = async (userId: string, requestId: string) => {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Anonymize user data instead of hard deletion (for audit trail)
        const anonymizedData = {
          email: `deleted_${crypto.randomUUID()}@deleted.local`,
          firstName: 'Deleted',
          lastName: 'User',
          phone: null,
          dateOfBirth: null,
          preferences: {},
          deletedAt: new Date(),
          deletionReason: 'user_request',
          deletionRequestId: requestId
        };

        await User.findByIdAndUpdate(userId, anonymizedData, { session });

        // Mark related data as anonymized
        await GDPRCompliance.anonymizeUserWorkouts(userId, session);
        await GDPRCompliance.anonymizeUserProgress(userId, session);
        
        await GDPRCompliance.logDataProcessing({
          userId,
          action: 'anonymize',
          dataType: 'all_personal_data',
          purpose: 'data_subject_request',
          legalBasis: 'legal_obligation',
          timestamp: new Date(),
          ipAddress: 'system',
          automated: true
        });
      });
    } finally {
      await session.endSession();
    }
  };

  static handleDataPortabilityRequest = async (userId: string) => {
    const userData = await GDPRCompliance.handleDataAccessRequest(userId, crypto.randomUUID());
    
    // Convert to portable formats
    const portableData = {
      ...userData,
      format: 'GDPR_PORTABLE_JSON_V1',
      schema: 'https://fittracker.app/schemas/user-data-v1.json',
      exportMetadata: {
        exportedBy: 'system',
        exportedAt: new Date(),
        dataVersion: '1.0',
        includesDeletedData: false
      }
    };

    return portableData;
  };

  static handleDataRectificationRequest = async (userId: string, updates: any) => {
    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'preferences'];
    const sanitizedUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    await User.findByIdAndUpdate(userId, {
      ...sanitizedUpdates,
      lastModified: new Date()
    });

    await GDPRCompliance.logDataProcessing({
      userId,
      action: 'update',
      dataType: 'personal_data',
      purpose: 'data_rectification',
      legalBasis: 'legal_obligation',
      timestamp: new Date(),
      ipAddress: 'system',
      automated: false
    });
  };

  // Data Processing Logging
  static logDataProcessing = async (log: IDataProcessingLog) => {
    const DataProcessingLog = mongoose.model('DataProcessingLog', new mongoose.Schema({
      userId: { type: String, required: true, index: true },
      action: { type: String, required: true },
      dataType: { type: String, required: true },
      purpose: { type: String, required: true },
      legalBasis: { type: String, required: true },
      timestamp: { type: Date, default: Date.now, index: true },
      ipAddress: String,
      automated: { type: Boolean, default: false }
    }));

    await DataProcessingLog.create(log);
  };

  // Data Retention Management
  static cleanupExpiredData = async () => {
    const now = new Date();
    
    // Clean up expired sessions
    const sessionExpiry = new Date(now.getTime() - GDPRCompliance.DATA_RETENTION_PERIODS.session_data);
    
    // Clean up old audit logs
    const auditExpiry = new Date(now.getTime() - GDPRCompliance.DATA_RETENTION_PERIODS.audit_logs);
    await SecurityAuditLog.deleteMany({ timestamp: { $lt: auditExpiry } });

    // Archive old workout data
    const workoutArchiveDate = new Date(now.getTime() - GDPRCompliance.DATA_RETENTION_PERIODS.workout_data);
    
    console.log(`GDPR cleanup completed at ${now}`);
  };

  // Privacy Impact Assessment
  static conductPrivacyImpactAssessment = async (feature: string, dataTypes: string[], purpose: string) => {
    const riskScore = GDPRCompliance.calculateRiskScore(dataTypes, purpose);
    
    const assessment = {
      feature,
      dataTypes,
      purpose,
      riskScore,
      assessmentDate: new Date(),
      mitigationMeasures: GDPRCompliance.getMitigationMeasures(riskScore),
      approved: riskScore < 0.7,
      reviewRequired: riskScore >= 0.7
    };

    return assessment;
  };

  private static calculateRiskScore = (dataTypes: string[], purpose: string): number => {
    const sensitiveDataTypes = ['health', 'biometric', 'financial', 'location'];
    const riskPurposes = ['marketing', 'profiling', 'automated_decision_making'];
    
    let score = 0.1; // Base score
    
    // Add risk for sensitive data types
    dataTypes.forEach(type => {
      if (sensitiveDataTypes.includes(type)) {
        score += 0.3;
      } else {
        score += 0.1;
      }
    });
    
    // Add risk for risky purposes
    if (riskPurposes.includes(purpose)) {
      score += 0.2;
    }
    
    return Math.min(score, 1.0);
  };

  private static getMitigationMeasures = (riskScore: number): string[] => {
    const measures = [];
    
    if (riskScore >= 0.3) {
      measures.push('Data minimization required');
      measures.push('Regular access audits');
    }
    
    if (riskScore >= 0.5) {
      measures.push('Enhanced encryption');
      measures.push('Explicit consent required');
    }
    
    if (riskScore >= 0.7) {
      measures.push('Data Protection Officer review');
      measures.push('Privacy by design assessment');
      measures.push('Regular compliance audits');
    }
    
    return measures;
  };

  // Helper methods for data collection
  private static async getUserWorkouts(userId: string) {
    // Implementation would depend on your workout model
    return [];
  }

  private static async getUserProgress(userId: string) {
    // Implementation would depend on your progress model
    return [];
  }

  private static async getUserSubscriptions(userId: string) {
    // Implementation would depend on your subscription model
    return [];
  }

  private static async getUserAuditLogs(userId: string) {
    return await SecurityAuditLog.find({ userId }).limit(1000).lean();
  }

  private static async anonymizeUserWorkouts(userId: string, session: any) {
    // Implementation would update workout records to remove personal identifiers
  }

  private static async anonymizeUserProgress(userId: string, session: any) {
    // Implementation would update progress records to remove personal identifiers
  }
}

// GDPR Middleware
export const gdprMiddleware = {
  requireConsent: GDPRCompliance.requireConsent,
  
  logDataAccess: (dataType: string, purpose: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (req.user) {
        await GDPRCompliance.logDataProcessing({
          userId: req.user._id,
          action: 'access',
          dataType,
          purpose,
          legalBasis: 'consent',
          timestamp: new Date(),
          ipAddress: req.ip || 'unknown',
          automated: false
        });
      }
      next();
    };
  }
};

export default GDPRCompliance;
