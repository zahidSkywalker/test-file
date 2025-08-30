const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Electronics products data from the GitHub source
const electronicsProducts = [
  {
    name: "Samsung Galaxy A54 5G",
    description: "6.4 inch Super AMOLED display, 50MP triple camera, 5000mAh battery",
    colors: ["Awesome Graphite", "Awesome Violet", "Awesome White", "Awesome Lime"],
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop"
    ],
    price: "৳42,999",
    category: "Mobile Phones",
    isFeatured: true,
    discount: { percentage: 15, validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    tags: ['samsung', 'android', '5g', 'smartphone', 'camera'],
    rating: { average: 4.6, count: 124 }
  },
  {
    name: "Apple iPhone 14",
    description: "6.1 inch Super Retina XDR display, A15 Bionic chip, Dual camera system",
    colors: ["Blue", "Purple", "Midnight", "Starlight", "Product Red"],
    images: [
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=600&fit=crop"
    ],
    price: "৳89,999",
    category: "Mobile Phones",
    isFeatured: true,
    tags: ['apple', 'iphone', 'ios', 'premium', 'camera'],
    rating: { average: 4.8, count: 89 }
  },
  {
    name: "Sony WH-1000XM4 Wireless Headphones",
    description: "Industry-leading noise canceling, 30-hour battery life, Touch sensor controls",
    colors: ["Black", "Silver", "Blue", "Midnight Blue"],
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop"
    ],
    price: "৳32,500",
    category: "Audio & Headphones",
    isFeatured: true,
    discount: { percentage: 20, validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
    tags: ['sony', 'headphones', 'wireless', 'noise-canceling', 'premium'],
    rating: { average: 4.7, count: 156 }
  },
  {
    name: "Dell Inspiron 15 3000 Laptop",
    description: "15.6 inch HD display, Intel Core i3, 8GB RAM, 256GB SSD",
    colors: ["Black", "Silver"],
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop"
    ],
    price: "৳52,000",
    category: "Laptops & Computers",
    tags: ['dell', 'laptop', 'intel', 'ssd', 'portable'],
    rating: { average: 4.3, count: 67 }
  },
  {
    name: "LG 43 inch 4K Smart TV",
    description: "43 inch 4K UHD display, WebOS smart platform, HDR10 support",
    colors: ["Black"],
    images: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571037651332-0b2548c6b68a?w=800&h=600&fit=crop"
    ],
    price: "৳45,999",
    category: "Television & Home Theater",
    isFeatured: true,
    tags: ['lg', 'smart-tv', '4k', 'webos', 'entertainment'],
    rating: { average: 4.5, count: 98 }
  },
  {
    name: "Canon EOS 1500D DSLR Camera",
    description: "24.1MP APS-C CMOS sensor, DIGIC 4+ processor, Full HD video recording",
    colors: ["Black"],
    images: [
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=600&fit=crop"
    ],
    price: "৳38,500",
    category: "Cameras & Photography",
    tags: ['canon', 'dslr', 'camera', 'photography', 'professional'],
    rating: { average: 4.4, count: 73 }
  },
  {
    name: "Xiaomi Mi Band 7",
    description: "1.62 inch AMOLED display, 14-day battery life, 110+ workout modes",
    colors: ["Black", "Blue", "Orange", "Pink"],
    images: [
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&h=600&fit=crop"
    ],
    price: "৳4,999",
    category: "Wearable Technology",
    discount: { percentage: 25, validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    tags: ['xiaomi', 'fitness', 'smartwatch', 'health', 'affordable'],
    rating: { average: 4.2, count: 234 }
  },
  {
    name: "JBL Flip 6 Portable Speaker",
    description: "Waterproof portable speaker, 12-hour playtime, JBL Pro Sound",
    colors: ["Black", "Blue", "Red", "White", "Pink", "Teal"],
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&h=600&fit=crop"
    ],
    price: "৳12,500",
    category: "Audio & Speakers",
    tags: ['jbl', 'speaker', 'portable', 'waterproof', 'bluetooth'],
    rating: { average: 4.6, count: 145 }
  },
  {
    name: "HP DeskJet 2720 All-in-One Printer",
    description: "Print, scan, copy, wireless connectivity, mobile printing",
    colors: ["White"],
    images: [
      "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop"
    ],
    price: "৳8,999",
    category: "Printers & Scanners",
    tags: ['hp', 'printer', 'all-in-one', 'wireless', 'home-office'],
    rating: { average: 4.1, count: 56 }
  },
  {
    name: "Anker PowerCore 10000 Power Bank",
    description: "10000mAh capacity, PowerIQ technology, compact design",
    colors: ["Black", "White", "Blue"],
    images: [
      "https://images.unsplash.com/photo-1609592885014-b4c8e0a98f4b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop"
    ],
    price: "৳2,999",
    category: "Power Banks & Chargers",
    isFeatured: true,
    tags: ['anker', 'powerbank', 'portable', 'charging', 'travel'],
    rating: { average: 4.7, count: 312 }
  },
  {
    name: "Logitech MX Master 3 Wireless Mouse",
    description: "Advanced wireless mouse, MagSpeed scrolling, 70-day battery",
    colors: ["Graphite", "Mid Grey", "Pale Grey"],
    images: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&h=600&fit=crop"
    ],
    price: "৳9,500",
    category: "Computer Accessories",
    tags: ['logitech', 'mouse', 'wireless', 'professional', 'ergonomic'],
    rating: { average: 4.8, count: 89 }
  },
  {
    name: "Nintendo Switch OLED Console",
    description: "7-inch OLED screen, enhanced audio, 64GB internal storage",
    colors: ["White", "Neon Blue/Red"],
    images: [
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
    ],
    price: "৳42,000",
    category: "Gaming Consoles",
    isFeatured: true,
    tags: ['nintendo', 'gaming', 'console', 'oled', 'portable'],
    rating: { average: 4.9, count: 178 }
  },
  {
    name: "Philips Air Fryer HD9252",
    description: "4.1L capacity, Rapid Air technology, 7 preset programs",
    colors: ["Black", "White"],
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1574781330855-d0db06729c52?w=800&h=600&fit=crop"
    ],
    price: "৳15,999",
    category: "Kitchen Appliances",
    discount: { percentage: 10, validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) },
    tags: ['philips', 'air-fryer', 'kitchen', 'healthy-cooking', 'appliance'],
    rating: { average: 4.5, count: 203 }
  },
  {
    name: "Dyson V8 Cordless Vacuum",
    description: "Cordless stick vacuum, 40-minute runtime, 2-tier radial cyclones",
    colors: ["Iron/Red", "Silver/Purple"],
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"
    ],
    price: "৳35,000",
    category: "Home Appliances",
    tags: ['dyson', 'vacuum', 'cordless', 'cleaning', 'premium'],
    rating: { average: 4.6, count: 134 }
  },
  {
    name: "Samsung Galaxy Tab A8",
    description: "10.5 inch display, Unisoc Tiger T618 processor, 4GB RAM",
    colors: ["Gray", "Silver", "Pink Gold"],
    images: [
      "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop"
    ],
    price: "৳24,999",
    category: "Tablets",
    tags: ['samsung', 'tablet', 'android', 'entertainment', 'portable'],
    rating: { average: 4.3, count: 87 }
  }
];

async function seedElectronicsProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reseller_ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new electronics products
    const products = await Product.insertMany(electronicsProducts);
    console.log(`✅ Successfully seeded ${products.length} electronics products`);

    // Mark some products as featured
    await Product.updateMany(
      { name: { $in: ['Samsung Galaxy A54 5G', 'Apple iPhone 14', 'Sony WH-1000XM4 Wireless Headphones', 'LG 43 inch 4K Smart TV', 'Nintendo Switch OLED Console', 'Anker PowerCore 10000 Power Bank'] } },
      { $set: { isFeatured: true } }
    );

    console.log('✅ Updated featured products');

    // Display categories and counts
    const categoryStats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Product Categories:');
    categoryStats.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} products`);
    });

    console.log('\n🎉 Electronics product seeding completed successfully!');
    console.log('🌟 Featured products have been marked');
    console.log('💰 Some products have discount offers');
    console.log('⭐ All products have ratings and reviews count');

  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
if (require.main === module) {
  seedElectronicsProducts();
}

module.exports = { seedElectronicsProducts, electronicsProducts };