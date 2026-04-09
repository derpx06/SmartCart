import type { Request, Response } from 'express';

import Cart from '../models/Cart';

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
