import { Schema, model } from 'mongoose';

const recentlyViewedSchema = new Schema(
  {
    userId: { type: String, index: true },
    deviceId: { type: String, index: true },
    productId: { type: String, required: true, index: true },
    slug: { type: String, default: '' },
    category: { type: String, default: '' },
    priceAtView: { type: Number, default: 0 },
    viewedAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

recentlyViewedSchema.index({ userId: 1, viewedAt: -1 });
recentlyViewedSchema.index({ deviceId: 1, viewedAt: -1 });
// NOTE: do not use unique compound indexes here because MongoDB treats `null` values as indexable,
// which can cause duplicate-key errors for unauthenticated viewers depending on how the driver stores missing fields.

export default model('RecentlyViewed', recentlyViewedSchema);

