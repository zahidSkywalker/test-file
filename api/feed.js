module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const folder = process.env.CLOUDINARY_FEED_FOLDER || 'feeds';
    const publicId = process.env.CLOUDINARY_FEED_PUBLIC_ID || 'products';
    if (!cloudName) {
      return res.json({ products: [], source: 'missing-cloudinary-config' });
    }
    const url = `https://res.cloudinary.com/${cloudName}/raw/upload/${folder}/${publicId}.json`;
    const r = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
    if (!r.ok) return res.json({ products: [], source: 'cdn-miss' });
    const data = await r.json();
    return res.json({ products: Array.isArray(data.products) ? data.products : [], source: 'cdn', generatedAt: data.generatedAt || null });
  } catch (e) {
    return res.json({ products: [], source: 'error' });
  }
};

