/**
 * JobMatcher — Deterministic weighted job matching
 * No AI/LLM — pure JavaScript calculations
 *
 * Weights:
 *   Skills:           45%
 *   Competency:       15%
 *   Experience:       20%
 *   Education:        10%
 *   Preferences:      10%
 */

const WEIGHTS = {
  skills: 0.45,
  competency: 0.15,
  experience: 0.20,
  education: 0.10,
  preferences: 0.10,
};

/**
 * Calculate job match score for a candidate against a job
 */
export function calculateJobMatch(candidate, job, skillScores = []) {
  const skillScoreMap = {};
  skillScores.forEach((s) => {
    skillScoreMap[s.skill.toString()] = s.score;
  });

  // 1. Skills match (45%)
  const skillsResult = calculateSkillsMatch(job.requiredSkills, skillScoreMap);

  // 2. Competency match (15%)
  const competencyResult = calculateCompetencyMatch(skillScores);

  // 3. Experience match (20%)
  const experienceResult = calculateExperienceMatch(
    candidate.experience?.years || 0,
    job.experienceRequired || 0
  );

  // 4. Education match (10%)
  const educationResult = calculateEducationMatch(
    candidate.education?.degree || '',
    job.educationRequired || ''
  );

  // 5. Preferences match (10%)
  const preferencesResult = calculatePreferencesMatch(candidate, job);

  // Weighted total
  const matchScore = Math.round(
    skillsResult.score * WEIGHTS.skills +
    competencyResult.score * WEIGHTS.competency +
    experienceResult.score * WEIGHTS.experience +
    educationResult.score * WEIGHTS.education +
    preferencesResult.score * WEIGHTS.preferences
  );

  return {
    matchScore: Math.min(100, Math.max(0, matchScore)),
    breakdown: {
      skills: skillsResult,
      competency: competencyResult,
      experience: experienceResult,
      education: educationResult,
      preferences: preferencesResult,
    },
    matchingSkills: skillsResult.matching,
    missingSkills: skillsResult.missing,
  };
}

function calculateSkillsMatch(requiredSkills, skillScoreMap) {
  if (!requiredSkills || requiredSkills.length === 0) {
    return { score: 50, matching: [], missing: [], details: 'No skills required' };
  }

  const matching = [];
  const missing = [];

  let totalWeight = 0;
  let earnedWeight = 0;

  requiredSkills.forEach((req) => {
    // Handle both raw ObjectId and populated skill object
    const skillId = (req.skill?._id || req.skill).toString();
    const candidateScore = skillScoreMap[skillId] || 0;
    const minScore = req.minimumScore || 50;
    const weight = req.importanceWeight || 1.0;

    totalWeight += weight;

    if (candidateScore >= minScore) {
      earnedWeight += weight;
      matching.push({ skillId, score: candidateScore, required: minScore });
    } else {
      missing.push({ skillId, score: candidateScore, required: minScore, gap: minScore - candidateScore });
    }
  });

  const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 50;

  return { score, matching, missing, details: `${matching.length}/${requiredSkills.length} skills matched` };
}

function calculateCompetencyMatch(skillScores) {
  if (!skillScores || skillScores.length === 0) {
    return { score: 0, details: 'No assessments taken' };
  }
  const avgScore = skillScores.reduce((sum, s) => sum + s.score, 0) / skillScores.length;
  return { score: Math.round(avgScore), details: `Average competency: ${Math.round(avgScore)}%` };
}

function calculateExperienceMatch(candidateYears, requiredYears) {
  if (requiredYears === 0) return { score: 100, details: 'No experience required' };
  if (candidateYears >= requiredYears) return { score: 100, details: 'Experience requirement met' };
  if (candidateYears === 0) return { score: 20, details: 'No experience — entry level considered' };
  const ratio = candidateYears / requiredYears;
  return { score: Math.round(20 + ratio * 80), details: `${candidateYears}/${requiredYears} years` };
}

function calculateEducationMatch(candidateDegree, requiredEducation) {
  if (!requiredEducation || requiredEducation === 'Any') return { score: 100, details: 'No specific education required' };
  if (!candidateDegree) return { score: 40, details: 'Education not provided' };
  const req = requiredEducation.toLowerCase();
  const cand = candidateDegree.toLowerCase();
  if (req.includes('student') || req.includes('graduate')) return { score: 90, details: 'Student/graduate acceptable' };
  if (cand.includes('m.tech') || cand.includes('mca')) return { score: 100, details: 'Advanced degree' };
  if (req.includes('b.tech') && cand.includes('b.tech')) return { score: 100, details: 'B.Tech matched' };
  if (req.includes('bca') && cand.includes('bca')) return { score: 100, details: 'BCA matched' };
  return { score: 70, details: 'Partial education match' };
}

function calculatePreferencesMatch(candidate, job) {
  let score = 70; // base
  if (candidate.preferredJobType && candidate.preferredJobType === job.jobType) score += 30;
  else if (candidate.preferredJobType && candidate.preferredJobType !== '') score -= 10;
  return { score: Math.min(100, Math.max(0, score)), details: 'Preference alignment' };
}

/**
 * Rank jobs for a candidate
 */
export function rankJobs(candidate, jobs, skillScores = []) {
  const matches = jobs.map((job) => ({
    job,
    match: calculateJobMatch(candidate, job, skillScores),
  }));

  matches.sort((a, b) => b.match.matchScore - a.match.matchScore);
  return matches;
}
