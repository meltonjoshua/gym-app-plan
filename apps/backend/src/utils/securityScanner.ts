import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { SecurityAuditLog } from '../models/SecurityAuditLog';

export interface IVulnerabilityReport {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  recommendation: string;
  status: 'open' | 'acknowledged' | 'fixed' | 'false_positive';
  affectedEndpoints?: string[];
  cveIds?: string[];
}

export class SecurityScanner {
  private static vulnerabilities: IVulnerabilityReport[] = [];

  // Automated Security Scans
  static async runComprehensiveSecurityScan(): Promise<IVulnerabilityReport[]> {
    const vulnerabilities: IVulnerabilityReport[] = [];

    // Check for common security vulnerabilities
    vulnerabilities.push(...await SecurityScanner.scanPasswordPolicies());
    vulnerabilities.push(...await SecurityScanner.scanUserAuthentication());
    vulnerabilities.push(...await SecurityScanner.scanSessionManagement());
    vulnerabilities.push(...await SecurityScanner.scanInputValidation());
    vulnerabilities.push(...await SecurityScanner.scanDataEncryption());
    vulnerabilities.push(...await SecurityScanner.scanAccessControls());
    vulnerabilities.push(...await SecurityScanner.scanRateLimiting());
    vulnerabilities.push(...await SecurityScanner.scanGDPRCompliance());

    SecurityScanner.vulnerabilities = vulnerabilities;
    
    // Log scan completion
    await SecurityAuditLog.create({
      type: 'SECURITY_SCAN_COMPLETED',
      timestamp: new Date(),
      metadata: {
        vulnerabilitiesFound: vulnerabilities.length,
        criticalCount: vulnerabilities.filter(v => v.severity === 'critical').length,
        highCount: vulnerabilities.filter(v => v.severity === 'high').length
      }
    });

    return vulnerabilities;
  }

  // Password Policy Security Check
  private static async scanPasswordPolicies(): Promise<IVulnerabilityReport[]> {
    const vulnerabilities: IVulnerabilityReport[] = [];

    // Check for weak passwords in database
    const users = await User.find({ active: true }).select('password email');
    const weakPasswordCount = await User.countDocuments({
      active: true,
      // This would need to be implemented with a more sophisticated check
    });

    if (weakPasswordCount > 0) {
      vulnerabilities.push({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        severity: 'medium',
        category: 'Authentication',
        title: 'Weak Password Detection',
        description: `${weakPasswordCount} users have potentially weak passwords`,
        recommendation: 'Implement stronger password complexity requirements and force password updates',
        status: 'open',
        affectedEndpoints: ['/auth/login', '/auth/register']
      });
    }

    // Check password reset token expiration
    const longLivedTokens = await User.countDocuments({
      passwordResetExpires: { $gt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
    });

    if (longLivedTokens > 0) {
      vulnerabilities.push({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        severity: 'medium',
        category: 'Authentication',
        title: 'Long-lived Password Reset Tokens',
        description: 'Password reset tokens with excessive expiration times detected',
        recommendation: 'Reduce password reset token lifetime to maximum 1 hour',
        status: 'open'
      });
    }

    return vulnerabilities;
  }

  // User Authentication Security Check
  private static async scanUserAuthentication(): Promise<IVulnerabilityReport[]> {
    const vulnerabilities: IVulnerabilityReport[] = [];

    // Check JWT secret strength
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.length < 32) {
      vulnerabilities.push({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        severity: 'critical',
        category: 'Authentication',
        title: 'Weak JWT Secret',
        description: 'JWT secret is too short or missing',
        recommendation: 'Use a JWT secret of at least 32 characters with high entropy',
        status: 'open'
      });
    }

    // Check for users without 2FA
    const totalUsers = await User.countDocuments({ active: true });
    const usersWithout2FA = await User.countDocuments({ 
      active: true, 
      twoFactorEnabled: { $ne: true } 
    });

    if (usersWithout2FA / totalUsers > 0.8) {
      vulnerabilities.push({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        severity: 'medium',
        category: 'Authentication',
        title: 'Low 2FA Adoption',
        description: `${Math.round((usersWithout2FA / totalUsers) * 100)}% of users don't have 2FA enabled`,
        recommendation: 'Implement 2FA enforcement for sensitive operations',
        status: 'open'
      });
    }

    // Check for locked accounts (potential brute force)
    const lockedAccounts = await User.countDocuments({
      lockUntil: { $gt: new Date() }
    });

    if (lockedAccounts > 10) {
      vulnerabilities.push({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        severity: 'high',
        category: 'Authentication',
        title: 'Multiple Account Lockouts',
        description: `${lockedAccounts} accounts are currently locked`,
        recommendation: 'Investigate potential brute force attacks and implement IP blocking',
        status: 'open'
      });
    }

    return vulnerabilities;
  }

