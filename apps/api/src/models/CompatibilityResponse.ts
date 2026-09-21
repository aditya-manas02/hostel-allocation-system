import mongoose, { Schema, Document } from 'mongoose';

export interface ICompatibilityResponseDoc extends Document {
  studentId: mongoose.Types.ObjectId;
  consentGiven: boolean;
  consentTimestamp: Date;
  encryptedPayload: string; // enc:<version>:<iv>:<tag>:<ciphertext>
  keyVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompatibilityResponseSchema = new Schema<ICompatibilityResponseDoc>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    consentGiven: { type: Boolean, required: true },
    consentTimestamp: { type: Date, required: true },
    encryptedPayload: { type: String, required: true },
    keyVersion: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        // INVARIANT I6: Never leak encrypted payload or raw answers in JSON representations
        delete ret.encryptedPayload;
        ret.id = ret._id.toString();
        ret.studentId = ret.studentId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const CompatibilityResponseModel = mongoose.model<ICompatibilityResponseDoc>(
  'CompatibilityResponse',
  CompatibilityResponseSchema,
);
