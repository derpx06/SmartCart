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

    semantic?: SemanticState;
    related?: {
        productId: string;
        score: number;
        type: string;
    }[];
    ranked?: {
        productId: string;
        slug?: string;
        image?: string;
        name: string;
        category: string;
        price: number;
        score: number;
        reasons: string[];
    }[];
    intelligencePanel?: CartIntelligencePanel;
    kitIntelligence?: KitIntelligence[];
    smartBundles?: SmartBundle[];
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
    completionPercent?: number;
    requiredItems?: string[];
    presentItems?: string[];
    missingItems?: string[];
    vector?: number[];
}

export interface CartIntelligencePanel {
    intentLabel: string;
    goal: string;
    completionPercent: number;
    missingItems: string[];
    riskLevel: 'low' | 'medium' | 'high';
    message: string;
}

export interface KitIntelligence {
    kitId: string;
    intentLabel: string;
    completionPercent: number;
    missingItems: string[];
    riskLevel: 'low' | 'medium' | 'high';
    message: string;
}

export interface SmartBundle {
    kitId: string;
    title: string;
    subtitle: string;
    intentLabel: string;
    completionPercent: number;
    have: {
        productId: string;
        slug: string;
        name: string;
        category: string;
        price: number;
        quantity: number;
    }[];
    missing: {
        keyword: string;
        recommendation?: {
            productId: string;
            slug?: string;
            image?: string;
            name: string;
            category: string;
            price: number;
            score?: number;
            reasons?: string[];
        };
    }[];
    recommendations: {
        productId: string;
        slug?: string;
        image?: string;
        name: string;
        category: string;
        price: number;
        score?: number;
        reasons?: string[];
    }[];
    cta: string;
}
