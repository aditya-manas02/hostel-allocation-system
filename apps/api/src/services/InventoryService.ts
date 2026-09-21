import mongoose from 'mongoose';
import {
  GenderDesignation,
  RoomType,
  ROOM_TYPES,
  GENDER_DESIGNATIONS,
  HostelSchema,
  BlockSchema,
  FloorSchema,
  RoomSchema,
  BedSchema,
} from '@hostel/shared';
import { HostelModel, IHostelDoc } from '../models/Hostel.js';
import { BlockModel, IBlockDoc } from '../models/Block.js';
import { FloorModel, IFloorDoc } from '../models/Floor.js';
import { RoomModel, IRoomDoc } from '../models/Room.js';
import { BedModel, IBedDoc } from '../models/Bed.js';
import { AuditService } from './AuditService.js';

export interface CSVImportRow {
  rowNumber: number;
  hostelName: string;
  hostelCode: string;
  genderDesignation: GenderDesignation;
  blockName: string;
  blockCode: string;
  floorNumber: number;
  floorName: string;
  roomNumber: string;
  roomType: RoomType;
  capacity: number;
  isAccessible: boolean;
  bedLabels: string[];
}

export interface CSVValidationError {
  row: number;
  field: string;
  message: string;
}

export interface CSVImportReport {
  dryRun: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: CSVValidationError[];
  summary: {
    hostelsToCreate: number;
    blocksToCreate: number;
    floorsToCreate: number;
    roomsToCreate: number;
    bedsToCreate: number;
  };
  preview: Array<{
    hostel: string;
    block: string;
    floor: number;
    room: string;
    type: string;
    capacity: number;
    beds: string[];
  }>;
}

export class InventoryService {
  /**
   * Parse and validate CSV content for bulk inventory import.
   */
  public static parseCSV(csvContent: string): { rows: CSVImportRow[]; errors: CSVValidationError[] } {
    const lines = csvContent
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const errors: CSVValidationError[] = [];
    const rows: CSVImportRow[] = [];

    if (lines.length <= 1) {
      errors.push({ row: 1, field: 'csv', message: 'CSV file is empty or missing headers' });
      return { rows, errors };
    }

    const headerLine = lines[0]!;
    const headers = headerLine.split(',').map((h) => h.trim().toLowerCase());
    const expectedHeaders = [
      'hostelname',
      'hostelcode',
      'genderdesignation',
      'blockname',
      'blockcode',
      'floornumber',
      'floorname',
      'roomnumber',
      'roomtype',
      'capacity',
      'isaccessible',
      'bedlabels',
    ];

    for (const exp of expectedHeaders) {
      if (!headers.includes(exp)) {
        errors.push({ row: 1, field: exp, message: `Missing required header: ${exp}` });
      }
    }

    if (errors.length > 0) return { rows, errors };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]!;
      const cols = line.split(',').map((c) => c.trim());
      const rowNum = i + 1;

      if (cols.length < headers.length) {
        errors.push({ row: rowNum, field: 'line', message: 'Row has fewer columns than header' });
        continue;
      }

      const getCol = (name: string) => cols[headers.indexOf(name)] || '';

      const hostelName = getCol('hostelname');
      const hostelCode = getCol('hostelcode').toUpperCase();
      const genderDesignation = getCol('genderdesignation').toUpperCase() as GenderDesignation;
      const blockName = getCol('blockname');
      const blockCode = getCol('blockcode').toUpperCase();
      const floorNumber = parseInt(getCol('floornumber'), 10);
      const floorName = getCol('floorname');
      const roomNumber = getCol('roomnumber');
      const roomType = getCol('roomtype').toUpperCase() as RoomType;
      const capacity = parseInt(getCol('capacity'), 10);
      const isAccessible = getCol('isaccessible').toLowerCase() === 'true';
      const bedLabelsRaw = getCol('bedlabels');
      const bedLabels = bedLabelsRaw ? bedLabelsRaw.split(';').map((b) => b.trim()) : [];

      // Validations
      if (!hostelName) errors.push({ row: rowNum, field: 'hostelName', message: 'Hostel name is required' });
      if (!hostelCode) errors.push({ row: rowNum, field: 'hostelCode', message: 'Hostel code is required' });
      if (!GENDER_DESIGNATIONS.includes(genderDesignation)) {
        errors.push({
          row: rowNum,
          field: 'genderDesignation',
          message: `Invalid gender designation: ${genderDesignation}. Allowed: ${GENDER_DESIGNATIONS.join(', ')}`,
        });
      }
      if (!blockName) errors.push({ row: rowNum, field: 'blockName', message: 'Block name is required' });
      if (!blockCode) errors.push({ row: rowNum, field: 'blockCode', message: 'Block code is required' });
      if (isNaN(floorNumber)) errors.push({ row: rowNum, field: 'floorNumber', message: 'Floor number must be an integer' });
      if (!roomNumber) errors.push({ row: rowNum, field: 'roomNumber', message: 'Room number is required' });
      if (!ROOM_TYPES.includes(roomType)) {
        errors.push({
          row: rowNum,
          field: 'roomType',
          message: `Invalid room type: ${roomType}. Allowed: ${ROOM_TYPES.join(', ')}`,
        });
      }
      if (isNaN(capacity) || capacity < 1 || capacity > 8) {
        errors.push({ row: rowNum, field: 'capacity', message: 'Capacity must be between 1 and 8' });
      }
      if (bedLabels.length !== capacity) {
        errors.push({
          row: rowNum,
          field: 'bedLabels',
          message: `Number of bed labels (${bedLabels.length}) does not match capacity (${capacity})`,
        });
      }

