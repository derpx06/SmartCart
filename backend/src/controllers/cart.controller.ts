import type { Request, Response } from 'express';

import Cart from '../models/Cart';
import Product from '../models/Product';
import { buildSmartCartState } from '../services/stateBuilder.service';
import { getSemanticState } from '../services/semantic.service';
import { getRelatedProducts } from '../services/relationship.service';
import { rankItems } from '../services/ranking.service';
import { ensureCatalogSeededFromSkus } from '../services/catalogSync.service';

export const getSmartCartState = async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureCatalogSeededFromSkus();
    const state = await buildSmartCartState(req);
    const semantic = await getSemanticState(state);

    // Get related products (relationship signals) for primary cart item
    let related: any[] = [];
    if (state.cart.items.length > 0) {
      const primaryProductId = state.cart.items[0].productId;
      related = await getRelatedProducts(primaryProductId);
    }

    // Fetch candidate products to rank (exclude items already in cart)
    const cartProductIds = state.cart.items.map(i => i.productId);
    const candidates = await Product.find({
      _id: { $nin: cartProductIds },
    }).lean();

    // Build inventory signals for candidates
    const inventory: Record<string, 'IN_STOCK' | 'OUT_OF_STOCK'> = { ...state.inventory };
    candidates.forEach((item: any) => {
      const productId = item._id?.toString?.() || item.productId;
      if (!productId) return;
      const status = item.stock?.status === 'OUT_OF_STOCK' ? 'OUT_OF_STOCK' : 'IN_STOCK';
      inventory[productId] = status;
    });

    const ranked = rankItems(candidates, {
      state: { ...state, inventory },
      semantic,
      related,
    });

    // Strip embeddings and vectors from response payloads
    const safeItems = state.cart.items.map(({ embedding, ...rest }) => rest);
    const safeSemantic = { ...semantic };
    delete (safeSemantic as any).vector;

    res.json({
      ...state,
      cart: { ...state.cart, items: safeItems },
      inventory,
      semantic: safeSemantic,
      related,
      ranked,
    });
  } catch (error) {
    console.error('State build failed:', error);
    res.status(500).json({ error: 'State build failed' });
  }
};

export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId ?? 'user_001';
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    res.json(cart ?? { items: [] });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const addToCart = async (req: Request, res: Response): Promise<void> => {
  const { productId, quantity = 1 } = req.body;

  try {
    const userId = req.user?.userId ?? 'user_001';
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [{ productId, quantity }] });
    } else {
      const itemIndex = cart.items.findIndex((p) => p.productId.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    }

    await cart.save();
    const populatedCart = await Cart.findOne({ userId }).populate('items.productId');
    res.json(populatedCart);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateCart = async (req: Request, res: Response): Promise<void> => {
  const { productId, quantity } = req.body;

  try {
    const userId = req.user?.userId ?? 'user_001';
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }

    const itemIndex = cart.items.findIndex((p) => p.productId.toString() === productId);

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      await cart.save();
    }

    const populatedCart = await Cart.findOne({ userId }).populate('items.productId');
    res.json(populatedCart);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeFromCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId ?? 'user_001';
    const cart = await Cart.findOne({ userId });

    if (cart) {
      const filteredItems = cart.items.filter((p) => p.productId.toString() !== req.params.productId);
      cart.set('items', filteredItems);
      await cart.save();
    }

    const populatedCart = await Cart.findOne({ userId }).populate('items.productId');
    res.json(populatedCart);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};
