import { create } from 'zustand';

import type { ProductDetail } from '@/data/product/productDetails';
import { api, type CreateProductReviewInput } from '@/lib/api';
import { createPerfTrace, getPerfNow, measureUiCommit } from '@/lib/perf';

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

    const trace = createPerfTrace('UI Product load', { slug });
    try {
      set({ loading: true, error: null });
      const data = await api.getProductBySlug(slug);
      const responseReceivedAt = getPerfNow();
      set({ product: data, loading: false, error: null });
      measureUiCommit('UI Product load', responseReceivedAt, { slug });
      trace.end('complete', { slug });
    } catch {
      trace.end('failed', { slug });
      set({ product: null, loading: false, error: 'Unable to load this product right now.' });
    }
  },
  submitReview: async (review) => {
    const currentProduct = get().product;

    if (!currentProduct?.id) {
      throw new Error('This product is not available for reviews yet.');
    }

    const trace = createPerfTrace('UI Product submit-review', { productId: currentProduct.id });
    try {
      set({ reviewSubmitting: true });
      const updatedProduct = await api.submitProductReview(currentProduct.id, review);
      const responseReceivedAt = getPerfNow();
      set({ product: updatedProduct, reviewSubmitting: false, error: null });
      measureUiCommit('UI Product submit-review', responseReceivedAt, { productId: currentProduct.id });
      trace.end('complete', { productId: currentProduct.id });
    } catch (error: any) {
      trace.end('failed', { productId: currentProduct.id, message: error?.message });
      set({ reviewSubmitting: false });
      throw error;
    }
  },
  resetProduct: () => {
    set({ product: null, loading: false, reviewSubmitting: false, error: null });
  },
}));
