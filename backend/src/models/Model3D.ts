import { Schema, model, Document } from 'mongoose';

export interface IModel3D extends Document {
  name: string;
  url: string;
  publicId: string;
  format: string;
  size: number;
  productId?: string; // Optional link to a product
  createdAt: Date;
  updatedAt: Date;
}

const model3DSchema = new Schema<IModel3D>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    format: {
      type: String
    },
    size: {
      type: Number
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }
  },
  { timestamps: true }
);

export default model<IModel3D>('Model3D', model3DSchema);
