import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== COMPREHENSIVE ERROR LOGGING SYSTEM =====
// Track, categorize, and analyze all application errors

export interface ErrorLog {
  id: string;
  timestamp: Date;
  type: ErrorType;
  severity: ErrorSeverity;
  source: ErrorSource;
  message: string;
  stack?: string;
  context: ErrorContext;
  userAgent?: string;
  userId?: string;
  sessionId: string;
  buildVersion: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  tags: string[];
}

export type ErrorType = 
  | 'typescript' | 'runtime' | 'network' | 'camera' | 'storage' 
  | 'ai_model' | 'form_analysis' | 'nutrition' | 'sleep' 
  | 'analytics' | 'ui' | 'performance'
  | 'auth' | 'payment' | 'sync' | 'security';

export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type ErrorSource = 
  | 'computer_vision' | 'form_analysis' | 'nutrition_ai' | 'sleep_ai'
  | 'analytics' | 'recovery_engine' | 'user_segmentation'
  | 'camera_component' | 'dashboard' | 'navigation' | 'storage'
  | 'network' | 'auth' | 'payments' | 'ui_component' | 'unknown'
  | 'tensorflow' | 'permissions';

export interface ErrorContext {
  component?: string;
  function?: string;
  line?: number;
  file?: string;
  userAction?: string;
  deviceInfo?: DeviceInfo;
  appState?: AppState;
  networkState?: NetworkState;
  memoryUsage?: number;
  additionalData?: Record<string, any>;
}

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  osVersion: string;
  deviceModel: string;
  appVersion: string;
  buildNumber: string;
  isDebug: boolean;
}

export interface AppState {
  activeScreen: string;
  userLoggedIn: boolean;
  currentWorkout?: string;
  analysisRunning: boolean;
  backgroundProcesses: string[];
}

export interface NetworkState {
  isConnected: boolean;
  connectionType: string;
  isWifiEnabled: boolean;
  isCellularEnabled: boolean;
}

export interface ErrorPattern {
  type: ErrorType;
  commonMessages: string[];
  frequency: number;
  firstSeen: Date;
  lastSeen: Date;
  affectedUsers: number;
  resolved: boolean;
  solutions: ErrorSolution[];
}

export interface ErrorSolution {
  description: string;
  implementation: string;
  success_rate: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  dependencies: string[];
}

export interface ErrorReport {
  summary: ErrorSummary;
  criticalErrors: ErrorLog[];
  errorPatterns: ErrorPattern[];
  recommendations: ErrorRecommendation[];
  trends: ErrorTrend[];
  performance: ErrorPerformanceMetrics;
}

export interface ErrorSummary {
  totalErrors: number;
  newErrors: number;
  resolvedErrors: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  topErrorTypes: Array<{ type: ErrorType; count: number }>;
  topErrorSources: Array<{ source: ErrorSource; count: number }>;
}

export interface ErrorRecommendation {
  priority: number;
  title: string;
  description: string;
  implementation: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  errorTypes: ErrorType[];
}

export interface ErrorTrend {
  period: string;
  errorCount: number;
  resolvedCount: number;
  newErrorTypes: ErrorType[];
  improvementAreas: string[];
}

export interface ErrorPerformanceMetrics {
  averageResolutionTime: number; // hours
  resolutionRate: number; // percentage
  recurringErrorRate: number; // percentage
  userImpactScore: number; // 0-100
  stabilityScore: number; // 0-100
}

