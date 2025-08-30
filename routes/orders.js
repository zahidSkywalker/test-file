const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, paymentMethod } = req.body;

    // Validate and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId).populate('seller');
      
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }

      if (product.inventory.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient inventory for ${product.title}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        seller: product.seller._id
      });
    }

    const shipping = 50; // Fixed shipping cost for demo
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + shipping + tax;

    const order = new Order({
      buyer: req.user._id,
      items: orderItems,
      shippingAddress,
      billingAddress,
      payment: {
        method: paymentMethod,
        amount: total
      },
      totals: {
        subtotal,
        shipping,
        tax,
        total
      }
    });

    await order.save();

    // Update product inventory
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { 'inventory.quantity': -item.quantity } }
      );
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'title images price')
      .populate('items.seller', 'name sellerInfo.businessName');

    res.status(201).json({
      message: 'Order created successfully',
      order: populatedOrder
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find({ buyer: req.user._id })
      .populate('items.product', 'title images price')
      .populate('items.seller', 'name sellerInfo.businessName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Order.countDocuments({ buyer: req.user._id });

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get seller's orders
router.get('/seller/orders', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const matchStage = {
      'items.seller': req.user._id
    };

    if (status) {
      matchStage.status = status;
    }

    const orders = await Order.find(matchStage)
      .populate('buyer', 'name email')
      .populate('items.product', 'title images price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Order.countDocuments(matchStage);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email phone')
      .populate('items.product', 'title images price')
      .populate('items.seller', 'name sellerInfo.businessName');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has access to this order
    const hasAccess = order.buyer._id.toString() === req.user._id.toString() ||
                     order.items.some(item => item.seller._id.toString() === req.user._id.toString()) ||
                     req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status (sellers and admins)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, tracking } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions
    const canUpdate = req.user.role === 'admin' ||
                     order.items.some(item => item.seller.toString() === req.user._id.toString());

    if (!canUpdate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    order.status = status;
    if (tracking) {
      order.tracking = { ...order.tracking, ...tracking };
    }

    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all orders (admin only)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('buyer', 'name email')
      .populate('items.product', 'title price')
      .populate('items.seller', 'name sellerInfo.businessName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;