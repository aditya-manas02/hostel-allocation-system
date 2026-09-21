import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { env } from '../src/config/env.js';
import { HostelModel } from '../src/models/Hostel.js';
import { BedModel } from '../src/models/Bed.js';

describe('Reports & Public Occupancy API Tests', () => {
  // 1. P04 Public API rejects request without API key
  it('rejects public occupancy request without valid x-api-key', async () => {
    const res = await request(app).get('/api/public/occupancy');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  // 2. P04 Public API rejects request with invalid API key
  it('rejects public occupancy request with wrong x-api-key', async () => {
    const res = await request(app)
      .get('/api/public/occupancy')
      .set('x-api-key', 'wrong-key-12345');
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Invalid or missing P04 partner API key');
  });

  // 3. P04 Public API accepts request with valid API key and returns zero PII
  it('returns aggregate occupancy without PII with valid x-api-key', async () => {
    vi.spyOn(HostelModel, 'find').mockReturnValue({
      lean: vi.fn().mockResolvedValue([
        {
          _id: 'hostel-1',
          code: 'GB',
          name: 'Gargi Bhawan',
          genderDesignation: 'FEMALE',
          isActive: true,
        },
      ]),
    } as any);

    vi.spyOn(BedModel, 'countDocuments').mockImplementation(async (query: any) => {
      if (query?.status === 'OCCUPIED') return 1500;
      if (query?.isAccessible) return 40;
      return 1600; // total
    });

    const apiKey = env.P04_API_KEY || 'p04-default-shared-key-2026';
    const res = await request(app)
      .get('/api/public/occupancy')
      .set('x-api-key', apiKey);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.summary).toBeDefined();
    expect(res.body.summary.totalCampusBeds).toBe(1600);
    expect(res.body.summary.totalOccupiedBeds).toBe(1500);
    expect(res.body.hostels).toBeInstanceOf(Array);

    // Verify ZERO PII in public response
    const jsonString = JSON.stringify(res.body);
    expect(jsonString).not.toContain('studentId');
    expect(jsonString).not.toContain('studentName');
    expect(jsonString).not.toContain('rollNumber');
    expect(jsonString).not.toContain('email');
  });

  // 4. Internal reports endpoint rejects unauthenticated access
  it('rejects unauthenticated access to internal reports', async () => {
    const res = await request(app).get('/api/reports/occupancy');
    expect(res.status).toBe(401);
  });
});
