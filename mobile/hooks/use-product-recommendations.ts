import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { RankedItem } from '@/types/smart-cart';

export function useProductRecommendations(productId: string | undefined) {
    const [ranked, setRanked] = useState<RankedItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!productId || productId === 'undefined') {
            console.log('useProductRecommendations: No valid productId', productId);
            return;
        }

        console.log('useProductRecommendations: Fetching for', productId);

        let isMounted = true;

        const fetchRecs = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.getProductRecommendations(productId);
                if (isMounted) {
                    setRanked(response);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message || 'Failed to load recommendations');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        void fetchRecs();

        return () => {
            isMounted = false;
        };
    }, [productId]);

    return { ranked, loading, error };
}
