const getDatabase = require('../../_sqlite');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
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

    // Create the feed data
    const feedData = {
      products: transformedProducts,
      lastUpdated: new Date().toISOString(),
      totalProducts: transformedProducts.length
    };

    // Upload to Cloudinary (if configured)
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const cloudinary = require('cloudinary').v2;
      
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      try {
        // Upload JSON as a text file to Cloudinary
        const result = await cloudinary.uploader.upload(
          `data:application/json;base64,${Buffer.from(JSON.stringify(feedData, null, 2)).toString('base64')}`,
          {
            resource_type: 'raw',
            public_id: 'trendymart/products-feed',
            overwrite: true,
            folder: 'trendymart'
          }
        );

        return res.status(200).json({
          success: true,
          message: 'Products published successfully',
          data: {
            feedUrl: result.secure_url,
            totalProducts: transformedProducts.length,
            lastUpdated: feedData.lastUpdated
          }
        });
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        // Still return success but without Cloudinary URL
        return res.status(200).json({
          success: true,
          message: 'Products prepared for publishing (Cloudinary upload failed)',
          data: {
            totalProducts: transformedProducts.length,
            lastUpdated: feedData.lastUpdated,
            feedData: feedData
          }
        });
      }
    } else {
      // Return the feed data directly if Cloudinary is not configured
      return res.status(200).json({
        success: true,
        message: 'Products prepared for publishing (Cloudinary not configured)',
        data: {
          totalProducts: transformedProducts.length,
          lastUpdated: feedData.lastUpdated,
          feedData: feedData
        }
      });
    }

  } catch (error) {
    console.error('Publish error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to publish products',
      error: error.message
    });
  }
};