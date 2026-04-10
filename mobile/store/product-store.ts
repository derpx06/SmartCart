import { create } from 'zustand';

import type { ProductDetail } from '@/data/product/productDetails';
import { api, type CreateProductReviewInput } from '@/lib/api';

type ProductStore = {
  product: ProductDetail | null;
  loading: boolean;
  reviewSubmitting: boolean;
  error: string | null;
  loadProduct: (slug?: string) => Promise<void>;
  submitReview: (review: CreateProductReviewInput) => Promise<void>;
  resetProduct: () => void;
};

export const useProductStore = create<ProductStore>((set, get) => ({
  product: null,
  loading: false,
  reviewSubmitting: false,
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
  submitReview: async (review) => {
    const currentProduct = get().product;

    if (!currentProduct?.id) {
      throw new Error('This product is not available for reviews yet.');
    }

    try {
      set({ reviewSubmitting: true });
      const updatedProduct = await api.submitProductReview(currentProduct.id, review);
      set({ product: updatedProduct, reviewSubmitting: false, error: null });
    } catch (error: any) {
      set({ reviewSubmitting: false });
      throw error;
    }
  },
  resetProduct: () => {
    set({ product: null, loading: false, reviewSubmitting: false, error: null });
  },
}));
