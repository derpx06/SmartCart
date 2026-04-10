import type { Request, Response } from 'express';

import Cart from '../models/Cart';
import Order from '../models/Order';
import Product from '../models/Product';

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
      status: 'ordered',
    });

    await order.save();

    for (const raw of cart.items) {
      const item = raw as { productId: { _id?: unknown }; quantity?: number };
      const pid = item.productId?._id;
      if (!pid) {
        continue;
      }
      const dec = Math.max(0, Math.floor(Number(item.quantity ?? 0)));
      if (dec < 1) {
        continue;
      }
      const doc = await Product.findById(pid);
      if (!doc) {
        continue;
      }
      const cur = Number(doc.stock?.quantity ?? 0);
      const next = Math.max(0, cur - dec);
      if (!doc.stock) {
        doc.set('stock', { status: next <= 0 ? 'OUT_OF_STOCK' : 'IN_STOCK', quantity: next });
      } else {
        doc.stock.quantity = next;
        doc.stock.status = next <= 0 ? 'OUT_OF_STOCK' : 'IN_STOCK';
      }
      doc.markModified('stock');
      await doc.save();
    }

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
        { label: 'Ordered', complete: true },
        { label: 'Processing', complete: order.status === 'on_the_way' || order.status === 'delivered' },
        { label: 'On the way', complete: order.status === 'on_the_way' || order.status === 'delivered' },
        { label: 'Delivered', complete: order.status === 'delivered' },
      ],
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};
