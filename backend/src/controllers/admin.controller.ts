import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import Admin from '../models/Admin';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import { ensureCatalogSeededFromSkus, syncSingleProductFromSkuLikeInput } from '../services/catalogSync.service';
import { vectorizeAndSyncProduct } from '../services/productEmbedding.service';
import { bumpCatalogCacheVersion } from '../services/cache.service';
import { listAllOrders, listOrdersForUser } from '../services/storefront.service';

function toAdminProduct(product: any) {
  return {
    id: product._id.toString(),
    name: product.name,
    price: Number(product.price?.selling ?? 0),
    inventory: Number(product.stock?.quantity ?? 0),
    category: product.category,
    description: product.description || '',
    images: Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []),
    tags: Array.isArray(product.tags) ? product.tags : [],
  };
}

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body ?? {};

  try {
    const admin = await Admin.findOne({ email });
    if (!admin || admin.password !== password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: admin.id, isAdmin: true }, env.jwtSecret, { expiresIn: '12h' });
    res.json({ token, userId: admin.id, name: admin.name, role: 'admin' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAdminDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureCatalogSeededFromSkus();
    const products = await Product.find().lean();
    const orders = await listOrdersForUser(req);
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);

    res.json({
      totalSales,
      pendingOrders: orders.filter((order) => order.status === 'Ordered').length,
      popularProduct: products[0] ? toAdminProduct(products[0]) : null,
      leastSoldProduct: products[products.length - 1] ? toAdminProduct(products[products.length - 1]) : null,
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAdminProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, Number(_req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(_req.query.limit) || 25));
    const skip = (page - 1) * limit;
    await ensureCatalogSeededFromSkus();
    const [products, total] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(),
    ]);
    res.json({
      data: products.map(toAdminProduct),
      pagination: {
        page,
        limit,
        total,
        hasNext: page * limit < total,
      },
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAdminProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureCatalogSeededFromSkus();
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    try {
      const embedding = await vectorizeAndSyncProduct(product as any);
      if (embedding.length) {
        await Product.updateOne({ _id: product._id }, { $set: { embedding } });
      }
    } catch {
      // Skip embedding updates if local embedding fails.
    }

    res.json(toAdminProduct(product));
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createAdminProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await syncSingleProductFromSkuLikeInput(req.body);
    await bumpCatalogCacheVersion();
    res.status(201).json(toAdminProduct(product));
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateAdminProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, description, images, inventory, price, tags } = req.body ?? {};
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...(name ? { name } : {}),
        ...(category ? { category, subCategory: category } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(images !== undefined ? { images } : {}),
        ...(tags !== undefined ? { tags } : {}),
        ...(inventory !== undefined
          ? {
              stock: {
                status: Number(inventory) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
                quantity: Number(inventory),
              },
            }
          : {}),
        ...(price !== undefined ? { price: { selling: Number(price) } } : {}),
      },
      { new: true },
    ).lean();

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    try {
      const embedding = await vectorizeAndSyncProduct(product as any);
      if (embedding.length) {
        await Product.updateOne({ _id: product._id }, { $set: { embedding } });
      }
    } catch {
      // Skip embedding updates if local embedding fails.
    }

    await bumpCatalogCacheVersion();
    res.json(toAdminProduct(product));
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteAdminProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    await bumpCatalogCacheVersion();
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAdminOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
    res.json(await listAllOrders({ page, limit }));
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAdminOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate('items.productId').lean();
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const user = await User.findOne({ id: order.userId }).lean();
    res.json({
      id: order._id.toString(),
      customerName: user?.name || 'Demo User',
      total: Number(order.totalAmount ?? 0),
      status:
        order.status === 'ordered'
          ? 'Ordered'
          : order.status === 'on_the_way'
            ? 'On the way'
            : order.status === 'failed'
              ? 'Failed'
              : 'Delivered',
      date: new Date(order.createdAt).toISOString().slice(0, 10),
      items: order.items.map((item: any) => ({
        productId: item.productId?._id?.toString?.() || '',
        name: item.productId?.name || 'Unknown Product',
        quantity: Number(item.quantity ?? 0),
        price: Number(item.priceAtPurchase ?? item.productId?.price?.selling ?? 0),
      })),
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateAdminOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const rawStatus = String(req.body?.status ?? '').toLowerCase().replace(/ /g, '_');
  const status = rawStatus === 'ordered' || rawStatus === 'on_the_way' || rawStatus === 'failed' || rawStatus === 'delivered'
    ? rawStatus
    : null;

  if (!status) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).lean();
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({ id: order._id.toString(), status });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

import mongoose from 'mongoose';

export const updateAdminOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { total, items, status } = req.body ?? {};

    const formattedItems = [];
    for (const item of (items || [])) {
      let pid = item.productId;
      if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
        const existing = await Product.findOne({ name: { $regex: new RegExp(`^${item.name}$`, 'i') } });
        if (existing) {
          pid = existing._id.toString();
        } else {
          const dummyProd = await Product.create({
             name: item.name || 'Custom Order Item',
             slug: `custom-item-${Date.now()}-${Math.floor(Math.random()*1000)}`,
             category: 'decor',
             price: { selling: Number(item.price) || 0 },
             stock: { status: 'OUT_OF_STOCK', quantity: 0 }
          });
          pid = dummyProd._id.toString();
        }
      }
      formattedItems.push({
        productId: pid,
        quantity: Number(item.quantity) || 1,
        priceAtPurchase: Number(item.price) || 0,
      });
    }

    const rawStatus = String(status ?? '').toLowerCase().replace(/ /g, '_');
    const finalStatus = rawStatus === 'ordered' || rawStatus === 'on_the_way' || rawStatus === 'failed' || rawStatus === 'delivered'
      ? rawStatus
      : undefined;

    const updatePayload: any = {};
    if (total !== undefined) updatePayload.totalAmount = Number(total);
    if (items !== undefined) updatePayload.items = formattedItems;
    if (finalStatus) updatePayload.status = finalStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, updatePayload, { new: true }).lean();

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Order update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
