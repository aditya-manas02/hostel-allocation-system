import { describe, it, expect } from 'vitest';
import { AuditService, GENESIS_HASH } from '../src/services/AuditService.js';

describe('AuditService & Hash Chain Cryptographic Integrity', () => {
  it('computes deterministic SHA-256 hashes for identical entries', () => {
    const entry = {
      sequence: 1,
      batchId: 'BATCH-001',
      action: 'ALLOCATION_COMPLETED',
      actorId: 'ADMIN-01',
      resourceType: 'AllocationDraft',
      resourceId: 'draft-999',
      before: null,
      after: { totalAssigned: 8000 },
      timestamp: '2026-09-22T00:00:00.000Z',
      previousHash: GENESIS_HASH,
    };

    const hash1 = AuditService.computeHash(entry);
    const hash2 = AuditService.computeHash(entry);

    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[0-9a-f]{64}$/);
  });

  it('produces completely different hashes when payload differs (avalanche effect)', () => {
    const baseEntry = {
      sequence: 1,
      batchId: 'BATCH-001',
      action: 'ALLOCATION_COMPLETED',
      actorId: 'ADMIN-01',
      resourceType: 'AllocationDraft',
      resourceId: 'draft-999',
      before: null,
      after: { totalAssigned: 8000 },
      timestamp: '2026-09-22T00:00:00.000Z',
      previousHash: GENESIS_HASH,
    };

    const tamperedEntry = {
      ...baseEntry,
      after: { totalAssigned: 8001 }, // 1 bed difference
    };

    const hash1 = AuditService.computeHash(baseEntry);
    const hash2 = AuditService.computeHash(tamperedEntry);

    expect(hash1).not.toBe(hash2);
  });

  it('verifies a simulated valid hash chain', () => {
    const chain: Array<{
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
      hash: string;
    }> = [];

    let prevHash = GENESIS_HASH;
    for (let i = 1; i <= 5; i++) {
      const payload = {
        sequence: i,
        batchId: 'SIM-BATCH',
        action: `ACTION_${i}`,
        actorId: `ACTOR_${i}`,
        resourceType: 'Resource',
        resourceId: `res-${i}`,
        before: null,
        after: { step: i },
        timestamp: new Date(1700000000000 + i * 1000).toISOString(),
        previousHash: prevHash,
      };
      const hash = AuditService.computeHash(payload);
      chain.push({ ...payload, hash });
      prevHash = hash;
    }

    // Verify all links in chain
    let expectedPrev = GENESIS_HASH;
    for (let i = 0; i < chain.length; i++) {
      const item = chain[i]!;
      expect(item.previousHash).toBe(expectedPrev);
      const calculated = AuditService.computeHash({
        sequence: item.sequence,
        batchId: item.batchId,
        action: item.action,
        actorId: item.actorId,
        resourceType: item.resourceType,
        resourceId: item.resourceId,
        before: item.before,
        after: item.after,
        timestamp: item.timestamp,
        previousHash: item.previousHash,
      });
      expect(calculated).toBe(item.hash);
      expectedPrev = item.hash;
    }
  });

  it('detects tampering in intermediate block of chain', () => {
    const chain: any[] = [];
    let prevHash = GENESIS_HASH;

    for (let i = 1; i <= 3; i++) {
      const payload = {
        sequence: i,
        batchId: 'TAMPER-TEST',
        action: `ACTION_${i}`,
        actorId: 'ACTOR',
        resourceType: 'Resource',
        resourceId: `res-${i}`,
        before: null,
        after: { val: i },
        timestamp: new Date(1700000000000 + i * 1000).toISOString(),
        previousHash: prevHash,
      };
      const hash = AuditService.computeHash(payload);
      chain.push({ ...payload, hash });
      prevHash = hash;
    }

    // Tamper with block 2
    chain[1].after = { val: 999 }; // Tampered!

    // Re-verify: block 2 hash should not match recalculated
    const block2Recalculated = AuditService.computeHash({
      sequence: chain[1].sequence,
      batchId: chain[1].batchId,
      action: chain[1].action,
      actorId: chain[1].actorId,
      resourceType: chain[1].resourceType,
      resourceId: chain[1].resourceId,
      before: chain[1].before,
      after: chain[1].after,
      timestamp: chain[1].timestamp,
      previousHash: chain[1].previousHash,
    });

    expect(block2Recalculated).not.toBe(chain[1].hash);
  });
});
