import type { Request } from 'express';

import Product from '../models/Product';
import Cart from '../models/Cart';
import RecentlyViewed from '../models/RecentlyViewed';
import { getRelatedProducts } from './relationship.service';
import { buildSmartCartState } from './stateBuilder.service';
import { getSemanticState } from './semantic.service';
import { rankItems } from './ranking.service';

type ProductCard = {
  id: string;
  slug?: string;
  name: string;
  price: string;
  rating: number;
  image: string;
  ctaLabel?: string;
};

export type HomeRowResponse = {
  id: string;
  title: string;
  subtitle?: string;
  items: ProductCard[];
  meta?: Record<string, any>;
};

function mediaUrl(req: Request, path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const imagePath = normalizedPath.startsWith('/images/') ? normalizedPath : `/images${normalizedPath}`;
  return `${req.protocol}://${req.get('host')}${imagePath}`;
}

function money(value: number): string {
  return `$${Number(value || 0).toFixed(2)}`;
}

function toCard(req: Request, product: any, ctaLabel?: string): ProductCard {
  return {
    id: product._id.toString(),
    slug: product.slug,
    name: product.name,
    price: money(Number(product.price?.selling ?? 0)),
    rating: Number(product.ratings?.average ?? 4.6),
    image: mediaUrl(req, product.images?.[0] || ''),
    ...(ctaLabel ? { ctaLabel } : {}),
  };
}

function dedupeById(items: ProductCard[]): ProductCard[] {
  const seen = new Set<string>();
  const out: ProductCard[] = [];
  for (const it of items) {
    if (!it?.id) continue;
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    out.push(it);
  }
  return out;
}

function getViewerKey(req: Request): { userId?: string; deviceId?: string } {
  const userId = req.user?.userId ? String(req.user.userId) : '';
  const deviceId = typeof req.headers['x-device-id'] === 'string' ? req.headers['x-device-id'].trim() : '';
  return {
    ...(userId ? { userId } : {}),
    ...(!userId && deviceId ? { deviceId } : {}),
  };
}

async function getRecentViews(req: Request, limit: number): Promise<any[]> {
  const viewer = getViewerKey(req);
  if (!viewer.userId && !viewer.deviceId) return [];
  const filter = viewer.userId ? { userId: viewer.userId } : { deviceId: viewer.deviceId };
  return RecentlyViewed.find(filter as any).sort({ viewedAt: -1 }).limit(limit).lean();
}

async function getCartProductIds(req: Request): Promise<string[]> {
  const userId = req.user?.userId ? String(req.user.userId) : '';
  if (!userId) return [];
  const cart = await Cart.findOne({ userId }).lean();
  const ids = (cart?.items || []).map((it: any) => it.productId?.toString?.()).filter(Boolean);
  return ids;
}

async function getSmartCartRanked(req: Request, limit: number) {
  const state = await buildSmartCartState(req);
  const semantic = await getSemanticState(state);
  const cartIds = state.cart.items.map((i) => i.productId);
  const candidates = await Product.find({ _id: { $nin: cartIds } }).limit(80).lean();
  const related = cartIds.length ? await getRelatedProducts(cartIds[0]) : [];
  const ranked = rankItems(candidates, { state, semantic, related }).slice(0, Math.max(limit, 12));
  const byId = new Map<string, any>();
  candidates.forEach((p: any) => {
    const id = p._id?.toString?.();
    if (id) byId.set(id, p);
  });
  const products = ranked
    .map((r) => byId.get(r.productId))
    .filter(Boolean)
    .map((p) => toCard(req, p, 'Add to cart'));
  return { state, semantic, products: dedupeById(products) };
}

