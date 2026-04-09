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
      const price = Number(item.productId.price?.selling ?? 0);
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

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId ?? 'user_001';
    const order = await Order.findOne({ _id: req.params.id, userId }).populate('items.productId');

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(order);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getOrderTracking = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId ?? 'user_001';
    const order = await Order.findOne({ _id: req.params.id, userId }).lean();

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({
      orderId: order._id.toString(),
      status: order.status,
      checkpoints: [
        { label: 'Order placed', complete: true },
        { label: 'Processing', complete: true },
        { label: 'Shipped', complete: order.status === 'shipped' || order.status === 'completed' },
        { label: 'Delivered', complete: order.status === 'completed' },
      ],
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};
