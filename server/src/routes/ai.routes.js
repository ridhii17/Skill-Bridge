import { Router } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { authenticateUser } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import orchestrator from '../ai/orchestrator.js';

const router = Router();

// File upload config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// ─── 1. Resume Analysis ───────────────────────────────
router.post('/ai/resume', authenticateUser, aiLimiter, upload.single('resume'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded. Please upload a PDF resume.' });
  }

  // Extract text from PDF
  let resumeText;
  try {
    const pdfData = await pdfParse(req.file.buffer);
    resumeText = pdfData.text;
  } catch (err) {
    return res.status(400).json({ success: false, message: 'Failed to parse PDF. Please upload a valid PDF file.' });
  }

  if (!resumeText || resumeText.trim().length < 20) {
    return res.status(400).json({ success: false, message: 'Could not extract meaningful text from the PDF.' });
  }

  const result = await orchestrator.analyzeResume(req.user._id, resumeText);
  ApiResponse.success(res, result, 'Resume analyzed');
}));

// ─── 2. Job Match Explanation ─────────────────────────
router.post('/ai/job-explanation', authenticateUser, aiLimiter, asyncHandler(async (req, res) => {
  const { jobId } = req.body;
  if (!jobId) return res.status(400).json({ success: false, message: 'jobId is required' });

  const result = await orchestrator.explainJobMatch(req.user._id, jobId);
  if (result.error) return res.status(404).json({ success: false, message: result.error });

  ApiResponse.success(res, result, 'Job explanation generated');
}));

// ─── 3. Learning Resource Explanation ─────────────────
router.post('/ai/learning-explanation', authenticateUser, aiLimiter, asyncHandler(async (req, res) => {
  const { resourceId } = req.body;
  if (!resourceId) return res.status(400).json({ success: false, message: 'resourceId is required' });

  const result = await orchestrator.explainLearningResource(req.user._id, resourceId);
  if (result.error) return res.status(404).json({ success: false, message: result.error });

  ApiResponse.success(res, result, 'Learning explanation generated');
}));

// ─── 4. AI Career Roadmap ─────────────────────────────
router.post('/ai/roadmap', authenticateUser, aiLimiter, asyncHandler(async (req, res) => {
  const { useAI = true } = req.body;
  const result = await orchestrator.generateRoadmap(req.user._id, useAI);

  if (result.error) return res.status(400).json({ success: false, message: result.error });
  ApiResponse.success(res, result, 'Roadmap generated');
}));

// ─── 5. Career Assistant Chat ─────────────────────────
router.post('/ai/assistant', authenticateUser, aiLimiter, asyncHandler(async (req, res) => {
  const { question } = req.body;
  if (!question || question.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'question is required' });
  }

  const result = await orchestrator.askAssistant(req.user._id, question.trim());
  ApiResponse.success(res, result, 'Response generated');
}));

// ─── 6. AI Health Check ───────────────────────────────
router.get('/ai/status', authenticateUser, asyncHandler(async (req, res) => {
  const aiClient = (await import('../ai/client.js')).default;
  ApiResponse.success(res, {
    available: aiClient.isAvailable,
    model: aiClient.model,
    message: aiClient.isAvailable ? 'AI service connected' : 'AI service unavailable — using deterministic fallbacks',
  });
}));

export default router;
