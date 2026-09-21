import { Router, Request, Response, NextFunction } from 'express';
import { QuestionnaireAnswersSchema } from '@hostel/shared';
import { CompatibilityResponseModel } from '../models/CompatibilityResponse.js';
import { CompatibilityScoringService } from '../services/CompatibilityScoringService.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Student checks their submission status (Invariant I6: NEVER returns answers)
router.get('/me', authenticate, requireRole('STUDENT'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.id;
    const doc = await CompatibilityResponseModel.findOne({ studentId }).lean();

    if (!doc) {
      res.json({
        hasSubmitted: false,
        consentGiven: false,
      });
      return;
    }

    res.json({
      hasSubmitted: true,
      consentGiven: doc.consentGiven,
      consentTimestamp: doc.consentTimestamp,
      keyVersion: doc.keyVersion,
      // INVARIANT I6: answers and encryptedPayload are STRICTLY omitted
    });
  } catch (err) {
    next(err);
  }
});

// Student submits answers with explicit consent (Write-only)
router.post('/me', authenticate, requireRole('STUDENT'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.id;
    const { answers, consentGiven } = req.body;

    if (!consentGiven) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Explicit consent is mandatory to process sensitive questionnaire data.',
      });
      return;
    }

    const validatedAnswers = QuestionnaireAnswersSchema.parse(answers);
    await CompatibilityScoringService.submitAnswers(studentId, validatedAnswers, consentGiven);

    res.status(201).json({
      message: 'Questionnaire responses securely encrypted and stored with consent.',
    });
  } catch (err) {
    next(err);
  }
});

// Student requests deletion of sensitive questionnaire data (Right to be forgotten)
router.delete('/me', authenticate, requireRole('STUDENT'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.id;
    await CompatibilityScoringService.deleteAnswers(studentId);

    res.json({
      message: 'Questionnaire data permanently deleted with tombstone audit entry.',
    });
  } catch (err) {
    next(err);
  }
});

// Compute aggregate pairwise score between two students (Admin / Warden / Student)
// INVARIANT I6: Returns ONLY the numerical score [0, 100], NEVER raw answers
router.get(
  '/score/:otherStudentId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentAId = req.user!.id;
      const studentBId = req.params.otherStudentId;

      const answersA = await CompatibilityScoringService.getDecryptedAnswers(studentAId);
      const answersB = await CompatibilityScoringService.getDecryptedAnswers(studentBId!);

      if (!answersA || !answersB) {
        res.status(404).json({
          error: 'Not Found',
          message: 'One or both students have not submitted compatibility questionnaires.',
        });
        return;
      }

      const score = CompatibilityScoringService.calculatePairwiseScore(answersA, answersB);

      res.json({
        studentA: studentAId,
        studentB: studentBId,
        compatibilityScore: score,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
