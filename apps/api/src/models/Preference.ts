import mongoose, { Schema, Document } from 'mongoose';
import { RoomType, ROOM_TYPES } from '@hostel/shared';

export interface IPreferenceDoc extends Document {
  cycleId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  rankedHostelIds: mongoose.Types.ObjectId[];
  rankedRoomTypes: RoomType[];
  requestedRoommateStudentIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PreferenceSchema = new Schema<IPreferenceDoc>(
  {
    cycleId: { type: Schema.Types.ObjectId, ref: 'AllocationCycle', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rankedHostelIds: [{ type: Schema.Types.ObjectId, ref: 'Hostel', required: true }],
    rankedRoomTypes: [{ type: String, enum: ROOM_TYPES, required: true }],
    requestedRoommateStudentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        ret.cycleId = ret.cycleId?.toString();
        ret.studentId = ret.studentId?.toString();
        ret.rankedHostelIds = ret.rankedHostelIds?.map((h: any) => h.toString());
        ret.requestedRoommateStudentIds = ret.requestedRoommateStudentIds?.map((u: any) => u.toString());
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

PreferenceSchema.index({ cycleId: 1, studentId: 1 }, { unique: true });

export const PreferenceModel = mongoose.model<IPreferenceDoc>('Preference', PreferenceSchema);
