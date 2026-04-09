import type { Request, Response } from 'express';

export const healthCheck = (_req: Request, res: Response): void => {
  res.json({ status: 'ok', message: 'API is running' });
};
