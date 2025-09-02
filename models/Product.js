const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  category: { type: String, required: true },
  subcategory: { type: String },
  brand: { type: String, default: '' },
  condition: { type: String, default: 'good' },
  images: { type: [imageSchema], default: [] },
  colors: [{ type: String }],
  sizes: [{ type: String }],
  specifications: { type: Map, of: String },
  inventory: {
    quantity: { type: Number, required: true, min: 0, default: 0 }
  },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: {
    average: { type: Number, default: 4.5, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  reviews: { type: [reviewSchema], default: [] },
  tags: [{ type: String, lowercase: true }],
  status: { type: String, enum: ['active', 'inactive', 'out-of-stock'], default: 'active' },
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 }
}, { timestamps: true });

// Indexes
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ seller: 1 });
productSchema.index({ featured: -1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);