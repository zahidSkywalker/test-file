// Admin SQLite Product Management
class AdminSQLiteManager {
  constructor() {
    this.baseUrl = '/api/admin/products';
    this.products = [];
    this.currentProduct = null;
  }

  // Initialize the admin interface
  async init() {
    await this.loadProducts();
    this.setupEventListeners();
  }

  // Load all products from SQLite
  async loadProducts() {
    try {
      const response = await fetch(this.baseUrl);
      const result = await response.json();
      
      if (result.success) {
        this.products = result.data;
        this.renderProducts();
      } else {
        this.showError('Failed to load products: ' + result.message);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      this.showError('Failed to load products');
    }
  }

  // Create a new product
  async createProduct(productData) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      const result = await response.json();
      
      if (result.success) {
        this.showSuccess('Product created successfully!');
        await this.loadProducts();
        this.resetForm();
      } else {
        this.showError('Failed to create product: ' + result.message);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      this.showError('Failed to create product');
    }
  }

  // Update an existing product
  async updateProduct(id, productData) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      const result = await response.json();
      
      if (result.success) {
        this.showSuccess('Product updated successfully!');
        await this.loadProducts();
        this.resetForm();
      } else {
        this.showError('Failed to update product: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      this.showError('Failed to update product');
    }
  }

  // Delete a product
  async deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        this.showSuccess('Product deleted successfully!');
        await this.loadProducts();
      } else {
        this.showError('Failed to delete product: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      this.showError('Failed to delete product');
    }
  }

  // Publish products to CDN
  async publishProducts() {
    try {
      const response = await fetch(`${this.baseUrl}/publish`, {
        method: 'POST'
      });

      const result = await response.json();
      
      if (result.success) {
        this.showSuccess(`Products published successfully! ${result.data.totalProducts} products published.`);
      } else {
        this.showError('Failed to publish products: ' + result.message);
      }
    } catch (error) {
      console.error('Error publishing products:', error);
      this.showError('Failed to publish products');
    }
  }

  // Render products in the table
  renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    if (this.products.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <p class="text-gray-500">No products found. Create your first product!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.products.map(product => `
      <tr class="border-b border-gray-200 hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <div class="flex-shrink-0 h-12 w-12">
              ${product.images ? JSON.parse(product.images)[0] ? 
                `<img class="h-12 w-12 rounded-lg object-cover" src="${JSON.parse(product.images)[0]}" alt="${product.name}">` :
                `<div class="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                  <i class="fas fa-image text-gray-400"></i>
                </div>` :
                `<div class="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                  <i class="fas fa-image text-gray-400"></i>
                </div>`
              }
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-900">${product.name}</div>
              <div class="text-sm text-gray-500">${product.category}</div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ৳${product.price}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${product.stock}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
            ${product.is_published ? 'Published' : 'Draft'}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button onclick="adminManager.editProduct(${product.id})" class="text-blue-600 hover:text-blue-900 mr-3">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button onclick="adminManager.deleteProduct(${product.id})" class="text-red-600 hover:text-red-900">
            <i class="fas fa-trash"></i> Delete
          </button>
        </td>
      </tr>
    `).join('');
  }

  // Edit a product
  editProduct(id) {
    const product = this.products.find(p => p.id === id);
    if (!product) return;

    this.currentProduct = product;
    this.populateForm(product);
    document.getElementById('product-form-title').textContent = 'Edit Product';
    document.getElementById('submit-btn').textContent = 'Update Product';
  }

  // Populate form with product data
  populateForm(product) {
    document.getElementById('product-name').value = product.name || '';
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-price').value = product.price || '';
    document.getElementById('product-original-price').value = product.original_price || '';
    document.getElementById('product-category').value = product.category || '';
    document.getElementById('product-brand').value = product.brand || '';
    document.getElementById('product-model').value = product.model || '';
    document.getElementById('product-stock').value = product.stock || '';
    document.getElementById('product-featured').checked = Boolean(product.is_featured);
    document.getElementById('product-published').checked = Boolean(product.is_published);
    
    // Handle images
    const images = product.images ? JSON.parse(product.images) : [];
    document.getElementById('product-images').value = images.join('\n');
    
    // Handle features
    const features = product.features ? JSON.parse(product.features) : [];
    document.getElementById('product-features').value = features.join('\n');
    
    // Handle specifications
    const specs = product.specifications ? JSON.parse(product.specifications) : {};
    document.getElementById('product-specs').value = JSON.stringify(specs, null, 2);
  }

  // Reset form
  resetForm() {
    document.getElementById('product-form').reset();
    this.currentProduct = null;
    document.getElementById('product-form-title').textContent = 'Add New Product';
    document.getElementById('submit-btn').textContent = 'Create Product';
  }

  // Setup event listeners
  setupEventListeners() {
    const form = document.getElementById('product-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }

    const publishBtn = document.getElementById('publish-btn');
    if (publishBtn) {
      publishBtn.addEventListener('click', () => {
        this.publishProducts();
      });
    }
  }

  // Handle form submission
  handleFormSubmit() {
    const formData = new FormData(document.getElementById('product-form'));
    
    const productData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      original_price: formData.get('original_price') ? parseFloat(formData.get('original_price')) : null,
      category: formData.get('category'),
      brand: formData.get('brand'),
      model: formData.get('model'),
      stock: parseInt(formData.get('stock')) || 0,
      is_featured: formData.get('featured') === 'on',
      is_published: formData.get('published') === 'on',
      images: formData.get('images').split('\n').filter(url => url.trim()),
      features: formData.get('features').split('\n').filter(feature => feature.trim()),
      specifications: this.parseSpecifications(formData.get('specs'))
    };

    if (this.currentProduct) {
      this.updateProduct(this.currentProduct.id, productData);
    } else {
      this.createProduct(productData);
    }
  }

  // Parse specifications JSON
  parseSpecifications(specsText) {
    try {
      return JSON.parse(specsText);
    } catch (error) {
      return {};
    }
  }

  // Show success message
  showSuccess(message) {
    this.showMessage(message, 'success');
  }

  // Show error message
  showError(message) {
    this.showMessage(message, 'error');
  }

  // Show message
  showMessage(message, type) {
    const alertClass = type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700';
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `fixed top-4 right-4 p-4 rounded-lg border ${alertClass} z-50`;
    alertDiv.innerHTML = `
      <div class="flex items-center">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-lg">&times;</button>
      </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      if (alertDiv.parentElement) {
        alertDiv.remove();
      }
    }, 5000);
  }
}

// Initialize admin manager when DOM is loaded
let adminManager;
document.addEventListener('DOMContentLoaded', () => {
  adminManager = new AdminSQLiteManager();
  adminManager.init();
});