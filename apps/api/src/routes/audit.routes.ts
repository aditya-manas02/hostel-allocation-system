import { Router, Request, Response, NextFunction } from 'express';
import { AuditLogModel } from '../models/AuditLog.js';
import { AuditService } from '../services/AuditService.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Retrieve audit logs with pagination
router.get(
  '/logs',
  authenticate,
  requireRole('ADMIN', 'DEAN', 'SYSTEM_ADMIN', 'CHIEF_WARDEN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const batchId = (req.query.batchId as string) || 'GLOBAL';

      const total = await AuditLogModel.countDocuments({ batchId });
      const logs = await AuditLogModel.find({ batchId })
        .sort({ sequence: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      res.json({
        logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// Verify hash chain integrity
router.get(
  '/verify',
  authenticate,
  requireRole('ADMIN', 'SYSTEM_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const batchId = (req.query.batchId as string) || 'GLOBAL';
      const result = await AuditService.verifyChain(batchId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
