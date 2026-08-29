import config from './index.js';

const corsOptions = {
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400,
};

export default corsOptions;
