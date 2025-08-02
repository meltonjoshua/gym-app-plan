import { apiClient } from '../config/api';

export interface AnalyticsEventData {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export interface AnalyticsTimeRange {
  startDate: Date;
  endDate: Date;
}

export interface AnalyticsFilters {
  timeRange?: AnalyticsTimeRange;
  categories?: string[];
  actions?: string[];
  userId?: string;
}

export interface DashboardData {
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  engagement: {
    averageSessionDuration: number;
    screenViews: Record<string, number>;
    featureUsage: Record<string, number>;
  };
  workouts: {
    totalCompleted: number;
    averageDuration: number;
    popularExercises: Array<{
      name: string;
      count: number;
    }>;
  };
  nutrition: {
    mealsLogged: number;
    averageCalories: number;
    goalAchievementRate: number;
  };
  revenue: {
    totalRevenue: number;
    subscriptions: {
      active: number;
      new: number;
      churned: number;
    };
  };
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  includeCharts: boolean;
  dateRange: AnalyticsTimeRange;
  metrics: string[];
}

class AnalyticsAPI {
  // Event Tracking
  async trackEvent(eventData: AnalyticsEventData): Promise<void> {
    try {
      await apiClient.post('/analytics/events', eventData);
    } catch (error) {
      console.error('Error tracking event:', error);
      throw error;
    }
  }

  async trackBatchEvents(events: AnalyticsEventData[]): Promise<void> {
    try {
      await apiClient.post('/analytics/events/batch', { events });
    } catch (error) {
      console.error('Error tracking batch events:', error);
      throw error;
    }
  }

  async trackScreenView(screenName: string, metadata?: Record<string, any>): Promise<void> {
    return this.trackEvent({
      category: 'navigation',
      action: 'screen_view',
      label: screenName,
      metadata,
    });
  }

  async trackUserAction(action: string, label?: string, value?: number, metadata?: Record<string, any>): Promise<void> {
    return this.trackEvent({
      category: 'user_action',
      action,
      label,
      value,
      metadata,
    });
  }

  async trackWorkout(workoutData: {
    workoutId: string;
    duration: number;
    exercises: string[];
    calories?: number;
    intensity?: number;
  }): Promise<void> {
    return this.trackEvent({
      category: 'workout',
      action: 'completed',
      label: workoutData.workoutId,
      value: workoutData.duration,
      metadata: workoutData,
    });
  }

  async trackNutrition(nutritionData: {
    mealId?: string;
    mealType: string;
    calories: number;
    macros?: {
      protein: number;
      carbs: number;
      fat: number;
    };
  }): Promise<void> {
    return this.trackEvent({
      category: 'nutrition',
      action: 'meal_logged',
      label: nutritionData.mealType,
      value: nutritionData.calories,
      metadata: nutritionData,
    });
  }

