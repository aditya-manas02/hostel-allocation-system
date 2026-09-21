import { Gender, GenderDesignation } from '@hostel/shared';
import { EngineApplicant, EngineBed } from './types.js';

export class HardConstraints {
  /**
   * Evaluates whether an applicant's gender is strictly compatible with the bed/block designation.
   * INVARIANT I8: Gender blocks strictly maintained.
   */
  public static isGenderFeasible(applicantGender: Gender, bedGender: GenderDesignation): boolean {
    if (bedGender === 'COED') return true;
    if (applicantGender === 'FEMALE') return bedGender === 'FEMALE';
    if (applicantGender === 'MALE') return bedGender === 'MALE';
    if (applicantGender === 'OTHER') return bedGender === 'OTHER';
    return false;
  }

  /**
   * Evaluates accessibility constraint.
   * INVARIANT I8: Accessibility needs MUST be matched to accessible beds.
   */
  public static isAccessibilityFeasible(
    applicantNeedsAccessible: boolean,
    bedIsAccessible: boolean,
  ): boolean {
    if (applicantNeedsAccessible) {
      return bedIsAccessible === true;
    }
    return true;
  }

  /**
   * Checks full feasibility of placing an applicant in a bed.
   */
  public static isFeasible(
    applicant: EngineApplicant,
    bed: EngineBed,
    currentRoomOccupantsCount: number,
  ): boolean {
    // 1. Eligibility Check (Only eligible applicants assigned)
    if (!applicant.isEligible) return false;

    // 2. Capacity Check (No room over capacity)
    if (currentRoomOccupantsCount >= bed.roomCapacity) return false;

    // 3. Gender Block Check
    if (!this.isGenderFeasible(applicant.gender, bed.genderDesignation)) return false;

    // 4. Accessibility Check
    if (!this.isAccessibilityFeasible(applicant.accessibilityRequired, bed.isAccessible)) {
      return false;
    }

    return true;
  }
}
