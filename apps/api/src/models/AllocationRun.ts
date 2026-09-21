import mongoose, { Schema, Document } from 'mongoose';

export interface IAllocationRunDoc extends Document {
  cycleId: mongoose.Types.ObjectId;
  draftId?: mongoose.Types.ObjectId;
  seed: string;
  parameters: Record<string, any>;
  inputSnapshotHash?: string;
  engineVersion: string;
  outputHash?: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  stats?: {
    totalAssigned: number;
    totalUnassigned: number;
    firstChoicePercentage: number;
    averageCompatibilityScore: number | null;
  };
  durationMs?: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AllocationRunSchema = new Schema<IAllocationRunDoc>(
  {
    cycleId: { type: Schema.Types.ObjectId, ref: 'AllocationCycle', required: true, index: true },
    draftId: { type: Schema.Types.ObjectId, ref: 'AllocationDraft', default: null },
    seed: { type: String, required: true },
    parameters: { type: Schema.Types.Mixed, default: {} },
    inputSnapshotHash: { type: String },
    engineVersion: { type: String, default: '1.0.0' },
    outputHash: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    progress: { type: Number, default: 0 },
    stats: { type: Schema.Types.Mixed },
    durationMs: { type: Number },
    error: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        ret.cycleId = ret.cycleId?.toString();
        if (ret.draftId) ret.draftId = ret.draftId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const AllocationRunModel = mongoose.model<IAllocationRunDoc>(
  'AllocationRun',
  AllocationRunSchema,
);
