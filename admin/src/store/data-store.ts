import { create } from 'zustand';

import { adminApi } from '../lib/api';
import type { Model3D, Order, Product } from '../types/admin';
import { useAuthStore } from './auth-store';

type Insights = {
  totalSales: number;
  popularProduct: Product | null;
  leastSoldProduct: Product | null;
};

type AdminDataState = {
  products: Product[];
  orders: Order[];
  models3D: Model3D[];
  isLoading: boolean;
  error: string | null;
  clearData: () => void;
  refreshData: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  removeModel3D: (id: string) => Promise<void>;
  getInsights: () => Insights;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export const useAdminDataStore = create<AdminDataState>((set, get) => ({
  products: [],
  orders: [],
  models3D: [],
  isLoading: false,
  error: null,
  clearData: () => {
    set({ products: [], orders: [], models3D: [], isLoading: false, error: null });
  },
  refreshData: async () => {
    if (!useAuthStore.getState().isAuthenticated) {
      get().clearData();
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const [productData, orderData, model3DData] = await Promise.all([
        adminApi.getProducts() as Promise<Product[]>,
        adminApi.getOrders() as Promise<Order[]>,
        adminApi.getModels3D() as Promise<Model3D[]>,
      ]);
      set({
        products: Array.isArray(productData) ? productData : [],
        orders: Array.isArray(orderData) ? orderData : [],
        models3D: Array.isArray(model3DData) ? model3DData : [],
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
  updateOrder: async (id, updates) => {
    await adminApi.updateOrder(id, updates);
    await get().refreshData();
  },
  updateOrderStatus: async (id, status) => {
    await adminApi.updateOrderStatus(id, status);
    await get().refreshData();
  },
  removeModel3D: async (id) => {
    await adminApi.deleteModel3D(id);
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