  // Analytics Data Retrieval
  async getUserEngagement(userId: string, filters?: AnalyticsFilters): Promise<any> {
    try {
      const response = await apiClient.get(`/analytics/users/${userId}/engagement`, {
        params: this.formatFilters(filters),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user engagement:', error);
      throw error;
    }
  }

  async getWorkoutAnalytics(userId: string, period: string = '30d'): Promise<any> {
    try {
      const response = await apiClient.get(`/analytics/users/${userId}/workouts`, {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching workout analytics:', error);
      throw error;
    }
  }

  async getNutritionAnalytics(userId: string, period: string = '30d'): Promise<any> {
    try {
      const response = await apiClient.get(`/analytics/users/${userId}/nutrition`, {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching nutrition analytics:', error);
      throw error;
    }
  }

  async getProgressAnalytics(userId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/analytics/users/${userId}/progress`);
      return response.data;
    } catch (error) {
      console.error('Error fetching progress analytics:', error);
      throw error;
    }
  }

  async getPremiumAnalytics(userId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/analytics/users/${userId}/premium`);
      return response.data;
    } catch (error) {
      console.error('Error fetching premium analytics:', error);
      throw error;
    }
  }

  // Dashboard & Admin Analytics
  async getDashboardData(filters?: AnalyticsFilters): Promise<DashboardData> {
    try {
      const response = await apiClient.get('/analytics/dashboard', {
        params: this.formatFilters(filters),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  async getBusinessMetrics(filters?: AnalyticsFilters): Promise<any> {
    try {
      const response = await apiClient.get('/analytics/business', {
        params: this.formatFilters(filters),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching business metrics:', error);
      throw error;
    }
  }

  async getCohortAnalysis(period: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<any> {
    try {
      const response = await apiClient.get('/analytics/cohorts', {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cohort analysis:', error);
      throw error;
    }
  }

  async getRetentionMetrics(period: string = '30d'): Promise<any> {
    try {
      const response = await apiClient.get('/analytics/retention', {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching retention metrics:', error);
      throw error;
    }
  }

  async getRevenueAnalytics(filters?: AnalyticsFilters): Promise<any> {
    try {
      const response = await apiClient.get('/analytics/revenue', {
        params: this.formatFilters(filters),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw error;
    }
  }

  // Feature Usage Analytics
  async getFeatureUsage(feature?: string, filters?: AnalyticsFilters): Promise<any> {
    try {
      const response = await apiClient.get('/analytics/features', {
        params: {
          feature,
          ...this.formatFilters(filters),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching feature usage:', error);
      throw error;
    }
  }

  async getPerformanceMetrics(filters?: AnalyticsFilters): Promise<any> {
    try {
      const response = await apiClient.get('/analytics/performance', {
        params: this.formatFilters(filters),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw error;
    }
  }

  async getErrorAnalytics(filters?: AnalyticsFilters): Promise<any> {
    try {
      const response = await apiClient.get('/analytics/errors', {
        params: this.formatFilters(filters),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching error analytics:', error);
      throw error;
    }
  }

  // AI & Machine Learning Analytics
  async getAIRecommendations(userId: string, type?: string): Promise<any> {
    try {
      const response = await apiClient.get(`/analytics/ai/recommendations/${userId}`, {
        params: { type },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      throw error;
    }
  }

  async getPersonalizedInsights(userId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/analytics/ai/insights/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching personalized insights:', error);
      throw error;
    }
  }

  async getPredictiveAnalytics(userId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/analytics/ai/predictions/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching predictive analytics:', error);
      throw error;
    }
  }

  async getAnomalyDetection(userId: string, metric: string): Promise<any> {
    try {
      const response = await apiClient.get(`/analytics/ai/anomalies/${userId}`, {
        params: { metric },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching anomaly detection:', error);
      throw error;
    }
  }

  // Real-time Analytics
  async getRealTimeMetrics(): Promise<any> {
    try {
      const response = await apiClient.get('/analytics/realtime');
      return response.data;
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      throw error;
    }
  }

  async getLiveUserActivity(): Promise<any> {
    try {
      const response = await apiClient.get('/analytics/realtime/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching live user activity:', error);
      throw error;
    }
  }

  // A/B Testing Analytics
  async getABTestResults(testId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/analytics/ab-tests/${testId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching A/B test results:', error);
      throw error;
    }
  }

  async getAllABTests(status?: 'active' | 'completed' | 'draft'): Promise<any> {
    try {
      const response = await apiClient.get('/analytics/ab-tests', {
        params: { status },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching A/B tests:', error);
      throw error;
    }
  }

  // Export & Reporting
  async exportAnalytics(options: ExportOptions): Promise<any> {
    try {
      const response = await apiClient.post('/analytics/export', options);
      return response.data;
    } catch (error) {
      console.error('Error exporting analytics:', error);
      throw error;
    }
  }

  async generateReport(reportType: string, options: any): Promise<any> {
    try {
      const response = await apiClient.post(`/analytics/reports/${reportType}`, options);
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  async scheduleReport(reportConfig: {
    type: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    filters?: AnalyticsFilters;
  }): Promise<any> {
    try {
      const response = await apiClient.post('/analytics/reports/schedule', reportConfig);
      return response.data;
    } catch (error) {
      console.error('Error scheduling report:', error);
      throw error;
    }
  }

  // Custom Analytics
  async createCustomMetric(metricDefinition: {
    name: string;
    description: string;
    formula: string;
    categories: string[];
  }): Promise<any> {
    try {
      const response = await apiClient.post('/analytics/custom-metrics', metricDefinition);
      return response.data;
    } catch (error) {
      console.error('Error creating custom metric:', error);
      throw error;
    }
  }

  async getCustomMetric(metricId: string, filters?: AnalyticsFilters): Promise<any> {
    try {
      const response = await apiClient.get(`/analytics/custom-metrics/${metricId}`, {
        params: this.formatFilters(filters),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching custom metric:', error);
      throw error;
    }
  }

  async createDashboard(dashboardConfig: {
    name: string;
    description: string;
    widgets: Array<{
      type: string;
      config: any;
      position: { x: number; y: number; width: number; height: number };
    }>;
  }): Promise<any> {
    try {
      const response = await apiClient.post('/analytics/dashboards', dashboardConfig);
      return response.data;
    } catch (error) {
      console.error('Error creating dashboard:', error);
      throw error;
    }
  }

  async getDashboard(dashboardId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/analytics/dashboards/${dashboardId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  }

  // Utility Methods
  private formatFilters(filters?: AnalyticsFilters): any {
    if (!filters) return {};

    const params: any = {};

    if (filters.timeRange) {
      params.startDate = filters.timeRange.startDate.toISOString();
      params.endDate = filters.timeRange.endDate.toISOString();
    }

    if (filters.categories && filters.categories.length > 0) {
      params.categories = filters.categories.join(',');
    }

    if (filters.actions && filters.actions.length > 0) {
      params.actions = filters.actions.join(',');
    }

    if (filters.userId) {
      params.userId = filters.userId;
    }

    return params;
  }

  // A/B Testing Management
  async createABTest(testData: any): Promise<any> {
    try {
      const response = await apiClient.post('/analytics/ab-tests/create', testData);
      return response.data;
    } catch (error) {
      console.error('Error creating A/B test:', error);
      throw error;
    }
  }

  async updateABTest(testId: string, testData: any): Promise<any> {
    try {
      const response = await apiClient.put(`/analytics/ab-tests/${testId}`, testData);
      return response.data;
    } catch (error) {
      console.error('Error updating A/B test:', error);
      throw error;
    }
  }

  async pauseABTest(testId: string): Promise<any> {
    try {
      const response = await apiClient.post(`/analytics/ab-tests/${testId}/pause`);
      return response.data;
    } catch (error) {
      console.error('Error pausing A/B test:', error);
      throw error;
    }
  }

  async resumeABTest(testId: string): Promise<any> {
    try {
      const response = await apiClient.post(`/analytics/ab-tests/${testId}/resume`);
      return response.data;
    } catch (error) {
      console.error('Error resuming A/B test:', error);
      throw error;
    }
  }

  async concludeABTest(testId: string): Promise<any> {
    try {
      const response = await apiClient.post(`/analytics/ab-tests/${testId}/conclude`);
      return response.data;
    } catch (error) {
      console.error('Error concluding A/B test:', error);
      throw error;
    }
  }

  // Automated Reports Management
  async getAutomatedReports(type?: string): Promise<any> {
    try {
      const response = await apiClient.get('/analytics/reports/automated', {
        params: { type },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching automated reports:', error);
      throw error;
    }
  }

  async getReportDetails(reportId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/analytics/reports/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report details:', error);
      throw error;
    }
  }

  async createReport(reportData: any): Promise<any> {
    try {
      const response = await apiClient.post('/analytics/reports/create', reportData);
      return response.data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }

  async updateReport(reportId: string, reportData: any): Promise<any> {
    try {
      const response = await apiClient.put(`/analytics/reports/${reportId}`, reportData);
      return response.data;
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  }

  async updateReportStatus(reportId: string, status: string): Promise<any> {
    try {
      const response = await apiClient.put(`/analytics/reports/${reportId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
  }

  async runReportNow(reportId: string): Promise<any> {
    try {
      const response = await apiClient.post(`/analytics/reports/${reportId}/run`);
      return response.data;
    } catch (error) {
      console.error('Error running report:', error);
      throw error;
    }
  }

  async getReportHistory(reportId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/analytics/reports/${reportId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report history:', error);
      throw error;
    }
  }

  async getReportPreview(): Promise<any> {
    try {
      const response = await apiClient.get('/analytics/reports/preview');
      return response.data;
    } catch (error) {
      console.error('Error fetching report preview:', error);
      throw error;
    }
  }

  // Enhanced Business Intelligence
  async getEnhancedBusinessMetrics(period: string = 'week'): Promise<any> {
    try {
      const response = await apiClient.get('/analytics/business/enhanced', {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching enhanced business metrics:', error);
      throw error;
    }
  }

  async getSubscriptionMetrics(): Promise<any> {
    try {
      const response = await apiClient.get('/analytics/business/subscriptions');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription metrics:', error);
      throw error;
    }
  }

  async getEngagementMetrics(period: string = 'week'): Promise<any> {
    try {
      const response = await apiClient.get('/analytics/business/engagement', {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching engagement metrics:', error);
      throw error;
    }
  }

  // Enhanced Cohort Analysis
  async getCohortData(period: string = 'weekly'): Promise<any> {
    try {
      const response = await apiClient.get('/analytics/cohorts/data', {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cohort data:', error);
      throw error;
    }
  }

  async getCohortRetention(cohortId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/analytics/cohorts/${cohortId}/retention`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cohort retention:', error);
      throw error;
    }
  }

  async getCohortInsights(): Promise<any> {
    try {
      const response = await apiClient.get('/analytics/cohorts/insights');
      return response.data;
    } catch (error) {
      console.error('Error fetching cohort insights:', error);
      throw error;
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: Date }> {
    try {
      const response = await apiClient.get('/analytics/health');
      return response.data;
    } catch (error) {
      console.error('Analytics service health check failed:', error);
      throw error;
    }
  }

  // Version Info
  async getVersion(): Promise<{ version: string; buildDate: string }> {
    try {
      const response = await apiClient.get('/analytics/version');
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics service version:', error);
      throw error;
    }
  }
}

export default new AnalyticsAPI();
