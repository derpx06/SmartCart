import { Schema, model } from 'mongoose';

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    category: { type: String },
    stockQuantity: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default model('Product', productSchema);