export async function getHomeRow(req: Request, rowId: string, limit: number): Promise<HomeRowResponse> {
  const safeLimit = Math.max(3, Math.min(20, Number(limit || 10)));

  if (rowId === 'recently-viewed') {
    const views = await getRecentViews(req, 30);
    if (!views.length) {
      return { id: rowId, title: 'Recently viewed', subtitle: 'Items you looked at recently.', items: [] };
    }
    const ids = views.map((v: any) => v.productId).filter(Boolean);
    const products = await Product.find({ _id: { $in: ids } }).lean();
    const byId = new Map(products.map((p: any) => [p._id.toString(), p]));
    const ordered = ids.map((id: string) => byId.get(id)).filter(Boolean);
    return {
      id: rowId,
      title: 'Recently viewed',
      subtitle: 'Pick up where you left off.',
      items: dedupeById(ordered.map((p: any) => toCard(req, p, 'View'))).slice(0, safeLimit),
    };
  }

  if (rowId === 'complete-setup') {
    const { semantic, products } = await getSmartCartRanked(req, safeLimit);
    return {
      id: rowId,
      title: 'Complete your setup',
      subtitle: semantic?.summary || 'Finish what you started with the right essentials.',
      items: products.slice(0, safeLimit),
      meta: { intent: semantic?.primary_intent, completionPercent: semantic?.completionPercent ?? 0 },
    };
  }

  if (rowId === 'bundles') {
    const state = await buildSmartCartState(req);
    const semantic = await getSemanticState(state);
    // Reuse bundle logic already computed in /smartcart/state by calling the same bundle service would require more wiring;
    // For now, show ranked items that fill missing needs.
    const needs = semantic.missingItems || semantic.needs || [];
    const candidates = await Product.find({}).limit(120).lean();
    const fillers = candidates
      .filter((p: any) => needs.some((n: string) => `${p.name} ${p.category}`.toLowerCase().includes(String(n).toLowerCase())))
      .slice(0, safeLimit)
      .map((p: any) => toCard(req, p, 'Add to cart'));
    return {
      id: rowId,
      title: 'Bundles you can finish',
      subtitle: 'Complete your kits with a few high-signal adds.',
      items: dedupeById(fillers).slice(0, safeLimit),
      meta: { missing: needs.slice(0, 6), completionPercent: semantic.completionPercent ?? 0 },
    };
  }

  if (rowId === 'because-you-added') {
    const cartIds = await getCartProductIds(req);
    if (!cartIds.length) {
      return { id: rowId, title: 'Because you added something', subtitle: 'Add items to see pairings.', items: [] };
    }
    const related = await getRelatedProducts(cartIds[0]);
    const relatedIds = related.map((r) => r.productId).slice(0, 40);
    const products = await Product.find({ _id: { $in: relatedIds } }).lean();
    const byId = new Map(products.map((p: any) => [p._id.toString(), p]));
    const cards = related.map((r) => byId.get(r.productId)).filter(Boolean).map((p: any) => toCard(req, p, 'Add to cart'));
    return {
      id: rowId,
      title: 'Because you added X',
      subtitle: 'Frequently paired selections based on your cart.',
      items: dedupeById(cards).slice(0, safeLimit),
    };
  }

  if (rowId === 'refill-soon') {
    const keys = ['oil', 'spice', 'pantry', 'clean', 'soap', 'towel'];
    const products = await Product.find({}).limit(120).lean();
    const cards = products
      .filter((p: any) => keys.some((k) => `${p.name} ${p.description || ''} ${p.category}`.toLowerCase().includes(k)))
      .slice(0, safeLimit)
      .map((p: any) => toCard(req, p, 'Add to cart'));
    return {
      id: rowId,
      title: 'Buy again / refill soon',
      subtitle: 'Quick replenishments that keep your setup ready.',
      items: dedupeById(cards).slice(0, safeLimit),
    };
  }

  if (rowId === 'trending') {
    const products = await Product.find({}).sort({ 'ratings.count': -1, 'ratings.average': -1 }).limit(60).lean();
    return {
      id: rowId,
      title: 'Trending right now',
      subtitle: 'Top picks customers are choosing this week.',
      items: dedupeById(products.map((p: any) => toCard(req, p, 'View'))).slice(0, safeLimit),
    };
  }

  if (rowId === 'price-drops') {
    const views = await getRecentViews(req, 50);
    if (!views.length) return { id: rowId, title: 'Price drop alerts', subtitle: 'View products to unlock alerts.', items: [] };
    const ids = views.map((v: any) => v.productId).filter(Boolean);
    const products = await Product.find({ _id: { $in: ids } }).lean();
    const byId = new Map(products.map((p: any) => [p._id.toString(), p]));
    const drops = views
      .map((v: any) => {
        const p = byId.get(v.productId);
        if (!p) return null;
        const current = Number(p.price?.selling ?? 0);
        const prev = Number(v.priceAtView ?? 0);
        if (!(prev > 0 && current > 0 && current < prev)) return null;
        return toCard(req, p, 'Add to cart');
      })
      .filter(Boolean) as ProductCard[];
    return { id: rowId, title: 'Price drop alerts', subtitle: 'Items you viewed are now a better deal.', items: dedupeById(drops).slice(0, safeLimit) };
  }

  if (rowId === 'premium-picks') {
    const views = await getRecentViews(req, 20);
    const categories = [...new Set(views.map((v: any) => v.category).filter(Boolean))];
    const q = categories.length ? { category: { $in: categories } } : {};
    const products = await Product.find(q as any).sort({ 'price.selling': -1 }).limit(60).lean();
    return {
      id: rowId,
      title: 'Premium picks for you',
      subtitle: 'Higher-end pieces aligned with your taste.',
      items: dedupeById(products.map((p: any) => toCard(req, p, 'View'))).slice(0, safeLimit),
    };
  }

  if (rowId === 'fast-delivery') {
    const products = await Product.find({ 'stock.status': { $ne: 'OUT_OF_STOCK' } }).limit(80).lean();
    return {
      id: rowId,
      title: 'Fast delivery today',
      subtitle: 'In-stock pieces ready to ship.',
      items: dedupeById(products.map((p: any) => toCard(req, p, 'Add to cart'))).slice(0, safeLimit),
    };
  }

  if (rowId === 'new-arrivals') {
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(60).lean();
    return {
      id: rowId,
      title: 'New arrivals in your interests',
      subtitle: 'Fresh additions you’re likely to love.',
      items: dedupeById(products.map((p: any) => toCard(req, p, 'View'))).slice(0, safeLimit),
    };
  }

  if (rowId === 'recently-viewed-alternatives') {
    const views = await getRecentViews(req, 12);
    if (!views.length) return { id: rowId, title: 'Recently viewed, now better options', subtitle: 'View products to unlock better options.', items: [] };
    const relatedIds: string[] = [];
    const viewedIds = new Set<string>();
    const viewedCategories: string[] = [];
    for (const v of views) {
      if (v?.productId) viewedIds.add(String(v.productId));
      if (v?.category) viewedCategories.push(String(v.category));
      const rel = await getRelatedProducts(v.productId);
      rel.slice(0, 6).forEach((r) => relatedIds.push(r.productId));
    }
    let uniq = [...new Set(relatedIds)].filter((id) => !viewedIds.has(id)).slice(0, 80);
    let products: any[] = uniq.length ? await Product.find({ _id: { $in: uniq } }).lean() : [];

    // Fallback when relationship/embeddings aren't available yet.
    if (products.length < 3) {
      const cats = [...new Set(viewedCategories)].filter(Boolean).slice(0, 3);
      const q = cats.length ? { category: { $in: cats } } : {};
      const fallback = await Product.find(q as any).sort({ createdAt: -1 }).limit(30).lean();
      const fallbackCards = fallback
        .filter((p: any) => !viewedIds.has(p._id?.toString?.() || ''))
        .map((p: any) => p);
      products = [...products, ...fallbackCards];
    }
    return {
      id: rowId,
      title: 'Recently viewed, now better options',
      subtitle: 'Alternatives with stronger value and fit.',
      items: dedupeById(products.map((p: any) => toCard(req, p, 'View'))).slice(0, safeLimit),
    };
  }

  return { id: rowId, title: 'Recommendations', subtitle: 'Curated selections for you.', items: [] };
}

