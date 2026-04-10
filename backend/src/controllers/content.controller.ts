import type { Request, Response } from 'express';

import {
  getHomeContent,
  getProductDetail,
  getRecipeContent,
  getRegistryContent,
  listOrdersForUser,
  submitProductReview,
} from '../services/storefront.service';

export const getHome = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await getHomeContent(req));
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const product = await getProductDetail(req, slug);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createProductReview = async (req: Request, res: Response): Promise<void> => {
  const { rating, title, body, authorName } = req.body ?? {};
  const productId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsedRating = Number(rating);
  const safeTitle = typeof title === 'string' ? title.trim() : '';
  const safeBody = typeof body === 'string' ? body.trim() : '';

  if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    return;
  }

  if (!safeTitle) {
    res.status(400).json({ error: 'Review title is required.' });
    return;
  }

  if (!safeBody) {
    res.status(400).json({ error: 'Review details are required.' });
    return;
  }

  try {
    const product = await submitProductReview(req, productId, {
      rating: parsedRating,
      title: safeTitle,
      body: safeBody,
      authorName: typeof authorName === 'string' ? authorName.trim() : undefined,
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(201).json(product);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getRecipeModules = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json(await getRecipeContent());
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getRegistryModules = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json(await getRegistryContent());
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMobileOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await listOrdersForUser(req));
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};
