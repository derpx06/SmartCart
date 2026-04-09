import type { Request, Response } from 'express';

import { getHomeContent, getProductDetail, getRecipeContent, getRegistryContent, listOrdersForUser } from '../services/storefront.service';

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
