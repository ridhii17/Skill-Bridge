import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import CandidateProfile from '../models/CandidateProfile.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import CareerRole from '../models/CareerRole.js';
import Skill from '../models/Skill.js';
import CareerReadinessSnapshot from '../models/CareerReadinessSnapshot.js';
import { authenticateUser } from '../middleware/auth.js';
import { calculateCareerReadiness } from '../algorithms/careerReadinessService.js';

const router = Router();

/**
 * GET /api/career-readiness
 * Returns the full career readiness analysis for the authenticated candidate
 */
router.get('/career-readiness', authenticateUser, asyncHandler(async (req, res) => {
  // 1. Get profile with populated career and skills
  const profile = await CandidateProfile.findOne({ user: req.user._id })
    .populate('targetCareer')
    .populate('declaredSkillLevels.skill', 'name category');

  if (!profile) {
    return ApiResponse.success(res, {
      hasProfile: false,
      message: 'Complete your profile to see career readiness analysis.',
    }, 'No profile found');
  }

  if (!profile.targetCareer) {
    return ApiResponse.success(res, {
      hasProfile: true,
      hasTargetCareer: false,
      message: 'Set a career goal to see career readiness analysis.',
    }, 'No target career set');
  }

  // 2. Get career with required skills (unpopulated for algorithm)
  const career = await CareerRole.findById(profile.targetCareer._id || profile.targetCareer);
  if (!career) {
    return res.status(404).json({ success: false, message: 'Career role not found' });
  }

  // 3. Get all assessment attempts
  const attempts = await AssessmentAttempt.find({ candidate: req.user._id })
    .sort('-completedAt');

  // 4. Get all skills for name lookup
  const allSkills = await Skill.find();

  // 5. Calculate readiness
  const readiness = calculateCareerReadiness(profile, career, attempts, { allSkills });

  // 6. Get historical snapshots
  const history = await CareerReadinessSnapshot.find({ candidate: req.user._id })
    .sort('-createdAt')
    .limit(20)
    .select('overallScore readinessLevel readinessLabel triggeredBy createdAt targetCareerTitle');

  ApiResponse.success(res, {
    ...readiness,
    history,
    assessmentCount: attempts.length,
    latestAssessment: attempts.length > 0 ? {
      score: attempts[0].score,
      completedAt: attempts[0].completedAt,
      assessmentTitle: attempts[0].assessment?.title || 'Assessment',
    } : null,
  });
}));

/**
 * POST /api/career-readiness/snapshot
 * Manually trigger a readiness snapshot (or called internally after events)
 */
router.post('/career-readiness/snapshot', authenticateUser, asyncHandler(async (req, res) => {
  const { triggeredBy = 'manual', attemptId } = req.body;

  const profile = await CandidateProfile.findOne({ user: req.user._id })
    .populate('declaredSkillLevels.skill', 'name category');

  if (!profile?.targetCareer) {
    return res.status(400).json({ success: false, message: 'Set a career goal first' });
  }

  const career = await CareerRole.findById(profile.targetCareer);
  if (!career) return res.status(404).json({ success: false, message: 'Career not found' });

  const attempts = await AssessmentAttempt.find({ candidate: req.user._id }).sort('-completedAt');
  const allSkills = await Skill.find();

  const readiness = calculateCareerReadiness(profile, career, attempts, { allSkills });

  const snapshot = await CareerReadinessSnapshot.create({
    candidate: req.user._id,
    overallScore: readiness.overallScore,
    readinessLevel: readiness.readinessLevel,
    breakdown: readiness.breakdown,
    targetCareer: career._id,
    targetCareerTitle: career.title,
    skillComparisons: readiness.skillComparisons,
    topStrengths: readiness.topStrengths,
    criticalGaps: readiness.criticalGaps,
    highestImpactSkill: readiness.highestImpactSkill,
    triggeredBy,
    attemptId: attemptId || undefined,
  });

  ApiResponse.created(res, snapshot, 'Readiness snapshot created');
}));

/**
 * GET /api/career-readiness/history
 * Get historical readiness scores
 */
router.get('/career-readiness/history', authenticateUser, asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  const snapshots = await CareerReadinessSnapshot.find({ candidate: req.user._id })
    .sort('-createdAt')
    .limit(Math.min(parseInt(limit, 10) || 20, 50))
    .select('overallScore readinessLevel readinessLabel triggeredBy createdAt targetCareerTitle');

  ApiResponse.success(res, snapshots);
}));

export default router;

/**
 * Internal function: create a readiness snapshot after an event.
 * Called from assessment submission, verification, etc.
 */
export async function createReadinessSnapshot(candidateId, triggeredBy = 'assessment', attemptId = null) {
  try {
    const profile = await CandidateProfile.findOne({ user: candidateId })
      .populate('declaredSkillLevels.skill', 'name category');

    if (!profile?.targetCareer) return null;

    const career = await CareerRole.findById(profile.targetCareer);
    if (!career) return null;

    const attempts = await AssessmentAttempt.find({ candidate: candidateId }).sort('-completedAt');
    const allSkills = await Skill.find();

    const readiness = calculateCareerReadiness(profile, career, attempts, { allSkills });

    const snapshot = await CareerReadinessSnapshot.create({
      candidate: candidateId,
      overallScore: readiness.overallScore,
      readinessLevel: readiness.readinessLevel,
      breakdown: readiness.breakdown,
      targetCareer: career._id,
      targetCareerTitle: career.title,
      skillComparisons: readiness.skillComparisons,
      topStrengths: readiness.topStrengths,
      criticalGaps: readiness.criticalGaps,
      highestImpactSkill: readiness.highestImpactSkill,
      triggeredBy,
      attemptId: attemptId || undefined,
    });

    return snapshot;
  } catch (err) {
    console.error('Failed to create readiness snapshot:', err);
    return null;
  }
}
