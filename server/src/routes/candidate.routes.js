import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import CandidateProfile from '../models/CandidateProfile.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.get('/candidates/profile', authenticateUser, asyncHandler(async (req, res) => {
  let profile = await CandidateProfile.findOne({ user: req.user._id })
    .populate('skills', 'name category')
    .populate('targetCareer', 'title description icon averageSalary')
    .populate('declaredSkillLevels.skill', 'name category');

  if (!profile) {
    profile = await CandidateProfile.create({ user: req.user._id });
    profile = await CandidateProfile.findById(profile._id)
      .populate('skills', 'name category')
      .populate('targetCareer', 'title description icon averageSalary')
      .populate('declaredSkillLevels.skill', 'name category');
  }

  ApiResponse.success(res, { user: req.user, profile });
}));

router.put('/candidates/profile', authenticateUser, asyncHandler(async (req, res) => {  const allowed = [
    'headline', 'bio', 'education', 'experience', 'projects',
    'skills', 'declaredSkillLevels', 'careerGoal', 'preferredLocation', 'preferredJobType', 'expectedSalary', 'learningPreference', 'availableHoursPerWeek',
    'accessibilitySettings', 'learningSupportPreference',
  ];

  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  let profile = await CandidateProfile.findOne({ user: req.user._id });
  if (!profile) {
    profile = new CandidateProfile({ user: req.user._id, ...updates });
  } else {
    Object.assign(profile, updates);
  }
  await profile.save();

  profile = await CandidateProfile.findById(profile._id)
    .populate('skills', 'name category')
    .populate('targetCareer', 'title description icon averageSalary')
    .populate('declaredSkillLevels.skill', 'name category');

  ApiResponse.success(res, { user: req.user, profile }, 'Profile updated');
}));

export default router;
