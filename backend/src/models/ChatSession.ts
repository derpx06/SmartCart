import { Schema, model } from 'mongoose';

const chatSessionSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    title: { type: String },
    metadata: { type: Object },
  },
  { timestamps: true }
);

export default model('ChatSession', chatSessionSchema);
