/**
 * CareerReadinessService — Deterministic multi-factor career readiness scoring
 * No AI/LLM — pure JavaScript calculations
 *
 * Weights:
 *   Technical Competency:     30%
 *   Assessment Performance:   20%
 *   Skill Alignment:          20%
 *   Experience:               10%
 *   Education:                10%
 *   Career Preference Fit:    10%
 */

const WEIGHTS = {
  technicalCompetency: 0.30,
  assessmentPerformance: 0.20,
  skillAlignment: 0.20,
  experience: 0.10,
  education: 0.10,
  careerPreferenceFit: 0.10,
};

const READINESS_LEVELS = [
  { max: 39, level: 'foundation', label: 'Foundation', description: 'You are at the beginning of your career journey. Focus on building fundamental skills.' },
  { max: 59, level: 'developing', label: 'Developing', description: 'You have made progress but need to develop more skills for your target role.' },
  { max: 74, level: 'career_building', label: 'Career Building', description: 'You are building solid foundations. A few key improvements will significantly boost your readiness.' },
  { max: 89, level: 'career_ready', label: 'Career Ready', description: 'You are well-prepared for your target career. Fine-tune your weaker areas to stand out.' },
  { max: 100, level: 'highly_ready', label: 'Highly Ready', description: 'Excellent readiness! You are well-positioned to pursue your target career.' },
];

/**
 * Calculate the full career readiness score for a candidate
 * @param {Object} profile - CandidateProfile document (populated)
 * @param {Object} career - CareerRole document (with requiredSkills populated)
 * @param {Array} assessmentAttempts - Array of AssessmentAttempt documents
 * @param {Object} options - { allSkills: Skill[] }
 * @returns {Object} Complete readiness analysis
 */
export function calculateCareerReadiness(profile, career, assessmentAttempts = [], options = {}) {
  const { allSkills = [] } = options;

  // Build skill lookup
  const skillLookup = {};
  allSkills.forEach((s) => { skillLookup[s._id.toString()] = s.name; });

  // Build skill scores from profile
  const skillScoreMap = {};
  (profile.declaredSkillLevels || []).forEach((ds) => {
    const skillId = (ds.skill?._id || ds.skill).toString();
    skillScoreMap[skillId] = ds.level;
  });

  // 1. Technical Competency (30%) — average of declared skill levels
  const technicalScore = calculateTechnicalCompetency(skillScoreMap);

  // 2. Assessment Performance (20%) — average of all assessment scores
  const assessmentScore = calculateAssessmentPerformance(assessmentAttempts);

  // 3. Skill Alignment (20%) — how well skills match career requirements
  const skillAlignmentScore = calculateSkillAlignment(skillScoreMap, career.requiredSkills);

  // 4. Experience (10%)
  const experienceScore = calculateExperienceScore(profile.experience);

  // 5. Education (10%)
  const educationScore = calculateEducationScore(profile.education);

  // 6. Career Preference Fit (10%)
  const preferenceFitScore = calculatePreferenceFit(profile);

  // Build breakdown
  const breakdown = [
    {
      category: 'Technical Competency',
      score: technicalScore,
      weight: WEIGHTS.technicalCompetency,
      weightedScore: Math.round(technicalScore * WEIGHTS.technicalCompetency),
      explanation: generateTechnicalExplanation(skillScoreMap, career.requiredSkills, skillLookup),
    },
    {
      category: 'Assessment Performance',
      score: assessmentScore,
      weight: WEIGHTS.assessmentPerformance,
      weightedScore: Math.round(assessmentScore * WEIGHTS.assessmentPerformance),
      explanation: generateAssessmentExplanation(assessmentAttempts),
    },
    {
      category: 'Skill Alignment',
      score: skillAlignmentScore,
      weight: WEIGHTS.skillAlignment,
      weightedScore: Math.round(skillAlignmentScore * WEIGHTS.skillAlignment),
      explanation: generateAlignmentExplanation(skillScoreMap, career.requiredSkills, skillLookup),
    },
    {
      category: 'Experience',
      score: experienceScore,
      weight: WEIGHTS.experience,
      weightedScore: Math.round(experienceScore * WEIGHTS.experience),
      explanation: generateExperienceExplanation(profile.experience, career),
    },
    {
      category: 'Education',
      score: educationScore,
      weight: WEIGHTS.education,
      weightedScore: Math.round(educationScore * WEIGHTS.education),
      explanation: generateEducationExplanation(profile.education),
    },
    {
      category: 'Career Fit',
      score: preferenceFitScore,
      weight: WEIGHTS.careerPreferenceFit,
      weightedScore: Math.round(preferenceFitScore * WEIGHTS.careerPreferenceFit),
      explanation: generatePreferenceExplanation(profile),
    },
  ];

  // Overall score
  const overallScore = Math.min(100, Math.max(0,
    breakdown.reduce((sum, b) => sum + b.weightedScore, 0)
  ));

  // Readiness level
  const readinessInfo = getReadinessLevel(overallScore);

  // Skill comparisons
  const skillComparisons = buildSkillComparisons(skillScoreMap, career.requiredSkills, skillLookup);

  // Top strengths (current score > required)
  const topStrengths = skillComparisons
    .filter((sc) => sc.status === 'ready')
    .sort((a, b) => b.currentScore - a.currentScore)
    .slice(0, 5)
    .map((sc) => sc.skillName);

  // Critical gaps
  const criticalGaps = skillComparisons
    .filter((sc) => sc.status === 'critical_gap')
    .sort((a, b) => b.gap - a.gap)
    .map((sc) => sc.skillName);

  // Highest impact skill (biggest gap × importance)
  const highestImpactSkill = findHighestImpactSkill(skillComparisons);

  return {
    overallScore,
    readinessLevel: readinessInfo.level,
    readinessLabel: readinessInfo.label,
    readinessDescription: readinessInfo.description,
    breakdown,
    targetCareer: career._id,
    targetCareerTitle: career.title,
    skillComparisons,
    topStrengths,
    criticalGaps,
    highestImpactSkill,
  };
}

