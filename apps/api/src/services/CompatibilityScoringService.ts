import { QuestionnaireAnswers, QuestionnaireAnswersSchema } from '@hostel/shared';
import { defaultEncryptionService } from './EncryptionService.js';
import { CompatibilityResponseModel } from '../models/CompatibilityResponse.js';
import { AuditService } from './AuditService.js';

export interface CompatibilityWeights {
  sleepSchedule: number;
  cleanliness: number;
  noise: number;
  studyHabits: number;
  guests: number;
  smoking: number;
}

export const DEFAULT_WEIGHTS: CompatibilityWeights = {
  sleepSchedule: 0.25,
  cleanliness: 0.2,
  noise: 0.2,
  studyHabits: 0.15,
  guests: 0.1,
  smoking: 0.1,
};

export class CompatibilityScoringService {
  /**
   * Calculates pairwise compatibility score between two sets of questionnaire answers.
   * Returns a score in the range [0, 100].
   */
  public static calculatePairwiseScore(
    a: QuestionnaireAnswers,
    b: QuestionnaireAnswers,
    weights: CompatibilityWeights = DEFAULT_WEIGHTS,
  ): number {
    let score = 0;

    // 1. Sleep Schedule (25%)
    let sleepScore = 50;
    if (a.sleepSchedule === b.sleepSchedule) {
      sleepScore = 100;
    } else if (a.sleepSchedule === 'FLEXIBLE' || b.sleepSchedule === 'FLEXIBLE') {
      sleepScore = 75;
    } else {
      // Early bird vs Night owl
      sleepScore = 20;
    }
    score += sleepScore * weights.sleepSchedule;

    // 2. Cleanliness (20%) - 1 to 5 scale
    const cleanDiff = Math.abs(a.cleanlinessLevel - b.cleanlinessLevel);
    const cleanScore = Math.max(0, 100 - cleanDiff * 25);
    score += cleanScore * weights.cleanliness;

    // 3. Noise Tolerance (20%) - 1 to 5 scale
    const noiseDiff = Math.abs(a.noiseTolerance - b.noiseTolerance);
    const noiseScore = Math.max(0, 100 - noiseDiff * 25);
    score += noiseScore * weights.noise;

    // 4. Study Habits (15%)
    let studyScore = 50;
    if (a.studyHabits === b.studyHabits) {
      studyScore = 100;
    } else if (
      (a.studyHabits === 'IN_ROOM_SILENT' && b.studyHabits === 'IN_ROOM_MUSIC') ||
      (a.studyHabits === 'IN_ROOM_MUSIC' && b.studyHabits === 'IN_ROOM_SILENT')
    ) {
      studyScore = 15;
    } else {
      studyScore = 70;
    }
    score += studyScore * weights.studyHabits;

    // 5. Guest Frequency (10%)
    let guestScore = 50;
    if (a.guestFrequency === b.guestFrequency) {
      guestScore = 100;
    } else if (
      (a.guestFrequency === 'NEVER' && b.guestFrequency === 'FREQUENT') ||
      (a.guestFrequency === 'FREQUENT' && b.guestFrequency === 'NEVER')
    ) {
      guestScore = 20;
    } else {
      guestScore = 70;
    }
    score += guestScore * weights.guests;

    // 6. Smoking Habit (10%)
    let smokingScore = 100;
    if (a.smokingHabit !== b.smokingHabit) {
      smokingScore = 0; // Strict penalty for smoker vs non-smoker
    }
    score += smokingScore * weights.smoking;

    return Math.round(Math.min(100, Math.max(0, score)));
  }

  /**
   * Stores encrypted answers with explicit consent record.
   */
  public static async submitAnswers(
    studentId: string,
    answers: QuestionnaireAnswers,
    consentGiven: boolean,
  ): Promise<{ success: boolean }> {
    if (!consentGiven) {
      throw new Error('Explicit consent is required to process lifestyle data.');
    }

    const validated = QuestionnaireAnswersSchema.parse(answers);
    const plaintext = JSON.stringify(validated);
    const encryptedPayload = defaultEncryptionService.encrypt(plaintext, studentId);
    const keyVersion = defaultEncryptionService['keyProvider'].getActiveVersion();

    await CompatibilityResponseModel.findOneAndUpdate(
      { studentId },
      {
        studentId,
        consentGiven: true,
        consentTimestamp: new Date(),
        encryptedPayload,
        keyVersion,
      },
      { upsert: true, new: true },
    );

    await AuditService.log({
      action: 'COMPATIBILITY_SUBMITTED',
      actorId: studentId,
      resourceType: 'CompatibilityResponse',
      resourceId: studentId,
      after: { consentGiven: true, keyVersion },
    });

    return { success: true };
  }

  /**
   * Deletes sensitive answers on request (Hard delete + Tombstone audit).
   */
  public static async deleteAnswers(studentId: string): Promise<{ success: boolean }> {
    await CompatibilityResponseModel.findOneAndDelete({ studentId });

    // Tombstone audit entry
    await AuditService.log({
      action: 'COMPATIBILITY_DELETED',
      actorId: studentId,
      resourceType: 'CompatibilityResponse',
      resourceId: studentId,
      before: { deleted: true },
      after: null,
    });

    return { success: true };
  }

  /**
   * Retrieves decrypted answers strictly for server-side score computation.
   * NEVER exposed to external APIs.
   */
  public static async getDecryptedAnswers(
    studentId: string,
  ): Promise<QuestionnaireAnswers | null> {
    const doc = await CompatibilityResponseModel.findOne({ studentId }).lean();
    if (!doc || !doc.encryptedPayload) return null;

    try {
      const decrypted = defaultEncryptionService.decrypt(doc.encryptedPayload, studentId);
      return JSON.parse(decrypted) as QuestionnaireAnswers;
    } catch {
      return null;
    }
  }
}
