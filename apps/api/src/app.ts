import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { correlationId } from './middleware/correlationId.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

// Apply rate limiting in non-test environments
if (env.NODE_ENV !== 'test') {
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
}

app.use(express.json({ limit: '10mb' }));
app.use(correlationId);

// Mount main routes under /api
app.use('/api', routes);

// Centralized error handler
app.use(errorHandler);
