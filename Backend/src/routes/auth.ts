import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { z } from 'zod';

const router = Router();

// Validation schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

// Helper to sign JWT
const signJWT = (payload: object | string) => {
  const secret = process.env.JWT_SECRET!;
  const options: SignOptions = { expiresIn: '1h' }; // 'expiresIn' is valid with SignOptions
  return jwt.sign(payload, secret, options);
};

// Register
router.post('/register', async (req, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return sendError(res, 'Email already in use', 400);

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { ...data, password: hashed },
      select: { id: true, name: true, email: true },
    });

    const token = signJWT({ id: user.id, email: user.email });
    sendSuccess(res, { user, token }, 'User registered successfully');
  } catch (error) {
    if (error instanceof z.ZodError) return sendError(res, error.errors[0].message, 400);
    sendError(res, 'Registration failed', 500);
  }
});

// Login
router.post('/login', async (req, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return sendError(res, 'Invalid credentials', 400);

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) return sendError(res, 'Invalid credentials', 400);

    const token = signJWT({ id: user.id, email: user.email });
    sendSuccess(res, { user: { id: user.id, name: user.name, email: user.email }, token }, 'Login successful');
  } catch (error) {
    if (error instanceof z.ZodError) return sendError(res, error.errors[0].message, 400);
    sendError(res, 'Login failed', 500);
  }
});

export default router;
