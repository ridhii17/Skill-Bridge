import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import LearningPath from '../models/LearningPath.js';
import CandidateProfile from '../models/CandidateProfile.js';
import CareerRole from '../models/CareerRole.js';
import Skill from '../models/Skill.js';
import MiniAssessment from '../models/MiniAssessment.js';
import MiniAssessmentAttempt from '../models/MiniAssessmentAttempt.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import { authenticateUser } from '../middleware/auth.js';
import { calculateSkillScores, calculateOverallScore } from '../algorithms/competencyScorer.js';
import { createReadinessSnapshot } from './careerReadiness.routes.js';
import {
  determineLearningStatus,
  calculateImprovement,
  getNextBestAction,
  calculateSkillProgress,
  adaptRoadmap,
  getMiniAssessmentRecommendation,
} from '../algorithms/adaptiveLearningService.js';

const router = Router();

// ═══════════════════════════════════════════════════════════
// GET /api/adaptive/next-action
// Returns the next best action for the candidate
// ═══════════════════════════════════════════════════════════
router.get('/adaptive/next-action', authenticateUser, asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOne({ user: req.user._id })
    .populate('targetCareer')
    .populate('declaredSkillLevels.skill', 'name category');

  const path = await LearningPath.findOne({ candidate: req.user._id, status: 'active' });

  const action = getNextBestAction(path, profile);

  // Add skill progress context if applicable
  if (action.skill && path) {
    const item = path.items.find(i => i.skill?.toString() === action.skill?.toString());
    if (item) {
      action.currentScore = item.currentSkillScore || 0;
      action.targetScore = item.targetScore || 75;
      action.gap = Math.max(0, action.targetScore - action.currentScore);
    }
  }

  ApiResponse.success(res, action);
}));

// ═══════════════════════════════════════════════════════════
// GET /api/adaptive/skill-progress
// Returns skill progress for all skills in the learning path
// ═══════════════════════════════════════════════════════════
router.get('/adaptive/skill-progress', authenticateUser, asyncHandler(async (req, res) => {
  const path = await LearningPath.findOne({ candidate: req.user._id, status: 'active' })
    .populate('careerRole', 'title requiredSkills');

  if (!path) {
    return ApiResponse.success(res, { skills: [], overallProgress: 0 });
  }

  // Get career required skills for target scores
  const career = await CareerRole.findById(path.careerRole._id || path.careerRole);
  const requiredMap = {};
  if (career) {
    career.requiredSkills.forEach(rs => {
      requiredMap[rs.skill.toString()] = rs;
    });
  }

  const skills = path.items
    .filter(i => i.skill && i.skillName !== 'Portfolio Project')
    .map(item => calculateSkillProgress(item, requiredMap[item.skill?.toString()]));

  const totalItems = skills.length;
  const masteredCount = skills.filter(s => s.status === 'mastered').length;
  const overallProgress = totalItems > 0 ? Math.round((masteredCount / totalItems) * 100) : 0;

  ApiResponse.success(res, { skills, overallProgress, totalItems, masteredCount });
}));

// ═══════════════════════════════════════════════════════════
// GET /api/adaptive/mini-assessment/:skillId
// Get or generate a mini assessment for a skill
// ═══════════════════════════════════════════════════════════
router.get('/adaptive/mini-assessment/:skillId', authenticateUser, asyncHandler(async (req, res) => {
  const { skillId } = req.params;

  const skill = await Skill.findById(skillId);
  if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });

  // Find existing mini assessment for this skill
  let miniAssessment = await MiniAssessment.findOne({ skill: skillId, isActive: true })
    .select('-questions.correctAnswer -questions.explanation');

  if (!miniAssessment) {
    // Create one from the main assessment questions for this skill
    const { default: Assessment } = await import('../models/Assessment.js');
    const assessments = await Assessment.find({ isActive: true });
    const questions = [];

    for (const a of assessments) {
      for (const q of a.questions) {
        if (q.skill.toString() === skillId && questions.length < 10) {
          questions.push({
            questionText: q.questionText,
            options: q.options,
            difficulty: q.difficulty,
          });
        }
      }
    }

    if (questions.length === 0) {
      return res.status(404).json({ success: false, message: 'No questions available for this skill' });
    }

    // Take up to 7 questions
    const selected = questions.slice(0, 7);

    miniAssessment = await MiniAssessment.create({
      skill: skillId,
      skillName: skill.name,
      title: `${skill.name} — Check Your Understanding`,
      description: `Mini assessment to verify your ${skill.name} knowledge`,
      questions: selected,
      difficulty: 'intermediate',
    });
  }

  // Get previous attempt for this skill
  const lastAttempt = await MiniAssessmentAttempt.findOne({
    candidate: req.user._id,
    skill: skillId,
  }).sort('-completedAt');

  // Get learning path item for context
  const path = await LearningPath.findOne({ candidate: req.user._id, status: 'active' });
  let pathItem = null;
  if (path) {
    pathItem = path.items.find(i => i.skill?.toString() === skillId);
  }

  const recommendation = getMiniAssessmentRecommendation(
    skill.name,
    pathItem?.currentSkillScore || 0,
    pathItem?.targetScore || 75,
    lastAttempt?.score ?? null,
  );

  ApiResponse.success(res, {
    miniAssessment: {
      _id: miniAssessment._id,
      title: miniAssessment.title,
      description: miniAssessment.description,
      skillName: skill.name,
      questions: miniAssessment.questions.map(q => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        difficulty: q.difficulty,
      })),
    },
    previousAttempt: lastAttempt ? {
      score: lastAttempt.score,
      status: lastAttempt.status,
      completedAt: lastAttempt.completedAt,
      attemptNumber: lastAttempt.attemptNumber,
    } : null,
    recommendation,
    pathItem: pathItem ? {
      currentScore: pathItem.currentSkillScore || 0,
      targetScore: pathItem.targetScore || 75,
      status: pathItem.status,
      reinforcedCount: pathItem.reinforcedCount || 0,
    } : null,
  });
}));

