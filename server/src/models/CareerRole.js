import mongoose from 'mongoose';

const careerRoleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    icon: { type: String, default: 'Briefcase' },
    averageSalary: { type: String, default: '' },
    requiredSkills: [
      {
        skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
        minimumScore: { type: Number, required: true, min: 0, max: 100 },
        importanceWeight: { type: Number, required: true, min: 0, max: 5 },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

careerRoleSchema.index({ title: 1 });

export default mongoose.model('CareerRole', careerRoleSchema);
