import { OverrideCategory, Role } from '@hostel/shared';
import { HardConstraints } from '@hostel/engine';
import { AllocationAssignmentModel } from '../models/AllocationAssignment.js';
import { BedModel } from '../models/Bed.js';
import { RoomModel } from '../models/Room.js';
import { UserModel } from '../models/User.js';
import { OverrideModel, IOverrideDoc } from '../models/Override.js';
import { AuditService } from './AuditService.js';
import { DraftPublishService } from './DraftPublishService.js';

export interface ApplyOverrideParams {
  draftId: string;
  bedId: string;
  newStudentId: string;
  reasonCategory: OverrideCategory;
  reasonText: string;
  actorId: string;
  actorRole: Role;
  isEscalated?: boolean;
  chiefWardenApprovalId?: string;
}

export class OverrideService {
  /**
   * Applies a reasoned manual override to a draft allocation.
   * INVARIANT I5: Mandatory reason, category, before/after, and hard constraint validation.
   */
  public static async applyOverride(params: ApplyOverrideParams): Promise<IOverrideDoc> {
    // 1. Invariant I5: Validate reason length and category
    if (!params.reasonText || params.reasonText.trim().length < 10) {
      throw new Error(
        'Invariant Violation [I5]: Override requires a non-empty reason with at least 10 characters.',
      );
    }

    if (!params.reasonCategory) {
      throw new Error('Invariant Violation [I5]: Override requires a valid reason category.');
    }

    // 2. Invariant I2 check: draft must not be published
    await DraftPublishService.assertMutable(params.draftId);

    // 3. Fetch resources
    const bed = await BedModel.findById(params.bedId);
    if (!bed) throw new Error(`Bed ${params.bedId} not found.`);

    const room = await RoomModel.findById(bed.roomId);
    if (!room) throw new Error(`Room ${bed.roomId} not found.`);

    const newStudent = await UserModel.findById(params.newStudentId);
    if (!newStudent) throw new Error(`Student ${params.newStudentId} not found.`);

    // 4. Check existing assignment for this bed
    const existingAssignment = await AllocationAssignmentModel.findOne({
      draftId: params.draftId,
      bedId: params.bedId,
    });

    const previousStudentId = existingAssignment ? existingAssignment.studentId.toString() : null;

    // 5. Hard constraint re-validation (Gender & Accessibility)
    const isGenderFeasible = HardConstraints.isGenderFeasible(
      (newStudent as any).gender || 'OTHER',
      room.genderDesignation,
    );

    const isAccessibleFeasible = HardConstraints.isAccessibilityFeasible(
      (newStudent as any).accessibilityRequired || false,
      bed.isAccessible,
    );

    const hasHardConstraintViolation = !isGenderFeasible || !isAccessibleFeasible;

    if (hasHardConstraintViolation) {
      // Invariant I5: Escalation to Chief Warden required
      if (!params.isEscalated || !params.chiefWardenApprovalId) {
        throw new Error(
          'Invariant Violation [I5]: Hard constraint violation detected! A warden cannot violate a hard constraint without an explicit escalated approval by Chief Warden.',
        );
      }
    }

    // 6. Record Override
    const override = new OverrideModel({
      draftId: params.draftId,
      bedId: params.bedId,
      previousStudentId,
      newStudentId: params.newStudentId,
      reasonCategory: params.reasonCategory,
      reasonText: params.reasonText.trim(),
      actorId: params.actorId,
      actorRole: params.actorRole,
      isEscalated: params.isEscalated || false,
      chiefWardenApprovalId: params.chiefWardenApprovalId,
      timestamp: new Date(),
    });
    await override.save();

    // 7. Update Assignment
    if (existingAssignment) {
      existingAssignment.studentId = newStudent._id as any;
      existingAssignment.isOverridden = true;
      existingAssignment.overrideId = override._id as any;
      existingAssignment.explanation.rationaleText += ` [OVERRIDDEN by ${params.actorRole}: ${params.reasonText}]`;
      await existingAssignment.save();
    } else {
      await AllocationAssignmentModel.create({
        draftId: params.draftId,
        bedId: bed._id,
        roomId: room._id,
        hostelId: bed.hostelId,
        studentId: newStudent._id,
        explanation: {
          preferenceRankSatisfied: null,
          isFirstChoice: false,
          constraintsChecked: ['MANUAL_OVERRIDE_VERIFIED'],
          quotaBucketUsed: 'GENERAL',
          tiebreakValue: 0,
          roommateCompatibilityScore: null,
          rationaleText: `Manually assigned by ${params.actorRole}: ${params.reasonText}`,
        },
        isOverridden: true,
        overrideId: override._id,
      });
    }

    // 8. Invariant I7: Audit log
    await AuditService.log({
      action: 'OVERRIDE_APPLIED',
      actorId: params.actorId,
      resourceType: 'AllocationAssignment',
      resourceId: params.bedId,
      before: { previousStudentId },
      after: {
        newStudentId: params.newStudentId,
        reasonCategory: params.reasonCategory,
        reasonText: params.reasonText,
        isEscalated: params.isEscalated,
      },
    });

    return override;
  }
}
