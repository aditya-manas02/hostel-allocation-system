import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@hostel/shared';
import { env } from '../config/env.js';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  assignedHostelId?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      correlationId?: string;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header',
      correlationId: req.correlationId,
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token!, env.JWT_ACCESS_SECRET) as AuthUser;
    req.user = payload;
    next();
  } catch (err: any) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Token expired or invalid',
      correlationId: req.correlationId,
    });
  }
}
