// Vercel serverless function for electronics products
const electronicsProducts = [
  {
    id: 1,
    name: "Samsung Galaxy A54 5G",
    description: "6.4 inch Super AMOLED display, 50MP triple camera, 5000mAh battery",
    colors: ["Awesome Graphite", "Awesome Violet", "Awesome White", "Awesome Lime"],
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop"
    ],
    price: "৳42,999",
    originalPrice: "৳50,999",
    category: "Mobile Phones",
    isFeatured: true,
    discount: 15,
    tags: ['samsung', 'android', '5g', 'smartphone', 'camera'],
    rating: { average: 4.6, count: 124 },
    stock: 15
  },
  {
    id: 2,
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
    rating: { average: 4.8, count: 89 },
    stock: 8
  },
  {
    id: 3,
    name: "Sony WH-1000XM4 Wireless Headphones",
    description: "Industry-leading noise canceling, 30-hour battery life, Touch sensor controls",
    colors: ["Black", "Silver", "Blue", "Midnight Blue"],
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop"
    ],
    price: "৳32,500",
    originalPrice: "৳40,625",
    category: "Audio & Headphones",
    isFeatured: true,
    discount: 20,
    tags: ['sony', 'headphones', 'wireless', 'noise-canceling', 'premium'],
    rating: { average: 4.7, count: 156 },
    stock: 12
  },
  {
    id: 4,
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
    rating: { average: 4.3, count: 67 },
    stock: 5
  },
  {
    id: 5,
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
    rating: { average: 4.5, count: 98 },
    stock: 7
  },
  {
    id: 6,
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
    rating: { average: 4.4, count: 73 },
    stock: 3
  },
  {
    id: 7,
    name: "Xiaomi Mi Band 7",
    description: "1.62 inch AMOLED display, 14-day battery life, 110+ workout modes",
    colors: ["Black", "Blue", "Orange", "Pink"],
    images: [
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&h=600&fit=crop"
    ],
    price: "৳4,999",
    originalPrice: "৳6,665",
    category: "Wearable Technology",
    discount: 25,
    tags: ['xiaomi', 'fitness', 'smartwatch', 'health', 'affordable'],
    rating: { average: 4.2, count: 234 },
    stock: 20
  },
  {
    id: 8,
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
    rating: { average: 4.6, count: 145 },
    stock: 18
  },
  {
    id: 9,
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
    rating: { average: 4.1, count: 56 },
    stock: 10
  },
  {
    id: 10,
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
    rating: { average: 4.7, count: 312 },
    stock: 25
  },
  {
    id: 11,
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
    rating: { average: 4.8, count: 89 },
    stock: 14
  },
  {
    id: 12,
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
    rating: { average: 4.9, count: 178 },
    stock: 6
  },
  {
    id: 13,
    name: "Philips Air Fryer HD9252",
    description: "4.1L capacity, Rapid Air technology, 7 preset programs",
    colors: ["Black", "White"],
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1574781330855-d0db06729c52?w=800&h=600&fit=crop"
    ],
    price: "৳15,999",
    originalPrice: "৳17,777",
    category: "Kitchen Appliances",
    discount: 10,
    tags: ['philips', 'air-fryer', 'kitchen', 'healthy-cooking', 'appliance'],
    rating: { average: 4.5, count: 203 },
    stock: 9
  },
  {
    id: 14,
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
    rating: { average: 4.6, count: 134 },
    stock: 4
  },
  {
    id: 15,
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
    rating: { average: 4.3, count: 87 },
    stock: 11
  }
];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { category, search, sort, featured, id } = req.query;

    // Get single product by ID
    if (id) {
      const productId = parseInt(id);
      const product = electronicsProducts.find(p => p.id === productId);
      
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      
      // Get related products (same category, different product)
      const relatedProducts = electronicsProducts
        .filter(p => p.id !== productId && p.category === product.category)
        .slice(0, 4);
      
      return res.json({
        success: true,
        product,
        relatedProducts
      });
    }

    // Get all products with filtering
    let filteredProducts = [...electronicsProducts];

    // Filter by category
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    // Filter by search term
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.includes(searchTerm))
      );
    }

    // Filter featured products
    if (featured === 'true') {
      filteredProducts = filteredProducts.filter(p => p.isFeatured);
    }

    // Sort products
    switch (sort) {
      case 'price-low':
        filteredProducts.sort((a, b) => parseFloat(a.price.replace(/[^\d.-]/g, '')) - parseFloat(b.price.replace(/[^\d.-]/g, '')));
        break;
      case 'price-high':
        filteredProducts.sort((a, b) => parseFloat(b.price.replace(/[^\d.-]/g, '')) - parseFloat(a.price.replace(/[^\d.-]/g, '')));
        break;
      case 'rating':
        filteredProducts.sort((a, b) => b.rating.average - a.rating.average);
        break;
      case 'newest':
        filteredProducts.sort((a, b) => b.id - a.id);
        break;
      default:
        filteredProducts.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return b.rating.average - a.rating.average;
        });
    }

    res.json({
      success: true,
      products: filteredProducts,
      total: filteredProducts.length,
      categories: [...new Set(electronicsProducts.map(p => p.category))]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}