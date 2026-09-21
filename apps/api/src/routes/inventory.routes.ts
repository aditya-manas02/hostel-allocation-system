import { Router, Request, Response, NextFunction } from 'express';
import { HostelSchema, BlockSchema, FloorSchema, RoomSchema, BedSchema } from '@hostel/shared';
import { HostelModel } from '../models/Hostel.js';
import { BlockModel } from '../models/Block.js';
import { FloorModel } from '../models/Floor.js';
import { RoomModel } from '../models/Room.js';
import { BedModel } from '../models/Bed.js';
import { InventoryService } from '../services/InventoryService.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole, requireHostelAccess } from '../middleware/rbac.js';
import { AuditService } from '../services/AuditService.js';

const router = Router();

// --- Hostels ---
router.get('/hostels', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const hostels = await HostelModel.find({ isActive: true }).lean();
    res.json(hostels);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/hostels',
  authenticate,
  requireRole('ADMIN', 'SYSTEM_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = HostelSchema.parse(req.body);
      const hostel = new HostelModel(data);
      await hostel.save();

      await AuditService.log({
        action: 'INVENTORY_CREATED',
        actorId: req.user!.id,
        resourceType: 'Hostel',
        resourceId: hostel._id.toString(),
        after: hostel.toJSON(),
      });

      res.status(201).json(hostel.toJSON());
    } catch (err) {
      next(err);
    }
  },
);

// --- Blocks ---
router.get('/blocks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = { isActive: true };
    if (req.query.hostelId) filter.hostelId = req.query.hostelId;
    const blocks = await BlockModel.find(filter).lean();
    res.json(blocks);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/blocks',
  authenticate,
  requireRole('ADMIN', 'SYSTEM_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = BlockSchema.parse(req.body);
      const block = new BlockModel(data);
      await block.save();

      await AuditService.log({
        action: 'INVENTORY_CREATED',
        actorId: req.user!.id,
        resourceType: 'Block',
        resourceId: block._id.toString(),
        after: block.toJSON(),
      });

      res.status(201).json(block.toJSON());
    } catch (err) {
      next(err);
    }
  },
);

// --- Floors ---
router.get('/floors', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = { isActive: true };
    if (req.query.blockId) filter.blockId = req.query.blockId;
    if (req.query.hostelId) filter.hostelId = req.query.hostelId;
    const floors = await FloorModel.find(filter).sort({ floorNumber: 1 }).lean();
    res.json(floors);
  } catch (err) {
    next(err);
  }
});

// --- Rooms ---
router.get('/rooms', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = { isActive: true };
    if (req.query.floorId) filter.floorId = req.query.floorId;
    if (req.query.blockId) filter.blockId = req.query.blockId;
    if (req.query.hostelId) filter.hostelId = req.query.hostelId;
    const rooms = await RoomModel.find(filter).lean();
    res.json(rooms);
  } catch (err) {
    next(err);
  }
});

// --- Beds (with hostel scoping for Wardens) ---
router.get(
  '/beds',
  authenticate,
  requireHostelAccess('hostelId'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: any = { isActive: true };
      if (req.query.roomId) filter.roomId = req.query.roomId;
      if (req.query.floorId) filter.floorId = req.query.floorId;
      if (req.query.hostelId) filter.hostelId = req.query.hostelId;
      const beds = await BedModel.find(filter).lean();
      res.json(beds);
    } catch (err) {
      next(err);
    }
  },
);

// --- Bulk CSV Import ---
router.post(
  '/import',
  authenticate,
  requireRole('ADMIN', 'SYSTEM_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { csvContent, dryRun = true } = req.body;
      if (!csvContent || typeof csvContent !== 'string') {
        res.status(400).json({ error: 'Bad Request', message: 'csvContent string is required' });
        return;
      }

      const report = await InventoryService.processBulkImport(
        csvContent,
        dryRun,
        req.user?.id || 'ADMIN',
      );

      res.json(report);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
