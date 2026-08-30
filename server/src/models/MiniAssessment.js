import mongoose from 'mongoose';

const miniQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true, min: 0, max: 3 },
  explanation: { type: String, default: '' },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
}, { _id: true });

const miniAssessmentSchema = new mongoose.Schema(
  {
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    skillName: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    questions: [miniQuestionSchema],
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

miniAssessmentSchema.index({ skill: 1 });

export default mongoose.model('MiniAssessment', miniAssessmentSchema);
