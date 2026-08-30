import mongoose from 'mongoose';

const shortlistSchema = new mongoose.Schema(
  {
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matchScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['shortlisted', 'contacted', 'interviewing', 'offered', 'rejected'],
      default: 'shortlisted',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

shortlistSchema.index({ recruiter: 1, job: 1 });
shortlistSchema.index({ recruiter: 1, candidate: 1 });

export default mongoose.model('Shortlist', shortlistSchema);
