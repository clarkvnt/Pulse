import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../config/database.js';
import { config } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'project_manager', 'team_member', 'viewer']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) return sendError(res, 'User with this email already exists', 409);

    const hashedPassword = await bcrypt.hash(validatedData.password, config.bcrypt.rounds);

    const initials = validatedData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role || 'team_member',
        initials,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        initials: true,
        status: true,
        createdAt: true,
      },
    });

    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, config.jwt.secret as string, { expiresIn: config.jwt.expire });

    sendSuccess(res, { user, token }, 'User registered successfully', 201);
  } catch (error) {
    if (error instanceof z.ZodError) return sendError(res, error.errors[0].message, 400);
    sendError(res, (error as any).message || 'Server error', 500);
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user || !user.password) return sendError(res, 'Invalid email or password', 401);

    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
    if (!isPasswordValid) return sendError(res, 'Invalid email or password', 401);

    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, config.jwt.secret as string, { expiresIn: config.jwt.expire });

    const { password, ...userWithoutPassword } = user;

    sendSuccess(res, { user: userWithoutPassword, token }, 'Login successful');
  } catch (error) {
    if (error instanceof z.ZodError) return sendError(res, error.errors[0].message, 400);
    sendError(res, (error as any).message || 'Server error', 500);
  }
});

// Get current user (protected)
router.get('/me', async (_req: Request, res: Response) => {
  try {
    const authHeader = _req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer '))
      return sendError(res, 'No token provided', 401);

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: number };

      const user = await prisma.user.findUnique({
        where: { id: Number(decoded.userId) }, // ✅ convert to number
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
    } catch (_error) {
      return sendError(res, 'Invalid or expired token', 401);
    }
  } catch (error) {
    sendError(res, (error as any).message || 'Server error', 500);
  }
});

export default router;
