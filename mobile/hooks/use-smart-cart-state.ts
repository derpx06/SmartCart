import { useEffect, useState } from 'react';
import { Config } from '../constants/Config';

export interface SmartCartState {
    cart: {
        items: {
            productId: string;
            name: string;
            category: string;
            price: number;
            quantity: number;
        }[];
        totalItems: number;
        categories: string[];
        totalValue: number;
    };
    user: {
        id: string;
    } | null;
    session: {
        timeSpent: number;
        numActions: number;
        numAdds: number;
        numRemoves: number;
        behavior: 'fast' | 'normal' | 'slow';
        confidence: number;
    };
    inventory: {
        [productId: string]: 'IN_STOCK' | 'OUT_OF_STOCK';
    };
}

export function useSmartCartState() {
    const [state, setState] = useState<SmartCartState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchState = async () => {
        try {
            setLoading(true);
            // Dummy user_001 credentials or token would go here in a real app
            // For now we assume the backend handles user_001 if no auth header is present
            // or we can pass a dummy header
            const response = await fetch(`${Config.API_URL}/smartcart/state`, {
                headers: {
                    'Authorization': 'Bearer dummy_token', // Backend needs to handle this or ignore for demo
                    'x-actions': 'add_pan,add_knife',
                    'x-time-spent': '120',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch state');
            }

            const data = await response.json();
            setState(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchState();
    }, []);

    return { state, loading, error, refresh: fetchState };
}
