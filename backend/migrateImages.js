require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const Sku = require('./models/Sku');
const Product = require('./models/Product');

// Configure Cloudinary explicitly in the script just in case
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI).then(async () => {
  console.log('Connected to MongoDB');

  try {
    const skus = await Sku.find();
    console.log(`Found ${skus.length} Sku(s) to process.`);
    
    // Clear the existing Product collection first to prevent duplicates 
    // when running multiple times
    await Product.deleteMany({});
    console.log('Cleared existing Product data.');

    for (let sku of skus) {
      let cloudinaryUrl = null;
      let originalPath = null;

      // Extract image path (e.g., "/img17m.jpg")
      if (sku.media && sku.media.images && sku.media.images.length > 0) {
        originalPath = sku.media.images[0].path;
      }

      if (originalPath) {
        // Build the absolute local path to the image file
        // Removes the leading "/" and attaches to backend/images directory
        const fileName = originalPath.startsWith('/') ? originalPath.slice(1) : originalPath;
        const localFilePath = path.join(__dirname, 'images', fileName);

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

      // Convert Sku into a new Product document
      const newProduct = new Product({
        name: sku.name || sku.shortName || 'Unknown Product',
        description: `This is a high-quality ${sku.properties?.brand || 'item'} available for purchase.`, // Generated stub description
        price: sku.price?.sellingPrice || sku.price?.regularPrice || 0,
        imageUrl: cloudinaryUrl, // Cloudinary URL assigned here
        category: sku.properties?.productType || 'general',
        stockQuantity: 100 // Default stock
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
