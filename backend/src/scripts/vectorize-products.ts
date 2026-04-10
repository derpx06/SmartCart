import { connectDatabase } from '../config/database';
import Product from '../models/Product';
import { vectorizeAndSyncProduct } from '../services/productEmbedding.service';
import { ensureQdrantCollection } from '../services/qdrant.service';

async function run() {
  await connectDatabase();
  await ensureQdrantCollection();
  const products = await Product.find().lean();

  let updated = 0;
  for (const product of products) {
    try {
      const embedding = await vectorizeAndSyncProduct(product as any);
      if (!embedding.length) continue;
      await Product.updateOne({ _id: product._id }, { $set: { embedding } });
      updated += 1;
      if (updated % 20 === 0) {
        console.log(`Vectorized ${updated}/${products.length}`);
      }
    } catch (error) {
      console.error(`Failed to vectorize ${product._id}:`, error);
    }
  }

  console.log(`Vectorization complete. Updated ${updated} products.`);
  process.exit(0);
}

run().catch((error) => {
  console.error('Vectorization failed:', error);
  process.exit(1);
});
