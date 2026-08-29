import aiClient from './client.js';
import { RESUME_ANALYSIS } from './prompts.js';
import Skill from '../models/Skill.js';

/**
 * ResumeAnalyzerAgent
 * Input: raw text from uploaded PDF
 * Output: structured resume data + matched skills from DB
 */
export async function analyzeResume(resumeText) {
  // 1. Try AI analysis
  const aiResult = await aiClient.chatJSON(
    RESUME_ANALYSIS.system,
    RESUME_ANALYSIS.user(resumeText),
    { temperature: 0.3 }
  );

  let analysis;
  let isAIGenerated = false;

  if (aiResult.success && aiResult.parsed) {
    analysis = aiResult.parsed;
    isAIGenerated = true;
  } else {
    // Fallback: basic keyword extraction
    analysis = fallbackExtract(resumeText);
    isAIGenerated = false;
  }

  // 2. Match extracted skills against DB
  const allSkills = await Skill.find({ isActive: true });
  const skillNames = (analysis.skills || []).map((s) => s.toLowerCase());

  const matchedSkills = [];
  const unmatchedSkills = [];

  for (const skill of allSkills) {
    const skillLower = skill.name.toLowerCase();
    const found = skillNames.some((s) =>
      s.includes(skillLower) || skillLower.includes(s)
    );
    if (found) {
      matchedSkills.push({ name: skill.name, category: skill.category, id: skill._id, source: 'resume' });
    }
  }

  // Skills mentioned in resume but not in our DB
  for (const s of (analysis.skills || [])) {
    if (!matchedSkills.find((m) => m.name.toLowerCase() === s.toLowerCase())) {
      unmatchedSkills.push(s);
    }
  }

  return {
    analysis: {
      ...analysis,
      matchedSkills,
      unmatchedSkills,
    },
    isAIGenerated,
    source: isAIGenerated ? 'AI Analysis' : 'Deterministic Extraction (fallback)',
    fallback: !isAIGenerated,
  };
}

/**
 * Deterministic fallback — basic keyword extraction without AI
 */
function fallbackExtract(text) {
  const lower = text.toLowerCase();

  // Common tech skills to look for
  const knownSkills = [
    'javascript', 'react', 'node.js', 'nodejs', 'express', 'mongodb', 'sql', 'python',
    'java', 'html', 'css', 'typescript', 'git', 'docker', 'aws', 'linux', 'rest api',
    'graphql', 'redis', 'postgresql', 'mysql', 'machine learning', 'tensorflow',
    'angular', 'vue', 'next.js', 'tailwind', 'bootstrap', 'figma',
  ];

  const skills = knownSkills.filter((skill) => lower.includes(skill));

  // Basic education extraction
  let education = { degree: null, branch: null, institution: null, graduationYear: null };
  const yearMatch = text.match(/\b(20\d{2})\b/);
  if (yearMatch) education.graduationYear = parseInt(yearMatch[1]);

  const degreePatterns = ['b.tech', 'bachelor', 'm.tech', 'master', 'mba', 'bca', 'mca', 'b.sc', 'm.sc', 'phd'];
  for (const pattern of degreePatterns) {
    if (lower.includes(pattern)) {
      education.degree = pattern.toUpperCase().replace('.', '');
      break;
    }
  }

  // Basic experience extraction
  let experience = { years: null, roles: [] };
  const expMatch = text.match(/(\d+)\+?\s*years?\s*(?:of\s*)?experience/i);
  if (expMatch) experience.years = parseInt(expMatch[1]);

  return {
    skills,
    education,
    experience,
    projects: [],
    certifications: [],
    achievements: [],
    summary: 'Extracted using deterministic fallback (AI unavailable)',
  };
}
