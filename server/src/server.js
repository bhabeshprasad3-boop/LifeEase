const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');
const { startReminderJob } = require('./jobs/reminder.job');

const startServer = async () => {
  // Connect to MongoDB first
  await connectDB();

  // Start Express server
  const server = app.listen(env.port, () => {
    console.log(`\n🚀 LifeEase Server running`);
    console.log(`   Mode:    ${env.nodeEnv}`);
    console.log(`   Port:    ${env.port}`);
    console.log(`   URL:     http://localhost:${env.port}`);
    console.log(`   Health:  http://localhost:${env.port}/api/health\n`);
  });

  // Start background jobs
  startReminderJob();

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('✓ HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('✗ Unhandled Rejection at:', promise, 'reason:', reason);
    server.close(() => process.exit(1));
  });
};

startServer();
