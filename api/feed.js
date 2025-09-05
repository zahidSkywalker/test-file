const getDatabase = require('./_sqlite');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const db = getDatabase();

    // Get all published products
    const products = db.prepare(`
      SELECT * FROM products 
      WHERE is_published = 1 
      ORDER BY created_at DESC
    `).all();

    // Transform products to match the expected format
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.original_price,
      category: product.category,
      brand: product.brand,
      model: product.model,
      images: JSON.parse(product.images || '[]'),
      features: JSON.parse(product.features || '[]'),
      specifications: JSON.parse(product.specifications || '{}'),
      stock: product.stock,
      isFeatured: Boolean(product.is_featured),
      isPublished: Boolean(product.is_published),
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }));

    return res.status(200).json({
      success: true,
      data: transformedProducts,
      lastUpdated: new Date().toISOString(),
      totalProducts: transformedProducts.length
    });

  } catch (error) {
    console.error('Feed error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

