import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import User from '../models/User';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body ?? {};

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, env.jwtSecret, { expiresIn: '1h' });
    res.json({ token, userId: user.id, name: user.name });
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
