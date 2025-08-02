import mongoose, { Document, Schema } from 'mongoose';

export interface ISecurityAuditLog extends Document {
  type: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  error?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
}

const SecurityAuditLogSchema = new Schema<ISecurityAuditLog>({
  type: {
    type: String,
    required: true,
    enum: [
      'RATE_LIMIT_EXCEEDED',
      'INVALID_TOKEN_ACCESS',
      'TOKEN_VERIFICATION_FAILED',
      'INVALID_2FA_ATTEMPT',
      'SUSPICIOUS_REQUEST',
      'LOGIN_ATTEMPT',
      'PASSWORD_RESET_REQUEST',
      'ACCOUNT_LOCKOUT',
      'PRIVILEGE_ESCALATION_ATTEMPT',
      'DATA_BREACH_ATTEMPT',
      'UNAUTHORIZED_ACCESS',
      'MALICIOUS_REQUEST'
    ]
  },
  userId: {
    type: String,
    ref: 'User',
    index: true
  },
  ip: {
    type: String,
    index: true
  },
  userAgent: String,
  path: String,
  error: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: String,
    ref: 'User'
  },
  resolvedAt: Date,
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
SecurityAuditLogSchema.index({ type: 1, timestamp: -1 });
SecurityAuditLogSchema.index({ ip: 1, timestamp: -1 });
SecurityAuditLogSchema.index({ severity: 1, resolved: 1 });

// TTL index to automatically delete old logs (keep for 1 year)
SecurityAuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

export const SecurityAuditLog = mongoose.model<ISecurityAuditLog>('SecurityAuditLog', SecurityAuditLogSchema);
