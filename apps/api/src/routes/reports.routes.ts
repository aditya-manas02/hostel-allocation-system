import { Router, Request, Response, NextFunction } from 'express';
import { BedModel } from '../models/Bed.js';
import { HostelModel } from '../models/Hostel.js';
import { AllocationDraftModel } from '../models/AllocationDraft.js';
import { OverrideModel } from '../models/Override.js';
import { WaitlistEntryModel } from '../models/WaitlistEntry.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { env } from '../config/env.js';

export const reportsRouter: Router = Router();
export const publicRouter: Router = Router();

// ==========================================
// 1. PUBLIC OCCUPANCY API FOR P04 (API Key Protected)
// ==========================================
publicRouter.get('/occupancy', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const expectedKey = env.P04_API_KEY || 'p04-default-shared-key-2026';

    if (!apiKey || apiKey !== expectedKey) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing P04 partner API key in x-api-key header.',
      });
      return;
    }

    const hostels = await HostelModel.find({ isActive: true }).lean();
    const aggregateData = await Promise.all(
      hostels.map(async (hostel) => {
        const totalBeds = await BedModel.countDocuments({ hostelId: hostel._id, isActive: true });
        const occupiedBeds = await BedModel.countDocuments({
          hostelId: hostel._id,
          isActive: true,
          status: 'OCCUPIED',
        });
        const accessibleBeds = await BedModel.countDocuments({
          hostelId: hostel._id,
          isActive: true,
          isAccessible: true,
        });

        return {
          hostelCode: hostel.code,
          hostelName: hostel.name,
          genderDesignation: hostel.genderDesignation,
          totalCapacity: totalBeds,
          currentOccupancy: occupiedBeds,
          availableBeds: totalBeds - occupiedBeds,
          accessibleBeds,
          occupancyPercentage: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 1000) / 10 : 0,
        };
      }),
    );

    const totalCapacity = aggregateData.reduce((acc, curr) => acc + curr.totalCapacity, 0);
    const totalOccupied = aggregateData.reduce((acc, curr) => acc + curr.currentOccupancy, 0);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalCampusBeds: totalCapacity,
        totalOccupiedBeds: totalOccupied,
        totalAvailableBeds: totalCapacity - totalOccupied,
        campusOccupancyPercentage: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 1000) / 10 : 0,
      },
      hostels: aggregateData,
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 2. INTERNAL REPORTS API (ADMIN / DEAN / CHIEF_WARDEN)
// ==========================================
reportsRouter.use(authenticate);
reportsRouter.use(requireRole('ADMIN', 'DEAN', 'CHIEF_WARDEN'));

/**
 * GET /api/reports/occupancy
 * Comprehensive occupancy breakdown by hostel, block, and room type
 */
reportsRouter.get('/occupancy', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const hostels = await HostelModel.find({ isActive: true }).lean();
    const reports = await Promise.all(
      hostels.map(async (h) => {
        const totalBeds = await BedModel.countDocuments({ hostelId: h._id, isActive: true });
        const occupiedBeds = await BedModel.countDocuments({ hostelId: h._id, status: 'OCCUPIED' });
        const reservedBeds = await BedModel.countDocuments({ hostelId: h._id, status: 'RESERVED' });
        const maintenanceBeds = await BedModel.countDocuments({ hostelId: h._id, status: 'MAINTENANCE' });
        const availableBeds = totalBeds - occupiedBeds - reservedBeds - maintenanceBeds;

        return {
          hostelId: h._id.toString(),
          hostelName: h.name,
          hostelCode: h.code,
          gender: h.genderDesignation,
          totalBeds,
          occupiedBeds,
          reservedBeds,
          maintenanceBeds,
          availableBeds: Math.max(0, availableBeds),
          occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 1000) / 10 : 0,
        };
      }),
    );

    res.json({ success: true, timestamp: new Date(), reports });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/reports/satisfaction
 * Preference satisfaction and algorithm performance stats
 */
reportsRouter.get('/satisfaction', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cycleId } = req.query;
    const filter = cycleId ? { cycleId } : {};

    const latestDraft = await AllocationDraftModel.findOne(filter).sort({ createdAt: -1 }).lean();
    if (!latestDraft) {
      res.json({
        success: true,
        stats: {
          totalAssigned: 0,
          totalUnassigned: 0,
          firstChoicePercentage: 0,
          averageCompatibilityScore: null,
          executionTimeMs: 0,
        },
      });
      return;
    }

    res.json({
      success: true,
      draftId: latestDraft._id.toString(),
      version: latestDraft.version,
      stats: latestDraft.stats,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/reports/overrides
 * Audit report of all manual overrides
 */
reportsRouter.get('/overrides', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { draftId } = req.query;
    const filter = draftId ? { draftId } : {};

    const overrides = await OverrideModel.find(filter).sort({ timestamp: -1 }).lean();

    const categoryCounts: Record<string, number> = {};
    let escalatedCount = 0;

    overrides.forEach((o) => {
      categoryCounts[o.reasonCategory] = (categoryCounts[o.reasonCategory] || 0) + 1;
      if (o.isEscalated) escalatedCount++;
    });

    res.json({
      success: true,
      totalOverrides: overrides.length,
      escalatedCount,
      categoryCounts,
      overrides,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/reports/waitlist
 * Current waitlist stats and queue depth
 */
reportsRouter.get('/waitlist', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cycleId } = req.query;
    const filter = cycleId ? { cycleId } : {};

    const activeWaitlist = await WaitlistEntryModel.find({ ...filter, status: 'ACTIVE' })
      .sort({ position: 1 })
      .lean();

    const promotedCount = await WaitlistEntryModel.countDocuments({ ...filter, status: 'PROMOTED' });

    res.json({
      success: true,
      activeCount: activeWaitlist.length,
      promotedCount,
      entries: activeWaitlist,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/reports/export
 * CSV data export for reporting and external compliance
 */
reportsRouter.get('/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = req.query.type as string; // 'occupancy' | 'overrides'

    if (type === 'overrides') {
      const overrides = await OverrideModel.find().lean();
      let csv = 'OverrideId,DraftId,BedId,PreviousStudentId,NewStudentId,Category,Reason,ActorRole,Escalated,Timestamp\n';
      overrides.forEach((o) => {
        csv += `"${o._id}","${o.draftId}","${o.bedId}","${o.previousStudentId || ''}","${o.newStudentId}","${o.reasonCategory}","${o.reasonText.replace(/"/g, '""')}","${o.actorRole}","${o.isEscalated}","${o.timestamp}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="overrides-report.csv"');
      res.send(csv);
      return;
    }

    // Default: occupancy
    const hostels = await HostelModel.find({ isActive: true }).lean();
    let csv = 'HostelCode,HostelName,Gender,TotalBeds,OccupiedBeds,ReservedBeds,MaintenanceBeds,OccupancyRate\n';

    for (const h of hostels) {
      const totalBeds = await BedModel.countDocuments({ hostelId: h._id, isActive: true });
      const occupiedBeds = await BedModel.countDocuments({ hostelId: h._id, status: 'OCCUPIED' });
      const reservedBeds = await BedModel.countDocuments({ hostelId: h._id, status: 'RESERVED' });
      const maintenanceBeds = await BedModel.countDocuments({ hostelId: h._id, status: 'MAINTENANCE' });
      const rate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : '0';

      csv += `"${h.code}","${h.name}","${h.genderDesignation}",${totalBeds},${occupiedBeds},${reservedBeds},${maintenanceBeds},${rate}%\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="occupancy-report.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});
