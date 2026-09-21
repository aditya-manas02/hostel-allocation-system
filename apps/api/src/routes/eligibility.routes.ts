import { Router, Request, Response, NextFunction } from 'express';
import { ApplicationModel } from '../models/Application.js';
import { AllocationCycleModel } from '../models/AllocationCycle.js';
import { EligibilityEngine } from '../services/EligibilityEngine.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { AuditService } from '../services/AuditService.js';

const router = Router();

// Student checks their eligibility status and reasons
router.get(
  '/:cycleId/me',
  authenticate,
  requireRole('STUDENT'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cycleId = req.params.cycleId;
      const studentId = req.user!.id;

      const cycle = await AllocationCycleModel.findById(cycleId);
      const app = await ApplicationModel.findOne({ cycleId, studentId });

      if (!app) {
        res.status(404).json({
          error: 'Not Found',
          message: 'No application found for this cycle.',
        });
        return;
      }

      const report = EligibilityEngine.evaluate(
        app.toObject() as any,
        cycle?.documentRequirements || ['STUDENT_ID', 'FEE_RECEIPT'],
      );

      // Persist eligibility result on the application document
      app.eligibilityResult = {
        isEligible: report.isEligible,
        evaluatedAt: report.evaluatedAt,
        reasons: report.reasons,
        failedRuleIds: report.failedRuleIds,
      };
      app.status = report.isEligible ? 'ELIGIBLE' : 'INELIGIBLE';
      await app.save();

      await AuditService.log({
        action: 'ELIGIBILITY_EVALUATED',
        actorId: studentId,
        resourceType: 'Application',
        resourceId: app._id.toString(),
        after: { isEligible: report.isEligible, failedRuleIds: report.failedRuleIds },
      });

      res.json(report);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