      rows.push({
        rowNumber: rowNum,
        hostelName,
        hostelCode,
        genderDesignation,
        blockName,
        blockCode,
        floorNumber,
        floorName: floorName || `Floor ${floorNumber}`,
        roomNumber,
        roomType,
        capacity,
        isAccessible,
        bedLabels,
      });
    }

    return { rows, errors };
  }

  /**
   * Process bulk import: dry-run or commit with transaction.
   */
  public static async processBulkImport(
    csvContent: string,
    dryRun: boolean = true,
    actorId: string = 'ADMIN',
  ): Promise<CSVImportReport> {
    const { rows, errors } = this.parseCSV(csvContent);

    // Track unique entities to be created
    const uniqueHostels = new Set<string>();
    const uniqueBlocks = new Set<string>();
    const uniqueFloors = new Set<string>();
    const uniqueRooms = new Set<string>();
    let totalBeds = 0;

    for (const r of rows) {
      uniqueHostels.add(r.hostelCode);
      uniqueBlocks.add(`${r.hostelCode}::${r.blockCode}`);
      uniqueFloors.add(`${r.hostelCode}::${r.blockCode}::${r.floorNumber}`);
      uniqueRooms.add(`${r.hostelCode}::${r.blockCode}::${r.floorNumber}::${r.roomNumber}`);
      totalBeds += r.bedLabels.length;
    }

    const preview = rows.slice(0, 10).map((r) => ({
      hostel: `${r.hostelName} (${r.hostelCode})`,
      block: `${r.blockName} (${r.blockCode})`,
      floor: r.floorNumber,
      room: r.roomNumber,
      type: r.roomType,
      capacity: r.capacity,
      beds: r.bedLabels,
    }));

    const report: CSVImportReport = {
      dryRun,
      totalRows: rows.length,
      validRows: rows.length - errors.length,
      invalidRows: errors.length,
      errors,
      summary: {
        hostelsToCreate: uniqueHostels.size,
        blocksToCreate: uniqueBlocks.size,
        floorsToCreate: uniqueFloors.size,
        roomsToCreate: uniqueRooms.size,
        bedsToCreate: totalBeds,
      },
      preview,
    };

    if (dryRun || errors.length > 0) {
      return report;
    }

    // Execute within Mongoose session/transaction
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const hostelMap = new Map<string, IHostelDoc>();
        const blockMap = new Map<string, IBlockDoc>();
        const floorMap = new Map<string, IFloorDoc>();

        for (const row of rows) {
          // 1. Hostel
          let hostel = hostelMap.get(row.hostelCode);
          if (!hostel) {
            hostel = await HostelModel.findOne({ code: row.hostelCode }).session(session) || undefined;
            if (!hostel) {
              const created = await HostelModel.create(
                [
                  {
                    name: row.hostelName,
                    code: row.hostelCode,
                    genderDesignation: row.genderDesignation,
                  },
                ],
                { session },
              );
              hostel = created[0]!;
            }
            hostelMap.set(row.hostelCode, hostel);
          }

          // 2. Block
          const blockKey = `${row.hostelCode}::${row.blockCode}`;
          let block = blockMap.get(blockKey);
          if (!block) {
            block =
              (await BlockModel.findOne({ hostelId: hostel._id, code: row.blockCode }).session(session)) || undefined;
            if (!block) {
              const created = await BlockModel.create(
                [
                  {
                    hostelId: hostel._id,
                    name: row.blockName,
                    code: row.blockCode,
                    genderDesignation: row.genderDesignation,
                  },
                ],
                { session },
              );
              block = created[0]!;
            }
            blockMap.set(blockKey, block);
          }

          // 3. Floor
          const floorKey = `${blockKey}::${row.floorNumber}`;
          let floor = floorMap.get(floorKey);
          if (!floor) {
            floor =
              (await FloorModel.findOne({ blockId: block._id, floorNumber: row.floorNumber }).session(session)) ||
              undefined;
            if (!floor) {
              const created = await FloorModel.create(
                [
                  {
                    blockId: block._id,
                    hostelId: hostel._id,
                    floorNumber: row.floorNumber,
                    name: row.floorName,
                  },
                ],
                { session },
              );
              floor = created[0]!;
            }
            floorMap.set(floorKey, floor);
          }

          // 4. Room
          let room = await RoomModel.findOne({ floorId: floor._id, roomNumber: row.roomNumber }).session(session);
          if (!room) {
            const createdRooms = await RoomModel.create(
              [
                {
                  floorId: floor._id,
                  blockId: block._id,
                  hostelId: hostel._id,
                  roomNumber: row.roomNumber,
                  roomType: row.roomType,
                  capacity: row.capacity,
                  genderDesignation: row.genderDesignation,
                  isAccessible: row.isAccessible,
                  status: 'AVAILABLE',
                },
              ],
              { session },
            );
            room = createdRooms[0]!;
          }

          // 5. Beds
          for (const label of row.bedLabels) {
            const existingBed = await BedModel.findOne({ roomId: room._id, bedLabel: label }).session(session);
            if (!existingBed) {
              await BedModel.create(
                [
                  {
                    roomId: room._id,
                    floorId: floor._id,
                    blockId: block._id,
                    hostelId: hostel._id,
                    bedLabel: label,
                    isAccessible: row.isAccessible,
                    status: 'AVAILABLE',
                  },
                ],
                { session },
              );
            }
          }
        }

        // Write audit log
        await AuditService.log({
          action: 'INVENTORY_CREATED',
          actorId,
          resourceType: 'BulkImport',
          resourceId: `bulk-import-${Date.now()}`,
          after: report.summary,
        });
      });
    } finally {
      await session.endSession();
    }

    return report;
  }
}
