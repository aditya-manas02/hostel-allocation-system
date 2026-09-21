import mongoose, { Schema, Document } from 'mongoose';
import { GenderDesignation, GENDER_DESIGNATIONS } from '@hostel/shared';

export interface IBlockDoc extends Document {
  hostelId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  genderDesignation: GenderDesignation;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BlockSchema = new Schema<IBlockDoc>(
  {
    hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    genderDesignation: { type: String, enum: GENDER_DESIGNATIONS, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        ret.hostelId = ret.hostelId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

BlockSchema.index({ hostelId: 1, code: 1 }, { unique: true });

export const BlockModel = mongoose.model<IBlockDoc>('Block', BlockSchema);
