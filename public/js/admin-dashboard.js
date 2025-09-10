// Modern Admin Dashboard JavaScript
let currentAdminSection = 'overview';
let adminCurrentPage = 1;
let products = [];
let orders = [];
let users = [];
let charts = {};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminDashboard();
    initializeAdminSidebar();
    loadAdminDashboardData();
    initializeCharts();
});

function initializeAdminDashboard() {
    // Check authentication
    if (!isLoggedIn()) {
        window.location.href = '/admin-login.html';
        return;
    }

    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        showToast('Access denied. Admin privileges required.', 'error');
        window.location.href = '/admin-login.html';
        return;
    }

    // Initialize event listeners
    initializeEventListeners();
    
    // Load initial data
    loadProducts();
    loadOrders();
    loadUsers();
}

function initializeEventListeners() {
    // Global search
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.addEventListener('input', handleGlobalSearch);
    }

    // View toggle buttons
    const gridViewBtn = document.getElementById('grid-view');
    const listViewBtn = document.getElementById('list-view');
    
    if (gridViewBtn) gridViewBtn.addEventListener('click', () => switchView('grid'));
    if (listViewBtn) listViewBtn.addEventListener('click', () => switchView('list'));

    // Filter dropdowns
    const categoryFilter = document.getElementById('category-filter');
    const statusFilter = document.getElementById('status-filter');
    
    if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);
    if (statusFilter) statusFilter.addEventListener('change', filterProducts);

    // Analytics period selector
    const analyticsPeriod = document.getElementById('analytics-period');
    if (analyticsPeriod) {
        analyticsPeriod.addEventListener('change', updateAnalytics);
    }

    // Add product form
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }

    // Image upload
    const imageInput = document.getElementById('product-images');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
    }
}

function initializeAdminSidebar() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            switchAdminSection(section);
        });
    });

    // Handle URL hash
    const hash = window.location.hash.substring(1);
    if (hash) {
        switchAdminSection(hash);
    }
}

function switchAdminSection(section) {
    // Update sidebar active state
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`[data-section="${section}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(sectionEl => {
        sectionEl.classList.add('hidden');
    });

    // Show selected section
    const sectionElement = document.getElementById(`${section}Section`);
    if (sectionElement) {
        sectionElement.classList.remove('hidden');
        currentAdminSection = section;

        // Update page title
        const pageTitle = document.getElementById('page-title');
        const titles = {
            'overview': 'Dashboard Overview',
            'products': 'Product Management',
            'orders': 'Order Management',
            'users': 'User Management',
            'analytics': 'Analytics & Reports',
            'settings': 'Settings'
        };
        if (pageTitle) {
            pageTitle.textContent = titles[section] || 'Dashboard';
        }

        // Load section-specific data
        switch (section) {
            case 'overview':
                loadAdminOverview();
                break;
            case 'products':
                loadAdminProducts();
                break;
            case 'orders':
                loadAdminOrders();
                break;
            case 'users':
                loadAdminUsers();
                break;
            case 'analytics':
                loadAdminAnalytics();
                break;
        }

        // Animate section
        animateSection(sectionElement);
    }

    // Update URL
    window.history.pushState({}, '', `#${section}`);
}

function animateSection(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        element.style.transition = 'all 0.5s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, 100);
}

// Data Loading Functions
async function loadAdminDashboardData() {
    try {
        await Promise.all([
            loadProducts(),
            loadOrders(),
            loadUsers()
        ]);
        updateDashboardStats();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Error loading dashboard data', 'error');
    }
}

