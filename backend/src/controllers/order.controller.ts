import type { Request, Response } from 'express';

import Cart from '../models/Cart';
import Order from '../models/Order';

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId ?? 'user_001';
    const orders = await Order.find({ userId }).populate('items.productId').sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const checkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId ?? 'user_001';
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    let totalAmount = 0;
    const orderItems = cart.items.map((item: any) => {
      const price = item.productId.price || 0;
      totalAmount += price * item.quantity;
      return {
        productId: item.productId._id,
        quantity: item.quantity,
        priceAtPurchase: price,
      };
    });

    const order = new Order({
      userId,
      items: orderItems,
      totalAmount,
      status: 'completed',
    });

    await order.save();
    cart.set('items', []);
    await cart.save();

    res.json(order);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};
