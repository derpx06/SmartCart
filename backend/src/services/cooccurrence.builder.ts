import Order from '../models/Order';
import Product from '../models/Product';
import { cosineSimilarity } from '../utils/vector';

export async function buildCooccurrenceMap() {
    const orders = await Order.find().lean();
    const map: Record<string, Record<string, number>> = {};

    for (const order of orders) {
        const items = order.items.map((i: any) => i.productId?.toString()).filter(Boolean);

        for (let i = 0; i < items.length; i++) {
            for (let j = 0; j < items.length; j++) {
                if (i === j) continue;

                const a = items[i];
                const b = items[j];

                if (!map[a]) map[a] = {};
                map[a][b] = (map[a][b] || 0) + 1;
            }
        }
    }

    return map;
}

export function normalizeCooccurrence(map: Record<string, Record<string, number>>) {
    const result: Record<string, any> = {};

    for (const item in map) {
        const total = Object.values(map[item]).reduce((a: number, b: number) => a + b, 0);
        result[item] = [];

        for (const related in map[item]) {
            result[item].push({
                productId: related,
                score: map[item][related] / total,
                type: 'co_occurrence'
            });
        }
    }

    return result;
}

export async function getCategoryRelations() {
    const products = await Product.find({}, '_id category').lean();
    const catMap: Record<string, string[]> = {};

    products.forEach((p: any) => {
        if (!catMap[p.category]) catMap[p.category] = [];
        catMap[p.category].push(p._id.toString());
    });

    const result: Record<string, any> = {};
    products.forEach((p: any) => {
        const sameCategory = catMap[p.category].filter(id => id !== p._id.toString());
        result[p._id.toString()] = sameCategory.map(id => ({
            productId: id,
            score: 1.0, // Base category score
            type: 'category'
        }));
    });

    return result;
}

export async function getEmbeddingRelations(allProducts: any[]) {
    const result: Record<string, any> = {};

    for (const product of allProducts) {
        if (!product.embedding || product.embedding.length === 0) continue;

        const relations = allProducts
            .filter(p => p._id.toString() !== product._id.toString() && p.embedding?.length > 0)
            .map(p => ({
                productId: p._id.toString(),
                score: cosineSimilarity(product.embedding, p.embedding),
                type: 'embedding'
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        result[product._id.toString()] = relations;
    }

    return result;
}

export function mergeRelations(cooc: any[] = [], cat: any[] = [], emb: any[] = []) {
    const map: Record<string, number> = {};

    function add(list: any[], weight: number) {
        for (const item of list) {
            if (!map[item.productId]) map[item.productId] = 0;
            map[item.productId] += item.score * weight;
        }
    }

    add(cooc, 0.5);
    add(cat, 0.2);
    add(emb, 0.3);

    return Object.entries(map)
        .map(([productId, score]) => ({ productId, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);
}
