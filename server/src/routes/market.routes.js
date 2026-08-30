import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Job from '../models/Job.js';
import Skill from '../models/Skill.js';
import CareerRole from '../models/CareerRole.js';
import CandidateProfile from '../models/CandidateProfile.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

// ─── Helper: compute base market insights from jobs ──────
function computeMarketInsights(jobs) {
  // Most demanded skills with importance weighting
  const skillData = {};
  jobs.forEach((job) => {
    (job.requiredSkills || []).forEach((rs) => {
      const name = rs.skill?.name || 'Unknown';
      const id = rs.skill?._id?.toString() || name;
      if (!skillData[name]) skillData[name] = { name, id, count: 0, totalWeight: 0, categories: new Set() };
      skillData[name].count++;
      skillData[name].totalWeight += rs.importanceWeight || 1;
      if (rs.skill?.category) skillData[name].categories.add(rs.skill.category);
    });
  });
  const totalJobs = jobs.length || 1;
  const topSkills = Object.values(skillData)
    .map((s) => ({
      ...s,
      categories: [...s.categories],
      percentage: Math.round((s.count / totalJobs) * 100),
      demandLevel: s.count >= totalJobs * 0.6 ? 'High' : s.count >= totalJobs * 0.3 ? 'Medium' : 'Low',
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // Job count by role
  const roleCount = {};
  jobs.forEach((job) => {
    const title = job.careerRole?.title || 'Other';
    const roleId = job.careerRole?._id?.toString() || '';
    if (!roleCount[title]) roleCount[title] = { title, roleId, count: 0 };
    roleCount[title].count++;
  });
  const jobsByRole = Object.values(roleCount).sort((a, b) => b.count - a.count);

  // Locations
  const locationCount = {};
  jobs.forEach((job) => {
    const loc = job.location || 'Unknown';
    locationCount[loc] = (locationCount[loc] || 0) + 1;
  });
  const locations = Object.entries(locationCount)
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / totalJobs) * 100) }))
    .sort((a, b) => b.count - a.count);

  // Salary ranges
  const salaryByRole = {};
  jobs.forEach((j) => {
    if (!j.salary?.min || !j.salary?.max) return;
    const role = j.careerRole?.title || 'Other';
    if (!salaryByRole[role]) salaryByRole[role] = { totalMin: 0, totalMax: 0, count: 0, min: Infinity, max: -Infinity };
    salaryByRole[role].totalMin += j.salary.min;
    salaryByRole[role].totalMax += j.salary.max;
    salaryByRole[role].count++;
    salaryByRole[role].min = Math.min(salaryByRole[role].min, j.salary.min);
    salaryByRole[role].max = Math.max(salaryByRole[role].max, j.salary.max);
  });
  const salaryRanges = Object.entries(salaryByRole).map(([role, d]) => ({
    role,
    avgMin: Math.round(d.totalMin / d.count),
    avgMax: Math.round(d.totalMax / d.count),
    min: d.min,
    max: d.max,
    jobCount: d.count,
  }));

  // Experience distribution
  const expDist = { '0-1 years': 0, '1-3 years': 0, '3-5 years': 0, '5+ years': 0 };
  jobs.forEach((j) => {
    const exp = j.experienceRequired || 0;
    if (exp <= 1) expDist['0-1 years']++;
    else if (exp <= 3) expDist['1-3 years']++;
    else if (exp <= 5) expDist['3-5 years']++;
    else expDist['5+ years']++;
  });

  // Job types
  const jobTypeCount = {};
  jobs.forEach((j) => {
    const type = j.jobType || 'full_time';
    const label = type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    jobTypeCount[label] = (jobTypeCount[label] || 0) + 1;
  });
  const jobTypes = Object.entries(jobTypeCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalJobs: jobs.length,
    isDemo: true,
    topSkills,
    jobsByRole,
    locations,
    salaryRanges,
    experienceDistribution: Object.entries(expDist).map(([range, count]) => ({ range, count })),
    jobTypes,
  };
}

// ─── GET /api/market/insights ──────────────────────────
router.get('/market/insights', authenticateUser, asyncHandler(async (req, res) => {
  const jobs = await Job.find({ isActive: true })
    .populate('requiredSkills.skill', 'name category')
    .populate('careerRole', 'title');

  ApiResponse.success(res, computeMarketInsights(jobs));
}));

