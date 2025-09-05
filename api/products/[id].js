const connectMongo = require('../_db');
const Product = require('../../models/Product');

module.exports = async (req, res) => {
  const { id } = req.query;

  try {
    await connectMongo(process.env.MONGODB_URI);

    if (req.method === 'GET') {
      const product = await Product.findById(id).populate('seller', 'name sellerInfo.businessName sellerInfo.rating');
      if (!product) return res.status(404).json({ message: 'Product not found' });

      product.views += 1;
      await product.save();

      return res.json(product);
    }

    if (req.method === 'PUT') {
      const updated = await Product.findByIdAndUpdate(id, req.body || {}, { new: true, runValidators: true })
        .populate('seller', 'name sellerInfo.businessName');
      if (!updated) return res.status(404).json({ message: 'Product not found' });
      return res.json({ message: 'Product updated successfully', product: updated });
    }

    if (req.method === 'DELETE') {
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ message: 'Product not found' });
      return res.json({ message: 'Product deleted successfully' });
    }

    res.setHeader('Allow', 'GET, PUT, DELETE');
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

