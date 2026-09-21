import { Router } from 'express';
import authRoutes from './auth.routes.js';
import auditRoutes from './audit.routes.js';
import inventoryRoutes from './inventory.routes.js';
import cycleRoutes from './cycle.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/audit', auditRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/cycles', cycleRoutes);

export default router;
