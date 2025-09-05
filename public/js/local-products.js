(function() {
  const STORAGE_KEY = 'local_products_v1';

  function readProducts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function writeProducts(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  function generateId() {
    return 'loc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  }

  function toDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleCreate(form) {
    const name = form.querySelector('[name="name"]').value.trim();
    const price = form.querySelector('[name="price"]').value.trim();
    const description = form.querySelector('[name="description"]').value.trim();
    const category = form.querySelector('[name="category"]').value.trim() || 'Other';
    const files = form.querySelector('[name="images"]').files;

    if (!name || !price) {
      alert('Name and Price are required');
      return;
    }

    const images = [];
    for (let i = 0; i < files.length; i++) {
      // Store images as base64 data URLs in localStorage (client-only, not recommended for large files)
      const dataUrl = await toDataUrl(files[i]);
      images.push(dataUrl);
    }

    const product = {
      id: generateId(),
      name,
      price,
      description,
      category,
      images,
      createdAt: new Date().toISOString()
    };

    const products = readProducts();
    products.unshift(product);
    writeProducts(products);

    form.reset();
    alert('Product saved locally!');
    window.location.href = '/products-local.html';
  }

  function renderList(container) {
    const products = readProducts();
    if (!products.length) {
      container.innerHTML = '<div class="text-gray-600">No local products yet. Add some!</div>';
      return;
    }
    container.innerHTML = '';
    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'border rounded-lg p-4 shadow-sm bg-white';
      const img = (p.images && p.images[0]) ? `<img src="${p.images[0]}" alt="${p.name}" class="w-full h-40 object-cover rounded mb-3"/>` : '';
      card.innerHTML = `
        ${img}
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold">${p.name}</h3>
          <span class="text-blue-600 font-bold">${p.price}</span>
        </div>
        <p class="text-sm text-gray-600 mt-1 line-clamp-2">${p.description || ''}</p>
        <div class="mt-3 flex gap-2">
          <button data-id="${p.id}" class="view-btn px-3 py-1 text-sm bg-gray-100 rounded">View</button>
          <button data-id="${p.id}" class="delete-btn px-3 py-1 text-sm bg-red-100 text-red-700 rounded">Delete</button>
        </div>
      `;
      container.appendChild(card);
    });

    container.addEventListener('click', (e) => {
      const viewBtn = e.target.closest('.view-btn');
      const deleteBtn = e.target.closest('.delete-btn');
      if (viewBtn) {
        const id = viewBtn.getAttribute('data-id');
        window.location.href = `/products-local.html?id=${encodeURIComponent(id)}`;
      }
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        const products = readProducts().filter(p => p.id !== id);
        writeProducts(products);
        renderList(container);
      }
    }, { once: true });
  }

  function renderDetail(container, id) {
    const products = readProducts();
    const p = products.find(x => x.id === id);
    if (!p) {
      container.innerHTML = '<div class="text-red-600">Product not found</div>';
      return;
    }
    const imgs = (p.images || []).map(src => `<img src="${src}" class="w-32 h-32 object-cover rounded"/>`).join('');
    container.innerHTML = `
      <h2 class="text-2xl font-bold mb-2">${p.name}</h2>
      <div class="text-blue-600 font-bold text-lg mb-2">${p.price}</div>
      <div class="text-gray-700 mb-4">${p.description || ''}</div>
      <div class="flex gap-2 flex-wrap">${imgs}</div>
      <div class="mt-4">
        <a href="/products-local.html" class="text-blue-600">Back to list</a>
      </div>
    `;
  }

  // Expose minimal API
  window.LocalProducts = {
    handleCreate,
    renderList,
    renderDetail
  };
})();

