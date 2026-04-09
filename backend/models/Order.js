const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Using String to match User.id
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    priceAtPurchase: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'shipped', 'cancelled'], default: 'completed' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
