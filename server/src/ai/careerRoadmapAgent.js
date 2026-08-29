import aiClient from './client.js';
import { CAREER_ROADMAP } from './prompts.js';
import Skill from '../models/Skill.js';
import LearningResource from '../models/LearningResource.js';
import LearningPath from '../models/LearningPath.js';

/**
 * CareerRoadmapAgent
 * Input: target career, skill gaps, candidate preferences
 * Output: structured roadmap stored in MongoDB
 */
export async function generateAIRoadmap(candidateId, career, skillGaps, preferences) {
  const userMessage = `Target Career: ${career.title}
Available Hours per Week: ${preferences.availableHours || 10}
Learning Preference: ${preferences.learningPreference || 'mixed'}

Skill Gaps (sorted by priority):
${skillGaps.map((g) => `- ${g.skillName}: current ${g.currentScore}%, required ${g.requiredScore}%, gap ${g.gap}%, priority ${g.priority}`).join('\n')}

Available Resources:
${(preferences.resources || []).map((r) => `- "${r.title}" (${r.type}, ${r.level}, ${r.duration}) for ${r.skillName}`).join('\n')}`;

  const result = await aiClient.chatJSON(
    CAREER_ROADMAP.system,
    userMessage,
    { temperature: 0.6 }
  );

  if (result.success && result.parsed && result.parsed.weeks) {
    // Validate and store the AI roadmap
    const items = await buildPathItems(result.parsed.weeks, preferences.resources || [], skillGaps, preferences.availableHours || 10);
    return { weeks: result.parsed.weeks, items, summary: result.parsed.summary, isAIGenerated: true, source: 'AI Generated' };
  }

  // Fallback: deterministic roadmap
  return generateDeterministicRoadmap(skillGaps, preferences);
}

/**
 * Build LearningPath items from AI-generated weeks
 */
async function buildPathItems(weeks, resources, skillGaps, availableHours) {
  const items = [];

  for (const week of weeks) {
    // Find the skill for this week's focus
    const skillGap = skillGaps.find((g) =>
      week.focus?.toLowerCase().includes(g.skillName?.toLowerCase())
    );
    const skillResource = resources.find((r) =>
      week.focus?.toLowerCase().includes(r.skillName?.toLowerCase())
    );

    items.push({
      skill: skillGap?.skillId || null,
      skillName: week.focus || 'General',
      resource: skillResource?.resourceId || null,
      resourceTitle: skillResource?.title || `${week.focus} Learning`,
      weekNumber: week.weekNumber,
      learningGoal: (week.goals || []).join('; ') || `Improve ${week.focus}`,
      estimatedHours: Math.min(availableHours, 10),
      status: 'not_started',
      priority: skillGap?.priority || 0,
    });
  }

  return items;
}

/**
 * Deterministic fallback roadmap
 */
export function generateDeterministicRoadmap(skillGaps, preferences) {
  const availableHours = preferences.availableHours || 10;
  const resources = preferences.resources || [];
  const items = [];
  let weekNum = 1;

  for (const gap of skillGaps) {
    const resource = resources.find((r) => r.skillName === gap.skillName);
    items.push({
      skill: gap.skillId,
      skillName: gap.skillName,
      resource: resource?.resourceId || null,
      resourceTitle: resource?.title || `${gap.skillName} Fundamentals`,
      weekNumber: weekNum,
      learningGoal: `Improve ${gap.skillName} — close gap of ${gap.gap}%`,
      estimatedHours: Math.min(availableHours, 8),
      status: 'not_started',
      priority: gap.priority,
    });
    weekNum++;
  }

  // Add project week
  items.push({
    skill: skillGaps[0]?.skillId || null,
    skillName: 'Portfolio Project',
    resource: null,
    resourceTitle: 'Build a Capstone Project',
    weekNumber: weekNum,
    learningGoal: 'Apply all learned skills in a real-world project',
    estimatedHours: availableHours,
    status: 'not_started',
    priority: 0,
  });

  return {
    weeks: items.map((item) => ({
      weekNumber: item.weekNumber,
      focus: item.skillName,
      goals: [item.learningGoal],
      activities: ['Study concepts', 'Complete exercises', 'Build mini-project'],
      projectSuggestion: `Build a small ${item.skillName} project`,
    })),
    items,
    summary: `Personalized ${weekNum}-week roadmap focusing on ${skillGaps.length} skill gaps, prioritized by importance.`,
    isAIGenerated: false,
    source: 'Deterministic Generation (AI unavailable)',
  };
}