async function loadProducts() {
    try {
        const response = await fetch('/api/admin/products');
        if (response.ok) {
            const data = await response.json();
            products = data.data || data.products || [];
            populateCategoryFilter();
        } else {
            // Fallback to localStorage
            products = JSON.parse(localStorage.getItem('products') || '[]');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        products = JSON.parse(localStorage.getItem('products') || '[]');
    }
}

async function loadOrders() {
    try {
        const response = await fetch('/api/orders');
        if (response.ok) {
            orders = await response.json();
        } else {
            orders = JSON.parse(localStorage.getItem('orders') || '[]');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        orders = JSON.parse(localStorage.getItem('orders') || '[]');
    }
}

async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        if (response.ok) {
            users = await response.json();
        } else {
            users = JSON.parse(localStorage.getItem('users') || '[]');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        users = JSON.parse(localStorage.getItem('users') || '[]');
    }
}

function updateDashboardStats() {
    // Update overview stats
    document.getElementById('total-products').textContent = products.length;
    document.getElementById('active-products').textContent = products.filter(p => p.status === 'active').length;
    document.getElementById('total-orders').textContent = orders.length;
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    document.getElementById('total-revenue').textContent = `৳${totalRevenue.toLocaleString()}`;
}

// Section-specific loading functions
function loadAdminOverview() {
    updateDashboardStats();
    loadRecentActivity();
    updateOverviewCharts();
}

function loadAdminProducts() {
    renderProducts();
}

function loadAdminOrders() {
    renderOrders();
}

function loadAdminUsers() {
    renderUsers();
}

function loadAdminAnalytics() {
    updateAnalytics();
}

// Product Management
function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    const filteredProducts = getFilteredProducts();
    
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-box-open text-6xl text-gray-400 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No products found</h3>
                <p class="text-gray-500 dark:text-gray-500">Try adjusting your filters or add a new product.</p>
            </div>
        `;
        return;
    }

    const isGridView = container.classList.contains('product-grid');
    container.innerHTML = filteredProducts.map(product => createProductCard(product, isGridView)).join('');
}

function createProductCard(product, isGrid = true) {
    const statusClass = product.status === 'active' ? 'status-active' : 'status-inactive';
    const statusText = product.status === 'active' ? 'Active' : 'Inactive';
    const productId = product._id || product.id;
    const productName = product.title || product.name;
    const productImage = product.images?.[0]?.url || product.images?.[0] || '/images/placeholder.svg';
    
    if (isGrid) {
        return `
            <div class="admin-card p-6 fade-in" data-product-id="${productId}">
                <div class="mb-4">
                    <img src="${productImage}" 
                         alt="${productName}" 
                         class="image-preview ${productImage !== '/images/placeholder.svg' ? 'has-image' : ''}">
                </div>
                <div class="mb-4">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">${productName}</h3>
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">${product.category}</p>
                    <p class="text-gray-500 dark:text-gray-500 text-sm line-clamp-2">${product.description || 'No description'}</p>
                </div>
                <div class="flex items-center justify-between mb-4">
                    <span class="text-2xl font-bold text-gray-800 dark:text-white">৳${product.price}</span>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Stock: ${product.stock || 0}</span>
                    <div class="flex space-x-2">
                        <button onclick="editProduct('${productId}')" class="btn-primary text-sm px-3 py-1">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteProduct('${productId}')" class="btn-danger text-sm px-3 py-1">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="admin-card p-6 fade-in" data-product-id="${productId}">
                <div class="flex items-center">
                    <div class="w-20 h-20 mr-4">
                        <img src="${productImage}" 
                             alt="${productName}" 
                             class="w-full h-full object-cover rounded-lg">
                    </div>
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-1">${productName}</h3>
                        <p class="text-gray-600 dark:text-gray-400 text-sm mb-1">${product.category}</p>
                        <p class="text-gray-500 dark:text-gray-500 text-sm">${product.description || 'No description'}</p>
                    </div>
                    <div class="text-right mr-4">
                        <div class="text-2xl font-bold text-gray-800 dark:text-white mb-1">৳${product.price}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Stock: ${product.stock || 0}</div>
                    </div>
                    <div class="flex flex-col items-end space-y-2">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                        <div class="flex space-x-2">
                            <button onclick="editProduct('${productId}')" class="btn-primary text-sm px-3 py-1">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteProduct('${productId}')" class="btn-danger text-sm px-3 py-1">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function getFilteredProducts() {
    const categoryFilter = document.getElementById('category-filter')?.value;
    const statusFilter = document.getElementById('status-filter')?.value;
    const searchTerm = document.getElementById('global-search')?.value.toLowerCase();

    return products.filter(product => {
        const productName = (product.title || product.name || '').toLowerCase();
        const productDescription = (product.description || '').toLowerCase();
        const productCategory = (product.category || '').toLowerCase();
        
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        const matchesStatus = !statusFilter || product.status === statusFilter;
        const matchesSearch = !searchTerm || 
            productName.includes(searchTerm) ||
            productDescription.includes(searchTerm) ||
            productCategory.includes(searchTerm);

        return matchesCategory && matchesStatus && matchesSearch;
    });
}

function populateCategoryFilter() {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) return;

    const categories = [...new Set(products.map(p => p.category))];
    categoryFilter.innerHTML = '<option value="">All Categories</option>' +
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

// View Management
function switchView(view) {
    const container = document.getElementById('products-container');
    const gridBtn = document.getElementById('grid-view');
    const listBtn = document.getElementById('list-view');

    if (view === 'grid') {
        container.className = 'product-grid';
        gridBtn.className = 'p-2 bg-blue-100 text-blue-600 rounded-lg';
        listBtn.className = 'p-2 text-gray-600 hover:bg-gray-100 rounded-lg';
    } else {
        container.className = 'product-list';
        listBtn.className = 'p-2 bg-blue-100 text-blue-600 rounded-lg';
        gridBtn.className = 'p-2 text-gray-600 hover:bg-gray-100 rounded-lg';
    }

    renderProducts();
}

