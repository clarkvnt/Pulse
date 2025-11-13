import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(500).optional(),
  dueDate: z
    .string()
    .refine((val) => !val || !isNaN(new Date(val).getTime()), { message: 'Invalid date format' })
    .optional()
    .or(z.string().length(0)),
  ownerId: z.number().int().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  status: z.enum(['Started', 'In progress', 'On track', 'Almost done', 'Completed']).optional(),
  dueDate: z
    .string()
    .refine((val) => !val || !isNaN(new Date(val).getTime()), { message: 'Invalid date format' })
    .optional()
    .or(z.string().length(0)),
  ownerId: z.number().int().optional(),
});

// Get all projects
router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: {
          select: { id: true, name: true, email: true, initials: true, avatar: true },
        },
        tasks: { select: { id: true, completed: true } },
        columns: { orderBy: { order: 'asc' } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedProjects = projects.map((project) => ({
      ...project,
      tasks: { completed: project.tasks.filter((t) => t.completed).length, total: project.tasks.length },
    }));

    sendSuccess(res, formattedProjects, 'Projects retrieved successfully');
  } catch (error) {
    throw error;
  }
});

// Get project by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    if (isNaN(projectId)) return sendError(res, 'Invalid project ID', 400);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { id: true, name: true, email: true, initials: true, avatar: true } },
        tasks: {
          include: { assignedTo: { select: { id: true, name: true, email: true, initials: true, avatar: true } }, column: true },
          orderBy: { createdAt: 'desc' },
        },
        columns: { orderBy: { order: 'asc' } },
      },
    });

    if (!project) return sendError(res, 'Project not found', 404);

    sendSuccess(res, { ...project, tasks: { completed: project.tasks.filter((t) => t.completed).length, total: project.tasks.length } }, 'Project retrieved successfully');
  } catch (error) {
    throw error;
  }
});

// Create project
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createProjectSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        ownerId: validatedData.ownerId || req.userId,
        progress: 0,
        status: 'Started',
      },
      include: { owner: true, tasks: true, columns: true },
    });

    // Default columns
    const defaultColumns = [
      { title: 'To Do', color: '#94a3b8', order: 0 },
      { title: 'In Progress', color: '#3b82f6', order: 1 },
      { title: 'Review', color: '#f59e0b', order: 2 },
      { title: 'Done', color: '#10b981', order: 3 },
    ];

    await prisma.column.createMany({ data: defaultColumns.map((col) => ({ ...col, projectId: project.id })) });

    await prisma.activity.create({
      data: { type: 'project_created', description: `Project "${project.name}" created`, userId: req.userId, projectId: project.id },
    });

    const projectWithColumns = await prisma.project.findUnique({
      where: { id: project.id },
      include: { owner: true, tasks: true, columns: { orderBy: { order: 'asc' } } },
    });

    sendSuccess(res, projectWithColumns, 'Project created successfully', 201);
  } catch (error) {
    if (error instanceof z.ZodError) return sendError(res, error.errors[0].message, 400);
    throw error;
  }
});

// Update project
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    if (isNaN(projectId)) return sendError(res, 'Invalid project ID', 400);

    const validatedData = updateProjectSchema.parse(req.body);

    const existingProject = await prisma.project.findUnique({ where: { id: projectId } });
    if (!existingProject) return sendError(res, 'Project not found', 404);

    const updateData: any = { ...validatedData };
    if (validatedData.dueDate === '') updateData.dueDate = null;
    else if (validatedData.dueDate) updateData.dueDate = new Date(validatedData.dueDate);

    if (validatedData.progress === undefined) {
      const tasks = await prisma.task.findMany({ where: { projectId } });
      const completedCount = tasks.filter((t) => t.completed).length;
      updateData.progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : existingProject.progress;
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: { owner: true, tasks: true, columns: { orderBy: { order: 'asc' } } },
    });

    await prisma.activity.create({
      data: { type: 'project_updated', description: `Project "${project.name}" updated`, userId: req.userId, projectId: project.id },
    });

    sendSuccess(res, project, 'Project updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) return sendError(res, error.errors[0].message, 400);
    throw error;
  }
});

// Delete project
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    if (isNaN(projectId)) return sendError(res, 'Invalid project ID', 400);

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return sendError(res, 'Project not found', 404);

    if (project.ownerId !== req.userId && req.userRole !== 'admin') return sendError(res, 'Forbidden: Only project owner or admin can delete project', 403);

    await prisma.project.delete({ where: { id: projectId } });

    sendSuccess(res, null, 'Project deleted successfully');
  } catch (error) {
    throw error;
  }
});

export default router;
