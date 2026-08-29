import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import CandidateProfile from '../models/CandidateProfile.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import LearningPath from '../models/LearningPath.js';
import Job from '../models/Job.js';
import CareerRole from '../models/CareerRole.js';
import Skill from '../models/Skill.js';
import { authenticateUser } from '../middleware/auth.js';
import { calculateJobMatch, rankJobs } from '../algorithms/jobMatcher.js';
import { calculateSkillGaps, getReadinessLevel, getReadinessLabel } from '../algorithms/skillGapCalculator.js';

const router = Router();

router.get('/dashboard', authenticateUser, asyncHandler(async (req, res) => {
  // 1. Profile
  const profile = await CandidateProfile.findOne({ user: req.user._id })
    .populate('targetCareer', 'title description icon averageSalary')
    .populate('declaredSkillLevels.skill', 'name category');

  // 2. Latest assessment
  const latestAttempt = await AssessmentAttempt.findOne({ candidate: req.user._id })
    .populate('assessment', 'title')
    .sort('-completedAt');

  // 3. Career goal + gap analysis
  let careerGoal = null;
  let gapAnalysis = null;
  let readinessLevel = null;

  if (profile?.targetCareer) {
    // Get career WITHOUT populating skills — we need raw ObjectIds
    const career = await CareerRole.findById(profile.targetCareer._id);
    if (career) {
      careerGoal = career;

      // Build skill scores from declared levels (handle populated or raw refs)
      const skillScores = (profile.declaredSkillLevels || []).map((ds) => ({
        skill: (ds.skill?._id || ds.skill).toString(),
        skillName: ds.skill?.name || '',
        score: ds.level,
      }));

      // Get skill name lookup
      const allSkills = await Skill.find();
      const skillLookup = {};
      allSkills.forEach((s) => { skillLookup[s._id.toString()] = s.name; });

      // Fill in missing skill names
      skillScores.forEach((s) => {
        if (!s.skillName) s.skillName = skillLookup[s.skill] || 'Unknown';
      });

      gapAnalysis = calculateSkillGaps(skillScores, career.requiredSkills, skillLookup);
      readinessLevel = getReadinessLevel(gapAnalysis.matchPercentage);
    }
  }

  // 4. Learning path
  const learningPath = await LearningPath.findOne({ candidate: req.user._id, status: 'active' })
    .populate('careerRole', 'title');

  // 5. Job matches (top 3)
  let jobMatches = [];
  if (profile) {
    const allJobs = await Job.find({ isActive: true })
      .populate('requiredSkills.skill', 'name')
      .populate('careerRole', 'title');
    const skillScores = (profile.declaredSkillLevels || []).map((ds) => ({
      skill: ds.skill?._id || ds.skill,
      score: ds.level,
    }));
    const ranked = rankJobs(profile, allJobs, skillScores);
    jobMatches = ranked.slice(0, 3);
  }

  // 6. Skill overview
  const skillOverview = (profile?.declaredSkillLevels || []).map((ds) => ({
    skill: ds.skill?.name || 'Unknown',
    score: ds.level,
    category: ds.skill?.category || 'general',
  })).sort((a, b) => b.score - a.score);

  ApiResponse.success(res, {
    user: req.user,
    profile,
    careerGoal,
    gapAnalysis,
    readinessLevel,
    readinessLabel: readinessLevel ? getReadinessLabel(readinessLevel) : null,
    latestAttempt,
    learningPath,
    jobMatches,
    skillOverview,
    overallScore: profile?.overallScore || 0,
  });
}));

export default router;
