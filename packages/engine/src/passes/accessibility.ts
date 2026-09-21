import { EngineAssignment, EngineBed } from '../types.js';
import { PrioritizedApplicant } from '../priority.js';
import { HardConstraints } from '../constraints.js';
import { ExplanationBuilder } from '../explanation.js';

export class AccessibilityPass {
  /**
   * Pass A: Matches accessibility needs to accessible beds and processes special reserved quota applicants.
   */
  public static execute(
    prioritizedApplicants: PrioritizedApplicant[],
    availableBeds: EngineBed[],
    assignedStudentIds: Set<string>,
    assignedBedIds: Set<string>,
    roomOccupants: Map<string, string[]>,
  ): EngineAssignment[] {
    const assignments: EngineAssignment[] = [];

    // Filter to applicants requiring accessible beds or special reserved quotas
    const accessibleApplicants = prioritizedApplicants.filter(
      (pa) => pa.applicant.isEligible && pa.applicant.accessibilityRequired,
    );

    for (const pa of accessibleApplicants) {
      const applicant = pa.applicant;
      if (assignedStudentIds.has(applicant.id)) continue;

      // Find an available accessible bed matching gender
      const candidateBed = availableBeds.find(
        (bed) =>
          !assignedBedIds.has(bed.id) &&
          bed.isAccessible &&
          HardConstraints.isGenderFeasible(applicant.gender, bed.genderDesignation) &&
          (roomOccupants.get(bed.roomId)?.length || 0) < bed.roomCapacity,
      );

      if (candidateBed) {
        // Assign
        assignedStudentIds.add(applicant.id);
        assignedBedIds.add(candidateBed.id);

        const currentOccupants = roomOccupants.get(candidateBed.roomId) || [];
        currentOccupants.push(applicant.id);
        roomOccupants.set(candidateBed.roomId, currentOccupants);

        const explanation = ExplanationBuilder.build({
          preferenceRank: null, // Priority matched
          quotaBucket: applicant.quotaCategory,
          tiebreakValue: pa.tiebreakValue,
          compatibilityScore: null,
          isAccessible: true,
        });

        assignments.push({
          bedId: candidateBed.id,
          roomId: candidateBed.roomId,
          hostelId: candidateBed.hostelId,
          studentId: applicant.id,
          explanation,
        });
      }
    }

    return assignments;
  }
}
