import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import CandidateProfile from '../models/CandidateProfile.js';
import Skill from '../models/Skill.js';
import SkillVerification from '../models/SkillVerification.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import Shortlist from '../models/Shortlist.js';
import { authenticateUser } from '../middleware/auth.js';
import { calculateJobMatch } from '../algorithms/jobMatcher.js';

const router = Router();

// Middleware: recruiter-only
const requireRecruiter = (req, res, next) => {
  if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
    return next(ApiError.forbidden('Recruiter access required'));
  }
  next();
};

// ═══════════════════════════════════════════════════════════
// POST /api/recruiter/jobs — Create a job posting
// ═══════════════════════════════════════════════════════════
router.post('/recruiter/jobs', authenticateUser, requireRecruiter, asyncHandler(async (req, res) => {
  const { title, description, location, jobType, salary, experienceRequired, educationRequired, requiredSkills, careerRole } = req.body;

  if (!title || !description || !location || !jobType) {
    return res.status(400).json({ success: false, message: 'Title, description, location, and job type are required' });
  }

  const job = await Job.create({
    title,
    company: req.user.name,
    description,
    location,
    jobType,
    salary: salary || {},
    experienceRequired: experienceRequired || 0,
    educationRequired: educationRequired || '',
    requiredSkills: requiredSkills || [],
    careerRole: careerRole || undefined,
    postedBy: req.user._id,
    isDemo: false,
    isActive: true,
  });

  ApiResponse.created(res, job, 'Job posted successfully');
}));

// ═══════════════════════════════════════════════════════════
// GET /api/recruiter/jobs — List recruiter's jobs
// ═══════════════════════════════════════════════════════════
router.get('/recruiter/jobs', authenticateUser, requireRecruiter, asyncHandler(async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user._id })
    .populate('requiredSkills.skill', 'name category')
    .sort('-createdAt');

  // Get match count for each job
  const jobsWithStats = await Promise.all(jobs.map(async (job) => {
    const shortlistCount = await Shortlist.countDocuments({ job: job._id });
    return {
      ...job.toJSON(),
      shortlistCount,
    };
  }));

  ApiResponse.success(res, jobsWithStats);
}));

// ═══════════════════════════════════════════════════════════
// GET /api/recruiter/jobs/:id — Get job details
// ═══════════════════════════════════════════════════════════
router.get('/recruiter/jobs/:id', authenticateUser, requireRecruiter, asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id })
    .populate('requiredSkills.skill', 'name category')
    .populate('careerRole', 'title');

  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  ApiResponse.success(res, job);
}));

// ═══════════════════════════════════════════════════════════
// PUT /api/recruiter/jobs/:id — Update job
// ═══════════════════════════════════════════════════════════
router.put('/recruiter/jobs/:id', authenticateUser, requireRecruiter, asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

  const allowed = ['title', 'description', 'location', 'jobType', 'salary', 'experienceRequired', 'educationRequired', 'requiredSkills', 'careerRole', 'isActive'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) job[field] = req.body[field];
  });

  await job.save();
  ApiResponse.success(res, job, 'Job updated');
}));

// ═══════════════════════════════════════════════════════════
// DELETE /api/recruiter/jobs/:id — Deactivate job
// ═══════════════════════════════════════════════════════════
router.delete('/recruiter/jobs/:id', authenticateUser, requireRecruiter, asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

  job.isActive = false;
  await job.save();
  ApiResponse.success(res, null, 'Job deactivated');
}));