// ─── Individual Score Calculators ──────────────────────

function calculateTechnicalCompetency(skillScoreMap) {
  const scores = Object.values(skillScoreMap);
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
}

function calculateAssessmentPerformance(attempts) {
  if (!attempts || attempts.length === 0) return 0;
  // Use best score across all attempts
  const bestScore = Math.max(...attempts.map((a) => a.score));
  // Also factor in consistency — bonus for multiple attempts
  const consistencyBonus = Math.min(10, attempts.length * 2);
  return Math.min(100, bestScore + (attempts.length > 1 ? consistencyBonus : 0));
}

function calculateSkillAlignment(skillScoreMap, requiredSkills) {
  if (!requiredSkills || requiredSkills.length === 0) return 0;

  let totalWeight = 0;
  let earnedWeight = 0;

  requiredSkills.forEach((req) => {
    const skillId = (req.skill?._id || req.skill).toString();
    const candidateScore = skillScoreMap[skillId] || 0;
    const requiredScore = req.minimumScore || 50;
    const weight = req.importanceWeight || 1;

    totalWeight += weight;

    if (candidateScore >= requiredScore) {
      earnedWeight += weight;
    } else {
      // Partial credit proportional to how close they are
      earnedWeight += (candidateScore / requiredScore) * weight;
    }
  });

  return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
}

function calculateExperienceScore(experience) {
  if (!experience || !experience.years) return 30; // base for no experience
  const years = experience.years;
  if (years >= 5) return 100;
  if (years >= 3) return 85;
  if (years >= 2) return 70;
  if (years >= 1) return 55;
  return 40;
}

function calculateEducationScore(education) {
  if (!education || !education.degree) return 30;
  const degree = education.degree.toLowerCase();
  if (degree.includes('ph.d') || degree.includes('phd')) return 100;
  if (degree.includes('m.tech') || degree.includes('mca') || degree.includes('m.sc') || degree.includes('master')) return 90;
  if (degree.includes('b.tech') || degree.includes('bca') || degree.includes('b.sc') || degree.includes('bachelor')) return 75;
  if (degree.includes('diploma')) return 50;
  return 40;
}

function calculatePreferenceFit(profile) {
  let score = 60; // base
  if (profile.preferredJobType && profile.preferredJobType !== '') score += 10;
  if (profile.preferredLocation && profile.preferredLocation !== '') score += 10;
  if (profile.targetCareer) score += 10;
  if (profile.availableHoursPerWeek && profile.availableHoursPerWeek >= 10) score += 10;
  return Math.min(100, score);
}

// ─── Explanation Generators ────────────────────────────

