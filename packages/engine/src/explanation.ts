import { QuotaCategory, StructuredExplanation } from '@hostel/shared';

export interface ExplanationParams {
  preferenceRank: number | null;
  quotaBucket: QuotaCategory;
  tiebreakValue: number;
  compatibilityScore: number | null;
  hostelName?: string;
  roomType?: string;
  isAccessible?: boolean;
}

export class ExplanationBuilder {
  public static build(params: ExplanationParams): StructuredExplanation {
    const isFirstChoice = params.preferenceRank === 1;

    let rationaleText = '';
    if (params.preferenceRank !== null) {
      rationaleText = `Assigned to preferred option (Rank #${params.preferenceRank}) under ${params.quotaBucket} quota.`;
    } else {
      rationaleText = `Assigned via fallback allocation under ${params.quotaBucket} quota.`;
    }

    if (params.isAccessible) {
      rationaleText += ' Matched to wheelchair-accessible ground floor unit.';
    }

    if (params.compatibilityScore !== null) {
      rationaleText += ` Roommate compatibility score: ${params.compatibilityScore}/100.`;
    }

    rationaleText += ` Tiebreak index: ${params.tiebreakValue.toFixed(6)}.`;

    return {
      preferenceRankSatisfied: params.preferenceRank,
      isFirstChoice,
      constraintsChecked: [
        'GENDER_BLOCK',
        'ACCESSIBILITY_MATCH',
        'ROOM_CAPACITY',
        'QUOTA_CAPACITY',
        'ELIGIBILITY_VERIFIED',
      ],
      quotaBucketUsed: params.quotaBucket,
      tiebreakValue: params.tiebreakValue,
      roommateCompatibilityScore: params.compatibilityScore,
      rationaleText,
    };
  }
}
