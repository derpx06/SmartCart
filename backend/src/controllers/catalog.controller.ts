import type { Request, Response } from 'express';

import Feed from '../models/Feed';
import Product from '../models/Product';
import Sku from '../models/Sku';
import { getRelatedProducts } from '../services/relationship.service';
import { rankItems } from '../services/ranking.service';

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

export const getProductRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Fetching recommendations for product ID:', req.params.id);
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Layer 3: Get dynamic relationship signals for this product
    const related = await getRelatedProducts(product._id.toString());

    // Layer 4: Ranking using a synthesized "browsing" context
    // We mock the state and semantic intent based on the current product
    const mockState: any = {
      cart: { items: [], totalItems: 0, categories: [product.category], totalValue: 0 },
      session: { behavior: 'normal', confidence: 0.8 },
      inventory: {}
    };

    const mockSemantic: any = {
      primary_intent: product.category,
      intent: [product.category],
      needs: [],
      vector: product.embedding
    };

    const candidates = await Product.find({ _id: { $ne: product._id } }).limit(20).lean();
    const ranked = rankItems(candidates, { state: mockState, semantic: mockSemantic, related });

    res.json(ranked);
  } catch (error) {
    console.error('Recommendations failed:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
