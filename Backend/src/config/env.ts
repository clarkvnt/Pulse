import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expire: process.env.JWT_EXPIRE || '7d',
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  },
} as const;

// Validate required environment variables
if (!config.database.url) {
  console.warn('⚠️  DATABASE_URL is not set. Database operations will fail.');
}

if (config.jwt.secret === 'your-secret-key' && config.nodeEnv === 'production') {
  console.warn('⚠️  JWT_SECRET should be changed in production!');
}
