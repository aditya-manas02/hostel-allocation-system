import { EngineApplicant, EngineAssignment, EngineBed } from './types.js';
import { HardConstraints } from './constraints.js';

export class AllocationValidator {
  /**
   * Independently validates all hard constraints on the final allocation output.
   * INVARIANT I8: Hard constraints are NEVER violated. Fails loudly on any violation.
   */
  public static validate(
    assignments: EngineAssignment[],
    applicantsMap: Map<string, EngineApplicant>,
    bedsMap: Map<string, EngineBed>,
    roomCapacityMap?: Map<string, number>,
  ): { valid: boolean; totalAssignments: number } {
    const assignedStudents = new Set<string>();
    const assignedBeds = new Set<string>();
    const roomOccupancy = new Map<string, number>();

    for (const a of assignments) {
      // 1. Single bed per student invariant
      if (assignedStudents.has(a.studentId)) {
        throw new Error(
          `Invariant Violation [I8]: Student ${a.studentId} is assigned to multiple beds.`,
        );
      }
      assignedStudents.add(a.studentId);

      // 2. Single student per bed invariant
      if (assignedBeds.has(a.bedId)) {
        throw new Error(`Invariant Violation [I8]: Bed ${a.bedId} is assigned to multiple students.`);
      }
      assignedBeds.add(a.bedId);

      // 3. Retrieve student and bed details
      const applicant = applicantsMap.get(a.studentId);
      if (!applicant) {
        throw new Error(`Validation Error: Assigned student ${a.studentId} not found in applicant snapshot.`);
      }

      const bed = bedsMap.get(a.bedId);
      if (!bed) {
        throw new Error(`Validation Error: Assigned bed ${a.bedId} not found in bed snapshot.`);
      }

      // 4. Eligibility Invariant (Only eligible applicants assigned)
      if (!applicant.isEligible) {
        throw new Error(
          `Invariant Violation [I8]: Ineligible student ${applicant.id} was assigned to bed ${bed.id}.`,
        );
      }

      // 5. Gender Block Invariant
      if (!HardConstraints.isGenderFeasible(applicant.gender, bed.genderDesignation)) {
        throw new Error(
          `Invariant Violation [I8]: Gender mismatch! Student ${applicant.id} (${applicant.gender}) assigned to bed ${bed.id} (${bed.genderDesignation}).`,
        );
      }

      // 6. Accessibility Invariant
      if (applicant.accessibilityRequired && !bed.isAccessible) {
        throw new Error(
          `Invariant Violation [I8]: Accessibility violation! Student ${applicant.id} requires accessible bed but was assigned non-accessible bed ${bed.id}.`,
        );
      }

      // 7. Room Capacity Check
      const maxCap = roomCapacityMap?.get(bed.roomId) ?? bed.roomCapacity;
      const currentOccupants = (roomOccupancy.get(bed.roomId) || 0) + 1;
      if (currentOccupants > maxCap) {
        throw new Error(
          `Invariant Violation [I8]: Room capacity exceeded! Room ${bed.roomId} capacity is ${maxCap} but has ${currentOccupants} occupants.`,
        );
      }
      roomOccupancy.set(bed.roomId, currentOccupants);
    }

    return { valid: true, totalAssignments: assignments.length };
  }
}
