import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Assessment from '../models/Assessment.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import CandidateProfile from '../models/CandidateProfile.js';
import Skill from '../models/Skill.js';
import { authenticateUser } from '../middleware/auth.js';
import { calculateSkillScores, calculateOverallScore, identifyStrengthsAndWeaknesses } from '../algorithms/competencyScorer.js';
import { checkAndCreateVerifications } from './verification.routes.js';
import { createReadinessSnapshot } from './careerReadiness.routes.js';

const router = Router();

// Static routes BEFORE :id
router.get('/assessments', asyncHandler(async (req, res) => {
  const { careerRoleId } = req.query;
  const filter = { isActive: true };
  if (careerRoleId) filter.careerRole = careerRoleId;
  const assessments = await Assessment.find(filter)
    .select('-questions')
    .populate('careerRole', 'title');
  ApiResponse.success(res, assessments);
}));

router.get('/assessments/history/my', authenticateUser, asyncHandler(async (req, res) => {
  const attempts = await AssessmentAttempt.find({ candidate: req.user._id })
    .populate('assessment', 'title careerRole')
    .sort('-completedAt')
    .limit(20);
  ApiResponse.success(res, attempts);
}));

// Dynamic routes
router.get('/assessments/:id', asyncHandler(async (req, res) => {
  const assessment = await Assessment.findById(req.params.id)
    .populate('careerRole', 'title')
    .populate('questions.skill', 'name category');
  if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
  ApiResponse.success(res, assessment);
}));

router.post('/assessments/:id/submit', authenticateUser, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { answers, startedAt } = req.body;

  const assessment = await Assessment.findById(id);
  if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ success: false, message: 'Answers array is required' });
  }

  const questionMap = {};
  assessment.questions.forEach((q) => {
    questionMap[q._id.toString()] = q;
  });

  const processedAnswers = [];
  let correctCount = 0;

  for (const ans of answers) {
    const question = questionMap[ans.questionId];
    if (!question) continue;

    const isCorrect = question.correctAnswer === ans.selectedOption;
    if (isCorrect) correctCount++;

    processedAnswers.push({
      questionId: question._id,
      selectedOption: ans.selectedOption,
      isCorrect,
      skill: question.skill,
    });
  }

  const totalQuestions = assessment.questions.length;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const allSkills = await Skill.find();
  const skillNameMap = {};
  allSkills.forEach((s) => { skillNameMap[s._id.toString()] = s.name; });

  const skillScores = calculateSkillScores({ answers: processedAnswers }, skillNameMap);
  const { strengths, weaknesses } = identifyStrengthsAndWeaknesses(skillScores);

  const attemptCount = await AssessmentAttempt.countDocuments({
    candidate: req.user._id,
    assessment: id,
  });

  const attempt = await AssessmentAttempt.create({
    candidate: req.user._id,
    assessment: id,
    answers: processedAnswers,
    score,
    totalQuestions,
    correctAnswers: correctCount,
    skillScores,
    strengths,
    weaknesses,
    startedAt: startedAt ? new Date(startedAt) : new Date(),
    completedAt: new Date(),
    attemptNumber: attemptCount + 1,
    status: 'completed',
  });

  // Update candidate profile with skill scores
  let profile = await CandidateProfile.findOne({ user: req.user._id });
  if (profile) {
    for (const ss of skillScores) {
      const existing = profile.declaredSkillLevels.find(
        (d) => d.skill.toString() === ss.skill
      );
      if (existing) {
        existing.level = Math.max(existing.level, ss.score);
      } else {
        profile.declaredSkillLevels.push({ skill: ss.skill, level: ss.score });
      }
    }
    profile.overallScore = calculateOverallScore(
      profile.declaredSkillLevels.map((d) => ({ score: d.level }))
    );
    await profile.save();
  }

  // Check for skill verifications
  const newVerifications = await checkAndCreateVerifications(req.user._id, attempt._id);

  // Create readiness snapshot
  await createReadinessSnapshot(req.user._id, 'assessment', attempt._id);

  ApiResponse.created(res, {
    attemptId: attempt._id,
    score,
    totalQuestions,
    correctAnswers: correctCount,
    skillScores,
    strengths,
    weaknesses,
    attemptNumber: attempt.attemptNumber,
    newVerifications: newVerifications.length > 0 ? newVerifications.map((v) => ({
      skill: v.skillName,
      level: v.level,
      badge: v.badge,
      verificationId: v.verificationId,
    })) : [],
  }, 'Assessment submitted successfully');
}));

router.get('/assessments/:id/result/:attemptId', authenticateUser, asyncHandler(async (req, res) => {
  const attempt = await AssessmentAttempt.findOne({
    _id: req.params.attemptId,
    candidate: req.user._id,
  }).populate('assessment', 'title description');

  if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });
  ApiResponse.success(res, attempt);
}));

export default router;
