import { Router, Request, Response, NextFunction } from 'express';
import { BedModel } from '../models/Bed.js';
import { RoomModel } from '../models/Room.js';
import { AllocationDraftModel } from '../models/AllocationDraft.js';
import { AllocationAssignmentModel } from '../models/AllocationAssignment.js';
import { ApprovalModel } from '../models/Approval.js';
import { RoomChangeRequestModel } from '../models/RoomChangeRequest.js';
import { DraftPublishService } from '../services/DraftPublishService.js';
import { OverrideService } from '../services/OverrideService.js';
import { WaitlistService } from '../services/WaitlistService.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole, requireHostelAccess } from '../middleware/rbac.js';
import { AuditService } from '../services/AuditService.js';

const router = Router();

// 1. Visual Bed-Map per Floor (Warden hostel-scoped)
router.get(
  '/bedmap/:hostelId/:floorId',
  authenticate,
  requireRole('WARDEN', 'CHIEF_WARDEN', 'ADMIN', 'SYSTEM_ADMIN'),
  requireHostelAccess('hostelId'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { hostelId, floorId } = req.params;
      const draftId = req.query.draftId as string;

      const rooms = await RoomModel.find({ floorId, hostelId, isActive: true }).lean();
      const beds = await BedModel.find({ floorId, hostelId, isActive: true }).lean();

      let assignments: any[] = [];
      if (draftId) {
        assignments = await AllocationAssignmentModel.find({ draftId, hostelId })
          .populate('studentId', 'fullName email')
          .lean();
      }

      const assignmentMap = new Map(assignments.map((a) => [a.bedId.toString(), a]));

      const bedMapData = rooms.map((room) => {
        const roomBeds = beds
          .filter((b) => b.roomId.toString() === room._id.toString())
          .map((b) => {
            const assignment = assignmentMap.get(b._id.toString());
            return {
              ...b,
              assignment: assignment
                ? {
                    studentId: assignment.studentId._id,
                    studentName: assignment.studentId.fullName,
                    explanation: assignment.explanation,
                    isOverridden: assignment.isOverridden,
                  }
                : null,
            };
          });

        return {
          ...room,
          beds: roomBeds,
        };
      });

      res.json({
        hostelId,
        floorId,
        rooms: bedMapData,
      });
    } catch (err) {
      next(err);
    }
  },
);

// 2. Apply Manual Override (Warden / Chief Warden)
router.post(
  '/drafts/:id/override',
  authenticate,
  requireRole('WARDEN', 'CHIEF_WARDEN', 'ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const draftId = req.params.id;
      const {
        bedId,
        newStudentId,
        reasonCategory,
        reasonText,
        isEscalated,
        chiefWardenApprovalId,
      } = req.body;

      const override = await OverrideService.applyOverride({
        draftId: draftId!,
        bedId,
        newStudentId,
        reasonCategory,
        reasonText,
        actorId: req.user!.id,
        actorRole: req.user!.role,
        isEscalated,
        chiefWardenApprovalId,
      });

      res.status(201).json({
        message: 'Override applied successfully',
        override: override.toJSON(),
      });
    } catch (err) {
      next(err);
    }
  },
);

// 3. Approve Draft (Warden / Chief Warden)
router.post(
  '/drafts/:id/approve',
  authenticate,
  requireRole('WARDEN', 'CHIEF_WARDEN', 'ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const draftId = req.params.id;
      const draft = await AllocationDraftModel.findById(draftId);
      if (!draft) {
        res.status(404).json({ error: 'Not Found', message: 'Draft not found' });
        return;
      }

      const scope = req.user!.role === 'WARDEN' ? 'HOSTEL_SPECIFIC' : 'CROSS_HOSTEL_ALL';
      const targetHostelId = req.user!.assignedHostelId || req.body.targetHostelId;

      const approval = new ApprovalModel({
        draftId: draft._id,
        approverId: req.user!.id,
        approverRole: req.user!.role,
        draftVersionHash: draft.outputHash, // Store draft version hash
        scope,
        targetHostelId,
        timestamp: new Date(),
      });
      await approval.save();

      draft.status = 'APPROVED';
      draft.approvalId = approval._id as any;
      await draft.save();

      await AuditService.log({
        action: 'DRAFT_APPROVED',
        actorId: req.user!.id,
        resourceType: 'AllocationDraft',
        resourceId: draft._id.toString(),
        after: { approvalId: approval._id.toString(), draftVersionHash: draft.outputHash },
      });

      res.status(201).json({
        message: 'Draft approved successfully',
        approval: approval.toJSON(),
      });
    } catch (err) {
      next(err);
    }
  },
);

// 4. Publish Draft (THE ONLY PUBLISH PATH — Invariant I1)
router.post(
  '/drafts/:id/publish',
  authenticate,
  requireRole('CHIEF_WARDEN', 'ADMIN', 'SYSTEM_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const draftId = req.params.id;
      const publishedDraft = await DraftPublishService.publish(draftId!, req.user!.id);

      res.json({
        message: 'Draft successfully published!',
        draft: publishedDraft.toJSON(),
      });
    } catch (err) {
      next(err);
    }
  },
);

// 5. Room Change Request (Student)
router.post(
  '/room-change',
  authenticate,
  requireRole('STUDENT'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentBedId, requestedHostelId, reason } = req.body;
      const request = new RoomChangeRequestModel({
        studentId: req.user!.id,
        currentBedId,
        requestedHostelId,
        reason,
        status: 'PENDING',
      });
      await request.save();

      await AuditService.log({
        action: 'ROOM_CHANGE_REQUESTED',
        actorId: req.user!.id,
        resourceType: 'RoomChangeRequest',
        resourceId: request._id.toString(),
        after: request.toJSON(),
      });

      res.status(201).json(request.toJSON());
    } catch (err) {
      next(err);
    }
  },
);

// 6. Decide Room Change (Warden)
router.patch(
  '/room-change/:id',
  authenticate,
  requireRole('WARDEN', 'CHIEF_WARDEN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, wardenDecisionReason, cycleId } = req.body;
      const request = await RoomChangeRequestModel.findById(req.params.id);
      if (!request) {
        res.status(404).json({ error: 'Not Found', message: 'Request not found' });
        return;
      }

      request.status = status;
      request.wardenDecisionReason = wardenDecisionReason;
      request.decidedBy = req.user!.id as any;
      request.decidedAt = new Date();
      await request.save();

      // If approved, trigger auto-promotion from waitlist
      let promotionResult = null;
      if (status === 'APPROVED' && cycleId) {
        promotionResult = await WaitlistService.autoPromoteOnVacancy(
          cycleId,
          request.currentBedId.toString(),
          req.user!.id,
        );
      }

      await AuditService.log({
        action: 'ROOM_CHANGE_DECIDED',
        actorId: req.user!.id,
        resourceType: 'RoomChangeRequest',
        resourceId: request._id.toString(),
        after: { status, wardenDecisionReason, promotionResult },
      });

      res.json({
        request: request.toJSON(),
        promotionResult,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
