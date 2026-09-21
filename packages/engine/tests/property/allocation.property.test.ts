import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { HostelAllocationEngine } from '../../src/allocator.js';
import { EngineApplicant, EngineBed, EngineInputSnapshot } from '../../src/types.js';
import { Gender, GenderDesignation, QuotaCategory, RoomType } from '@hostel/shared';

describe('Allocation Engine Property-Based Invariants (fast-check >= 200 runs)', () => {
  // Arbitrary generator for applicant
  const applicantArbitrary = (id: string): fc.Arbitrary<EngineApplicant> =>
    fc.record({
      id: fc.constant(id),
      gender: fc.constantFrom<Gender>('FEMALE', 'MALE', 'OTHER'),
      quotaCategory: fc.constantFrom<QuotaCategory>(
        'GENERAL',
        'SPORTS',
        'INTERNATIONAL',
        'PWD',
        'SCHOLARSHIP',
        'STAFF_WARD',
      ),
      yearOfStudy: fc.integer({ min: 1, max: 4 }),
      meritRank: fc.integer({ min: 1, max: 5000 }),
      accessibilityRequired: fc.boolean(),
      isEligible: fc.constant(true), // eligible applicants
      rankedHostelIds: fc.shuffledSubarray(['H1', 'H2', 'H3'], { minLength: 1 }),
      rankedRoomTypes: fc.shuffledSubarray<RoomType>(['SINGLE', 'DOUBLE', 'TRIPLE'], { minLength: 1 }),
      requestedRoommateIds: fc.constant([]),
    });

  // Arbitrary generator for bed with consistent room capacity
  const bedArbitrary = (
    id: string,
    roomId: string,
    hostelId: string,
    roomCapacity: number,
    genderDesignation: GenderDesignation,
    isAccessible: boolean,
  ): fc.Arbitrary<EngineBed> =>
    fc.record({
      id: fc.constant(id),
      roomId: fc.constant(roomId),
      floorId: fc.constant('F1'),
      blockId: fc.constant('B1'),
      hostelId: fc.constant(hostelId),
      bedLabel: fc.constantFrom('A', 'B', 'C', 'D'),
      isAccessible: fc.constant(isAccessible),
      genderDesignation: fc.constant(genderDesignation),
      roomType: fc.constant(roomCapacity === 1 ? 'SINGLE' : roomCapacity === 2 ? 'DOUBLE' : 'TRIPLE'),
      roomCapacity: fc.constant(roomCapacity),
    });

  it('preserves single-assignment and capacity invariants across 200 random configurations', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 50 }).chain((n) =>
          fc.tuple(
            fc.tuple(...Array.from({ length: n }, (_, i) => applicantArbitrary(`student-${i}`))),
            fc.tuple(
              ...Array.from({ length: Math.round(n * 0.8) }, (_, i) => {
                const roomNum = Math.floor(i / 2);
                const cap = (roomNum % 2) + 2; // 2 or 3
                const gender = (roomNum % 2 === 0 ? 'FEMALE' : 'MALE') as GenderDesignation;
                const isAcc = roomNum % 4 === 0;
                return bedArbitrary(`bed-${i}`, `room-${roomNum}`, `H${(i % 3) + 1}`, cap, gender, isAcc);
              }),
            ),
            fc.string({ minLength: 8 }),
          ),
        ),
        ([applicants, beds, seed]) => {
          const snapshot: EngineInputSnapshot = {
            applicants: [...applicants],
            beds: [...beds],
            quotas: {
              GENERAL: 60,
              SPORTS: 10,
              INTERNATIONAL: 10,
              PWD: 5,
              SCHOLARSHIP: 10,
              STAFF_WARD: 5,
            },
          };

          const output = HostelAllocationEngine.allocate(snapshot, seed);

          // Invariant 1: No student assigned more than one bed
          const assignedStudentIds = output.assignments.map((a) => a.studentId);
          expect(new Set(assignedStudentIds).size).toBe(assignedStudentIds.length);

          // Invariant 2: No bed assigned to more than one student
          const assignedBedIds = output.assignments.map((a) => a.bedId);
          expect(new Set(assignedBedIds).size).toBe(assignedBedIds.length);

          // Invariant 3: Conservation law (Assigned + Waitlist === Total applicants)
          expect(output.assignments.length + output.waitlist.length).toBe(applicants.length);

          // Invariant 4: Every assigned student has an explanation
          for (const a of output.assignments) {
            expect(a.explanation).toBeDefined();
            expect(a.explanation.constraintsChecked.length).toBeGreaterThan(0);
          }

          // Invariant 5: Every unassigned student has a waitlist reason
          for (const w of output.waitlist) {
            expect(w.reason.length).toBeGreaterThan(0);
            expect(w.position).toBeGreaterThan(0);
          }
        },
      ),
      { numRuns: 200 },
    );
  });

  it('guarantees strict byte-identical reproducibility with same seed and inputs (Invariant I3)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 20 }).chain((n) =>
          fc.tuple(
            fc.tuple(...Array.from({ length: n }, (_, i) => applicantArbitrary(`s-${i}`))),
            fc.tuple(
              ...Array.from({ length: n }, (_, i) => {
                const roomNum = Math.floor(i / 2);
                const cap = 2;
                const gender = 'FEMALE' as GenderDesignation;
                const isAcc = false;
                return bedArbitrary(`b-${i}`, `r-${roomNum}`, `H${(i % 2) + 1}`, cap, gender, isAcc);
              }),
            ),
            fc.string({ minLength: 10 }),
          ),
        ),
        ([applicants, beds, seed]) => {
          const snapshot: EngineInputSnapshot = {
            applicants: [...applicants],
            beds: [...beds],
            quotas: {
              GENERAL: 60,
              SPORTS: 10,
              INTERNATIONAL: 10,
              PWD: 5,
              SCHOLARSHIP: 10,
              STAFF_WARD: 5,
            },
          };

          const run1 = HostelAllocationEngine.allocate(snapshot, seed);
          const run2 = HostelAllocationEngine.allocate(snapshot, seed);

          expect(run1.outputHash).toBe(run2.outputHash);
          expect(run1.inputSnapshotHash).toBe(run2.inputSnapshotHash);
          expect(run1.assignments).toEqual(run2.assignments);
          expect(run1.waitlist).toEqual(run2.waitlist);
        },
      ),
      { numRuns: 200 },
    );
  });
});
