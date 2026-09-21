import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

export function correlationId(req: Request, res: Response, next: NextFunction): void {
  const headerId = req.headers['x-correlation-id'];
  const cid = (Array.isArray(headerId) ? headerId[0] : headerId) || crypto.randomUUID();
  req.correlationId = cid;
  res.setHeader('x-correlation-id', cid);
  next();
}
