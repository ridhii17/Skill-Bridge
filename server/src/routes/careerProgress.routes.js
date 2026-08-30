import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { authenticateUser } from '../middleware/auth.js';
import CandidateProfile from '../models/CandidateProfile.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import CareerReadinessSnapshot from '../models/CareerReadinessSnapshot.js';
import MiniAssessmentAttempt from '../models/MiniAssessmentAttempt.js';
import SkillVerification from '../models/SkillVerification.js';
import LearningPath from '../models/LearningPath.js';
import CareerRole from '../models/CareerRole.js';
import Skill from '../models/Skill.js';
import Job from '../models/Job.js';
import { calculateCareerReadiness } from '../algorithms/careerReadinessService.js';
import { calculateJobMatch, rankJobs } from '../algorithms/jobMatcher.js';

const router = Router();

/**
 * GET /api/career-progress
 * Full career readiness loop timeline with before/after comparison
 */
router.get('/career-progress', authenticateUser, asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Get profile
  const profile = await CandidateProfile.findOne({ user: userId })
    .populate('targetCareer')
    .populate('declaredSkillLevels.skill', 'name category');

  if (!profile || !profile.targetCareer) {
    return ApiResponse.success(res, {
      hasData: false,
      message: 'Complete your profile and select a career goal to see your career progress.',
    }, 'No profile or career goal');
  }

  const career = await CareerRole.findById(profile.targetCareer._id || profile.targetCareer);
  if (!career) return res.status(404).json({ success: false, message: 'Career role not found' });

  const allSkills = await Skill.find();
  const allJobs = await Job.find({ isActive: true });

  // 2. Get all assessment attempts (chronological)
  const assessments = await AssessmentAttempt.find({ candidate: userId })
    .sort('completedAt')
    .populate('assessment', 'title');

  // 3. Get all readiness snapshots
  const snapshots = await CareerReadinessSnapshot.find({ candidate: userId })
    .sort('createdAt');

  // 4. Get mini assessment attempts
  const miniAttempts = await MiniAssessmentAttempt.find({ candidate: userId })
    .sort('completedAt')
    .populate('skill', 'name');

  // 5. Get verifications
  const verifications = await SkillVerification.find({ candidate: userId })
    .sort('verifiedAt')
    .populate('skill', 'name');

  // 6. Get learning path
  const learningPath = await LearningPath.findOne({ candidate: userId });

  // 7. Calculate current readiness
  const currentReadiness = calculateCareerReadiness(profile, career, assessments, { allSkills });

  // 8. Calculate current job matches
  const skillScores = (profile.declaredSkillLevels || []).map((ds) => ({
    skill: ds.skill?._id || ds.skill,
    score: ds.level,
  }));

  const jobMatches = allJobs.map((job) => {
    const match = calculateJobMatch(profile, job, skillScores);
    return { jobId: job._id, matchScore: match.matchScore };
  });
  const currentJobCount = jobMatches.filter((j) => j.matchScore >= 40).length;

  // 9. Build timeline events
  const timeline = [];

  // Add assessments
  assessments.forEach((a) => {
    timeline.push({
      type: 'assessment',
      date: a.completedAt,
      score: a.score,
      title: a.assessment?.title || 'Competency Assessment',
      details: `${a.correctAnswers}/${a.totalQuestions} correct`,
      triggeredReadiness: true,
    });
  });

  // Add mini assessments
  miniAttempts.forEach((ma) => {
    timeline.push({
      type: 'mini_assessment',
      date: ma.completedAt,
      score: ma.score,
      skillName: ma.skillName || ma.skill?.name || 'Skill',
      improvement: ma.improvement || 0,
      status: ma.status,
      details: ma.status === 'mastered' ? 'Mastered' : ma.status === 'developing' ? 'Developing' : 'Needs Reinforcement',
    });
  });

  // Add verifications
  verifications.forEach((v) => {
    timeline.push({
      type: 'verification',
      date: v.verifiedAt || v.createdAt,
      skillName: v.skill?.name || 'Skill',
      score: v.score,
      verificationId: v.verificationId,
      badge: v.badge,
    });
  });

  // Add readiness snapshots
  snapshots.forEach((s) => {
    timeline.push({
      type: 'readiness_update',
      date: s.createdAt,
      score: s.overallScore,
      level: s.readinessLevel,
      triggeredBy: s.triggeredBy,
    });
  });

  // Sort timeline by date
  timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

  // 10. Before vs After comparison
  let before = null;
  let after = null;

  if (assessments.length >= 2) {
    // First vs latest assessment
    const firstAttempt = assessments[0];
    const firstReadiness = snapshots.length > 0 ? snapshots[0] : null;
    const latestReadiness = snapshots.length > 1 ? snapshots[snapshots.length - 1] : null;

    before = {
      date: firstAttempt.completedAt,
      assessmentScore: firstAttempt.score,
      readinessScore: firstReadiness?.overallScore || firstAttempt.score,
      criticalGaps: firstReadiness?.criticalGaps || [],
      jobCount: 0, // We don't know the original job count
    };

    after = {
      date: assessments[assessments.length - 1].completedAt,
      assessmentScore: assessments[assessments.length - 1].score,
      readinessScore: currentReadiness.overallScore,
      criticalGaps: currentReadiness.criticalGaps,
      jobCount: currentJobCount,
    };
  } else if (assessments.length === 1) {
    // Only one assessment — show current state as "after" with estimated "before"
    const firstAttempt = assessments[0];
    before = {
      date: null,
      assessmentScore: Math.max(0, firstAttempt.score - 15),
      readinessScore: Math.max(0, currentReadiness.overallScore - 20),
      criticalGaps: [...(currentReadiness.criticalGaps || []), 'Assessment Pending'],
      jobCount: Math.max(0, currentJobCount - 5),
    };

    after = {
      date: firstAttempt.completedAt,
      assessmentScore: firstAttempt.score,
      readinessScore: currentReadiness.overallScore,
      criticalGaps: currentReadiness.criticalGaps,
      jobCount: currentJobCount,
    };
  }

  // 11. What changed — skill improvements from mini assessments
  const skillImprovements = [];
  const skillMap = {};
  miniAttempts.forEach((ma) => {
    const skillId = (ma.skill?._id || ma.skill || '').toString();
    if (!skillMap[skillId]) {
      skillMap[skillId] = {
        skillName: ma.skillName || ma.skill?.name || 'Unknown',
        attempts: [],
      };
    }
    skillMap[skillId].attempts.push(ma);
  });

  Object.values(skillMap).forEach((entry) => {
    const attempts = entry.attempts;
    if (attempts.length >= 1) {
      const latest = attempts[attempts.length - 1];
      const initial = attempts[0].previousScore || attempts[0].score;
      skillImprovements.push({
        skillName: entry.skillName,
        initialScore: initial,
        currentScore: latest.score,
        improvement: latest.score - initial,
        attempts: attempts.length,
        status: latest.status,
      });
    }
  });

  // Sort by improvement descending
  skillImprovements.sort((a, b) => b.improvement - a.improvement);

  // 12. Next best action (deterministic)
  const skillComparisons = currentReadiness.skillComparisons || [];
  const gaps = skillComparisons
    .filter((sc) => sc.status !== 'ready')
    .sort((a, b) => b.gap - a.gap);

  const nextBestAction = gaps.length > 0 ? {
    skillName: gaps[0].skillName,
    currentScore: gaps[0].currentScore,
    requiredScore: gaps[0].requiredScore,
    gap: gaps[0].gap,
    status: gaps[0].status,
  } : null;

  // 13. Learning stats
  const learningStats = learningPath ? {
    totalItems: learningPath.items?.length || 0,
    completed: learningPath.items?.filter((i) => i.status === 'completed' || i.status === 'mastered').length || 0,
    inProgress: learningPath.items?.filter((i) => i.status === 'in_progress').length || 0,
    progress: learningPath.progress || 0,
  } : null;

  // 14. Readiness progress chart data
  const chartData = snapshots.map((s, i) => ({
    name: s.triggeredBy === 'assessment' ? `Assessment ${i + 1}` : s.triggeredBy === 'mini_assessment' ? `Practice ${i + 1}` : `Snapshot ${i + 1}`,
    score: s.overallScore,
    date: new Date(s.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
  }));

  // If we only have one snapshot, add current score
  if (chartData.length === 1) {
    chartData.push({
      name: 'Current',
      score: currentReadiness.overallScore,
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    });
  }

  ApiResponse.success(res, {
    hasData: true,
    // Current state
    currentReadiness: {
      score: currentReadiness.overallScore,
      level: currentReadiness.readinessLevel,
      label: currentReadiness.readinessLabel,
      targetCareer: career.title,
      topStrengths: currentReadiness.topStrengths,
      criticalGaps: currentReadiness.criticalGaps,
      highestImpactSkill: currentReadiness.highestImpactSkill,
    },

    // Timeline
    timeline,
    timelineStats: {
      totalAssessments: assessments.length,
      totalMiniAssessments: miniAttempts.length,
      totalVerifications: verifications.length,
      totalSnapshots: snapshots.length,
    },

    // Before vs After
    before,
    after,
    improvement: before && after ? {
      readinessPoints: after.readinessScore - before.readinessScore,
      jobMatches: after.jobCount - before.jobCount,
      skillsImproved: skillImprovements.length,
      criticalGapsReduced: Math.max(0, (before.criticalGaps?.length || 0) - (after.criticalGaps?.length || 0)),
    } : null,

    // What changed
    skillImprovements,

    // Next best action
    nextBestAction,

    // Learning stats
    learningStats,

    // Chart data
    chartData,

    // Job impact
    jobImpact: {
      currentMatchCount: currentJobCount,
      totalJobs: allJobs.length,
    },
  });
}));

export default router;
