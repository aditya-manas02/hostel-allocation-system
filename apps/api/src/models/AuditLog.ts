import mongoose, { Schema, Document } from 'mongoose';
import { AuditAction, AUDIT_ACTIONS } from '@hostel/shared';

export interface IAuditLogDoc extends Document {
  sequence: number;
  batchId: string;
  action: AuditAction;
  actorId: string;
  resourceType: string;
  resourceId: string;
  before: Record<string, any> | null;
  after: Record<string, any> | null;
  timestamp: Date;
  previousHash: string;
  hash: string;
}

const AuditLogSchema = new Schema<IAuditLogDoc>(
  {
    sequence: { type: Number, required: true },
    batchId: { type: String, required: true, default: 'GLOBAL', index: true },
    action: { type: String, enum: AUDIT_ACTIONS, required: true },
    actorId: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String, required: true },
    before: { type: Schema.Types.Mixed, default: null },
    after: { type: Schema.Types.Mixed, default: null },
    timestamp: { type: Date, required: true, default: Date.now },
    previousHash: { type: String, required: true },
    hash: { type: String, required: true },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

// Enforce strictly linear append per batch
AuditLogSchema.index({ batchId: 1, sequence: 1 }, { unique: true });

// Immutability guards: Reject any update or delete operations on audit records
AuditLogSchema.pre('updateOne', function () {
  throw new Error('Audit records are append-only and cannot be updated.');
});
AuditLogSchema.pre('updateMany', function () {
  throw new Error('Audit records are append-only and cannot be updated.');
});
AuditLogSchema.pre('findOneAndUpdate', function () {
  throw new Error('Audit records are append-only and cannot be updated.');
});
AuditLogSchema.pre('deleteOne', function () {
  throw new Error('Audit records are append-only and cannot be deleted.');
});
AuditLogSchema.pre('deleteMany', function () {
  throw new Error('Audit records are append-only and cannot be deleted.');
});
AuditLogSchema.pre('findOneAndDelete', function () {
  throw new Error('Audit records are append-only and cannot be deleted.');
});

export const AuditLogModel = mongoose.model<IAuditLogDoc>('AuditLog', AuditLogSchema);
