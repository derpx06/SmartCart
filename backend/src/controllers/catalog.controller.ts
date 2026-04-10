import type { Request, Response } from 'express';

import Feed from '../models/Feed';
import Product from '../models/Product';
import Sku from '../models/Sku';
import { getRelatedProducts } from '../services/relationship.service';
import { rankItems } from '../services/ranking.service';
import { ensureCatalogSeededFromSkus } from '../services/catalogSync.service';
import { ensureProductEmbedding } from '../services/productEmbedding.service';
import { getCatalogCacheVersion } from '../services/cache.service';
import { NEEDS_MAP } from '../config/semanticMaps';
import redis from "../config/redis";

function mediaUrl(req: Request, path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const imagePath = normalizedPath.startsWith('/images/') ? normalizedPath : `/images${normalizedPath}`;
  return `${req.protocol}://${req.get('host')}${imagePath}`;
}

export const getFeed = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cacheVersion = await getCatalogCacheVersion();
    const cacheKey = `${cacheVersion}:feed`;

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
    const cacheVersion = await getCatalogCacheVersion();
    const cacheKey = `${cacheVersion}:skus`;

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

    const cacheVersion = await getCatalogCacheVersion();
    const cacheKey = `${cacheVersion}:products:${page}:${limit}:${category || "all"}:${minPrice || 0}:${maxPrice || 0}:${search || ""}`;
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
    const cacheVersion = await getCatalogCacheVersion();
    const cacheKey = `${cacheVersion}:product:${req.params.id}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const product = await Product.findById(req.params.id)
      .select("name price images category description model3D")
      .lean();

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (!product.embedding || product.embedding.length === 0) {
      try {
        const embedding = await ensureProductEmbedding(product as any);
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

    const candidateById = new Map<string, any>();
    for (const c of candidates) {
      const id = c._id?.toString?.();
      if (!id) continue;
      candidateById.set(id, c);
    }

    res.json(
      ranked.map((item) => {
        const p = candidateById.get(item.productId);
        const slug = p?.slug || '';
        const image = mediaUrl(req, p?.images?.[0] || '');
        return {
          ...item,
          slug,
          image,
          card: {
            id: item.productId,
            slug,
            title: item.name,
            subtitle: item.category,
            price: item.price,
            imageUrl: image,
            ctaLabel: 'View product',
            route: slug ? `/product/${slug}` : '',
          },
        };
      })
    );
  } catch (error) {
    console.error('Recommendations failed:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

function inferIntentFromCategory(category: string): keyof typeof NEEDS_MAP {
  const c = String(category || '').toLowerCase();
  if (/(cook|kitchen|pan|pot|knife|spatula)/.test(c)) return 'kitchen_setup';
  if (/(bake|oven|muffin|tray)/.test(c)) return 'baking';
  if (/(bed|bedding|mattress|pillow|blanket)/.test(c)) return 'bed_setup';
  if (/(decor|furniture|home)/.test(c)) return 'home_setup';
  return 'cooking';
}

export const getProductRecommendationRows = async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureCatalogSeededFromSkus();
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const related = await getRelatedProducts(product._id.toString());
    const candidates = await Product.find({ _id: { $ne: product._id } }).limit(60).lean();
    const candidateById = new Map<string, any>();
    for (const c of candidates) {
      const id = c._id?.toString?.();
      if (id) candidateById.set(id, c);
    }

    const toItem = (p: any, reason: string, score = 0) => ({
      productId: p._id.toString(),
      slug: p.slug || '',
      image: mediaUrl(req, p.images?.[0] || ''),
      name: p.name,
      category: p.category,
      price: Number(p.price?.selling ?? 0),
      score,
      reasons: [reason],
    });

    const relatedSorted = [...related].sort((a: any, b: any) => b.score - a.score);
    const fbtRaw = relatedSorted.filter((r: any) => r.type === 'co_occurrence');
    const fbtPool = (fbtRaw.length ? fbtRaw : relatedSorted).slice(0, 50);
    const frequentlyBoughtTogether = fbtPool
      .map((r: any) => {
        const p = candidateById.get(r.productId);
        return p ? toItem(p, 'Frequently bought together', Number(r.score || 0)) : null;
      })
      .filter(Boolean);

    const intent = inferIntentFromCategory(String(product.category || ''));
    const needs = NEEDS_MAP[intent] || NEEDS_MAP.cooking;
    const completeSetup = candidates
      .filter((c: any) => {
        const text = `${c.name} ${c.category} ${c.description || ''}`.toLowerCase();
        return needs.some((n) => text.includes(String(n).toLowerCase()));
      })
      .slice(0, 50)
      .map((p: any) => toItem(p, 'Completes your setup'));

    const semanticRaw = relatedSorted.filter((r: any) => r.type === 'embedding');
    const semanticPool = (semanticRaw.length ? semanticRaw : relatedSorted).slice(0, 50);
    const semanticSimilar = semanticPool
      .map((r: any) => {
        const p = candidateById.get(r.productId);
        return p ? toItem(p, 'Semantic match', Number(r.score || 0)) : null;
      })
      .filter(Boolean);

    const globalSeen = new Set<string>();
    const dedupeAndTrack = (items: any[]) => {
      return items.filter((i) => {
        if (!i?.productId || globalSeen.has(i.productId)) return false;
        globalSeen.add(i.productId);
        return true;
      });
    };

    res.json({
      rows: [
        {
          id: 'frequently-bought-together',
          title: 'Frequently Bought Together',
          subtitle: 'Customers pair these with this product.',
          items: dedupeAndTrack(frequentlyBoughtTogether).slice(0, 8),
        },
        {
          id: 'complete-your-setup',
          title: 'Complete Your Setup',
          subtitle: 'Missing essentials that make this setup complete.',
          items: dedupeAndTrack(completeSetup).slice(0, 8),
        },
        {
          id: 'semantic-similar',
          title: 'Similar Items (Semantic)',
          subtitle: 'Close matches by meaning, use, and style.',
          items: dedupeAndTrack(semanticSimilar).slice(0, 8),
        },
      ],
    });
  } catch (error) {
    console.error('getProductRecommendationRows failed:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, body, rating, author } = req.body;

    // Auth user if possible
    const userId = (req as any).user?.userId || 'anonymous';

    // Find product
    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Add review
    const newReview = {
      userId,
      author: author || 'Anonymous User',
      title,
      body,
      rating: Number(rating) || 5,
      verified: !!(req as any).user
    };

    product.reviews.push(newReview as any);

    // Recalculate average
    const currentCount = product.ratings?.count || 0;
    const currentAvg = product.ratings?.average || 0;

    const newCount = currentCount + 1;
    const newAvg = ((currentAvg * currentCount) + newReview.rating) / newCount;

    product.ratings = {
      average: newAvg,
      count: newCount
    };

    await product.save();

    res.json({ success: true, message: 'Review added successfully' });
  } catch (error) {
    console.error('Failed to add review:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
};
