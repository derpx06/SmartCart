import { create } from 'zustand';

import { api } from '@/lib/api';

export type MobileOrder = {
  id: string;
  customerName: string;
  total: number;
  status: string;
  date: string;
  items: { name: string; quantity: number }[];
};

type OrdersStore = {
  orders: MobileOrder[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
};

export const useOrdersStore = create<OrdersStore>((set) => ({
  orders: [],
  loading: true,
  error: null,
  fetchOrders: async () => {
    try {
      set({ loading: true, error: null });
      const data = await api.getOrders();
      set({
        orders: Array.isArray(data) ? data : [],
        loading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        orders: [],
        loading: false,
        error: error?.message || 'Unable to load orders',
      });
    }
  },
}));
