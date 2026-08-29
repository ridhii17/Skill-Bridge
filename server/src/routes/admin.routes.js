import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import User from '../models/User.js';
import Skill from '../models/Skill.js';
import CareerRole from '../models/CareerRole.js';
import Job from '../models/Job.js';
import Assessment from '../models/Assessment.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import CandidateProfile from '../models/CandidateProfile.js';
import LearningResource from '../models/LearningResource.js';
import { authenticateUser } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = Router();

// All admin routes require admin role
router.use(authenticateUser, authorizeRoles('admin'));

// Dashboard stats
router.get('/admin/stats', asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalCandidates,
    totalSkills,
    totalCareers,
    totalJobs,
    totalAssessments,
    totalAttempts,
    totalResources,
    activeJobs,
    recentAttempts,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'candidate' }),
    Skill.countDocuments({ isActive: true }),
    CareerRole.countDocuments({ isActive: true }),
    Job.countDocuments(),
    Assessment.countDocuments({ isActive: true }),
    AssessmentAttempt.countDocuments({ status: 'completed' }),
    LearningResource.countDocuments({ isActive: true }),
    Job.countDocuments({ isActive: true }),
    AssessmentAttempt.countDocuments({ status: 'completed' }),
  ]);

  const avgScore = totalAttempts > 0
    ? Math.round((await AssessmentAttempt.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, avg: { $avg: '$score' } } },
      ]))?.[0]?.avg || 0)
    : 0;

  ApiResponse.success(res, {
    users: { total: totalUsers, candidates: totalCandidates },
    skills: totalSkills,
    careers: totalCareers,
    jobs: { total: totalJobs, active: activeJobs },
    assessments: totalAssessments,
    attempts: totalAttempts,
    averageScore: avgScore,
    resources: totalResources,
  });
}));

// User management
router.get('/admin/users', asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  const users = await User.find(filter)
    .select('-password -refreshTokens')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  const total = await User.countDocuments(filter);
  ApiResponse.paginated(res, users, { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) });
}));

router.put('/admin/users/:id/role', asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['candidate', 'mentor', 'recruiter', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password -refreshTokens');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  ApiResponse.success(res, user, 'Role updated');
}));

router.put('/admin/users/:id/status', asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password -refreshTokens');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  ApiResponse.success(res, user, 'Status updated');
}));

// Skill management
router.get('/admin/skills', asyncHandler(async (req, res) => {
  const skills = await Skill.find().sort('name');
  ApiResponse.success(res, skills);
}));

router.post('/admin/skills', asyncHandler(async (req, res) => {
  const skill = await Skill.create(req.body);
  ApiResponse.created(res, skill);
}));

router.put('/admin/skills/:id', asyncHandler(async (req, res) => {
  const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
  ApiResponse.success(res, skill, 'Skill updated');
}));

// Job management
router.get('/admin/jobs', asyncHandler(async (req, res) => {
  const jobs = await Job.find().populate('careerRole', 'title').sort('-createdAt');
  ApiResponse.success(res, jobs);
}));

router.post('/admin/jobs', asyncHandler(async (req, res) => {
  const job = await Job.create(req.body);
  ApiResponse.created(res, job);
}));

router.put('/admin/jobs/:id', asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  ApiResponse.success(res, job, 'Job updated');
}));

router.delete('/admin/jobs/:id', asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  ApiResponse.success(res, null, 'Job deleted');
}));

// Assessment management
router.get('/admin/assessments', asyncHandler(async (req, res) => {
  const assessments = await Assessment.find().select('-questions').populate('careerRole', 'title');
  ApiResponse.success(res, assessments);
}));

export default router;
