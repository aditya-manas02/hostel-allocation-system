import { describe, it, expect } from 'vitest';
import { cyrb128, createSfc32, getScopedPRNG } from '../src/prng.js';

describe('Deterministic PRNG (sfc32 + cyrb128)', () => {
  it('produces identical 1000 numbers from the same seed and scope', () => {
    const rng1 = getScopedPRNG('master-allocation-seed-2026', 'tiebreak-round');
    const rng2 = getScopedPRNG('master-allocation-seed-2026', 'tiebreak-round');

    const seq1: number[] = [];
    const seq2: number[] = [];

    for (let i = 0; i < 1000; i++) {
      seq1.push(rng1());
      seq2.push(rng2());
    }

    expect(seq1).toEqual(seq2);
  });

  it('produces different sequences for different master seeds', () => {
    const rngA = getScopedPRNG('seed-alpha', 'tiebreak');
    const rngB = getScopedPRNG('seed-beta', 'tiebreak');

    const valA = rngA();
    const valB = rngB();

    expect(valA).not.toBe(valB);
  });

  it('produces independent sequences for different scopes with same seed', () => {
    const rngFloor1 = getScopedPRNG('master-seed', 'floor-1-tiebreak');
    const rngFloor2 = getScopedPRNG('master-seed', 'floor-2-tiebreak');

    const val1 = rngFloor1();
    const val2 = rngFloor2();

    expect(val1).not.toBe(val2);
  });

  it('generates numbers strictly within [0, 1)', () => {
    const rng = getScopedPRNG('range-test', 'test');
    for (let i = 0; i < 5000; i++) {
      const val = rng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('cyrb128 produces 4 32-bit unsigned integers', () => {
    const [a, b, c, d] = cyrb128('test-seed-input');
    for (const val of [a, b, c, d]) {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(4294967295);
      expect(Number.isInteger(val)).toBe(true);
    }
  });
});
