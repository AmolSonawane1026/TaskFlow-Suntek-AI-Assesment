const dns = require('dns');

// Fix for querySrv ECONNREFUSED on Windows with local/ISP DNS
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS cannot be set
}

const app = require('./src/app');
const connectDB = require('./src/config/db');
const config = require('./src/config/env');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Connect to database and start server
const startServer = async () => {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`\n🚀 TaskFlow API Server running in ${config.nodeEnv} mode on port ${config.port}`);
    console.log(`   Health: http://localhost:${config.port}/api/health\n`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('Process terminated.');
    });
  });
};

startServer();
