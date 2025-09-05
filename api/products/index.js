const connectMongo = require('../_db');
const Product = require('../../models/Product');

module.exports = async (req, res) => {
  try {
    await connectMongo(process.env.MONGODB_URI);

    if (req.method === 'GET') {
      const {
        page = 1,
        limit = 12,
        category,
        minPrice,
        maxPrice,
        condition,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        featured
      } = req.query;

      const query = { status: 'active' };
      if (category) query.category = category;
      if (condition) query.condition = condition;
      if (featured) query.isFeatured = featured === 'true';

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      if (search) {
        query.$text = { $search: search };
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const products = await Product.find(query)
        .sort(sortOptions)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .exec();

      const total = await Product.countDocuments(query);
      return res.json({
        products,
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        total
      });
    }

    if (req.method === 'POST') {
      // NOTE: No local file uploads; expect images to be array of URLs
      const { name, description, price, category, images = [], ...rest } = req.body || {};
      if (!name || !description || !price || !category || !images.length) {
        return res.status(400).json({ message: 'name, description, price, category, images[] required' });
      }

      const product = new Product({ name, description, price, category, images, ...rest });
      await product.save();
      return res.status(201).json({ message: 'Product created successfully', product });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