// ═══════════════════════════════════════════════════════════
// POST /api/adaptive/mini-assessment/:skillId/submit
// Submit mini assessment and trigger adaptive response
// ═══════════════════════════════════════════════════════════
router.post('/adaptive/mini-assessment/:skillId/submit', authenticateUser, asyncHandler(async (req, res) => {
  const { skillId } = req.params;
  const { answers, miniAssessmentId } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ success: false, message: 'Answers array required' });
  }

  const skill = await Skill.findById(skillId);
  if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });

  const miniAssessment = await MiniAssessment.findById(miniAssessmentId || '');
  if (!miniAssessment) {
    return res.status(404).json({ success: false, message: 'Mini assessment not found' });
  }

  // Score the answers
  let correctCount = 0;
  const processedAnswers = answers.map((ans, i) => {
    const question = miniAssessment.questions[i];
    if (!question) return null;
    const isCorrect = question.correctAnswer === ans.selectedOption;
    if (isCorrect) correctCount++;
    return { questionIndex: i, selectedOption: ans.selectedOption, isCorrect };
  }).filter(Boolean);

  const totalQuestions = miniAssessment.questions.length;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Get previous attempt
  const lastAttempt = await MiniAssessmentAttempt.findOne({
    candidate: req.user._id,
    skill: skillId,
  }).sort('-completedAt');

  const previousScore = lastAttempt?.score ?? null;
  const improvement = calculateImprovement(score, previousScore);
  const status = determineLearningStatus(score);

  // Create attempt record
  const attemptCount = await MiniAssessmentAttempt.countDocuments({
    candidate: req.user._id,
    skill: skillId,
  });

  const attempt = await MiniAssessmentAttempt.create({
    candidate: req.user._id,
    miniAssessment: miniAssessment._id,
    skill: skillId,
    skillName: skill.name,
    answers: processedAnswers,
    score,
    totalQuestions,
    correctAnswers: correctCount,
    previousScore,
    improvement,
    status,
    attemptNumber: attemptCount + 1,
    completedAt: new Date(),
  });

  // Update learning path
  const path = await LearningPath.findOne({ candidate: req.user._id, status: 'active' });
  let adaptation = { changed: false, message: '' };

  if (path) {
    const pathItem = path.items.find(i => i.skill?.toString() === skillId);
    if (pathItem) {
      // Store previous score for before/after comparison
      const previousSkillScore = pathItem.currentSkillScore || 0;

      // Update current score based on mini assessment
      pathItem.currentSkillScore = score;
      pathItem.miniAssessmentScore = score;

      // Run adaptive logic
      adaptation = adaptRoadmap(path, pathItem, status, score);

      await path.save();
    }
  }

  // Update candidate profile skill level
  const profile = await CandidateProfile.findOne({ user: req.user._id });
  if (profile) {
    const existing = profile.declaredSkillLevels.find(
      d => d.skill.toString() === skillId
    );
    if (existing) {
      existing.level = Math.max(existing.level, score);
    } else {
      profile.declaredSkillLevels.push({ skill: skillId, level: score });
    }
    profile.overallScore = calculateOverallScore(
      profile.declaredSkillLevels.map(d => ({ score: d.level }))
    );
    await profile.save();
  }

  // Create readiness snapshot
  await createReadinessSnapshot(req.user._id, 'assessment');

  ApiResponse.created(res, {
    attemptId: attempt._id,
    score,
    totalQuestions,
    correctAnswers: correctCount,
    previousScore,
    improvement,
    status,
    statusLabel: status === 'mastered' ? 'Mastered' : status === 'developing' ? 'Developing' : 'Needs Reinforcement',
    adaptation: {
      changed: adaptation.changed,
      message: adaptation.message,
      insertedItems: adaptation.insertedItems?.length || 0,
    },
    thresholds: {
      mastered: 80,
      developing: 60,
    },
  }, 'Mini assessment submitted');
}));

