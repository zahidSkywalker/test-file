const express = require('express');
const crypto = require('crypto');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

const router = express.Router();

// SSLCommerz configuration
const SSLCOMMERZ_CONFIG = {
  store_id: process.env.SSLCOMMERZ_STORE_ID || 'demo_store',
  store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD || 'demo_password',
  is_live: process.env.SSLCOMMERZ_IS_LIVE === 'true',
  base_url: process.env.SSLCOMMERZ_IS_LIVE === 'true' 
    ? 'https://securepay.sslcommerz.com'
    : 'https://sandbox.sslcommerz.com'
};

// Initialize payment
router.post('/initialize', auth, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId)
      .populate('buyer', 'name email phone')
      .populate('items.product', 'title');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Prepare SSLCommerz payment data
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const paymentData = {
      store_id: SSLCOMMERZ_CONFIG.store_id,
      store_passwd: SSLCOMMERZ_CONFIG.store_passwd,
      total_amount: order.totals.total,
      currency: 'BDT',
      tran_id: transactionId,
      success_url: `${req.protocol}://${req.get('host')}/api/payments/success`,
      fail_url: `${req.protocol}://${req.get('host')}/api/payments/fail`,
      cancel_url: `${req.protocol}://${req.get('host')}/api/payments/cancel`,
      ipn_url: `${req.protocol}://${req.get('host')}/api/payments/ipn`,
      cus_name: order.buyer.name,
      cus_email: order.buyer.email,
      cus_phone: order.buyer.phone || '01700000000',
      cus_add1: order.shippingAddress.street,
      cus_city: order.shippingAddress.city,
      cus_state: order.shippingAddress.state,
      cus_postcode: order.shippingAddress.zipCode,
      cus_country: order.shippingAddress.country || 'Bangladesh',
      product_name: order.items.map(item => item.product.title).join(', '),
      product_category: 'Reseller Marketplace',
      product_profile: 'general'
    };

    // Update order with transaction ID
    order.payment.transactionId = transactionId;
    order.payment.status = 'processing';
    await order.save();

    // For demo purposes, simulate SSLCommerz response
    const demoResponse = {
      status: 'SUCCESS',
      sessionkey: `demo-session-${transactionId}`,
      gw: {
        gateway: 'BKASH',
        redirect_gw_url: `${SSLCOMMERZ_CONFIG.base_url}/gwprocess/v4/api.php?Q=pay&SESSIONKEY=demo-session-${transactionId}`
      },
      redirectGatewayURL: `/checkout/payment?session=${transactionId}&order=${orderId}`,
      GatewayPageURL: `/checkout/payment?session=${transactionId}&order=${orderId}`
    };

    res.json({
      message: 'Payment session initialized',
      data: demoResponse,
      orderId: order._id,
      transactionId
    });

  } catch (error) {
    res.status(500).json({ message: 'Payment initialization failed', error: error.message });
  }
});

// Payment success callback
router.post('/success', async (req, res) => {
  try {
    const { tran_id, amount, currency } = req.body;

    const order = await Order.findOne({ 'payment.transactionId': tran_id });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify payment amount
    if (parseFloat(amount) !== order.totals.total) {
      return res.status(400).json({ message: 'Payment amount mismatch' });
    }

    // Update order status
    order.payment.status = 'completed';
    order.status = 'confirmed';
    await order.save();

    // Redirect to success page
    res.redirect(`/checkout/success?order=${order._id}`);
  } catch (error) {
    console.error('Payment success error:', error);
    res.redirect('/checkout/failed');
  }
});

// Payment failure callback
router.post('/fail', async (req, res) => {
  try {
    const { tran_id } = req.body;

    const order = await Order.findOne({ 'payment.transactionId': tran_id });
    
    if (order) {
      order.payment.status = 'failed';
      await order.save();
    }

    res.redirect('/checkout/failed');
  } catch (error) {
    console.error('Payment failure error:', error);
    res.redirect('/checkout/failed');
  }
});

// Payment cancel callback
router.post('/cancel', async (req, res) => {
  try {
    const { tran_id } = req.body;

    const order = await Order.findOne({ 'payment.transactionId': tran_id });
    
    if (order) {
      order.payment.status = 'failed';
      order.status = 'cancelled';
      await order.save();
    }

    res.redirect('/checkout/cancelled');
  } catch (error) {
    console.error('Payment cancel error:', error);
    res.redirect('/checkout/failed');
  }
});

// Demo payment completion (for testing)
router.post('/demo-complete', auth, async (req, res) => {
  try {
    const { orderId, success = true } = req.body;

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (success) {
      order.payment.status = 'completed';
      order.status = 'confirmed';
    } else {
      order.payment.status = 'failed';
      order.status = 'cancelled';
    }

    await order.save();

    res.json({
      message: success ? 'Payment completed successfully' : 'Payment failed',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get payment status
router.get('/status/:transactionId', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ 'payment.transactionId': req.params.transactionId });
    
    if (!order) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({
      status: order.payment.status,
      orderStatus: order.status,
      amount: order.payment.amount,
      orderId: order._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;