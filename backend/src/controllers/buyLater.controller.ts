import type { Request, Response } from 'express';

import BuyLater from '../models/BuyLater';
import Cart from '../models/Cart';

export const getBuyLater = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId ?? 'user_001';
    const buyLater = await BuyLater.findOne({ userId }).populate('items.productId');
    res.json(buyLater ?? { items: [] });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const addToBuyLater = async (req: Request, res: Response): Promise<void> => {
  const { productId } = req.body;

  try {
    const userId = req.user?.userId ?? 'user_001';

    const cart = await Cart.findOne({ userId });
    if (cart) {
      const filteredItems = cart.items.filter((p) => p.productId.toString() !== productId);
      cart.set('items', filteredItems);
      await cart.save();
    }

    let buyLater = await BuyLater.findOne({ userId });
    if (!buyLater) {
      buyLater = new BuyLater({ userId, items: [{ productId }] });
    } else if (!buyLater.items.some((p) => p.productId.toString() === productId)) {
      buyLater.items.push({ productId });
    }

    await buyLater.save();
    const populatedBuyLater = await BuyLater.findOne({ userId }).populate('items.productId');
    res.json(populatedBuyLater);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeFromBuyLater = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId ?? 'user_001';
    const buyLater = await BuyLater.findOne({ userId });

    if (buyLater) {
      const filteredItems = buyLater.items.filter((p) => p.productId.toString() !== req.params.productId);
      buyLater.set('items', filteredItems);
      await buyLater.save();
    }

    const populatedBuyLater = await BuyLater.findOne({ userId }).populate('items.productId');
    res.json(populatedBuyLater);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const moveToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId ?? 'user_001';
    const { productId } = req.params;

    const buyLater = await BuyLater.findOne({ userId });
    if (buyLater) {
      const filteredItems = buyLater.items.filter((p) => p.productId.toString() !== productId);
      buyLater.set('items', filteredItems);
      await buyLater.save();
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [{ productId, quantity: 1 }] });
    } else {
      const itemIndex = cart.items.findIndex((p) => p.productId.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += 1;
      } else {
        cart.items.push({ productId, quantity: 1 });
      }
    }

    await cart.save();
    const populatedCart = await Cart.findOne({ userId }).populate('items.productId');
    res.json(populatedCart);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};
