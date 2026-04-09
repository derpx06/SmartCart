import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import User from '../models/User';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body ?? {};

  try {
    const user = await User.findOne({ email });
    const passwordMatches = user
      ? (user.password === password || (await bcrypt.compare(password, user.password).catch(() => false)))
      : false;

    if (!user || !passwordMatches) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, env.jwtSecret, { expiresIn: '1h' });
    res.json({ token, userId: user.id, name: user.name });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body ?? {};

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required' });
    return;
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }

    const userCount = await User.countDocuments();
    const userId = `user_${String(userCount + 1).padStart(3, '0')}`;
    const hashedPassword = await bcrypt.hash(password, 8);

    const user = await User.create({
      id: userId,
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ userId: user.id }, env.jwtSecret, { expiresIn: '1h' });
    res.status(201).json({ token, userId: user.id, name: user.name });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const profile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId ?? 'user_001';
    const user = await User.findOne({ id: userId }, '-_id -__v -password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};
