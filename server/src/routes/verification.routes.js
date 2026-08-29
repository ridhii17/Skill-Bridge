import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import SkillVerification from '../models/SkillVerification.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import Skill from '../models/Skill.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

const VERIFICATION_THRESHOLD = 70;

// Auto-verify skills after assessment (called internally)
export async function checkAndCreateVerifications(candidateId, attemptId) {
  const attempt = await AssessmentAttempt.findById(attemptId);
  if (!attempt) return [];

  const newVerifications = [];

  for (const ss of attempt.skillScores) {
    if (ss.score >= VERIFICATION_THRESHOLD) {
      const existing = await SkillVerification.findOne({
        candidate: candidateId,
        skill: ss.skill,
      });

      if (!existing || existing.level < ss.score) {
        if (existing) {
          existing.level = ss.score;
          existing.assessmentAttempt = attemptId;
          await existing.save();
          newVerifications.push(existing);
        } else {
          const skillDoc = await Skill.findById(ss.skill);
          const v = new SkillVerification({
            candidate: candidateId,
            skill: ss.skill,
            skillName: skillDoc?.name || ss.skillName,
            level: ss.score,
            assessmentAttempt: attemptId,
          });
          await v.save();
          newVerifications.push(v);
        }
      }
    }
  }

  return newVerifications;
}

// Get my verifications
router.get('/verifications/my', authenticateUser, asyncHandler(async (req, res) => {
  const verifications = await SkillVerification.find({ candidate: req.user._id, isActive: true })
    .populate('skill', 'name category')
    .sort('-verifiedAt');
  ApiResponse.success(res, verifications);
}));

// Public verification page
router.get('/verify/:verificationId', asyncHandler(async (req, res) => {
  const v = await SkillVerification.findOne({ verificationId: req.params.verificationId, isActive: true })
    .populate('skill', 'name category')
    .populate('candidate', 'name');

  if (!v) {
    return res.status(404).json({ success: false, message: 'Verification not found' });
  }

  // Only expose non-sensitive data
  ApiResponse.success(res, {
    verificationId: v.verificationId,
    candidateName: v.candidate?.name || 'Candidate',
    skill: v.skill?.name || v.skillName,
    category: v.skill?.category || '',
    level: v.level,
    badge: v.badge,
    verifiedAt: v.verifiedAt,
    platform: 'SkillBridge AI',
  }, 'Verification found');
}));

export default router;
