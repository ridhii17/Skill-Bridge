import mongoose from 'mongoose';

const breakdownItemSchema = new mongoose.Schema({
  category: { type: String, required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  weight: { type: Number, required: true },
  weightedScore: { type: Number, required: true },
  explanation: { type: String, default: '' },
}, { _id: false });

const skillComparisonSchema = new mongoose.Schema({
  skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
  skillName: { type: String, required: true },
  currentScore: { type: Number, required: true },
  requiredScore: { type: Number, required: true },
  gap: { type: Number, required: true },
  importance: { type: Number, default: 1 },
  status: { type: String, enum: ['ready', 'developing', 'needs_improvement', 'critical_gap'] },
}, { _id: false });

const careerReadinessSnapshotSchema = new mongoose.Schema(
  {
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    readinessLevel: {
      type: String,
      enum: ['foundation', 'developing', 'career_building', 'career_ready', 'highly_ready'],
      required: true,
    },
    breakdown: [breakdownItemSchema],
    targetCareer: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerRole' },
    targetCareerTitle: { type: String, default: '' },
    skillComparisons: [skillComparisonSchema],
    topStrengths: [String],
    criticalGaps: [String],
    highestImpactSkill: {
      skillName: String,
      currentScore: Number,
      requiredScore: Number,
      gap: Number,
      importance: Number,
    },
    triggeredBy: {
      type: String,
      enum: ['assessment', 'verification', 'roadmap', 'manual', 'reassessment', 'profile_update'],
      default: 'manual',
    },
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentAttempt' },
  },
  { timestamps: true }
);

careerReadinessSnapshotSchema.index({ candidate: 1, createdAt: -1 });
careerReadinessSnapshotSchema.index({ candidate: 1, triggeredBy: 1 });

export default mongoose.model('CareerReadinessSnapshot', careerReadinessSnapshotSchema);
