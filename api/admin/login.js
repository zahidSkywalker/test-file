const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const adminPass = process.env.ADMIN_PASS || '';
    const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: 'Server not configured' });

    const { passcode } = req.body || {};
    if (!passcode) return res.status(400).json({ message: 'passcode required' });

    if (!adminPass) return res.status(403).json({ message: 'Admin login disabled' });
    if (passcode !== adminPass) return res.status(401).json({ message: 'Invalid passcode' });

    const token = jwt.sign({ role: 'admin' }, secret, { expiresIn: '7d' });
    return res.json({ token, role: 'admin' });
  } catch (e) {
    return res.status(500).json({ message: 'Server error', error: e.message });
  }
};

