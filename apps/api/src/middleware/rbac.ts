import { Request, Response, NextFunction } from 'express';
import { Role } from '@hostel/shared';

/**
 * Ensures the authenticated user possesses at least one of the allowed roles.
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
        correlationId: req.correlationId,
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Role '${req.user.role}' is not authorized to access this resource. Required: ${allowedRoles.join(', ')}`,
        correlationId: req.correlationId,
      });
      return;
    }

    next();
  };
}

/**
 * Enforces hostel-level scoping for Wardens.
 * - Wardens may only access data for their assignedHostelId.
 * - Chief Wardens, Admins, Deans, and System Admins have cross-hostel access.
 */
export function requireHostelAccess(paramName: string = 'hostelId') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
        correlationId: req.correlationId,
      });
      return;
    }

    const targetHostelId = req.params[paramName] || req.body?.hostelId || req.query?.hostelId;

    if (req.user.role === 'WARDEN') {
      if (!req.user.assignedHostelId) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Warden has no assigned hostel.',
          correlationId: req.correlationId,
        });
        return;
      }

      if (targetHostelId && req.user.assignedHostelId !== targetHostelId) {
        res.status(403).json({
          error: 'Forbidden',
          message: `Access denied: Warden is only authorized for hostel '${req.user.assignedHostelId}', not '${targetHostelId}'.`,
          correlationId: req.correlationId,
        });
        return;
      }
    }

    next();
  };
}
