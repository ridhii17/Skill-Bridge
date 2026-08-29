import { analyzeResume } from './resumeAnalyzerAgent.js';
import { explainJobMatch } from './skillGapAgent.js';
import { explainLearningResource } from './learningRecommendationAgent.js';
import { generateAIRoadmap, generateDeterministicRoadmap } from './careerRoadmapAgent.js';
import { askCareerAssistant } from './careerAssistantAgent.js';

import CandidateProfile from '../models/CandidateProfile.js';
import CareerRole from '../models/CareerRole.js';
import Skill from '../models/Skill.js';
import Job from '../models/Job.js';
import LearningResource from '../models/LearningResource.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import { calculateSkillGaps } from '../algorithms/skillGapCalculator.js';
import { calculateJobMatch } from '../algorithms/jobMatcher.js';

/**
 * AI Orchestrator
 * Routes requests to the correct AI agent.
 * Gathers data from DB (controlled access) and passes it to agents.
 * Agents do NOT have direct DB access.
 */
class AIOrchestrator {
  /**
   * 1. Resume Analysis
   */
  async analyzeResume(userId, resumeText) {
    return analyzeResume(resumeText);
  }

  /**
   * 2. Job Match Explanation
   */
  async explainJobMatch(userId, jobId) {
    // Gather candidate data
    const profile = await CandidateProfile.findOne({ user: userId })
      .populate('declaredSkillLevels.skill', 'name')
      .populate('targetCareer', 'title');

    const job = await Job.findById(jobId)
      .populate('requiredSkills.skill', 'name')
      .populate('careerRole', 'title');

    if (!profile || !job) {
      return { error: 'Profile or job not found', fallback: true };
    }

    // Build candidate data (safe subset)
    const candidateData = {
      name: profile.user?.toString(),
      careerGoal: profile.targetCareer?.title || 'Not set',
      overallScore: profile.overallScore || 0,
      skills: (profile.declaredSkillLevels || []).map((ds) => ({
        name: ds.skill?.name || 'Unknown',
        score: ds.level,
      })),
    };

    const jobData = {
      title: job.title,
      company: job.company,
      requiredSkills: (job.requiredSkills || []).map((rs) => ({
        name: rs.skill?.name || 'Unknown',
        minimumScore: rs.minimumScore,
      })),
    };

    // Get deterministic match
    const skillScores = (profile.declaredSkillLevels || []).map((ds) => ({
      skill: ds.skill?._id || ds.skill,
      score: ds.level,
    }));
    const matchData = calculateJobMatch(profile, job, skillScores);

    return explainJobMatch(candidateData, jobData, matchData);
  }

  /**
   * 3. Learning Resource Explanation
   */
  async explainLearningResource(userId, resourceId) {
    const resource = await LearningResource.findById(resourceId).populate('skill', 'name');
    const profile = await CandidateProfile.findOne({ user: userId }).populate('targetCareer');

    if (!resource) return { error: 'Resource not found', fallback: true };

    // Find the skill gap for this resource's skill
    let skillGap = { skillName: resource.skill?.name || 'Unknown', currentScore: 0, requiredScore: 70, gap: 70, priority: 50 };

    if (profile?.targetCareer) {
      const career = await CareerRole.findById(profile.targetCareer);
      if (career) {
        const skillScores = (profile.declaredSkillLevels || []).map((ds) => ({
          skill: ds.skill.toString(),
          score: ds.level,
        }));
        const allSkills = await Skill.find();
        const skillLookup = {};
        allSkills.forEach((s) => { skillLookup[s._id.toString()] = s.name; });

        const gaps = calculateSkillGaps(skillScores, career.requiredSkills, skillLookup);
        const matchingGap = gaps.gaps.find((g) => g.skillName === resource.skill?.name);
        if (matchingGap) skillGap = matchingGap;
      }
    }

    return explainLearningResource(
      { title: resource.title, type: resource.type, level: resource.level, duration: resource.duration, provider: resource.provider },
      skillGap
    );
  }

