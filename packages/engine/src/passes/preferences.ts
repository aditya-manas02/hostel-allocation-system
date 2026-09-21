import { EngineAssignment, EngineBed } from '../types.js';
import { PrioritizedApplicant } from '../priority.js';
import { ExplanationBuilder } from '../explanation.js';

export class PreferencesPass {
  /**
   * Pass B: Assigns applicants based on ranked preferences, roommate requests, and compatibility scores.
   * Utilizes bucketed lookups for sub-minute performance on 8,000+ applicants.
   */
  public static execute(
    prioritizedApplicants: PrioritizedApplicant[],
    beds: EngineBed[],
    assignedStudentIds: Set<string>,
    assignedBedIds: Set<string>,
    roomOccupants: Map<string, string[]>,
    compatibilityMatrix?: Record<string, Record<string, number>>,
    preferenceWeight: number = 0.7,
    compatibilityWeight: number = 0.3,
  ): EngineAssignment[] {
    const assignments: EngineAssignment[] = [];

    // Bucket available beds by: hostelId -> genderDesignation -> roomType -> beds[]
    const bedIndex = new Map<string, EngineBed[]>();
    for (const bed of beds) {
      if (assignedBedIds.has(bed.id)) continue;
      // Do not use accessible beds in general preference pass unless applicant specifically requires it
      if (bed.isAccessible) continue;

      const key = `${bed.hostelId}::${bed.genderDesignation}::${bed.roomType}`;
      const list = bedIndex.get(key) || [];
      list.push(bed);
      bedIndex.set(key, list);
    }

    for (const pa of prioritizedApplicants) {
      const applicant = pa.applicant;
      if (assignedStudentIds.has(applicant.id) || !applicant.isEligible) continue;
      // INVARIANT I8: Applicants requiring accessible beds cannot be placed in general non-accessible beds
      if (applicant.accessibilityRequired) continue;

      let bestBed: EngineBed | null = null;
      let satisfiedRank: number | null = null;
      let bestSoftScore = -1;
      let bestCompatScore: number | null = null;

      // Evaluate preferences in rank order
      for (let rankIdx = 0; rankIdx < applicant.rankedHostelIds.length; rankIdx++) {
        const preferredHostelId = applicant.rankedHostelIds[rankIdx]!;
        const rank = rankIdx + 1;
        const rankScore = Math.max(0, 100 - (rank - 1) * 20); // 1st: 100, 2nd: 80, 3rd: 60...

        for (const preferredRoomType of applicant.rankedRoomTypes) {
          // Check feasible gender designations for this applicant
          const feasibleGenders =
            applicant.gender === 'FEMALE'
              ? ['FEMALE', 'COED']
              : applicant.gender === 'MALE'
              ? ['MALE', 'COED']
              : ['OTHER', 'COED'];

          for (const genderDesig of feasibleGenders) {
            const bucketKey = `${preferredHostelId}::${genderDesig}::${preferredRoomType}`;
            const candidateBeds = bedIndex.get(bucketKey);
            if (!candidateBeds || candidateBeds.length === 0) continue;

            for (let bIdx = 0; bIdx < candidateBeds.length; bIdx++) {
              const bed = candidateBeds[bIdx]!;
              if (assignedBedIds.has(bed.id)) continue;

              const occupants = roomOccupants.get(bed.roomId) || [];
              if (occupants.length >= bed.roomCapacity) continue;

              // Calculate roommate compatibility score
              let compatScore = 75; // Default neutral score
              if (occupants.length > 0 && compatibilityMatrix) {
                const studentMatrix = compatibilityMatrix[applicant.id];
                if (studentMatrix) {
                  let totalPairScore = 0;
                  let scoredCount = 0;
                  for (const occId of occupants) {
                    if (studentMatrix[occId] !== undefined) {
                      totalPairScore += studentMatrix[occId]!;
                      scoredCount++;
                    }
                  }
                  if (scoredCount > 0) {
                    compatScore = totalPairScore / scoredCount;
                  }
                }
              }

              // Mutual Roommate Request Bonus
              let mutualBonus = 0;
              if (applicant.requestedRoommateIds.length > 0) {
                for (const occId of occupants) {
                  if (applicant.requestedRoommateIds.includes(occId)) {
                    mutualBonus = 25; // Significant bonus for co-assigning requested roommates
                    break;
                  }
                }
              }

              const softScore =
                preferenceWeight * rankScore +
                compatibilityWeight * compatScore +
                mutualBonus;

              if (softScore > bestSoftScore) {
                bestSoftScore = softScore;
                bestBed = bed;
                satisfiedRank = rank;
                bestCompatScore = Math.round(compatScore);
              }

              // Break early if we found a top-choice room with high compatibility
              if (bestSoftScore >= 95) break;
            }

            if (bestBed) break;
          }

          if (bestBed) break;
        }

        if (bestBed) break;
      }

      // If a preferred bed was found, commit assignment
      if (bestBed && satisfiedRank !== null) {
        assignedStudentIds.add(applicant.id);
        assignedBedIds.add(bestBed.id);

        const currentOccupants = roomOccupants.get(bestBed.roomId) || [];
        currentOccupants.push(applicant.id);
        roomOccupants.set(bestBed.roomId, currentOccupants);

        const explanation = ExplanationBuilder.build({
          preferenceRank: satisfiedRank,
          quotaBucket: applicant.quotaCategory,
          tiebreakValue: pa.tiebreakValue,
          compatibilityScore: bestCompatScore,
          isAccessible: bestBed.isAccessible,
        });

        assignments.push({
          bedId: bestBed.id,
          roomId: bestBed.roomId,
          hostelId: bestBed.hostelId,
          studentId: applicant.id,
          explanation,
        });
      }
    }

    return assignments;
  }
}
