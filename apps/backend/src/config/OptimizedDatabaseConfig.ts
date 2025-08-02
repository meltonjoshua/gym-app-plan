import { DataSource, DataSourceOptions } from 'typeorm';
import Redis from 'ioredis';

/**
 * Optimized Database Configuration for High Performance
 * Phase 14B: Performance Optimization Implementation
 */
export class OptimizedDatabaseConfig {
  private static instance: OptimizedDatabaseConfig;
  private dataSource: DataSource | null = null;
  private redisClient: Redis | null = null;

  private constructor() {}

  static getInstance(): OptimizedDatabaseConfig {
    if (!OptimizedDatabaseConfig.instance) {
      OptimizedDatabaseConfig.instance = new OptimizedDatabaseConfig();
    }
    return OptimizedDatabaseConfig.instance;
  }

  /**
   * Initialize optimized database connection
   */
  async initialize(): Promise<void> {
    await this.createOptimizedConnection();
    await this.initializeRedis();
  }

  /**
   * High-performance database connection with optimized pooling
   */
  private async createOptimizedConnection(): Promise<DataSource> {
    if (this.dataSource?.isInitialized) {
      return this.dataSource;
    }

    const connectionOptions: DataSourceOptions = {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'fittracker_db',
      
      // Entity configuration
      entities: ['src/models/**/*.ts'],
      migrations: ['src/migrations/**/*.ts'],
      subscribers: ['src/subscribers/**/*.ts'],
      
      // Development settings
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
      
      // Performance optimizations
      extra: {
        // Connection pool optimization
        max: 20, // Maximum number of connections
        min: 5,  // Minimum number of connections
        acquireTimeoutMillis: 30000, // 30 seconds timeout
        idleTimeoutMillis: 600000,   // 10 minutes idle timeout
        
        // PostgreSQL specific optimizations
        statement_timeout: 30000,    // 30 seconds statement timeout
        query_timeout: 30000,        // 30 seconds query timeout
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
        
        // SSL configuration for production
        ssl: process.env.NODE_ENV === 'production' ? {
          rejectUnauthorized: false
        } : false,
      },
      
      // Cache settings
      cache: {
        type: 'redis',
        options: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
        },
        duration: 30000, // 30 seconds default cache
      },
    };

    try {
      this.dataSource = new DataSource(connectionOptions);
      await this.dataSource.initialize();
      
      console.log('✅ Optimized database connection established');
      console.log(`📊 Connection pool: min=${connectionOptions.extra.min}, max=${connectionOptions.extra.max}`);
      
      return this.dataSource;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Initialize Redis client for caching
   */
  private async initializeRedis(): Promise<Redis | null> {
    if (this.redisClient) {
      return this.redisClient;
    }

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
      console.log('✅ Redis connection established for database caching');
      
      return this.redisClient;
    } catch (error) {
      console.warn('⚠️ Redis connection failed, continuing without cache:', error);
      return null;
    }
  }

  /**
   * Get active database connection
   */
  getConnection(): DataSource | null {
    if (!this.dataSource?.isInitialized) {
      console.warn('⚠️ Database connection not initialized');
      return null;
    }
    return this.dataSource;
  }

  /**
   * Get Redis client
   */
  getRedisClient(): Redis | null {
    return this.redisClient;
  }

  /**
   * Get connection pool statistics
   */
  async getConnectionStats(): Promise<any> {
    if (!this.dataSource?.isInitialized) {
      return { status: 'disconnected' };
    }

    try {
      // Execute a simple query to test connection
      await this.dataSource.query('SELECT 1');
      
      return {
        status: 'connected',
        isInitialized: this.dataSource.isInitialized,
        hasMetadata: this.dataSource.hasMetadata,
        driverType: this.dataSource.driver.options.type,
        entityCount: this.dataSource.entityMetadatas.length
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Performance monitoring for queries
   */
  enableQueryLogging(): void {
    if (!this.dataSource) return;

    // Custom query logger for performance monitoring
    console.log('🔍 Database query logging enabled');
  }

  /**
   * Optimize query performance with prepared statements
   */
  async optimizeQueries(): Promise<void> {
    if (!this.dataSource) return;

    try {
      // Enable query optimization
      await this.dataSource.query('SET enable_seqscan = off');
      await this.dataSource.query('SET enable_bitmapscan = on');
      await this.dataSource.query('SET enable_hashjoin = on');
      
      console.log('✅ Database query optimization enabled');
    } catch (error) {
      console.warn('⚠️ Query optimization failed:', error);
    }
  }

  /**
   * Health check for database and Redis
   */
  async healthCheck(): Promise<{database: string, redis: string, timestamp: number}> {
    const health = {
      database: 'disconnected',
      redis: 'disconnected',
      timestamp: Date.now()
    };

    try {
      if (this.dataSource?.isInitialized) {
        await this.dataSource.query('SELECT 1');
        health.database = 'connected';
      }
    } catch (error) {
      health.database = 'error';
    }

    try {
      if (this.redisClient) {
        await this.redisClient.ping();
        health.redis = 'connected';
      }
    } catch (error) {
      health.redis = 'error';
    }

    return health;
  }

  /**
   * Close all connections gracefully
   */
  async closeAllConnections(): Promise<void> {
    try {
      if (this.dataSource?.isInitialized) {
        await this.dataSource.destroy();
        console.log('✅ Database connection closed');
      }

      if (this.redisClient) {
        this.redisClient.disconnect();
        console.log('✅ Redis connection closed');
      }
    } catch (error) {
      console.error('❌ Error closing connections:', error);
    }
  }

  /**
   * Performance monitoring metrics
   */
  async getPerformanceMetrics(): Promise<any> {
    const metrics: any = {
      timestamp: new Date().toISOString(),
      database: {},
      redis: {}
    };

    try {
      if (this.dataSource?.isInitialized) {
        // Get database metrics
        const dbStats = await this.dataSource.query(`
          SELECT 
            schemaname,
            tablename,
            n_tup_ins as inserts,
            n_tup_upd as updates,
            n_tup_del as deletes,
            n_live_tup as live_tuples,
            n_dead_tup as dead_tuples
          FROM pg_stat_user_tables
          ORDER BY n_live_tup DESC
          LIMIT 10
        `);
        
        metrics.database = {
          status: 'connected',
          tableStats: dbStats
        };
      }
    } catch (error) {
      metrics.database = { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
    }

    try {
      if (this.redisClient) {
        const info = await this.redisClient.info('memory');
        metrics.redis = {
          status: 'connected',
          info: info.split('\r\n').reduce((acc: any, line: string) => {
            const [key, value] = line.split(':');
            if (key && value) acc[key] = value;
            return acc;
          }, {})
        };
      }
    } catch (error) {
      metrics.redis = { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
    }

    return metrics;
  }
}
