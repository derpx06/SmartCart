import type { Request } from 'express';
import ChatMessage from '../models/ChatMessage';
import ChatSession from '../models/ChatSession';
import Product from '../models/Product';
import Cart from '../models/Cart';
import { buildSmartCartState } from './stateBuilder.service';
import { getSemanticState } from './semantic.service';
import { cosineSimilarity } from '../utils/vector';
import { embedText } from './embedding.service';
import { generateAssistantReply } from './llm.service';
import { searchQdrantProductIds } from './qdrant.service';

type ChatResponse = {
  sessionId: string;
  message: string;
  products: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    slug: string;
  }>;
  productCards: Array<{
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    price: number;
    imageUrl: string;
    ctaLabel: string;
    route: string;
  }>;
  intent?: string;
  needs?: string[];
  action?: {
    type: 'ADD_TO_CART';
    status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'CANCELLED';
    productId: string;
    slug: string;
    quantity: number;
    message: string;
  };
};

type ProductCard = ChatResponse['productCards'][number];

function mediaUrl(req: Request, path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const imagePath = normalizedPath.startsWith('/images/') ? normalizedPath : `/images${normalizedPath}`;
  return `${req.protocol}://${req.get('host')}${imagePath}`;
}

function productSummary(req: Request, product: any) {
  return {
    id: product._id.toString(),
    slug: product.slug,
    name: product.name,
    price: Number(product.price?.selling ?? 0),
    category: product.category,
    image: mediaUrl(req, product.images?.[0] || ''),
  };
}

function toProductCard(product: ReturnType<typeof productSummary>): ProductCard {
  return {
    id: product.id,
    slug: product.slug,
    title: product.name,
    subtitle: product.category,
    price: product.price,
    imageUrl: product.image,
    ctaLabel: 'View product',
    route: `/product/${product.slug}`,
  };
}

function chunkMessage(message: string, size = 12): string[] {
  const words = message.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += size) {
    chunks.push(words.slice(i, i + size).join(' '));
  }
  return chunks.length ? chunks : [message];
}

async function ensureSession(sessionId: string, userId?: string) {
  const existing = await ChatSession.findOne({ sessionId }).lean();
  if (existing) return;
  await ChatSession.create({
    sessionId,
    userId,
    title: 'SmartCart Assistant',
  });
}

async function fetchContext(req: Request, userId?: string) {
  if (!userId) return null;
  const patchedReq = Object.assign(req, { user: { userId } });
  const state = await buildSmartCartState(patchedReq as Request);
  const semantic = await getSemanticState(state);
  const cart = await Cart.findOne({ userId }).populate('items.productId').lean();
  return { state, semantic, cart };
}

