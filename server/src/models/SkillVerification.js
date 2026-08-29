import mongoose from 'mongoose';
import crypto from 'crypto';

const skillVerificationSchema = new mongoose.Schema(
  {
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    skillName: { type: String, required: true },
    level: { type: Number, required: true },
    assessmentAttempt: { type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentAttempt' },
    verificationId: { type: String, required: true, unique: true },
    badge: { type: String, enum: ['bronze', 'silver', 'gold'], default: 'bronze' },
    verifiedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

skillVerificationSchema.index({ candidate: 1, skill: 1 });
skillVerificationSchema.index({ verificationId: 1 });

// Generate unique verification ID before saving
skillVerificationSchema.pre('save', function (next) {
  if (!this.verificationId) {
    this.verificationId = `SB-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }
  // Set badge based on level
  if (this.level >= 85) this.badge = 'gold';
  else if (this.level >= 70) this.badge = 'silver';
  else this.badge = 'bronze';
  next();
});

export default mongoose.model('SkillVerification', skillVerificationSchema);
