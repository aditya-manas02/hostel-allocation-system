import mongoose from 'mongoose';
import { AllocationDraftModel, IAllocationDraftDoc } from '../models/AllocationDraft.js';
import { ApprovalModel } from '../models/Approval.js';
import { AuditService } from './AuditService.js';
import { AllocationCycleModel } from '../models/AllocationCycle.js';

export class DraftPublishService {
  /**
   * THE ONLY CODE PATH IN THE ENTIRE SYSTEM THAT SETS DRAFT STATUS TO 'PUBLISHED'.
   * INVARIANT I1: Draft/Published separation.
   * INVARIANT I2: Immutability after publish.
   */
  public static async publish(
    draftId: string,
    publisherId: string,
  ): Promise<IAllocationDraftDoc> {
    const session = await mongoose.startSession();

    try {
      let publishedDraft: IAllocationDraftDoc | null = null;

      const executePublish = async (s?: mongoose.ClientSession) => {
        const sessionOption = s ? { session: s } : {};
        // 1. Fetch draft
        const draft = await AllocationDraftModel.findById(draftId).session(s || null);
        const approval = draft
          ? await ApprovalModel.findOne({ draftId: draft._id })
              .sort({ timestamp: -1 })
              .session(s || null)
          : null;

        DraftPublishService.validatePublishPreconditions(draft, approval);

        // 3. Mark draft as PUBLISHED
        draft!.status = 'PUBLISHED';
        draft!.approvalId = approval!._id as any;
        draft!.publishedAt = new Date();
        await draft!.save(sessionOption);

        // 4. Update parent cycle status to PUBLISHED
        await AllocationCycleModel.findByIdAndUpdate(
          draft!.cycleId,
          { status: 'PUBLISHED' },
          sessionOption,
        );

        // 5. Invariant I1(c): Write audit entry
        await AuditService.log({
          action: 'DRAFT_PUBLISHED',
          actorId: publisherId,
          resourceType: 'AllocationDraft',
          resourceId: draft!._id.toString(),
          after: {
            version: draft!.version,
            approvalId: approval!._id.toString(),
            outputHash: draft!.outputHash,
            publishedAt: draft!.publishedAt,
          },
        });

        publishedDraft = draft;
      };

      try {
        await session.withTransaction(async () => {
          await executePublish(session);
        });
      } catch (txErr: any) {
        if (txErr.message?.includes('replica set member') || txErr.message?.includes('Transaction numbers')) {
          // Standalone MongoDB fallback for dev/test environments
          await executePublish();
        } else {
          throw txErr;
        }
      }

      return publishedDraft!;
    } finally {
      await session.endSession();
    }
  }

  /**
   * INVARIANT I2: Verifies draft immutability.
   * Throws if attempting to mutate an already published draft or assignment.
   */
  public static async assertMutable(draftId: string): Promise<void> {
    const draft = await AllocationDraftModel.findById(draftId).lean();
    if (draft && draft.status === 'PUBLISHED') {
      throw new Error(
        'Invariant Violation [I2]: Published drafts, assignments, and explanations are immutable and cannot be modified.',
      );
    }
  }

  /**
   * INVARIANT I1 & I2: Validates pre-conditions for publishing.
   * Throws explicit invariant violations if checks fail.
   */
  public static validatePublishPreconditions(
    draft: { status: string; outputHash: string; _id?: any } | null,
    approval: { draftVersionHash: string; _id?: any } | null,
  ): void {
    if (!draft) {
      throw new Error('Draft not found.');
    }

    if (draft.status === 'PUBLISHED') {
      throw new Error('Invariant Violation [I2]: Draft is already PUBLISHED and is immutable.');
    }

    if (draft.status === 'SUPERSEDED' || draft.status === 'CANCELLED' || draft.status === 'FAILED') {
      throw new Error(`Cannot publish draft with status '${draft.status}'.`);
    }

    if (!approval) {
      throw new Error(
        'Invariant Violation [I1]: Cannot publish draft without an existing approval record.',
      );
    }

    // Verify draft version hash matches current draft output hash
    if (approval.draftVersionHash !== draft.outputHash) {
      throw new Error(
        `Invariant Violation [I1]: Stale approval hash! Approval hash '${approval.draftVersionHash}' does not match current draft output hash '${draft.outputHash}'.`,
      );
    }
  }
}
