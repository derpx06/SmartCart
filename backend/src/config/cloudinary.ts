import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'smartcart_products',
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  } as any // type override for params interface
});

// For 3D models and other raw files
const rawStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'smartcart_models_3d',
    resource_type: 'raw',
  } as any
});

export const upload = multer({ storage });
export const uploadRaw = multer({ storage: rawStorage });
export default cloudinary;
