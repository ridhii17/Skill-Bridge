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
