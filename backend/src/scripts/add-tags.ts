import mongoose from 'mongoose';
import { env } from '../config/env';
import Product from '../models/Product';

async function updateTags() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(env.mongoUri);
  console.log('Connected! Fetching products...');

  const products = await Product.find({});
  console.log(`Found ${products.length} products. Applying tags...`);

  let updatedCount = 0;

  for (const p of products) {
    const tags = new Set<string>(p.tags || []);
    const cat = p.category;
    const nameStr = p.name.toLowerCase();

    // Default room assignments based on category
    if (['cookware', 'bakeware', 'kitchen tools'].includes(cat)) {
       tags.add('kitchen');
       tags.add('cooking');
    }
    if (cat === 'dining') {
       tags.add('dining room');
       tags.add('kitchen');
       tags.add('entertaining');
    }
    if (cat === 'furniture') {
       tags.add('living room');
       if (nameStr.includes('stool') || nameStr.includes('island')) {
           tags.add('kitchen');
       }
       if (nameStr.includes('chair')) {
           tags.add('dining room');
       }
    }
    if (cat === 'decor') {
       tags.add('living room');
       tags.add('bedroom');
       tags.add('home decor');
    }

    // Add some random specific tags if they make sense
    if (nameStr.includes('knife') || nameStr.includes('cleaver')) {
        tags.add('cutlery');
        tags.add('prep');
    }
    if (nameStr.includes('glass') || nameStr.includes('decanter')) {
        tags.add('drinkware');
    }

    p.tags = Array.from(tags).slice(0, 5); // Limit to ~5 tags so it doesn't get crazy
    await p.save();
    updatedCount++;
    console.log(`   -> [${p.name}] tags: ${p.tags.join(', ')}`);
  }

  console.log(`\\n✅ Successfully seeded tags to ${updatedCount} products!`);
  await mongoose.disconnect();
}

void updateTags();
