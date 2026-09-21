import { Redis } from 'ioredis';
import { env } from './env.js';

export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

redisClient.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});

redisClient.on('connect', () => {
  console.log('[Redis] Connected successfully');
});
