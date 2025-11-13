import { PrismaClient } from '@prisma/client';
import { config } from './env.js';

// Connection pool configuration for production
const prisma = new PrismaClient({
  log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: config.database.url,
    },
  },
  // Connection pool settings (recommended for production)
  // Note: These are set via DATABASE_URL connection string params in production
  // Example: postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
});

// Enhanced graceful shutdown
const shutdown = async () => {
  console.log('Disconnecting from database...');
  await prisma.$disconnect();
  console.log('Database disconnected');
};

process.on('beforeExit', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default prisma;
