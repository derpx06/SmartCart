import { create } from 'zustand';

import { api } from '@/lib/api';
import {
  bestsellers,
  categories,
  collections,
  heroSlides,
  recommendedProducts,
  type CategoryItem,
  type CollectionItem,
  type HeroSlide,
  type ProductItem,
} from '@/data/luxuryHomeData';

type HomeData = {
  heroSlides: HeroSlide[];
  categories: CategoryItem[];
  collections: CollectionItem[];
  bestsellers: ProductItem[];
  recommendedProducts: ProductItem[];
};

const fallbackHomeData: HomeData = {
  heroSlides,
  categories,
  collections,
  bestsellers,
  recommendedProducts,
};

type HomeStore = {
  homeData: HomeData;
  loading: boolean;
  hasFetched: boolean;
  refreshing: boolean;
  error: string | null;
  loadHome: (tag?: string) => Promise<void>;
  refreshHome: (tag?: string) => Promise<void>;
};

export const useHomeStore = create<HomeStore>((set) => ({
  homeData: fallbackHomeData,
  loading: true,
  hasFetched: false,
  refreshing: false,
  error: null,
  loadHome: async (tag?: string) => {
    try {
      set((state) => ({ loading: !state.hasFetched, error: null }));
      const data = await api.getHome(tag);
      set({
        homeData: {
          heroSlides: data.heroSlides?.length ? data.heroSlides : heroSlides,
          categories: data.categories?.length ? data.categories : categories,
          collections: data.collections?.length ? data.collections : collections,
          bestsellers: data.bestsellers?.length ? data.bestsellers : bestsellers,
          recommendedProducts: data.recommendedProducts?.length
            ? data.recommendedProducts
            : recommendedProducts,
        },
        loading: false,
        hasFetched: true,
        error: null,
      });
    } catch {
      set({
        homeData: fallbackHomeData,
        loading: false,
        hasFetched: true,
        error: 'Unable to load home data',
      });
    }
  },
  refreshHome: async (tag?: string) => {
    try {
      set({ refreshing: true, error: null });
      const data = await api.getHome(tag);
      set({
        homeData: {
          heroSlides: data.heroSlides?.length ? data.heroSlides : heroSlides,
          categories: data.categories?.length ? data.categories : categories,
          collections: data.collections?.length ? data.collections : collections,
          bestsellers: data.bestsellers?.length ? data.bestsellers : bestsellers,
          recommendedProducts: data.recommendedProducts?.length
            ? data.recommendedProducts
            : recommendedProducts,
        },
        refreshing: false,
        error: null,
      });
    } catch {
      set({
        homeData: fallbackHomeData,
        refreshing: false,
        error: 'Unable to load home data',
      });
    }
  },
}));
