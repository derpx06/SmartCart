import { create } from 'zustand';

import { Config } from '@/constants/Config';
import { api } from '@/lib/api';
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
    try {
      if (!silent) {
        set({ loading: true, error: null });
      } else {
        set({ error: null });
      }
      const response = await fetch(`${Config.API_URL}/smartcart/state`, {
        headers: {
          ...(api.getToken() ? { Authorization: `Bearer ${api.getToken()}` } : {}),
          'x-reco-seed': `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch state');
      }

      const data = (await response.json()) as SmartCartState;
      set({ state: data, loading: false, error: null });
    } catch (error: any) {
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
    await api.updateCart(productId, quantity);
    await get().fetchCart({ silent: true });
  },
  addToCart: async (productId, quantity) => {
    const requestedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));

    if (!get().state) {
      await get().fetchCart({ silent: true });
    }

    const existing = findCartItem(get().state, productId);
    if (existing) {
      await api.updateCart(productId, existing.quantity + requestedQuantity);
    } else {
      await api.addToCart(productId, requestedQuantity);
    }

    await get().fetchCart({ silent: true });
  },
  checkout: async (productIds) => {
    await api.checkout(productIds);
    await get().fetchCart({ silent: true });
  },
}));
