import { create } from 'zustand';

import { Config } from '@/constants/Config';
import { api } from '@/lib/api';
import { createPerfTrace, getPerfNow, measureUiCommit } from '@/lib/perf';
import type { SmartCartState } from '@/types/smart-cart';

function normalizeProductKey(value?: string) {
  return (value || '').trim().toLowerCase();
}

function findCartItem(state: SmartCartState | null, productId: string) {
  const targetKey = normalizeProductKey(productId);
  if (!targetKey || !state?.cart?.items?.length) return null;

  return state.cart.items.find((item) => normalizeProductKey(item.productId) === targetKey) ?? null;
}

type SmartCartStore = {
  state: SmartCartState | null;
  loading: boolean;
  error: string | null;
  fetchCart: (options?: { silent?: boolean }) => Promise<void>;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  checkout: (productIds?: string[]) => Promise<void>;
};

export const useSmartCartStore = create<SmartCartStore>((set, get) => ({
  state: null,
  loading: true,
  error: null,
  fetchCart: async (options) => {
    const silent = options?.silent === true;
    const trace = createPerfTrace('UI Cart fetch', { silent });
    try {
      if (!silent) {
        set({ loading: true, error: null });
      } else {
        set({ error: null });
      }
      trace.mark('request-dispatched', { apiBaseUrl: Config.API_URL });
      const response = await fetch(`${Config.API_URL}/smartcart/state`, {
        headers: {
          ...(api.getToken() ? { Authorization: `Bearer ${api.getToken()}` } : {}),
          'x-reco-seed': `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        },
      });
      trace.mark('response-received', { status: response.status, ok: response.ok });

      if (!response.ok) {
        throw new Error('Failed to fetch state');
      }

      const data = (await response.json()) as SmartCartState;
      const responseReceivedAt = getPerfNow();
      set({ state: data, loading: false, error: null });
      measureUiCommit('UI Cart fetch', responseReceivedAt, {
        items: data?.cart?.items?.length ?? 0,
        silent,
      });
      trace.end('complete', { items: data?.cart?.items?.length ?? 0, silent });
    } catch (error: any) {
      trace.end('failed', { silent, message: error?.message });
      set({
        loading: false,
        error: error?.message || 'Failed to fetch state',
      });
    }
  },
  refresh: async (options) => {
    await get().fetchCart(options);
  },
  updateCartQuantity: async (productId, quantity) => {
    const trace = createPerfTrace('UI Cart update-quantity', { productId, quantity });
    await api.updateCart(productId, quantity);
    trace.mark('mutation-complete');
    await get().fetchCart({ silent: true });
    trace.end('complete');
  },
  addToCart: async (productId, quantity) => {
    const trace = createPerfTrace('UI Cart add', { productId, quantity });
    const requestedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));

    if (!get().state) {
      await get().fetchCart({ silent: true });
      trace.mark('prefetch-cart-complete');
    }

    const existing = findCartItem(get().state, productId);
    if (existing) {
      await api.updateCart(productId, existing.quantity + requestedQuantity);
    } else {
      await api.addToCart(productId, requestedQuantity);
    }
    trace.mark('mutation-complete', { existed: Boolean(existing) });

    await get().fetchCart({ silent: true });
    trace.end('complete');
  },
  checkout: async (productIds) => {
    const trace = createPerfTrace('UI Cart checkout', { selectedItems: productIds?.length ?? 0 });
    await api.checkout(productIds);
    trace.mark('checkout-complete');
    await get().fetchCart({ silent: true });
    trace.end('complete');
  },
}));