  // Session Management Security Check
  private static async scanSessionManagement(): Promise<IVulnerabilityReport[]> {
    const vulnerabilities: IVulnerabilityReport[] = [];

    // Check session configuration
    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret || sessionSecret === 'fallback-secret') {
      vulnerabilities.push({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        severity: 'high',
        category: 'Session Management',
        title: 'Default or Weak Session Secret',
        description: 'Session secret is using default value or is weak',
        recommendation: 'Set a strong, unique SESSION_SECRET environment variable',
        status: 'open'
      });
    }

    // Check for overly long session durations
    // This would need to be checked against your session configuration

    return vulnerabilities;
  }

  // Input Validation Security Check
  private static async scanInputValidation(): Promise<IVulnerabilityReport[]> {
    const vulnerabilities: IVulnerabilityReport[] = [];

    // Check recent suspicious requests
    const suspiciousRequests = await SecurityAuditLog.countDocuments({
      type: 'SUSPICIOUS_REQUEST',
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (suspiciousRequests > 50) {
      vulnerabilities.push({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        severity: 'medium',
        category: 'Input Validation',
        title: 'High Volume of Suspicious Requests',
        description: `${suspiciousRequests} suspicious requests in the last 24 hours`,
        recommendation: 'Review input validation and implement additional filtering',
        status: 'open'
      });
    }

    return vulnerabilities;
  }

  // Data Encryption Security Check
  private static async scanDataEncryption(): Promise<IVulnerabilityReport[]> {
    const vulnerabilities: IVulnerabilityReport[] = [];

    // Check if HTTPS is enforced
    if (process.env.NODE_ENV === 'production' && !process.env.SSL_CERT_PATH) {
      vulnerabilities.push({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        severity: 'critical',
        category: 'Data Encryption',
        title: 'HTTPS Not Configured',
        description: 'SSL/TLS certificates not configured for production',
        recommendation: 'Configure SSL certificates and enforce HTTPS',
        status: 'open'
      });
    }

    // Check password hashing strength
    const bcryptRounds = process.env.BCRYPT_SALT_ROUNDS || '12';
    if (parseInt(bcryptRounds) < 12) {
      vulnerabilities.push({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        severity: 'medium',
        category: 'Data Encryption',
        title: 'Weak Password Hashing',
        description: 'Bcrypt salt rounds are below recommended minimum',
        recommendation: 'Increase BCRYPT_SALT_ROUNDS to at least 12',
        status: 'open'
      });
    }

    return vulnerabilities;
  }

  // Access Control Security Check
  private static async scanAccessControls(): Promise<IVulnerabilityReport[]> {
    const vulnerabilities: IVulnerabilityReport[] = [];

    // Check for privilege escalation attempts
    const escalationAttempts = await SecurityAuditLog.countDocuments({
      type: 'PRIVILEGE_ESCALATION_ATTEMPT',
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    if (escalationAttempts > 0) {
      vulnerabilities.push({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        severity: 'high',
        category: 'Access Control',
        title: 'Privilege Escalation Attempts',
        description: `${escalationAttempts} privilege escalation attempts in the last week`,
        recommendation: 'Review role-based access controls and audit admin access',
        status: 'open'
      });
    }

    // Check for users with admin privileges
    const adminUsers = await User.countDocuments({ role: 'admin', active: true });
    if (adminUsers > 5) {
      vulnerabilities.push({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        severity: 'medium',
        category: 'Access Control',
        title: 'Excessive Admin Privileges',
        description: `${adminUsers} users have admin privileges`,
        recommendation: 'Review and limit admin access to essential personnel only',
        status: 'open'
      });
    }

    return vulnerabilities;
  }

  // Rate Limiting Security Check
  private static async scanRateLimiting(): Promise<IVulnerabilityReport[]> {
    const vulnerabilities: IVulnerabilityReport[] = [];

    // Check for rate limit breaches
    const rateLimitBreaches = await SecurityAuditLog.countDocuments({
      type: 'RATE_LIMIT_EXCEEDED',
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (rateLimitBreaches > 1000) {
      vulnerabilities.push({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        severity: 'medium',
        category: 'Rate Limiting',
        title: 'High Rate Limit Violations',
        description: `${rateLimitBreaches} rate limit violations in the last 24 hours`,
        recommendation: 'Consider implementing stricter rate limits or IP blocking',
        status: 'open'
      });
    }

    return vulnerabilities;
  }

  // GDPR Compliance Security Check
  private static async scanGDPRCompliance(): Promise<IVulnerabilityReport[]> {
    const vulnerabilities: IVulnerabilityReport[] = [];

    // Check for users without consent records
    const usersWithoutConsent = await User.countDocuments({
      active: true,
      $or: [
        { gdprConsents: { $exists: false } },
        { gdprConsents: { $size: 0 } }
      ]
    });

    if (usersWithoutConsent > 0) {
      vulnerabilities.push({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        severity: 'high',
        category: 'GDPR Compliance',
        title: 'Missing Consent Records',
        description: `${usersWithoutConsent} users without valid consent records`,
        recommendation: 'Implement consent collection for all active users',
        status: 'open'
      });
    }

    // Check data retention compliance
    const oldUsers = await User.countDocuments({
      active: false,
      createdAt: { $lt: new Date(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000) },
      deletedAt: { $exists: false }
    });

    if (oldUsers > 0) {
      vulnerabilities.push({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        severity: 'medium',
        category: 'GDPR Compliance',
        title: 'Data Retention Violation',
        description: `${oldUsers} inactive users older than 7 years not anonymized`,
        recommendation: 'Implement automated data retention cleanup process',
        status: 'open'
      });
    }

    return vulnerabilities;
  }

  // Get vulnerability report
  static getVulnerabilityReport(): IVulnerabilityReport[] {
    return SecurityScanner.vulnerabilities;
  }

  // Mark vulnerability as fixed
  static markVulnerabilityFixed(vulnerabilityId: string): boolean {
    const vulnerability = SecurityScanner.vulnerabilities.find(v => v.id === vulnerabilityId);
    if (vulnerability) {
      vulnerability.status = 'fixed';
      return true;
    }
    return false;
  }

  // Security recommendations based on scan results
  static getSecurityRecommendations(): string[] {
    const vulnerabilities = SecurityScanner.vulnerabilities;
    const recommendations = new Set<string>();

    const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length;
    const highCount = vulnerabilities.filter(v => v.severity === 'high').length;

    if (criticalCount > 0) {
      recommendations.add('URGENT: Address critical security vulnerabilities immediately');
    }

    if (highCount > 0) {
      recommendations.add('High priority: Fix high-severity security issues within 24 hours');
    }

    // Category-specific recommendations
    const categories = [...new Set(vulnerabilities.map(v => v.category))];
    
    if (categories.includes('Authentication')) {
      recommendations.add('Strengthen authentication mechanisms and enforce 2FA');
    }

    if (categories.includes('GDPR Compliance')) {
      recommendations.add('Ensure GDPR compliance to avoid regulatory penalties');
    }

    if (categories.includes('Data Encryption')) {
      recommendations.add('Implement strong encryption for data at rest and in transit');
    }

    return Array.from(recommendations);
  }
}

export default SecurityScanner;
