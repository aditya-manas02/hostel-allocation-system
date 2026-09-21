import mongoose, { Schema, Document } from 'mongoose';
import { Role, ROLES } from '@hostel/shared';

export interface IUserDoc extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  role: Role;
  assignedHostelId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    role: { type: String, enum: ROLES, required: true },
    assignedHostelId: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const UserModel = mongoose.model<IUserDoc>('User', UserSchema);
