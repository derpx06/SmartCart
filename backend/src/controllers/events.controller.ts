import type { Request, Response } from 'express';

import Product from '../models/Product';
import RecentlyViewed from '../models/RecentlyViewed';

function getViewer(req: Request): { userId?: string; deviceId?: string } {
  const userId = req.user?.userId ? String(req.user.userId) : '';
  const deviceId = typeof req.headers['x-device-id'] === 'string' ? req.headers['x-device-id'].trim() : '';
  return {
    ...(userId ? { userId } : {}),
    ...(!userId && deviceId ? { deviceId } : {}),
  };
}

export const recordProductView = async (req: Request, res: Response): Promise<void> => {
  const { productId } = req.body ?? {};
  const id = typeof productId === 'string' ? productId.trim() : '';
  if (!id) {
    res.status(400).json({ error: 'productId is required' });
    return;
  }

  const viewer = getViewer(req);
  if (!viewer.userId && !viewer.deviceId) {
    res.status(200).json({ ok: true });
    return;
  }

  try {
    const product = await Product.findById(id).lean();
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const payload = {
      ...viewer,
      productId: id,
      slug: typeof (product as any).slug === 'string' ? (product as any).slug : '',
      category: typeof (product as any).category === 'string' ? (product as any).category : '',
      priceAtView: Number((product as any)?.price?.selling ?? 0) || 0,
      viewedAt: new Date(),
    };

    const filter = viewer.userId ? { userId: viewer.userId, productId: id } : { deviceId: viewer.deviceId, productId: id };
    await RecentlyViewed.updateOne(filter as any, { $set: payload }, { upsert: true });

    // Keep list bounded per viewer.
    const pruneFilter = viewer.userId ? { userId: viewer.userId } : { deviceId: viewer.deviceId };
    const docs = await RecentlyViewed.find(pruneFilter as any).sort({ viewedAt: -1 }).select('_id').skip(60).limit(200).lean();
    if (docs.length) {
      await RecentlyViewed.deleteMany({ _id: { $in: docs.map((d: any) => d._id) } });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('recordProductView failed:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

