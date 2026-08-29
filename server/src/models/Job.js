import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    jobType: { type: String, enum: ['full_time', 'part_time', 'contract', 'internship', 'remote'], required: true },
    salary: { min: Number, max: Number, currency: { type: String, default: 'INR' } },
    description: { type: String, required: true },
    requiredSkills: [
      {
        skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
        minimumScore: { type: Number, default: 50 },
        importanceWeight: { type: Number, default: 1.0 },
      },
    ],
    experienceRequired: { type: Number, default: 0 },
    educationRequired: { type: String, default: '' },
    careerRole: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerRole' },
    isDemo: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    postedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

jobSchema.index({ careerRole: 1 });
jobSchema.index({ isActive: 1 });

export default mongoose.model('Job', jobSchema);
