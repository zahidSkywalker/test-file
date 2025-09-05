const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: 'Server not configured' });

    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });
    const decoded = jwt.verify(token, secret);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    return res.json({ role: 'admin' });
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

