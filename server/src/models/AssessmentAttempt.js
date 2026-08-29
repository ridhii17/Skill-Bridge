import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedOption: { type: Number, required: true, min: 0, max: 3 },
    isCorrect: { type: Boolean, required: true },
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
  },
  { _id: false }
);

const assessmentAttemptSchema = new mongoose.Schema(
  {
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    answers: [answerSchema],
    score: { type: Number, required: true, min: 0, max: 100 },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    skillScores: [
      {
        skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
        skillName: String,
        score: Number,
        total: Number,
        correct: Number,
      },
    ],
    strengths: [String],
    weaknesses: [String],
    startedAt: { type: Date, required: true },
    completedAt: { type: Date, required: true },
    attemptNumber: { type: Number, default: 1 },
    status: { type: String, enum: ['in_progress', 'completed', 'timed_out'], default: 'in_progress' },
  },
  { timestamps: true }
);

assessmentAttemptSchema.index({ candidate: 1, assessment: 1 });

export default mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
