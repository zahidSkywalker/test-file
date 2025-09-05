const jwt = require('jsonwebtoken');
const connectMongo = require('../_db');
const User = require('../../models/User');

module.exports = async (req, res) => {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectMongo(process.env.MONGODB_URI);

    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const updates = { ...(req.body || {}) };
    delete updates.password;
    delete updates.role;

    const user = await User.findByIdAndUpdate(decoded.id, updates, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

