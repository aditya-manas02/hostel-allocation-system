import mongoose, { Schema, Document } from 'mongoose';
import {
  GenderDesignation,
  GENDER_DESIGNATIONS,
  RoomStatus,
  ROOM_STATUSES,
  RoomType,
  ROOM_TYPES,
} from '@hostel/shared';

export interface IRoomDoc extends Document {
  floorId: mongoose.Types.ObjectId;
  blockId: mongoose.Types.ObjectId;
  hostelId: mongoose.Types.ObjectId;
  roomNumber: string;
  roomType: RoomType;
  capacity: number;
  genderDesignation: GenderDesignation;
  isAccessible: boolean;
  status: RoomStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoomDoc>(
  {
    floorId: { type: Schema.Types.ObjectId, ref: 'Floor', required: true, index: true },
    blockId: { type: Schema.Types.ObjectId, ref: 'Block', required: true, index: true },
    hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    roomNumber: { type: String, required: true, trim: true },
    roomType: { type: String, enum: ROOM_TYPES, required: true },
    capacity: { type: Number, required: true, min: 1, max: 8 },
    genderDesignation: { type: String, enum: GENDER_DESIGNATIONS, required: true },
    isAccessible: { type: Boolean, default: false },
    status: { type: String, enum: ROOM_STATUSES, default: 'AVAILABLE' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        ret.floorId = ret.floorId.toString();
        ret.blockId = ret.blockId.toString();
        ret.hostelId = ret.hostelId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

RoomSchema.index({ floorId: 1, roomNumber: 1 }, { unique: true });

export const RoomModel = mongoose.model<IRoomDoc>('Room', RoomSchema);
