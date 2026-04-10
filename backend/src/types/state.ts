export interface SmartCartState {
    cart: {
        items: {
            productId: string;
            slug: string;
            name: string;
            category: string;
            price: number;
            quantity: number;
            embedding?: number[];
        }[];
        totalItems: number;
        categories: string[];
        totalValue: number;
    };

    user: {
        id: string;
        preferences?: {
            budgetRange?: string;
            preferredCategories?: string[];
        };
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

export interface SemanticState {
    intent: string[];
    primary_intent: string;
    goal: string;
    summary: string;
    intent_confidence: number;
    stage: 'exploring' | 'deciding' | 'ready';
    needs: string[];
    risk: 'low' | 'medium' | 'high';
    vector?: number[];
}
