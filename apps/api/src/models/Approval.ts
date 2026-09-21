import mongoose, { Schema, Document } from 'mongoose';
import { Role, ROLES } from '@hostel/shared';

export interface IApprovalDoc extends Document {
  draftId: mongoose.Types.ObjectId;
  approverId: mongoose.Types.ObjectId;
  approverRole: Role;
  draftVersionHash: string;
  scope: 'HOSTEL_SPECIFIC' | 'CROSS_HOSTEL_ALL';
  targetHostelId?: mongoose.Types.ObjectId;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalSchema = new Schema<IApprovalDoc>(
  {
    draftId: { type: Schema.Types.ObjectId, ref: 'AllocationDraft', required: true, index: true },
    approverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approverRole: { type: String, enum: ROLES, required: true },
    draftVersionHash: { type: String, required: true },
    scope: { type: String, enum: ['HOSTEL_SPECIFIC', 'CROSS_HOSTEL_ALL'], required: true },
    targetHostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', default: null },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        ret.draftId = ret.draftId?.toString();
        ret.approverId = ret.approverId?.toString();
        if (ret.targetHostelId) ret.targetHostelId = ret.targetHostelId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const ApprovalModel = mongoose.model<IApprovalDoc>('Approval', ApprovalSchema);
