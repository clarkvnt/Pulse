import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // CloudWatch-friendly JSON logging format
    const logData = {
      timestamp,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip || req.socket.remoteAddress,
    };
    
    if (config.nodeEnv === 'production') {
      // JSON format for CloudWatch Logs Insights
      if (res.statusCode >= 400) {
        console.error(JSON.stringify({ level: 'ERROR', ...logData }));
      } else {
        console.log(JSON.stringify({ level: 'INFO', ...logData }));
      }
    } else {
      // Human-readable format for development
      const logMessage = `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`;
      if (res.statusCode >= 400) {
        console.error(logMessage);
      } else {
        console.log(logMessage);
      }
    }
  });

  next();
};