// ═══════════════════════════════════════════════════════════
// GET /api/recruiter/jobs/:id/matches — Get matching candidates
// ═══════════════════════════════════════════════════════════
router.get('/recruiter/jobs/:id/matches', authenticateUser, requireRecruiter, asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id })
    .populate('requiredSkills.skill', 'name category');

  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

  // Get all candidate profiles
  const profiles = await CandidateProfile.find({})
    .populate('user', 'name email')
    .populate('declaredSkillLevels.skill', 'name category');

  const allSkills = await Skill.find();
  const skillLookup = {};
  allSkills.forEach((s) => { skillLookup[s._id.toString()] = s.name; });

  // Get verified skills for all candidates
  const candidateIds = profiles.map((p) => p.user?._id).filter(Boolean);
  const verifications = await SkillVerification.find({ candidate: { $in: candidateIds }, isActive: true });
  const verificationMap = {};
  verifications.forEach((v) => {
    const cid = v.candidate.toString();
    if (!verificationMap[cid]) verificationMap[cid] = [];
    verificationMap[cid].push({ skill: v.skillName, level: v.level, badge: v.badge });
  });

  // Get latest assessment for each candidate
  const assessments = await AssessmentAttempt.find({ candidate: { $in: candidateIds } })
    .sort('-completedAt');
  const assessmentMap = {};
  assessments.forEach((a) => {
    const cid = a.candidate.toString();
    if (!assessmentMap[cid]) assessmentMap[cid] = a;
  });

  // Calculate matches
  const matches = [];
  for (const profile of profiles) {
    const candidateId = profile.user?._id?.toString();
    if (!candidateId) continue;

    // Build skill scores — prefer verified > assessment > declared
    const verifiedSkills = verificationMap[candidateId] || [];
    const assessment = assessmentMap[candidateId];

    const skillScoreMap = {};

    // Start with declared levels
    (profile.declaredSkillLevels || []).forEach((ds) => {
      const skillId = (ds.skill?._id || ds.skill).toString();
      skillScoreMap[skillId] = ds.level;
    });

    // Override with assessment scores (higher confidence)
    if (assessment) {
      (assessment.skillScores || []).forEach((ss) => {
        const skillId = ss.skill?.toString();
        if (skillId && ss.score > 0) {
          skillScoreMap[skillId] = Math.max(skillScoreMap[skillId] || 0, ss.score);
        }
      });
    }

    // Build skillScores array for matcher
    const skillScores = Object.entries(skillScoreMap).map(([skillId, score]) => ({
      skill: skillId,
      score,
    }));

    // Calculate match using deterministic engine
    const matchResult = calculateJobMatch(profile, job, skillScores);

    // Enrich matching/missing skills with names
    const matchingWithNames = matchResult.matchingSkills.map((ms) => ({
      ...ms,
      name: skillLookup[ms.skillId] || 'Unknown',
    }));
    const missingWithNames = matchResult.missingSkills.map((ms) => ({
      ...ms,
      name: skillLookup[ms.skillId] || 'Unknown',
    }));

    // Get verified skills for this candidate
    const candidateVerifications = verifiedSkills;

    // Check if shortlisted
    const isShortlisted = await Shortlist.findOne({
      recruiter: req.user._id,
      job: job._id,
      candidate: candidateId,
    });

    matches.push({
      candidate: {
        _id: candidateId,
        name: profile.user?.name || 'Unknown',
        email: profile.user?.email || '',
      },
      profile: {
        experience: profile.experience?.years || 0,
        education: profile.education?.degree || '',
        preferredLocation: profile.preferredLocation || '',
        preferredJobType: profile.preferredJobType || '',
        overallScore: profile.overallScore || 0,
      },
      match: {
        matchScore: matchResult.matchScore,
        breakdown: {
          skills: { score: matchResult.breakdown.skills.score, details: matchResult.breakdown.skills.details },
          competency: { score: matchResult.breakdown.competency.score, details: matchResult.breakdown.competency.details },
          experience: { score: matchResult.breakdown.experience.score, details: matchResult.breakdown.experience.details },
          education: { score: matchResult.breakdown.education.score, details: matchResult.breakdown.education.details },
          preferences: { score: matchResult.breakdown.preferences.score, details: matchResult.breakdown.preferences.details },
        },
      },
      matchingSkills: matchingWithNames,
      missingSkills: missingWithNames,
      verifiedSkills: candidateVerifications,
      latestAssessment: assessment ? {
        score: assessment.score,
        completedAt: assessment.completedAt,
      } : null,
      isShortlisted: !!isShortlisted,
      shortlistId: isShortlisted?._id || null,
    });
  }

  // Sort by match score descending
  matches.sort((a, b) => b.match.matchScore - a.match.matchScore);

  ApiResponse.success(res, {
    job: {
      _id: job._id,
      title: job.title,
      company: job.company,
      requiredSkills: job.requiredSkills,
    },
    totalCandidates: matches.length,
    matches,
  });
}));

