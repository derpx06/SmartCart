import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import Admin from '../models/Admin';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import { ensureCatalogSeededFromSkus, syncSingleProductFromSkuLikeInput } from '../services/catalogSync.service';
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
      pendingOrders: orders.filter((order) => order.status === 'Pending').length,
      popularProduct: products[0] ? toAdminProduct(products[0]) : null,
      leastSoldProduct: products[products.length - 1] ? toAdminProduct(products[products.length - 1]) : null,
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAdminProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    await ensureCatalogSeededFromSkus();
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    res.json(products.map(toAdminProduct));
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

    res.json(toAdminProduct(product));
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createAdminProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await syncSingleProductFromSkuLikeInput(req.body);
    res.status(201).json(toAdminProduct(product));
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateAdminProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, description, images, inventory, price } = req.body ?? {};
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...(name ? { name } : {}),
        ...(category ? { category, subCategory: category } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(images !== undefined ? { images } : {}),
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

    res.json(toAdminProduct(product));
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteAdminProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAdminOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await listAllOrders());
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
        order.status === 'pending'
          ? 'Pending'
          : order.status === 'shipped'
            ? 'Shipped'
            : order.status === 'cancelled'
              ? 'Cancelled'
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
  const rawStatus = String(req.body?.status ?? '').toLowerCase();
  const status = rawStatus === 'pending' || rawStatus === 'shipped' || rawStatus === 'cancelled' || rawStatus === 'completed'
    ? rawStatus
    : rawStatus === 'delivered'
      ? 'completed'
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
