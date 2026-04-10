import type { Request, Response } from 'express';

import Feed from '../models/Feed';
import Product from '../models/Product';
import Sku from '../models/Sku';
import { getRelatedProducts } from '../services/relationship.service';
import { rankItems } from '../services/ranking.service';
import { ensureCatalogSeededFromSkus } from '../services/catalogSync.service';
import { ensureProductEmbedding } from '../services/productEmbedding.service';
import redis from "../config/redis";

export const getFeed = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = "feed";

    const cached = await redis.get(cacheKey);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const feed = await Feed.findOne({}, '-_id -__v').lean();

    const response = { items: feed?.items || [] };

    await redis.set(cacheKey, JSON.stringify(response), "EX", 300);

    res.json(response);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSkus = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = "skus";

    const cached = await redis.get(cacheKey);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const skus = await Sku.find({}, '-_id -__v').lean();

    await redis.set(cacheKey, JSON.stringify(skus), "EX", 1800); // 30 min

    res.json(skus);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};


export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const { category, minPrice, maxPrice, search } = req.query;

    const query: any = {};

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query["price.selling"] = {
        ...(minPrice ? { $gte: Number(minPrice) } : {}),
        ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
      };
    }

    if (search) {
      query.name = { $regex: search, $options: "i" }; // basic search
    }

    const cacheKey = `products:${page}:${limit}:${category || "all"}:${minPrice || 0}:${maxPrice || 0}:${search || ""}`;
    const cachedProducts = await redis.get(cacheKey);
    if (cachedProducts) {
      res.json(JSON.parse(cachedProducts));
      return;
    }

    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    await redis.set(
      cacheKey,
      JSON.stringify({
        data: products,
        pagination: {
          page,
          limit,
          total,
          hasNext: page * limit < total,
        },
      }),
      "EX",
      60 // 1 min cache
    );

    res.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        hasNext: page * limit < total,
      },
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = `product:${req.params.id}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const product = await Product.findById(req.params.id)
      .select("name price images category description")
      .lean();

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (!product.embedding || product.embedding.length === 0) {
      try {
        const embedding = await ensureProductEmbedding(product);
        if (embedding.length) {
          await Product.updateOne({ _id: product._id }, { $set: { embedding } });
          product.embedding = embedding;
        }
      } catch {
        // Continue without embedding if it fails.
      }
    }

    await redis.set(cacheKey, JSON.stringify(product), "EX", 300);

    res.json(product);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProductRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureCatalogSeededFromSkus();
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

    const candidates = await Product.find({ _id: { $ne: product._id } }).limit(30).lean();

    const inventory: Record<string, 'IN_STOCK' | 'OUT_OF_STOCK'> = {};
    candidates.forEach((item: any) => {
      const productId = item._id?.toString?.() || item.productId;
      if (!productId) return;
      inventory[productId] = item.stock?.status === 'OUT_OF_STOCK' ? 'OUT_OF_STOCK' : 'IN_STOCK';
    });

    const ranked = rankItems(candidates, {
      state: { ...mockState, inventory },
      semantic: mockSemantic,
      related,
    });

    res.json(ranked);
  } catch (error) {
    console.error('Recommendations failed:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
