import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  jwt.verify(token, env.jwtSecret, (err, user) => {
    if (err || !user || typeof user === 'string') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    req.user = user as Request['user'];
    next();
  });
};

export const authenticateOptional = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    req.user = undefined;
    next();
    return;
  }

  jwt.verify(token, env.jwtSecret, (err, user) => {
    if (err || !user || typeof user === 'string') {
      req.user = undefined;
      next();
      return;
    }

    req.user = user as Request['user'];
    next();
  });
};
