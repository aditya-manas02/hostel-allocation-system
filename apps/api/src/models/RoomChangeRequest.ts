import mongoose, { Schema, Document } from 'mongoose';

export interface IRoomChangeRequestDoc extends Document {
  studentId: mongoose.Types.ObjectId;
  currentBedId: mongoose.Types.ObjectId;
  requestedHostelId: mongoose.Types.ObjectId;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  wardenDecisionReason?: string;
  decidedBy?: mongoose.Types.ObjectId;
  decidedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RoomChangeRequestSchema = new Schema<IRoomChangeRequestDoc>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    currentBedId: { type: Schema.Types.ObjectId, ref: 'Bed', required: true },
    requestedHostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
    reason: { type: String, required: true, minlength: 10 },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING', index: true },
    wardenDecisionReason: { type: String },
    decidedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    decidedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        ret.studentId = ret.studentId?.toString();
        ret.currentBedId = ret.currentBedId?.toString();
        ret.requestedHostelId = ret.requestedHostelId?.toString();
        if (ret.decidedBy) ret.decidedBy = ret.decidedBy.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const RoomChangeRequestModel = mongoose.model<IRoomChangeRequestDoc>(
  'RoomChangeRequest',
  RoomChangeRequestSchema,
);
