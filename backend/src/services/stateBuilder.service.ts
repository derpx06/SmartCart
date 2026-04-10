import { Request } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { SmartCartState } from '../types/state';
import { ensureProductEmbedding } from './productEmbedding.service';

export async function buildSmartCartState(req: Request): Promise<SmartCartState> {
    const userId = (req as any).user?.userId ?? 'user_001';

    // 1. Fetch Cart
    const cartDoc = await Cart.findOne({ userId }).lean();
    const cartItems = cartDoc?.items || [];
    const productIds = cartItems.map((item: any) => item.productId);

    // 2. Fetch Products
    const products = await Product.find({
        _id: { $in: productIds }
    }).lean();

    // Ensure embeddings for cart products (small set, safe to compute on request)
    for (const product of products as any[]) {
        if (!product.embedding || product.embedding.length === 0) {
            try {
                const embedding = await ensureProductEmbedding(product);
                if (embedding.length) {
                    await Product.updateOne({ _id: product._id }, { $set: { embedding } });
                    product.embedding = embedding;
                }
            } catch {
                // Skip embedding failures; cart can still load.
            }
        }
    }

    const productMap = new Map(
        products.map((p: any) => [p._id.toString(), p])
    );

    // 3. Build Cart State
    const enrichedItems = cartItems.map((item: any) => {
        const product = productMap.get(item.productId.toString());

        return {
            productId: item.productId.toString(),
            slug: typeof product?.slug === 'string' ? product.slug : '',
            name: product?.name || 'Unknown',
            category: product?.category || 'unknown',
            price: product?.price?.selling || 0,
            quantity: item.quantity || 1,
            embedding: product?.embedding || [],
        };
    });

    const totalItems = enrichedItems.length;
    const categories = [...new Set(enrichedItems.map((i) => i.category))];
    const totalValue = enrichedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    // 4. Inventory from product stock (updates after checkout decrements)
    const inventory: SmartCartState['inventory'] = {};
    enrichedItems.forEach((item) => {
        const p = productMap.get(item.productId);
        if (!p) {
            inventory[item.productId] = 'OUT_OF_STOCK';
            return;
        }
        if (p.stock?.status === 'OUT_OF_STOCK') {
            inventory[item.productId] = 'OUT_OF_STOCK';
            return;
        }
        const qty = Number(p.stock?.quantity ?? 0);
        inventory[item.productId] = qty > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK';
    });

    // 5. Extract Session Signals
    const sessionData = extractSession(req);

    // 6. Build Final State
    return {
        cart: {
            items: enrichedItems,
            totalItems,
            categories,
            totalValue
        },
        user: userId ? { id: userId } : null,
        session: sessionData,
        inventory
    };
}

function extractSession(req: Request) {
    const actions = (req.headers['x-actions'] as string)?.split(',') || [];
    const timeSpent = Number(req.headers['x-time-spent'] || 0);

    const numAdds = actions.filter((a) => a.toLowerCase().includes('add')).length;
    const numRemoves = actions.filter((a) => a.toLowerCase().includes('remove')).length;

    let behavior: 'fast' | 'normal' | 'slow' = 'normal';
    if (timeSpent < 60) behavior = 'fast';
    else if (timeSpent > 180) behavior = 'slow';

    let confidence = 0.8;
    if (numRemoves >= 2) confidence = 0.3;
    else if (numRemoves === 1) confidence = 0.5;

    return {
        timeSpent,
        numActions: actions.length,
        numAdds,
        numRemoves,
        behavior,
        confidence
    };
}
