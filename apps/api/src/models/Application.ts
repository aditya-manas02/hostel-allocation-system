import mongoose, { Schema, Document } from 'mongoose';
import {
  ApplicationStatus,
  APPLICATION_STATUSES,
  FeeCategory,
  FEE_CATEGORIES,
  Gender,
  GENDERS,
  QuotaCategory,
  QUOTA_CATEGORIES,
} from '@hostel/shared';

export interface IApplicationDoc extends Document {
  cycleId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  programme: string;
  yearOfStudy: number;
  gender: Gender;
  quotaCategory: QuotaCategory;
  feeCategory: FeeCategory;
  accessibilityRequired: boolean;
  accessibilityReason?: string;
  meritRank?: number;
  submittedAt?: Date;
  documents: Array<{
    docType: string;
    url: string;
    verified: boolean;
  }>;
  eligibilityResult?: {
    isEligible: boolean;
    evaluatedAt: Date;
    reasons: string[];
    failedRuleIds: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplicationDoc>(
  {
    cycleId: { type: Schema.Types.ObjectId, ref: 'AllocationCycle', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: APPLICATION_STATUSES, default: 'DRAFT', index: true },
    programme: { type: String, required: true, trim: true },
    yearOfStudy: { type: Number, required: true, min: 1, max: 6 },
    gender: { type: String, enum: GENDERS, required: true },
    quotaCategory: { type: String, enum: QUOTA_CATEGORIES, default: 'GENERAL' },
    feeCategory: { type: String, enum: FEE_CATEGORIES, default: 'STANDARD' },
    accessibilityRequired: { type: Boolean, default: false },
    accessibilityReason: { type: String },
    meritRank: { type: Number },
    submittedAt: { type: Date },
    documents: [
      {
        docType: { type: String, required: true },
        url: { type: String, required: true },
        verified: { type: Boolean, default: false },
      },
    ],
    eligibilityResult: {
      isEligible: { type: Boolean },
      evaluatedAt: { type: Date },
      reasons: { type: [String], default: [] },
      failedRuleIds: { type: [String], default: [] },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        ret.cycleId = ret.cycleId.toString();
        ret.studentId = ret.studentId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

ApplicationSchema.index({ cycleId: 1, studentId: 1 }, { unique: true });

export const ApplicationModel = mongoose.model<IApplicationDoc>('Application', ApplicationSchema);
