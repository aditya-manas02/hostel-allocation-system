import mongoose, { Schema, Document } from 'mongoose';
import { CycleStatus, CYCLE_STATUSES, QuotaCategory } from '@hostel/shared';

export interface IAllocationCycleDoc extends Document {
  academicYear: string;
  term: string;
  status: CycleStatus;
  applicationStartDate: Date;
  applicationEndDate: Date;
  eligibilityRuleSetVersion: string;
  documentRequirements: string[];
  quotas: Record<QuotaCategory, number>;
  createdAt: Date;
  updatedAt: Date;
}

const AllocationCycleSchema = new Schema<IAllocationCycleDoc>(
  {
    academicYear: { type: String, required: true, trim: true },
    term: { type: String, required: true, trim: true },
    status: { type: String, enum: CYCLE_STATUSES, default: 'UPCOMING', index: true },
    applicationStartDate: { type: Date, required: true },
    applicationEndDate: { type: Date, required: true },
    eligibilityRuleSetVersion: { type: String, default: 'v1' },
    documentRequirements: { type: [String], default: [] },
    quotas: {
      type: Schema.Types.Mixed,
      default: {
        GENERAL: 60,
        SPORTS: 10,
        INTERNATIONAL: 10,
        PWD: 5,
        SCHOLARSHIP: 10,
        STAFF_WARD: 5,
      },
    },
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

AllocationCycleSchema.index({ academicYear: 1, term: 1 }, { unique: true });

export const AllocationCycleModel = mongoose.model<IAllocationCycleDoc>(
  'AllocationCycle',
  AllocationCycleSchema,
);
