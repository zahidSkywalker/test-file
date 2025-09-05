(function() {
  const FEED_URL = '/api/feed';
  const CART_KEY = 'cart_items_v1';
  const FEED_CACHE_KEY = 'feed_cache_v1';
  const FEED_CACHE_MS = 5 * 60 * 1000; // 5 minutes

  async function fetchFeed() {
    try {
      const cached = JSON.parse(localStorage.getItem(FEED_CACHE_KEY) || 'null');
      const now = Date.now();
      if (cached && (now - cached.timestamp) < FEED_CACHE_MS) {
        return cached.products || [];
      }
      const r = await fetch(FEED_URL, { cache: 'no-store' });
      const data = await r.json();
      const products = Array.isArray(data.products) ? data.products : [];
      localStorage.setItem(FEED_CACHE_KEY, JSON.stringify({ timestamp: now, products }));
      return products;
    } catch (_) {
      return [];
    }
  }

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
  }

  function setCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent('cart:update', { detail: { items } }));
  }

  function addToCart(product, quantity = 1) {
    const items = getCart();
    const idx = items.findIndex(i => i.id === product.id);
    if (idx >= 0) items[idx].quantity += quantity; else items.push({ id: product.id, name: product.name, price: product.price, image: (product.images && product.images[0]) || '', quantity });
    setCart(items);
  }

  function removeFromCart(id) {
    const items = getCart().filter(i => i.id !== id);
    setCart(items);
  }

  function getShareUrl(product) {
    const url = new URL(window.location.origin + '/product-detail');
    url.searchParams.set('id', product.id);
    return url.toString();
  }

  async function getProductById(id) {
    const products = await fetchFeed();
    return products.find(p => String(p.id) === String(id));
  }

  window.Store = {
    fetchFeed,
    getProductById,
    getCart,
    addToCart,
    removeFromCart,
    getShareUrl
  };
})();

