const crypto = require('crypto');

function sha1(input) {
  return crypto.createHash('sha1').update(input).digest('hex');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const folder = process.env.CLOUDINARY_FEED_FOLDER || 'feeds';
    const publicId = process.env.CLOUDINARY_FEED_PUBLIC_ID || 'products';

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({ message: 'Cloudinary env vars missing' });
    }

    const auth = req.headers['authorization'] || '';
    const token = auth.replace('Bearer ', '');
    // Lightweight check using existing admin/me endpoint
    try {
      const verifyRes = await fetch(`${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/admin/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!verifyRes.ok) return res.status(401).json({ message: 'Unauthorized' });
    } catch (_) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const body = await (async () => {
      try { return await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => resolve(JSON.parse(data || '{}')));
        req.on('error', reject);
      }); } catch { return {}; }
    })();

    const products = Array.isArray(body.products) ? body.products : [];
    const content = JSON.stringify({ products, generatedAt: new Date().toISOString() });
    const base64 = Buffer.from(content).toString('base64');
    const timestamp = Math.floor(Date.now() / 1000);
    const overwrite = 'true';

    // public_id can include folder path when combined with folder param or as full path
    const fullPublicId = `${folder}/${publicId}`;

    // Build signature string (alphabetical params, exclude file, resource_type, api_key, signature)
    const paramsToSign = `overwrite=${overwrite}&public_id=${fullPublicId}&timestamp=${timestamp}`;
    const signature = sha1(paramsToSign + apiSecret);

    const form = new FormData();
    form.append('file', `data:application/json;base64,${base64}`);
    form.append('api_key', apiKey);
    form.append('timestamp', String(timestamp));
    form.append('public_id', fullPublicId);
    form.append('overwrite', overwrite);
    form.append('signature', signature);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
    const uploadRes = await fetch(uploadUrl, { method: 'POST', body: form });
    const json = await uploadRes.json();
    if (!uploadRes.ok) {
      return res.status(500).json({ message: 'Cloudinary upload failed', error: json });
    }

    return res.json({
      message: 'Feed published',
      feed_url: json.secure_url,
      public_id: json.public_id,
      version: json.version
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

