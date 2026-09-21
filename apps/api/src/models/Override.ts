import mongoose, { Schema, Document } from 'mongoose';
import {
  OverrideCategory,
  OVERRIDE_CATEGORIES,
  Role,
  ROLES,
} from '@hostel/shared';

export interface IOverrideDoc extends Document {
  draftId: mongoose.Types.ObjectId;
  bedId: mongoose.Types.ObjectId;
  previousStudentId?: mongoose.Types.ObjectId;
  newStudentId: mongoose.Types.ObjectId;
  reasonCategory: OverrideCategory;
  reasonText: string;
  actorId: mongoose.Types.ObjectId;
  actorRole: Role;
  isEscalated: boolean;
  chiefWardenApprovalId?: mongoose.Types.ObjectId;
  timestamp: Date;
}

const OverrideSchema = new Schema<IOverrideDoc>(
  {
    draftId: { type: Schema.Types.ObjectId, ref: 'AllocationDraft', required: true, index: true },
    bedId: { type: Schema.Types.ObjectId, ref: 'Bed', required: true },
    previousStudentId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    newStudentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reasonCategory: { type: String, enum: OVERRIDE_CATEGORIES, required: true },
    reasonText: {
      type: String,
      required: true,
      minlength: [10, 'Invariant Violation [I5]: Override reason must be at least 10 characters'],
      trim: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorRole: { type: String, enum: ROLES, required: true },
    isEscalated: { type: Boolean, default: false },
    chiefWardenApprovalId: { type: Schema.Types.ObjectId, ref: 'Approval', default: null },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    versionKey: false,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        ret.draftId = ret.draftId?.toString();
        ret.bedId = ret.bedId?.toString();
        if (ret.previousStudentId) ret.previousStudentId = ret.previousStudentId.toString();
        ret.newStudentId = ret.newStudentId?.toString();
        ret.actorId = ret.actorId?.toString();
        if (ret.chiefWardenApprovalId) ret.chiefWardenApprovalId = ret.chiefWardenApprovalId.toString();
        delete ret._id;
        return ret;
      },
    },
  },
);

export const OverrideModel = mongoose.model<IOverrideDoc>('Override', OverrideSchema);
