import mongoose, { Schema, Document } from 'mongoose';
import { StructuredExplanation } from '@hostel/shared';

export interface IAllocationAssignmentDoc extends Document {
  draftId: mongoose.Types.ObjectId;
  bedId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  hostelId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  explanation: StructuredExplanation;
  isOverridden: boolean;
  overrideId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AllocationAssignmentSchema = new Schema<IAllocationAssignmentDoc>(
  {
    draftId: { type: Schema.Types.ObjectId, ref: 'AllocationDraft', required: true, index: true },
    bedId: { type: Schema.Types.ObjectId, ref: 'Bed', required: true, index: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    explanation: { type: Schema.Types.Mixed, required: true },
    isOverridden: { type: Boolean, default: false },
    overrideId: { type: Schema.Types.ObjectId, ref: 'Override', default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        ret.draftId = ret.draftId?.toString();
        ret.bedId = ret.bedId?.toString();
        ret.roomId = ret.roomId?.toString();
        ret.hostelId = ret.hostelId?.toString();
        ret.studentId = ret.studentId?.toString();
        if (ret.overrideId) ret.overrideId = ret.overrideId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

AllocationAssignmentSchema.index({ draftId: 1, studentId: 1 }, { unique: true });
AllocationAssignmentSchema.index({ draftId: 1, bedId: 1 }, { unique: true });

export const AllocationAssignmentModel = mongoose.model<IAllocationAssignmentDoc>(
  'AllocationAssignment',
  AllocationAssignmentSchema,
);
