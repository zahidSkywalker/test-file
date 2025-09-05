const jwt = require('jsonwebtoken');
const connectMongo = require('../_db');
const User = require('../../models/User');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectMongo(process.env.MONGODB_URI);

    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Invalid token.' });

    return res.json(user);
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

