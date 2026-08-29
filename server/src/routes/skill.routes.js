import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Skill from '../models/Skill.js';

const router = Router();

router.get('/skills', asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;
  const skills = await Skill.find(filter).sort('name');
  ApiResponse.success(res, skills, 'Skills loaded');
}));

router.get('/skills/categories', asyncHandler(async (req, res) => {
  const categories = await Skill.distinct('category', { isActive: true });
  ApiResponse.success(res, categories);
}));

router.get('/skills/:id', asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);
  if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
  ApiResponse.success(res, skill);
}));

export default router;
