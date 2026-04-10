import type { Request } from 'express';
import ChatMessage from '../models/ChatMessage';
import ChatSession from '../models/ChatSession';
import Product from '../models/Product';
import Cart from '../models/Cart';
import { buildSmartCartState } from './stateBuilder.service';
import { getSemanticState } from './semantic.service';
import { cosineSimilarity } from '../utils/vector';
import { embedText } from './embedding.service';

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
  intent?: string;
  needs?: string[];
};

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

async function rankProducts(query: string, limit = 6) {
  const queryEmbedding = await embedText(query);
  if (!queryEmbedding.length) {
    const fallback = await Product.find().limit(limit).lean();
    return fallback;
  }

  const candidates = await Product.find({
    embedding: { $exists: true, $not: { $size: 0 } },
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

  return scored.map((s) => s.product);
}

function buildResponseMessage(payload: {
  query: string;
  products: any[];
  semantic?: { primary_intent?: string; needs?: string[] };
}) {
  const intent = payload.semantic?.primary_intent;
  const needs = payload.semantic?.needs || [];
  const needsLine = needs.length ? `Missing items I can help with: ${needs.join(', ')}.` : '';
  const intro = intent ? `Based on your cart, you seem focused on ${intent.replace('_', ' ')}.` : '';
  const productLine = payload.products.length
    ? `Here are a few picks that match your request:`
    : `I couldn't find close matches yet. Try a different style, material, or price range.`;

  return [intro, productLine, needsLine].filter(Boolean).join(' ');
}

export async function handleChatMessage(req: Request, sessionId: string, message: string, userId?: string): Promise<ChatResponse> {
  await ensureSession(sessionId, userId);

  await ChatMessage.create({
    sessionId,
    userId,
    role: 'user',
    content: message,
  });

  const context = await fetchContext(req, userId || 'user_001');
  const products = await rankProducts(message, 6);
  const responseMessage = buildResponseMessage({
    query: message,
    products,
    semantic: context?.semantic,
  });

  const productSummaries = products.map((product) => productSummary(req, product));

  await ChatMessage.create({
    sessionId,
    userId,
    role: 'assistant',
    content: responseMessage,
    products: productSummaries.map((p) => ({ productId: p.id })),
  });

  return {
    sessionId,
    message: responseMessage,
    products: productSummaries,
    intent: context?.semantic?.primary_intent,
    needs: context?.semantic?.needs,
  };
}

export async function streamChatMessage(req: Request, sessionId: string, message: string, userId?: string) {
  const response = await handleChatMessage(req, sessionId, message, userId);
  const chunks = chunkMessage(response.message, 10);
  return { response, chunks };
}

export async function getChatHistory(req: Request, sessionId: string, limit = 50) {
  const messages = await ChatMessage.find({ sessionId })
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
      .filter(Boolean);

    return {
    id: msg._id.toString(),
    sessionId: msg.sessionId,
    role: msg.role,
    content: msg.content,
    products: msg.products || [],
      productSummaries,
    createdAt: msg.createdAt,
    };
  });
}
