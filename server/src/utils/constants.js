export const ROLES = {
  CANDIDATE: 'candidate',
  MENTOR: 'mentor',
  RECRUITER: 'recruiter',
  ADMIN: 'admin',
};

export const ROLE_HIERARCHY = {
  [ROLES.CANDIDATE]: 0,
  [ROLES.MENTOR]: 1,
  [ROLES.RECRUITER]: 1,
  [ROLES.ADMIN]: 2,
};

export const COMPETENCY_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

export const LEVEL_THRESHOLDS = {
  beginner: { min: 0, max: 25 },
  intermediate: { min: 26, max: 50 },
  advanced: { min: 51, max: 75 },
  expert: { min: 76, max: 100 },
};

export const COMPETENCY_CATEGORIES = [
  'frontend',
  'backend',
  'database',
  'devops',
  'soft_skill',
  'ai_ml',
  'mobile',
  'security',
  'design',
];

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY: 429,
  INTERNAL: 500,
};
