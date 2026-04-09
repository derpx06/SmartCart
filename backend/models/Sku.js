const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  type: { type: String },
  path: String,
  aspect: String,
  properties: mongoose.Schema.Types.Mixed
}, { _id: false });

const skuSchema = new mongoose.Schema({
  id: String,
  name: String,
  shortName: String,
  primaryGroupId: String,
  price: {
    regularPrice: Number,
    surcharge: Number,
    retailPrice: Number,
    sellingPrice: Number,
    monogramOrPersonalizationPrice: Number
  },
  freeShip: Boolean,
  properties: mongoose.Schema.Types.Mixed,
  media: {
    images: [imageSchema]
  },
  availability: String,
  deliveryEstimate: String
});

module.exports = mongoose.model('Sku', skuSchema);
