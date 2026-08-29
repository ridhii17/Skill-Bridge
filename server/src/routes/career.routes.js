import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import CareerRole from '../models/CareerRole.js';
import CandidateProfile from '../models/CandidateProfile.js';
import Skill from '../models/Skill.js';
import { authenticateUser } from '../middleware/auth.js';
import { calculateSkillGaps, getReadinessLevel, getReadinessLabel } from '../algorithms/skillGapCalculator.js';

const router = Router();

router.get('/careers', asyncHandler(async (req, res) => {
  const careers = await CareerRole.find({ isActive: true }).populate('requiredSkills.skill', 'name category');
  ApiResponse.success(res, careers, 'Career roles loaded');
}));

router.get('/careers/my-target', authenticateUser, asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOne({ user: req.user._id }).populate('targetCareer');
  if (!profile || !profile.targetCareer) {
    return ApiResponse.success(res, null, 'No target career set');
  }
  ApiResponse.success(res, profile.targetCareer);
}));

router.post('/careers/target', authenticateUser, asyncHandler(async (req, res) => {
  const { careerId } = req.body;
  if (!careerId) return res.status(400).json({ success: false, message: 'careerId is required' });

  const career = await CareerRole.findById(careerId);
  if (!career) return res.status(404).json({ success: false, message: 'Career not found' });

  let profile = await CandidateProfile.findOne({ user: req.user._id });
  if (!profile) {
    profile = await CandidateProfile.create({ user: req.user._id, targetCareer: careerId });
  } else {
    profile.targetCareer = careerId;
    await profile.save();
  }

  ApiResponse.success(res, career, 'Career goal updated');
}));

router.get('/careers/gap-analysis', authenticateUser, asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOne({ user: req.user._id });
  if (!profile || !profile.targetCareer) {
    return ApiResponse.success(res, null, 'No target career set — complete profile first');
  }

  // Don't populate skill — we need the raw ObjectId for the algorithm
  const career = await CareerRole.findById(profile.targetCareer);
  if (!career) return res.status(404).json({ success: false, message: 'Career not found' });

  const skillScores = (profile.declaredSkillLevels || []).map((ds) => ({
    skill: ds.skill.toString(),
    skillName: '',
    score: ds.level,
  }));

  const allSkills = await Skill.find();
  const nameMap = {};
  allSkills.forEach((s) => { nameMap[s._id.toString()] = s.name; });
  skillScores.forEach((s) => { s.skillName = nameMap[s.skill] || 'Unknown'; });

  const skillLookup = {};
  allSkills.forEach((s) => { skillLookup[s._id.toString()] = s.name; });

  const gapAnalysis = calculateSkillGaps(skillScores, career.requiredSkills, skillLookup);
  const readinessLevel = getReadinessLevel(gapAnalysis.matchPercentage);

  ApiResponse.success(res, {
    career: { id: career._id, title: career.title },
    gapAnalysis,
    readinessLevel,
    readinessLabel: getReadinessLabel(readinessLevel),
    matchPercentage: gapAnalysis.matchPercentage,
  });
}));

router.get('/careers/:id', asyncHandler(async (req, res) => {
  const career = await CareerRole.findById(req.params.id).populate('requiredSkills.skill', 'name category');
  if (!career) return res.status(404).json({ success: false, message: 'Career role not found' });
  ApiResponse.success(res, career);
}));

export default router;
