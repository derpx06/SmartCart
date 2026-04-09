import { Schema, model } from 'mongoose';

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      unique: true
    },

    description: {
      type: String
    },

    brand: {
      type: String,
      index: true
    },

    category: {
      type: String,
      required: true,
      index: true
    },

    subCategory: {
      type: String,
      index: true
    },

    price: {
      selling: { type: Number, required: true },
      original: { type: Number }
    },

    attributes: {
      material: { type: String, index: true },
      color: { type: String },
      capacity: { type: String }, // e.g. 7qt, 2L
      isDishwasherSafe: { type: Boolean, default: false }
    },

    images: [
      {
        type: String
      }
    ],

    stock: {
      status: {
        type: String,
        enum: ['IN_STOCK', 'OUT_OF_STOCK'],
        default: 'IN_STOCK'
      },
      quantity: {
        type: Number,
        default: 0
      }
    },

    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    },

    tags: [
      {
        type: String,
        index: true
      }
    ],

    embedding: [
      {
        type: Number
      }
    ],

  },
  { timestamps: true }
);


// 🔥 Indexes for performance
productSchema.index({ name: 'text', tags: 'text' });
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ 'price.selling': 1 });

export default model('Product', productSchema);