// ═══════════════════════════════════════════════════════════
// GET /api/adaptive/dashboard
// Learning journey dashboard data
// ═══════════════════════════════════════════════════════════
router.get('/adaptive/dashboard', authenticateUser, asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOne({ user: req.user._id })
    .populate('targetCareer', 'title')
    .populate('declaredSkillLevels.skill', 'name category');

  const path = await LearningPath.findOne({ candidate: req.user._id, status: 'active' })
    .populate('items.skill', 'name category')
    .populate('items.resource', 'title type duration');

  // Get recent mini assessment attempts
  const recentAttempts = await MiniAssessmentAttempt.find({ candidate: req.user._id })
    .sort('-completedAt')
    .limit(10);

  // Get next best action
  const action = getNextBestAction(path, profile);

  // Get skill progress
  let skillProgress = [];
  if (path) {
    const career = await CareerRole.findById(path.careerRole?._id || path.careerRole);
    const requiredMap = {};
    if (career) {
      career.requiredSkills.forEach(rs => {
        requiredMap[rs.skill?.toString()] = rs;
      });
    }
    skillProgress = path.items
      .filter(i => i.skill && i.skillName !== 'Portfolio Project')
      .map(item => calculateSkillProgress(item, requiredMap[item.skill?.toString()]));
  }

  // Stats
  const totalSkills = skillProgress.length;
  const masteredSkills = skillProgress.filter(s => s.status === 'mastered').length;
  const developingSkills = skillProgress.filter(s => s.status === 'developing' || s.status === 'in_progress').length;
  const needsReinforcement = skillProgress.filter(s => s.status === 'needs_reinforcement').length;

  // Readiness before/after
  const readinessSnapshots = [];
  try {
    const { default: CareerReadinessSnapshot } = await import('../models/CareerReadinessSnapshot.js');
    const snapshots = await CareerReadinessSnapshot.find({ candidate: req.user._id })
      .sort('createdAt')
      .limit(10)
      .select('overallScore readinessLevel triggeredBy createdAt');
    readinessSnapshots.push(...snapshots.map(s => ({
      score: s.overallScore,
      level: s.readinessLevel,
      triggeredBy: s.triggeredBy,
      date: s.createdAt,
    })));
  } catch {
    // Model might not exist yet
  }

  const latestReadiness = readinessSnapshots.length > 0
    ? readinessSnapshots[readinessSnapshots.length - 1]
    : null;

  ApiResponse.success(res, {
    nextAction: action,
    skillProgress,
    recentAttempts: recentAttempts.map(a => ({
      _id: a._id,
      skillName: a.skillName,
      score: a.score,
      status: a.status,
      improvement: a.improvement,
      attemptNumber: a.attemptNumber,
      completedAt: a.completedAt,
    })),
    stats: {
      totalSkills,
      masteredSkills,
      developingSkills,
      needsReinforcement,
      totalAttempts: recentAttempts.length,
    },
    readinessHistory: readinessSnapshots,
    latestReadiness,
    learningPath: path ? {
      _id: path._id,
      progress: path.progress,
      totalWeeks: path.totalWeeks,
      totalItems: path.items.length,
      completedItems: path.items.filter(i => i.status === 'completed' || i.status === 'mastered').length,
    } : null,
  });
}));

// ═══════════════════════════════════════════════════════════
// GET /api/adaptive/mini-assessment-history/:skillId
// Get mini assessment history for a specific skill
// ═══════════════════════════════════════════════════════════
router.get('/adaptive/mini-assessment-history/:skillId', authenticateUser, asyncHandler(async (req, res) => {
  const attempts = await MiniAssessmentAttempt.find({
    candidate: req.user._id,
    skill: req.params.skillId,
  }).sort('-completedAt').limit(20);

  ApiResponse.success(res, attempts);
}));

export default router;
