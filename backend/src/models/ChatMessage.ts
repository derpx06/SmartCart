import { Schema, model } from 'mongoose';

const chatMessageSchema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    userId: { type: String, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    products: [
      {
        productId: { type: String, required: true },
      },
    ],
    metadata: { type: Object },
  },
  { timestamps: true }
);

export default model('ChatMessage', chatMessageSchema);
