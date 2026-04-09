import { create } from 'zustand';

import { adminApi } from '../lib/api';
import type { Order, Product } from '../types/admin';
import { useAuthStore } from './auth-store';

type Insights = {
  totalSales: number;
  popularProduct: Product | null;
  leastSoldProduct: Product | null;
};

type AdminDataState = {
  products: Product[];
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  clearData: () => void;
  refreshData: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  getInsights: () => Insights;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export const useAdminDataStore = create<AdminDataState>((set, get) => ({
  products: [],
  orders: [],
  isLoading: false,
  error: null,
  clearData: () => {
    set({ products: [], orders: [], isLoading: false, error: null });
  },
  refreshData: async () => {
    if (!useAuthStore.getState().isAuthenticated) {
      get().clearData();
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const [productData, orderData] = await Promise.all([
        adminApi.getProducts() as Promise<Product[]>,
        adminApi.getOrders() as Promise<Order[]>,
      ]);
      set({
        products: Array.isArray(productData) ? productData : [],
        orders: Array.isArray(orderData) ? orderData : [],
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      set({
        products: [],
        orders: [],
        isLoading: false,
        error: getErrorMessage(error, 'Failed to load admin data'),
      });
    }
  },
  addProduct: async (product) => {
    await adminApi.createProduct(product);
    await get().refreshData();
  },
  updateProduct: async (id, updates) => {
    await adminApi.updateProduct(id, updates);
    await get().refreshData();
  },
  removeProduct: async (id) => {
    await adminApi.deleteProduct(id);
    await get().refreshData();
  },
  updateOrderStatus: async (id, status) => {
    await adminApi.updateOrderStatus(id, status);
    await get().refreshData();
  },
  getInsights: () => {
    const { orders, products } = get();
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    return {
      totalSales,
      popularProduct: products[0] || null,
      leastSoldProduct: products[products.length - 1] || null,
    };
  },
}));
