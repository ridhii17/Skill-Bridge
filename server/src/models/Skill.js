import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['frontend', 'backend', 'database', 'devops', 'soft_skill', 'ai_ml', 'security', 'data', 'general'],
    },
    description: { type: String, default: '' },
    weight: { type: Number, default: 1.0, min: 0, max: 5 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

skillSchema.index({ name: 1 });
skillSchema.index({ category: 1 });

export default mongoose.model('Skill', skillSchema);
