import { embedText } from './embedding.service';

export function buildEmbeddingText(product: {
  name?: string;
  description?: string | null;
  brand?: string | null;
  category?: string;
  subCategory?: string | null;
  tags?: string[];
  attributes?: Record<string, any> | null;
}): string {
  const parts: string[] = [];

  if (product.name) parts.push(product.name);
  if (product.description) parts.push(product.description);
  if (product.brand) parts.push(`Brand: ${product.brand}`);
  if (product.category) parts.push(`Category: ${product.category}`);
  if (product.subCategory) parts.push(`Subcategory: ${product.subCategory}`);

  if (Array.isArray(product.tags) && product.tags.length) {
    parts.push(`Tags: ${product.tags.filter(Boolean).join(', ')}`);
  }

  if (product.attributes) {
    const attrs = Object.entries(product.attributes)
      .map(([key, value]) => (value ? `${key}: ${value}` : ''))
      .filter(Boolean);
    if (attrs.length) parts.push(`Attributes: ${attrs.join(', ')}`);
  }

  return parts.join('. ');
}

export async function embedProduct(product: {
  name?: string;
  description?: string | null;
  brand?: string | null;
  category?: string;
  subCategory?: string | null;
  tags?: string[];
  attributes?: Record<string, any> | null;
}): Promise<number[]> {
  const text = buildEmbeddingText(product);
  return embedText(text);
}

export async function ensureProductEmbedding(
  product: { embedding?: number[] } & {
    name?: string;
    description?: string | null;
    brand?: string | null;
    category?: string;
    subCategory?: string | null;
    tags?: string[];
    attributes?: Record<string, any> | null;
  }
): Promise<number[]> {
  if (Array.isArray(product.embedding) && product.embedding.length) {
    return product.embedding;
  }
  return embedProduct(product);
}
