import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { authenticate } from '../src/middleware/auth.js';
import { requireRole, requireHostelAccess } from '../src/middleware/rbac.js';
import { env } from '../src/config/env.js';

describe('Auth & RBAC Middleware', () => {
  it('authenticates valid JWT token and populates req.user', () => {
    const payload = {
      id: 'user-123',
      email: 'warden@hostel.edu',
      role: 'WARDEN' as const,
      assignedHostelId: 'hostel-A',
    };

    const token = jwt.sign(payload, env.JWT_ACCESS_SECRET);

    const req: any = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    const res: any = {};
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    authenticate(req, res, next);
    expect(nextCalled).toBe(true);
    expect(req.user).toBeDefined();
    expect(req.user.email).toBe('warden@hostel.edu');
    expect(req.user.role).toBe('WARDEN');
  });

  it('rejects missing or invalid Authorization header', () => {
    const req: any = { headers: {} };
    let responseStatus = 0;
    let responseJson: any = null;
    const res: any = {
      status: (code: number) => {
        responseStatus = code;
        return {
          json: (data: any) => {
            responseJson = data;
          },
        };
      },
    };
    const next = () => {};

    authenticate(req, res, next);
    expect(responseStatus).toBe(401);
    expect(responseJson.error).toBe('Unauthorized');
  });

  it('allows user with matching role in RBAC', () => {
    const req: any = {
      user: { id: 'u1', role: 'ADMIN' },
    };
    const res: any = {};
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    const middleware = requireRole('ADMIN', 'SYSTEM_ADMIN');
    middleware(req, res, next);
    expect(nextCalled).toBe(true);
  });

  it('forbids user with non-matching role in RBAC', () => {
    const req: any = {
      user: { id: 'u1', role: 'STUDENT' },
    };
    let responseStatus = 0;
    const res: any = {
      status: (code: number) => {
        responseStatus = code;
        return { json: () => {} };
      },
    };
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    const middleware = requireRole('ADMIN', 'WARDEN');
    middleware(req, res, next);
    expect(nextCalled).toBe(false);
    expect(responseStatus).toBe(403);
  });

  it('enforces hostel scoping for Wardens: allows assigned hostel, forbids other hostel', () => {
    const wardenReqAllowed: any = {
      user: { id: 'w1', role: 'WARDEN', assignedHostelId: 'hostel-alpha' },
      params: { hostelId: 'hostel-alpha' },
    };
    const res: any = {
      status: (code: number) => ({ json: () => code }),
    };
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    const scopeMiddleware = requireHostelAccess('hostelId');
    scopeMiddleware(wardenReqAllowed, res, next);
    expect(nextCalled).toBe(true);

    // Now test forbidden access to different hostel
    const wardenReqForbidden: any = {
      user: { id: 'w1', role: 'WARDEN', assignedHostelId: 'hostel-alpha' },
      params: { hostelId: 'hostel-beta' },
    };
    let forbiddenStatus = 0;
    const resForbidden: any = {
      status: (code: number) => {
        forbiddenStatus = code;
        return { json: () => {} };
      },
    };
    let forbiddenNextCalled = false;
    scopeMiddleware(wardenReqForbidden, resForbidden, () => {
      forbiddenNextCalled = true;
    });

    expect(forbiddenNextCalled).toBe(false);
    expect(forbiddenStatus).toBe(403);
  });
});
