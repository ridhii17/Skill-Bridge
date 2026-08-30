import mongoose from 'mongoose';

const miniAnswerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  selectedOption: { type: Number, required: true, min: 0, max: 3 },
  isCorrect: { type: Boolean, required: true },
}, { _id: false });

const miniAssessmentAttemptSchema = new mongoose.Schema(
  {
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    miniAssessment: { type: mongoose.Schema.Types.ObjectId, ref: 'MiniAssessment', required: true },
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    skillName: { type: String, default: '' },
    answers: [miniAnswerSchema],
    score: { type: Number, required: true, min: 0, max: 100 },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    previousScore: { type: Number, default: null },
    improvement: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['mastered', 'developing', 'needs_reinforcement'],
      required: true,
    },
    attemptNumber: { type: Number, default: 1 },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

miniAssessmentAttemptSchema.index({ candidate: 1, skill: 1 });
miniAssessmentAttemptSchema.index({ candidate: 1, completedAt: -1 });

export default mongoose.model('MiniAssessmentAttempt', miniAssessmentAttemptSchema);
