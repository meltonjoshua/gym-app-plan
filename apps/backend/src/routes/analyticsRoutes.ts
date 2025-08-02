import express from 'express';
import { 
  getAnalyticsDashboard,
  getUserAnalytics,
  generateReport,
  getReport,
  getReports,
  getRealTimeAnalytics
} from '../controllers/analyticsController';
import { authenticate as protect, restrictTo } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for analytics endpoints
const analyticsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many analytics requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all analytics routes
router.use(analyticsRateLimit);

// Validation schemas
const reportGenerationValidation = [
  body('reportType')
    .isIn(['daily', 'weekly', 'monthly', 'custom'])
    .withMessage('Invalid report type'),
  body('dateRange.startDate')
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('dateRange.endDate')
    .isISO8601()
    .withMessage('Invalid end date format'),
  body('format')
    .optional()
    .isIn(['json', 'csv', 'pdf'])
    .withMessage('Invalid format'),
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
];

const userAnalyticsValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  query('period')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Invalid period'),
];

const dashboardValidation = [
  query('period')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Invalid period'),
  query('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
];

const reportIdValidation = [
  param('reportId')
    .isMongoId()
    .withMessage('Invalid report ID'),
];

// Public analytics endpoints (require authentication)
router.use(protect); // All routes require authentication

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get analytics dashboard data
 * @access  Private (User can see their own data, Admin can see all)
 */
router.get(
  '/dashboard',
  dashboardValidation,
  validateRequest,
  getAnalyticsDashboard
);

/**
 * @route   GET /api/analytics/users/:userId
 * @desc    Get user-specific analytics
 * @access  Private (User can see their own data, Admin can see any user)
 */
router.get(
  '/users/:userId',
  userAnalyticsValidation,
  validateRequest,
  getUserAnalytics
);

/**
 * @route   GET /api/analytics/realtime
 * @desc    Get real-time analytics data
 * @access  Admin only
 */
router.get(
  '/realtime',
  restrictTo('admin'),
  getRealTimeAnalytics
);

// Report management endpoints
/**
 * @route   POST /api/analytics/reports
 * @desc    Generate a new analytics report
 * @access  Admin only
 */
router.post(
  '/reports',
  restrictTo('admin'),
  reportGenerationValidation,
  validateRequest,
  generateReport
);

/**
 * @route   GET /api/analytics/reports
 * @desc    Get list of analytics reports
 * @access  Admin only
 */
router.get(
  '/reports',
  restrictTo('admin'),
  getReports
);

/**
 * @route   GET /api/analytics/reports/:reportId
 * @desc    Get specific analytics report
 * @access  Admin only
 */
router.get(
  '/reports/:reportId',
  restrictTo('admin'),
  reportIdValidation,
  validateRequest,
  getReport
);

// Advanced analytics endpoints (Admin only)
/**
 * @route   GET /api/analytics/cohort-analysis
 * @desc    Get cohort analysis data
 * @access  Admin only
 */
router.get(
  '/cohort-analysis',
  restrictTo('admin'),
  async (req, res) => {
    // TODO: Implement cohort analysis
    res.json({
      success: true,
      message: 'Cohort analysis endpoint - Coming soon in Phase 12.3'
    });
  }
);

/**
 * @route   GET /api/analytics/retention
 * @desc    Get user retention analytics
 * @access  Admin only
 */
router.get(
  '/retention',
  restrictTo('admin'),
  async (req, res) => {
    // TODO: Implement retention analysis
    res.json({
      success: true,
      message: 'Retention analysis endpoint - Coming soon in Phase 12.3'
    });
  }
);

/**
 * @route   GET /api/analytics/revenue
 * @desc    Get revenue analytics
 * @access  Admin only
 */
router.get(
  '/revenue',
  restrictTo('admin'),
  async (req, res) => {
    // TODO: Implement revenue analytics
    res.json({
      success: true,
      message: 'Revenue analytics endpoint - Coming soon in Phase 12.3'
    });
  }
);

/**
 * @route   GET /api/analytics/funnel
 * @desc    Get conversion funnel analytics
 * @access  Admin only
 */
router.get(
  '/funnel',
  restrictTo('admin'),
  async (req, res) => {
    // TODO: Implement funnel analysis
    res.json({
      success: true,
      message: 'Funnel analysis endpoint - Coming soon in Phase 12.3'
    });
  }
);

export { router as analyticsRoutes };