// Seller Dashboard functionality
let currentSection = 'overview';
let selectedImages = [];
let editingProductId = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    initializeSidebar();
    initializeImageUpload();
    initializeForms();
    loadDashboardData();
});

function initializeDashboard() {
    // Check if user is logged in and has seller privileges
    if (!isLoggedIn()) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        return;
    }

    const user = getCurrentUser();
    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
        showToast('Access denied. Seller privileges required.', 'error');
        window.location.href = '/';
        return;
    }

    // Update seller name
    document.getElementById('sellerName').textContent = user.sellerInfo?.businessName || user.name;
}

function initializeSidebar() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            switchSection(section);
        });
    });

    // Handle URL hash
    const hash = window.location.hash.substring(1);
    if (hash) {
        switchSection(hash);
    }
}

function switchSection(section) {
    // Update sidebar active state
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active', 'bg-primary-100', 'text-primary-600');
        link.classList.add('text-gray-700', 'hover:bg-gray-100');
    });

    const activeLink = document.querySelector(`[data-section="${section}"]`);
    if (activeLink) {
        activeLink.classList.add('active', 'bg-primary-100', 'text-primary-600');
        activeLink.classList.remove('text-gray-700', 'hover:bg-gray-100');
    }

    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(sectionEl => {
        sectionEl.classList.add('hidden');
    });

    // Show selected section
    const sectionElement = document.getElementById(`${section}Section`);
    if (sectionElement) {
        sectionElement.classList.remove('hidden');
        currentSection = section;

        // Load section-specific data
        switch (section) {
            case 'overview':
                loadOverviewData();
                break;
            case 'products':
                loadSellerProducts();
                break;
            case 'orders':
                loadSellerOrders();
                break;
            case 'analytics':
                loadAnalytics();
                break;
            case 'settings':
                loadSettings();
                break;
        }

        // Animate section
        if (typeof gsap !== 'undefined') {
            gsap.from(sectionElement, {
                duration: 0.5,
                y: 20,
                opacity: 0,
                ease: 'power2.out'
            });
        }
    }

    // Update URL
    window.history.pushState({}, '', `#${section}`);
}

function initializeImageUpload() {
    const imageUploadArea = document.getElementById('imageUploadArea');
    const productImages = document.getElementById('productImages');
    const previewContainer = document.getElementById('imagePreviewContainer');

    // Drag and drop functionality
    imageUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('border-primary-500', 'bg-primary-50');
    });

    imageUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('border-primary-500', 'bg-primary-50');
    });

    imageUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('border-primary-500', 'bg-primary-50');
        
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        handleImageFiles(files);
    });

    // File input change
    productImages.addEventListener('change', function() {
        handleImageFiles(Array.from(this.files));
    });

    // Click to upload
    imageUploadArea.addEventListener('click', function() {
        productImages.click();
    });
}

function handleImageFiles(files) {
    const maxFiles = 10;
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (selectedImages.length + files.length > maxFiles) {
        showToast(`Maximum ${maxFiles} images allowed`, 'warning');
        return;
    }

    files.forEach(file => {
        if (file.size > maxSize) {
            showToast(`${file.name} is too large. Maximum size is 5MB`, 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = {
                file: file,
                url: e.target.result,
                name: file.name
            };
            
            selectedImages.push(imageData);
            updateImagePreview();
        };
        reader.readAsDataURL(file);
    });
}

function updateImagePreview() {
    const container = document.getElementById('imagePreviewContainer');
    
    if (selectedImages.length === 0) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    
    container.innerHTML = selectedImages.map((image, index) => `
        <div class="relative group image-preview" data-index="${index}">
            <img src="${image.url}" alt="${image.name}" class="w-full h-24 object-cover rounded-lg">
            <button type="button" class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 remove-image" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
            <div class="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                ${index + 1}
            </div>
        </div>
    `).join('');

    // Add remove functionality
    container.querySelectorAll('.remove-image').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            selectedImages.splice(index, 1);
            updateImagePreview();
        });
    });

    // Initialize drag-and-drop reordering
    new Sortable(container, {
        animation: 150,
        ghostClass: 'opacity-50',
        onEnd: function(evt) {
            const item = selectedImages.splice(evt.oldIndex, 1)[0];
            selectedImages.splice(evt.newIndex, 0, item);
            updateImagePreview();
        }
    });
}

