import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import cloudinary from '../config/cloudinary';
import Sku from '../models/Sku';
import Product from '../models/Product';
import { env } from '../config/env';

mongoose.connect(env.mongoUri).then(async () => {
  console.log('Connected to MongoDB');

  try {
    const skus = await Sku.find();
    console.log(`Found ${skus.length} Sku(s) to process.`);
    
    await Product.deleteMany({});
    console.log('Cleared existing Product data.');

    for (const sku of skus) {
      let cloudinaryUrl: string | null = null;
      let originalPath: string | null = null;

      // Extract image path (e.g., "/img17m.jpg")
      const anySku = sku as any;
      if (anySku.media && anySku.media.images && anySku.media.images.length > 0) {
        originalPath = anySku.media.images[0].path;
      }

      if (originalPath) {
        const fileName = originalPath.startsWith('/') ? originalPath.slice(1) : originalPath;
        // Adjusted path resolution for running from project root
        const localFilePath = path.join(process.cwd(), 'images', fileName);

        if (fs.existsSync(localFilePath)) {
          console.log(`Uploading ${fileName} to Cloudinary...`);
          try {
            const uploadResult = await cloudinary.uploader.upload(localFilePath, {
              folder: 'smartcart_products'
            });
            cloudinaryUrl = uploadResult.secure_url;
            console.log(`Uploaded! Cloudinary URL: ${cloudinaryUrl}`);
          } catch (uploadError) {
            console.error(`Failed to upload ${fileName}:`, uploadError);
          }
        } else {
          console.warn(`Local file missing for Sku Data: ${localFilePath}`);
        }
      }

      const newProduct = new Product({
        name: anySku.name || anySku.shortName || 'Unknown Product',
        description: `This is a high-quality ${anySku.properties?.brand || 'item'} available for purchase.`,
        price: anySku.price?.sellingPrice || anySku.price?.regularPrice || 0,
        imageUrl: cloudinaryUrl,
        category: anySku.properties?.productType || 'general',
        stockQuantity: 100
      });

      await newProduct.save();
      console.log(`Created Product: ${newProduct.name}`);
    }

    console.log('Migration completed completely successfully!');
    process.exit(0);

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
  process.exit(1);
});