// ═══════════════════════════════════════════════════════════
// GET /api/recruiter/candidates — Search candidates
// ═══════════════════════════════════════════════════════════
router.get('/recruiter/candidates', authenticateUser, requireRecruiter, asyncHandler(async (req, res) => {
  const { skill, verified, minScore } = req.query;

  let profiles = await CandidateProfile.find({})
    .populate('user', 'name email')
    .populate('declaredSkillLevels.skill', 'name category');

  // Get verified skills
  const candidateIds = profiles.map((p) => p.user?._id).filter(Boolean);
  const verifications = await SkillVerification.find({ candidate: { $in: candidateIds }, isActive: true });
  const verificationMap = {};
  verifications.forEach((v) => {
    const cid = v.candidate.toString();
    if (!verificationMap[cid]) verificationMap[cid] = [];
    verificationMap[cid].push({ skill: v.skillName, level: v.level, badge: v.badge });
  });

  // Filter by verified skill if requested
  if (skill) {
    profiles = profiles.filter((p) => {
      const vSkills = verificationMap[p.user?._id?.toString()] || [];
      return vSkills.some((vs) => vs.skill.toLowerCase().includes(skill.toLowerCase()));
    });
  }

  // Filter by minimum score
  if (minScore) {
    profiles = profiles.filter((p) => (p.overallScore || 0) >= parseInt(minScore, 10));
  }

  const candidates = profiles.map((p) => {
    const cid = p.user?._id?.toString();
    return {
      _id: cid,
      name: p.user?.name || 'Unknown',
      email: p.user?.email || '',
      experience: p.experience?.years || 0,
      education: p.education?.degree || '',
      overallScore: p.overallScore || 0,
      skills: (p.declaredSkillLevels || []).map((ds) => ({
        name: ds.skill?.name || 'Unknown',
        level: ds.level,
      })),
      verifiedSkills: verificationMap[cid] || [],
      verifiedSkillCount: (verificationMap[cid] || []).length,
    };
  });

  ApiResponse.success(res, { total: candidates.length, candidates });
}));

// ═══════════════════════════════════════════════════════════
// GET /api/recruiter/candidates/:id — View candidate (limited)
// ═══════════════════════════════════════════════════════════
router.get('/recruiter/candidates/:id', authenticateUser, requireRecruiter, asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOne({ user: req.params.id })
    .populate('user', 'name email')
    .populate('declaredSkillLevels.skill', 'name category')
    .populate('targetCareer', 'title');

  if (!profile) return res.status(404).json({ success: false, message: 'Candidate not found' });

  const verifications = await SkillVerification.find({ candidate: req.params.id, isActive: true });
  const assessments = await AssessmentAttempt.find({ candidate: req.params.id })
    .sort('-completedAt')
    .limit(5);

  ApiResponse.success(res, {
    candidate: {
      _id: profile.user?._id,
      name: profile.user?.name,
      email: profile.user?.email,
    },
    experience: profile.experience,
    education: profile.education,
    skills: (profile.declaredSkillLevels || []).map((ds) => ({
      name: ds.skill?.name || 'Unknown',
      level: ds.level,
    })),
    verifiedSkills: verifications.map((v) => ({
      skill: v.skillName,
      level: v.level,
      badge: v.badge,
      verificationId: v.verificationId,
    })),
    targetCareer: profile.targetCareer?.title || 'Not set',
    overallScore: profile.overallScore || 0,
    recentAssessments: assessments.map((a) => ({
      score: a.score,
      completedAt: a.completedAt,
    })),
    projects: profile.projects || [],
    // Expose only employment-relevant data
    preferredLocation: profile.preferredLocation || '',
    preferredJobType: profile.preferredJobType || '',
  });
}));

