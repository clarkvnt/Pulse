import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  columnId: z.string().uuid('Invalid column ID'),
  projectId: z.number().int().optional(),
  assignedToId: z.number().int().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  columnId: z.string().uuid().optional(),
  projectId: z.number().int().optional(),
  assignedToId: z.number().int().nullable().optional(),
  completed: z.boolean().optional(),
});

const moveTaskSchema = z.object({
  columnId: z.string().uuid('Invalid column ID'),
  order: z.number().int().optional(),
});

// Get all tasks (with optional filters)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.query.projectId ? parseInt(req.query.projectId as string, 10) : undefined;
    const columnId = req.query.columnId as string | undefined;
    const assignedToId = req.query.assignedToId ? parseInt(req.query.assignedToId as string, 10) : undefined;

    const tasks = await prisma.task.findMany({
      where: {
        ...(projectId && { projectId }),
        ...(columnId && { columnId }),
        ...(assignedToId && { assignedToId }),
      },
      include: {
        column: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            initials: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    sendSuccess(res, tasks, 'Tasks retrieved successfully');
  } catch (error) {
    throw error;
  }
});

// Get task by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.id;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: true,
        project: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            initials: true,
            avatar: true,
          },
        },
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                initials: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!task) {
      return sendError(res, 'Task not found', 404);
    }

    sendSuccess(res, task, 'Task retrieved successfully');
  } catch (error) {
    throw error;
  }
});

// Create task
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createTaskSchema.parse(req.body);

    // Verify column exists
    const column = await prisma.column.findUnique({
      where: { id: validatedData.columnId },
    });

    if (!column) {
      return sendError(res, 'Column not found', 404);
    }

    // Verify project exists if provided
    if (validatedData.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: validatedData.projectId },
      });

      if (!project) {
        return sendError(res, 'Project not found', 404);
      }
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority || 'medium',
        columnId: validatedData.columnId,
        projectId: validatedData.projectId,
        assignedToId: validatedData.assignedToId,
      },
      include: {
        column: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            initials: true,
            avatar: true,
          },
        },
      },
    });

    // Update project progress if task belongs to a project
    if (validatedData.projectId) {
      const projectTasks = await prisma.task.findMany({
        where: { projectId: validatedData.projectId },
      });
      const completedCount = projectTasks.filter((t) => t.completed).length;
      const progress = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0;

      await prisma.project.update({
        where: { id: validatedData.projectId },
        data: { progress },
      });
    }

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'task_created',
        description: `Task "${task.title}" was created`,
        userId: req.userId,
        projectId: validatedData.projectId || null,
        taskId: task.id,
      },
    });

    sendSuccess(res, task, 'Task created successfully', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors[0].message, 400);
    }
    throw error;
  }
});

// Update task
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.id;
    const validatedData = updateTaskSchema.parse(req.body);

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return sendError(res, 'Task not found', 404);
    }

    // Verify column exists if being updated
    if (validatedData.columnId) {
      const column = await prisma.column.findUnique({
        where: { id: validatedData.columnId },
      });

      if (!column) {
        return sendError(res, 'Column not found', 404);
      }
    }

    // Update task
    const updateData: any = { ...validatedData };
    if (validatedData.assignedToId === null) {
      updateData.assignedToId = null;
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        column: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            initials: true,
            avatar: true,
          },
        },
      },
    });

    // Update project progress if task belongs to a project
    if (existingTask.projectId) {
      const projectTasks = await prisma.task.findMany({
        where: { projectId: existingTask.projectId },
      });
      const completedCount = projectTasks.filter((t) => t.completed).length;
      const progress = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0;

      await prisma.project.update({
        where: { id: existingTask.projectId },
        data: { progress },
      });
    }

    // Create activity log
    const activityType = validatedData.completed ? 'task_completed' : 'task_updated';
    await prisma.activity.create({
      data: {
        type: activityType,
        description: validatedData.completed
          ? `Task "${task.title}" was completed`
          : `Task "${task.title}" was updated`,
        userId: req.userId,
        projectId: existingTask.projectId || null,
        taskId: task.id,
      },
    });

    sendSuccess(res, task, 'Task updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors[0].message, 400);
    }
    throw error;
  }
});

// Move task to different column
router.patch('/:id/move', async (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.id;
    const validatedData = moveTaskSchema.parse(req.body);

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return sendError(res, 'Task not found', 404);
    }

    // Verify column exists
    const column = await prisma.column.findUnique({
      where: { id: validatedData.columnId },
    });

    if (!column) {
      return sendError(res, 'Column not found', 404);
    }

    // Update task column
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        columnId: validatedData.columnId,
      },
      include: {
        column: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            initials: true,
            avatar: true,
          },
        },
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'task_updated',
        description: `Task "${task.title}" was moved to "${column.title}"`,
        userId: req.userId,
        projectId: existingTask.projectId || null,
        taskId: task.id,
      },
    });

    sendSuccess(res, task, 'Task moved successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors[0].message, 400);
    }
    throw error;
  }
});

// Delete task
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.id;

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return sendError(res, 'Task not found', 404);
    }

    const projectId = task.projectId;

    await prisma.task.delete({
      where: { id: taskId },
    });

    // Update project progress
    if (projectId) {
      const projectTasks = await prisma.task.findMany({
        where: { projectId },
      });
      const completedCount = projectTasks.filter((t) => t.completed).length;
      const progress = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0;

      await prisma.project.update({
        where: { id: projectId },
        data: { progress },
      });
    }

    sendSuccess(res, null, 'Task deleted successfully');
  } catch (error) {
    throw error;
  }
});

export default router;

