import { Schema, model } from 'mongoose';

const orderSchema = new Schema(
  {
    userId: { type: String, required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        priceAtPurchase: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['ordered', 'on_the_way', 'delivered', 'failed'],
      default: 'ordered',
    },
  },
  { timestamps: true },
);

export default model('Order', orderSchema);
