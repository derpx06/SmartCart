import 'dotenv/config';

import mongoose from 'mongoose';

import { env } from '../config/env';
import Product from '../models/Product';

type CategoryPreset = {
  keywords: string[];
  images: string[];
  description: string;
};

const categoryPresets: CategoryPreset[] = [
  {
    keywords: ['dutch', 'cookware', 'skillet', 'pan', 'cast', 'oven'],
    images: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1583778176476-4a8b02a64c40?auto=format&fit=crop&w=1400&q=80',
    ],
    description:
      'A chef-grade essential designed for even heat, durable performance, and timeless presentation.',
  },
  {
    keywords: ['coffee', 'electrics', 'kettle', 'appliance'],
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1400&q=80',
    ],
    description:
      'Thoughtfully engineered for precision brewing and elevated daily rituals at home.',
  },
  {
    keywords: ['glass', 'bar', 'cup', 'saucer', 'tabletop', 'serveware'],
    images: [
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1400&q=80',
    ],
    description:
      'Elegant tabletop craftsmanship that blends modern luxury with everyday utility.',
  },
  {
    keywords: ['board', 'cutting', 'storage', 'homekeeping', 'lazy', 'susan'],
    images: [
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=1400&q=80',
    ],
    description:
      'Smart, space-conscious pieces that bring order, texture, and warmth to your kitchen.',
  },
];

const fallbackImages = [
  'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80',
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function normalize(value: string | undefined): string {
  return (value || '').toLowerCase();
}

function choosePreset(product: {
  category?: string;
  subCategory?: string;
  name?: string;
}): CategoryPreset | null {
  const text = `${normalize(product.category)} ${normalize(product.subCategory)} ${normalize(product.name)}`;
  return categoryPresets.find((preset) => preset.keywords.some((keyword) => text.includes(keyword))) || null;
}

async function run(): Promise<void> {
  if (!env.mongoUri) {
    throw new Error('MONGO_URI is missing in backend environment.');
  }

  await mongoose.connect(env.mongoUri);
  console.log('Connected to MongoDB');

  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    if (!products.length) {
      console.log('No products found. Nothing to enrich.');
      return;
    }

    let updatedCount = 0;
    for (const product of products) {
      const preset = choosePreset({
        category: product.category,
        subCategory: product.subCategory,
        name: product.name,
      });
      const imageSet = preset?.images || fallbackImages;

      const safeSlug = product.slug || slugify(product.name || `product-${product._id.toString()}`);
      const currentPrice = Number((product as any).price?.selling ?? (product as any).price ?? 0);
      const safePrice = Number.isFinite(currentPrice) && currentPrice > 0 ? currentPrice : 99;
      const safeDescription =
        product.description && product.description.length >= 40
          ? product.description
          : preset?.description || 'Premium design and quality crafted for modern homes.';
      const safeRatings = {
        average:
          product.ratings?.average && product.ratings.average > 0 ? product.ratings.average : 4.7,
        count: product.ratings?.count && product.ratings.count > 0 ? product.ratings.count : 32,
      };

      await Product.updateOne(
        { _id: product._id },
        {
          $set: {
            slug: safeSlug,
            images: imageSet,
            description: safeDescription,
            ratings: safeRatings,
            price: {
              ...(typeof (product as any).price === 'object' ? (product as any).price : {}),
              selling: safePrice,
            },
          },
        },
      );
      updatedCount += 1;
    }

    console.log(`Enriched ${updatedCount} product records with better storefront data.`);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

void run().catch((error: unknown) => {
  console.error('Failed to enrich storefront data:', error);
  process.exit(1);
});
