import { Router, Request, Response } from 'express';
import prisma from '../config/database.js';

// Import route modules
import authRoutes from './auth.js';
import userRoutes from './users.js';
import teamRoutes from './team.js';
import projectRoutes from './projects.js';
import taskRoutes from './tasks.js';
import columnRoutes from './columns.js';
import activityRoutes from './activities.js';

const router = Router();

// Health check endpoint (for load balancers)
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Pulse API is running',
    timestamp: new Date().toISOString(),
  });
});

// Readiness check (includes database connectivity)
router.get('/health/ready', async (req: Request, res: Response) => {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      success: true,
      message: 'Service is ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Service is not ready',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

// Liveness check (basic check)
router.get('/health/live', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Service is alive',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/team', teamRoutes);
router.use('/api/projects', projectRoutes);
router.use('/api/tasks', taskRoutes);
router.use('/api/columns', columnRoutes);
router.use('/api/activities', activityRoutes);

export default router;
