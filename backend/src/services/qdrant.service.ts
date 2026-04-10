import { QdrantClient } from '@qdrant/js-client-rest';
import { env } from '../config/env';

const COLLECTION = env.qdrantCollection || 'smartcart_products';
const VECTOR_SIZE = Number(env.embeddingDimensions || 384);

let client: QdrantClient | null = null;
let collectionReady = false;

function enabled() {
  return Boolean(env.qdrantUrl && env.qdrantApiKey);
}

function getClient() {
  if (!enabled()) return null;
  if (!client) {
    client = new QdrantClient({
      url: env.qdrantUrl,
      apiKey: env.qdrantApiKey,
    });
  }
  return client;
}

function toQdrantPointId(productId: string): number {
  // Stable uint32 hash to satisfy Qdrant point ID constraints.
  let h = 0;
  for (let i = 0; i < productId.length; i += 1) {
    h = (h * 33 + productId.charCodeAt(i)) >>> 0;
  }
  return h || 1;
}

export async function ensureQdrantCollection() {
  const c = getClient();
  if (!c || collectionReady) return;

  try {
    const exists = await c.collectionExists(COLLECTION);
    if (!exists.exists) {
      await c.createCollection(COLLECTION, {
        vectors: {
          size: VECTOR_SIZE,
          distance: 'Cosine',
        },
      });
    }
    collectionReady = true;
  } catch (error) {
    console.error('Qdrant ensure collection failed:', error);
  }
}

export async function upsertQdrantProductVector(args: {
  productId: string;
  embedding: number[];
  payload?: Record<string, unknown>;
}) {
  const c = getClient();
  if (!c || !args.embedding?.length) return;
  await ensureQdrantCollection();
  try {
    await c.upsert(COLLECTION, {
      wait: false,
      points: [
        {
          id: toQdrantPointId(args.productId),
          vector: args.embedding,
          payload: { ...(args.payload || {}), mongoId: args.productId },
        },
      ],
    });
  } catch (error) {
    console.error('Qdrant upsert failed:', error);
  }
}

export async function searchQdrantProductIds(vector: number[], limit = 6): Promise<string[]> {
  const c = getClient();
  if (!c || !vector?.length) return [];
  await ensureQdrantCollection();
  try {
    const results = await c.search(COLLECTION, {
      vector,
      limit,
      with_payload: true,
      with_vector: false,
    });
    return results
      .map((r: any) => String(r?.payload?.mongoId || ''))
      .filter(Boolean);
  } catch (error) {
    console.error('Qdrant search failed:', error);
    return [];
  }
}

