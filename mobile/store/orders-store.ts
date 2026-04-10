import { create } from 'zustand';

import { api } from '@/lib/api';

export type MobileOrder = {
  id: string;
  customerName: string;
  total: number;
  status: string;
  date: string;
  items: { name: string; quantity: number; slug?: string; productId?: string }[];
};

type OrdersStore = {
  orders: MobileOrder[];
  loading: boolean;
  error: string | null;
  fetchOrders: (options?: { silent?: boolean }) => Promise<void>;
};

export const useOrdersStore = create<OrdersStore>((set, get) => ({
  orders: [],
  loading: true,
  error: null,
  fetchOrders: async (options) => {
    const silent = options?.silent === true;
    try {
      if (!silent) {
        set({ loading: true, error: null });
      } else {
        set({ error: null });
      }
      const data = await api.getOrders();
      set({
        orders: Array.isArray(data) ? data : [],
        loading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        orders: silent ? get().orders : [],
        loading: false,
        error: error?.message || 'Unable to load orders',
      });
    }
  },
}));