  /**
   * 4. AI Career Roadmap
   */
  async generateRoadmap(userId, useAI = true) {
    const profile = await CandidateProfile.findOne({ user: userId })
      .populate('declaredSkillLevels.skill', 'name')
      .populate('targetCareer', 'title');

    if (!profile || !profile.targetCareer) {
      return { error: 'Set a career goal first', fallback: true };
    }

    const career = await CareerRole.findById(profile.targetCareer);
    if (!career) return { error: 'Career not found', fallback: true };

    const skillScores = (profile.declaredSkillLevels || []).map((ds) => ({
      skill: ds.skill.toString(),
      skillName: ds.skill?.name || '',
      score: ds.level,
    }));

    const allSkills = await Skill.find();
    const skillLookup = {};
    allSkills.forEach((s) => { skillLookup[s._id.toString()] = s.name; });
    skillScores.forEach((s) => { if (!s.skillName) s.skillName = skillLookup[s.skill] || 'Unknown'; });

    const gapResult = calculateSkillGaps(skillScores, career.requiredSkills, skillLookup);
    const skillGaps = gapResult.gaps.filter((g) => g.gap > 0);

    // Get resources for gaps
    const resources = [];
    for (const gap of skillGaps.slice(0, 5)) {
      const res = await LearningResource.findOne({ skill: gap.skillId, isActive: true });
      if (res) {
        resources.push({ title: res.title, type: res.type, level: res.level, skillName: gap.skillName, resourceId: res._id });
      }
    }

    const preferences = {
      availableHours: profile.availableHoursPerWeek || 10,
      learningPreference: profile.learningPreference || 'mixed',
      resources,
    };

    if (useAI) {
      return generateAIRoadmap(userId, { title: career.title }, skillGaps, preferences);
    }
    return generateDeterministicRoadmap(skillGaps, preferences);
  }

  /**
   * 5. Career Assistant Chat
   */
  async askAssistant(userId, question) {
    // Gather all candidate context
    const profile = await CandidateProfile.findOne({ user: userId })
      .populate('declaredSkillLevels.skill', 'name')
      .populate('targetCareer', 'title');

    const allSkills = await Skill.find();
    const skillLookup = {};
    allSkills.forEach((s) => { skillLookup[s._id.toString()] = s.name; });

    let strengths = [];
    let weaknesses = [];
    let criticalGaps = [];
    let jobMatchCount = 0;

    if (profile?.targetCareer) {
      const career = await CareerRole.findById(profile.targetCareer);
      if (career) {
        const skillScores = (profile.declaredSkillLevels || []).map((ds) => ({
          skill: ds.skill.toString(),
          skillName: skillLookup[ds.skill.toString()] || 'Unknown',
          score: ds.level,
        }));
        const gapResult = calculateSkillGaps(skillScores, career.requiredSkills, skillLookup);
        criticalGaps = gapResult.criticalGaps || [];
        strengths = gapResult.readySkills || [];
      }
    }

    // Count job matches
    const allJobs = await Job.find({ isActive: true });
    if (profile) {
      const skillScores = (profile.declaredSkillLevels || []).map((ds) => ({
        skill: ds.skill?._id || ds.skill,
        score: ds.level,
      }));
      jobMatchCount = allJobs.filter((job) => {
        const match = calculateJobMatch(profile, job, skillScores);
        return match.matchScore >= 40;
      }).length;
    }

    const context = {
      name: profile?.user?.toString() || 'Candidate',
      careerGoal: profile?.targetCareer?.title || 'Not set',
      overallScore: profile?.overallScore || 0,
      skills: (profile?.declaredSkillLevels || []).map((ds) => ({
        name: skillLookup[ds.skill.toString()] || 'Unknown',
        score: ds.level,
      })),
      strengths,
      weaknesses,
      criticalGaps,
      jobMatchCount,
    };

    return askCareerAssistant(question, context);
  }
}

export default new AIOrchestrator();
