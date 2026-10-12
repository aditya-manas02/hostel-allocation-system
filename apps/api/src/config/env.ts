import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  MONGODB_URI: z.string().default('mongodb://localhost:27017/hostel_db?replicaSet=rs0&directConnection=true'),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  JWT_ACCESS_SECRET: z.string().min(32).default('super-secret-access-token-key-change-in-production-min-32-chars'),
  JWT_REFRESH_SECRET: z.string().min(32).default('super-secret-refresh-token-key-change-in-production-min-32-chars'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  ENCRYPTION_KEY_V1: z.string().length(64).default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
  ENCRYPTION_KEY_ACTIVE_VERSION: z.string().default('v1'),

  EMAIL_PROVIDER: z.enum(['console', 'smtp']).default('console'),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default('test'),
  SMTP_PASS: z.string().default('test'),
  SMTP_FROM: z.string().default('Hostel Admin <no-reply@hostel.university.edu>'),
  SMS_PROVIDER: z.enum(['console']).default('console'),

  PUBLIC_API_KEY: z.string().default('hostel-p04-occupancy-api-key-secret'),
  P04_API_KEY: z.string().default('p04-default-shared-key-2026'),
});

export const env = EnvSchema.parse(process.env);
