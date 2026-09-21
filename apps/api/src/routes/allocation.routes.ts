import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { AllocationRunModel } from '../models/AllocationRun.js';
import { AllocationDraftModel } from '../models/AllocationDraft.js';
import { AllocationAssignmentModel } from '../models/AllocationAssignment.js';
import { AllocationService } from '../services/AllocationService.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Trigger an allocation run for a cycle (Admin only)
router.post(
  '/cycles/:id/allocate',
  authenticate,
  requireRole('ADMIN', 'SYSTEM_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cycleId = req.params.id;
      const seed = req.body.seed || `seed-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const parameters = req.body.parameters || {};

      const result = await AllocationService.executeRun(
        cycleId!,
        seed,
        parameters,
        req.user!.id,
      );

      res.status(202).json({
        message: 'Allocation completed successfully',
        runId: result.runId,
        draftId: result.draftId,
        stats: result.output.stats,
        hashes: {
          inputSnapshotHash: result.output.inputSnapshotHash,
          outputHash: result.output.outputHash,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// List allocation runs
router.get(
  '/runs',
  authenticate,
  requireRole('ADMIN', 'SYSTEM_ADMIN', 'DEAN', 'CHIEF_WARDEN'),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const runs = await AllocationRunModel.find().sort({ createdAt: -1 }).lean();
      res.json(runs);
    } catch (err) {
      next(err);
    }
  },
);

// Get allocation run status
router.get(
  '/runs/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const run = await AllocationRunModel.findById(req.params.id).lean();
      if (!run) {
        res.status(404).json({ error: 'Not Found', message: 'Allocation run not found' });
        return;
      }
      res.json(run);
    } catch (err) {
      next(err);
    }
  },
);

// Re-run with identical seed (Invariant I3 verification)
router.post(
  '/runs/:id/rerun',
  authenticate,
  requireRole('ADMIN', 'SYSTEM_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const originalRun = await AllocationRunModel.findById(req.params.id);
      if (!originalRun) {
        res.status(404).json({ error: 'Not Found', message: 'Original run not found' });
        return;
      }

      const result = await AllocationService.executeRun(
        originalRun.cycleId.toString(),
        originalRun.seed, // EXACT SAME SEED
        originalRun.parameters,
        req.user!.id,
      );

      const isIdentical = originalRun.outputHash === result.output.outputHash;

      res.json({
        message: 'Re-run completed with identical seed',
        originalRunId: originalRun._id.toString(),
        newRunId: result.runId,
        isIdenticalReproducible: isIdentical,
        originalOutputHash: originalRun.outputHash,
        newOutputHash: result.output.outputHash,
      });
    } catch (err) {
      next(err);
    }
  },
);

// Get draft details
router.get(
  '/drafts/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const draft = await AllocationDraftModel.findById(req.params.id).lean();
      if (!draft) {
        res.status(404).json({ error: 'Not Found', message: 'Draft not found' });
        return;
      }
      res.json(draft);
    } catch (err) {
      next(err);
    }
  },
);

// Get assignments for a draft (supports floor/hostel filtering)
router.get(
  '/drafts/:id/assignments',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: any = { draftId: req.params.id };
      if (req.query.hostelId) filter.hostelId = req.query.hostelId;
      if (req.query.roomId) filter.roomId = req.query.roomId;

      const assignments = await AllocationAssignmentModel.find(filter)
        .populate('studentId', 'fullName email')
        .populate('bedId', 'bedLabel isAccessible')
        .lean();

      res.json(assignments);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
