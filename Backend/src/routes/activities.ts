import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Get all activities (with optional filters)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.query.projectId ? parseInt(req.query.projectId as string, 10) : undefined;
    const taskId = req.query.taskId as string | undefined;
    const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;
    const type = req.query.type as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const activities = await prisma.activity.findMany({
      where: {
        ...(projectId && { projectId }),
        ...(taskId && { taskId }),
        ...(userId && { userId }),
        ...(type && { type }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            initials: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.activity.count({
      where: {
        ...(projectId && { projectId }),
        ...(taskId && { taskId }),
        ...(userId && { userId }),
        ...(type && { type }),
      },
    });

    sendSuccess(
      res,
      {
        activities,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      },
      'Activities retrieved successfully'
    );
  } catch (error) {
    throw error;
  }
});

// Get activity by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const activityId = parseInt(req.params.id, 10);

    if (isNaN(activityId)) {
      return sendError(res, 'Invalid activity ID', 400);
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            initials: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    if (!activity) {
      return sendError(res, 'Activity not found', 404);
    }

    sendSuccess(res, activity, 'Activity retrieved successfully');
  } catch (error) {
    throw error;
  }
});

// Get activities for a specific project
router.get('/project/:projectId', async (req: AuthRequest, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);

    if (isNaN(projectId)) {
      return sendError(res, 'Invalid project ID', 400);
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const activities = await prisma.activity.findMany({
      where: {
        projectId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            initials: true,
            avatar: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const totalCount = await prisma.activity.count({
      where: {
        projectId,
      },
    });

    sendSuccess(
      res,
      {
        activities,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      },
      'Project activities retrieved successfully'
    );
  } catch (error) {
    throw error;
  }
});

// Get recent activities (dashboard feed)
router.get('/recent/feed', async (req: AuthRequest, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const activities = await prisma.activity.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            initials: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    sendSuccess(res, activities, 'Recent activities retrieved successfully');
  } catch (error) {
    throw error;
  }
});

export default router;

