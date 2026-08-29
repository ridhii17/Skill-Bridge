import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true, min: 0, max: 3 },
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    explanation: { type: String, default: '' },
  },
  { _id: true }
);

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    careerRole: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerRole' },
    questions: [questionSchema],
    timeLimitMinutes: { type: Number, default: 30 },
    passingScore: { type: Number, default: 60 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Assessment', assessmentSchema);
