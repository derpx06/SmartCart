import { create } from 'zustand';

import { adminApi } from '../lib/api';
import type { Model3D, Order, Product } from '../types/admin';
import { useAuthStore } from './auth-store';

type Insights = {
  totalSales: number;
  totalOrdersCount: number;
  averageOrderValue: number;
  lowStockCount: number;
  popularProduct: { product: Product; orderCount: number; unitsSold: number } | null;
  leastSoldProduct: { product: Product; orderCount: number; unitsSold: number } | null;
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
      const [productRes, orderRes, model3DData] = await Promise.all([
        adminApi.getProducts() as Promise<{ data: Product[] } | Product[]>,
        adminApi.getOrders() as Promise<{ data: Order[] } | Order[]>,
        adminApi.getModels3D() as Promise<Model3D[]>,
      ]);
      // API returns paginated { data: [...] } or plain arrays — handle both
      const productData = Array.isArray(productRes) ? productRes : (productRes?.data ?? []);
      const orderData = Array.isArray(orderRes) ? orderRes : (orderRes?.data ?? []);
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
    const totalOrdersCount = orders.length;
    const averageOrderValue = totalOrdersCount > 0 ? totalSales / totalOrdersCount : 0;

    const lowStockCount = products.filter(p => p.inventory < 10).length;

    // Count distinct orders each product appears in (primary metric)
    const productOrderCount = new Map<string, number>();
    // Also track total units sold (secondary display metric)
    const productUnitsSold = new Map<string, number>();
    products.forEach(p => {
      productOrderCount.set(p.id, 0);
      productUnitsSold.set(p.id, 0);
    });

    orders.forEach(order => {
      // Use a Set to count each product only once per order
      const seenInOrder = new Set<string>();
      order.items.forEach(item => {
        // Track units sold
        const currentUnits = productUnitsSold.get(item.productId) || 0;
        productUnitsSold.set(item.productId, currentUnits + item.quantity);
        // Track distinct order appearances
        if (!seenInOrder.has(item.productId)) {
          seenInOrder.add(item.productId);
          const currentCount = productOrderCount.get(item.productId) || 0;
          productOrderCount.set(item.productId, currentCount + 1);
        }
      });
    });

    // Best selling: most orders first, tie-break by lower stock (selling fast + low stock = hotter)
    const sortedForPopular = [...products].sort((a, b) => {
      const ordersA = productOrderCount.get(a.id) || 0;
      const ordersB = productOrderCount.get(b.id) || 0;
      if (ordersA !== ordersB) return ordersB - ordersA;
      return a.inventory - b.inventory; // lower stock ranks higher
    });

    // Worst performing: fewest orders first, tie-break by higher stock (not selling + lots of stock = worse)
    const sortedForLeast = [...products].sort((a, b) => {
      const ordersA = productOrderCount.get(a.id) || 0;
      const ordersB = productOrderCount.get(b.id) || 0;
      if (ordersA !== ordersB) return ordersA - ordersB;
      return b.inventory - a.inventory; // higher stock ranks worse
    });

    const popProd = sortedForPopular.length > 0 ? sortedForPopular[0] : null;
    const leastProd = sortedForLeast.length > 0 ? sortedForLeast[0] : null;

    return {
      totalSales,
      totalOrdersCount,
      averageOrderValue,
      lowStockCount,
      popularProduct: popProd ? {
        product: popProd,
        orderCount: productOrderCount.get(popProd.id) || 0,
        unitsSold: productUnitsSold.get(popProd.id) || 0,
      } : null,
      leastSoldProduct: leastProd ? {
        product: leastProd,
        orderCount: productOrderCount.get(leastProd.id) || 0,
        unitsSold: productUnitsSold.get(leastProd.id) || 0,
      } : null,
    };
  },
}));
