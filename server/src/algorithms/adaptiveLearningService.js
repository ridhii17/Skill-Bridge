/**
 * AdaptiveLearningService — Deterministic closed-loop adaptive learning logic
 * No AI/LLM — pure JavaScript calculations
 *
 * Flow:
 *   Learn → Practice → Mini Assessment → Analyze → Adapt → Learn Again
 *
 * Thresholds:
 *   >= 80% → Mastered (move to next skill)
 *   60-79% → Developing (additional practice)
 *   < 60%  → Needs Reinforcement (easier resource + re-assess)
 */

const THRESHOLDS = {
  mastered: 80,
  developing: 60,
};

/**
 * Determine learning status after a mini assessment score
 * @param {number} score - Mini assessment score (0-100)
 * @returns {string} 'mastered' | 'developing' | 'needs_reinforcement'
 */
export function determineLearningStatus(score) {
  if (score >= THRESHOLDS.mastered) return 'mastered';
  if (score >= THRESHOLDS.developing) return 'developing';
  return 'needs_reinforcement';
}

/**
 * Calculate improvement between two assessment scores
 * @param {number} currentScore
 * @param {number|null} previousScore
 * @returns {number} improvement percentage points
 */
export function calculateImprovement(currentScore, previousScore) {
  if (previousScore === null || previousScore === undefined) return currentScore;
  return currentScore - previousScore;
}

/**
 * Get the next best action for a candidate based on their learning path
 * @param {Object} path - LearningPath document
 * @param {Object} profile - CandidateProfile document
 * @returns {Object} next action recommendation
 */
export function getNextBestAction(path, profile) {
  if (!path || !path.items || path.items.length === 0) {
    return {
      action: 'generate_path',
      title: 'Generate Your Learning Path',
      reason: 'You don\'t have a learning path yet. Generate one based on your career goals and skill gaps.',
      skill: null,
      type: 'path_generation',
    };
  }

  const items = path.items;

  // Find the highest-priority item that needs attention
  // Priority order: needs_reinforcement > in_progress > not_started (sorted by priority desc)
  const reinforcementItems = items.filter(i => i.status === 'needs_reinforcement');
  const inProgressItems = items.filter(i => i.status === 'in_progress');
  const notStartedItems = items.filter(i => i.status === 'not_started')
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  // 1. Reinforcement has highest priority
  if (reinforcementItems.length > 0) {
    const item = reinforcementItems[0];
    return {
      action: 'reinforce',
      title: `Reinforce ${item.skillName}`,
      reason: `Your last mini-assessment score was ${item.miniAssessmentScore || 'low'}% for ${item.skillName}. This skill needs additional practice before moving on.`,
      skill: item.skill,
      skillName: item.skillName,
      itemId: item._id,
      type: 'mini_assessment',
      currentScore: item.currentSkillScore || 0,
      targetScore: item.targetScore || 75,
      reinforcedCount: item.reinforcedCount || 0,
    };
  }

  // 2. In-progress items
  if (inProgressItems.length > 0) {
    const item = inProgressItems[0];
    return {
      action: 'continue',
      title: `Continue: ${item.resourceTitle || item.skillName}`,
      reason: `You're currently learning ${item.skillName}. Complete this module and take the mini-assessment.`,
      skill: item.skill,
      skillName: item.skillName,
      itemId: item._id,
      type: 'learning',
      currentScore: item.currentSkillScore || 0,
      targetScore: item.targetScore || 75,
    };
  }

  // 3. Not-started items (highest priority first)
  if (notStartedItems.length > 0) {
    const item = notStartedItems[0];
    return {
      action: 'start',
      title: `Start: ${item.resourceTitle || item.skillName}`,
      reason: `Begin learning ${item.skillName} to close your skill gap. This is your highest-priority remaining skill.`,
      skill: item.skill,
      skillName: item.skillName,
      itemId: item._id,
      type: 'learning',
      currentScore: item.currentSkillScore || 0,
      targetScore: item.targetScore || 75,
    };
  }

  // 4. All items completed/mastered
  return {
    action: 'completed',
    title: 'Learning Path Complete!',
    reason: 'You\'ve completed all learning items. Take a full assessment to verify your improved competency.',
    skill: null,
    type: 'assessment',
  };
}

/**
 * Calculate skill progress for a specific skill
 * @param {Object} pathItem - LearningPath item
 * @param {Object} careerRequiredSkill - Career role required skill entry
 * @returns {Object} skill progress data
 */
