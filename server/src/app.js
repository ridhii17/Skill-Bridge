import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import config from './config/index.js';
import corsOptions from './config/cors.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import logger from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import skillRoutes from './routes/skill.routes.js';
import careerRoutes from './routes/career.routes.js';
import candidateRoutes from './routes/candidate.routes.js';
import assessmentRoutes from './routes/assessment.routes.js';
import jobRoutes from './routes/job.routes.js';
import learningRoutes from './routes/learning.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import aiRoutes from './routes/ai.routes.js';
import verificationRoutes from './routes/verification.routes.js';
import adminRoutes from './routes/admin.routes.js';
import simulatorRoutes from './routes/simulator.routes.js';
import marketRoutes from './routes/market.routes.js';
import careerReadinessRoutes from './routes/careerReadiness.routes.js';
import careerProgressRoutes from './routes/careerProgress.routes.js';
import adaptiveLearningRoutes from './routes/adaptiveLearning.routes.js';
import recruiterRoutes from './routes/recruiter.routes.js';

const app = express();

// ─── Security ──────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));

// ─── Body Parsing ───────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// ─── Rate Limiting ─────────────────────────────────────
app.use('/api', generalLimiter);

// ─── Logging ────────────────────────────────────────────
app.use(logger);

// ─── Routes ─────────────────────────────────────────────
app.use('/api', healthRoutes);
app.use('/api', authRoutes);
app.use('/api', skillRoutes);
app.use('/api', careerRoutes);
app.use('/api', candidateRoutes);
app.use('/api', assessmentRoutes);
app.use('/api', jobRoutes);
app.use('/api', learningRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', aiRoutes);
app.use('/api', verificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', simulatorRoutes);
app.use('/api', marketRoutes);
app.use('/api', careerReadinessRoutes);
app.use('/api', careerProgressRoutes);
app.use('/api', adaptiveLearningRoutes);
app.use('/api', recruiterRoutes);

// ─── 404 Handler ────────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ───────────────────────────────
app.use(errorHandler);

export default app;
