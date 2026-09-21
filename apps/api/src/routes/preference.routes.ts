import { Router, Request, Response, NextFunction } from 'express';
import { PreferenceSchema } from '@hostel/shared';
import { PreferenceModel } from '../models/Preference.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Student gets their preferences for a cycle
router.get(
  '/:cycleId',
  authenticate,
  requireRole('STUDENT'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pref = await PreferenceModel.findOne({
        cycleId: req.params.cycleId,
        studentId: req.user!.id,
      })
        .populate('rankedHostelIds', 'name code genderDesignation')
        .lean();

      if (!pref) {
        res.status(404).json({ error: 'Not Found', message: 'Preferences not yet submitted' });
        return;
      }
      res.json(pref);
    } catch (err) {
      next(err);
    }
  },
);

// Student saves or updates ranked preferences
router.post(
  '/:cycleId',
  authenticate,
  requireRole('STUDENT'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cycleId = req.params.cycleId;
      const studentId = req.user!.id;

      const data = PreferenceSchema.parse({
        ...req.body,
        cycleId,
        studentId,
      });

      const pref = await PreferenceModel.findOneAndUpdate(
        { cycleId, studentId },
        data,
        { upsert: true, new: true },
      );

      res.status(201).json(pref.toJSON());
    } catch (err) {
      next(err);
    }
  },
);

export default router;
