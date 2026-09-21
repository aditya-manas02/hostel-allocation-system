import { describe, it, expect } from 'vitest';
import { HostelAllocationEngine } from '../../src/allocator.js';
import { EngineApplicant, EngineBed, EngineInputSnapshot } from '../../src/types.js';
import { getScopedPRNG } from '../../src/prng.js';
import { Gender, RoomType, QuotaCategory } from '@hostel/shared';

describe('Allocation Engine 8,000 x 8,000 Benchmark', () => {
  it('allocates 8,000 applicants to 8,000 beds in well under 10 minutes', () => {
    const rng = getScopedPRNG('benchmark-seed-2026', 'perf-test');
    const TOTAL_COUNT = 8000;

    const hostelIds = ['H1', 'H2', 'H3', 'H4', 'H5'];
    const roomTypes: RoomType[] = ['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD'];
    const quotas: QuotaCategory[] = ['GENERAL', 'SPORTS', 'INTERNATIONAL', 'PWD', 'SCHOLARSHIP', 'STAFF_WARD'];

    // 1. Generate 8,000 synthetic applicants
    const applicants: EngineApplicant[] = [];
    for (let i = 1; i <= TOTAL_COUNT; i++) {
      const isFemale = rng() < 0.5;
      const gender: Gender = isFemale ? 'FEMALE' : rng() < 0.96 ? 'MALE' : 'OTHER';
      const quota = quotas[Math.floor(rng() * quotas.length)]!;
      const isAccessible = quota === 'PWD' || rng() < 0.03;

      applicants.push({
        id: `applicant-${i}`,
        gender,
        quotaCategory: quota,
        yearOfStudy: Math.floor(rng() * 4) + 1,
        meritRank: Math.floor(rng() * 10000) + 1,
        accessibilityRequired: isAccessible,
        isEligible: true,
        rankedHostelIds: [hostelIds[Math.floor(rng() * hostelIds.length)]!, hostelIds[Math.floor(rng() * hostelIds.length)]!],
        rankedRoomTypes: ['DOUBLE', 'TRIPLE'],
        requestedRoommateIds: [],
      });
    }

    // 2. Generate 8,000 beds
    const beds: EngineBed[] = [];
    let bedIdCounter = 1;
    let roomIdCounter = 1;

    for (let hIdx = 0; hIdx < hostelIds.length; hIdx++) {
      const hId = hostelIds[hIdx]!;
      const hGender = hIdx < 2 ? 'FEMALE' : hIdx < 4 ? 'MALE' : 'COED';

      for (let r = 1; r <= 600; r++) {
        const roomId = `room-${roomIdCounter++}`;
        const cap = (r % 3) + 2; // 2 to 4 capacity
        const isAccessible = r <= 20;

        for (let b = 1; b <= cap; b++) {
          if (bedIdCounter > TOTAL_COUNT) break;
          beds.push({
            id: `bed-${bedIdCounter++}`,
            roomId,
            floorId: `floor-${Math.floor(r / 25)}`,
            blockId: `block-${hIdx}-${Math.floor(r / 100)}`,
            hostelId: hId,
            bedLabel: String.fromCharCode(64 + b),
            isAccessible,
            genderDesignation: hGender as any,
            roomType: cap === 2 ? 'DOUBLE' : cap === 3 ? 'TRIPLE' : 'QUAD',
            roomCapacity: cap,
          });
        }
        if (bedIdCounter > TOTAL_COUNT) break;
      }
    }

    const snapshot: EngineInputSnapshot = {
      applicants,
      beds,
      quotas: {
        GENERAL: 60,
        SPORTS: 10,
        INTERNATIONAL: 10,
        PWD: 5,
        SCHOLARSHIP: 10,
        STAFF_WARD: 5,
      },
    };

    const start = performance.now();
    const output = HostelAllocationEngine.allocate(snapshot, 'master-benchmark-seed');
    const elapsedMs = performance.now() - start;

    console.log(`[Benchmark] 8,000 applicants vs 8,000 beds allocated in ${(elapsedMs / 1000).toFixed(2)} seconds.`);
    console.log(`[Benchmark] Total assigned: ${output.stats.totalAssigned}, Total waitlist: ${output.stats.totalUnassigned}`);
    console.log(`[Benchmark] 1st choice satisfaction: ${output.stats.firstChoicePercentage}%`);

    // Must be well under 10 minutes (600,000 ms)
    expect(elapsedMs).toBeLessThan(600000);
    expect(output.stats.totalAssigned).toBeGreaterThan(6000);
    expect(output.assignments.length + output.waitlist.length).toBe(TOTAL_COUNT);
  });
});
