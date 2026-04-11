import { Config } from '@/constants/Config';
import type { TabDemoContent } from '@/data/tabDemoContent';
import type { ProductDetail } from '@/data/product/productDetails';
import type { CategoryItem, CollectionItem, HeroSlide, ProductItem } from '@/data/luxuryHomeData';
import type { RankedItem } from '@/types/smart-cart';

let authToken: string | null = null;
let deviceId: string | null = null;

async function getDeviceId(): Promise<string> {
  if (deviceId) return deviceId;
  // Best-effort persistence via expo-secure-store if available.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-secure-store') as any;
    const secure = mod?.default ?? mod;
    if (secure?.getItemAsync && secure?.setItemAsync) {
      const existing = await secure.getItemAsync('mobile.device.id.v1');
      if (existing) {
        deviceId = existing;
        return existing;
      }
      const generated = `dev_${Math.random().toString(36).slice(2)}_${Date.now()}`;
      await secure.setItemAsync('mobile.device.id.v1', generated);
      deviceId = generated;
      return generated;
    }
  } catch {
    // ignore
  }
  deviceId = `dev_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  return deviceId;
}

export type AuthPayload = {
  token: string;
  userId: string;
  name: string;
  email?: string;
  role?: string;
  phone?: string;
};

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

export type ChatProductSummary = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
};

export type ChatProductCard = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  price: number;
  imageUrl: string;
  ctaLabel: string;
  route: string;
};

export type ChatResponse = {
  sessionId: string;
  message: string;
  products: ChatProductSummary[];
  productCards?: ChatProductCard[];
  action?: {
    type: 'ADD_TO_CART';
    status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'CANCELLED';
    productId: string;
    slug: string;
    quantity: number;
    message: string;
  };
  intent?: string;
  needs?: string[];
};

export type ChatHistoryMessage = {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  // enriched by backend (recommended) OR can be empty
  productSummaries?: ChatProductSummary[];
};

export type StreamChatHandlers = {
  onMeta?: (meta: {
    sessionId: string;
    intent?: string;
    needs?: string[];
    products: ChatProductSummary[];
    productCards?: ChatProductCard[];
    action?: {
      type: 'ADD_TO_CART';
      status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'CANCELLED';
      productId: string;
      slug: string;
      quantity: number;
      message: string;
    };
  }) => void;
  onChunk?: (chunk: string) => void;
  onDone?: () => void;
  onError?: (error: unknown) => void;
};

export type CreateProductReviewInput = {
  rating: number;
  title: string;
  body: string;
  authorName?: string;
};

export type WishlistApiProduct = {
  _id?: string;
  id?: string;
  name?: string;
  slug?: string;
  category?: string;
  images?: string[];
  price?: {
    selling?: number;
    original?: number;
  };
};

export type WishlistApiResponse = {
  items?: {
    productId?: string | WishlistApiProduct;
    addedAt?: string;
  }[];
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (!options.skipAuth && authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  // Device id enables personalization when unauthenticated.
  if (!headers.has('x-device-id')) {
    const id = await getDeviceId();
    headers.set('x-device-id', id);
  }

  let response: Response;
  try {
    response = await fetch(`${Config.API_URL}${path}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });
  } catch (error: any) {
    clearTimeout(timeout);
    if (error?.name === 'AbortError') {
      throw new Error('Request timed out. Check backend URL/network and try again.');
    }
    throw error;
  }
  clearTimeout(timeout);

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function parseSseFrames(buffer: string): { frames: string[]; rest: string } {
  const parts = buffer.split('\n\n');
  if (parts.length <= 1) return { frames: [], rest: buffer };
  return { frames: parts.slice(0, -1), rest: parts[parts.length - 1] };
}

function readSseFrame(frame: string): { event?: string; data?: string } {
  // SSE frame is "event: x\ndata: y\n\n" but we accept missing event.
  const lines = frame.split('\n').map((l) => l.trimEnd());
  let event: string | undefined;
  const dataLines: string[] = [];
  for (const line of lines) {
    if (!line) continue;
    if (line.startsWith('event:')) {
      event = line.slice('event:'.length).trim();
      continue;
    }
    if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).trimStart());
      continue;
    }
  }
  return { event, data: dataLines.length ? dataLines.join('\n') : undefined };
}

