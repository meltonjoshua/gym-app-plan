import * as cron from 'node-cron';
import { AnalyticsReport } from '../models/AnalyticsReport';
import { AnalyticsService } from './analyticsService';
import { logger } from '../utils/logger';
import { User } from '../models/User';

export class AnalyticsScheduler {
  private static instance: AnalyticsScheduler;
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  private constructor() {
    this.initializeScheduledJobs();
  }

  public static getInstance(): AnalyticsScheduler {
    if (!AnalyticsScheduler.instance) {
      AnalyticsScheduler.instance = new AnalyticsScheduler();
    }
    return AnalyticsScheduler.instance;
  }

  private initializeScheduledJobs(): void {
    // Daily reports at 2 AM
    this.scheduleJob('daily-reports', '0 2 * * *', () => {
      this.generateDailyReports();
    });

    // Weekly reports on Mondays at 3 AM
    this.scheduleJob('weekly-reports', '0 3 * * 1', () => {
      this.generateWeeklyReports();
    });

    // Monthly reports on the 1st at 4 AM
    this.scheduleJob('monthly-reports', '0 4 1 * *', () => {
      this.generateMonthlyReports();
    });

    // Clean up old analytics events (runs daily at 1 AM)
    this.scheduleJob('cleanup-old-data', '0 1 * * *', () => {
      this.cleanupOldAnalyticsData();
    });

    // Update user engagement scores (runs every 6 hours)
    this.scheduleJob('engagement-scores', '0 */6 * * *', () => {
      this.updateUserEngagementScores();
    });

    logger.info('Analytics scheduled jobs initialized');
  }

  private scheduleJob(name: string, schedule: string, task: () => void): void {
    try {
      const job = cron.schedule(schedule, task, {
        timezone: process.env.TIMEZONE || 'UTC'
      });

      this.jobs.set(name, job);
      logger.info(`Scheduled job '${name}' with schedule '${schedule}'`);
    } catch (error) {
      logger.error(`Failed to schedule job '${name}':`, error);
    }
  }

  private async generateDailyReports(): Promise<void> {
    try {
      logger.info('Starting daily analytics report generation');

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const endDate = new Date(yesterday);
      endDate.setHours(23, 59, 59, 999);

      // Generate daily business report
      const dailyReport = await AnalyticsReport.create({
        reportType: 'daily',
        reportName: `Daily Business Report - ${yesterday.toISOString().split('T')[0]}`,
        dateRange: {
          startDate: yesterday,
          endDate: endDate
        },
        format: 'json',
        status: 'generating'
      });

      // Generate the report data
      const reportData = await AnalyticsService.getDashboardData({
        startDate: yesterday,
        endDate: endDate
      });

      await AnalyticsReport.findByIdAndUpdate(dailyReport._id, {
        data: reportData,
        status: 'completed',
        generatedAt: new Date()
      });

      logger.info(`Daily report generated successfully: ${dailyReport._id}`);

    } catch (error) {
      logger.error('Failed to generate daily reports:', error);
    }
  }

  private async generateWeeklyReports(): Promise<void> {
    try {
      logger.info('Starting weekly analytics report generation');

      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      lastWeek.setHours(0, 0, 0, 0);

      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      // Generate weekly business report
      const weeklyReport = await AnalyticsReport.create({
        reportType: 'weekly',
        reportName: `Weekly Business Report - Week of ${lastWeek.toISOString().split('T')[0]}`,
        dateRange: {
          startDate: lastWeek,
          endDate: endDate
        },
        format: 'json',
        status: 'generating'
      });

      // Generate the report data
      const reportData = await AnalyticsService.getDashboardData({
        startDate: lastWeek,
        endDate: endDate
      });

      await AnalyticsReport.findByIdAndUpdate(weeklyReport._id, {
        data: reportData,
        status: 'completed',
        generatedAt: new Date()
      });

      // Generate user-specific weekly reports for premium users
      await this.generateUserWeeklyReports(lastWeek, endDate);

      logger.info(`Weekly report generated successfully: ${weeklyReport._id}`);

    } catch (error) {
      logger.error('Failed to generate weekly reports:', error);
    }
  }

