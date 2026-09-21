import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

async function bootstrap() {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      console.log(`[Server] API server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('[Server] Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
