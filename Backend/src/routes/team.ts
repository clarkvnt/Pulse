import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation schemas
const createTeamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  role: z.string().min(1, 'Role is required').max(100),
  email: z.string().email('Invalid email address'),
  initials: z.string().min(1).max(5).optional(),
  avatar: z.string().optional(),
  status: z.enum(['Active', 'Offline', 'Away']).optional(),
});

const updateTeamMemberSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  initials: z.string().min(1).max(5).optional(),
  avatar: z.string().optional(),
  status: z.enum(['Active', 'Offline', 'Away']).optional(),
  tasksCompleted: z.number().int().min(0).optional(),
});

// Get all team members
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    sendSuccess(res, teamMembers, 'Team members retrieved successfully');
  } catch (error) {
    throw error;
  }
});

// Get team member by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const memberId = parseInt(req.params.id, 10);

    if (isNaN(memberId)) {
      return sendError(res, 'Invalid team member ID', 400);
    }

    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return sendError(res, 'Team member not found', 404);
    }

    sendSuccess(res, member, 'Team member retrieved successfully');
  } catch (error) {
    throw error;
  }
});

// Create team member
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createTeamMemberSchema.parse(req.body);

    // Check if email already exists
    const existingMember = await prisma.teamMember.findUnique({
      where: { email: validatedData.email },
    });

    if (existingMember) {
      return sendError(res, 'Team member with this email already exists', 409);
    }

    // Generate initials if not provided
    const initials =
      validatedData.initials ||
      validatedData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const member = await prisma.teamMember.create({
      data: {
        name: validatedData.name,
        role: validatedData.role,
        email: validatedData.email,
        initials,
        avatar: validatedData.avatar || 'bg-slate-900',
        status: validatedData.status || 'Active',
        tasksCompleted: 0,
      },
    });

    sendSuccess(res, member, 'Team member created successfully', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors[0].message, 400);
    }
    throw error;
  }
});

// Update team member
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const memberId = parseInt(req.params.id, 10);

    if (isNaN(memberId)) {
      return sendError(res, 'Invalid team member ID', 400);
    }

    const validatedData = updateTeamMemberSchema.parse(req.body);

    // Check if member exists
    const existingMember = await prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    if (!existingMember) {
      return sendError(res, 'Team member not found', 404);
    }

    // Check if email is being changed and if it already exists
    if (validatedData.email && validatedData.email !== existingMember.email) {
      const emailExists = await prisma.teamMember.findUnique({
        where: { email: validatedData.email },
      });

      if (emailExists) {
        return sendError(res, 'Team member with this email already exists', 409);
      }
    }

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

    const member = await prisma.teamMember.update({
      where: { id: memberId },
      data: updateData,
    });

    sendSuccess(res, member, 'Team member updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors[0].message, 400);
    }
    throw error;
  }
});

// Delete team member
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const memberId = parseInt(req.params.id, 10);

    if (isNaN(memberId)) {
      return sendError(res, 'Invalid team member ID', 400);
    }

    // Check if member exists
    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return sendError(res, 'Team member not found', 404);
    }

    await prisma.teamMember.delete({
      where: { id: memberId },
    });

    sendSuccess(res, null, 'Team member deleted successfully');
  } catch (error) {
    throw error;
  }
});

export default router;

