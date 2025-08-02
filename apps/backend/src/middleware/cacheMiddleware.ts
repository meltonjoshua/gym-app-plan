import { Request, Response, NextFunction } from 'express';
import CacheService from '../services/CacheService';

/**
 * API Response Caching Middleware
 * Phase 14B: Performance Optimization Implementation
 */

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyGenerator?: (req: Request) => string;
  conditionalCache?: (req: Request, res: Response) => boolean;
  varyBy?: string[]; // Headers to include in cache key
}

/**
 * Caching middleware factory
 */
export function cacheMiddleware(options: CacheOptions = {}) {
  const {
    ttl = 300, // 5 minutes default
    keyGenerator = defaultKeyGenerator,
    conditionalCache = defaultConditionalCache,
    varyBy = []
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check if caching should be applied
    if (!conditionalCache(req, res)) {
      return next();
    }

    const cache = CacheService.getInstance();
    const cacheKey = keyGenerator(req);

    try {
      // Try to get cached response
      const cachedResponse = await cache.get<CachedResponse>(cacheKey);
      
      if (cachedResponse) {
        // Cache hit - return cached response
        res.set(cachedResponse.headers);
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
        return res.status(cachedResponse.statusCode).json(cachedResponse.data);
      }

      // Cache miss - intercept response
      const originalJson = res.json;
      const originalSend = res.send;
      let responseData: any;
      let statusCode = 200;

      // Override json method to capture response
      res.json = function(data: any) {
        responseData = data;
        statusCode = res.statusCode;
        return originalJson.call(this, data);
      };

      // Override send method to capture response
      res.send = function(data: any) {
        responseData = data;
        statusCode = res.statusCode;
        return originalSend.call(this, data);
      };

      // Continue with request processing
      res.on('finish', async () => {
        // Only cache successful responses
        if (statusCode >= 200 && statusCode < 300 && responseData) {
          const cachedResponse: CachedResponse = {
            data: responseData,
            statusCode,
            headers: extractCacheableHeaders(res.getHeaders()),
            timestamp: Date.now()
          };

          await cache.set(cacheKey, cachedResponse, ttl);
        }
      });

      res.set('X-Cache', 'MISS');
      res.set('X-Cache-Key', cacheKey);
      next();

    } catch (error) {
      console.error('Cache middleware error:', error);
      // Continue without caching on error
      next();
    }
  };
}

/**
 * Cached response interface
 */
interface CachedResponse {
  data: any;
  statusCode: number;
  headers: Record<string, string>;
  timestamp: number;
}

/**
 * Default cache key generator
 */
function defaultKeyGenerator(req: Request): string {
  const { method, originalUrl, query } = req;
  const userId = (req as any).user?.id || 'anonymous';
  
  // Create deterministic key from request
  const queryString = Object.keys(query)
    .sort()
    .map(key => `${key}=${query[key]}`)
    .join('&');
    
  return `api:${method}:${originalUrl}:${userId}:${queryString}`;
}

/**
 * Default conditional caching logic
 */
function defaultConditionalCache(req: Request, res: Response): boolean {
  // Don't cache if user is authenticated and endpoint might be user-specific
  if ((req as any).user && req.originalUrl.includes('/user/')) {
    return false;
  }
  
  // Don't cache real-time endpoints
  const realtimeEndpoints = ['/form-analysis/analyze', '/live', '/stream'];
  if (realtimeEndpoints.some(endpoint => req.originalUrl.includes(endpoint))) {
    return false;
  }
  
  return true;
}

/**
 * Extract cacheable headers
 */
function extractCacheableHeaders(headers: any): Record<string, string> {
  const cacheableHeaders = ['content-type', 'content-encoding', 'etag'];
  const result: Record<string, string> = {};
  
  for (const header of cacheableHeaders) {
    if (headers[header]) {
      result[header] = String(headers[header]);
    }
  }
  
  return result;
}

/**
 * Cache invalidation middleware
 */
export function cacheInvalidationMiddleware(patterns: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only invalidate on non-GET requests
    if (req.method === 'GET') {
      return next();
    }

    const cache = CacheService.getInstance();
    
    res.on('finish', async () => {
      // Only invalidate on successful modifications
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          // Invalidate cache patterns
          for (const pattern of patterns) {
            const keys = await getCacheKeysByPattern(pattern);
            for (const key of keys) {
              await cache.delete(key);
            }
          }
        } catch (error) {
          console.error('Cache invalidation error:', error);
        }
      }
    });

    next();
  };
}

/**
 * Get cache keys by pattern (simplified for now)
 */
async function getCacheKeysByPattern(pattern: string): Promise<string[]> {
  // This would need Redis SCAN command for production
  // For now, return empty array as fallback
  return [];
}

/**
 * Specific caching configurations for different endpoints
 */
export const CacheConfigs = {
  // Exercise library - cache for 1 hour
  exerciseLibrary: cacheMiddleware({
    ttl: 3600,
    keyGenerator: () => 'api:exercises:library'
  }),

  // User workouts - cache for 5 minutes
  userWorkouts: cacheMiddleware({
    ttl: 300,
    keyGenerator: (req) => {
      const userId = (req as any).user?.id || 'anonymous';
      const date = req.query.date || 'today';
      return `api:workouts:${userId}:${date}`;
    }
  }),

  // Workout recommendations - cache for 30 minutes
  workoutRecommendations: cacheMiddleware({
    ttl: 1800,
    keyGenerator: (req) => {
      const userId = (req as any).user?.id || 'anonymous';
      const preferences = JSON.stringify(req.body || {});
      return `api:recommendations:${userId}:${Buffer.from(preferences).toString('base64')}`;
    }
  }),

  // System configuration - cache for 1 hour
  systemConfig: cacheMiddleware({
    ttl: 3600,
    keyGenerator: () => 'api:system:config'
  }),

  // Nutrition data - cache for 10 minutes
  nutritionData: cacheMiddleware({
    ttl: 600,
    keyGenerator: (req) => {
      const userId = (req as any).user?.id || 'anonymous';
      const date = req.query.date || new Date().toISOString().split('T')[0];
      return `api:nutrition:${userId}:${date}`;
    }
  })
};

/**
 * Cache warming utility
 */
export class CacheWarmer {
  private cache = CacheService.getInstance();

  /**
   * Warm frequently accessed data
   */
  async warmCache(): Promise<void> {
    console.log('🔥 Starting cache warming...');
    
    try {
      // Warm exercise library
      await this.warmExerciseLibrary();
      
      // Warm system configuration
      await this.warmSystemConfig();
      
      console.log('✅ Cache warming completed');
    } catch (error) {
      console.error('❌ Cache warming failed:', error);
    }
  }

  private async warmExerciseLibrary(): Promise<void> {
    // This would fetch and cache exercise library
    // Implementation depends on your data layer
    console.log('📚 Warming exercise library cache...');
  }

  private async warmSystemConfig(): Promise<void> {
    // This would fetch and cache system configuration
    console.log('⚙️ Warming system config cache...');
  }
}

export default cacheMiddleware;
