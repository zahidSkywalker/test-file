const getDatabase = require('../../_sqlite');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = getDatabase();

    if (req.method === 'GET') {
      // Get all products
      const products = db.prepare(`
        SELECT * FROM products 
        ORDER BY created_at DESC
      `).all();

      return res.status(200).json({
        success: true,
        data: products
      });
    }

    if (req.method === 'POST') {
      // Create new product
      const {
        name,
        description,
        price,
        original_price,
        category,
        brand,
        model,
        images,
        features,
        specifications,
        stock,
        is_featured,
        is_published
      } = req.body;

      if (!name || !price || !category) {
        return res.status(400).json({
          success: false,
          message: 'Name, price, and category are required'
        });
      }

      const insertProduct = db.prepare(`
        INSERT INTO products (
          name, description, price, original_price, category, brand, model,
          images, features, specifications, stock, is_featured, is_published
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = insertProduct.run(
        name,
        description || '',
        price,
        original_price || null,
        category,
        brand || '',
        model || '',
        JSON.stringify(images || []),
        JSON.stringify(features || []),
        JSON.stringify(specifications || {}),
        stock || 0,
        is_featured ? 1 : 0,
        is_published ? 1 : 0
      );

      const newProduct = db.prepare(`
        SELECT * FROM products WHERE id = ?
      `).get(result.lastInsertRowid);

      return res.status(201).json({
        success: true,
        data: newProduct,
        message: 'Product created successfully'
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};