export function calculateSkillProgress(pathItem, careerRequiredSkill) {
  const initial = pathItem.initialSkillScore || 0;
  const current = pathItem.currentSkillScore || 0;
  const target = careerRequiredSkill?.minimumScore || pathItem.targetScore || 75;
  const gap = Math.max(0, target - current);
  const progress = target > 0 ? Math.round((current / target) * 100) : 0;

  return {
    skillId: pathItem.skill,
    skillName: pathItem.skillName,
    initial,
    current,
    target,
    gap,
    progress: Math.min(100, progress),
    status: pathItem.status,
    miniAssessmentScore: pathItem.miniAssessmentScore,
    reinforcedCount: pathItem.reinforcedCount || 0,
    improvement: current - initial,
  };
}

/**
 * Adapt the roadmap after a mini assessment
 * Inserts reinforcement items when a skill needs reinforcement
 * @param {Object} path - LearningPath document (mutable)
 * @param {Object} item - The learning item that was assessed
 * @param {string} status - 'mastered' | 'developing' | 'needs_reinforcement'
 * @param {number} score - Mini assessment score
 * @returns {Object} adaptation result
 */
export function adaptRoadmap(path, item, status, score) {
  const result = { changed: false, message: '', insertedItems: [] };

  if (status === 'mastered') {
    item.status = 'mastered';
    item.miniAssessmentScore = score;
    result.message = `Great! ${item.skillName} mastered. Moving to next skill.`;
    result.changed = true;
  } else if (status === 'needs_reinforcement') {
    item.status = 'needs_reinforcement';
    item.miniAssessmentScore = score;
    item.reinforcedCount = (item.reinforcedCount || 0) + 1;

    // Insert reinforcement items after current item
    const currentIndex = path.items.findIndex(i => i._id.toString() === item._id.toString());
    if (currentIndex >= 0 && item.reinforcedCount <= 3) {
      const reinforcementItem = {
        skill: item.skill,
        skillName: `${item.skillName} — Reinforcement`,
        resource: null,
        resourceTitle: `Practice: ${item.skillName} Fundamentals`,
        weekNumber: item.weekNumber,
        learningGoal: `Reinforce ${item.skillName} concepts (attempt ${item.reinforcedCount})`,
        estimatedHours: Math.max(2, (item.estimatedHours || 5) - 1),
        status: 'not_started',
        priority: (item.priority || 0) + 1,
        initialSkillScore: item.currentSkillScore || 0,
        currentSkillScore: item.currentSkillScore || 0,
        targetScore: item.targetScore,
        reinforcedCount: 0,
      };

      // Insert right after current item
      path.items.splice(currentIndex + 1, 0, reinforcementItem);
      result.insertedItems.push(reinforcementItem);
      result.changed = true;
    }

    result.message = `${item.skillName} needs reinforcement. Additional practice added to your roadmap.`;
  } else {
    // developing
    item.status = 'in_progress';
    item.miniAssessmentScore = score;
    result.message = `${item.skillName} is developing (${score}%). Continue practicing to reach mastery.`;
    result.changed = true;
  }

  // Recalculate total weeks
  if (result.changed) {
    const maxWeek = Math.max(...path.items.map(i => i.weekNumber || 1));
    path.totalWeeks = maxWeek;

    // Recalculate progress
    const total = path.items.length;
    const completed = path.items.filter(i => i.status === 'completed' || i.status === 'mastered').length;
    path.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  return result;
}

/**
 * Generate deterministic mini assessment recommendations
 * Based on the skill gap and current performance
 */
export function getMiniAssessmentRecommendation(skillName, currentScore, targetScore, previousMiniScore) {
  const gap = targetScore - currentScore;

  if (previousMiniScore !== null && previousMiniScore < 60) {
    return {
      recommendation: 'reinforce_first',
      message: `Before re-assessing ${skillName}, review the fundamentals. Your previous score was ${previousMiniScore}%.`,
      suggestedDifficulty: 'beginner',
    };
  }

  if (currentScore >= targetScore) {
    return {
      recommendation: 'optional',
      message: `You've met the target for ${skillName}. A mini-assessment can verify your mastery.`,
      suggestedDifficulty: 'advanced',
    };
  }

  return {
    recommendation: 'recommended',
    message: `Take a mini-assessment for ${skillName} to check your understanding and unlock the next step.`,
    suggestedDifficulty: currentScore < 50 ? 'beginner' : currentScore < 70 ? 'intermediate' : 'advanced',
  };
}

export { THRESHOLDS };
