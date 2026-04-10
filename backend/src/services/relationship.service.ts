import Relationship from '../models/Relationship';
import Product from '../models/Product';
import { cosineSimilarity } from '../utils/vector';

export async function getRelatedProducts(productId: string) {
    const rel = await Relationship.findOne({ productId }).lean();
    if (rel?.related?.length) {
        return rel.related.sort((a, b) => b.score - a.score);
    }

    const product = await Product.findById(productId).lean();
    if (!product?.embedding || product.embedding.length === 0) return [];

    const candidates = await Product.find({
        _id: { $ne: productId },
        embedding: { $exists: true, $not: { $size: 0 } }
    }).select('_id embedding').lean();

    return candidates
        .map((p: any) => ({
            productId: p._id.toString(),
            score: cosineSimilarity(product.embedding, p.embedding),
            type: 'embedding'
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);
}
