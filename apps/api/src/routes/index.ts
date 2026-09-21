import { Router } from 'express';
import authRoutes from './auth.routes.js';
import auditRoutes from './audit.routes.js';
import inventoryRoutes from './inventory.routes.js';
import cycleRoutes from './cycle.routes.js';
import preferenceRoutes from './preference.routes.js';
import compatibilityRoutes from './compatibility.routes.js';
import eligibilityRoutes from './eligibility.routes.js';
import allocationRoutes from './allocation.routes.js';
import wardenRoutes from './warden.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/audit', auditRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/cycles', cycleRoutes);
router.use('/preferences', preferenceRoutes);
router.use('/compatibility', compatibilityRoutes);
router.use('/me/compatibility', compatibilityRoutes);
router.use('/eligibility', eligibilityRoutes);
router.use('/allocation', allocationRoutes);
router.use('/drafts', allocationRoutes);
router.use('/warden', wardenRoutes);

export default router;
