import api from './axios';

// Skills
export const skillApi = {
  list: (params) => api.get('/skills', { params }),
  categories: () => api.get('/skills/categories'),
  get: (id) => api.get(`/skills/${id}`),
};

// Careers
export const careerApi = {
  list: () => api.get('/careers'),
  get: (id) => api.get(`/careers/${id}`),
  getMyTarget: () => api.get('/careers/my-target'),
  setTarget: (careerId) => api.post('/careers/target', { careerId }),
  gapAnalysis: () => api.get('/careers/gap-analysis'),
};

// Candidate Profile
export const candidateApi = {
  getProfile: () => api.get('/candidates/profile'),
  updateProfile: (data) => api.put('/candidates/profile', data),
};

// Assessments
export const assessmentApi = {
  list: (params) => api.get('/assessments', { params }),
  get: (id) => api.get(`/assessments/${id}`),
  submit: (id, data) => api.post(`/assessments/${id}/submit`, data),
  getResult: (assessmentId, attemptId) => api.get(`/assessments/${assessmentId}/result/${attemptId}`),
  myHistory: () => api.get('/assessments/history/my'),
};

// Jobs
export const jobApi = {
  list: (params) => api.get('/jobs', { params }),
  get: (id) => api.get(`/jobs/${id}`),
  myMatches: () => api.get('/jobs/matches/my'),
};

// Learning
export const learningApi = {
  resources: (params) => api.get('/learning/resources', { params }),
  recommendations: () => api.get('/learning/recommendations'),
  getMyPath: () => api.get('/learning/path'),
  generatePath: () => api.post('/learning/path/generate'),
  updateItemStatus: (itemId, status) => api.put(`/learning/path/item/${itemId}`, { status }),
};

// Dashboard
export const dashboardApi = {
  get: () => api.get('/dashboard'),
};

// Verification
export const verificationApi = {
  myVerifications: () => api.get('/verifications/my'),
  getPublic: (verificationId) => api.get(`/verify/${verificationId}`),
};

// Admin
export const adminApi = {
  stats: () => api.get('/admin/stats'),
  users: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive }),
  jobs: () => api.get('/admin/jobs'),
  skills: () => api.get('/admin/skills'),
};

// Simulator
export const simulatorApi = {
  whatIf: (improvements) => api.post('/simulator/what-if', { skillImprovements: improvements }),
};

// Adaptive Learning
export const adaptiveApi = {
  nextAction: () => api.get('/adaptive/next-action'),
  skillProgress: () => api.get('/adaptive/skill-progress'),
  miniAssessment: (skillId) => api.get(`/adaptive/mini-assessment/${skillId}`),
  submitMiniAssessment: (skillId, data) => api.post(`/adaptive/mini-assessment/${skillId}/submit`, data),
  dashboard: () => api.get('/adaptive/dashboard'),
  miniAssessmentHistory: (skillId) => api.get(`/adaptive/mini-assessment-history/${skillId}`),
};

// Career Readiness
export const careerReadinessApi = {
  get: () => api.get('/career-readiness'),
  history: (params) => api.get('/career-readiness/history', { params }),
  createSnapshot: (triggeredBy) => api.post('/career-readiness/snapshot', { triggeredBy }),
};

// Market
export const marketApi = {
  insights: () => api.get('/market/insights'),
};

// AI
export const aiApi = {
  analyzeResume: (formData) => api.post('/ai/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  explainJob: (jobId) => api.post('/ai/job-explanation', { jobId }),
  explainLearning: (resourceId) => api.post('/ai/learning-explanation', { resourceId }),
  generateRoadmap: (useAI = true) => api.post('/ai/roadmap', { useAI }),
  askAssistant: (question) => api.post('/ai/assistant', { question }),
  status: () => api.get('/ai/status'),
};