async function getRecentConversation(sessionId: string, limit = 8) {
  const messages = await ChatMessage.find({ sessionId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return messages
    .reverse()
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
}

async function rankProducts(query: string, limit = 6) {
  const fallbackQuery = {
    slug: { $exists: true, $nin: [null, ''] },
    'stock.status': { $ne: 'OUT_OF_STOCK' },
    'stock.quantity': { $gt: 0 },
  } as const;

  const queryEmbedding = await embedText(query);
  const q = String(query || '').toLowerCase();
  const categoryHints = [
    'chair',
    'sofa',
    'furniture',
    'pan',
    'cookware',
    'knife',
    'bakeware',
    'decor',
    'lighting',
  ].filter((hint) => q.includes(hint));

  if (categoryHints.length > 0) {
    const hintPattern = categoryHints.join('|');
    const categoryMatches = await Product.find({
      ...fallbackQuery,
      $or: [
        { category: { $regex: hintPattern, $options: 'i' } },
        { subCategory: { $regex: hintPattern, $options: 'i' } },
        { name: { $regex: hintPattern, $options: 'i' } },
      ],
    })
      .limit(limit)
      .lean();
    if (categoryMatches.length > 0) return categoryMatches;
  }

  if (queryEmbedding.length > 0) {
    const qdrantIds = await searchQdrantProductIds(queryEmbedding, Math.max(limit * 2, 12));
    if (qdrantIds.length > 0) {
      const qdrantMatches = await Product.find({
        ...fallbackQuery,
        _id: { $in: qdrantIds },
      }).lean();
      const byId = new Map(qdrantMatches.map((p: any) => [String(p._id), p]));
      const ordered = qdrantIds.map((id) => byId.get(id)).filter(Boolean) as any[];
      if (ordered.length >= limit) return ordered.slice(0, limit);
      if (ordered.length > 0) {
        const sampled = await Product.aggregate([
          { $match: fallbackQuery },
          { $match: { _id: { $nin: ordered.map((p: any) => p._id) } } },
          { $sample: { size: limit } },
        ]);
        return [...ordered, ...(sampled as any[])].slice(0, limit);
      }
    }
  }

  if (!queryEmbedding.length) {
    const fallback = await Product.find(fallbackQuery).limit(limit).lean();
    return fallback;
  }

  const candidates = await Product.find({
    embedding: { $exists: true, $not: { $size: 0 } },
    slug: { $exists: true, $nin: [null, ''] },
  })
    .limit(250)
    .lean();

  const scored = candidates
    .map((p: any) => ({
      product: p,
      score: cosineSimilarity(queryEmbedding, p.embedding || []),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Ignore weak semantic matches; otherwise users can repeatedly get the same irrelevant item.
  const ranked = scored.filter((s) => s.score >= 0.18).map((s) => s.product);
  if (ranked.length >= limit) return ranked.slice(0, limit);

  // Fallback 1: keyword match for cases where embeddings are sparse/missing relevance.
  const tokens = String(query || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .filter((t) => !['the', 'and', 'for', 'with', 'some', 'good', 'best', 'show', 'me', 'recommend'].includes(t))
    .slice(0, 5);

  if (tokens.length > 0) {
    const pattern = tokens.join('|');
    const keywordMatches = await Product.find({
      ...fallbackQuery,
      $or: [
        { name: { $regex: pattern, $options: 'i' } },
        { category: { $regex: pattern, $options: 'i' } },
        { description: { $regex: pattern, $options: 'i' } },
      ],
    })
      .limit(limit)
      .lean();
    if (ranked.length > 0) {
      const seen = new Set(ranked.map((p: any) => String(p._id)));
      const merged = [...ranked, ...keywordMatches.filter((p: any) => !seen.has(String(p._id)))];
      if (merged.length >= limit) return merged.slice(0, limit);
      ranked.splice(0, ranked.length, ...merged);
    } else if (keywordMatches.length > 0) {
      if (keywordMatches.length >= limit) return keywordMatches.slice(0, limit);
      ranked.push(...keywordMatches);
    }
  }

  // Fallback 2: randomize generic options so suggestions don't look static.
  const excludeIds = ranked.map((p: any) => p._id).filter(Boolean);
  const sampled = await Product.aggregate([
    { $match: fallbackQuery },
    ...(excludeIds.length ? [{ $match: { _id: { $nin: excludeIds } } }] : []),
    { $sample: { size: limit } },
  ]);
  if (sampled.length > 0) {
    const merged = [...ranked, ...(sampled as any[])];
    return merged.slice(0, limit);
  }

  // Final fallback for very small catalogs.
  const stable = await Product.find(fallbackQuery).limit(limit).lean();
  if (!ranked.length) return stable;
  const seen = new Set(ranked.map((p: any) => String(p._id)));
  return [...ranked, ...stable.filter((p: any) => !seen.has(String(p._id)))].slice(0, limit);
}

function userAskedForProducts(text: string): boolean {
  const t = String(text || '').trim().toLowerCase();
  if (!t) return false;
  // Explicit commerce / recommendation intent
  const keywords = [
    'recommend',
    'recommendation',
    'suggest',
    'show me',
    'find',
    'buy',
    'shop',
    'product',
    'products',
    'item',
    'items',
    'under $',
    'under ',
    'cheapest',
    'best',
    'top',
    'deal',
    'price',
    'compare',
    'options',
    'pick',
    'gift',
    'build',
    'starter',
    'kit',
    'setup',
  ];
  // Also catch direct quantity + budget shopping asks like "3 under 100"
  const numericBudgetPattern = /\b(\d+)\b.*\bunder\b.*\b(\$?\d+)\b/i;
  return keywords.some((k) => t.includes(k)) || numericBudgetPattern.test(t);
}

function userAskedToAddToCart(text: string): boolean {
  const t = String(text || '').trim().toLowerCase();
  const patterns = [
    'add to cart',
    'add it to cart',
    'add this to cart',
    'put it in cart',
    'put this in cart',
    'i want this',
    'buy this',
    'place this order',
    'order this',
  ];
  return patterns.some((p) => t.includes(p));
}

function userConfirmed(text: string): boolean {
  const t = String(text || '').trim().toLowerCase();
  return ['yes', 'y', 'confirm', 'confirmed', 'place order', 'go ahead', 'do it', 'sure'].includes(t);
}

function userDeclined(text: string): boolean {
  const t = String(text || '').trim().toLowerCase();
  return ['no', 'n', 'cancel', 'stop', 'not now', 'dont', "don't"].includes(t);
}

async function setPendingAddToCart(
  sessionId: string,
  pending:
    | {
        productId: string;
        slug: string;
        quantity: number;
      }
    | null
) {
  const session = await ChatSession.findOne({ sessionId });
  if (!session) return;
  const nextMetadata = { ...(session.metadata || {}) } as any;
  if (pending) {
    nextMetadata.pendingAddToCart = pending;
  } else {
    delete nextMetadata.pendingAddToCart;
  }
  session.set('metadata', nextMetadata);
  await session.save();
}

async function addProductToCart(userId: string, productId: string, quantity = 1) {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [{ productId, quantity }] });
    return cart;
  }

  const existingIndex = cart.items.findIndex((it: any) => it.productId.toString() === productId);
  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += quantity;
  } else {
    cart.items.push({ productId, quantity } as any);
  }
  await cart.save();
  return cart;
}

async function resolveAddToCartTarget(
  req: Request,
  context: Awaited<ReturnType<typeof fetchContext>>,
  preferred: Array<ReturnType<typeof productSummary>>
): Promise<ReturnType<typeof productSummary> | null> {
  if (preferred.length > 0) return preferred[0];

  const firstCartItem = context?.state?.cart?.items?.[0];
  if (firstCartItem?.productId) {
    const p = await Product.findById(firstCartItem.productId).lean();
    if (p && (p as any).slug) return productSummary(req, p);
  }

  const fallback = await rankProducts('recommended product for cart', 1);
  if (fallback.length > 0) return productSummary(req, fallback[0]);
  return null;
}

export async function handleChatMessage(req: Request, sessionId: string, message: string, userId?: string): Promise<ChatResponse> {
  await ensureSession(sessionId, userId);
  const resolvedUserId = userId || 'user_001';
  const ownedSession = await ChatSession.findOne({ sessionId }).lean();
  if (ownedSession?.userId && ownedSession.userId !== resolvedUserId) {
    throw new Error('Session does not belong to this user');
  }

  await ChatMessage.create({
    sessionId,
    userId: resolvedUserId,
    role: 'user',
    content: message,
  });

  const context = await fetchContext(req, resolvedUserId);
  const sessionDoc = await ChatSession.findOne({ sessionId }).lean();
  const pendingAddToCart = (sessionDoc as any)?.metadata?.pendingAddToCart as
    | { productId: string; slug: string; quantity: number }
    | undefined;

  if (pendingAddToCart && userConfirmed(message)) {
    await addProductToCart(resolvedUserId, pendingAddToCart.productId, pendingAddToCart.quantity || 1);
    await setPendingAddToCart(sessionId, null);

    const product = await Product.findById(pendingAddToCart.productId).lean();
    const productSummaries = product ? [productSummary(req, product)] : [];
    const responseMessage = product
      ? `Done. I have added ${product.name} to your cart. Would you like anything else?`
      : 'Done. I have added the selected item to your cart. Would you like anything else?';

    await ChatMessage.create({
      sessionId,
      userId: resolvedUserId,
      role: 'assistant',
      content: responseMessage,
      products: productSummaries.map((p) => ({ productId: p.id })),
      metadata: {
        includeProducts: true,
        productCards: productSummaries.map(toProductCard),
        action: {
          type: 'ADD_TO_CART',
          status: 'CONFIRMED',
          productId: pendingAddToCart.productId,
          slug: pendingAddToCart.slug,
          quantity: pendingAddToCart.quantity || 1,
          message: 'Added to cart after confirmation.',
        },
      },
    });

    return {
      sessionId,
      message: responseMessage,
      products: productSummaries,
      productCards: productSummaries.map(toProductCard),
      intent: context?.semantic?.primary_intent,
      needs: context?.semantic?.needs,
      action: {
        type: 'ADD_TO_CART',
        status: 'CONFIRMED',
        productId: pendingAddToCart.productId,
        slug: pendingAddToCart.slug,
        quantity: pendingAddToCart.quantity || 1,
        message: 'Added to cart after confirmation.',
      },
    };
  }

  if (pendingAddToCart && userDeclined(message)) {
    await setPendingAddToCart(sessionId, null);
    const responseMessage = 'No problem, I did not add it to your cart.';
    await ChatMessage.create({
      sessionId,
      userId: resolvedUserId,
      role: 'assistant',
      content: responseMessage,
      products: [],
      metadata: {
        includeProducts: false,
        productCards: [],
        action: {
          type: 'ADD_TO_CART',
          status: 'CANCELLED',
          productId: pendingAddToCart.productId,
          slug: pendingAddToCart.slug,
          quantity: pendingAddToCart.quantity || 1,
          message: 'Cancelled by user.',
        },
      },
    });
    return {
      sessionId,
      message: responseMessage,
      products: [],
      productCards: [],
      intent: context?.semantic?.primary_intent,
      needs: context?.semantic?.needs,
      action: {
        type: 'ADD_TO_CART',
        status: 'CANCELLED',
        productId: pendingAddToCart.productId,
        slug: pendingAddToCart.slug,
        quantity: pendingAddToCart.quantity || 1,
        message: 'Cancelled by user.',
      },
    };
  }

  const requestedAddToCart = userAskedToAddToCart(message);
  const askedForProducts = userAskedForProducts(message);
  const includeProducts = askedForProducts || requestedAddToCart;
  let products = includeProducts ? await rankProducts(message, 6) : [];
  if (includeProducts && products.length > 0 && products.length < 2) {
    const supplemental = await rankProducts('popular in stock products', 6);
    const seen = new Set(products.map((p: any) => String(p._id)));
    products = [...products, ...supplemental.filter((p: any) => !seen.has(String(p._id)))].slice(0, 6);
  }
  if (askedForProducts && products.length === 0) {
    products = await rankProducts('popular in stock products', 6);
  }
  const productSummaries = includeProducts ? products.map((product) => productSummary(req, product)) : [];
  const recentMessages = await getRecentConversation(sessionId, 8);

  const inventoryValues = Object.values(context?.state?.inventory || {});
  const inStock = inventoryValues.filter((v) => v === 'IN_STOCK').length;
  const outOfStock = inventoryValues.filter((v) => v === 'OUT_OF_STOCK').length;

  if (requestedAddToCart && !pendingAddToCart) {
    const target = await resolveAddToCartTarget(req, context, productSummaries);
    if (target) {
      await setPendingAddToCart(sessionId, {
        productId: target.id,
        slug: target.slug,
        quantity: 1,
      });
      const action: ChatResponse['action'] = {
        type: 'ADD_TO_CART',
        status: 'PENDING_CONFIRMATION',
        productId: target.id,
        slug: target.slug,
        quantity: 1,
        message: 'Awaiting user confirmation before adding to cart.',
      };
      const responseMessage = `I can add ${target.name} to your cart. Reply \"yes\" to confirm or \"no\" to cancel.`;

      await ChatMessage.create({
        sessionId,
        userId: resolvedUserId,
        role: 'assistant',
        content: responseMessage,
        products: [{ productId: target.id }],
        metadata: {
          includeProducts: true,
          productCards: [toProductCard(target)],
          action,
        },
      });

      return {
        sessionId,
        message: responseMessage,
        products: [target],
        productCards: [toProductCard(target)],
        intent: context?.semantic?.primary_intent,
        needs: context?.semantic?.needs,
        action,
      };
    }
  }

  let responseMessage: string;
  if (askedForProducts && productSummaries.length) {
    responseMessage =
      'Here are product options for you. Pick one filter (budget, material, or use-case), and I will refine these cards.';
  } else if (askedForProducts && !productSummaries.length) {
    responseMessage =
      'I could not find direct matches right now, but I can still help. Share one filter (budget, material, or use-case), and I will narrow options.';
  } else {
    try {
      responseMessage = await generateAssistantReply({
        userMessage: message,
        context: context
          ? {
              user: context.state?.user || undefined,
              semantic: context.semantic,
              cart: context.state?.cart,
              session: context.state?.session,
              inventory: { inStock, outOfStock },
            }
          : null,
        includeProducts,
        productHints: productSummaries.map((p) => ({
          name: p.name,
          category: p.category,
          price: p.price,
          slug: p.slug,
          image: p.image,
        })),
        recentMessages,
      });
    } catch (error) {
      console.error('LLM reply failed:', error);
      responseMessage =
        "I'm having trouble reaching the AI service right now, but I can still help with product suggestions. Tell me your budget or preferred material.";
    }
  }

  const action: ChatResponse['action'] | undefined = undefined;
  const finalResponseMessage = responseMessage;

  await ChatMessage.create({
    sessionId,
    userId: resolvedUserId,
    role: 'assistant',
    content: finalResponseMessage,
    products: includeProducts ? productSummaries.map((p) => ({ productId: p.id })) : [],
    metadata: {
      includeProducts,
      productCards: productSummaries.map(toProductCard),
      action,
    },
  });

  return {
    sessionId,
    message: finalResponseMessage,
    products: productSummaries,
    productCards: productSummaries.map(toProductCard),
    intent: context?.semantic?.primary_intent,
    needs: context?.semantic?.needs,
    action,
  };
}

export async function streamChatMessage(req: Request, sessionId: string, message: string, userId?: string) {
  const response = await handleChatMessage(req, sessionId, message, userId);
  const chunks = chunkMessage(response.message, 10);
  return { response, chunks };
}

export async function getChatHistory(req: Request, sessionId: string, limit = 50) {
  const userId = req.user?.userId;
  const sessionFilter = userId ? { sessionId, userId } : { sessionId };
  const messages = await ChatMessage.find(sessionFilter)
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();

  const productIds = new Set<string>();
  for (const msg of messages) {
    const refs: any[] = (msg as any).products || [];
    for (const ref of refs) {
      const pid = ref?.productId?.toString?.() || ref?.productId;
      if (pid) productIds.add(pid);
    }
  }

  const products = productIds.size
    ? await Product.find({ _id: { $in: Array.from(productIds) } }).lean()
    : [];
  const summaryById = new Map<string, ReturnType<typeof productSummary>>();
  for (const p of products) {
    summaryById.set((p as any)._id.toString(), productSummary(req, p));
  }

  return messages.map((msg) => {
    const refs: any[] = (msg as any).products || [];
    const productSummaries = refs
      .map((ref) => {
        const pid = ref?.productId?.toString?.() || ref?.productId;
        if (!pid) return null;
        return summaryById.get(pid) || null;
      })
      .filter((v): v is ReturnType<typeof productSummary> => Boolean(v));

    const metadataCards = Array.isArray((msg as any)?.metadata?.productCards)
      ? (msg as any).metadata.productCards
      : [];
    const fallbackCards = productSummaries.map(toProductCard);

    return {
    id: msg._id.toString(),
    sessionId: msg.sessionId,
    role: msg.role,
    content: msg.content,
    products: msg.products || [],
      productSummaries,
      productCards: metadataCards.length ? metadataCards : fallbackCards,
      includeProducts: Boolean((msg as any)?.metadata?.includeProducts),
    createdAt: msg.createdAt,
    };
  });
}
