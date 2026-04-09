import { connectDatabase } from '../config/database';
import Product from '../models/Product';
import Relationship from '../models/Relationship';
import {
    buildCooccurrenceMap,
    normalizeCooccurrence,
    getCategoryRelations,
    getEmbeddingRelations,
    mergeRelations
} from '../services/cooccurrence.builder';

async function rebuild() {
    await connectDatabase();
    console.log('Rebuilding Relationship Graph...');

    const products = await Product.find().lean();
    const coocMap = await buildCooccurrenceMap();
    const normalizedCooc = normalizeCooccurrence(coocMap);
    const catRelations = await getCategoryRelations();
    const embRelations = await getEmbeddingRelations(products);

    for (const product of products) {
        const productId = product._id.toString();

        const merged = mergeRelations(
            normalizedCooc[productId] || [],
            catRelations[productId] || [],
            embRelations[productId] || []
        );

        await Relationship.findOneAndUpdate(
            { productId },
            { related: merged },
            { upsert: true }
        );
    }

    console.log('Graph rebuild complete.');
    process.exit(0);
}

rebuild();
