/**
 * CompetencyScorer — Deterministic scoring from assessment attempts
 * No AI/LLM — pure JavaScript weighted calculations
 */
export function calculateSkillScores(attempt, skillMap) {
  const skillStats = {};

  attempt.answers.forEach((answer) => {
    const skillId = answer.skill.toString();
    if (!skillStats[skillId]) {
      skillStats[skillId] = { correct: 0, total: 0 };
    }
    skillStats[skillId].total++;
    if (answer.isCorrect) skillStats[skillId].correct++;
  });

  return Object.entries(skillStats).map(([skillId, stats]) => {
    const skillName = skillMap[skillId] || 'Unknown';
    const score = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return {
      skill: skillId,
      skillName,
      score,
      total: stats.total,
      correct: stats.correct,
    };
  });
}

export function calculateOverallScore(skillScores) {
  if (skillScores.length === 0) return 0;
  const total = skillScores.reduce((sum, s) => sum + s.score, 0);
  return Math.round(total / skillScores.length);
}

export function identifyStrengthsAndWeaknesses(skillScores, threshold = 70) {
  const sorted = [...skillScores].sort((a, b) => b.score - a.score);
  const strengths = sorted.filter((s) => s.score >= threshold).map((s) => s.skillName);
  const weaknesses = sorted.filter((s) => s.score < threshold).reverse().map((s) => s.skillName);
  return { strengths, weaknesses };
}
