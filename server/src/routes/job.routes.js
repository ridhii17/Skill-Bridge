import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Job from '../models/Job.js';
import CandidateProfile from '../models/CandidateProfile.js';
import Skill from '../models/Skill.js';
import { authenticateUser } from '../middleware/auth.js';
import { calculateJobMatch, rankJobs } from '../algorithms/jobMatcher.js';

const router = Router();

// List all active jobs
router.get('/jobs', asyncHandler(async (req, res) => {
  const { careerRoleId, jobType, search } = req.query;
  const filter = { isActive: true };
  if (careerRoleId) filter.careerRole = careerRoleId;
  if (jobType) filter.jobType = jobType;
  if (search) filter.title = { $regex: search, $options: 'i' };

  const jobs = await Job.find(filter)
    .populate('requiredSkills.skill', 'name')
    .populate('careerRole', 'title')
    .sort('-postedAt');

  ApiResponse.success(res, jobs);
}));

// Get job detail
router.get('/jobs/:id', asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('requiredSkills.skill', 'name category')
    .populate('careerRole', 'title');
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  ApiResponse.success(res, job);
}));

// Get matched jobs for current candidate
router.get('/jobs/matches/my', authenticateUser, asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOne({ user: req.user._id });
  const allJobs = await Job.find({ isActive: true })
    .populate('requiredSkills.skill', 'name')
    .populate('careerRole', 'title');

  if (!profile) {
    // Return jobs with no match data
    const jobsWithMatch = allJobs.map((job) => ({
      job,
      match: { matchScore: 0, matchingSkills: [], missingSkills: [], breakdown: {} },
    }));
    return ApiResponse.success(res, jobsWithMatch, 'Complete your profile for match scores');
  }

  // Build skill scores from profile
  const skillScores = (profile.declaredSkillLevels || []).map((ds) => ({
    skill: ds.skill,
    score: ds.level,
  }));

  const ranked = rankJobs(profile, allJobs, skillScores);
  ApiResponse.success(res, ranked);
}));

export default router;
