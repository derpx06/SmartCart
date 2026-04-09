import type { Request, Response } from 'express';

import Feed from '../models/Feed';
import Product from '../models/Product';
import Sku from '../models/Sku';

export const getFeed = async (_req: Request, res: Response): Promise<void> => {
  try {
    const feed = await Feed.findOne({}, '-_id -__v').lean();
    if (!feed) {
      res.json({ items: [] });
      return;
    }

    res.json({ items: feed.items });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSkus = async (_req: Request, res: Response): Promise<void> => {
  try {
    const skus = await Sku.find({}, '-_id -__v').lean();
    res.json(skus);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find().lean();
    res.json(products);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};
