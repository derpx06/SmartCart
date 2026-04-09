import { Schema, model } from 'mongoose';

const buyLaterSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export default model('BuyLater', buyLaterSchema);
