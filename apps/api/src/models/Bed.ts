import mongoose, { Schema, Document } from 'mongoose';
import { BedStatus, BED_STATUSES } from '@hostel/shared';

export interface IBedDoc extends Document {
  roomId: mongoose.Types.ObjectId;
  floorId: mongoose.Types.ObjectId;
  blockId: mongoose.Types.ObjectId;
  hostelId: mongoose.Types.ObjectId;
  bedLabel: string;
  status: BedStatus;
  isAccessible: boolean;
  currentOccupantId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BedSchema = new Schema<IBedDoc>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    floorId: { type: Schema.Types.ObjectId, ref: 'Floor', required: true, index: true },
    blockId: { type: Schema.Types.ObjectId, ref: 'Block', required: true, index: true },
    hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    bedLabel: { type: String, required: true, trim: true },
    status: { type: String, enum: BED_STATUSES, default: 'AVAILABLE', index: true },
    isAccessible: { type: Boolean, default: false, index: true },
    currentOccupantId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        ret.roomId = ret.roomId.toString();
        ret.floorId = ret.floorId.toString();
        ret.blockId = ret.blockId.toString();
        ret.hostelId = ret.hostelId.toString();
        if (ret.currentOccupantId) {
          ret.currentOccupantId = ret.currentOccupantId.toString();
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

BedSchema.index({ roomId: 1, bedLabel: 1 }, { unique: true });

export const BedModel = mongoose.model<IBedDoc>('Bed', BedSchema);
