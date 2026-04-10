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

export type HomeRow = {
  id: string;
  title: string;
  subtitle?: string;
  items: ProductItem[];
  meta?: Record<string, any>;
};

const fallbackHomeData: HomeData = {
  heroSlides,
  categories,
  collections,
  bestsellers,
  recommendedProducts,
};

const HOME_ROW_ORDER: { id: string; minItems: number }[] = [
  { id: 'complete-setup', minItems: 3 },
  { id: 'bundles', minItems: 3 },
  { id: 'because-you-added', minItems: 3 },
  { id: 'premium-picks', minItems: 3 },
  { id: 'fast-delivery', minItems: 3 },
  { id: 'new-arrivals', minItems: 3 },
  { id: 'price-drops', minItems: 2 },
  { id: 'recently-viewed', minItems: 3 },
  { id: 'recently-viewed-alternatives', minItems: 3 },
  { id: 'trending', minItems: 3 },
  { id: 'refill-soon', minItems: 3 },
];

function dedupeRows(rows: HomeRow[]): HomeRow[] {
  const used = new Set<string>();
  const out: HomeRow[] = [];
  for (const row of rows) {
    const items = row.items.filter((p) => {
      if (!p?.id) return false;
      if (used.has(p.id)) return false;
      used.add(p.id);
      return true;
    });
    out.push({ ...row, items });
  }
  return out;
}

type HomeStore = {
  homeData: HomeData;
  homeRows: HomeRow[];
  rowLoading: Record<string, boolean>;
  rowError: Record<string, string | null>;
  loading: boolean;
  hasFetched: boolean;
  refreshing: boolean;
  error: string | null;
  loadHome: (tag?: string) => Promise<void>;
  refreshHome: (tag?: string, options?: { silent?: boolean }) => Promise<void>;
};

export const useHomeStore = create<HomeStore>((set) => ({
  homeData: fallbackHomeData,
  homeRows: [],
  rowLoading: {},
  rowError: {},
  loading: true,
  hasFetched: false,
  refreshing: false,
  error: null,
  loadHome: async (tag?: string) => {
    try {
      set((state) => ({ loading: !state.hasFetched, error: null }));
      const data = await api.getHome(tag);
      const rowResults = await Promise.all(
        HOME_ROW_ORDER.map(async ({ id }) => {
          set((s) => ({ rowLoading: { ...s.rowLoading, [id]: true }, rowError: { ...s.rowError, [id]: null } }));
          try {
            const row = await api.getHomeRow(id, 10);
            set((s) => ({ rowLoading: { ...s.rowLoading, [id]: false } }));
            return row;
          } catch (e: any) {
            set((s) => ({
              rowLoading: { ...s.rowLoading, [id]: false },
              rowError: { ...s.rowError, [id]: e?.message || 'Row failed' },
            }));
            return null;
          }
        })
      );

      const rows: HomeRow[] = rowResults
        .filter(Boolean)
        .map((row: any) => ({
          id: row.id,
          title: row.title,
          subtitle: row.subtitle,
          meta: row.meta,
          items: Array.isArray(row.items) ? row.items : [],
        }))
        .filter((row) => {
          const cfg = HOME_ROW_ORDER.find((r) => r.id === row.id);
          const minItems = cfg?.minItems ?? 3;
          return (row.items?.length ?? 0) >= minItems;
        });

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
        homeRows: dedupeRows(rows),
        loading: false,
        hasFetched: true,
        error: null,
      });
    } catch {
      set({
        homeData: fallbackHomeData,
        homeRows: [],
        loading: false,
        hasFetched: true,
        error: 'Unable to load home data',
      });
    }
  },
  refreshHome: async (tag?: string, options?: { silent?: boolean }) => {
    const silent = Boolean(options?.silent);
    try {
      set(silent ? { error: null } : { refreshing: true, error: null });
      const data = await api.getHome(tag);
      const rowResults = await Promise.all(
        HOME_ROW_ORDER.map(async ({ id }) => {
          set((s) => ({ rowLoading: { ...s.rowLoading, [id]: true }, rowError: { ...s.rowError, [id]: null } }));
          try {
            const row = await api.getHomeRow(id, 10);
            set((s) => ({ rowLoading: { ...s.rowLoading, [id]: false } }));
            return row;
          } catch (e: any) {
            set((s) => ({
              rowLoading: { ...s.rowLoading, [id]: false },
              rowError: { ...s.rowError, [id]: e?.message || 'Row failed' },
            }));
            return null;
          }
        })
      );

      const rows: HomeRow[] = rowResults
        .filter(Boolean)
        .map((row: any) => ({
          id: row.id,
          title: row.title,
          subtitle: row.subtitle,
          meta: row.meta,
          items: Array.isArray(row.items) ? row.items : [],
        }))
        .filter((row) => {
          const cfg = HOME_ROW_ORDER.find((r) => r.id === row.id);
          const minItems = cfg?.minItems ?? 3;
          return (row.items?.length ?? 0) >= minItems;
        });

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
        homeRows: dedupeRows(rows),
        refreshing: false,
        error: null,
      });
    } catch {
      set({
        homeData: fallbackHomeData,
        homeRows: [],
        refreshing: false,
        error: 'Unable to load home data',
      });
    }
  },
}));
