// CORS Middleware Configuration
import cors from 'cors';
import { config } from '../config/env.js';

// Parse allowed origins from environment variable (comma-separated)
// Also include common localhost variations for development
const getAllowedOrigins = (): string[] => {
  const origins: string[] = [];
  
  // Add primary frontend URL
  if (config.frontendUrl) {
    origins.push(config.frontendUrl);
  }
  
  // Add additional origins from FRONTEND_URLS if provided (comma-separated)
  if (process.env.FRONTEND_URLS) {
    const additionalOrigins = process.env.FRONTEND_URLS.split(',').map(url => url.trim());
    origins.push(...additionalOrigins);
  }
  
  // In development, allow localhost variations
  if (config.nodeEnv === 'development') {
    origins.push('http://localhost:3000', 'http://127.0.0.1:3000');
  }
  
  return origins;
};

const allowedOrigins = getAllowedOrigins();

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In development, be more permissive
      if (config.nodeEnv === 'development') {
        console.warn(`⚠️  CORS: Allowing origin ${origin} in development mode`);
        callback(null, true);
      } else {
        console.warn(`⚠️  CORS: Blocked origin ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export const corsMiddleware = cors(corsOptions);
