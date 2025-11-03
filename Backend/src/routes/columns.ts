import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation schemas
const createColumnSchema = z.object({
  title: z.string().min(1, 'Column title is required').max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color').optional(),
  projectId: z.number().int().optional(),
  order: z.number().int().optional(),
});

const updateColumnSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  order: z.number().int().optional(),
});

const reorderColumnsSchema = z.object({
  columns: z.array(
    z.object({
      id: z.string().uuid(),
      order: z.number().int(),
    })
  ),
});

// Get all columns (optionally filtered by project)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.query.projectId ? parseInt(req.query.projectId as string, 10) : undefined;

    const columns = await prisma.column.findMany({
      where: {
        ...(projectId && { projectId }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                initials: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    sendSuccess(res, columns, 'Columns retrieved successfully');
  } catch (error) {
    throw error;
  }
});

// Get column by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const columnId = req.params.id;

    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        tasks: {
          include: {
            assignedTo: {
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
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!column) {
      return sendError(res, 'Column not found', 404);
    }

    sendSuccess(res, column, 'Column retrieved successfully');
  } catch (error) {
    throw error;
  }
});

// Create column
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createColumnSchema.parse(req.body);

    // Get max order for the project (or default to 0)
    const maxOrder = validatedData.projectId
      ? await prisma.column.findFirst({
          where: { projectId: validatedData.projectId },
          orderBy: { order: 'desc' },
          select: { order: true },
        })
      : null;

    const column = await prisma.column.create({
      data: {
        title: validatedData.title,
        color: validatedData.color || '#94a3b8',
        projectId: validatedData.projectId,
        order: validatedData.order ?? (maxOrder ? maxOrder.order + 1 : 0),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        tasks: true,
      },
    });

    sendSuccess(res, column, 'Column created successfully', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors[0].message, 400);
    }
    throw error;
  }
});

// Update column
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const columnId = req.params.id;
    const validatedData = updateColumnSchema.parse(req.body);

    // Check if column exists
    const existingColumn = await prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!existingColumn) {
      return sendError(res, 'Column not found', 404);
    }

    const column = await prisma.column.update({
      where: { id: columnId },
      data: validatedData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                initials: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    sendSuccess(res, column, 'Column updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors[0].message, 400);
    }
    throw error;
  }
});

// Reorder columns
router.patch('/reorder', async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = reorderColumnsSchema.parse(req.body);

    // Update all columns in a transaction
    await prisma.$transaction(
      validatedData.columns.map((col) =>
        prisma.column.update({
          where: { id: col.id },
          data: { order: col.order },
        })
      )
    );

    // Fetch updated columns
    const columns = await prisma.column.findMany({
      where: {
        id: {
          in: validatedData.columns.map((c) => c.id),
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        tasks: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    sendSuccess(res, columns, 'Columns reordered successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors[0].message, 400);
    }
    throw error;
  }
});

// Delete column
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const columnId = req.params.id;

    // Check if column exists
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: {
        tasks: true,
      },
    });

    if (!column) {
      return sendError(res, 'Column not found', 404);
    }

    // Prevent deletion if column has tasks
    if (column.tasks.length > 0) {
      return sendError(res, 'Cannot delete column with tasks. Please move or delete tasks first.', 400);
    }

    await prisma.column.delete({
      where: { id: columnId },
    });

    sendSuccess(res, null, 'Column deleted successfully');
  } catch (error) {
    throw error;
  }
});

export default router;

