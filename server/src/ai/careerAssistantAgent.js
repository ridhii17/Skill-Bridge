import aiClient from './client.js';
import { CAREER_ASSISTANT } from './prompts.js';

/**
 * CareerAssistantAgent
 * Input: user question + candidate context data
 * Output: AI response with suggestions
 */
export async function askCareerAssistant(question, candidateContext) {
  // Build context string from candidate data
  const contextStr = buildContextString(candidateContext);

  const result = await aiClient.chatJSON(
    CAREER_ASSISTANT.system(contextStr),
    question,
    { temperature: 0.6 }
  );

  if (result.success && result.parsed) {
    return {
      ...result.parsed,
      isAIGenerated: true,
      source: 'AI Career Assistant',
    };
  }

  // Fallback: deterministic response based on keywords
  return fallbackResponse(question, candidateContext);
}

function buildContextString(data) {
  const parts = [];
  parts.push(`Name: ${data.name || 'Unknown'}`);
  parts.push(`Career Goal: ${data.careerGoal || 'Not set'}`);
  parts.push(`Overall Competency Score: ${data.overallScore || 0}%`);

  if (data.skills?.length > 0) {
    parts.push(`\nSkill Scores:`);
    data.skills.forEach((s) => parts.push(`  - ${s.name}: ${s.score}%`));
  }

  if (data.strengths?.length > 0) {
    parts.push(`\nStrengths: ${data.strengths.join(', ')}`);
  }

  if (data.weaknesses?.length > 0) {
    parts.push(`\nWeaknesses: ${data.weaknesses.join(', ')}`);
  }

  if (data.criticalGaps?.length > 0) {
    parts.push(`\nCritical Skill Gaps: ${data.criticalGaps.join(', ')}`);
  }

  if (data.jobMatchCount !== undefined) {
    parts.push(`\nJobs that match: ${data.jobMatchCount}`);
  }

  return parts.join('\n');
}

function fallbackResponse(question, data) {
  const q = question.toLowerCase();

  if (q.includes('strongest') || q.includes('strength')) {
    return {
      response: `Based on your assessment, your strongest skills are: ${data.strengths?.join(', ') || 'Not yet assessed'}. Keep building on these strengths while addressing your gaps.`,
      suggestions: ['View your skill analysis', 'Take another assessment'],
      relatedLinks: ['/skills', '/assessment'],
      isAIGenerated: false,
      source: 'Deterministic Response (AI unavailable)',
    };
  }

  if (q.includes('learn') || q.includes('next') || q.includes('should')) {
    return {
      response: data.criticalGaps?.length > 0
        ? `Your highest priority areas to improve are: ${data.criticalGaps.slice(0, 3).join(', ')}. These are critical gaps for your ${data.careerGoal || 'target career'}. Check your learning recommendations for specific resources.`
        : 'Complete your profile and take an assessment to get personalized learning recommendations.',
      suggestions: ['View learning recommendations', 'Generate a roadmap'],
      relatedLinks: ['/learning', '/roadmap'],
      isAIGenerated: false,
      source: 'Deterministic Response (AI unavailable)',
    };
  }

  if (q.includes('job') || q.includes('match')) {
    return {
      response: data.jobMatchCount > 0
        ? `You have ${data.jobMatchCount} jobs matching your profile. Your top matches are based on your skills in ${data.strengths?.slice(0, 3).join(', ') || 'your assessed skills'}.`
        : 'Complete your profile and assessment to see job recommendations.',
      suggestions: ['View job matches', 'Update your profile'],
      relatedLinks: ['/jobs', '/profile'],
      isAIGenerated: false,
      source: 'Deterministic Response (AI unavailable)',
    };
  }

  return {
    response: `I can help you with career guidance. Ask me about your strengths, what to learn next, job matches, or study plans. Your current overall score is ${data.overallScore || 0}% for ${data.careerGoal || 'your target career'}.`,
    suggestions: ['View your dashboard', 'Take an assessment'],
    relatedLinks: ['/dashboard', '/assessment'],
    isAIGenerated: false,
    source: 'Deterministic Response (AI unavailable)',
  };
}
