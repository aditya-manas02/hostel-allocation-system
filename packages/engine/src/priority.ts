import { QuotaCategory } from '@hostel/shared';
import { EngineApplicant } from './types.js';

export interface PrioritizedApplicant {
  applicant: EngineApplicant;
  priorityScore: number;
  tiebreakValue: number;
}

const QUOTA_PRIORITY_RANKS: Record<QuotaCategory, number> = {
  PWD: 1,
  INTERNATIONAL: 2,
  SCHOLARSHIP: 3,
  SPORTS: 4,
  STAFF_WARD: 5,
  GENERAL: 6,
};

export class PriorityOrdering {
  /**
   * Sorts applicants deterministically by:
   * 1. Accessibility requirement
   * 2. Quota category tier
   * 3. Year of study (Seniority descending)
   * 4. Merit rank (Ascending, 1 is highest)
   * 5. Seeded PRNG tiebreak value (Strict determinism)
   */
  public static orderApplicants(
    applicants: EngineApplicant[],
    tiebreakRng: () => number,
  ): PrioritizedApplicant[] {
    const list: PrioritizedApplicant[] = applicants.map((app) => {
      const tiebreak = tiebreakRng();
      const quotaRank = QUOTA_PRIORITY_RANKS[app.quotaCategory] || 6;
      const seniority = app.yearOfStudy || 1;
      const merit = app.meritRank || 999999;

      // Composite score for ranking: lower is higher priority
      // [Accessible: 0/1] * 1e8 + [QuotaTier: 1-6] * 1e6 - [Seniority: 1-5] * 1e4 + [Merit]
      const priorityScore =
        (app.accessibilityRequired ? 0 : 1) * 1e8 +
        quotaRank * 1e6 -
        seniority * 1e4 +
        merit;

      return {
        applicant: app,
        priorityScore,
        tiebreakValue: tiebreak,
      };
    });

    // Stable sort with seeded tiebreak
    return list.sort((a, b) => {
      if (a.priorityScore !== b.priorityScore) {
        return a.priorityScore - b.priorityScore;
      }
      // Exact tiebreak using seeded PRNG value
      if (a.tiebreakValue !== b.tiebreakValue) {
        return a.tiebreakValue - b.tiebreakValue;
      }
      // Final tiebreak by ID for strict lexicographic determinism
      return a.applicant.id.localeCompare(b.applicant.id);
    });
  }
}