class ErrorLogger {
  private errorLogs: Map<string, ErrorLog> = new Map();
  private sessionId: string;
  private buildVersion: string;
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private isInitialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.buildVersion = '1.0.0'; // Would come from app config
  }

  async initialize(): Promise<void> {
    try {
      await this.loadStoredErrors();
      await this.loadErrorPatterns();
      this.setupGlobalErrorHandlers();
      this.isInitialized = true;
      console.log('Error Logger initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Error Logger:', error);
    }
  }

  // ===== ERROR LOGGING =====

  async logError(
    type: ErrorType,
    severity: ErrorSeverity,
    source: ErrorSource,
    message: string,
    context: Partial<ErrorContext> = {},
    stack?: string
  ): Promise<string> {
    const errorId = this.generateErrorId();
    
    const errorLog: ErrorLog = {
      id: errorId,
      timestamp: new Date(),
      type,
      severity,
      source,
      message,
      stack,
      context: await this.enrichContext(context),
      sessionId: this.sessionId,
      buildVersion: this.buildVersion,
      resolved: false,
      tags: this.generateTags(type, source, message)
    };

    this.errorLogs.set(errorId, errorLog);
    await this.saveErrorToStorage(errorLog);
    await this.updateErrorPattern(errorLog);
    
    // Send critical errors immediately
    if (severity === 'critical') {
      await this.sendCriticalErrorAlert(errorLog);
    }

    console.error(`[${severity.toUpperCase()}] ${source}: ${message}`, {
      errorId,
      context,
      stack
    });

    return errorId;
  }

  async logTypeScriptError(filePath: string, line: number, message: string): Promise<string> {
    return this.logError(
      'typescript',
      'high',
      this.determineSourceFromFile(filePath),
      message,
      {
        file: filePath,
        line,
        function: 'typescript_compilation'
      }
    );
  }

  async logRuntimeError(error: Error, source: ErrorSource, context: Partial<ErrorContext> = {}): Promise<string> {
    return this.logError(
      'runtime',
      'high',
      source,
      error.message,
      {
        ...context,
        function: context.function || 'runtime_error'
      },
      error.stack
    );
  }

  async logAIError(aiService: string, operation: string, error: Error): Promise<string> {
    const source = this.mapAIServiceToSource(aiService);
    return this.logError(
      'ai_model',
      'medium',
      source,
      `${aiService} ${operation}: ${error.message}`,
      {
        component: aiService,
        function: operation,
        additionalData: { aiService, operation }
      },
      error.stack
    );
  }

  async logNetworkError(url: string, status: number, message: string): Promise<string> {
    return this.logError(
      'network',
      status >= 500 ? 'high' : 'medium',
      'network',
      `Network request failed: ${status} ${message}`,
      {
        function: 'network_request',
        additionalData: { url, status, message }
      }
    );
  }

  async logCameraError(operation: string, error: Error): Promise<string> {
    return this.logError(
      'camera',
      'high',
      'camera_component',
      `Camera ${operation}: ${error.message}`,
      {
        component: 'CameraView',
        function: operation,
        additionalData: { operation }
      },
      error.stack
    );
  }

  // ===== ERROR ANALYSIS =====

  async generateErrorReport(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<ErrorReport> {
    const cutoffDate = this.getCutoffDate(timeframe);
    const recentErrors = Array.from(this.errorLogs.values())
      .filter(error => error.timestamp >= cutoffDate);

    const summary = this.generateSummary(recentErrors);
    const criticalErrors = recentErrors.filter(e => e.severity === 'critical');
    const patterns = await this.analyzeErrorPatterns(recentErrors);
    const recommendations = this.generateRecommendations(patterns, summary);
    const trends = this.analyzeTrends(recentErrors, timeframe);
    const performance = this.calculatePerformanceMetrics(recentErrors);

    return {
      summary,
      criticalErrors,
      errorPatterns: Array.from(patterns.values()),
      recommendations,
      trends,
      performance
    };
  }

  async getErrorsByType(type: ErrorType): Promise<ErrorLog[]> {
    return Array.from(this.errorLogs.values())
      .filter(error => error.type === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getErrorsBySource(source: ErrorSource): Promise<ErrorLog[]> {
    return Array.from(this.errorLogs.values())
      .filter(error => error.source === source)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getUnresolvedErrors(): Promise<ErrorLog[]> {
    return Array.from(this.errorLogs.values())
      .filter(error => !error.resolved)
      .sort((a, b) => {
        // Sort by severity first, then by timestamp
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        if (severityDiff !== 0) return severityDiff;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
  }

  async markErrorResolved(errorId: string, resolvedBy?: string): Promise<void> {
    const error = this.errorLogs.get(errorId);
    if (error) {
      error.resolved = true;
      error.resolvedAt = new Date();
      error.resolvedBy = resolvedBy;
      await this.saveErrorToStorage(error);
    }
  }

  // ===== ERROR PATTERN ANALYSIS =====

  private async analyzeErrorPatterns(errors: ErrorLog[]): Promise<Map<string, ErrorPattern>> {
    const patterns = new Map<string, ErrorPattern>();

    // Group errors by type and similar messages
    const errorGroups = new Map<string, ErrorLog[]>();
    
    for (const error of errors) {
      const key = `${error.type}:${this.normalizeMessage(error.message)}`;
      if (!errorGroups.has(key)) {
        errorGroups.set(key, []);
      }
      errorGroups.get(key)!.push(error);
    }

    // Create patterns from groups
    for (const [key, groupErrors] of errorGroups.entries()) {
      if (groupErrors.length >= 2) { // Pattern threshold
        const [type] = key.split(':');
        const pattern: ErrorPattern = {
          type: type as ErrorType,
          commonMessages: [...new Set(groupErrors.map(e => e.message))],
          frequency: groupErrors.length,
          firstSeen: new Date(Math.min(...groupErrors.map(e => e.timestamp.getTime()))),
          lastSeen: new Date(Math.max(...groupErrors.map(e => e.timestamp.getTime()))),
          affectedUsers: new Set(groupErrors.map(e => e.userId).filter(Boolean)).size,
          resolved: groupErrors.every(e => e.resolved),
          solutions: this.generateSolutions(type as ErrorType, groupErrors)
        };
        patterns.set(key, pattern);
      }
    }

    return patterns;
  }

  private generateSolutions(type: ErrorType, errors: ErrorLog[]): ErrorSolution[] {
    const solutions: Record<ErrorType, ErrorSolution[]> = {
      typescript: [
        {
          description: 'Fix missing type imports and interfaces',
          implementation: 'Add proper import statements and define missing interfaces',
          success_rate: 0.95,
          difficulty: 'easy',
          estimatedTime: '5-15 minutes',
          dependencies: []
        },
        {
          description: 'Update type definitions to match implementation',
          implementation: 'Align interface definitions with actual usage patterns',
          success_rate: 0.90,
          difficulty: 'medium',
          estimatedTime: '15-30 minutes',
          dependencies: []
        }
      ],
      runtime: [
        {
          description: 'Add null/undefined checks',
          implementation: 'Implement proper error handling and validation',
          success_rate: 0.85,
          difficulty: 'easy',
          estimatedTime: '10-20 minutes',
          dependencies: []
        }
      ],
      camera: [
        {
          description: 'Update to latest expo-camera API',
          implementation: 'Migrate from deprecated Camera to CameraView component',
          success_rate: 0.90,
          difficulty: 'medium',
          estimatedTime: '30-60 minutes',
          dependencies: ['expo-camera']
        }
      ],
      ai_model: [
        {
          description: 'Install TensorFlow.js dependencies',
          implementation: 'Add @tensorflow/tfjs and @tensorflow/tfjs-react-native packages',
          success_rate: 0.95,
          difficulty: 'easy',
          estimatedTime: '5-10 minutes',
          dependencies: ['@tensorflow/tfjs', '@tensorflow/tfjs-react-native']
        }
      ],
      network: [
        {
          description: 'Implement retry logic and better error handling',
          implementation: 'Add exponential backoff and proper error boundaries',
          success_rate: 0.80,
          difficulty: 'medium',
          estimatedTime: '20-40 minutes',
          dependencies: []
        }
      ],
      storage: [
        {
          description: 'Add storage quota and error handling',
          implementation: 'Implement proper AsyncStorage error handling',
          success_rate: 0.85,
          difficulty: 'easy',
          estimatedTime: '15-25 minutes',
          dependencies: []
        }
      ],
      // Add more solutions for other error types...
      form_analysis: [],
      nutrition: [],
      sleep: [],
      analytics: [],
      ui: [],
      performance: [],
      auth: [],
      payment: [],
      sync: [],
      security: []
    };

    return solutions[type] || [];
  }

  // ===== PRIVATE HELPER METHODS =====

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTags(type: ErrorType, source: ErrorSource, message: string): string[] {
    const tags = [type, source];
    
    // Add contextual tags based on message content
    if (message.includes('TensorFlow')) tags.push('tensorflow');
    if (message.includes('Camera')) tags.push('camera');
    if (message.includes('Permission')) tags.push('permissions');
    if (message.includes('Network')) tags.push('network');
    if (message.includes('Type')) tags.push('typescript');
    
    return tags;
  }

  private async enrichContext(context: Partial<ErrorContext>): Promise<ErrorContext> {
    return {
      ...context,
      deviceInfo: await this.getDeviceInfo(),
      appState: await this.getAppState(),
      networkState: await this.getNetworkState(),
      memoryUsage: await this.getMemoryUsage()
    };
  }

  private async getDeviceInfo(): Promise<DeviceInfo> {
    // Mock implementation - would use actual device detection
    return {
      platform: 'android',
      osVersion: '14.0',
      deviceModel: 'Unknown',
      appVersion: '1.0.0',
      buildNumber: '1',
      isDebug: __DEV__
    };
  }

  private async getAppState(): Promise<AppState> {
    // Mock implementation - would integrate with app state
    return {
      activeScreen: 'unknown',
      userLoggedIn: false,
      analysisRunning: false,
      backgroundProcesses: []
    };
  }

  private async getNetworkState(): Promise<NetworkState> {
    // Mock implementation - would use NetInfo
    return {
      isConnected: true,
      connectionType: 'wifi',
      isWifiEnabled: true,
      isCellularEnabled: true
    };
  }

  private async getMemoryUsage(): Promise<number> {
    // Mock implementation - would use actual memory monitoring
    return 0;
  }

  private determineSourceFromFile(filePath: string): ErrorSource {
    if (filePath.includes('computerVision')) return 'computer_vision';
    if (filePath.includes('formAnalysis')) return 'form_analysis';
    if (filePath.includes('nutritionAI')) return 'nutrition_ai';
    if (filePath.includes('sleepAnalysis')) return 'sleep_ai';
    if (filePath.includes('analytics')) return 'analytics';
    if (filePath.includes('recovery')) return 'recovery_engine';
    if (filePath.includes('userSegmentation')) return 'user_segmentation';
    if (filePath.includes('Camera')) return 'camera_component';
    return 'unknown';
  }

  private mapAIServiceToSource(aiService: string): ErrorSource {
    const mapping: Record<string, ErrorSource> = {
      'computer_vision': 'computer_vision',
      'form_analysis': 'form_analysis',
      'nutrition_ai': 'nutrition_ai',
      'sleep_ai': 'sleep_ai',
      'analytics': 'analytics'
    };
    return mapping[aiService] || 'unknown';
  }

  private normalizeMessage(message: string): string {
    // Normalize error messages to detect patterns
    return message
      .replace(/\d+/g, 'NUMBER')
      .replace(/line \d+/g, 'line NUMBER')
      .replace(/'[^']*'/g, 'STRING')
      .toLowerCase();
  }

  private getCutoffDate(timeframe: 'day' | 'week' | 'month'): Date {
    const now = new Date();
    switch (timeframe) {
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private generateSummary(errors: ErrorLog[]): ErrorSummary {
    const totalErrors = errors.length;
    const newErrors = errors.filter(e => 
      new Date().getTime() - e.timestamp.getTime() < 24 * 60 * 60 * 1000
    ).length;
    const resolvedErrors = errors.filter(e => e.resolved).length;

    const severityCounts = errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    const typeCounts = errors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<ErrorType, number>);

    const sourceCounts = errors.reduce((acc, error) => {
      acc[error.source] = (acc[error.source] || 0) + 1;
      return acc;
    }, {} as Record<ErrorSource, number>);

    return {
      totalErrors,
      newErrors,
      resolvedErrors,
      criticalCount: severityCounts.critical || 0,
      highCount: severityCounts.high || 0,
      mediumCount: severityCounts.medium || 0,
      lowCount: severityCounts.low || 0,
      topErrorTypes: Object.entries(typeCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([type, count]) => ({ type: type as ErrorType, count })),
      topErrorSources: Object.entries(sourceCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([source, count]) => ({ source: source as ErrorSource, count }))
    };
  }

  private generateRecommendations(patterns: Map<string, ErrorPattern>, summary: ErrorSummary): ErrorRecommendation[] {
    const recommendations: ErrorRecommendation[] = [];

    // Prioritize TypeScript errors
    if (summary.topErrorTypes.find(t => t.type === 'typescript')) {
      recommendations.push({
        priority: 1,
        title: 'Fix TypeScript Compilation Errors',
        description: 'Resolve TypeScript errors to improve code quality and catch issues early',
        implementation: 'Add missing type imports, fix interface definitions, and resolve type mismatches',
        impact: 'high',
        effort: 'medium',
        errorTypes: ['typescript']
      });
    }

    // Prioritize critical errors
    if (summary.criticalCount > 0) {
      recommendations.push({
        priority: 2,
        title: 'Address Critical Errors',
        description: 'Critical errors can cause app crashes and poor user experience',
        implementation: 'Implement error boundaries, add null checks, and improve error handling',
        impact: 'high',
        effort: 'high',
        errorTypes: ['runtime', 'camera', 'ai_model']
      });
    }

    return recommendations;
  }

  private analyzeTrends(errors: ErrorLog[], timeframe: string): ErrorTrend[] {
    // Mock implementation - would analyze trends over time
    return [{
      period: timeframe,
      errorCount: errors.length,
      resolvedCount: errors.filter(e => e.resolved).length,
      newErrorTypes: [...new Set(errors.map(e => e.type))],
      improvementAreas: ['TypeScript types', 'Error handling', 'Camera integration']
    }];
  }

  private calculatePerformanceMetrics(errors: ErrorLog[]): ErrorPerformanceMetrics {
    const resolvedErrors = errors.filter(e => e.resolved);
    const totalResolutionTime = resolvedErrors.reduce((sum, error) => {
      if (error.resolvedAt) {
        return sum + (error.resolvedAt.getTime() - error.timestamp.getTime());
      }
      return sum;
    }, 0);

    return {
      averageResolutionTime: resolvedErrors.length > 0 ? 
        (totalResolutionTime / resolvedErrors.length) / (1000 * 60 * 60) : 0, // hours
      resolutionRate: errors.length > 0 ? (resolvedErrors.length / errors.length) * 100 : 0,
      recurringErrorRate: 0, // Would calculate based on pattern analysis
      userImpactScore: Math.max(0, 100 - (errors.filter(e => e.severity === 'critical').length * 20)),
      stabilityScore: Math.max(0, 100 - (errors.length * 2))
    };
  }

  private setupGlobalErrorHandlers(): void {
    // Set up global error handlers for unhandled errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.logError(
          'runtime',
          'high',
          'unknown',
          event.message,
          {
            file: event.filename,
            line: event.lineno,
            function: 'global_error_handler'
          },
          event.error?.stack
        );
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.logError(
          'runtime',
          'high',
          'unknown',
          `Unhandled Promise Rejection: ${event.reason}`,
          {
            function: 'unhandled_promise_rejection'
          }
        );
      });
    }
  }

  private async updateErrorPattern(error: ErrorLog): Promise<void> {
    const key = `${error.type}:${this.normalizeMessage(error.message)}`;
    const existing = this.errorPatterns.get(key);
    
    if (existing) {
      existing.frequency++;
      existing.lastSeen = error.timestamp;
      if (error.userId) {
        // Would track affected users properly
      }
    } else {
      this.errorPatterns.set(key, {
        type: error.type,
        commonMessages: [error.message],
        frequency: 1,
        firstSeen: error.timestamp,
        lastSeen: error.timestamp,
        affectedUsers: error.userId ? 1 : 0,
        resolved: false,
        solutions: this.generateSolutions(error.type, [error])
      });
    }
  }

  private async sendCriticalErrorAlert(error: ErrorLog): Promise<void> {
    // Would send alerts via push notifications, email, or logging service
    console.error('CRITICAL ERROR ALERT:', error);
  }

  private async saveErrorToStorage(error: ErrorLog): Promise<void> {
    try {
      await AsyncStorage.setItem(`error_${error.id}`, JSON.stringify(error));
    } catch (storageError) {
      console.error('Failed to save error to storage:', storageError);
    }
  }

  private async loadStoredErrors(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const errorKeys = keys.filter(key => key.startsWith('error_'));
      
      for (const key of errorKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const error = JSON.parse(data) as ErrorLog;
          this.errorLogs.set(error.id, error);
        }
      }
    } catch (error) {
      console.error('Failed to load stored errors:', error);
    }
  }

  private async loadErrorPatterns(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem('error_patterns');
      if (data) {
        const patterns = JSON.parse(data) as Array<[string, ErrorPattern]>;
        this.errorPatterns = new Map(patterns);
      }
    } catch (error) {
      console.error('Failed to load error patterns:', error);
    }
  }

  // ===== PUBLIC REPORTING METHODS =====

  async exportErrorReport(): Promise<string> {
    const report = await this.generateErrorReport('week');
    return JSON.stringify(report, null, 2);
  }

  async clearResolvedErrors(): Promise<void> {
    const unresolvedErrors = new Map<string, ErrorLog>();
    for (const [id, error] of this.errorLogs.entries()) {
      if (!error.resolved) {
        unresolvedErrors.set(id, error);
      } else {
        // Remove from storage
        await AsyncStorage.removeItem(`error_${id}`);
      }
    }
    this.errorLogs = unresolvedErrors;
  }

  getErrorStats(): { total: number; unresolved: number; critical: number; lastError?: Date } {
    const allErrors = Array.from(this.errorLogs.values());
    return {
      total: allErrors.length,
      unresolved: allErrors.filter(e => !e.resolved).length,
      critical: allErrors.filter(e => e.severity === 'critical').length,
      lastError: allErrors.length > 0 ? 
        new Date(Math.max(...allErrors.map(e => e.timestamp.getTime()))) : 
        undefined
    };
  }
}

export default new ErrorLogger();
