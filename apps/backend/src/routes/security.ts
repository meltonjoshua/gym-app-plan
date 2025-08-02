import { Router, Request, Response } from 'express';
import SecurityMiddleware from '../middleware/security';
import GDPRCompliance from '../middleware/gdpr';
import { SecurityAuditLog } from '../models/SecurityAuditLog';
import { User } from '../models/User';
import crypto from 'crypto';

const router = Router();

// Security Endpoints

// Enable Two-Factor Authentication
router.post('/auth/2fa/enable', 
  SecurityMiddleware.verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!._id;
      const { verificationCode } = req.body;

      if (!verificationCode) {
        return res.status(400).json({ error: 'Verification code required' });
      }

      const user = await User.findById(userId).select('+twoFactorSecret');
      if (!user || !user.twoFactorSecret) {
        return res.status(400).json({ error: 'Two-factor setup not initiated' });
      }

      const isValid = SecurityMiddleware.verify2FA(verificationCode, user.twoFactorSecret);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid verification code' });
      }

      await User.findByIdAndUpdate(userId, { twoFactorEnabled: true });

      await SecurityMiddleware.logSecurityEvent({
        type: 'ENABLE_2FA',
        userId,
        ip: req.ip,
        timestamp: new Date(),
      });

      res.json({ message: 'Two-factor authentication enabled successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to enable 2FA' });
    }
  }
);

// Generate 2FA Secret
router.post('/auth/2fa/setup',
  SecurityMiddleware.verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!._id;
      const email = req.user!.email;

      const setup = await SecurityMiddleware.generate2FASecret(userId, email);
      
      res.json({
        secret: setup.secret,
        qrCode: setup.qrCode,
        manualEntryKey: setup.manualEntryKey
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to setup 2FA' });
    }
  }
);

// Disable Two-Factor Authentication
router.post('/auth/2fa/disable',
  SecurityMiddleware.verifyToken,
  SecurityMiddleware.require2FA,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!._id;
      const { password } = req.body;

      // Verify password before disabling 2FA
      const user = await User.findById(userId).select('+password');
      if (!user || !(await user.correctPassword(password, user.password))) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      await User.findByIdAndUpdate(userId, { 
        twoFactorEnabled: false,
        twoFactorSecret: undefined
      });

      await SecurityMiddleware.logSecurityEvent({
        type: 'DISABLE_2FA',
        userId,
        ip: req.ip,
        timestamp: new Date(),
      });

      res.json({ message: 'Two-factor authentication disabled' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to disable 2FA' });
    }
  }
);

// Security Audit Endpoints

// Get Security Audit Logs (Admin only)
router.get('/security/audit-logs',
  SecurityMiddleware.verifyToken,
  SecurityMiddleware.requireRole(['admin']),
  async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 50, type, severity, startDate, endDate } = req.query;
      
      const filter: any = {};
      if (type) filter.type = type;
      if (severity) filter.severity = severity;
      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) filter.timestamp.$gte = new Date(startDate as string);
        if (endDate) filter.timestamp.$lte = new Date(endDate as string);
      }

      const logs = await SecurityAuditLog.find(filter)
        .sort({ timestamp: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await SecurityAuditLog.countDocuments(filter);

      res.json({
        logs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  }
);

// Security Dashboard Stats (Admin only)
router.get('/security/dashboard',
  SecurityMiddleware.verifyToken,
  SecurityMiddleware.requireRole(['admin']),
  async (req: Request, res: Response) => {
    try {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [
        totalUsers,
        activeUsers,
        twoFactorUsers,
        recentFailedLogins,
        rateLimitEvents,
        suspiciousActivity
      ] = await Promise.all([
        User.countDocuments({ active: true }),
        User.countDocuments({ lastLogin: { $gte: last7days } }),
        User.countDocuments({ twoFactorEnabled: true }),
        SecurityAuditLog.countDocuments({ 
          type: 'TOKEN_VERIFICATION_FAILED',
          timestamp: { $gte: last24h }
        }),
        SecurityAuditLog.countDocuments({
          type: 'RATE_LIMIT_EXCEEDED',
          timestamp: { $gte: last24h }
        }),
        SecurityAuditLog.countDocuments({
          type: 'SUSPICIOUS_REQUEST',
          timestamp: { $gte: last24h }
        })
      ]);

      const securityScore = Math.max(0, 100 - (recentFailedLogins * 2) - (rateLimitEvents * 1) - (suspiciousActivity * 5));

      res.json({
        overview: {
          totalUsers,
          activeUsers,
          twoFactorUsers,
          twoFactorAdoption: totalUsers > 0 ? Math.round((twoFactorUsers / totalUsers) * 100) : 0,
          securityScore
        },
        alerts: {
          recentFailedLogins,
          rateLimitEvents,
          suspiciousActivity
        },
        recommendations: [
          ...(twoFactorUsers / totalUsers < 0.5 ? ['Encourage more users to enable 2FA'] : []),
          ...(recentFailedLogins > 10 ? ['High number of failed login attempts detected'] : []),
          ...(rateLimitEvents > 50 ? ['Consider implementing stricter rate limiting'] : [])
        ]
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch security dashboard' });
    }
  }
);

// GDPR Compliance Endpoints

// Record User Consent
router.post('/gdpr/consent',
  SecurityMiddleware.verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!._id;
      const { essential, analytics, marketing, preferences } = req.body;

      const consent = {
        essential: essential !== false, // Essential is required
        analytics: Boolean(analytics),
        marketing: Boolean(marketing),
        preferences: Boolean(preferences),
        timestamp: new Date(),
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        version: '1.0'
      };

      await GDPRCompliance.recordConsent(userId, consent);

      res.json({ message: 'Consent recorded successfully', consent });
    } catch (error) {
      res.status(500).json({ error: 'Failed to record consent' });
    }
  }
);

// Get Current Consent Status
router.get('/gdpr/consent',
  SecurityMiddleware.verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!._id;
      const consent = await GDPRCompliance.getLatestConsent(userId);

      res.json({ consent });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch consent status' });
    }
  }
);

