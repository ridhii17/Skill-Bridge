import aiClient from './client.js';
import { SKILL_GAP_EXPLANATION } from './prompts.js';

/**
 * SkillGapAgent
 * Input: candidate data + job match data (deterministic scores)
 * Output: AI explanation of the match
 */
export async function explainJobMatch(candidateData, jobData, matchData) {
  const userMessage = `Candidate: ${candidateData.name}
Career Goal: ${candidateData.careerGoal || 'Not set'}
Overall Score: ${candidateData.overallScore || 0}%

Candidate Skills: ${(candidateData.skills || []).map((s) => `${s.name} (${s.score}%)`).join(', ') || 'None assessed'}

Job: ${jobData.title} at ${jobData.company}
Required Skills: ${(jobData.requiredSkills || []).map((s) => `${s.name} (min ${s.minimumScore}%)`).join(', ')}

Deterministic Match Score: ${matchData.matchScore}%
Matching Skills: ${(matchData.matchingSkills || []).map((s) => s.skillId).join(', ') || 'None'}
Missing Skills: ${(matchData.missingSkills || []).map((s) => `${s.skillId} (gap: ${s.gap}%)`).join(', ') || 'None'}`;

  const result = await aiClient.chatJSON(
    SKILL_GAP_EXPLANATION.system,
    userMessage,
    { temperature: 0.5 }
  );

  if (result.success && result.parsed) {
    return {
      ...result.parsed,
      isAIGenerated: true,
      source: 'AI Insight',
    };
  }

  // Fallback — resolve skill IDs to names using jobData and candidateData
  const skillNameLookup = {};
  (jobData.requiredSkills || []).forEach((s) => { skillNameLookup[s._id || s.name] = s.name; });
  (candidateData.skills || []).forEach((s) => { skillNameLookup[s._id || s.name] = s.name; });
  // Also try matching by the IDs in matchData
  const strongPoints = (matchData.matchingSkills || []).map((s) => {
    const name = s.name || skillNameLookup[s.skillId] || s.skillId;
    return `Strong match: ${name} (${s.score}%)`;
  });
  const improvementAreas = (matchData.missingSkills || []).map((s) => {
    const name = s.name || skillNameLookup[s.skillId] || s.skillId;
    return `Gap in ${name}: needs ${s.gap}% improvement (required ${s.required}%, current ${s.score}%)`;
  });

  return {
    explanation: `This ${jobData.title} role has a ${matchData.matchScore}% match with your profile. ${matchData.matchScore >= 70 ? 'You are a strong candidate.' : matchData.matchScore >= 40 ? 'You meet some requirements but have gaps to address.' : 'Significant skill development is needed for this role.'}`,
    strongPoints: strongPoints.length > 0 ? strongPoints : ['Interest in the role'],
    improvementAreas: improvementAreas.length > 0 ? improvementAreas : ['Complete your assessment to see specific gaps'],
    actionableAdvice: matchData.missingSkills?.length > 0
      ? `Focus on improving: ${matchData.missingSkills.slice(0, 3).map((s) => skillNameLookup[s.skillId] || s.skillId).join(', ')}`
      : 'Take an assessment to get detailed skill analysis.',
    isAIGenerated: false,
    source: 'Deterministic Analysis (AI unavailable)',
  };
}
