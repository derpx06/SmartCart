import type { Request, Response } from 'express';

import Wishlist from '../models/Wishlist';

export const getWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId ?? 'user_001';
    const wishlist = await Wishlist.findOne({ userId }).populate('items.productId');
    res.json(wishlist ?? { items: [] });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const addToWishlist = async (req: Request, res: Response): Promise<void> => {
  const { productId } = req.body;

  try {
    const userId = req.user?.userId ?? 'user_001';
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [{ productId }] });
    } else if (!wishlist.items.some((p) => p.productId.toString() === productId)) {
      wishlist.items.push({ productId });
    }

    await wishlist.save();
    const populatedWishlist = await Wishlist.findOne({ userId }).populate('items.productId');
    res.json(populatedWishlist);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeFromWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId ?? 'user_001';
    const wishlist = await Wishlist.findOne({ userId });

    if (wishlist) {
      const filteredItems = wishlist.items.filter((p) => p.productId.toString() !== req.params.productId);
      wishlist.set('items', filteredItems);
      await wishlist.save();
    }

    const populatedWishlist = await Wishlist.findOne({ userId }).populate('items.productId');
    res.json(populatedWishlist);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};
