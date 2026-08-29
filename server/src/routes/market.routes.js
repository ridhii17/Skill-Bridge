import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Job from '../models/Job.js';
import Skill from '../models/Skill.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.get('/market/insights', authenticateUser, asyncHandler(async (req, res) => {
  const jobs = await Job.find({ isActive: true })
    .populate('requiredSkills.skill', 'name category')
    .populate('careerRole', 'title');

  // Most demanded skills
  const skillCount = {};
  jobs.forEach((job) => {
    (job.requiredSkills || []).forEach((rs) => {
      const name = rs.skill?.name || 'Unknown';
      if (!skillCount[name]) skillCount[name] = { name, count: 0, categories: new Set() };
      skillCount[name].count++;
      if (rs.skill?.category) skillCount[name].categories.add(rs.skill.category);
    });
  });
  const topSkills = Object.values(skillCount)
    .map((s) => ({ ...s, categories: [...s.categories] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // Job count by role
  const roleCount = {};
  jobs.forEach((job) => {
    const title = job.careerRole?.title || 'Other';
    roleCount[title] = (roleCount[title] || 0) + 1;
  });
  const jobsByRole = Object.entries(roleCount)
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count);

  // Locations
  const locationCount = {};
  jobs.forEach((job) => {
    const loc = job.location || 'Unknown';
    locationCount[loc] = (locationCount[loc] || 0) + 1;
  });
  const locations = Object.entries(locationCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Salary ranges
  const salaries = jobs
    .filter((j) => j.salary?.min && j.salary?.max)
    .map((j) => ({
      title: j.title,
      company: j.company,
      min: j.salary.min,
      max: j.salary.max,
      role: j.careerRole?.title || 'Other',
    }));

  const salaryByRole = {};
  salaries.forEach((s) => {
    if (!salaryByRole[s.role]) salaryByRole[s.role] = { min: s.min, max: s.max, count: 0, totalMin: 0, totalMax: 0 };
    salaryByRole[s.role].totalMin += s.min;
    salaryByRole[s.role].totalMax += s.max;
    salaryByRole[s.role].count++;
  });
  const salaryRanges = Object.entries(salaryByRole).map(([role, data]) => ({
    role,
    avgMin: Math.round(data.totalMin / data.count),
    avgMax: Math.round(data.totalMax / data.count),
    jobCount: data.count,
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

  ApiResponse.success(res, {
    totalJobs: jobs.length,
    isDemo: true,
    topSkills,
    jobsByRole,
    locations,
    salaryRanges,
    experienceDistribution: Object.entries(expDist).map(([range, count]) => ({ range, count })),
  });
}));

export default router;
