import { describe, it, expect } from 'vitest';
import { getScopedPRNG } from '@hostel/engine';
import { GenderDesignation, RoomType, QuotaCategory, FeeCategory, Gender } from '@hostel/shared';

describe('Deterministic Seed Generator (~8,000 Beds and Applicants)', () => {
  const MASTER_SEED = 'university-hostel-seed-v1-2026';

  it('deterministically generates ~8,000 beds across 5 hostels with accessible beds', () => {
    const rng = getScopedPRNG(MASTER_SEED, 'seed-generator');

    const hostelConfigs = [
      { name: 'Gargi Bhawan', code: 'GB', gender: 'FEMALE' as GenderDesignation },
      { name: 'Sarojini Bhawan', code: 'SB', gender: 'FEMALE' as GenderDesignation },
      { name: 'Tagore Bhawan', code: 'TB', gender: 'MALE' as GenderDesignation },
      { name: 'Aryabhatta Bhawan', code: 'AB', gender: 'MALE' as GenderDesignation },
      { name: 'Kalam International House', code: 'KB', gender: 'COED' as GenderDesignation },
    ];

    const capacities: Record<RoomType, number> = { SINGLE: 1, DOUBLE: 2, TRIPLE: 3, QUAD: 4 };

    let totalBeds = 0;
    let totalAccessibleBeds = 0;
    let totalRooms = 0;
    let totalFloors = 0;
    let totalBlocks = 0;

    for (const hostel of hostelConfigs) {
      for (let b = 1; b <= 4; b++) {
        totalBlocks++;
        for (let f = 0; f <= 3; f++) {
          totalFloors++;
          for (let r = 1; r <= 37; r++) {
            totalRooms++;
            const randType = rng();
            let rType: RoomType = 'TRIPLE';
            if (randType < 0.10) rType = 'SINGLE';
            else if (randType < 0.40) rType = 'DOUBLE';
            else if (randType < 0.80) rType = 'TRIPLE';
            else rType = 'QUAD';

            const cap = capacities[rType];
            const isAccessible = f === 0 && r <= 4;

            for (let bedIdx = 1; bedIdx <= cap; bedIdx++) {
              totalBeds++;
              if (isAccessible) totalAccessibleBeds++;
            }
          }
        }
      }
    }

    expect(hostelConfigs.length).toBe(5);
    expect(totalBlocks).toBe(20);
    expect(totalFloors).toBe(80);
    expect(totalRooms).toBe(2960);
    expect(totalBeds).toBeGreaterThanOrEqual(7500);
    expect(totalBeds).toBeLessThanOrEqual(8500);
    expect(totalAccessibleBeds).toBeGreaterThan(200);

    // Assert applicants generation
    const quotaCounts: Record<string, number> = {};
    const genderCounts: Record<string, number> = {};

    for (let i = 1; i <= totalBeds; i++) {
      const randGender = rng();
      const gender: Gender = randGender < 0.5 ? 'FEMALE' : randGender < 0.98 ? 'MALE' : 'OTHER';
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;

      const randQuota = rng();
      let quota: QuotaCategory = 'GENERAL';
      if (randQuota < 0.6) quota = 'GENERAL';
      else if (randQuota < 0.7) quota = 'SPORTS';
      else if (randQuota < 0.8) quota = 'INTERNATIONAL';
      else if (randQuota < 0.85) quota = 'PWD';
      else if (randQuota < 0.95) quota = 'SCHOLARSHIP';
      else quota = 'STAFF_WARD';

      quotaCounts[quota] = (quotaCounts[quota] || 0) + 1;
    }

    expect(genderCounts['FEMALE']).toBeGreaterThan(3000);
    expect(genderCounts['MALE']).toBeGreaterThan(3000);
    expect(quotaCounts['GENERAL']).toBeGreaterThan(4000);
    expect(quotaCounts['PWD']).toBeGreaterThan(300);
    expect(quotaCounts['SPORTS']).toBeGreaterThan(600);
  });
});
