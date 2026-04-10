import { useEffect, useState } from 'react';

import { api } from '@/lib/api';
import { RankedItem } from '@/types/smart-cart';

export type ProductRecommendationRow = {
  id: string;
  title: string;
  subtitle?: string;
  items: RankedItem[];
};

export function useProductRecommendationRows(productId: string | undefined) {
  const [rows, setRows] = useState<ProductRecommendationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId || productId === 'undefined') return;
    let mounted = true;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await api.getProductRecommendationRows(productId);
        if (!mounted) return;
        const serverRows = Array.isArray(resp?.rows) ? resp.rows : [];
        if (serverRows.length > 0) {
          setRows(serverRows);
        } else {
          const fallback = await api.getProductRecommendations(productId);
          if (!mounted) return;
          setRows([
            {
              id: 'semantic-similar',
              title: 'Similar Items (Semantic)',
              subtitle: 'Close matches by meaning, use, and style.',
              items: Array.isArray(fallback) ? fallback.slice(0, 8) : [],
            },
          ]);
        }
      } catch (e: any) {
        try {
          const fallback = await api.getProductRecommendations(productId);
          if (!mounted) return;
          setRows([
            {
              id: 'semantic-similar',
              title: 'Similar Items (Semantic)',
              subtitle: 'Close matches by meaning, use, and style.',
              items: Array.isArray(fallback) ? fallback.slice(0, 8) : [],
            },
          ]);
          setError(null);
        } catch (fallbackErr: any) {
          if (!mounted) return;
          setError(fallbackErr?.message || e?.message || 'Failed to load recommendation rows');
          setRows([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, [productId]);

  return { rows, loading, error };
}

