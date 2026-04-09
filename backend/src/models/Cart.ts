import { Schema, model } from 'mongoose';

const cartSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
  },
  { timestamps: true },
);

export default model('Cart', cartSchema);
