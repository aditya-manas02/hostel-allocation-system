import mongoose, { Schema, Document } from 'mongoose';

export interface IWaitlistEntryDoc extends Document {
  cycleId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  position: number;
  reason: string;
  status: 'ACTIVE' | 'PROMOTED' | 'CANCELLED';
  promotedToBedId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WaitlistEntrySchema = new Schema<IWaitlistEntryDoc>(
  {
    cycleId: { type: Schema.Types.ObjectId, ref: 'AllocationCycle', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    position: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['ACTIVE', 'PROMOTED', 'CANCELLED'], default: 'ACTIVE', index: true },
    promotedToBedId: { type: Schema.Types.ObjectId, ref: 'Bed', default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        ret.cycleId = ret.cycleId?.toString();
        ret.studentId = ret.studentId?.toString();
        if (ret.promotedToBedId) ret.promotedToBedId = ret.promotedToBedId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

WaitlistEntrySchema.index({ cycleId: 1, position: 1 });

export const WaitlistEntryModel = mongoose.model<IWaitlistEntryDoc>(
  'WaitlistEntry',
  WaitlistEntrySchema,
);
