import app from './app.js';
import config from './config/index.js';
import connectDB from './config/database.js';

const startServer = async () => {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║   SkillBridge AI — Server                ║
  ║   Port: ${config.port}                            ║
  ║   Env:  ${config.nodeEnv.padEnd(32)}║
  ║   API:  http://localhost:${config.port}/api        ║
  ╚══════════════════════════════════════════╝
    `);
  });
};

startServer();
