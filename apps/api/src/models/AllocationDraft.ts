import mongoose, { Schema, Document } from 'mongoose';
import { DraftStatus, DRAFT_STATUSES } from '@hostel/shared';

export interface IAllocationDraftDoc extends Document {
  cycleId: mongoose.Types.ObjectId;
  version: number;
  status: DraftStatus;
  seed: string;
  parameters: Record<string, any>;
  inputSnapshotHash: string;
  engineVersion: string;
  outputHash: string;
  stats: {
    totalAssigned: number;
    totalUnassigned: number;
    firstChoicePercentage: number;
    averageCompatibilityScore: number | null;
    executionTimeMs: number;
  };
  approvalId?: mongoose.Types.ObjectId;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AllocationDraftSchema = new Schema<IAllocationDraftDoc>(
  {
    cycleId: { type: Schema.Types.ObjectId, ref: 'AllocationCycle', required: true, index: true },
    version: { type: Number, required: true, default: 1 },
    status: { type: String, enum: DRAFT_STATUSES, default: 'GENERATING', index: true },
    seed: { type: String, required: true },
    parameters: { type: Schema.Types.Mixed, default: {} },
    inputSnapshotHash: { type: String, required: true },
    engineVersion: { type: String, required: true },
    outputHash: { type: String, required: true },
    stats: {
      totalAssigned: { type: Number, required: true },
      totalUnassigned: { type: Number, required: true },
      firstChoicePercentage: { type: Number, required: true },
      averageCompatibilityScore: { type: Number, default: null },
      executionTimeMs: { type: Number, required: true },
    },
    approvalId: { type: Schema.Types.ObjectId, ref: 'Approval', default: null },
    publishedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        ret.cycleId = ret.cycleId?.toString();
        if (ret.approvalId) ret.approvalId = ret.approvalId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

AllocationDraftSchema.index({ cycleId: 1, version: 1 }, { unique: true });

// INVARIANT I1 & I2: Guard against direct updates setting PUBLISHED without DraftPublishService
AllocationDraftSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'PUBLISHED') {
    // Only allow if publishing flag or approvalId is verified
    if (!this.approvalId) {
      return next(new Error('Invariant Violation [I1]: Cannot publish draft without an approval record.'));
    }
  }
  next();
});

export const AllocationDraftModel = mongoose.model<IAllocationDraftDoc>(
  'AllocationDraft',
  AllocationDraftSchema,
);