function initializeForms() {
    // Add product form
    document.getElementById('addProductForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await submitProduct();
    });

    // Free shipping toggle
    document.getElementById('freeShipping').addEventListener('change', function() {
        const shippingCostInput = document.getElementById('shippingCost');
        if (this.checked) {
            shippingCostInput.value = '0';
            shippingCostInput.disabled = true;
        } else {
            shippingCostInput.disabled = false;
        }
    });

    // Business info form
    document.getElementById('businessInfoForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await updateBusinessInfo();
    });
}

async function submitProduct() {
    const submitBtn = document.getElementById('submitProductBtn');
    const submitBtnText = document.getElementById('submitBtnText');
    const submitBtnLoading = document.getElementById('submitBtnLoading');

    // Validate form
    if (selectedImages.length === 0) {
        showToast('Please add at least one product image', 'warning');
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtnText.classList.add('hidden');
    submitBtnLoading.classList.remove('hidden');

    try {
        const formData = new FormData();
        
        // Add images
        selectedImages.forEach(image => {
            formData.append('images', image.file);
        });

        // Add product data
        const productData = {
            title: document.getElementById('productTitle').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            originalPrice: document.getElementById('originalPrice').value ? 
                parseFloat(document.getElementById('originalPrice').value) : undefined,
            category: document.getElementById('productCategory').value,
            condition: document.getElementById('productCondition').value,
            brand: document.getElementById('productBrand').value,
            specifications: {
                weight: document.getElementById('productWeight').value,
                color: document.getElementById('productColor').value,
                size: document.getElementById('productSize').value
            },
            inventory: {
                quantity: parseInt(document.getElementById('productQuantity').value)
            },
            shipping: {
                freeShipping: document.getElementById('freeShipping').checked,
                shippingCost: parseFloat(document.getElementById('shippingCost').value || 0)
            },
            tags: document.getElementById('productTags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        // Add product data to form
        Object.keys(productData).forEach(key => {
            if (typeof productData[key] === 'object') {
                formData.append(key, JSON.stringify(productData[key]));
            } else {
                formData.append(key, productData[key]);
            }
        });

        const response = await fetch('/api/products', {
            method: editingProductId ? 'PUT' : 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            showToast(editingProductId ? 'Product updated successfully!' : 'Product added successfully!', 'success');
            clearForm();
            switchSection('products');
        } else {
            throw new Error(result.message || 'Failed to save product');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showToast(error.message || 'Failed to save product', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtnText.classList.remove('hidden');
        submitBtnLoading.classList.add('hidden');
    }
}

function clearForm() {
    document.getElementById('addProductForm').reset();
    selectedImages = [];
    updateImagePreview();
    editingProductId = null;
    
    // Reset button text
    document.getElementById('submitBtnText').innerHTML = '<i class="fas fa-plus mr-2"></i>Add Product';
}

async function loadDashboardData() {
    try {
        // Load basic stats (demo data for now)
        updateStats({
            totalProducts: 12,
            totalSales: 2450,
            activeOrders: 8,
            sellerRating: 4.7
        });

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function updateStats(stats) {
    document.getElementById('totalProducts').textContent = stats.totalProducts;
    document.getElementById('totalSales').textContent = `$${stats.totalSales.toLocaleString()}`;
    document.getElementById('activeOrders').textContent = stats.activeOrders;
    document.getElementById('sellerRating').textContent = stats.sellerRating;

    // Animate counters
    if (typeof gsap !== 'undefined') {
        Object.keys(stats).forEach(key => {
            const element = document.getElementById(key);
            if (element && typeof stats[key] === 'number') {
                animations.animateCounter(element, stats[key]);
            }
        });
    }
}

async function loadOverviewData() {
    // Load recent orders (demo data)
    const recentOrdersContainer = document.getElementById('recentOrders');
    const demoOrders = [
        { id: 'ORD-001', customer: 'John Doe', product: 'iPhone 13 Pro', amount: 899, status: 'shipped' },
        { id: 'ORD-002', customer: 'Jane Smith', product: 'MacBook Air', amount: 1099, status: 'processing' },
        { id: 'ORD-003', customer: 'Mike Johnson', product: 'Gaming Chair', amount: 299, status: 'delivered' }
    ];

    recentOrdersContainer.innerHTML = demoOrders.map(order => `
        <div class="flex items-center justify-between py-3 border-b last:border-b-0">
            <div>
                <p class="font-medium text-sm">${order.id}</p>
                <p class="text-xs text-gray-600">${order.customer} • ${order.product}</p>
            </div>
            <div class="text-right">
                <p class="font-medium text-sm">$${order.amount}</p>
                <span class="badge badge-${order.status === 'delivered' ? 'success' : order.status === 'shipped' ? 'warning' : 'info'} text-xs">
                    ${order.status}
                </span>
            </div>
        </div>
    `).join('');

    // Load top products (demo data)
    const topProductsContainer = document.getElementById('topProducts');
    const demoTopProducts = [
        { name: 'iPhone 13 Pro Max', views: 245, sales: 12 },
        { name: 'MacBook Air M2', views: 189, sales: 8 },
        { name: 'Gaming Chair', views: 156, sales: 15 }
    ];

    topProductsContainer.innerHTML = demoTopProducts.map(product => `
        <div class="flex items-center justify-between py-3 border-b last:border-b-0">
            <div>
                <p class="font-medium text-sm">${product.name}</p>
                <p class="text-xs text-gray-600">${product.views} views • ${product.sales} sales</p>
            </div>
            <div class="w-16 bg-gray-200 rounded-full h-2">
                <div class="bg-primary-600 h-2 rounded-full" style="width: ${(product.sales / 20) * 100}%"></div>
            </div>
        </div>
    `).join('');
}

async function loadSellerProducts() {
    const tableBody = document.getElementById('productsTableBody');
    
    // Show loading
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="px-6 py-12 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p class="text-gray-600">Loading products...</p>
            </td>
        </tr>
    `;

    try {
        const response = await apiRequest('/api/products/seller/my-products');
        
        if (response && response.ok) {
            const data = await response.json();
            displaySellerProducts(data.products);
        } else {
            throw new Error('Failed to load products');
        }
    } catch (error) {
        console.error('Error loading seller products:', error);
        displayDemoSellerProducts();
    }
}

function displaySellerProducts(products) {
    const tableBody = document.getElementById('productsTableBody');
    
    if (products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center">
                    <i class="fas fa-box text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600">No products found</p>
                    <button class="btn-primary mt-4" data-section="add-product">Add Your First Product</button>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = products.map(product => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <img src="${product.images[0]?.url || '/images/placeholder.svg'}" 
                         alt="${product.title}" 
                         class="w-12 h-12 object-cover rounded-lg mr-4">
                    <div>
                        <div class="text-sm font-medium text-gray-900">${product.title}</div>
                        <div class="text-sm text-gray-500">${product.category}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">$${product.price}</div>
                ${product.originalPrice ? `<div class="text-sm text-gray-500 line-through">$${product.originalPrice}</div>` : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${product.inventory.quantity}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="badge ${getStatusBadgeClass(product.status)}">${product.status}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${product.views || 0}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                    <button class="text-primary-600 hover:text-primary-900 edit-product" data-product-id="${product._id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900 delete-product" data-product-id="${product._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <a href="/product/${product._id}" target="_blank" class="text-gray-600 hover:text-gray-900">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </td>
        </tr>
    `).join('');

    // Add event listeners
    addProductActionListeners();
}

function displayDemoSellerProducts() {
    const demoProducts = [
        {
            _id: 'demo1',
            title: 'iPhone 14 Pro Max',
            category: 'electronics',
            price: 999,
            originalPrice: 1199,
            inventory: { quantity: 2 },
            status: 'active',
            views: 312,
            images: [{ url: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=100&q=80' }]
        },
        {
            _id: 'demo2',
            title: 'MacBook Pro 16" M2 Max',
            category: 'electronics',
            price: 2299,
            originalPrice: 2699,
            inventory: { quantity: 1 },
            status: 'active',
            views: 198,
            images: [{ url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100&q=80' }]
        },
        {
            _id: 'demo3',
            title: 'Sony WH-1000XM5',
            category: 'electronics',
            price: 299,
            originalPrice: 399,
            inventory: { quantity: 4 },
            status: 'active',
            views: 278,
            images: [{ url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=100&q=80' }]
        },
        {
            _id: 'demo4',
            title: 'Canon EOS R6 Mark II',
            category: 'electronics',
            price: 1899,
            originalPrice: 2499,
            inventory: { quantity: 1 },
            status: 'active',
            views: 189,
            images: [{ url: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=100&q=80' }]
        },
        {
            _id: 'demo5',
            title: 'DJI Mini 3 Pro',
            category: 'electronics',
            price: 649,
            originalPrice: 759,
            inventory: { quantity: 0 },
            status: 'sold',
            views: 267,
            images: [{ url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=100&q=80' }]
        }
    ];

    displaySellerProducts(demoProducts);
}

function addProductActionListeners() {
    // Edit product buttons
    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.productId;
            editProduct(productId);
        });
    });

    // Delete product buttons
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.productId;
            if (confirm('Are you sure you want to delete this product?')) {
                deleteProduct(productId);
            }
        });
    });
}

async function editProduct(productId) {
    try {
        const response = await apiRequest(`/api/products/${productId}`);
        if (response && response.ok) {
            const product = await response.json();
            populateEditForm(product);
            switchSection('add-product');
        } else {
            throw new Error('Failed to load product');
        }
    } catch (error) {
        console.error('Error loading product for edit:', error);
        showToast('Failed to load product for editing', 'error');
    }
}

function populateEditForm(product) {
    editingProductId = product._id;
    
    // Populate form fields
    document.getElementById('productTitle').value = product.title;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('originalPrice').value = product.originalPrice || '';
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productCondition').value = product.condition;
    document.getElementById('productBrand').value = product.brand || '';
    document.getElementById('productQuantity').value = product.inventory.quantity;
    document.getElementById('productWeight').value = product.specifications?.weight || '';
    document.getElementById('productColor').value = product.specifications?.color || '';
    document.getElementById('productSize').value = product.specifications?.size || '';
    document.getElementById('productTags').value = product.tags?.join(', ') || '';
    document.getElementById('freeShipping').checked = product.shipping?.freeShipping || false;
    document.getElementById('shippingCost').value = product.shipping?.shippingCost || 0;

    // Update button text
    document.getElementById('submitBtnText').innerHTML = '<i class="fas fa-save mr-2"></i>Update Product';

    // Load existing images
    selectedImages = product.images?.map((img, index) => ({
        url: img.url,
        name: `existing-${index}`,
        existing: true
    })) || [];
    
    updateImagePreview();
}

async function deleteProduct(productId) {
    try {
        const response = await apiRequest(`/api/products/${productId}`, {
            method: 'DELETE'
        });

        if (response && response.ok) {
            showToast('Product deleted successfully', 'success');
            loadSellerProducts();
        } else {
            throw new Error('Failed to delete product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Failed to delete product', 'error');
    }
}

async function loadSellerOrders() {
    const tableBody = document.getElementById('ordersTableBody');
    
    // Show loading
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="px-6 py-12 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p class="text-gray-600">Loading orders...</p>
            </td>
        </tr>
    `;

    try {
        const response = await apiRequest('/api/orders/seller/orders');
        
        if (response && response.ok) {
            const data = await response.json();
            displaySellerOrders(data.orders);
        } else {
            throw new Error('Failed to load orders');
        }
    } catch (error) {
        console.error('Error loading seller orders:', error);
        displayDemoSellerOrders();
    }
}

function displayDemoSellerOrders() {
    const demoOrders = [
        {
            _id: 'order1',
            orderNumber: 'ORD-001',
            buyer: { name: 'John Doe', email: 'john@example.com' },
            items: [{ product: { title: 'iPhone 13 Pro' }, quantity: 1 }],
            totals: { total: 899 },
            status: 'shipped',
            createdAt: new Date().toISOString()
        },
        {
            _id: 'order2',
            orderNumber: 'ORD-002',
            buyer: { name: 'Jane Smith', email: 'jane@example.com' },
            items: [{ product: { title: 'MacBook Air' }, quantity: 1 }],
            totals: { total: 1099 },
            status: 'processing',
            createdAt: new Date(Date.now() - 86400000).toISOString()
        }
    ];

    displaySellerOrders(demoOrders);
}

function displaySellerOrders(orders) {
    const tableBody = document.getElementById('ordersTableBody');
    
    if (orders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-12 text-center">
                    <i class="fas fa-shopping-bag text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600">No orders found</p>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = orders.map(order => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${order.orderNumber}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${order.buyer.name}</div>
                <div class="text-sm text-gray-500">${order.buyer.email}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${order.items.length} item(s)</div>
                <div class="text-sm text-gray-500">${order.items[0].product.title}${order.items.length > 1 ? '...' : ''}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">$${order.totals.total}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatDate(order.createdAt)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                    <button class="text-primary-600 hover:text-primary-900 view-order" data-order-id="${order._id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="text-green-600 hover:text-green-900 update-order-status" data-order-id="${order._id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getStatusBadgeClass(status) {
    const statusClasses = {
        'active': 'badge-success',
        'inactive': 'bg-gray-100 text-gray-800',
        'sold': 'badge-warning',
        'pending': 'bg-yellow-100 text-yellow-800',
        'confirmed': 'badge-success',
        'processing': 'bg-blue-100 text-blue-800',
        'shipped': 'badge-warning',
        'delivered': 'badge-success',
        'cancelled': 'badge-danger'
    };
    
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
}

async function loadAnalytics() {
    // Demo analytics data
    const analyticsData = {
        salesThisMonth: 2450,
        salesLastMonth: 1890,
        growth: 29.6,
        topCategories: [
            { name: 'Electronics', percentage: 75 },
            { name: 'Clothing', percentage: 45 },
            { name: 'Home', percentage: 30 }
        ]
    };

    // Update analytics display
    // This would typically involve charts and more detailed analytics
}

async function loadSettings() {
    const user = getCurrentUser();
    
    // Populate business info form
    document.getElementById('businessName').value = user.sellerInfo?.businessName || '';
    document.getElementById('businessEmail').value = user.email;
    document.getElementById('businessDescription').value = user.sellerInfo?.businessDescription || '';
}

async function updateBusinessInfo() {
    try {
        const updateData = {
            sellerInfo: {
                businessName: document.getElementById('businessName').value,
                businessDescription: document.getElementById('businessDescription').value
            }
        };

        const response = await apiRequest('/api/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });

        if (response && response.ok) {
            const data = await response.json();
            
            // Update stored user data
            localStorage.setItem('userData', JSON.stringify(data.user));
            
            showToast('Business information updated successfully', 'success');
        } else {
            throw new Error('Failed to update business information');
        }
    } catch (error) {
        console.error('Error updating business info:', error);
        showToast('Failed to update business information', 'error');
    }
}

// Initialize dashboard animations
function initializeDashboardAnimations() {
    if (typeof gsap !== 'undefined') {
        // Animate stats cards
        gsap.from('.bg-white.rounded-lg.shadow-md', {
            duration: 0.6,
            y: 20,
            opacity: 0,
            stagger: 0.1,
            ease: 'power2.out'
        });
    }
}

// Call animations after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeDashboardAnimations, 500);
});