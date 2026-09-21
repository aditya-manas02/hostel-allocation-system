import { WaitlistEntryModel } from '../models/WaitlistEntry.js';
import { BedModel } from '../models/Bed.js';
import { RoomModel } from '../models/Room.js';
import { UserModel } from '../models/User.js';
import { HardConstraints } from '@hostel/engine';
import { AuditService } from './AuditService.js';

export class WaitlistService {
  /**
   * Promotes the top eligible waitlist applicant to an available vacant bed.
   * Audited with action WAITLIST_PROMOTED.
   */
  public static async autoPromoteOnVacancy(
    cycleId: string,
    bedId: string,
    actorId: string = 'SYSTEM',
  ): Promise<{ promoted: boolean; studentId?: string; waitlistEntryId?: string }> {
    const bed = await BedModel.findById(bedId);
    if (!bed) throw new Error(`Bed ${bedId} not found.`);

    const room = await RoomModel.findById(bed.roomId);
    if (!room) throw new Error(`Room ${bed.roomId} not found.`);

    // Find active waitlist entries in priority order
    const waitlist = await WaitlistEntryModel.find({ cycleId, status: 'ACTIVE' })
      .sort({ position: 1 });

    for (const entry of waitlist) {
      const student = await UserModel.findById(entry.studentId);
      if (!student) continue;

      // Check feasibility
      const isGenderFeasible = HardConstraints.isGenderFeasible(
        (student as any).gender || 'OTHER',
        room.genderDesignation,
      );

      const isAccessibleFeasible = HardConstraints.isAccessibilityFeasible(
        (student as any).accessibilityRequired || false,
        bed.isAccessible,
      );

      if (isGenderFeasible && isAccessibleFeasible) {
        // Promote this student
        entry.status = 'PROMOTED';
        entry.promotedToBedId = bed._id as any;
        await entry.save();

        bed.status = 'OCCUPIED';
        bed.currentOccupantId = student._id as any;
        await bed.save();

        await AuditService.log({
          action: 'WAITLIST_PROMOTED',
          actorId,
          resourceType: 'WaitlistEntry',
          resourceId: entry._id.toString(),
          before: { status: 'ACTIVE', position: entry.position },
          after: { status: 'PROMOTED', promotedToBedId: bed._id.toString() },
        });

        return {
          promoted: true,
          studentId: student._id.toString(),
          waitlistEntryId: entry._id.toString(),
        };
      }
    }

    return { promoted: false };
  }
}
