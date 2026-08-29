export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'SkillBridge AI';

export const ROLES = {
  CANDIDATE: 'candidate',
  MENTOR: 'mentor',
  RECRUITER: 'recruiter',
  ADMIN: 'admin',
};

export const ROLE_LABELS = {
  candidate: 'Candidate',
  mentor: 'Mentor',
  recruiter: 'Recruiter',
  admin: 'Administrator',
};

export const ROLE_COLORS = {
  candidate: 'bg-brand-100 text-brand-700',
  mentor: 'bg-emerald-100 text-emerald-700',
  recruiter: 'bg-amber-100 text-amber-700',
  admin: 'bg-red-100 text-red-700',
};
