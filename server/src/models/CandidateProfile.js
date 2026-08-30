import mongoose from 'mongoose';

const candidateProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    headline: { type: String, default: '' },
    bio: { type: String, default: '' },
    education: {
      degree: { type: String, default: '' },
      branch: { type: String, default: '' },
      institution: { type: String, default: '' },
      graduationYear: { type: Number },
      gpa: { type: Number },
    },
    experience: {
      years: { type: Number, default: 0 },
      description: { type: String, default: '' },
    },
    projects: [{ name: String, description: String, url: String }],
    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
    declaredSkillLevels: [
      {
        skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
        level: { type: Number, min: 0, max: 100, default: 50 },
      },
    ],
    targetCareer: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerRole', default: null },
    careerGoal: { type: String, default: '' },
    preferredLocation: { type: String, default: '' },
    preferredJobType: { type: String, enum: ['remote', 'hybrid', 'onsite', ''], default: '' },
    expectedSalary: { min: Number, max: Number },
    learningPreference: { type: String, enum: ['video', 'reading', 'hands_on', 'mixed'], default: 'mixed' },
    availableHoursPerWeek: { type: Number, default: 10 },
    overallScore: { type: Number, default: 0 },
    accessibilitySettings: {
      textSize: { type: String, enum: ['normal', 'large', 'xlarge'], default: 'normal' },
      highContrast: { type: Boolean, default: false },
      reducedMotion: { type: Boolean, default: false },
      dyslexiaFont: { type: Boolean, default: false },
      screenReaderOptimized: { type: Boolean, default: false },
    },
    learningSupportPreference: { type: String, enum: ['visual', 'audio', 'text', 'hands_on', 'simplified'], default: 'visual' },
  },
  { timestamps: true }
);

candidateProfileSchema.index({ user: 1 });
candidateProfileSchema.index({ targetCareer: 1 });

export default mongoose.model('CandidateProfile', candidateProfileSchema);
