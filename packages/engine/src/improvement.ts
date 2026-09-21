import { EngineApplicant, EngineAssignment, EngineBed } from './types.js';
import { HardConstraints } from './constraints.js';

export class LocalImprovement {
  /**
   * Performs bounded deterministic pair swaps between assigned students to increase total soft score.
   * INVARIANT I8: Strictly maintains all hard constraints on any swap.
   */
  public static optimize(
    assignments: EngineAssignment[],
    applicantsMap: Map<string, EngineApplicant>,
    bedsMap: Map<string, EngineBed>,
    maxIterations: number = 200,
  ): { improvedCount: number; finalAssignments: EngineAssignment[] } {
    let improvedCount = 0;
    const n = assignments.length;
    if (n < 2) return { improvedCount: 0, finalAssignments: assignments };

    const result = [...assignments];

    for (let iter = 0; iter < maxIterations; iter++) {
      let madeImprovementInPass = false;

      // Check deterministic pairs
      for (let i = 0; i < n - 1; i++) {
        const assignA = result[i]!;
        const assignB = result[i + 1]!;

        const studentA = applicantsMap.get(assignA.studentId)!;
        const studentB = applicantsMap.get(assignB.studentId)!;
        const bedA = bedsMap.get(assignA.bedId)!;
        const bedB = bedsMap.get(assignB.bedId)!;

        // Check if swap is feasible for both students
        // 1. Gender check
        if (!HardConstraints.isGenderFeasible(studentA.gender, bedB.genderDesignation)) continue;
        if (!HardConstraints.isGenderFeasible(studentB.gender, bedA.genderDesignation)) continue;

        // 2. Accessibility check
        if (!HardConstraints.isAccessibilityFeasible(studentA.accessibilityRequired, bedB.isAccessible)) continue;
        if (!HardConstraints.isAccessibilityFeasible(studentB.accessibilityRequired, bedA.isAccessible)) continue;

        // 3. Evaluate if swap improves preference satisfaction
        const rankA_current = assignA.explanation.preferenceRankSatisfied || 99;
        const rankB_current = assignB.explanation.preferenceRankSatisfied || 99;

        const rankA_swappedIdx = studentA.rankedHostelIds.indexOf(bedB.hostelId);
        const rankA_swapped = rankA_swappedIdx !== -1 ? rankA_swappedIdx + 1 : 99;

        const rankB_swappedIdx = studentB.rankedHostelIds.indexOf(bedA.hostelId);
        const rankB_swapped = rankB_swappedIdx !== -1 ? rankB_swappedIdx + 1 : 99;

        // Only swap if the sum of preference ranks strictly improves (lower sum is better)
        if (rankA_swapped + rankB_swapped < rankA_current + rankB_current) {
          // Perform swap
          const tempBedId = assignA.bedId;
          const tempRoomId = assignA.roomId;
          const tempHostelId = assignA.hostelId;

          assignA.bedId = assignB.bedId;
          assignA.roomId = assignB.roomId;
          assignA.hostelId = assignB.hostelId;
          assignA.explanation.preferenceRankSatisfied = rankA_swapped !== 99 ? rankA_swapped : null;
          assignA.explanation.isFirstChoice = rankA_swapped === 1;

          assignB.bedId = tempBedId;
          assignB.roomId = tempRoomId;
          assignB.hostelId = tempHostelId;
          assignB.explanation.preferenceRankSatisfied = rankB_swapped !== 99 ? rankB_swapped : null;
          assignB.explanation.isFirstChoice = rankB_swapped === 1;

          improvedCount++;
          madeImprovementInPass = true;
          break; // restart outer scan
        }
      }

      if (!madeImprovementInPass) break;
    }

    return { improvedCount, finalAssignments: result };
  }
}
