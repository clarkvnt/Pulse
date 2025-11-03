import express from 'express';
import 'express-async-errors';
import { config } from './config/env.js';
import { corsMiddleware } from './middleware/cors.js';
import { requestLogger } from './middleware/logger.js';
import { securityHeaders } from './middleware/security.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import routes from './routes/index.js';
import { runMigrations } from './utils/migrations.js';

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(securityHeaders);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.use('/', routes);

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
let server: ReturnType<typeof app.listen> | null = null;

const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Run database migrations in production
    if (config.nodeEnv === 'production') {
      console.log('🔄 Running database migrations...');
      await runMigrations();
      console.log('✅ Migrations completed');
    }

    // Bind to 0.0.0.0 to accept connections from any network interface (required for AWS)
    server = app.listen(config.port, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://0.0.0.0:${config.port}`);
      console.log(`📦 Environment: ${config.nodeEnv}`);
      console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
      console.log(`📍 Health check: http://0.0.0.0:${config.port}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
