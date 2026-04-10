import type { Request, Response } from 'express';
import mongoose from 'mongoose';

import Cart from '../models/Cart';
import Order from '../models/Order';
import Product from '../models/Product';
import { bumpCatalogCacheVersion } from '../services/cache.service';

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
  let session: mongoose.ClientSession | null = null;
  try {
    const userId = req.user?.userId ?? 'user_001';
    session = await mongoose.startSession();
    const txSession = session;
    let createdOrder: any = null;

    await txSession.withTransaction(async () => {
      const cart = await Cart.findOne({ userId }).session(txSession);
      if (!cart || cart.items.length === 0) {
        throw new Error('CART_EMPTY');
      }

      const productIds = cart.items.map((item: any) => item.productId);
      const products = await Product.find({ _id: { $in: productIds } }).session(txSession).lean();
      const productById = new Map(products.map((p: any) => [String(p._id), p]));

      let totalAmount = 0;
      const orderItems = cart.items.map((item: any) => {
        const pid = String(item.productId);
        const product = productById.get(pid);
        if (!product) {
          throw new Error('PRODUCT_NOT_FOUND');
        }
        const quantity = Math.max(1, Math.floor(Number(item.quantity ?? 1)));
        const price = Number(product.price?.selling ?? 0);
        totalAmount += price * quantity;
        return {
          productId: item.productId,
          quantity,
          priceAtPurchase: price,
        };
      });

      for (const item of orderItems) {
        const reserved = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            'stock.status': { $ne: 'OUT_OF_STOCK' },
            'stock.quantity': { $gte: item.quantity },
          },
          { $inc: { 'stock.quantity': -item.quantity } },
          { new: true, session: txSession }
        );

        if (!reserved) {
          throw new Error('INSUFFICIENT_STOCK');
        }

        const nextQty = Number(reserved.stock?.quantity ?? 0);
        const nextStatus = nextQty <= 0 ? 'OUT_OF_STOCK' : 'IN_STOCK';
        const currentStatus = reserved.stock?.status ?? 'IN_STOCK';
        if (currentStatus !== nextStatus) {
          await Product.updateOne(
            { _id: reserved._id },
            { $set: { 'stock.status': nextStatus } },
            { session: txSession }
          );
        }
      }

      const [order] = await Order.create(
        [
          {
            userId,
            items: orderItems,
            totalAmount,
            status: 'ordered',
          },
        ],
        { session: txSession }
      );
      createdOrder = order;

      cart.set('items', []);
      await cart.save({ session: txSession });
    });

    await bumpCatalogCacheVersion();
    res.json(createdOrder);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'CART_EMPTY') {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }
    if (message === 'INSUFFICIENT_STOCK') {
      res.status(409).json({ error: 'One or more items are out of stock.' });
      return;
    }
    if (message === 'PRODUCT_NOT_FOUND') {
      res.status(404).json({ error: 'A product in cart was not found.' });
      return;
    }
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (session) {
      await session.endSession();
    }
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
