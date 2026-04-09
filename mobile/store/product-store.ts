import { create } from 'zustand';

import type { ProductDetail } from '@/data/product/productDetails';
import { api } from '@/lib/api';

type ProductStore = {
  product: ProductDetail | null;
  loading: boolean;
  error: string | null;
  loadProduct: (slug?: string) => Promise<void>;
  resetProduct: () => void;
};

export const useProductStore = create<ProductStore>((set) => ({
  product: null,
  loading: false,
  error: null,
  loadProduct: async (slug) => {
    if (!slug) {
      set({ product: null, loading: false, error: 'Missing product slug.' });
      return;
    }

    try {
      set({ loading: true, error: null });
      const data = await api.getProductBySlug(slug);
      set({ product: data, loading: false, error: null });
    } catch {
      set({ product: null, loading: false, error: 'Unable to load this product right now.' });
    }
  },
  resetProduct: () => {
    set({ product: null, loading: false, error: null });
  },
}));
