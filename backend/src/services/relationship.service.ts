import Relationship from '../models/Relationship';

export async function getRelatedProducts(productId: string) {
    const rel = await Relationship.findOne({ productId }).lean();
    if (!rel) return [];

    return rel.related.sort((a, b) => b.score - a.score);
}
