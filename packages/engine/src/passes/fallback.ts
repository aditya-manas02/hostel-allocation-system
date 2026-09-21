import { EngineAssignment, EngineBed, EngineWaitlistEntry } from '../types.js';
import { PrioritizedApplicant } from '../priority.js';
import { HardConstraints } from '../constraints.js';
import { ExplanationBuilder } from '../explanation.js';

export class FallbackPass {
  /**
   * Pass C: Fills remaining feasible beds for unassigned applicants and places unassignable on waitlist.
   */
  public static execute(
    prioritizedApplicants: PrioritizedApplicant[],
    beds: EngineBed[],
    assignedStudentIds: Set<string>,
    assignedBedIds: Set<string>,
    roomOccupants: Map<string, string[]>,
  ): {
    fallbackAssignments: EngineAssignment[];
    waitlist: EngineWaitlistEntry[];
  } {
    const fallbackAssignments: EngineAssignment[] = [];
    const waitlist: EngineWaitlistEntry[] = [];
    let waitlistPosition = 1;

    for (const pa of prioritizedApplicants) {
      const applicant = pa.applicant;

      // Skip already assigned students
      if (assignedStudentIds.has(applicant.id)) continue;

      // If applicant is ineligible, place on waitlist with ineligibility reason
      if (!applicant.isEligible) {
        waitlist.push({
          studentId: applicant.id,
          position: waitlistPosition++,
          reason: applicant.ineligibleReasons?.[0] || 'INELIGIBLE_FOR_ALLOCATION',
        });
        continue;
      }

      // Find any feasible available bed
      const candidateBed = beds.find(
        (bed) =>
          !assignedBedIds.has(bed.id) &&
          HardConstraints.isFeasible(
            applicant,
            bed,
            roomOccupants.get(bed.roomId)?.length || 0,
          ),
      );

      if (candidateBed) {
        assignedStudentIds.add(applicant.id);
        assignedBedIds.add(candidateBed.id);

        const currentOccupants = roomOccupants.get(candidateBed.roomId) || [];
        currentOccupants.push(applicant.id);
        roomOccupants.set(candidateBed.roomId, currentOccupants);

        const explanation = ExplanationBuilder.build({
          preferenceRank: null, // Fallback
          quotaBucket: applicant.quotaCategory,
          tiebreakValue: pa.tiebreakValue,
          compatibilityScore: null,
          isAccessible: candidateBed.isAccessible,
        });

        fallbackAssignments.push({
          bedId: candidateBed.id,
          roomId: candidateBed.roomId,
          hostelId: candidateBed.hostelId,
          studentId: applicant.id,
          explanation,
        });
      } else {
        // No feasible bed available -> place on waitlist
        const reason = applicant.accessibilityRequired
          ? 'ACCESSIBLE_CAPACITY_EXHAUSTED'
          : 'HOSTEL_CAPACITY_EXHAUSTED';

        waitlist.push({
          studentId: applicant.id,
          position: waitlistPosition++,
          reason,
        });
      }
    }

    return { fallbackAssignments, waitlist };
  }
}
