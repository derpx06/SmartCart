import type { Request, Response } from 'express';

import redis from '../config/redis';
import { getHomeRow } from '../services/homeRows.service';

function viewerKey(req: Request): string {
  const userId = req.user?.userId ? String(req.user.userId) : '';
  const deviceId = typeof req.headers['x-device-id'] === 'string' ? req.headers['x-device-id'].trim() : '';
  return userId ? `u:${userId}` : deviceId ? `d:${deviceId}` : 'anon';
}

export const getHomeRowById = async (req: Request, res: Response): Promise<void> => {
  try {
    const rowIdRaw = Array.isArray(req.params.rowId) ? req.params.rowId[0] : req.params.rowId;
    const rowId = String(rowIdRaw || '').trim();
    const limit = Number(req.query.limit ?? 10);
    if (!rowId) {
      res.status(400).json({ error: 'rowId is required' });
      return;
    }

    const safeLimit = Math.max(3, Math.min(20, limit));
    const isHistoryDrivenRow =
      rowId === 'recently-viewed' ||
      rowId === 'recently-viewed-alternatives' ||
      rowId === 'price-drops' ||
      rowId === 'because-you-added';
    const bucket = isHistoryDrivenRow ? `:${Math.floor(Date.now() / 15000)}` : '';
    const key = `home_row:${rowId}:${viewerKey(req)}:${safeLimit}${bucket}`;
    const cached = await redis.get(key);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const row = await getHomeRow(req, rowId, limit);
    await redis.set(key, JSON.stringify(row), 'EX', isHistoryDrivenRow ? 20 : 120);
    res.json(row);
  } catch (error) {
    console.error('getHomeRowById failed:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

