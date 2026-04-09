import { connectDatabase } from './config/database';
import Product from './models/Product';
import Cart from './models/Cart';
import Order from './models/Order';
import { env } from './config/env';

async function setupTestData() {
    await connectDatabase();

    const userId = 'user_001';

    // Clear existing items
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});

    const p1 = await Product.create({
        name: 'All-Clad Cookware Set',
        slug: 'all-clad-cookware',
        category: 'Cookware',
        price: { selling: 899.95, original: 999.99 },
        stock: { status: 'IN_STOCK', quantity: 5 },
        embedding: [1.0, 0.05, 0.0, 0.0, 0.05], // Close to cooking [1, 0.1, 0, 0, 0.1]
    });

    const p2 = await Product.create({
        name: 'Le Creuset Dutch Oven',
        slug: 'le-creuset-dutch-oven',
        category: 'Cookware',
        price: { selling: 420.0, original: 420.0 },
        stock: { status: 'IN_STOCK', quantity: 2 },
        embedding: [0.95, 0.1, 0.0, 0.0, 0.1], // Also close to cooking
    });

    await Cart.create({
        userId,
        items: [
            { productId: p1._id, quantity: 1 },
            { productId: p2._id, quantity: 2 },
        ],
    });

    // Add mock orders for co-occurrence
    await Order.create([
        {
            userId: 'user_002',
            items: [
                { productId: p1._id, quantity: 1, priceAtPurchase: 899.95 },
                { productId: p2._id, quantity: 1, priceAtPurchase: 420.00 },
            ],
            totalAmount: 1319.95,
        },
        {
            userId: 'user_003',
            items: [
                { productId: p1._id, quantity: 1, priceAtPurchase: 899.95 },
                { productId: p2._id, quantity: 1, priceAtPurchase: 420.00 },
            ],
            totalAmount: 1319.95,
        }
    ]);

    console.log('Test data setup complete.');
    process.exit(0);
}

setupTestData();
