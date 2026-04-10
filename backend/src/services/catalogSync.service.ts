import Product from '../models/Product';
import Sku from '../models/Sku';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function guessCategory(sku: any): string {
  return (
    sku.properties?.productType ||
    sku.properties?.pattern ||
    (sku.properties?.isFurniture === 'true' ? 'furniture' : '') ||
    'home'
  )
    .toString()
    .replace(/-/g, ' ')
    .trim();
}

function guessSubCategory(sku: any): string {
  return (sku.properties?.allProductTypes || sku.properties?.productType || '').toString();
}

function guessImagePaths(sku: any): string[] {
  const imagePaths = Array.isArray(sku.media?.images)
    ? sku.media.images.map((image: any) => image?.path).filter(Boolean)
    : [];

  return imagePaths.length ? imagePaths : ['/images/img17m.jpg'];
}

function buildProductPayload(sku: any) {
  const sellingPrice = Number(sku.price?.sellingPrice ?? sku.price?.retailPrice ?? 0);
  const originalPrice = Number(sku.price?.retailPrice ?? sku.price?.regularPrice ?? sellingPrice);
  const stockStatus = 'IN_STOCK' as const;
  const quantity = 99;

  return {
    name: sku.shortName || sku.name,
    slug: slugify(sku.primaryGroupId || sku.shortName || sku.name || sku.id),
    description:
      `Curated ${guessCategory(sku)} piece crafted in ${sku.properties?.material || 'premium materials'} ` +
      `with ${sku.properties?.brand || 'atelier'} finishing.`,
    brand: sku.properties?.brand || 'SmartCart Atelier',
    category: guessCategory(sku),
    subCategory: guessSubCategory(sku),
    price: {
      selling: sellingPrice,
      original: originalPrice > sellingPrice ? originalPrice : undefined,
    },
    attributes: {
      material: sku.properties?.material || '',
      color: sku.properties?.color || '',
      capacity: sku.properties?.capacity || '',
      isDishwasherSafe: false,
    },
    images: guessImagePaths(sku),
    stock: {
      status: stockStatus,
      quantity,
    },
    ratings: {
      average: 4.2 + (Number(String(sku.id).slice(-1)) % 8) / 10,
      count: 18 + (Number(String(sku.id).slice(-2)) % 140),
    },
    tags: [
      sku.properties?.productType,
      sku.properties?.material,
      sku.properties?.brand,
      sku.properties?.pattern,
    ].filter(Boolean),
    embedding: [],
  };
}

export async function ensureCatalogSeededFromSkus(): Promise<void> {
  const productCount = await Product.countDocuments();
  if (productCount > 0) {
    return;
  }

  const skus = await Sku.find().lean();
  if (!skus.length) {
    return;
  }

  await Product.insertMany(skus.map(buildProductPayload), { ordered: false });
}

export async function syncSingleProductFromSkuLikeInput(input: {
  name: string;
  category: string;
  description?: string;
  images?: string[];
  inventory: number;
  price: number;
}): Promise<any> {
  const payload = {
    name: input.name,
    slug: slugify(input.name),
    description: input.description || '',
    brand: 'SmartCart Atelier',
    category: input.category,
    subCategory: input.category,
    price: {
      selling: input.price,
      original: undefined,
    },
    attributes: {
      material: '',
      color: '',
      capacity: '',
      isDishwasherSafe: false,
    },
    images: input.images || [],
    stock: {
      status: 'IN_STOCK',
      quantity: Math.max(Number(input.inventory) || 0, 99),
    },
    ratings: {
      average: 4.6,
      count: 0,
    },
    tags: [input.category],
    embedding: [],
  };

  return Product.create(payload);
}
