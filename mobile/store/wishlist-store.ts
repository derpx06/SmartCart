import { create } from 'zustand';

import { api, type WishlistApiResponse } from '@/lib/api';

export type WishlistItem = {
  productId: string;
  name: string;
  slug: string;
  category: string;
  image: string;
  price: number;
  addedAt?: string;
};

type WishlistStore = {
  items: WishlistItem[];
  loading: boolean;
  hasLoaded: boolean;
  syncingIds: string[];
  error: string | null;
  fetchWishlist: (options?: { silent?: boolean }) => Promise<void>;
  addWishlistItem: (productId: string) => Promise<void>;
  removeWishlistItem: (productId: string) => Promise<void>;
  toggleWishlistItem: (productId: string) => Promise<boolean>;
  isInWishlist: (productId?: string) => boolean;
  clearWishlist: () => void;
};

function normalizeWishlistItems(payload: WishlistApiResponse | null | undefined): WishlistItem[] {
  if (!payload || !Array.isArray(payload.items)) {
    return [];
  }

  const seen = new Set<string>();
  const items: WishlistItem[] = [];

  for (const entry of payload.items) {
    const rawProduct = entry?.productId;
    const product =
      rawProduct && typeof rawProduct === 'object' ? (rawProduct as Record<string, unknown>) : undefined;

    const productId =
      typeof rawProduct === 'string'
        ? rawProduct
        : typeof product?._id === 'string'
          ? product._id
          : typeof product?.id === 'string'
            ? product.id
            : '';

    if (!productId || seen.has(productId)) {
      continue;
    }
    seen.add(productId);

    const priceObject =
      product?.price && typeof product.price === 'object' ? (product.price as Record<string, unknown>) : undefined;
    const images = Array.isArray(product?.images) ? product.images : [];

    items.push({
      productId,
      name: typeof product?.name === 'string' ? product.name : 'Saved product',
      slug: typeof product?.slug === 'string' ? product.slug : '',
      category: typeof product?.category === 'string' ? product.category : '',
      image: typeof images[0] === 'string' ? images[0] : '',
      price: typeof priceObject?.selling === 'number' ? priceObject.selling : 0,
      addedAt: typeof entry?.addedAt === 'string' ? entry.addedAt : undefined,
    });
  }

  return items;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  loading: false,
  hasLoaded: false,
  syncingIds: [],
  error: null,
  fetchWishlist: async (options) => {
    const silent = options?.silent === true;

    try {
      if (!silent) {
        set({ loading: true, error: null });
      } else {
        set({ error: null });
      }

      const payload = await api.getWishlist();
      set({
        items: normalizeWishlistItems(payload),
        loading: false,
        hasLoaded: true,
        error: null,
      });
    } catch (error: any) {
      set({
        loading: false,
        hasLoaded: true,
        error: error?.message || 'Unable to load wishlist',
      });
    }
  },
  addWishlistItem: async (productId) => {
    if (!productId) return;

    set((state) => ({
      syncingIds: state.syncingIds.includes(productId) ? state.syncingIds : [...state.syncingIds, productId],
      error: null,
    }));
    try {
      const payload = await api.addToWishlist(productId);
      set({
        items: normalizeWishlistItems(payload),
        hasLoaded: true,
        error: null,
      });
    } catch (error: any) {
      set({ error: error?.message || 'Unable to update wishlist' });
      throw error;
    } finally {
      set((state) => ({ syncingIds: state.syncingIds.filter((id) => id !== productId) }));
    }
  },
  removeWishlistItem: async (productId) => {
    if (!productId) return;

    set((state) => ({
      syncingIds: state.syncingIds.includes(productId) ? state.syncingIds : [...state.syncingIds, productId],
      error: null,
    }));
    try {
      const payload = await api.removeFromWishlist(productId);
      set({
        items: normalizeWishlistItems(payload),
        hasLoaded: true,
        error: null,
      });
    } catch (error: any) {
      set({ error: error?.message || 'Unable to update wishlist' });
      throw error;
    } finally {
      set((state) => ({ syncingIds: state.syncingIds.filter((id) => id !== productId) }));
    }
  },
  toggleWishlistItem: async (productId) => {
    if (!productId) return false;

    const alreadyInWishlist = get().items.some((item) => item.productId === productId);
    if (alreadyInWishlist) {
      await get().removeWishlistItem(productId);
      return false;
    }

    await get().addWishlistItem(productId);
    return true;
  },
  isInWishlist: (productId) => {
    if (!productId) return false;
    return get().items.some((item) => item.productId === productId);
  },
  clearWishlist: () => {
    set({
      items: [],
      loading: false,
      hasLoaded: false,
      syncingIds: [],
      error: null,
    });
  },
}));
