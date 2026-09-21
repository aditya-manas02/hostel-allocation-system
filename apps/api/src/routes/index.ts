import { Router } from 'express';
import authRoutes from './auth.routes.js';
import auditRoutes from './audit.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/audit', auditRoutes);

export default router;