// Data Access Request (Right to Access)
router.post('/gdpr/data-access',
  SecurityMiddleware.verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!._id;
      const requestId = crypto.randomUUID();

      const data = await GDPRCompliance.handleDataAccessRequest(userId, requestId);

      res.json({
        message: 'Data access request processed',
        requestId,
        data
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process data access request' });
    }
  }
);

// Data Portability Request (Right to Data Portability)
router.post('/gdpr/data-export',
  SecurityMiddleware.verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!._id;
      
      const portableData = await GDPRCompliance.handleDataPortabilityRequest(userId);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=fittracker-data-${userId}-${Date.now()}.json`);
      res.json(portableData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to export data' });
    }
  }
);

// Data Rectification Request (Right to Rectification)
router.post('/gdpr/data-rectification',
  SecurityMiddleware.verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!._id;
      const updates = req.body;

      await GDPRCompliance.handleDataRectificationRequest(userId, updates);

      res.json({ message: 'Data rectification completed' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to rectify data' });
    }
  }
);

// Data Deletion Request (Right to Erasure)
router.post('/gdpr/data-deletion',
  SecurityMiddleware.verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!._id;
      const requestId = crypto.randomUUID();

      await GDPRCompliance.handleDataDeletionRequest(userId, requestId);

      res.json({ 
        message: 'Data deletion request processed',
        requestId,
        note: 'Your account will be anonymized. This action cannot be undone.'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process deletion request' });
    }
  }
);

// Privacy Policy and Terms Endpoints
router.get('/legal/privacy-policy', (req: Request, res: Response) => {
  res.json({
    version: '2.0',
    lastUpdated: '2025-08-02',
    content: {
      introduction: 'FitTracker Pro is committed to protecting your privacy and ensuring compliance with GDPR.',
      dataCollection: 'We collect personal data necessary for providing our fitness tracking services.',
      dataUsage: 'Your data is used to provide personalized workout recommendations and track your progress.',
      dataSharing: 'We do not share your personal data with third parties without your explicit consent.',
      dataRetention: 'We retain your data for as long as necessary to provide our services.',
      yourRights: [
        'Right to access your personal data',
        'Right to rectify inaccurate data',
        'Right to erase your data',
        'Right to data portability',
        'Right to object to processing',
        'Right to withdraw consent'
      ],
      contact: 'privacy@fittracker.app'
    }
  });
});

router.get('/legal/terms-of-service', (req: Request, res: Response) => {
  res.json({
    version: '2.0',
    lastUpdated: '2025-08-02',
    content: {
      acceptance: 'By using FitTracker Pro, you agree to these terms.',
      serviceDescription: 'FitTracker Pro provides AI-powered fitness tracking and workout recommendations.',
      userResponsibilities: 'Users are responsible for maintaining account security and accurate health information.',
      dataPolicy: 'Refer to our Privacy Policy for data handling practices.',
      termination: 'Either party may terminate the agreement with proper notice.',
      liability: 'FitTracker Pro is not liable for fitness-related injuries.',
      contact: 'legal@fittracker.app'
    }
  });
});

export default router;