// Search and Filter
function handleGlobalSearch() {
    if (currentAdminSection === 'products') {
        renderProducts();
    }
}

function filterProducts() {
    renderProducts();
}

// Product CRUD Operations
function openAddProductModal() {
    document.getElementById('addProductModal').classList.add('show');
}

function closeAddProductModal() {
    document.getElementById('addProductModal').classList.remove('show');
    document.getElementById('addProductForm').reset();
    document.getElementById('image-preview-container').innerHTML = '';
}

function handleAddProduct(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const productData = {
        title: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock')),
        description: formData.get('description'),
        status: 'active',
        condition: 'new',
        brand: formData.get('brand') || '',
        model: formData.get('model') || '',
        features: [],
        specifications: {}
    };

    // Create product via API
    createProductAPI(productData);
}

async function createProductAPI(productData) {
    try {
        const response = await fetch('/api/admin/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            const result = await response.json();
            showToast('Product added successfully!', 'success');
            closeAddProductModal();
            loadProducts(); // Reload products
            updateDashboardStats();
        } else {
            const error = await response.json();
            showToast(`Error: ${error.message || 'Failed to create product'}`, 'error');
        }
    } catch (error) {
        console.error('Error creating product:', error);
        showToast('Error creating product. Please try again.', 'error');
    }
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Pre-fill form with product data
    const form = document.getElementById('addProductForm');
    form.name.value = product.name;
    form.category.value = product.category;
    form.price.value = product.price;
    form.stock.value = product.stock;
    form.description.value = product.description;

    // Show modal
    document.getElementById('addProductModal').classList.add('show');
    
    // Update form to handle edit
    form.onsubmit = (e) => handleEditProduct(e, productId);
}

function handleEditProduct(e, productId) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex !== -1) {
        products[productIndex] = {
            ...products[productIndex],
            name: formData.get('name'),
            category: formData.get('category'),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            description: formData.get('description'),
            images: getUploadedImages().length > 0 ? getUploadedImages() : products[productIndex].images
        };

        localStorage.setItem('products', JSON.stringify(products));
        showToast('Product updated successfully!', 'success');
        closeAddProductModal();
        renderProducts();
    }
}

