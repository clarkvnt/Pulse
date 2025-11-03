import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation schemas
const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['admin', 'project_manager', 'team_member', 'viewer']).optional(),
  avatar: z.string().url().optional(),
  status: z.enum(['Active', 'Offline', 'Away']).optional(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// Get all users
router.get('/', async (req: AuthRequest, res: Response) => {
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    sendSuccess(res, users, 'Users retrieved successfully');
  } catch (error) {
    throw error;
  }
});

// Get user by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      return sendError(res, 'Invalid user ID', 400);
    }

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

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    throw error;
  }
});

// Update user
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      return sendError(res, 'Invalid user ID', 400);
    }

    // Only allow users to update themselves unless they're admin
    if (userId !== req.userId && req.userRole !== 'admin') {
      return sendError(res, 'Forbidden: You can only update your own profile', 403);
    }

    const validatedData = updateUserSchema.parse(req.body);

    // Update initials if name changed
    const updateData: any = { ...validatedData };
    if (validatedData.name) {
      const initials = validatedData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      updateData.initials = initials;
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
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors[0].message, 400);
    }
    throw error;
  }
});

// Delete user (admin only)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (req.userRole !== 'admin') {
      return sendError(res, 'Forbidden: Only admins can delete users', 403);
    }

    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      return sendError(res, 'Invalid user ID', 400);
    }

    // Prevent self-deletion
    if (userId === req.userId) {
      return sendError(res, 'Cannot delete your own account', 400);
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    sendSuccess(res, null, 'User deleted successfully');
  } catch (error) {
    throw error;
  }
});

export default router;