export const api = {
  setToken(token: string | null) {
    authToken = token;
  },
  getToken() {
    return authToken;
  },
  login(email: string, password: string) {
    return request<AuthPayload>('/login', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email, password }),
    });
  },
  register(name: string, email: string, password: string) {
    return request<AuthPayload>('/register', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ name, email, password }),
    });
  },
  getHome(tag?: string) {
    const query = tag && tag !== 'All Product' ? `?tag=${encodeURIComponent(tag)}` : '';
    return request<{
      heroSlides: HeroSlide[];
      categories: CategoryItem[];
      collections: CollectionItem[];
      bestsellers: ProductItem[];
      recommendedProducts: ProductItem[];
    }>(`/home${query}`);
  },
  getHomeRow(rowId: string, limit = 10) {
    const safeId = encodeURIComponent(String(rowId || '').trim());
    const safeLimit = Math.max(3, Math.min(20, Number(limit || 10)));
    return request<{
      id: string;
      title: string;
      subtitle?: string;
      items: {
        id: string;
        slug?: string;
        name: string;
        price: string;
        rating: number;
        image: string;
        ctaLabel?: string;
      }[];
      meta?: Record<string, any>;
    }>(`/home/rows/${safeId}?limit=${safeLimit}`);
  },
  getProductBySlug(slug: string) {
    return request<ProductDetail>(`/products/slug/${slug}`);
  },
  recordView(productId: string) {
    return request<{ ok: boolean }>('/events/view', {
      method: 'POST',
      skipAuth: false,
      body: JSON.stringify({ productId }),
    });
  },
  submitProductReview(productId: string, payload: CreateProductReviewInput) {
    return request<ProductDetail>(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  addToCart(productId: string, quantity: number) {
    return request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },
  updateCart(productId: string, quantity: number) {
    return request('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    });
  },
  checkout(productIds?: string[]) {
    if (productIds?.length) {
      return request('/orders/checkout/selection', {
        method: 'POST',
        body: JSON.stringify({ productIds }),
      });
    }

    return request('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },
  getOrders() {
    return request<{
      id: string;
      customerName: string;
      total: number;
      status: string;
      date: string;
      items: { name: string; quantity: number; slug?: string; productId?: string }[];
    }[]>('/orders/mobile');
  },
  getRecipes() {
    return request<TabDemoContent>('/recipes');
  },
  getRegistries() {
    return request<TabDemoContent>('/registries');
  },
  getWishlist() {
    return request<WishlistApiResponse>('/wishlist');
  },
  addToWishlist(productId: string) {
    return request<WishlistApiResponse>('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },
  removeFromWishlist(productId: string) {
    return request<WishlistApiResponse>(`/wishlist/remove/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
    });
  },
  getProductRecommendations(productId: string) {
    return request<RankedItem[]>(`/products/${productId}/recommendations`);
  },
  getProductRecommendationRows(productId: string) {
    return request<{
      rows: {
        id: string;
        title: string;
        subtitle?: string;
        items: RankedItem[];
      }[];
    }>(`/products/${productId}/recommendation-rows`);
  },
  sendChatMessage(message: string, sessionId?: string) {
    return request<ChatResponse>('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId }),
    });
  },
  getChatHistory(sessionId: string) {
    return request<{ sessionId: string; history: ChatHistoryMessage[] }>(`/chat/history/${encodeURIComponent(sessionId)}`);
  },
  async streamChatMessage(message: string, sessionId: string | undefined, handlers: StreamChatHandlers = {}) {
    const controller = new AbortController();
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    if (authToken) headers.set('Authorization', `Bearer ${authToken}`);

    const url = `${Config.API_URL}/chat/stream`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, sessionId }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error || 'Chat stream failed');
    }

    // Some runtimes may not expose a readable body (or may not support streaming).
    if (!response.body) {
      const fallback = await api.sendChatMessage(message, sessionId);
      handlers.onMeta?.({
        sessionId: fallback.sessionId,
        intent: fallback.intent,
        needs: fallback.needs,
        products: fallback.products,
        productCards: fallback.productCards,
        action: fallback.action,
      });
      handlers.onChunk?.(fallback.message);
      handlers.onDone?.();
      return { abort: () => controller.abort(), sessionId: fallback.sessionId };
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buf = '';
    let resolvedSessionId = sessionId;

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        const { frames, rest } = parseSseFrames(buf);
        buf = rest;

        for (const frame of frames) {
          const { event, data } = readSseFrame(frame);
          if (!event) continue;

          if (event === 'meta' && data) {
            const meta = JSON.parse(data) as {
              sessionId: string;
              intent?: string;
              needs?: string[];
              products: ChatProductSummary[];
              productCards?: ChatProductCard[];
              action?: {
                type: 'ADD_TO_CART';
                status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'CANCELLED';
                productId: string;
                slug: string;
                quantity: number;
                message: string;
              };
            };
            resolvedSessionId = meta.sessionId;
            handlers.onMeta?.(meta);
            continue;
          }

          if (event === 'chunk' && data != null) {
            handlers.onChunk?.(data);
            continue;
          }

          if (event === 'done') {
            handlers.onDone?.();
            return { abort: () => controller.abort(), sessionId: resolvedSessionId };
          }
        }
      }

      handlers.onDone?.();
      return { abort: () => controller.abort(), sessionId: resolvedSessionId };
    } catch (err) {
      handlers.onError?.(err);
      // fallback to non-stream response if parsing/streaming fails
      const fallback = await api.sendChatMessage(message, sessionId);
      handlers.onMeta?.({
        sessionId: fallback.sessionId,
        intent: fallback.intent,
        needs: fallback.needs,
        products: fallback.products,
        productCards: fallback.productCards,
        action: fallback.action,
      });
      handlers.onChunk?.(fallback.message);
      handlers.onDone?.();
      return { abort: () => controller.abort(), sessionId: fallback.sessionId };
    } finally {
      try {
        reader.releaseLock();
      } catch {
        // ignore
      }
    }
  },
};