// ═══════════════════════════════════════════════════════════
// POST /api/recruiter/shortlist — Shortlist a candidate
// ═══════════════════════════════════════════════════════════
router.post('/recruiter/shortlist', authenticateUser, requireRecruiter, asyncHandler(async (req, res) => {
  const { jobId, candidateId, matchScore, notes } = req.body;

  if (!jobId || !candidateId) {
    return res.status(400).json({ success: false, message: 'Job ID and Candidate ID are required' });
  }

  // Verify job belongs to recruiter
  const job = await Job.findOne({ _id: jobId, postedBy: req.user._id });
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

  // Check if already shortlisted
  const existing = await Shortlist.findOne({
    recruiter: req.user._id,
    job: jobId,
    candidate: candidateId,
  });

  if (existing) {
    return res.status(409).json({ success: false, message: 'Candidate already shortlisted for this job' });
  }

  const shortlist = await Shortlist.create({
    recruiter: req.user._id,
    job: jobId,
    candidate: candidateId,
    matchScore: matchScore || 0,
    notes: notes || '',
  });

  ApiResponse.created(res, shortlist, 'Candidate shortlisted');
}));

// ═══════════════════════════════════════════════════════════
// GET /api/recruiter/shortlists — View shortlists
// ═══════════════════════════════════════════════════════════
router.get('/recruiter/shortlists', authenticateUser, requireRecruiter, asyncHandler(async (req, res) => {
  const { jobId } = req.query;
  const filter = { recruiter: req.user._id };
  if (jobId) filter.job = jobId;

  const shortlists = await Shortlist.find(filter)
    .populate('job', 'title company location')
    .populate('candidate', 'name email')
    .sort('-createdAt');

  ApiResponse.success(res, shortlists);
}));

// ═══════════════════════════════════════════════════════════
// PUT /api/recruiter/shortlists/:id — Update shortlist status
// ═══════════════════════════════════════════════════════════
router.put('/recruiter/shortlists/:id', authenticateUser, requireRecruiter, asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const shortlist = await Shortlist.findOne({ _id: req.params.id, recruiter: req.user._id });
  if (!shortlist) return res.status(404).json({ success: false, message: 'Shortlist not found' });

  if (status) shortlist.status = status;
  if (notes !== undefined) shortlist.notes = notes;
  await shortlist.save();

  ApiResponse.success(res, shortlist, 'Shortlist updated');
}));

// ═══════════════════════════════════════════════════════════
// DELETE /api/recruiter/shortlists/:id — Remove from shortlist
// ═══════════════════════════════════════════════════════════
router.delete('/recruiter/shortlists/:id', authenticateUser, requireRecruiter, asyncHandler(async (req, res) => {
  const shortlist = await Shortlist.findOneAndDelete({ _id: req.params.id, recruiter: req.user._id });
  if (!shortlist) return res.status(404).json({ success: false, message: 'Shortlist not found' });
  ApiResponse.success(res, null, 'Removed from shortlist');
}));

// ═══════════════════════════════════════════════════════════
// GET /api/recruiter/stats — Recruiter dashboard stats
// ═══════════════════════════════════════════════════════════
router.get('/recruiter/stats', authenticateUser, requireRecruiter, asyncHandler(async (req, res) => {
  const activeJobs = await Job.countDocuments({ postedBy: req.user._id, isActive: true });
  const totalJobs = await Job.countDocuments({ postedBy: req.user._id });
  const totalShortlisted = await Shortlist.countDocuments({ recruiter: req.user._id });
  const contactedCount = await Shortlist.countDocuments({ recruiter: req.user._id, status: 'contacted' });
  const interviewingCount = await Shortlist.countDocuments({ recruiter: req.user._id, status: 'interviewing' });
  const totalCandidates = await CandidateProfile.countDocuments();
  const verifiedCandidates = await CandidateProfile.countDocuments({ overallScore: { $gte: 60 } });

  ApiResponse.success(res, {
    activeJobs,
    totalJobs,
    totalShortlisted,
    contactedCount,
    interviewingCount,
    totalCandidates,
    verifiedCandidates,
  });
}));

export default router;