function generateTechnicalExplanation(skillScoreMap, requiredSkills, skillLookup) {
  const scores = Object.entries(skillScoreMap);
  if (scores.length === 0) {
    return 'No skills declared yet. Add skills to your profile to improve this score.';
  }

  const sorted = scores.sort((a, b) => b[1] - a[1]);
  const strong = sorted.filter(([, s]) => s >= 70).map(([id]) => skillLookup[id] || 'Unknown');
  const weak = sorted.filter(([, s]) => s < 50).map(([id]) => skillLookup[id] || 'Unknown');

  let explanation = `You have declared ${scores.length} skill${scores.length !== 1 ? 's' : ''}.`;
  if (strong.length > 0) {
    explanation += ` Strong in ${strong.slice(0, 3).join(', ')}.`;
  }
  if (weak.length > 0) {
    explanation += ` Need improvement in ${weak.slice(0, 3).join(', ')}.`;
  }
  return explanation;
}

function generateAssessmentExplanation(attempts) {
  if (!attempts || attempts.length === 0) {
    return 'No assessments completed yet. Take an assessment to demonstrate your competency.';
  }
  const best = Math.max(...attempts.map((a) => a.score));
  if (attempts.length === 1) {
    return `You scored ${best}% on your assessment. Retake to improve your score.`;
  }
  return `Completed ${attempts.length} assessments. Best score: ${best}%. Each attempt helps refine your skill profile.`;
}

function generateAlignmentExplanation(skillScoreMap, requiredSkills, skillLookup) {
  if (!requiredSkills || requiredSkills.length === 0) {
    return 'No career requirements defined.';
  }

  const aligned = [];
  const misaligned = [];

  requiredSkills.forEach((req) => {
    const skillId = (req.skill?._id || req.skill).toString();
    const name = skillLookup[skillId] || 'Unknown';
    const score = skillScoreMap[skillId] || 0;
    if (score >= req.minimumScore) {
      aligned.push(name);
    } else {
      misaligned.push(name);
    }
  });

  let explanation = `${aligned.length}/${requiredSkills.length} required skills meet the threshold.`;
  if (misaligned.length > 0) {
    explanation += ` Focus on: ${misaligned.slice(0, 3).join(', ')}.`;
  }
  return explanation;
}

function generateExperienceExplanation(experience, career) {
  const years = experience?.years || 0;
  if (years === 0) {
    return 'No professional experience declared. Entry-level roles are a good starting point.';
  }
  return `${years} year${years !== 1 ? 's' : ''} of experience declared. ${years >= 2 ? 'Good foundation for career transition.' : 'Building experience over time will improve this score.'}`;
}

function generateEducationExplanation(education) {
  if (!education?.degree) {
    return 'Education details not provided. Add your education to improve this score.';
  }
  return `${education.degree}${education.branch ? ' in ' + education.branch : ''}${education.institution ? ' from ' + education.institution : ''}.`;
}

function generatePreferenceExplanation(profile) {
  let parts = [];
  if (profile.preferredJobType) parts.push(`${profile.preferredJobType} preference`);
  if (profile.preferredLocation) parts.push(`${profile.preferredLocation} location`);
  if (profile.targetCareer) parts.push('career goal set');
  if (parts.length === 0) return 'Set your career preferences for better matching.';
  return `Preferences: ${parts.join(', ')}. Complete your profile for better career alignment.`;
}

// ─── Skill Comparisons ─────────────────────────────────

function buildSkillComparisons(skillScoreMap, requiredSkills, skillLookup) {
  if (!requiredSkills) return [];

  return requiredSkills.map((req) => {
    const skillId = (req.skill?._id || req.skill).toString();
    const skillName = skillLookup[skillId] || 'Unknown';
    const currentScore = skillScoreMap[skillId] || 0;
    const requiredScore = req.minimumScore || 50;
    const gap = requiredScore - currentScore;
    const importance = req.importanceWeight || 1;

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
      importance,
      status,
    };
  }).sort((a, b) => b.gap - a.gap);
}

function findHighestImpactSkill(skillComparisons) {
  // Find the skill where improving would have the greatest impact on overall readiness
  const candidates = skillComparisons
    .filter((sc) => sc.status !== 'ready')
    .map((sc) => ({
      ...sc,
      impact: sc.gap * sc.importance,
    }))
    .sort((a, b) => b.impact - a.impact);

  if (candidates.length === 0) return null;

  const top = candidates[0];
  return {
    skillName: top.skillName,
    currentScore: top.currentScore,
    requiredScore: top.requiredScore,
    gap: top.gap,
    importance: top.importance,
  };
}

// ─── Readiness Level ───────────────────────────────────

function getReadinessLevel(score) {
  for (const level of READINESS_LEVELS) {
    if (score <= level.max) {
      return { level: level.level, label: level.label, description: level.description };
    }
  }
  return READINESS_LEVELS[READINESS_LEVELS.length - 1];
}

export { WEIGHTS, READINESS_LEVELS, getReadinessLevel };
