import { connectDatabase } from './config/database';
import Product from './models/Product';
import { env } from './config/env';

async function checkProducts() {
    await connectDatabase();
    const count = await Product.countDocuments();
    console.log(`Product count: ${count}`);
    const products = await Product.find().limit(5).lean();
    console.log('Sample products:', JSON.stringify(products, null, 2));
    process.exit(0);
}

checkProducts();
