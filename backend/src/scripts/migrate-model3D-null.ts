import mongoose from 'mongoose';
import { env } from '../config/env';
import Product from '../models/Product';

async function migrateModel3D() {
  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(env.mongoUri);
    console.log('Connected! Fetching products without model3D field...');

    // Products where model3D field does not exist
    const result = await Product.updateMany(
      { model3D: { $exists: false } },
      { $set: { model3D: null } }
    );

    console.log(`Updated ${result.modifiedCount} products with model3D: null.`);
    
    // Also update products where model3D might be an empty object if that happened during schema changes
    const resultEmpty = await Product.updateMany(
      { model3D: {} },
      { $set: { model3D: null } }
    );
    console.log(`Updated ${resultEmpty.modifiedCount} products that had an empty model3D object to null.`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

void migrateModel3D();
