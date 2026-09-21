import mongoose, { Schema, Document } from 'mongoose';
import { GenderDesignation, GENDER_DESIGNATIONS } from '@hostel/shared';

export interface IHostelDoc extends Document {
  name: string;
  code: string;
  genderDesignation: GenderDesignation;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HostelSchema = new Schema<IHostelDoc>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    genderDesignation: { type: String, enum: GENDER_DESIGNATIONS, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const HostelModel = mongoose.model<IHostelDoc>('Hostel', HostelSchema);
