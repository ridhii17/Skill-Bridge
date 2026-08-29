import aiClient from './client.js';
import { LEARNING_EXPLANATION } from './prompts.js';

/**
 * LearningRecommendationAgent
 * Input: resource data + skill gap data
 * Output: explanation of why this resource helps
 */
export async function explainLearningResource(resource, skillGap) {
  const userMessage = `Learning Resource: ${resource.title}
Type: ${resource.type}
Level: ${resource.level}
Duration: ${resource.duration}
Provider: ${resource.provider}

Skill Gap Context:
Skill: ${skillGap.skillName}
Current Level: ${skillGap.currentScore}%
Required Level: ${skillGap.requiredScore}%
Gap: ${skillGap.gap}%
Priority: ${skillGap.priority}`;

  const result = await aiClient.chatJSON(
    LEARNING_EXPLANATION.system,
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

  // Fallback
  return {
    reason: `This ${resource.level} ${resource.type} will help you improve your ${skillGap.skillName} skills, closing a ${skillGap.gap}% gap toward the required ${skillGap.requiredScore}%.`,
    whatYouWillLearn: [
      `Core ${skillGap.skillName} concepts at ${resource.level} level`,
      `Practical skills to improve your competency score`,
    ],
    expectedOutcome: `After completing this ${resource.duration} resource, you should see measurable improvement in ${skillGap.skillName}.`,
    isAIGenerated: false,
    source: 'Deterministic Recommendation (AI unavailable)',
  };
}
