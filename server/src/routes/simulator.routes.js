import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import CandidateProfile from '../models/CandidateProfile.js';
import CareerRole from '../models/CareerRole.js';
import Skill from '../models/Skill.js';
import Job from '../models/Job.js';
import { authenticateUser } from '../middleware/auth.js';
import { calculateSkillGaps } from '../algorithms/skillGapCalculator.js';
import { calculateJobMatch, rankJobs } from '../algorithms/jobMatcher.js';

const router = Router();

router.post('/simulator/what-if', authenticateUser, asyncHandler(async (req, res) => {
  const { skillImprovements } = req.body;
  // skillImprovements: [{ skillId, newLevel }]

  if (!Array.isArray(skillImprovements) || skillImprovements.length === 0) {
    return res.status(400).json({ success: false, message: 'skillImprovements array is required' });
  }

  const profile = await CandidateProfile.findOne({ user: req.user._id });
  if (!profile || !profile.targetCareer) {
    return res.status(400).json({ success: false, message: 'Set a career goal first' });
  }

  const career = await CareerRole.findById(profile.targetCareer);
  if (!career) return res.status(404).json({ success: false, message: 'Career not found' });

  const allSkills = await Skill.find();
  const skillLookup = {};
  allSkills.forEach((s) => { skillLookup[s._id.toString()] = s.name; });

  // Build current scores
  const currentScores = (profile.declaredSkillLevels || []).map((ds) => ({
    skill: ds.skill.toString(),
    skillName: skillLookup[ds.skill.toString()] || 'Unknown',
    score: ds.level,
  }));

  // Build projected scores (current + improvements)
  const projectedScores = currentScores.map((cs) => {
    const improvement = skillImprovements.find((si) => si.skillId === cs.skill);
    return {
      ...cs,
      score: improvement ? Math.max(cs.score, improvement.newLevel) : cs.score,
    };
  });

  // Add any new skills from improvements not yet in profile
  for (const si of skillImprovements) {
    if (!projectedScores.find((ps) => ps.skill === si.skillId)) {
      projectedScores.push({
        skill: si.skillId,
        skillName: skillLookup[si.skillId] || 'Unknown',
        score: si.newLevel,
      });
    }
  }

  const currentGaps = calculateSkillGaps(currentScores, career.requiredSkills, skillLookup);
  const projectedGaps = calculateSkillGaps(projectedScores, career.requiredSkills, skillLookup);

  // Calculate job match changes
  const currentSkillScores = currentScores.map((cs) => ({ skill: cs.skill, score: cs.score }));
  const projectedSkillScores = projectedScores.map((ps) => ({ skill: ps.skill, score: ps.score }));

  const allJobs = await Job.find({ isActive: true }).populate('requiredSkills.skill', 'name').populate('careerRole', 'title');

  const currentMatches = rankJobs(profile, allJobs, currentSkillScores).slice(0, 5);
  const projectedMatches = rankJobs(profile, allJobs, projectedSkillScores).slice(0, 5);

  const jobChanges = projectedMatches.map((pm) => {
    const cm = currentMatches.find((c) => c.job._id.toString() === pm.job._id.toString());
    return {
      job: { title: pm.job.title, company: pm.job.company },
      currentScore: cm?.match.matchScore || 0,
      projectedScore: pm.match.matchScore,
      change: pm.match.matchScore - (cm?.match.matchScore || 0),
    };
  }).filter((j) => j.change !== 0).sort((a, b) => b.change - a.change);

  ApiResponse.success(res, {
    current: {
      matchPercentage: currentGaps.matchPercentage,
      readinessLevel: currentGaps.matchPercentage >= 70 ? 'ready' : currentGaps.matchPercentage >= 40 ? 'approaching' : 'not_ready',
      skillsReady: currentGaps.skillsReady,
      criticalGaps: currentGaps.criticalGaps,
    },
    projected: {
      matchPercentage: projectedGaps.matchPercentage,
      readinessLevel: projectedGaps.matchPercentage >= 70 ? 'ready' : projectedGaps.matchPercentage >= 40 ? 'approaching' : 'not_ready',
      skillsReady: projectedGaps.skillsReady,
      criticalGaps: projectedGaps.criticalGaps,
    },
    improvement: projectedGaps.matchPercentage - currentGaps.matchPercentage,
    jobChanges,
    disclaimer: 'Projected simulation — not a guarantee of employment.',
  });
}));

export default router;
