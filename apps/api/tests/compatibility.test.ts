import { describe, it, expect } from 'vitest';
import { CompatibilityScoringService } from '../src/services/CompatibilityScoringService.js';
import { QuestionnaireAnswers } from '@hostel/shared';

describe('Roommate Compatibility Scoring & Invariant I6 (M5)', () => {
  const baseAnswers: QuestionnaireAnswers = {
    sleepSchedule: 'EARLY_BIRD',
    cleanlinessLevel: 5,
    noiseTolerance: 2,
    studyHabits: 'IN_ROOM_SILENT',
    guestFrequency: 'NEVER',
    smokingHabit: false,
  };

  it('yields a perfect score of 100 for identical lifestyle profiles', () => {
    const score = CompatibilityScoringService.calculatePairwiseScore(baseAnswers, baseAnswers);
    expect(score).toBe(100);
  });

  it('severely penalizes smoker vs non-smoker mismatch', () => {
    const smokerAnswers: QuestionnaireAnswers = {
      ...baseAnswers,
      smokingHabit: true,
    };

    const score = CompatibilityScoringService.calculatePairwiseScore(baseAnswers, smokerAnswers);
    // Smoking mismatch zeroes out the 10% weight
    expect(score).toBeLessThanOrEqual(90);
  });

  it('reduces compatibility for opposite sleep schedules and study habits', () => {
    const nightOwlPartyAnswers: QuestionnaireAnswers = {
      sleepSchedule: 'NIGHT_OWL',
      cleanlinessLevel: 1, // 4 points difference
      noiseTolerance: 5,
      studyHabits: 'IN_ROOM_MUSIC',
      guestFrequency: 'FREQUENT',
      smokingHabit: false,
    };

    const score = CompatibilityScoringService.calculatePairwiseScore(baseAnswers, nightOwlPartyAnswers);
    expect(score).toBeLessThan(40);
  });

  it('requires explicit consent to submit questionnaire answers', async () => {
    await expect(
      CompatibilityScoringService.submitAnswers('student-test', baseAnswers, false),
    ).rejects.toThrow('Explicit consent is required');
  });
});
