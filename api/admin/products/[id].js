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
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (req.method === 'GET') {
      // Get single product
      const product = db.prepare(`
        SELECT * FROM products WHERE id = ?
      `).get(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: product
      });
    }

    if (req.method === 'PUT') {
      // Update product
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

      const updateProduct = db.prepare(`
        UPDATE products SET
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          original_price = COALESCE(?, original_price),
          category = COALESCE(?, category),
          brand = COALESCE(?, brand),
          model = COALESCE(?, model),
          images = COALESCE(?, images),
          features = COALESCE(?, features),
          specifications = COALESCE(?, specifications),
          stock = COALESCE(?, stock),
          is_featured = COALESCE(?, is_featured),
          is_published = COALESCE(?, is_published),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      const result = updateProduct.run(
        name,
        description,
        price,
        original_price,
        category,
        brand,
        model,
        images ? JSON.stringify(images) : null,
        features ? JSON.stringify(features) : null,
        specifications ? JSON.stringify(specifications) : null,
        stock,
        is_featured !== undefined ? (is_featured ? 1 : 0) : null,
        is_published !== undefined ? (is_published ? 1 : 0) : null,
        id
      );

      if (result.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const updatedProduct = db.prepare(`
        SELECT * FROM products WHERE id = ?
      `).get(id);

      return res.status(200).json({
        success: true,
        data: updatedProduct,
        message: 'Product updated successfully'
      });
    }

    if (req.method === 'DELETE') {
      // Delete product
      const deleteProduct = db.prepare(`
        DELETE FROM products WHERE id = ?
      `);

      const result = deleteProduct.run(id);

      if (result.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
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