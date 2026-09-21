import mongoose from 'mongoose';
import {
  HostelAllocationEngine,
  EngineApplicant,
  EngineBed,
  EngineInputSnapshot,
  EngineOutput,
} from '@hostel/engine';
import { AllocationCycleModel } from '../models/AllocationCycle.js';
import { ApplicationModel } from '../models/Application.js';
import { BedModel } from '../models/Bed.js';
import { RoomModel } from '../models/Room.js';
import { PreferenceModel } from '../models/Preference.js';
import { AllocationDraftModel } from '../models/AllocationDraft.js';
import { AllocationAssignmentModel } from '../models/AllocationAssignment.js';
import { AllocationRunModel } from '../models/AllocationRun.js';
import { AuditService } from './AuditService.js';

export class AllocationService {
  /**
   * Builds the complete immutable snapshot for the allocation engine.
   */
  public static async buildSnapshot(cycleId: string): Promise<EngineInputSnapshot> {
    const cycle = await AllocationCycleModel.findById(cycleId).lean();
    if (!cycle) throw new Error(`Cycle ${cycleId} not found`);

    // 1. Fetch eligible/submitted applications and their preferences
    const applications = await ApplicationModel.find({ cycleId }).lean();
    const preferences = await PreferenceModel.find({ cycleId }).lean();
    const prefMap = new Map(preferences.map((p) => [p.studentId.toString(), p]));

    const applicants: EngineApplicant[] = applications.map((app) => {
      const pref = prefMap.get(app.studentId.toString());
      return {
        id: app.studentId.toString(),
        gender: app.gender,
        quotaCategory: app.quotaCategory,
        yearOfStudy: app.yearOfStudy,
        meritRank: app.meritRank,
        accessibilityRequired: app.accessibilityRequired,
        isEligible: app.status !== 'INELIGIBLE',
        ineligibleReasons: app.eligibilityResult?.reasons,
        rankedHostelIds: pref ? pref.rankedHostelIds.map((h: any) => h.toString()) : [],
        rankedRoomTypes: pref ? pref.rankedRoomTypes : ['DOUBLE', 'TRIPLE'],
        requestedRoommateIds: pref ? pref.requestedRoommateStudentIds.map((r: any) => r.toString()) : [],
      };
    });

    // 2. Fetch all available beds and rooms
    const rooms = await RoomModel.find({ isActive: true }).lean();
    const roomMap = new Map(rooms.map((r) => [r._id.toString(), r]));

    const beds = await BedModel.find({ isActive: true }).lean();
    const engineBeds: EngineBed[] = beds.map((bed) => {
      const room = roomMap.get(bed.roomId.toString())!;
      return {
        id: bed._id.toString(),
        roomId: bed.roomId.toString(),
        floorId: bed.floorId.toString(),
        blockId: bed.blockId.toString(),
        hostelId: bed.hostelId.toString(),
        bedLabel: bed.bedLabel,
        isAccessible: bed.isAccessible,
        genderDesignation: room.genderDesignation,
        roomType: room.roomType,
        roomCapacity: room.capacity,
      };
    });

    return {
      applicants,
      beds: engineBeds,
      quotas: cycle.quotas as any,
    };
  }

  /**
   * Executes the allocation run, persists draft and assignments, and records audit trail.
   */
  public static async executeRun(
    cycleId: string,
    masterSeed: string,
    parameters: Record<string, any> = {},
    actorId: string = 'SYSTEM',
  ): Promise<{ runId: string; output: EngineOutput; draftId: string }> {
    const run = new AllocationRunModel({
      cycleId,
      seed: masterSeed,
      parameters,
      status: 'RUNNING',
      progress: 10,
    });
    await run.save();

    await AuditService.log({
      action: 'ALLOCATION_STARTED',
      actorId,
      resourceType: 'AllocationRun',
      resourceId: run._id.toString(),
      after: { cycleId, seed: masterSeed },
    });

    try {
      // 1. Build input snapshot
      const snapshot = await this.buildSnapshot(cycleId);
      run.progress = 40;
      await run.save();

      // 2. Run deterministic engine
      const output = HostelAllocationEngine.allocate(snapshot, masterSeed, parameters);
      run.progress = 75;
      await run.save();

      // 3. Persist draft and assignments in database
      const nextVersion =
        (await AllocationDraftModel.countDocuments({ cycleId })) + 1;

      const draft = new AllocationDraftModel({
        cycleId,
        version: nextVersion,
        status: 'DRAFT',
        seed: masterSeed,
        parameters,
        inputSnapshotHash: output.inputSnapshotHash,
        engineVersion: output.engineVersion,
        outputHash: output.outputHash,
        stats: output.stats,
      });
      await draft.save();

      const assignmentDocs = output.assignments.map((a) => ({
        draftId: draft._id,
        bedId: new mongoose.Types.ObjectId(a.bedId),
        roomId: new mongoose.Types.ObjectId(a.roomId),
        hostelId: new mongoose.Types.ObjectId(a.hostelId),
        studentId: new mongoose.Types.ObjectId(a.studentId),
        explanation: a.explanation,
      }));

      // Insert in chunks
      if (assignmentDocs.length > 0) {
        await AllocationAssignmentModel.insertMany(assignmentDocs, { ordered: false });
      }

      // Update run
      run.status = 'COMPLETED';
      run.progress = 100;
      run.draftId = draft._id;
      run.inputSnapshotHash = output.inputSnapshotHash;
      run.outputHash = output.outputHash;
      run.stats = output.stats;
      run.durationMs = output.stats.executionTimeMs;
      await run.save();

      await AuditService.log({
        action: 'ALLOCATION_COMPLETED',
        actorId,
        resourceType: 'AllocationDraft',
        resourceId: draft._id.toString(),
        after: {
          version: nextVersion,
          totalAssigned: output.stats.totalAssigned,
          outputHash: output.outputHash,
        },
      });

      return {
        runId: run._id.toString(),
        output,
        draftId: draft._id.toString(),
      };
    } catch (err: any) {
      run.status = 'FAILED';
      run.error = err.message;
      await run.save();

      await AuditService.log({
        action: 'ALLOCATION_FAILED',
        actorId,
        resourceType: 'AllocationRun',
        resourceId: run._id.toString(),
        after: { error: err.message },
      });

      throw err;
    }
  }
}
