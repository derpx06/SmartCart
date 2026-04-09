export interface SmartCartItem {
  productId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
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
}
