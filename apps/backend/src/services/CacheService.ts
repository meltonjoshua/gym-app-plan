import Redis from 'ioredis';

/**
 * High-Performance Caching Service
 * Phase 14B: Performance Optimization Implementation
 */
export class CacheService {
  private static instance: CacheService;
  private redisClient: Redis | null = null;
  private memoryCache = new Map<string, {value: any, expiry: number}>();
  private cacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
  };

  private constructor() {}

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Initialize Redis connection with fallback to memory cache
   */
  async initialize(): Promise<void> {
    try {
      this.redisClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        
        // Performance optimizations
        maxRetriesPerRequest: 3,
        connectTimeout: 10000,
        commandTimeout: 5000,
        lazyConnect: true,
        keepAlive: 30000,
        enableOfflineQueue: false,
      });

      await this.redisClient.ping();
      console.log('✅ Redis cache initialized successfully');
    } catch (error) {
      console.warn('⚠️ Redis unavailable, using memory cache fallback');
      this.redisClient = null;
    }
  }

  /**
   * Set cache value with TTL
   */
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    this.cacheStats.sets++;
    
    try {
      const serializedValue = JSON.stringify(value);
      
      if (this.redisClient) {
        // Use Redis for distributed caching
        await this.redisClient.setex(key, ttlSeconds, serializedValue);
      } else {
        // Fallback to memory cache
        const expiry = Date.now() + (ttlSeconds * 1000);
        this.memoryCache.set(key, { value: serializedValue, expiry });
        
        // Cleanup expired entries periodically
        this.cleanupMemoryCache();
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Get cache value
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      let serializedValue: string | null = null;
      
      if (this.redisClient) {
        // Get from Redis
        serializedValue = await this.redisClient.get(key);
      } else {
        // Get from memory cache
        const cached = this.memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          serializedValue = cached.value;
        } else if (cached) {
          // Remove expired entry
          this.memoryCache.delete(key);
        }
      }
      
      if (serializedValue) {
        this.cacheStats.hits++;
        return JSON.parse(serializedValue) as T;
      } else {
        this.cacheStats.misses++;
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      this.cacheStats.misses++;
      return null;
    }
  }

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<void> {
    this.cacheStats.deletes++;
    
    try {
      if (this.redisClient) {
        await this.redisClient.del(key);
      } else {
        this.memoryCache.delete(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      if (this.redisClient) {
        await this.redisClient.flushall();
      } else {
        this.memoryCache.clear();
      }
      console.log('🧹 Cache cleared successfully');
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {hits: number, misses: number, hitRate: number, totalOperations: number} {
    const totalRequests = this.cacheStats.hits + this.cacheStats.misses;
    const hitRate = totalRequests > 0 ? (this.cacheStats.hits / totalRequests) * 100 : 0;
    
    return {
      hits: this.cacheStats.hits,
      misses: this.cacheStats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      totalOperations: this.cacheStats.sets + this.cacheStats.deletes + totalRequests
    };
  }

  /**
   * Cache with automatic refresh strategy
   */
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - fetch and store
    try {
      const freshValue = await fetchFunction();
      await this.set(key, freshValue, ttlSeconds);
      return freshValue;
    } catch (error) {
      console.error('Cache getOrSet fetch error:', error);
      throw error;
    }
  }

  /**
   * Bulk operations for better performance
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (this.redisClient) {
      try {
        const values = await this.redisClient.mget(...keys);
        return values.map(value => {
          if (value) {
            this.cacheStats.hits++;
            return JSON.parse(value) as T;
          } else {
            this.cacheStats.misses++;
            return null;
          }
        });
      } catch (error) {
        console.error('Cache mget error:', error);
        this.cacheStats.misses += keys.length;
        return keys.map(() => null);
      }
    } else {
      // Fallback to individual gets for memory cache
      return Promise.all(keys.map(key => this.get<T>(key)));
    }
  }

  /**
   * Cleanup expired memory cache entries
   */
  private cleanupMemoryCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.memoryCache.entries()) {
      if (cached.expiry <= now) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Health check for cache service
   */
  async healthCheck(): Promise<{status: string, type: string, stats: any}> {
    try {
      if (this.redisClient) {
        await this.redisClient.ping();
        return {
          status: 'healthy',
          type: 'redis',
          stats: this.getStats()
        };
      } else {
        return {
          status: 'healthy',
          type: 'memory',
          stats: {
            ...this.getStats(),
            memoryEntries: this.memoryCache.size
          }
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        type: this.redisClient ? 'redis' : 'memory',
        stats: this.getStats()
      };
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      if (this.redisClient) {
        this.redisClient.disconnect();
        console.log('✅ Redis cache disconnected');
      }
      this.memoryCache.clear();
    } catch (error) {
      console.error('Cache shutdown error:', error);
    }
  }
}

/**
 * Cache key generators for consistent caching strategy
 */
export class CacheKeys {
  static user(userId: string): string {
    return `user:${userId}`;
  }

  static userProfile(userId: string): string {
    return `user:profile:${userId}`;
  }

  static workout(workoutId: string): string {
    return `workout:${workoutId}`;
  }

  static userWorkouts(userId: string, date?: string): string {
    return date ? `user:workouts:${userId}:${date}` : `user:workouts:${userId}`;
  }

  static exerciseLibrary(): string {
    return 'exercise:library';
  }

  static supportedExercises(): string {
    return 'ai:supported-exercises';
  }

  static workoutRecommendations(userId: string, preferences: string): string {
    return `ai:recommendations:${userId}:${preferences}`;
  }

  static formAnalysisSession(sessionId: string): string {
    return `ai:form-analysis:${sessionId}`;
  }

  static nutritionData(userId: string, date: string): string {
    return `nutrition:${userId}:${date}`;
  }

  static systemConfig(): string {
    return 'system:config';
  }
}

export default CacheService;