// ─── GET /api/market/candidate-insights ─────────────────
router.get('/market/candidate-insights', authenticateUser, asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOne({ user: req.user._id })
    .populate('targetCareer', 'title requiredSkills')
    .populate('declaredSkillLevels.skill', 'name category');

  if (!profile) {
    return ApiResponse.success(res, {
      hasProfile: false,
      message: 'Complete your profile to see personalized market insights.',
    });
  }

  const jobs = await Job.find({ isActive: true })
    .populate('requiredSkills.skill', 'name category')
    .populate('careerRole', 'title');

  const market = computeMarketInsights(jobs);

  // Build candidate skill map
  const candidateSkillMap = {};
  (profile.declaredSkillLevels || []).forEach((ds) => {
    const name = ds.skill?.name || '';
    candidateSkillMap[name] = ds.level;
    candidateSkillMap[ds.skill?._id?.toString()] = ds.level;
  });

  // Candidate skill names for quick lookup
  const candidateSkillNames = new Set(
    (profile.declaredSkillLevels || []).map((ds) => ds.skill?.name).filter(Boolean)
  );

  // For target career: get market-demanded skills vs candidate skills
  let marketGap = null;
  if (profile.targetCareer) {
    const careerTitle = profile.targetCareer.title;
    const careerId = profile.targetCareer._id?.toString();

    // Get jobs for this career role
    const careerJobs = jobs.filter((j) => {
      const jRoleId = j.careerRole?._id?.toString();
      const jRoleTitle = j.careerRole?.title;
      return jRoleId === careerId || jRoleTitle === careerTitle;
    });

    // Skills demanded by this career's jobs
    const careerSkillDemand = {};
    careerJobs.forEach((job) => {
      (job.requiredSkills || []).forEach((rs) => {
        const name = rs.skill?.name || 'Unknown';
        const id = rs.skill?._id?.toString();
        if (!careerSkillDemand[name]) careerSkillDemand[name] = { name, id, count: 0, totalJobs: careerJobs.length };
        careerSkillDemand[name].count++;
      });
    });

    const demandedSkills = Object.values(careerSkillDemand)
      .map((s) => ({
        ...s,
        demandPercentage: Math.round((s.count / (s.totalJobs || 1)) * 100),
        demandLevel: s.count >= (s.totalJobs || 1) * 0.6 ? 'High' : s.count >= (s.totalJobs || 1) * 0.3 ? 'Medium' : 'Low',
        hasSkill: candidateSkillNames.has(s.name),
        candidateScore: candidateSkillMap[s.name] || 0,
      }))
      .sort((a, b) => b.count - a.count);

    const highDemandGaps = demandedSkills.filter((s) => !s.hasSkill && s.demandLevel === 'High');
    const mediumDemandGaps = demandedSkills.filter((s) => !s.hasSkill && s.demandLevel === 'Medium');
    const matchedHighDemand = demandedSkills.filter((s) => s.hasSkill && s.demandLevel === 'High');

    marketGap = {
      careerTitle,
      totalCareerJobs: careerJobs.length,
      demandedSkills,
      highDemandGaps: highDemandGaps.length,
      mediumDemandGaps: mediumDemandGaps.length,
      matchedHighDemand: matchedHighDemand.length,
      totalDemandedSkills: demandedSkills.length,
      matchedSkills: demandedSkills.filter((s) => s.hasSkill).length,
      gapScore: demandedSkills.length > 0
        ? Math.round((demandedSkills.filter((s) => s.hasSkill).length / demandedSkills.length) * 100)
        : 0,
    };
  }

  // Candidate's position among market skills
  const marketSkillNames = market.topSkills.map((s) => s.name);
  const candidateStrongMarket = marketSkillNames.filter((name) => candidateSkillNames.has(name));
  const candidateWeakMarket = marketSkillNames.filter((name) => !candidateSkillNames.has(name));

  // Personalized market position
  const personalizedPosition = {
    targetRole: profile.targetCareer?.title || 'Not set',
    profileReadiness: profile.overallScore || 0,
    strongMarketSkills: candidateStrongMarket.slice(0, 5),
    weakMarketSkills: candidateWeakMarket.slice(0, 5),
    recommendedAction: '',
  };

  if (marketGap && marketGap.highDemandGaps > 0) {
    const topGap = demandedSkills.find((s) => !s.hasSkill && s.demandLevel === 'High');
    personalizedPosition.recommendedAction = `Prioritize learning ${topGap?.name || 'high-demand skills'} — it appears in ${topGap?.demandPercentage || 0}% of ${careerTitle} job listings.`;
  } else if (personalizedPosition.weakMarketSkills.length > 0) {
    personalizedPosition.recommendedAction = `Consider learning ${personalizedPosition.weakMarketSkills[0]} to strengthen your market position.`;
  } else {
    personalizedPosition.recommendedAction = 'Your profile is well-aligned with market demands. Keep building experience.';
  }

  ApiResponse.success(res, {
    ...market,
    marketGap,
    personalizedPosition,
    candidateSkillCount: candidateSkillNames.size,
  });
}));

export default router;
