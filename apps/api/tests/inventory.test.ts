import { describe, it, expect } from 'vitest';
import { InventoryService } from '../src/services/InventoryService.js';

describe('Inventory Bulk CSV Import', () => {
  const validCSV = `HostelName,HostelCode,GenderDesignation,BlockName,BlockCode,FloorNumber,FloorName,RoomNumber,RoomType,Capacity,IsAccessible,BedLabels
Gargi Bhawan,GB,FEMALE,Block A,A,0,Ground Floor,G01,DOUBLE,2,true,A;B
Gargi Bhawan,GB,FEMALE,Block A,A,0,Ground Floor,G02,SINGLE,1,false,A
Tagore Bhawan,TB,MALE,Block B,B,1,First Floor,101,TRIPLE,3,false,A;B;C
`;

  it('correctly parses valid CSV content into structured rows', () => {
    const { rows, errors } = InventoryService.parseCSV(validCSV);

    expect(errors.length).toBe(0);
    expect(rows.length).toBe(3);

    expect(rows[0]!.hostelCode).toBe('GB');
    expect(rows[0]!.genderDesignation).toBe('FEMALE');
    expect(rows[0]!.capacity).toBe(2);
    expect(rows[0]!.isAccessible).toBe(true);
    expect(rows[0]!.bedLabels).toEqual(['A', 'B']);

    expect(rows[2]!.hostelCode).toBe('TB');
    expect(rows[2]!.roomType).toBe('TRIPLE');
    expect(rows[2]!.capacity).toBe(3);
    expect(rows[2]!.bedLabels).toEqual(['A', 'B', 'C']);
  });

  it('detects and flags validation errors in invalid CSV content', () => {
    const invalidCSV = `HostelName,HostelCode,GenderDesignation,BlockName,BlockCode,FloorNumber,FloorName,RoomNumber,RoomType,Capacity,IsAccessible,BedLabels
Gargi Bhawan,GB,INVALID_GENDER,Block A,A,0,Ground,G01,DOUBLE,2,true,A;B
Tagore Bhawan,TB,MALE,Block B,B,abc,First,101,TRIPLE,3,false,A;B
Aryabhatta,AB,MALE,Block C,C,1,First,102,INVALID_TYPE,4,false,A;B;C;D
`;

    const { errors } = InventoryService.parseCSV(invalidCSV);

    expect(errors.length).toBeGreaterThanOrEqual(3);

    const errorFields = errors.map((e) => e.field);
    expect(errorFields).toContain('genderDesignation');
    expect(errorFields).toContain('floorNumber');
    expect(errorFields).toContain('bedLabels'); // 2 bed labels for capacity 3
    expect(errorFields).toContain('roomType');
  });

  it('runs dry run without committing changes to database', async () => {
    const report = await InventoryService.processBulkImport(validCSV, true, 'TEST-ADMIN');

    expect(report.dryRun).toBe(true);
    expect(report.validRows).toBe(3);
    expect(report.invalidRows).toBe(0);
    expect(report.errors.length).toBe(0);
    expect(report.summary.hostelsToCreate).toBe(2);
    expect(report.summary.bedsToCreate).toBe(6);
    expect(report.preview.length).toBe(3);
  });
});
