import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

let redisClient: any = null;

export const connectRedis = async (): Promise<any> => {
  try {
    const client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    });

    client.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });

    client.on('connect', () => {
      logger.info('Redis connecting...');
    });

    client.on('ready', () => {
      logger.info('Redis connected and ready');
    });

    client.on('end', () => {
      logger.warn('Redis connection ended');
    });

    await client.connect();
    redisClient = client;

    // Graceful shutdown
    process.on('SIGINT', async () => {
      if (redisClient) {
        await redisClient.disconnect();
        logger.info('Redis connection closed due to app termination');
      }
    });

    return client;
  } catch (error) {
    logger.error('Error connecting to Redis:', error);
    throw error;
  }
};

export const getRedisClient = (): any => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.disconnect();
      redisClient = null;
      logger.info('Redis disconnected');
    }
  } catch (error) {
    logger.error('Error disconnecting from Redis:', error);
    throw error;
  }
};