async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const response = await fetch(`/api/admin/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                showToast('Product deleted successfully!', 'success');
                loadProducts(); // Reload products
                updateDashboardStats();
            } else {
                const error = await response.json();
                showToast(`Error: ${error.message || 'Failed to delete product'}`, 'error');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            showToast('Error deleting product. Please try again.', 'error');
        }
    }
}

// Image Upload
function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    const container = document.getElementById('image-preview-container');
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'w-full h-24 object-cover rounded-lg';
                img.alt = file.name;
                container.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
}

function getUploadedImages() {
    const container = document.getElementById('image-preview-container');
    const images = Array.from(container.querySelectorAll('img'));
    return images.map(img => img.src);
}

// Order Management
function renderOrders() {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8 text-gray-500 dark:text-gray-400">
                    <i class="fas fa-shopping-cart text-4xl mb-2"></i>
                    <p>No orders found</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr class="border-b border-gray-200 dark:border-gray-700">
            <td class="py-3 px-4 text-gray-800 dark:text-white">#${order.id}</td>
            <td class="py-3 px-4 text-gray-800 dark:text-white">${order.customer?.name || 'N/A'}</td>
            <td class="py-3 px-4 text-gray-800 dark:text-white">৳${order.total || 0}</td>
            <td class="py-3 px-4">
                <span class="status-badge ${getOrderStatusClass(order.status)}">${order.status || 'Pending'}</span>
            </td>
            <td class="py-3 px-4 text-gray-600 dark:text-gray-400">${formatDate(order.createdAt)}</td>
            <td class="py-3 px-4">
                <div class="flex space-x-2">
                    <button onclick="viewOrder('${order.id}')" class="btn-primary text-sm px-3 py-1">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="updateOrderStatus('${order.id}')" class="btn-warning text-sm px-3 py-1">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getOrderStatusClass(status) {
    const statusClasses = {
        'pending': 'status-pending',
        'processing': 'status-pending',
        'shipped': 'status-active',
        'delivered': 'status-active',
        'cancelled': 'status-inactive'
    };
    return statusClasses[status] || 'status-pending';
}

// User Management
function renderUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8 text-gray-500 dark:text-gray-400">
                    <i class="fas fa-users text-4xl mb-2"></i>
                    <p>No users found</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr class="border-b border-gray-200 dark:border-gray-700">
            <td class="py-3 px-4">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-user text-white text-sm"></i>
                    </div>
                    <span class="text-gray-800 dark:text-white">${user.name || 'N/A'}</span>
                </div>
            </td>
            <td class="py-3 px-4 text-gray-800 dark:text-white">${user.email || 'N/A'}</td>
            <td class="py-3 px-4">
                <span class="status-badge ${user.role === 'admin' ? 'status-active' : 'status-pending'}">${user.role || 'user'}</span>
            </td>
            <td class="py-3 px-4">
                <span class="status-badge ${user.status === 'active' ? 'status-active' : 'status-inactive'}">${user.status || 'active'}</span>
            </td>
            <td class="py-3 px-4 text-gray-600 dark:text-gray-400">${formatDate(user.createdAt)}</td>
            <td class="py-3 px-4">
                <div class="flex space-x-2">
                    <button onclick="editUser('${user.id}')" class="btn-primary text-sm px-3 py-1">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="toggleUserStatus('${user.id}')" class="btn-warning text-sm px-3 py-1">
                        <i class="fas fa-user-${user.status === 'active' ? 'slash' : 'check'}"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Analytics and Charts
function initializeCharts() {
    // Initialize Chart.js defaults
    Chart.defaults.font.family = 'Inter, sans-serif';
    Chart.defaults.color = '#6b7280';
}

function updateOverviewCharts() {
    updateSalesChart();
    updateCategoryChart();
}

function updateSalesChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    // Destroy existing chart
    if (charts.sales) {
        charts.sales.destroy();
    }

    // Generate sample data for the last 7 days
    const labels = [];
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        data.push(Math.floor(Math.random() * 1000) + 500);
    }

    charts.sales = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sales (৳)',
                data: data,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function updateCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    if (charts.category) {
        charts.category.destroy();
    }

    // Get category data from products
    const categoryData = {};
    products.forEach(product => {
        categoryData[product.category] = (categoryData[product.category] || 0) + 1;
    });

    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

    charts.category = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function updateAnalytics() {
    // Update analytics charts based on selected period
    const period = document.getElementById('analytics-period')?.value || '30';
    // Implementation for analytics charts would go here
}

// Recent Activity
function loadRecentActivity() {
    const container = document.getElementById('recent-activity');
    if (!container) return;

    const activities = [
        { type: 'product', message: 'New product "iPhone 15" added', time: '2 hours ago', icon: 'fas fa-plus' },
        { type: 'order', message: 'Order #1234 completed', time: '4 hours ago', icon: 'fas fa-check' },
        { type: 'user', message: 'New user registered', time: '6 hours ago', icon: 'fas fa-user-plus' },
        { type: 'product', message: 'Product "Samsung Galaxy" updated', time: '8 hours ago', icon: 'fas fa-edit' }
    ];

    container.innerHTML = activities.map(activity => `
        <div class="flex items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                <i class="${activity.icon} text-blue-600"></i>
            </div>
            <div class="flex-1">
                <p class="text-sm text-gray-800 dark:text-white">${activity.message}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">${activity.time}</p>
            </div>
        </div>
    `).join('');
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => container.removeChild(toast), 300);
    }, 3000);
}

// Export/Import Functions
function exportProducts() {
    const dataStr = JSON.stringify(products, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `products-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('Products exported successfully!', 'success');
}

function importProducts() {
    document.getElementById('import-file').click();
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedProducts = JSON.parse(e.target.result);
            products = [...products, ...importedProducts];
            localStorage.setItem('products', JSON.stringify(products));
            showToast('Products imported successfully!', 'success');
            renderProducts();
            updateDashboardStats();
        } catch (error) {
            showToast('Error importing products. Please check file format.', 'error');
        }
    };
    reader.readAsText(file);
}

function exportAnalytics() {
    const analyticsData = {
        products: products.length,
        orders: orders.length,
        users: users.length,
        totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
        exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('Analytics exported successfully!', 'success');
}

// Authentication Functions
function isLoggedIn() {
    return localStorage.getItem('admin_logged_in') === 'true' || sessionStorage.getItem('admin_logged_in') === 'true';
}

function getCurrentUser() {
    const username = localStorage.getItem('admin_username') || sessionStorage.getItem('admin_username');
    return username ? { username, role: 'admin' } : null;
}

function logout() {
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_username');
    sessionStorage.removeItem('admin_logged_in');
    sessionStorage.removeItem('admin_username');
    window.location.href = '/admin-login.html';
}

// Placeholder functions for order and user management
function viewOrder(orderId) {
    showToast(`Viewing order ${orderId}`, 'info');
}

function updateOrderStatus(orderId) {
    showToast(`Updating order ${orderId} status`, 'info');
}

function editUser(userId) {
    showToast(`Editing user ${userId}`, 'info');
}

function toggleUserStatus(userId) {
    showToast(`Toggling user ${userId} status`, 'info');
}