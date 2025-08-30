const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow users to view their own profile or admin to view any
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user role (admin only)
router.put('/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['buyer', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Check permissions
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let stats = {};

    if (user.role === 'seller') {
      // Seller statistics
      const totalProducts = await Product.countDocuments({ seller: userId });
      const activeProducts = await Product.countDocuments({ seller: userId, status: 'active' });
      const totalOrders = await Order.countDocuments({ 'items.seller': userId });
      
      const orderStats = await Order.aggregate([
        { $unwind: '$items' },
        { $match: { 'items.seller': new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            totalItemsSold: { $sum: '$items.quantity' }
          }
        }
      ]);

      stats = {
        totalProducts,
        activeProducts,
        totalOrders,
        totalRevenue: orderStats[0]?.totalRevenue || 0,
        totalItemsSold: orderStats[0]?.totalItemsSold || 0
      };
    } else {
      // Buyer statistics
      const totalOrders = await Order.countDocuments({ buyer: userId });
      const totalSpent = await Order.aggregate([
        { $match: { buyer: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: '$totals.total' } } }
      ]);

      stats = {
        totalOrders,
        totalSpent: totalSpent[0]?.total || 0
      };
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting other admins
    if (user.role === 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Cannot delete other admin users' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;