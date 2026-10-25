const app = require('./app');
const config = require('./config');
const { getDatabase } = require('./database/db');
const { initializeSchema } = require('./database/schema');

// Initialize database schema safely on start
try {
  const db = getDatabase();
  initializeSchema(db);
  console.log('Database initialized successfully at:', config.databasePath);
} catch (err) {
  console.error('Failed to initialize database schema:', err);
  process.exit(1);
}

const server = app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`ConnectSphere API Server running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Health check: http://localhost:${config.port}/api/health`);
  console.log(`Base API: http://localhost:${config.port}/api/v1`);
  console.log(`===============================================`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});

module.exports = server;
