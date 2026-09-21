import crypto from 'node:crypto';
import stringify from 'fast-json-stable-stringify';
import { AuditAction } from '@hostel/shared';
import { AuditLogModel, IAuditLogDoc } from '../models/AuditLog.js';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export interface AuditEntryInput {
  batchId?: string;
  action: AuditAction;
  actorId: string;
  resourceType: string;
  resourceId: string;
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
}

export class AuditService {
  /**
   * Deterministically calculates SHA-256 hash of an audit log entry.
   */
  public static computeHash(entry: {
    sequence: number;
    batchId: string;
    action: string;
    actorId: string;
    resourceType: string;
    resourceId: string;
    before: any;
    after: any;
    timestamp: string;
    previousHash: string;
  }): string {
    const canonical = stringify(entry);
    return crypto.createHash('sha256').update(canonical).digest('hex');
  }

  /**
   * Appends a new audit record to the hash chain.
   */
  public static async log(entry: AuditEntryInput): Promise<IAuditLogDoc> {
    const batchId = entry.batchId || 'GLOBAL';

    // Find the latest entry in this batch to determine next sequence and previousHash
    const lastEntry = await AuditLogModel.findOne({ batchId })
      .sort({ sequence: -1 })
      .lean();

    const sequence = lastEntry ? lastEntry.sequence + 1 : 1;
    const previousHash = lastEntry ? lastEntry.hash : GENESIS_HASH;
    const timestamp = new Date();

    const hashPayload = {
      sequence,
      batchId,
      action: entry.action,
      actorId: entry.actorId,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      before: entry.before || null,
      after: entry.after || null,
      timestamp: timestamp.toISOString(),
      previousHash,
    };

    const hash = this.computeHash(hashPayload);

    const doc = new AuditLogModel({
      sequence,
      batchId,
      action: entry.action,
      actorId: entry.actorId,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      before: entry.before || null,
      after: entry.after || null,
      timestamp,
      previousHash,
      hash,
    });

    return await doc.save();
  }

  /**
   * Verifies the cryptographic integrity of the audit chain for a given batch.
   * Returns { valid: boolean, error?: string, failedSequence?: number }
   */
  public static async verifyChain(batchId: string = 'GLOBAL'): Promise<{
    valid: boolean;
    error?: string;
    failedSequence?: number;
    totalEntries: number;
  }> {
    const entries = await AuditLogModel.find({ batchId })
      .sort({ sequence: 1 })
      .lean();

    if (entries.length === 0) {
      return { valid: true, totalEntries: 0 };
    }

    let expectedPreviousHash = GENESIS_HASH;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]!;

      // Verify sequence monotonicity
      if (entry.sequence !== i + 1) {
        return {
          valid: false,
          error: `Sequence gap detected: expected ${i + 1} but found ${entry.sequence}`,
          failedSequence: entry.sequence,
          totalEntries: entries.length,
        };
      }

      // Verify previous hash link
      if (entry.previousHash !== expectedPreviousHash) {
        return {
          valid: false,
          error: `Hash link broken at sequence ${entry.sequence}: previousHash does not match previous entry's hash`,
          failedSequence: entry.sequence,
          totalEntries: entries.length,
        };
      }

      // Recompute and verify current hash
      const recomputedHash = this.computeHash({
        sequence: entry.sequence,
        batchId: entry.batchId,
        action: entry.action,
        actorId: entry.actorId,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        before: entry.before,
        after: entry.after,
        timestamp: new Date(entry.timestamp).toISOString(),
        previousHash: entry.previousHash,
      });

      if (recomputedHash !== entry.hash) {
        return {
          valid: false,
          error: `Tamper detected at sequence ${entry.sequence}: payload hash mismatch`,
          failedSequence: entry.sequence,
          totalEntries: entries.length,
        };
      }

      expectedPreviousHash = entry.hash;
    }

    return { valid: true, totalEntries: entries.length };
  }
}
