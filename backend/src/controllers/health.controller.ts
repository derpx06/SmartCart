import type { Request, Response } from 'express';
import mongoose from 'mongoose';

import { isRedisReady } from '../config/redis';

export const healthCheck = (_req: Request, res: Response): void => {
  res.json({ status: 'ok', message: 'API is running' });
};

export const readinessCheck = async (_req: Request, res: Response): Promise<void> => {
  const mongoReady = mongoose.connection.readyState === 1;
  const redisReady = await isRedisReady();
  const ready = mongoReady && redisReady;

  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not_ready',
    dependencies: {
      mongo: mongoReady ? 'up' : 'down',
      redis: redisReady ? 'up' : 'down',
    },
  });
};
