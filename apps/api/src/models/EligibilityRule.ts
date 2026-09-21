import mongoose, { Schema, Document } from 'mongoose';

export interface IEligibilityRuleDoc extends Document {
  ruleId: string;
  version: string;
  name: string;
  description: string;
  policyClause: string; // e.g. "Hostel Manual 2026, Section 4.2"
  category: 'ACADEMIC' | 'GEOGRAPHIC' | 'DOCUMENT' | 'CONDUCT' | 'ACCESSIBILITY';
  conditionExpression: Record<string, any>;
  failureReasonTemplate: string;
  remedyInstructions: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EligibilityRuleSchema = new Schema<IEligibilityRuleDoc>(
  {
    ruleId: { type: String, required: true, unique: true, trim: true },
    version: { type: String, required: true, default: 'v1' },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    policyClause: { type: String, required: true },
    category: {
      type: String,
      enum: ['ACADEMIC', 'GEOGRAPHIC', 'DOCUMENT', 'CONDUCT', 'ACCESSIBILITY'],
      required: true,
    },
    conditionExpression: { type: Schema.Types.Mixed, required: true },
    failureReasonTemplate: { type: String, required: true },
    remedyInstructions: { type: String, required: true },
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

export const EligibilityRuleModel = mongoose.model<IEligibilityRuleDoc>(
  'EligibilityRule',
  EligibilityRuleSchema,
);
