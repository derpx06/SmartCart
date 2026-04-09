import { useEffect } from 'react';

import { useSmartCartStore } from '@/store/smart-cart-store';

export type { SmartCartState } from '@/types/smart-cart';

export function useSmartCartState() {
  const state = useSmartCartStore((store) => store.state);
  const loading = useSmartCartStore((store) => store.loading);
  const error = useSmartCartStore((store) => store.error);
  const fetchCart = useSmartCartStore((store) => store.fetchCart);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  return { state, loading, error, refresh: fetchCart };
}
