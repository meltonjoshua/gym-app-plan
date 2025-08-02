import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

/**
 * Performance Monitoring Middleware
 * Phase 14B: Performance Optimization Implementation
 */

interface PerformanceMetrics {
  requestDuration: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  timestamp: number;
  endpoint: string;
  method: string;
  statusCode: number;
  userAgent?: string;
  userId?: string;
}

interface PerformanceStats {
  totalRequests: number;
  averageResponseTime: number;
  slowestRequest: number;
  fastestRequest: number;
  requestsPerSecond: number;
  errorRate: number;
  memoryTrend: number[];
  cpuTrend: number[];
  endpointStats: Map<string, EndpointStats>;
}

interface EndpointStats {
  count: number;
  totalTime: number;
  averageTime: number;
  slowestTime: number;
  fastestTime: number;
  errorCount: number;
}

/**
 * Performance monitor singleton
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private maxMetricsHistory = 10000;
  private startTime = Date.now();

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Add performance metric
   */
  addMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics to prevent memory leaks
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  /**
   * Get performance statistics
   */
  getStats(timeWindowMinutes = 60): PerformanceStats {
    const windowStart = Date.now() - (timeWindowMinutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp >= windowStart);
    
    if (recentMetrics.length === 0) {
      return this.getEmptyStats();
    }

    // Calculate basic stats
    const durations = recentMetrics.map(m => m.requestDuration);
    const errors = recentMetrics.filter(m => m.statusCode >= 400);
    const totalTime = Date.now() - windowStart;
    
    // Endpoint-specific stats
    const endpointStats = new Map<string, EndpointStats>();
    
    recentMetrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`;
      const existing = endpointStats.get(key) || {
        count: 0,
        totalTime: 0,
        averageTime: 0,
        slowestTime: 0,
        fastestTime: Infinity,
        errorCount: 0
      };
      
      existing.count++;
      existing.totalTime += metric.requestDuration;
      existing.averageTime = existing.totalTime / existing.count;
      existing.slowestTime = Math.max(existing.slowestTime, metric.requestDuration);
      existing.fastestTime = Math.min(existing.fastestTime, metric.requestDuration);
      
      if (metric.statusCode >= 400) {
        existing.errorCount++;
      }
      
      endpointStats.set(key, existing);
    });

    return {
      totalRequests: recentMetrics.length,
      averageResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
      slowestRequest: Math.max(...durations),
      fastestRequest: Math.min(...durations),
      requestsPerSecond: recentMetrics.length / (totalTime / 1000),
      errorRate: (errors.length / recentMetrics.length) * 100,
      memoryTrend: recentMetrics.slice(-10).map(m => m.memoryUsage.heapUsed),
      cpuTrend: recentMetrics.slice(-10).map(m => m.cpuUsage.user + m.cpuUsage.system),
      endpointStats
    };
  }

  /**
   * Get slow queries (requests taking longer than threshold)
   */
  getSlowRequests(thresholdMs = 1000, limit = 10): PerformanceMetrics[] {
    return this.metrics
      .filter(m => m.requestDuration > thresholdMs)
      .sort((a, b) => b.requestDuration - a.requestDuration)
      .slice(0, limit);
  }

  /**
   * Get memory and CPU alerts
   */
  getAlerts(): string[] {
    const alerts: string[] = [];
    const recentMetrics = this.metrics.slice(-10);
    
    if (recentMetrics.length === 0) return alerts;

    // Memory usage alert (>500MB)
    const avgMemory = recentMetrics.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0) / recentMetrics.length;
    if (avgMemory > 500 * 1024 * 1024) {
      alerts.push(`High memory usage: ${Math.round(avgMemory / 1024 / 1024)}MB`);
    }

    // Response time alert (>2000ms average)
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.requestDuration, 0) / recentMetrics.length;
    if (avgResponseTime > 2000) {
      alerts.push(`Slow response time: ${Math.round(avgResponseTime)}ms average`);
    }

    // Error rate alert (>5%)
    const errors = recentMetrics.filter(m => m.statusCode >= 400).length;
    const errorRate = (errors / recentMetrics.length) * 100;
    if (errorRate > 5) {
      alerts.push(`High error rate: ${Math.round(errorRate)}%`);
    }

    return alerts;
  }

  private getEmptyStats(): PerformanceStats {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      slowestRequest: 0,
      fastestRequest: 0,
      requestsPerSecond: 0,
      errorRate: 0,
      memoryTrend: [],
      cpuTrend: [],
      endpointStats: new Map()
    };
  }

  /**
   * Clear old metrics (for maintenance)
   */
  clearOldMetrics(olderThanHours = 24): void {
    const cutoff = Date.now() - (olderThanHours * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoff);
  }

  /**
   * Export metrics for external monitoring
   */
  exportMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }
}

/**
 * Performance monitoring middleware
 */
export function performanceMiddleware() {
  const monitor = PerformanceMonitor.getInstance();
  let initialCpuUsage = process.cpuUsage();

  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = performance.now();
    const startCpuUsage = process.cpuUsage(initialCpuUsage);
    const startMemory = process.memoryUsage();

    // Continue processing
    res.on('finish', () => {
      const endTime = performance.now();
      const endCpuUsage = process.cpuUsage(startCpuUsage);
      const endMemory = process.memoryUsage();

      const metric: PerformanceMetrics = {
        requestDuration: endTime - startTime,
        memoryUsage: endMemory,
        cpuUsage: endCpuUsage,
        timestamp: Date.now(),
        endpoint: req.route?.path || req.path,
        method: req.method,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id
      };

      monitor.addMetric(metric);

      // Log slow requests
      if (metric.requestDuration > 1000) {
        console.warn(`🐌 Slow request: ${req.method} ${req.path} took ${Math.round(metric.requestDuration)}ms`);
      }

      // Only add headers if response hasn't been sent
      if (!res.headersSent) {
        try {
          res.set('X-Response-Time', `${Math.round(metric.requestDuration)}ms`);
          res.set('X-Memory-Usage', `${Math.round(metric.memoryUsage.heapUsed / 1024 / 1024)}MB`);
        } catch (error) {
          // Headers already sent, ignore
        }
      }
    });

    next();
  };
}

/**
 * Performance dashboard endpoint
 */
export function createPerformanceDashboard() {
  const monitor = PerformanceMonitor.getInstance();

  return (req: Request, res: Response) => {
    const timeWindow = parseInt(req.query.timeWindow as string) || 60;
    const stats = monitor.getStats(timeWindow);
    const slowRequests = monitor.getSlowRequests();
    const alerts = monitor.getAlerts();

    const dashboard = {
      overview: {
        totalRequests: stats.totalRequests,
        averageResponseTime: Math.round(stats.averageResponseTime),
        requestsPerSecond: Math.round(stats.requestsPerSecond * 100) / 100,
        errorRate: Math.round(stats.errorRate * 100) / 100,
        memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        uptime: `${Math.round((Date.now() - monitor['startTime']) / 1000 / 60)}min`
      },
      performance: {
        slowestRequest: Math.round(stats.slowestRequest),
        fastestRequest: Math.round(stats.fastestRequest),
        memoryTrend: stats.memoryTrend.map(m => Math.round(m / 1024 / 1024)),
        cpuTrend: stats.cpuTrend.map(c => Math.round(c / 1000))
      },
      endpoints: Object.fromEntries(
        Array.from(stats.endpointStats.entries()).map(([key, value]) => [
          key,
          {
            ...value,
            averageTime: Math.round(value.averageTime),
            slowestTime: Math.round(value.slowestTime),
            fastestTime: Math.round(value.fastestTime),
            errorRate: Math.round((value.errorCount / value.count) * 100 * 100) / 100
          }
        ])
      ),
      slowRequests: slowRequests.map(req => ({
        endpoint: req.endpoint,
        method: req.method,
        duration: Math.round(req.requestDuration),
        timestamp: new Date(req.timestamp).toISOString(),
        statusCode: req.statusCode
      })),
      alerts,
      timestamp: new Date().toISOString()
    };

    res.json(dashboard);
  };
}

/**
 * Health check with performance metrics
 */
export function createHealthCheck() {
  const monitor = PerformanceMonitor.getInstance();

  return (req: Request, res: Response) => {
    const stats = monitor.getStats(5); // Last 5 minutes
    const alerts = monitor.getAlerts();
    const memory = process.memoryUsage();

    const health = {
      status: alerts.length === 0 ? 'healthy' : 'warning',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(memory.heapUsed / 1024 / 1024),
        total: Math.round(memory.heapTotal / 1024 / 1024),
        external: Math.round(memory.external / 1024 / 1024)
      },
      performance: {
        averageResponseTime: Math.round(stats.averageResponseTime),
        requestsPerSecond: Math.round(stats.requestsPerSecond * 100) / 100,
        errorRate: Math.round(stats.errorRate * 100) / 100
      },
      alerts
    };

    const statusCode = alerts.length === 0 ? 200 : 207; // 207 = Multi-Status
    res.status(statusCode).json(health);
  };
}

/**
 * Export performance monitor instance
 */
export const performanceMonitor = PerformanceMonitor.getInstance();

export default performanceMiddleware;
