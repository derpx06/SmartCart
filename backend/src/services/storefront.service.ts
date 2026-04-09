import type { Request } from 'express';

import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import { ensureCatalogSeededFromSkus } from './catalogSync.service';

function mediaUrl(req: Request, path: string): string {
  if (!path) {
    return '';
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const imagePath = normalizedPath.startsWith('/images/')
    ? normalizedPath
    : `/images${normalizedPath}`;

  return `${req.protocol}://${req.get('host')}${imagePath}`;
}

function money(value: number): string {
  return `$${value.toFixed(2)}`;
}

function titleCase(value: string): string {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

function productSummary(req: Request, product: any) {
  return {
    id: product._id.toString(),
    slug: product.slug,
    name: product.name,
    price: money(Number(product.price?.selling ?? 0)),
    rating: Number(product.ratings?.average ?? 4.5),
    image: mediaUrl(req, product.images?.[0] || ''),
  };
}

function buildFeatures(product: any): string[] {
  return [
    product.attributes?.material ? `Crafted in ${titleCase(product.attributes.material)}` : '',
    product.stock?.status === 'IN_STOCK' ? 'Ready to ship' : 'Limited availability',
    product.category ? `${titleCase(product.category)} collection favorite` : '',
  ].filter(Boolean);
}

export async function getHomeContent(req: Request) {
  await ensureCatalogSeededFromSkus();
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  const topProducts = products.slice(0, 8);
  const uniqueCategories = [...new Set(products.map((product: any) => product.category).filter(Boolean))];

  return {
    heroSlides: topProducts.slice(0, 3).map((product: any, index: number) => ({
      id: `hero-${index + 1}`,
      title: product.name,
      subtitle: product.description || `Discover premium ${product.category} selected for modern homes.`,
      ctaLabel: 'Shop Now',
      image: mediaUrl(req, product.images?.[0] || ''),
      slug: product.slug,
    })),
    categories: uniqueCategories.slice(0, 6).map((category: string, index: number) => {
      const match = products.find((product: any) => product.category === category);
      return {
        id: `category-${index + 1}`,
        title: titleCase(category),
        image: mediaUrl(req, match?.images?.[0] || ''),
      };
    }),
    collections: topProducts.slice(0, 3).map((product: any, index: number) => ({
      id: `collection-${index + 1}`,
      title: titleCase(product.category || 'Featured'),
      subtitle: product.description || 'Curated objects with refined utility.',
      image: mediaUrl(req, product.images?.[0] || ''),
    })),
    bestsellers: topProducts.slice(0, 4).map((product: any) => productSummary(req, product)),
    recommendedProducts: topProducts.slice(4, 8).map((product: any) => productSummary(req, product)),
  };
}

export async function getProductDetail(req: Request, slug: string) {
  await ensureCatalogSeededFromSkus();
  const product = await Product.findOne({ slug }).lean();

  if (!product) {
    return null;
  }

  const relatedProducts = await Product.find({ _id: { $ne: product._id }, category: product.category })
    .limit(3)
    .lean();

  return {
    slug: product.slug,
    id: product._id.toString(),
    brand: titleCase(product.brand || 'SmartCart Atelier'),
    name: product.name,
    price: Number(product.price?.selling ?? 0),
    originalPrice: product.price?.original ? Number(product.price.original) : undefined,
    rating: Number(product.ratings?.average ?? 4.6),
    reviewCount: Number(product.ratings?.count ?? 24),
    badge: product.stock?.status === 'IN_STOCK' ? 'In Stock' : 'Limited',
    shippingLine: product.stock?.status === 'IN_STOCK' ? 'Free Premium Shipping' : 'Backorder Available',
    shippingEta: product.stock?.status === 'IN_STOCK' ? 'Estimated delivery: 3-5 business days' : 'Estimated delivery: 7-10 business days',
    description: product.description || 'Curated craftsmanship designed for elegant daily use.',
    features: buildFeatures(product),
    colors: [
      { id: 'signature', name: titleCase(product.attributes?.color || 'Signature'), hex: '#8d6e63' },
      { id: 'ivory', name: 'Ivory', hex: '#e8dfd5' },
      { id: 'midnight', name: 'Midnight', hex: '#1f2937' },
    ],
    selectedColorId: 'signature',
    sizes: ['Standard', 'Large', 'Collector'],
    selectedSize: 'Standard',
    images: (product.images || []).map((image: string) => mediaUrl(req, image)),
    related: relatedProducts.map((related: any) => ({
      id: related._id.toString(),
      slug: related.slug,
      name: related.name,
      price: money(Number(related.price?.selling ?? 0)),
      image: mediaUrl(req, related.images?.[0] || ''),
    })),
    reviews: [
      {
        id: `${product._id.toString()}-review-1`,
        title: 'Beautiful finish and excellent build.',
        body: 'The quality is immediately obvious. It feels substantial and looks refined in person.',
        author: 'A. Customer',
        date: 'Apr 2, 2026',
        rating: 5,
        verified: true,
      },
      {
        id: `${product._id.toString()}-review-2`,
        title: 'Exactly what I wanted.',
        body: 'Shipping was smooth and the product matched the photos closely.',
        author: 'M. Host',
        date: 'Mar 18, 2026',
        rating: 4,
        verified: true,
      },
    ],
  };
}

export async function getRecipeContent() {
  await ensureCatalogSeededFromSkus();
  const products = await Product.find().limit(3).lean();

  return {
    tabName: 'Recipe',
    description: 'Discover practical recipes linked with tools and ingredients to buy.',
    iconName: 'restaurant-outline',
    items: products.map((product: any, index: number) => ({
      title: `Chef Pick ${index + 1}`,
      detail: `Pair ${product.name} with seasonal ingredients and guided prep steps.`,
    })),
  };
}

export async function getRegistryContent() {
  await ensureCatalogSeededFromSkus();
  const products = await Product.find().limit(3).lean();

  return {
    tabName: 'Registry',
    description: 'Create and manage gift registries with premium onboarding and tracking.',
    iconName: 'gift-outline',
    items: products.map((product: any, index: number) => ({
      title: `Registry Idea ${index + 1}`,
      detail: `Feature ${product.name} as a priority gift with fulfillment tracking and guest notes.`,
    })),
  };
}

export async function listOrdersForUser(req: Request) {
  await ensureCatalogSeededFromSkus();
  const userId = req.user?.userId ?? 'user_001';
  const user = await User.findOne({ id: userId }).lean();
  const orders = await Order.find({ userId }).populate('items.productId').sort({ createdAt: -1 }).lean();

  return orders.map((order: any) => ({
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
  }));
}
