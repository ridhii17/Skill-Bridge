import mongoose from 'mongoose';

const learningResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    type: { type: String, enum: ['course', 'article', 'video', 'book', 'practice', 'project'], required: true },
    duration: { type: String, required: true },
    description: { type: String, default: '' },
    url: { type: String, default: '' },
    provider: { type: String, default: '' },
    isFree: { type: Boolean, default: true },
    isDemo: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

learningResourceSchema.index({ skill: 1 });
learningResourceSchema.index({ level: 1 });

export default mongoose.model('LearningResource', learningResourceSchema);
