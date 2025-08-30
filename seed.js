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
  // Electronics - Smartphones
  {
    title: 'iPhone 14 Pro Max - Unlocked (Deep Purple)',
    description: 'Excellent condition iPhone 14 Pro Max with original box, charger, and accessories. Features the powerful A16 Bionic chip, Pro camera system with 3x optical zoom, and stunning 6.7-inch Super Retina XDR display. No scratches or dents, well-maintained device with 96% battery health.',
    price: 999,
    originalPrice: 1199,
    category: 'electronics',
    subcategory: 'smartphones',
    brand: 'Apple',
    condition: 'like-new',
    images: [
      { url: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=600&q=80', alt: 'iPhone 14 Pro Max Deep Purple', order: 0 },
      { url: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=600&q=80', alt: 'iPhone 14 Pro Max back view', order: 1 }
    ],
    inventory: { quantity: 2 },
    specifications: { weight: '240g', dimensions: '160.8 x 78.1 x 7.85 mm', color: 'Deep Purple', material: 'Surgical-grade stainless steel and glass' },
    shipping: { freeShipping: true, shippingCost: 0 },
    tags: ['smartphone', 'apple', 'unlocked', 'pro', '5g'],
    featured: true,
    views: 312
  },
  {
    title: 'Samsung Galaxy S23 Ultra - Unlocked',
    description: 'Premium Samsung Galaxy S23 Ultra in pristine condition. Features 200MP camera, S Pen, and 6.8-inch Dynamic AMOLED display. Includes original charger and S Pen. Perfect for productivity and photography enthusiasts.',
    price: 849,
    originalPrice: 1199,
    category: 'electronics',
    subcategory: 'smartphones',
    brand: 'Samsung',
    condition: 'like-new',
    images: [
      { url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80', alt: 'Samsung Galaxy S23 Ultra', order: 0 },
      { url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80', alt: 'Samsung Galaxy back view', order: 1 }
    ],
    inventory: { quantity: 3 },
    specifications: { weight: '234g', color: 'Phantom Black', material: 'Aluminum and Glass' },
    shipping: { freeShipping: true, shippingCost: 0 },
    tags: ['smartphone', 'samsung', 'android', 's-pen', 'camera'],
    featured: true,
    views: 267
  },

  // Electronics - Laptops
  {
    title: 'MacBook Pro 16" M2 Max (Space Gray)',
    description: 'Powerful MacBook Pro with M2 Max chip, perfect for professionals. 32GB RAM, 1TB SSD, and stunning Liquid Retina XDR display. Includes original packaging and charger. Excellent for video editing and development.',
    price: 2299,
    originalPrice: 2699,
    category: 'electronics',
    subcategory: 'laptops',
    brand: 'Apple',
    condition: 'like-new',
    images: [
      { url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80', alt: 'MacBook Pro 16 inch', order: 0 },
      { url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80', alt: 'MacBook Pro side view', order: 1 }
    ],
    inventory: { quantity: 1 },
    specifications: { weight: '2.15kg', color: 'Space Gray', material: 'Aluminum' },
    shipping: { freeShipping: true, shippingCost: 0 },
    tags: ['laptop', 'apple', 'm2-max', 'professional', 'video-editing'],
    featured: true,
    views: 198
  },
  {
    title: 'Dell XPS 13 Plus - Intel i7',
    description: 'Sleek and powerful Dell XPS 13 Plus with 11th Gen Intel Core i7, 16GB RAM, and 512GB SSD. Perfect for business and creative work. Features stunning InfinityEdge display and premium build quality.',
    price: 899,
    originalPrice: 1299,
    category: 'electronics',
    subcategory: 'laptops',
    brand: 'Dell',
    condition: 'good',
    images: [
      { url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80', alt: 'Dell XPS 13 laptop', order: 0 },
      { url: 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&q=80', alt: 'Dell laptop keyboard', order: 1 }
    ],
    inventory: { quantity: 2 },
    specifications: { weight: '1.26kg', color: 'Platinum Silver', material: 'Aluminum and Carbon Fiber' },
    shipping: { freeShipping: true, shippingCost: 0 },
    tags: ['laptop', 'dell', 'intel', 'business', 'ultrabook'],
    featured: false,
    views: 156
  },

  // Electronics - Tablets
  {
    title: 'iPad Pro 12.9" M2 (Space Gray)',
    description: 'Latest iPad Pro with M2 chip and Liquid Retina XDR display. Includes Apple Pencil 2nd generation and Magic Keyboard. Perfect for digital artists and professionals. Like new condition with minimal usage.',
    price: 999,
    originalPrice: 1399,
    category: 'electronics',
    subcategory: 'tablets',
    brand: 'Apple',
    condition: 'like-new',
    images: [
      { url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80', alt: 'iPad Pro with Apple Pencil', order: 0 },
      { url: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&q=80', alt: 'iPad Pro with keyboard', order: 1 }
    ],
    inventory: { quantity: 1 },
    specifications: { weight: '682g', color: 'Space Gray', material: 'Aluminum' },
    shipping: { freeShipping: true, shippingCost: 0 },
    tags: ['tablet', 'ipad', 'apple-pencil', 'professional', 'm2'],
    featured: true,
    views: 223
  },
  {
    title: 'Samsung Galaxy Tab S8 Ultra',
    description: 'Premium Android tablet with massive 14.6-inch Super AMOLED display. Includes S Pen and keyboard cover. Perfect for productivity and entertainment. Excellent condition with original accessories.',
    price: 749,
    originalPrice: 1099,
    category: 'electronics',
    subcategory: 'tablets',
    brand: 'Samsung',
    condition: 'good',
    images: [
      { url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80', alt: 'Samsung Galaxy Tab S8', order: 0 }
    ],
    inventory: { quantity: 2 },
    specifications: { weight: '728g', color: 'Graphite', material: 'Aluminum' },
    shipping: { freeShipping: true, shippingCost: 0 },
    tags: ['tablet', 'samsung', 'android', 's-pen', 'large-screen'],
    featured: false,
    views: 134
  },

  // Electronics - Cameras
  {
    title: 'Canon EOS R6 Mark II Mirrorless Camera',
    description: 'Professional mirrorless camera with 24.2MP full-frame sensor. Excellent condition with low shutter count. Includes original box, battery, charger, and strap. Perfect for professional photography and videography.',
    price: 1899,
    originalPrice: 2499,
    category: 'electronics',
    subcategory: 'cameras',
    brand: 'Canon',
    condition: 'like-new',
    images: [
      { url: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&q=80', alt: 'Canon EOS R6 Mark II', order: 0 },
      { url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80', alt: 'Canon camera with lens', order: 1 }
    ],
    inventory: { quantity: 1 },
    specifications: { weight: '588g', color: 'Black', material: 'Magnesium Alloy' },
    shipping: { freeShipping: true, shippingCost: 0 },
    tags: ['camera', 'canon', 'mirrorless', 'professional', 'full-frame'],
    featured: true,
    views: 189
  },
  {
    title: 'Sony A7 IV Full Frame Mirrorless Camera',
    description: 'Versatile full-frame camera with 33MP sensor and 4K video recording. Great condition with minimal use. Includes battery, charger, and camera strap. Ideal for both photography and videography.',
    price: 2199,
    originalPrice: 2498,
    category: 'electronics',
    subcategory: 'cameras',
    brand: 'Sony',
    condition: 'good',
    images: [
      { url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80', alt: 'Sony A7 IV camera', order: 0 }
    ],
    inventory: { quantity: 1 },
    specifications: { weight: '658g', color: 'Black', material: 'Magnesium Alloy' },
    shipping: { freeShipping: true, shippingCost: 0 },
    tags: ['camera', 'sony', 'full-frame', 'video', '4k'],
    featured: false,
    views: 145
  },

  // Electronics - Audio
  {
    title: 'Sony WH-1000XM5 Noise Canceling Headphones',
    description: 'Premium wireless headphones with industry-leading noise cancellation. Like new condition with original case and cables. 30-hour battery life and exceptional sound quality for audiophiles.',
    price: 299,
    originalPrice: 399,
    category: 'electronics',
    subcategory: 'audio',
    brand: 'Sony',
    condition: 'like-new',
    images: [
      { url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80', alt: 'Sony WH-1000XM5 headphones', order: 0 },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80', alt: 'Headphones side view', order: 1 }
    ],
    inventory: { quantity: 4 },
    specifications: { weight: '250g', color: 'Black', material: 'Premium Plastic and Metal' },
    shipping: { freeShipping: true, shippingCost: 0 },
    tags: ['headphones', 'sony', 'noise-canceling', 'wireless', 'premium'],
    featured: true,
    views: 278
  },
  {
    title: 'Apple AirPods Pro 2nd Generation',
    description: 'Latest AirPods Pro with H2 chip and improved noise cancellation. Includes MagSafe charging case and all original accessories. Excellent condition with minimal use.',
    price: 199,
    originalPrice: 249,
    category: 'electronics',
    subcategory: 'audio',
    brand: 'Apple',
    condition: 'like-new',
    images: [
      { url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80', alt: 'Apple AirPods Pro', order: 0 }
    ],
    inventory: { quantity: 5 },
    specifications: { weight: '56g', color: 'White', material: 'Premium Plastic' },
    shipping: { freeShipping: true, shippingCost: 0 },
    tags: ['earbuds', 'apple', 'airpods', 'noise-canceling', 'wireless'],
    featured: true,
    views: 345
  },

  // Electronics - Gaming
  {
    title: 'PlayStation 5 Console (Disc Version)',
    description: 'Sony PlayStation 5 in excellent condition with original controller and cables. Includes original box and documentation. Perfect for next-gen gaming with 4K graphics and lightning-fast SSD.',
    price: 449,
    originalPrice: 499,
    category: 'electronics',
    subcategory: 'gaming',
    brand: 'Sony',
    condition: 'good',
    images: [
      { url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80', alt: 'PlayStation 5 console', order: 0 },
      { url: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600&q=80', alt: 'PS5 controller', order: 1 }
    ],
    inventory: { quantity: 1 },
    specifications: { weight: '4.5kg', color: 'White/Black', material: 'Premium Plastic' },
    shipping: { freeShipping: true, shippingCost: 0 },
    tags: ['gaming', 'playstation', 'console', '4k', 'next-gen'],
    featured: true,
    views: 456
  },
  {
    title: 'Nintendo Switch OLED Model',
    description: 'Nintendo Switch OLED with vibrant 7-inch screen and enhanced audio. Includes Joy-Con controllers, dock, and original accessories. Great for portable and docked gaming.',
    price: 279,
    originalPrice: 349,
    category: 'electronics',
    subcategory: 'gaming',
    brand: 'Nintendo',
    condition: 'good',
    images: [
      { url: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&q=80', alt: 'Nintendo Switch OLED', order: 0 }
    ],
    inventory: { quantity: 3 },
    specifications: { weight: '420g', color: 'Neon Blue/Red', material: 'Premium Plastic' },
    shipping: { freeShipping: false, shippingCost: 12.99 },
    tags: ['gaming', 'nintendo', 'portable', 'oled', 'family'],
    featured: false,
    views: 189
  },

  // Electronics - Wearables
  {
    title: 'Apple Watch Series 8 (45mm GPS + Cellular)',
    description: 'Latest Apple Watch with advanced health monitoring and cellular connectivity. Includes original charger and sport band. Perfect condition with minimal wear on the band.',
    price: 349,
    originalPrice: 499,
    category: 'electronics',
    subcategory: 'wearables',
    brand: 'Apple',
    condition: 'like-new',
    images: [
      { url: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=600&q=80', alt: 'Apple Watch Series 8', order: 0 },
      { url: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&q=80', alt: 'Apple Watch on wrist', order: 1 }
    ],
    inventory: { quantity: 2 },
    specifications: { weight: '51.5g', color: 'Midnight', material: 'Aluminum' },
    shipping: { freeShipping: true, shippingCost: 0 },
    tags: ['smartwatch', 'apple', 'fitness', 'cellular', 'health'],
    featured: true,
    views: 234
  },
  {
    title: 'Samsung Galaxy Watch 5 Pro',
    description: 'Premium smartwatch with titanium build and advanced fitness tracking. Includes wireless charger and extra sport band. Excellent for outdoor activities and health monitoring.',
    price: 289,
    originalPrice: 449,
    category: 'electronics',
    subcategory: 'wearables',
    brand: 'Samsung',
    condition: 'good',
    images: [
      { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', alt: 'Samsung Galaxy Watch', order: 0 }
    ],
    inventory: { quantity: 2 },
    specifications: { weight: '46.5g', color: 'Black Titanium', material: 'Titanium' },
    shipping: { freeShipping: false, shippingCost: 8.99 },
    tags: ['smartwatch', 'samsung', 'fitness', 'titanium', 'outdoor'],
    featured: false,
    views: 167
  },

  // Electronics - Computing
  {
    title: 'iPad Air 5th Gen M1 (Blue)',
    description: 'Powerful iPad Air with M1 chip and 10.9-inch Liquid Retina display. Perfect for creative work and productivity. Includes original charger and Apple Pencil compatibility.',
    price: 499,
    originalPrice: 599,
    category: 'electronics',
    subcategory: 'tablets',
    brand: 'Apple',
    condition: 'like-new',
    images: [
      { url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80', alt: 'iPad Air M1 Blue', order: 0 }
    ],
    inventory: { quantity: 3 },
    specifications: { weight: '461g', color: 'Sky Blue', material: 'Aluminum' },
    shipping: { freeShipping: true, shippingCost: 0 },
    tags: ['tablet', 'ipad', 'apple', 'm1', 'creative'],
    featured: false,
    views: 201
  },
  {
    title: 'Microsoft Surface Pro 9 (Platinum)',
    description: '2-in-1 laptop tablet with Intel Core i7 and Type Cover included. Perfect for professionals who need laptop performance in a tablet form factor. Excellent condition.',
    price: 899,
    originalPrice: 1299,
    category: 'electronics',
    subcategory: 'tablets',
    brand: 'Microsoft',
    condition: 'good',
    images: [
      { url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80', alt: 'Microsoft Surface Pro', order: 0 }
    ],
    inventory: { quantity: 1 },
    specifications: { weight: '879g', color: 'Platinum', material: 'Magnesium' },
    shipping: { freeShipping: true, shippingCost: 0 },
    tags: ['tablet', 'surface', 'microsoft', '2-in-1', 'windows'],
    featured: false,
    views: 112
  },

  // Electronics - Smart Home
  {
    title: 'Amazon Echo Studio Smart Speaker',
    description: 'High-fidelity smart speaker with 3D audio and Alexa built-in. Perfect condition with original power adapter. Delivers immersive sound with Dolby Atmos support.',
    price: 149,
    originalPrice: 199,
    category: 'electronics',
    subcategory: 'smart-home',
    brand: 'Amazon',
    condition: 'like-new',
    images: [
      { url: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=600&q=80', alt: 'Amazon Echo Studio', order: 0 }
    ],
    inventory: { quantity: 4 },
    specifications: { weight: '3.5kg', color: 'Charcoal', material: 'Fabric and Plastic' },
    shipping: { freeShipping: false, shippingCost: 9.99 },
    tags: ['smart-speaker', 'alexa', 'amazon', 'audio', 'smart-home'],
    featured: false,
    views: 98
  },
  {
    title: 'Google Nest Hub Max (Charcoal)',
    description: 'Smart display with 10-inch screen and Google Assistant. Features built-in camera for video calls. Excellent condition with original power cable. Perfect for kitchen or bedroom.',
    price: 179,
    originalPrice: 229,
    category: 'electronics',
    subcategory: 'smart-home',
    brand: 'Google',
    condition: 'good',
    images: [
      { url: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=600&q=80', alt: 'Google Nest Hub Max', order: 0 }
    ],
    inventory: { quantity: 2 },
    specifications: { weight: '1.32kg', color: 'Charcoal', material: 'Fabric and Plastic' },
    shipping: { freeShipping: false, shippingCost: 11.99 },
    tags: ['smart-display', 'google', 'assistant', 'video-calls', 'home'],
    featured: false,
    views: 87
  },

  // Electronics - Accessories
  {
    title: 'Logitech MX Master 3S Wireless Mouse',
    description: 'Premium wireless mouse with MagSpeed scrolling and ergonomic design. Perfect for professionals and creatives. Includes original receiver and charging cable.',
    price: 79,
    originalPrice: 99,
    category: 'electronics',
    subcategory: 'accessories',
    brand: 'Logitech',
    condition: 'like-new',
    images: [
      { url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80', alt: 'Logitech MX Master 3S', order: 0 }
    ],
    inventory: { quantity: 6 },
    specifications: { weight: '141g', color: 'Graphite', material: 'Premium Plastic' },
    shipping: { freeShipping: false, shippingCost: 5.99 },
    tags: ['mouse', 'logitech', 'wireless', 'ergonomic', 'productivity'],
    featured: false,
    views: 156
  },
  {
    title: 'Mechanical Keyboard - Keychron K8',
    description: 'Wireless mechanical keyboard with hot-swappable switches and RGB backlighting. Includes original keycaps and USB-C cable. Perfect for typing enthusiasts and gamers.',
    price: 89,
    originalPrice: 119,
    category: 'electronics',
    subcategory: 'accessories',
    brand: 'Keychron',
    condition: 'good',
    images: [
      { url: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80', alt: 'Keychron K8 mechanical keyboard', order: 0 }
    ],
    inventory: { quantity: 3 },
    specifications: { weight: '765g', color: 'Space Gray', material: 'Aluminum and ABS' },
    shipping: { freeShipping: false, shippingCost: 7.99 },
    tags: ['keyboard', 'mechanical', 'wireless', 'rgb', 'gaming'],
    featured: false,
    views: 134
  },

  // Electronics - Monitors
  {
    title: 'LG 27" 4K UltraFine Monitor',
    description: '27-inch 4K monitor with USB-C connectivity and P3 wide color gamut. Perfect for creative professionals. Includes original stand and cables. Excellent color accuracy.',
    price: 449,
    originalPrice: 699,
    category: 'electronics',
    subcategory: 'monitors',
    brand: 'LG',
    condition: 'good',
    images: [
      { url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80', alt: 'LG 4K monitor', order: 0 },
      { url: 'https://images.unsplash.com/photo-1551739440-5dd934d3a94a?w=600&q=80', alt: 'Monitor setup', order: 1 }
    ],
    inventory: { quantity: 2 },
    specifications: { weight: '5.9kg', color: 'Silver', material: 'Aluminum and Plastic' },
    shipping: { freeShipping: true, shippingCost: 0 },
    tags: ['monitor', 'lg', '4k', 'usb-c', 'professional'],
    featured: false,
    views: 123
  },
  {
    title: 'Samsung 32" Curved Gaming Monitor',
    description: 'Immersive curved gaming monitor with 144Hz refresh rate and 1ms response time. Includes original stand and cables. Perfect for competitive gaming and entertainment.',
    price: 299,
    originalPrice: 449,
    category: 'electronics',
    subcategory: 'monitors',
    brand: 'Samsung',
    condition: 'good',
    images: [
      { url: 'https://images.unsplash.com/photo-1551739440-5dd934d3a94a?w=600&q=80', alt: 'Samsung curved gaming monitor', order: 0 }
    ],
    inventory: { quantity: 2 },
    specifications: { weight: '7.2kg', color: 'Black', material: 'Plastic' },
    shipping: { freeShipping: false, shippingCost: 19.99 },
    tags: ['monitor', 'samsung', 'curved', 'gaming', '144hz'],
    featured: false,
    views: 167
  },

  // Electronics - Storage
  {
    title: 'Samsung T7 Portable SSD 2TB',
    description: 'Ultra-fast portable SSD with USB 3.2 Gen 2 interface. Perfect for content creators and professionals. Includes USB-C and USB-A cables. Excellent condition.',
    price: 199,
    originalPrice: 299,
    category: 'electronics',
    subcategory: 'storage',
    brand: 'Samsung',
    condition: 'like-new',
    images: [
      { url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=80', alt: 'Samsung T7 SSD', order: 0 }
    ],
    inventory: { quantity: 4 },
    specifications: { weight: '58g', color: 'Titan Gray', material: 'Aluminum' },
    shipping: { freeShipping: false, shippingCost: 6.99 },
    tags: ['ssd', 'samsung', 'portable', 'storage', 'usb-c'],
    featured: false,
    views: 145
  },

  // Electronics - Networking
  {
    title: 'ASUS AX6000 WiFi 6 Router',
    description: 'High-performance WiFi 6 router with advanced features. Perfect for large homes and heavy internet usage. Includes original power adapter and ethernet cable.',
    price: 249,
    originalPrice: 349,
    category: 'electronics',
    subcategory: 'networking',
    brand: 'ASUS',
    condition: 'good',
    images: [
      { url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80', alt: 'ASUS WiFi 6 router', order: 0 }
    ],
    inventory: { quantity: 2 },
    specifications: { weight: '1.39kg', color: 'Black', material: 'Premium Plastic' },
    shipping: { freeShipping: false, shippingCost: 14.99 },
    tags: ['router', 'asus', 'wifi-6', 'networking', 'gaming'],
    featured: false,
    views: 89
  },

  // Electronics - Power & Charging
  {
    title: 'Anker PowerCore 26800 Power Bank',
    description: 'High-capacity portable charger with fast charging support. Perfect for travel and emergency power. Includes micro-USB cable and travel pouch. Excellent condition.',
    price: 49,
    originalPrice: 79,
    category: 'electronics',
    subcategory: 'accessories',
    brand: 'Anker',
    condition: 'good',
    images: [
      { url: 'https://images.unsplash.com/photo-1609592806596-7cc8daf0e1d8?w=600&q=80', alt: 'Anker power bank', order: 0 }
    ],
    inventory: { quantity: 8 },
    specifications: { weight: '490g', color: 'Black', material: 'Premium Plastic' },
    shipping: { freeShipping: false, shippingCost: 4.99 },
    tags: ['power-bank', 'anker', 'portable', 'fast-charging', 'travel'],
    featured: false,
    views: 178
  },

  // Electronics - Fitness Tech
  {
    title: 'Fitbit Versa 4 Fitness Smartwatch',
    description: 'Advanced fitness tracker with built-in GPS and 6+ day battery life. Includes original charger and small/large bands. Great for health and fitness enthusiasts.',
    price: 149,
    originalPrice: 199,
    category: 'electronics',
    subcategory: 'wearables',
    brand: 'Fitbit',
    condition: 'like-new',
    images: [
      { url: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=600&q=80', alt: 'Fitbit Versa 4', order: 0 }
    ],
    inventory: { quantity: 3 },
    specifications: { weight: '37.6g', color: 'Black/Graphite', material: 'Aluminum' },
    shipping: { freeShipping: false, shippingCost: 6.99 },
    tags: ['fitness', 'fitbit', 'smartwatch', 'gps', 'health'],
    featured: false,
    views: 156
  },

  // Electronics - Audio Production
  {
    title: 'Audio-Technica AT2020USB+ Microphone',
    description: 'Professional USB condenser microphone perfect for streaming, podcasting, and recording. Includes original stand and USB cable. Excellent condition with crystal clear audio quality.',
    price: 129,
    originalPrice: 169,
    category: 'electronics',
    subcategory: 'audio',
    brand: 'Audio-Technica',
    condition: 'like-new',
    images: [
      { url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80', alt: 'Audio-Technica microphone', order: 0 }
    ],
    inventory: { quantity: 2 },
    specifications: { weight: '386g', color: 'Black/Silver', material: 'Metal' },
    shipping: { freeShipping: false, shippingCost: 8.99 },
    tags: ['microphone', 'audio-technica', 'usb', 'streaming', 'recording'],
    featured: false,
    views: 134
  },

  // Electronics - Drones
  {
    title: 'DJI Mini 3 Pro Drone with Remote',
    description: 'Compact drone with 4K HDR video and 48MP photos. Includes intelligent flight modes and obstacle sensing. Perfect condition with original case and extra battery.',
    price: 649,
    originalPrice: 759,
    category: 'electronics',
    subcategory: 'drones',
    brand: 'DJI',
    condition: 'like-new',
    images: [
      { url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&q=80', alt: 'DJI Mini 3 Pro drone', order: 0 },
      { url: 'https://images.unsplash.com/photo-1508614999368-9260051292e5?w=600&q=80', alt: 'Drone in flight', order: 1 }
    ],
    inventory: { quantity: 1 },
    specifications: { weight: '249g', color: 'Gray', material: 'Plastic and Metal' },
    shipping: { freeShipping: true, shippingCost: 0 },
    tags: ['drone', 'dji', '4k', 'photography', 'aerial'],
    featured: true,
    views: 267
  },

  // Electronics - VR
  {
    title: 'Meta Quest 3 VR Headset (128GB)',
    description: 'Latest VR headset with mixed reality capabilities. Includes controllers, charging cable, and original packaging. Perfect for gaming and immersive experiences.',
    price: 449,
    originalPrice: 499,
    category: 'electronics',
    subcategory: 'vr',
    brand: 'Meta',
    condition: 'like-new',
    images: [
      { url: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&q=80', alt: 'Meta Quest 3 VR headset', order: 0 }
    ],
    inventory: { quantity: 2 },
    specifications: { weight: '515g', color: 'White', material: 'Premium Plastic' },
    shipping: { freeShipping: true, shippingCost: 0 },
    tags: ['vr', 'meta', 'quest', 'gaming', 'mixed-reality'],
    featured: true,
    views: 234
  },

  // Non-Electronics for variety
  {
    title: 'Nike Air Jordan 1 Retro High OG',
    description: 'Classic Air Jordan 1 in excellent condition with minimal wear. Authentic sneakers with original box and tags. These iconic basketball shoes feature premium leather construction and the timeless colorway.',
    price: 180,
    originalPrice: 220,
    category: 'clothing',
    subcategory: 'shoes',
    brand: 'Nike',
    condition: 'good',
    images: [
      { url: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&q=80', alt: 'Nike Air Jordan 1', order: 0 }
    ],
    inventory: { quantity: 1 },
    specifications: { color: 'Chicago Red/White/Black', size: 'US 10', material: 'Leather' },
    shipping: { freeShipping: false, shippingCost: 12.99 },
    tags: ['sneakers', 'nike', 'jordan', 'basketball', 'retro'],
    featured: false,
    views: 156
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
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80', alt: 'Gaming chair', order: 0 }
    ],
    inventory: { quantity: 2 },
    specifications: { weight: '25kg', color: 'Black/Red', material: 'PU Leather' },
    shipping: { freeShipping: false, shippingCost: 25.99 },
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