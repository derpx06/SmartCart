export interface SmartCartItem {
  productId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
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
}

export interface RelatedItem {
  productId: string;
  score: number;
  type: string;
}

export interface RankedItem {
  productId: string;
  name: string;
  category: string;
  price: number;
  score: number;
  reasons: string[];
}

export interface SmartCartState {
  cart: {
    items: SmartCartItem[];
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
  semantic: SemanticState;
  related: RelatedItem[];
  ranked: RankedItem[];
}
