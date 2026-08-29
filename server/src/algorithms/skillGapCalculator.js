/**
 * SkillGapCalculator — Deterministic gap analysis
 * No AI/LLM — pure JavaScript calculations
 */

/**
 * Calculate skill gaps for a candidate against a target career
 * @param {Array} candidateSkillScores - [{skillId, skillName, score}]
 * @param {Array} careerRequiredSkills - [{skill: ObjectId, minimumScore, importanceWeight}]
 * @param {Object} skillLookup - {skillId: skillName}
 * @returns {Object} gap analysis result
 */
export function calculateSkillGaps(candidateSkillScores, careerRequiredSkills, skillLookup = {}) {
  const scoreMap = {};
  candidateSkillScores.forEach((s) => {
    scoreMap[s.skill.toString()] = s.score;
  });

  const gaps = careerRequiredSkills.map((req) => {
    const skillId = req.skill.toString();
    const skillName = skillLookup[skillId] || 'Unknown';
    const currentScore = scoreMap[skillId] || 0;
    const requiredScore = req.minimumScore;
    const gap = requiredScore - currentScore;
    const priority = gap * req.importanceWeight;

    let status;
    if (gap <= 0) status = 'ready';
    else if (gap <= 10) status = 'developing';
    else if (gap <= 25) status = 'needs_improvement';
    else status = 'critical_gap';

    return {
      skillId,
      skillName,
      currentScore,
      requiredScore,
      gap,
      importanceWeight: req.importanceWeight,
      priority: Math.round(priority * 100) / 100,
      status,
    };
  });

  // Sort by priority (highest gaps first)
  gaps.sort((a, b) => b.priority - a.priority);

  const overallGap = gaps.reduce((sum, g) => sum + Math.max(0, g.gap), 0);
  const matchPercentage = gaps.length > 0
    ? Math.round(
        gaps.reduce((sum, g) => {
          const match = g.currentScore >= g.requiredScore ? 1 : g.currentScore / g.requiredScore;
          return sum + match * g.importanceWeight;
        }, 0) /
        gaps.reduce((sum, g) => sum + g.importanceWeight, 0) *
        100
      )
    : 0;

  const readySkills = gaps.filter((g) => g.status === 'ready').map((g) => g.skillName);
  const criticalGaps = gaps.filter((g) => g.status === 'critical_gap').map((g) => g.skillName);

  return {
    gaps,
    overallGap,
    matchPercentage,
    readySkills,
    criticalGaps,
    totalRequired: gaps.length,
    skillsReady: readySkills.length,
    skillsGap: gaps.length - readySkills.length,
  };
}

/**
 * Get a readiness level label
 */
export function getReadinessLevel(matchPercentage) {
  if (matchPercentage >= 85) return 'ready';
  if (matchPercentage >= 65) return 'approaching';
  if (matchPercentage >= 40) return 'developing';
  return 'not_ready';
}

export function getReadinessLabel(level) {
  const labels = {
    ready: 'Ready',
    approaching: 'Approaching Ready',
    developing: 'Developing',
    not_ready: 'Not Ready',
  };
  return labels[level] || 'Unknown';
}

export function getReadinessColor(level) {
  const colors = {
    ready: 'emerald',
    approaching: 'amber',
    developing: 'orange',
    not_ready: 'red',
  };
  return colors[level] || 'gray';
}
