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
