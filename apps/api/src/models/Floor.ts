import mongoose, { Schema, Document } from 'mongoose';

export interface IFloorDoc extends Document {
  blockId: mongoose.Types.ObjectId;
  hostelId: mongoose.Types.ObjectId;
  floorNumber: number;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FloorSchema = new Schema<IFloorDoc>(
  {
    blockId: { type: Schema.Types.ObjectId, ref: 'Block', required: true, index: true },
    hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    floorNumber: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        ret.blockId = ret.blockId?.toString();
        ret.hostelId = ret.hostelId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

FloorSchema.index({ blockId: 1, floorNumber: 1 }, { unique: true });

export const FloorModel = mongoose.model<IFloorDoc>('Floor', FloorSchema);
