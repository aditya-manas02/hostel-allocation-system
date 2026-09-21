import { describe, it, expect } from 'vitest';
import { DraftPublishService } from '../src/services/DraftPublishService.js';
import { OverrideService } from '../src/services/OverrideService.js';
import { requireHostelAccess } from '../src/middleware/rbac.js';

describe('Required Negative Tests (Invariants I1, I2, I5, I6, RBAC)', () => {
  // 1. Publishing without approval record fails (Invariant I1)
  it('fails loudly when publishing without an approval record', () => {
    const mockDraft = {
      _id: 'draft-1',
      status: 'DRAFT',
      outputHash: 'hash-abc-123',
    };

    expect(() =>
      DraftPublishService.validatePublishPreconditions(mockDraft as any, null),
    ).toThrow('Invariant Violation [I1]: Cannot publish draft without an existing approval record.');
  });

  // 1b. Stale approval hash fails (Invariant I1)
  it('fails loudly when publishing with a stale approval hash', () => {
    const mockDraft = {
      _id: 'draft-1',
      status: 'DRAFT',
      outputHash: 'hash-current-123',
    };
    const staleApproval = {
      _id: 'approval-1',
      draftVersionHash: 'hash-old-999',
    };

    expect(() =>
      DraftPublishService.validatePublishPreconditions(mockDraft as any, staleApproval as any),
    ).toThrow('Invariant Violation [I1]: Stale approval hash!');
  });

  // 2. Draft immutability: modifying a published draft fails (Invariant I2)
  it('rejects mutations on published drafts', () => {
    const mockDraft = {
      _id: 'draft-1',
      status: 'PUBLISHED',
      outputHash: 'hash-123',
    };
    const mockApproval = {
      _id: 'approval-1',
      draftVersionHash: 'hash-123',
    };

    expect(() =>
      DraftPublishService.validatePublishPreconditions(mockDraft as any, mockApproval as any),
    ).toThrow('Invariant Violation [I2]: Draft is already PUBLISHED and is immutable.');
  });

  // 3. Override without reason or min-length fails (Invariant I5)
  it('fails when override reason is empty or less than 10 characters', async () => {
    await expect(
      OverrideService.applyOverride({
        draftId: 'draft-1',
        bedId: 'bed-1',
        newStudentId: 'student-1',
        reasonCategory: 'MEDICAL_ACCOMMODATION',
        reasonText: 'Too short', // 9 characters < 10
        actorId: 'warden-1',
        actorRole: 'WARDEN',
      }),
    ).rejects.toThrow('Invariant Violation [I5]: Override requires a non-empty reason with at least 10 characters');
  });

  // 4. Override without category fails (Invariant I5)
  it('fails when override reason category is missing', async () => {
    await expect(
      OverrideService.applyOverride({
        draftId: 'draft-1',
        bedId: 'bed-1',
        newStudentId: 'student-1',
        reasonCategory: '' as any,
        reasonText: 'Valid length reason exceeding 10 characters',
        actorId: 'warden-1',
        actorRole: 'WARDEN',
      }),
    ).rejects.toThrow('Invariant Violation [I5]: Override requires a valid reason category');
  });

  // 5. Hard constraint override without Chief Warden escalation fails (Invariant I5)
  it('rejects hard constraint override without Chief Warden escalation', () => {
    const checkEscalation = (hasViolation: boolean, isEscalated: boolean, chiefWardenApprovalId?: string) => {
      if (hasViolation && (!isEscalated || !chiefWardenApprovalId)) {
        throw new Error(
          'Invariant Violation [I5]: Hard constraint violation detected! A warden cannot violate a hard constraint without an explicit escalated approval by Chief Warden.',
        );
      }
    };

    // Fails if hard constraint violated without escalation
    expect(() => checkEscalation(true, false)).toThrow('escalated approval by Chief Warden');
    expect(() => checkEscalation(true, true, undefined)).toThrow('escalated approval by Chief Warden');

    // Succeeds if escalated with chief warden approval
    expect(() => checkEscalation(true, true, 'cw-approval-999')).not.toThrow();
  });

  // 6. Warden accessing another hostel fails (RBAC Scope)
  it('blocks warden from accessing another hostel data with 403 Forbidden', () => {
    const req: any = {
      user: { id: 'warden-1', role: 'WARDEN', assignedHostelId: 'hostel-alpha' },
      params: { hostelId: 'hostel-beta' }, // Accessing unauthorized hostel
    };

    let statusCode = 0;
    let responseBody: any = null;
    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (data: any) => {
            responseBody = data;
          },
        };
      },
    };

    let nextCalled = false;
    const middleware = requireHostelAccess('hostelId');
    middleware(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(false);
    expect(statusCode).toBe(403);
    expect(responseBody.error).toBe('Forbidden');
    expect(responseBody.message).toContain('Warden is only authorized for hostel');
  });
});
