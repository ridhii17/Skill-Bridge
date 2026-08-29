import { Router } from 'express';
import mongoose from 'mongoose';
import config from '../config/index.js';
import ApiResponse from '../utils/ApiResponse.js';

const router = Router();

router.get('/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  return ApiResponse.success(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'N/A',
    },
  }, 'SkillBridge AI is running');
});

export default router;
