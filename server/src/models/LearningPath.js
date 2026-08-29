import mongoose from 'mongoose';

const learningPathItemSchema = new mongoose.Schema(
  {
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    skillName: String,
    resource: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningResource' },
    resourceTitle: String,
    weekNumber: { type: Number, required: true },
    learningGoal: { type: String, default: '' },
    estimatedHours: { type: Number, default: 5 },
    status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
    priority: { type: Number, default: 0 },
  },
  { _id: true }
);

const learningPathSchema = new mongoose.Schema(
  {
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    careerRole: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerRole', required: true },
    items: [learningPathItemSchema],
    totalWeeks: { type: Number, default: 6 },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
  },
  { timestamps: true }
);

learningPathSchema.index({ candidate: 1, careerRole: 1 });

export default mongoose.model('LearningPath', learningPathSchema);
