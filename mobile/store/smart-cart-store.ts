import { create } from 'zustand';

import { Config } from '@/constants/Config';
import { api } from '@/lib/api';
import type { SmartCartState } from '@/types/smart-cart';

type SmartCartStore = {
  state: SmartCartState | null;
  loading: boolean;
  error: string | null;
  fetchCart: (options?: { silent?: boolean }) => Promise<void>;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  checkout: () => Promise<void>;
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
          'x-actions': 'add_pan,add_knife',
          'x-time-spent': '120',
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
    await api.addToCart(productId, quantity);
    await get().fetchCart({ silent: true });
  },
  checkout: async () => {
    await api.checkout();
    await get().fetchCart({ silent: true });
  },
}));
