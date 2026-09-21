import crypto from 'node:crypto';
import { getScopedPRNG } from './prng.js';
import { PriorityOrdering } from './priority.js';
import { AccessibilityPass } from './passes/accessibility.js';
import { PreferencesPass } from './passes/preferences.js';
import { FallbackPass } from './passes/fallback.js';
import { LocalImprovement } from './improvement.js';
import { AllocationValidator } from './validator.js';
import {
  EngineApplicant,
  EngineAssignment,
  EngineBed,
  EngineInputSnapshot,
  EngineOutput,
} from './types.js';

export const ENGINE_VERSION = '1.0.0';

export class HostelAllocationEngine {
  /**
   * Deterministically calculates SHA-256 hash of any input or output object.
   */
  public static hashObject(obj: any): string {
    const jsonStr = JSON.stringify(obj, Object.keys(obj).sort());
    return crypto.createHash('sha256').update(jsonStr).digest('hex');
  }

  /**
   * Pure deterministic allocation engine entry point. Zero I/O, zero external framework imports.
   * INVARIANT I3: Given same snapshot + seed + params => byte-identical output.
   */
  public static allocate(
    snapshot: EngineInputSnapshot,
    masterSeed: string,
    params: Record<string, any> = {},
  ): EngineOutput {
    const startTime = Date.now();

    // 1. Initialize scoped PRNG streams from master seed
    const tiebreakRng = getScopedPRNG(masterSeed, 'tiebreak-stream');

    // 2. Compute canonical input snapshot hash
    const inputSnapshotHash = this.hashObject({
      applicants: snapshot.applicants.map((a) => a.id).sort(),
      beds: snapshot.beds.map((b) => b.id).sort(),
      quotas: snapshot.quotas,
      masterSeed,
      params,
    });

    // 3. Build fast indexed lookup maps
    const applicantsMap = new Map<string, EngineApplicant>();
    for (const app of snapshot.applicants) {
      applicantsMap.set(app.id, app);
    }

    const bedsMap = new Map<string, EngineBed>();
    const roomCapacityMap = new Map<string, number>();
    for (const bed of snapshot.beds) {
      bedsMap.set(bed.id, bed);
      const curCap = roomCapacityMap.get(bed.roomId);
      if (curCap === undefined || bed.roomCapacity < curCap) {
        roomCapacityMap.set(bed.roomId, bed.roomCapacity);
      }
    }

    // 4. Deterministic priority ordering with seeded tiebreaks
    const prioritizedApplicants = PriorityOrdering.orderApplicants(
      snapshot.applicants,
      tiebreakRng,
    );

    // State tracking across passes
    const assignedStudentIds = new Set<string>();
    const assignedBedIds = new Set<string>();
    const roomOccupants = new Map<string, string[]>();

    // 5. Pass A — Accessibility & Special Reserved Quotas
    const passAAssignments = AccessibilityPass.execute(
      prioritizedApplicants,
      snapshot.beds,
      assignedStudentIds,
      assignedBedIds,
      roomOccupants,
    );

    // 6. Pass B — Ranked Preferences & Roommate Compatibility
    const passBAssignments = PreferencesPass.execute(
      prioritizedApplicants,
      snapshot.beds,
      assignedStudentIds,
      assignedBedIds,
      roomOccupants,
      snapshot.compatibilityMatrix,
      snapshot.preferenceWeight ?? 0.7,
      snapshot.compatibilityWeight ?? 0.3,
    );

    // 7. Pass C — Fallback lowest-regret assignment & waitlist generation
    const { fallbackAssignments, waitlist } = FallbackPass.execute(
      prioritizedApplicants,
      snapshot.beds,
      assignedStudentIds,
      assignedBedIds,
      roomOccupants,
    );

    let allAssignments: EngineAssignment[] = [
      ...passAAssignments,
      ...passBAssignments,
      ...fallbackAssignments,
    ];

    // 8. Bounded Local Improvement (Pair-Swaps)
    const maxIterations = snapshot.maxImprovementIterations ?? 200;
    const { finalAssignments } = LocalImprovement.optimize(
      allAssignments,
      applicantsMap,
      bedsMap,
      maxIterations,
    );
    allAssignments = finalAssignments;

    // 9. Independent Post-Validation (INVARIANT I8)
    AllocationValidator.validate(allAssignments, applicantsMap, bedsMap, roomCapacityMap);

    // 10. Compute Statistics
    const totalAssigned = allAssignments.length;
    const totalUnassigned = waitlist.length;

    let firstChoiceCount = 0;
    let totalCompatScore = 0;
    let compatCount = 0;

    for (const a of allAssignments) {
      if (a.explanation.isFirstChoice) firstChoiceCount++;
      if (a.explanation.roommateCompatibilityScore !== null) {
        totalCompatScore += a.explanation.roommateCompatibilityScore;
        compatCount++;
      }
    }

    const firstChoicePercentage =
      totalAssigned > 0 ? Math.round((firstChoiceCount / totalAssigned) * 10000) / 100 : 0;
    const averageCompatibilityScore =
      compatCount > 0 ? Math.round((totalCompatScore / compatCount) * 10) / 10 : null;

    const executionTimeMs = Date.now() - startTime;

    // 11. Compute Output Hash for Invariant I3 verification
    const sortedAssignmentsForHash = [...allAssignments]
      .sort((a, b) => a.studentId.localeCompare(b.studentId))
      .map((a) => ({
        s: a.studentId,
        b: a.bedId,
        r: a.explanation.preferenceRankSatisfied,
        q: a.explanation.quotaBucketUsed,
      }));

    const outputHash = this.hashObject(sortedAssignmentsForHash);

    return {
      assignments: allAssignments,
      waitlist,
      stats: {
        totalAssigned,
        totalUnassigned,
        firstChoicePercentage,
        averageCompatibilityScore,
        executionTimeMs,
      },
      inputSnapshotHash,
      outputHash,
      engineVersion: ENGINE_VERSION,
    };
  }
}
