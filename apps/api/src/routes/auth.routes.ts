import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginRequestSchema, UserSchema } from '@hostel/shared';
import { UserModel } from '../models/User.js';
import { AuditService } from '../services/AuditService.js';
import { authenticate } from '../middleware/auth.js';
import { env } from '../config/env.js';

const router = Router();

// Register user (dev / seed / admin creation)
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = UserSchema.parse(req.body);
    const existing = await UserModel.findOne({ email: validatedData.email });
    if (existing) {
      res.status(409).json({ error: 'Conflict', message: 'User with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(req.body.password || 'Password123!', salt);

    const user = new UserModel({
      email: validatedData.email,
      passwordHash,
      fullName: validatedData.fullName,
      role: validatedData.role,
      assignedHostelId: validatedData.assignedHostelId,
    });
    await user.save();

    await AuditService.log({
      action: 'USER_CREATED',
      actorId: 'SYSTEM',
      resourceType: 'User',
      resourceId: user._id.toString(),
      after: { email: user.email, role: user.role },
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
});

// Login user
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = LoginRequestSchema.parse(req.body);
    const user = await UserModel.findOne({ email });

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials or inactive account' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
      return;
    }

    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      assignedHostelId: user.assignedHostelId,
    };

    const accessToken = jwt.sign(tokenPayload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY as any,
    });

    const refreshToken = jwt.sign(tokenPayload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRY as any,
    });

    await AuditService.log({
      action: 'USER_LOGIN',
      actorId: user._id.toString(),
      resourceType: 'User',
      resourceId: user._id.toString(),
      after: { email: user.email, role: user.role },
    });

    res.json({
      accessToken,
      refreshToken,
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
});

// Current user profile
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserModel.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found' });
      return;
    }
    res.json({ user: user.toJSON() });
  } catch (err) {
    next(err);
  }
});

export default router;
