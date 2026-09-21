import { Router, Request, Response, NextFunction } from 'express';
import { AllocationCycleSchema, ApplicationSchema } from '@hostel/shared';
import { AllocationCycleModel } from '../models/AllocationCycle.js';
import { ApplicationModel } from '../models/Application.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { AuditService } from '../services/AuditService.js';

const router = Router();

// List all cycles
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cycles = await AllocationCycleModel.find().sort({ createdAt: -1 }).lean();
    res.json(cycles);
  } catch (err) {
    next(err);
  }
});

// Create new allocation cycle (Admin only)
router.post(
  '/',
  authenticate,
  requireRole('ADMIN', 'SYSTEM_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = AllocationCycleSchema.parse(req.body);
      const cycle = new AllocationCycleModel(data);
      await cycle.save();

      await AuditService.log({
        action: 'CYCLE_CREATED',
        actorId: req.user!.id,
        resourceType: 'AllocationCycle',
        resourceId: cycle._id.toString(),
        after: cycle.toJSON(),
      });

      res.status(201).json(cycle.toJSON());
    } catch (err) {
      next(err);
    }
  },
);

// Get single cycle details
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cycle = await AllocationCycleModel.findById(req.params.id).lean();
    if (!cycle) {
      res.status(404).json({ error: 'Not Found', message: 'Allocation cycle not found' });
      return;
    }
    res.json(cycle);
  } catch (err) {
    next(err);
  }
});

// List applications within a cycle
router.get(
  '/:id/applications',
  authenticate,
  requireRole('ADMIN', 'CHIEF_WARDEN', 'WARDEN', 'DEAN', 'SYSTEM_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const applications = await ApplicationModel.find({ cycleId: req.params.id })
        .populate('studentId', 'fullName email')
        .lean();
      res.json(applications);
    } catch (err) {
      next(err);
    }
  },
);

// Student submits an application for a cycle
router.post(
  '/:id/apply',
  authenticate,
  requireRole('STUDENT'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cycleId = req.params.id;
      const studentId = req.user!.id;

      const cycle = await AllocationCycleModel.findById(cycleId);
      if (!cycle) {
        res.status(404).json({ error: 'Not Found', message: 'Cycle not found' });
        return;
      }

      if (cycle.status !== 'APPLICATIONS_OPEN') {
        res.status(400).json({
          error: 'Bad Request',
          message: `Applications are not currently open for this cycle (Status: ${cycle.status})`,
        });
        return;
      }

      const existing = await ApplicationModel.findOne({ cycleId, studentId });
      if (existing) {
        res.status(409).json({
          error: 'Conflict',
          message: 'You have already created an application for this cycle',
        });
        return;
      }

      const data = ApplicationSchema.parse({
        ...req.body,
        cycleId,
        studentId,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      });

      const application = new ApplicationModel(data);
      await application.save();

      await AuditService.log({
        action: 'APPLICATION_SUBMITTED',
        actorId: studentId,
        resourceType: 'Application',
        resourceId: application._id.toString(),
        after: application.toJSON(),
      });

      res.status(201).json(application.toJSON());
    } catch (err) {
      next(err);
    }
  },
);

export default router;
