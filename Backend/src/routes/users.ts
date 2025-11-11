import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation schema for updating user
const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['admin', 'project_manager', 'team_member', 'viewer']).optional(),
  avatar: z.string().url().optional(),
  status: z.enum(['Active', 'Offline', 'Away']).optional(),
});

// Get all users
router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        initials: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, users, 'Users retrieved successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 'Failed to retrieve users', 500);
  }
});

// Get user by ID
router.get('/:id', async (_req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(res.req.params.id, 10);
    if (isNaN(userId)) return sendError(res, 'Invalid user ID', 400);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        initials: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return sendError(res, 'User not found', 404);

    sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 'Failed to retrieve user', 500);
  }
});

// Update user
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) return sendError(res, 'Invalid user ID', 400);

    // Only allow users to update themselves unless they're admin
    if (userId !== req.userId && req.userRole !== 'admin') {
      return sendError(res, 'Forbidden: You can only update your own profile', 403);
    }

    const validatedData = updateUserSchema.parse(req.body);

    // Update initials if name changed
    const updateData: any = { ...validatedData };
    if (validatedData.name) {
      updateData.initials = validatedData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        initials: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    sendSuccess(res, user, 'User updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) return sendError(res, error.errors[0].message, 400);
    console.error(error);
    sendError(res, 'Failed to update user', 500);
  }
});

// Delete user (admin only)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (req.userRole !== 'admin') return sendError(res, 'Forbidden: Only admins can delete users', 403);

    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) return sendError(res, 'Invalid user ID', 400);

    // Prevent self-deletion
    if (userId === req.userId) return sendError(res, 'Cannot delete your own account', 400);

    await prisma.user.delete({ where: { id: userId } });

    sendSuccess(res, null, 'User deleted successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 'Failed to delete user', 500);
  }
});

export default router;
