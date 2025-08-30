const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  originalPrice: {
    type: String
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Mobile Phones',
      'Audio & Headphones',
      'Laptops & Computers',
      'Television & Home Theater',
      'Cameras & Photography',
      'Wearable Technology',
      'Audio & Speakers',
      'Printers & Scanners',
      'Power Banks & Chargers',
      'Computer Accessories',
      'Gaming Consoles',
      'Kitchen Appliances',
      'Home Appliances',
      'Tablets',
      'Other'
    ]
  },
  brand: {
    type: String,
    default: ''
  },
  images: [{
    type: String,
    required: true
  }],
  colors: [{
    type: String
  }],
  sizes: [{
    type: String
  }],
  specifications: {
    type: Map,
    of: String
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rating: {
    average: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  discount: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    validUntil: Date
  },
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  shippingInfo: {
    freeShipping: {
      type: Boolean,
      default: true
    },
    shippingCost: {
      type: Number,
      default: 0
    },
    estimatedDelivery: {
      type: String,
      default: '2-3 business days'
    }
  },
  // Additional fields for better e-commerce functionality
  sku: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out-of-stock'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ seller: 1 });
productSchema.index({ isFeatured: -1, createdAt: -1 });

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
  if (this.discount.percentage > 0) {
    const numericPrice = this.getNumericPrice();
    return numericPrice * (1 - this.discount.percentage / 100);
  }
  return this.getNumericPrice();
});

// Method to check if product is on sale
productSchema.methods.isOnSale = function() {
  return this.discount.percentage > 0 && 
         (!this.discount.validUntil || this.discount.validUntil > new Date());
};

// Method to get numeric price
productSchema.methods.getNumericPrice = function() {
  return parseFloat(this.price.replace(/[^\d.-]/g, ''));
};

// Generate SKU if not provided
productSchema.pre('save', function(next) {
  if (!this.sku) {
    this.sku = `${this.category.replace(/\s+/g, '').toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);