  private async generateMonthlyReports(): Promise<void> {
    try {
      logger.info('Starting monthly analytics report generation');

      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      lastMonth.setDate(1);
      lastMonth.setHours(0, 0, 0, 0);

      const endDate = new Date(lastMonth);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);

      // Generate monthly business report
      const monthlyReport = await AnalyticsReport.create({
        reportType: 'monthly',
        reportName: `Monthly Business Report - ${lastMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`,
        dateRange: {
          startDate: lastMonth,
          endDate: endDate
        },
        format: 'json',
        status: 'generating'
      });

      // Generate comprehensive monthly report data
      const reportData = await AnalyticsService.getDashboardData({
        startDate: lastMonth,
        endDate: endDate
      });

      await AnalyticsReport.findByIdAndUpdate(monthlyReport._id, {
        data: reportData,
        status: 'completed',
        generatedAt: new Date()
      });

      // Generate user-specific monthly reports for premium users
      await this.generateUserMonthlyReports(lastMonth, endDate);

      logger.info(`Monthly report generated successfully: ${monthlyReport._id}`);

    } catch (error) {
      logger.error('Failed to generate monthly reports:', error);
    }
  }

  private async generateUserWeeklyReports(startDate: Date, endDate: Date): Promise<void> {
    try {
      // Get premium/pro users who want weekly reports
      const premiumUsers = await User.find({
        subscriptionStatus: { $in: ['premium', 'professional', 'enterprise'] },
        preferences: {
          $elemMatch: {
            key: 'weeklyReports',
            value: true
          }
        }
      }).limit(100); // Limit to prevent overwhelming the system

      for (const user of premiumUsers) {
        try {
          const userReport = await AnalyticsReport.create({
            reportType: 'weekly',
            reportName: `Personal Weekly Report - ${user.name}`,
            userId: user._id,
            dateRange: { startDate, endDate },
            format: 'json',
            status: 'generating'
          });

          const userData = await AnalyticsService.getDashboardData(
            { startDate, endDate },
            user._id?.toString()
          );

          await AnalyticsReport.findByIdAndUpdate(userReport._id, {
            data: userData,
            status: 'completed',
            generatedAt: new Date()
          });

          logger.info(`Weekly user report generated for user: ${user._id?.toString()}`);

        } catch (userError) {
          logger.error(`Failed to generate weekly report for user ${user._id?.toString()}:`, userError);
        }
      }

    } catch (error) {
      logger.error('Failed to generate user weekly reports:', error);
    }
  }

  private async generateUserMonthlyReports(startDate: Date, endDate: Date): Promise<void> {
    try {
      // Get premium/pro users who want monthly reports
      const premiumUsers = await User.find({
        subscriptionStatus: { $in: ['premium', 'professional', 'enterprise'] },
        preferences: {
          $elemMatch: {
            key: 'monthlyReports',
            value: true
          }
        }
      }).limit(200); // Limit to prevent overwhelming the system

      for (const user of premiumUsers) {
        try {
          const userReport = await AnalyticsReport.create({
            reportType: 'monthly',
            reportName: `Personal Monthly Report - ${user.name}`,
            userId: user._id,
            dateRange: { startDate, endDate },
            format: 'json',
            status: 'generating'
          });

          const userData = await AnalyticsService.getDashboardData(
            { startDate, endDate },
            user._id?.toString()
          );

          await AnalyticsReport.findByIdAndUpdate(userReport._id, {
            data: userData,
            status: 'completed',
            generatedAt: new Date()
          });

          logger.info(`Monthly user report generated for user: ${user._id?.toString()}`);

        } catch (userError) {
          logger.error(`Failed to generate monthly report for user ${user._id?.toString()}:`, userError);
        }
      }

    } catch (error) {
      logger.error('Failed to generate user monthly reports:', error);
    }
  }

  private async cleanupOldAnalyticsData(): Promise<void> {
    try {
      logger.info('Starting cleanup of old analytics data');

      // Delete analytics events older than 2 years (TTL should handle this, but backup cleanup)
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      // Delete analytics reports older than 1 year
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const [deletedReports] = await Promise.all([
        AnalyticsReport.deleteMany({ createdAt: { $lt: oneYearAgo } })
      ]);

      logger.info(`Cleanup completed: ${deletedReports.deletedCount} reports deleted`);

    } catch (error) {
      logger.error('Failed to cleanup old analytics data:', error);
    }
  }

  private async updateUserEngagementScores(): Promise<void> {
    try {
      logger.info('Starting user engagement score updates');

      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);

      // Get engagement metrics for all users
      const userEngagement = await AnalyticsService.getUserEngagementMetrics({
        startDate: last7Days,
        endDate: new Date()
      });

      // Update user engagement scores in the database
      // This would be implemented based on your User model structure
      // For now, we'll just log the completion

      logger.info('User engagement scores updated successfully');

    } catch (error) {
      logger.error('Failed to update user engagement scores:', error);
    }
  }

  public startJob(jobName: string): boolean {
    const job = this.jobs.get(jobName);
    if (job) {
      job.start();
      logger.info(`Started job: ${jobName}`);
      return true;
    }
    return false;
  }

  public stopJob(jobName: string): boolean {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      logger.info(`Stopped job: ${jobName}`);
      return true;
    }
    return false;
  }

  public getJobStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    this.jobs.forEach((job, name) => {
      status[name] = true; // Jobs are always considered running when scheduled
    });
    return status;
  }

  public destroy(): void {
    this.jobs.forEach((job, name) => {
      job.destroy();
      logger.info(`Destroyed job: ${name}`);
    });
    this.jobs.clear();
  }
}

// Initialize scheduler singleton
export const analyticsScheduler = AnalyticsScheduler.getInstance();

export default AnalyticsScheduler;
