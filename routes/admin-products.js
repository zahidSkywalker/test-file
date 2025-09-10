const express = require('express');
const getDatabase = require('../api/_sqlite');
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const products = db.prepare(`
      SELECT * FROM products 
      ORDER BY created_at DESC
    `).all();

    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const db = getDatabase();
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
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const productId = req.params.id;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const deleteProduct = db.prepare(`
      DELETE FROM products WHERE id = ?
    `);

    const result = deleteProduct.run(productId);

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
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const productId = req.params.id;
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

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const updateProduct = db.prepare(`
      UPDATE products SET 
        name = ?, description = ?, price = ?, original_price = ?, 
        category = ?, brand = ?, model = ?, images = ?, 
        features = ?, specifications = ?, stock = ?, 
        is_featured = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = updateProduct.run(
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
      is_published ? 1 : 0,
      productId
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updatedProduct = db.prepare(`
      SELECT * FROM products WHERE id = ?
    `).get(productId);

    return res.status(200).json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;