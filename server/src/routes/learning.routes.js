import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import LearningResource from '../models/LearningResource.js';
import LearningPath from '../models/LearningPath.js';
import CandidateProfile from '../models/CandidateProfile.js';
import CareerRole from '../models/CareerRole.js';
import Skill from '../models/Skill.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

// List learning resources
router.get('/learning/resources', asyncHandler(async (req, res) => {
  const { skillId, level, type } = req.query;
  const filter = { isActive: true };
  if (skillId) filter.skill = skillId;
  if (level) filter.level = level;
  if (type) filter.type = type;

  const resources = await LearningResource.find(filter)
    .populate('skill', 'name category')
    .sort('title');
  ApiResponse.success(res, resources);
}));

// Get personalized learning recommendations based on gaps
router.get('/learning/recommendations', authenticateUser, asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOne({ user: req.user._id });
  if (!profile || !profile.targetCareer) {
    return ApiResponse.success(res, [], 'Set a career goal first to get recommendations');
  }

  const career = await CareerRole.findById(profile.targetCareer).populate('requiredSkills.skill');
  if (!career) return ApiResponse.success(res, []);

  // Find weak skills
  const skillScoreMap = {};
  (profile.declaredSkillLevels || []).forEach((ds) => {
    skillScoreMap[ds.skill.toString()] = ds.level;
  });

  const weakSkills = [];
  career.requiredSkills.forEach((req) => {
    const skillId = req.skill.toString();
    const current = skillScoreMap[skillId] || 0;
    const gap = req.minimumScore - current;
    if (gap > 0) {
      weakSkills.push({ skill: req.skill, gap, importance: req.importanceWeight, priority: gap * req.importanceWeight });
    }
  });

  weakSkills.sort((a, b) => b.priority - a.priority);

  // Find resources for weak skills
  const recommendations = [];
  for (const ws of weakSkills.slice(0, 5)) {
    const resources = await LearningResource.find({
      skill: ws.skill,
      isActive: true,
    })
      .populate('skill', 'name category')
      .limit(2);
    recommendations.push({
      skill: ws.skill,
      gap: ws.gap,
      priority: ws.priority,
      resources,
    });
  }

  ApiResponse.success(res, recommendations);
}));

// Generate personalized learning path
router.post('/learning/path/generate', authenticateUser, asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOne({ user: req.user._id });
  if (!profile || !profile.targetCareer) {
    return res.status(400).json({ success: false, message: 'Set a career goal first' });
  }

  const career = await CareerRole.findById(profile.targetCareer).populate('requiredSkills.skill');
  if (!career) return res.status(404).json({ success: false, message: 'Career not found' });

  const skillScoreMap = {};
  (profile.declaredSkillLevels || []).forEach((ds) => {
    skillScoreMap[ds.skill.toString()] = ds.level;
  });

  // Find gaps
  const gaps = [];
  career.requiredSkills.forEach((req) => {
    const skillId = req.skill.toString();
    const current = skillScoreMap[skillId] || 0;
    if (current < req.minimumScore) {
      gaps.push({ skill: req.skill, gap: req.minimumScore - current, importance: req.importanceWeight, priority: (req.minimumScore - current) * req.importanceWeight });
    }
  });
  gaps.sort((a, b) => b.priority - a.priority);

  // Build learning path items
  const items = [];
  let weekNum = 1;
  const availableHours = profile.availableHoursPerWeek || 10;

  for (const gap of gaps) {
    const resources = await LearningResource.find({ skill: gap.skill, isActive: true }).limit(2);
    const skillDoc = await Skill.findById(gap.skill);

    items.push({
      skill: gap.skill,
      skillName: skillDoc?.name || 'Unknown',
      resource: resources[0]?._id || null,
      resourceTitle: resources[0]?.title || `${skillDoc?.name || 'Skill'} Fundamentals`,
      weekNumber: weekNum,
      learningGoal: `Improve ${skillDoc?.name || 'this skill'} — close gap of ${gap.gap}%`,
      estimatedHours: Math.min(availableHours, 8),
      status: 'not_started',
      priority: gap.priority,
    });
    weekNum++;
  }

  // Add final project week
  items.push({
    skill: gaps[0]?.skill || career.requiredSkills[0]?.skill,
    skillName: 'Portfolio Project',
    resource: null,
    resourceTitle: 'Build a Capstone Project',
    weekNumber: weekNum,
    learningGoal: 'Apply all learned skills in a real-world project',
    estimatedHours: availableHours,
    status: 'not_started',
    priority: 0,
  });

  // Delete existing path for this career
  await LearningPath.deleteMany({ candidate: req.user._id, careerRole: profile.targetCareer });

  const path = await LearningPath.create({
    candidate: req.user._id,
    careerRole: profile.targetCareer,
    items,
    totalWeeks: weekNum,
    progress: 0,
    status: 'active',
  });

  ApiResponse.created(res, path, 'Learning path generated');
}));

// Get my learning path
router.get('/learning/path', authenticateUser, asyncHandler(async (req, res) => {
  const path = await LearningPath.findOne({ candidate: req.user._id, status: 'active' })
    .populate('careerRole', 'title')
    .populate('items.skill', 'name category')
    .populate('items.resource', 'title type duration provider');

  ApiResponse.success(res, path);
}));

// Update learning path item status
router.put('/learning/path/item/:itemId', authenticateUser, asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['not_started', 'in_progress', 'completed', 'needs_reinforcement', 'mastered'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const path = await LearningPath.findOne({ candidate: req.user._id, status: 'active' });
  if (!path) return res.status(404).json({ success: false, message: 'No active learning path' });

  const item = path.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

  item.status = status;

  // Recalculate progress
  const total = path.items.length;
  const completed = path.items.filter((i) => i.status === 'completed').length;
  path.progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  await path.save();

  ApiResponse.success(res, path, 'Progress updated');
}));

export default router;
