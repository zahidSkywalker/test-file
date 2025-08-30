const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reseller_ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@resellerhub.com',
    password: 'admin123',
    role: 'admin',
    isVerified: true
  },
  {
    name: 'TechStore Pro',
    email: 'seller@resellerhub.com',
    password: 'seller123',
    role: 'seller',
    isVerified: true,
    phone: '+1-555-0123',
    sellerInfo: {
      businessName: 'TechStore Pro',
      businessDescription: 'Premium electronics and gadgets reseller with 5+ years experience',
      rating: 4.8,
      totalSales: 156
    }
  },
  {
    name: 'John Buyer',
    email: 'buyer@resellerhub.com',
    password: 'buyer123',
    role: 'buyer',
    isVerified: true,
    phone: '+1-555-0456',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    }
  },
  {
    name: 'Fashion Boutique',
    email: 'fashion@resellerhub.com',
    password: 'fashion123',
    role: 'seller',
    isVerified: true,
    sellerInfo: {
      businessName: 'Vintage Fashion Boutique',
      businessDescription: 'Curated vintage and designer clothing',
      rating: 4.6,
      totalSales: 89
    }
  }
];

const sampleProducts = [
  {
    title: 'iPhone 13 Pro Max - Unlocked (Graphite)',
    description: 'Excellent condition iPhone 13 Pro Max with original box, charger, and accessories. Features the powerful A15 Bionic chip, Pro camera system with 3x optical zoom, and stunning 6.7-inch Super Retina XDR display. No scratches or dents, well-maintained device with 95% battery health.',
    price: 899,
    originalPrice: 1099,
    category: 'electronics',
    subcategory: 'smartphones',
    brand: 'Apple',
    condition: 'like-new',
    images: [
      { url: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600', alt: 'iPhone 13 Pro Max front view', order: 0 },
      { url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600', alt: 'iPhone 13 Pro Max back view', order: 1 }
    ],
    inventory: { quantity: 3 },
    specifications: {
      weight: '240g',
      dimensions: '160.8 x 78.1 x 7.65 mm',
      color: 'Graphite',
      material: 'Surgical-grade stainless steel and glass'
    },
    shipping: {
      freeShipping: true,
      shippingCost: 0
    },
    tags: ['smartphone', 'apple', 'unlocked', 'pro'],
    featured: true,
    views: 245
  },
  {
    title: 'MacBook Air M2 13-inch (Midnight)',
    description: 'Like new MacBook Air with the revolutionary M2 chip. Includes original packaging, charger, and documentation. Perfect for students and professionals. Features 8GB RAM, 256GB SSD, and incredible battery life up to 18 hours.',
    price: 1099,
    originalPrice: 1299,
    category: 'electronics',
    subcategory: 'laptops',
    brand: 'Apple',
    condition: 'like-new',
    images: [
      { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', alt: 'MacBook Air M2', order: 0 }
    ],
    inventory: { quantity: 2 },
    specifications: {
      weight: '1.24kg',
      dimensions: '30.41 x 21.5 x 1.13 cm',
      color: 'Midnight',
      material: 'Aluminum'
    },
    shipping: {
      freeShipping: true,
      shippingCost: 0
    },
    tags: ['laptop', 'apple', 'm2', 'portable'],
    featured: true,
    views: 189
  },
  {
    title: 'Nike Air Jordan 1 Retro High OG',
    description: 'Classic Air Jordan 1 in excellent condition with minimal wear. Authentic sneakers with original box and tags. These iconic basketball shoes feature premium leather construction and the timeless colorway that started it all.',
    price: 180,
    originalPrice: 220,
    category: 'clothing',
    subcategory: 'shoes',
    brand: 'Nike',
    condition: 'good',
    images: [
      { url: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600', alt: 'Nike Air Jordan 1', order: 0 }
    ],
    inventory: { quantity: 1 },
    specifications: {
      color: 'Chicago Red/White/Black',
      size: 'US 10',
      material: 'Leather'
    },
    shipping: {
      freeShipping: false,
      shippingCost: 12.99
    },
    tags: ['sneakers', 'nike', 'jordan', 'basketball', 'retro'],
    featured: true,
    views: 156
  },
  {
    title: 'Vintage Leather Jacket (Brown)',
    description: 'Authentic vintage leather jacket from the 1980s with incredible character and patina. Made from high-quality genuine leather that has aged beautifully. Perfect for collectors and fashion enthusiasts who appreciate timeless style.',
    price: 85,
    originalPrice: 150,
    category: 'clothing',
    subcategory: 'outerwear',
    brand: 'Vintage',
    condition: 'good',
    images: [
      { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600', alt: 'Vintage leather jacket', order: 0 }
    ],
    inventory: { quantity: 1 },
    specifications: {
      color: 'Brown',
      size: 'Large',
      material: 'Genuine Leather'
    },
    shipping: {
      freeShipping: false,
      shippingCost: 8.99
    },
    tags: ['vintage', 'leather', 'jacket', 'retro', 'fashion'],
    featured: false,
    views: 98
  },
  {
    title: 'Canon EOS R5 Mirrorless Camera',
    description: 'Professional mirrorless camera in excellent condition with low shutter count (under 5,000). Includes original box, battery, charger, and strap. Perfect for professional photographers and serious enthusiasts.',
    price: 2899,
    originalPrice: 3899,
    category: 'electronics',
    subcategory: 'cameras',
    brand: 'Canon',
    condition: 'like-new',
    images: [
      { url: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600', alt: 'Canon EOS R5', order: 0 }
    ],
    inventory: { quantity: 1 },
    specifications: {
      weight: '650g',
      color: 'Black',
      material: 'Magnesium Alloy'
    },
    shipping: {
      freeShipping: true,
      shippingCost: 0
    },
    tags: ['camera', 'canon', 'mirrorless', 'professional', 'photography'],
    featured: true,
    views: 234
  },
  {
    title: 'Ergonomic Gaming Chair (Black/Red)',
    description: 'High-quality gaming chair with lumbar support and adjustable armrests. Barely used, like new condition. Perfect for long gaming sessions or office work. Features premium PU leather and sturdy metal frame.',
    price: 299,
    originalPrice: 399,
    category: 'home',
    subcategory: 'furniture',
    brand: 'DXRacer',
    condition: 'like-new',
    images: [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600', alt: 'Gaming chair', order: 0 }
    ],
    inventory: { quantity: 2 },
    specifications: {
      weight: '25kg',
      color: 'Black/Red',
      material: 'PU Leather'
    },
    shipping: {
      freeShipping: false,
      shippingCost: 25.99
    },
    tags: ['gaming', 'chair', 'ergonomic', 'office', 'furniture'],
    featured: false,
    views: 145
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.email}`);
    }

    // Create products
    const seller = createdUsers.find(user => user.role === 'seller');
    const fashionSeller = createdUsers.find(user => user.email === 'fashion@resellerhub.com');
    
    for (const productData of sampleProducts) {
      // Assign seller based on category
      if (productData.category === 'clothing') {
        productData.seller = fashionSeller._id;
      } else {
        productData.seller = seller._id;
      }

      const product = new Product(productData);
      await product.save();
      console.log(`✅ Created product: ${product.title}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created ${createdUsers.length} users and ${sampleProducts.length} products`);
    
    console.log('\n🔑 Demo Login Credentials:');
    console.log('Admin: admin@resellerhub.com / admin123');
    console.log('Seller: seller@resellerhub.com / seller123');
    console.log('Buyer: buyer@resellerhub.com / buyer123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run seeding
seedDatabase();