import { Schema, model } from 'mongoose';

const imageSchema = new Schema(
  {
    type: { type: String },
    path: String,
    aspect: String,
    properties: Schema.Types.Mixed,
  },
  { _id: false },
);

const skuSchema = new Schema({
  id: String,
  name: String,
  shortName: String,
  primaryGroupId: String,
  price: {
    regularPrice: Number,
    surcharge: Number,
    retailPrice: Number,
    sellingPrice: Number,
    monogramOrPersonalizationPrice: Number,
  },
  freeShip: Boolean,
  properties: Schema.Types.Mixed,
  media: {
    images: [imageSchema],
  },
  availability: String,
  deliveryEstimate: String,
});

export default model('Sku', skuSchema);
