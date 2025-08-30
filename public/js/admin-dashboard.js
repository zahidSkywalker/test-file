// Admin Dashboard functionality
let currentAdminSection = 'overview';
let adminCurrentPage = 1;

document.addEventListener('DOMContentLoaded', function() {
    initializeAdminDashboard();
    initializeAdminSidebar();
    initializeCharts();
    loadAdminDashboardData();
});

function initializeAdminDashboard() {
    // Check if user is logged in and has admin privileges
    if (!isLoggedIn()) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        return;
    }

    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        showToast('Access denied. Admin privileges required.', 'error');
        window.location.href = '/';
        return;
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
        currentAdminSection = section;

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

function loadAdminDashboardData() {
    // Load platform statistics (demo data)
    updateAdminStats({
        totalUsers: 1247,
        totalProducts: 5832,
        totalOrders: 12456,
        totalRevenue: 284567
    });

    loadRecentActivities();
}

function updateAdminStats(stats) {
    document.getElementById('totalUsers').textContent = stats.totalUsers.toLocaleString();
    document.getElementById('adminTotalProducts').textContent = stats.totalProducts.toLocaleString();
    document.getElementById('adminTotalOrders').textContent = stats.totalOrders.toLocaleString();
    document.getElementById('totalRevenue').textContent = `$${stats.totalRevenue.toLocaleString()}`;

    // Animate counters
    if (typeof gsap !== 'undefined') {
        Object.keys(stats).forEach(key => {
            const element = document.getElementById(key) || document.getElementById(`admin${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (element && typeof stats[key] === 'number') {
                animations.animateCounter(element, stats[key]);
            }
        });
    }
}

function loadRecentActivities() {
    const container = document.getElementById('recentActivities');
    const activities = [
        { type: 'order', message: 'New order #ORD-12456 placed', time: '2 minutes ago', icon: 'shopping-bag', color: 'green' },
        { type: 'user', message: 'New seller registered: TechStore Pro', time: '15 minutes ago', icon: 'user-plus', color: 'blue' },
        { type: 'product', message: 'Product "iPhone 13 Pro" updated', time: '1 hour ago', icon: 'edit', color: 'yellow' },
        { type: 'order', message: 'Order #ORD-12455 shipped', time: '2 hours ago', icon: 'truck', color: 'purple' },
        { type: 'review', message: 'New 5-star review received', time: '3 hours ago', icon: 'star', color: 'yellow' }
    ];

    container.innerHTML = activities.map(activity => `
        <div class="flex items-center space-x-3 py-2">
            <div class="w-8 h-8 bg-${activity.color}-100 rounded-full flex items-center justify-center">
                <i class="fas fa-${activity.icon} text-${activity.color}-600 text-xs"></i>
            </div>
            <div class="flex-1">
                <p class="text-sm text-gray-900">${activity.message}</p>
                <p class="text-xs text-gray-500">${activity.time}</p>
            </div>
        </div>
    `).join('');
}

async function loadAdminProducts() {
    const tableBody = document.getElementById('adminProductsTableBody');
    
    // Show loading
    tableBody.innerHTML = `
        <tr>
            <td colspan="8" class="px-6 py-12 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p class="text-gray-600">Loading products...</p>
            </td>
        </tr>
    `;

    try {
        const response = await apiRequest('/api/products?limit=20');
        
        if (response && response.ok) {
            const data = await response.json();
            displayAdminProducts(data.products);
        } else {
            throw new Error('Failed to load products');
        }
    } catch (error) {
        console.error('Error loading admin products:', error);
        displayDemoAdminProducts();
    }
}

function displayAdminProducts(products) {
    const tableBody = document.getElementById('adminProductsTableBody');
    
    if (products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-12 text-center">
                    <i class="fas fa-box text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600">No products found</p>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = products.map(product => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <input type="checkbox" class="rounded product-checkbox" data-product-id="${product._id}">
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <img src="${product.images[0]?.url || '/images/placeholder.svg'}" 
                         alt="${product.title}" 
                         class="w-12 h-12 object-cover rounded-lg mr-4">
                    <div>
                        <div class="text-sm font-medium text-gray-900">${product.title}</div>
                        <div class="text-sm text-gray-500">${product.category} • ${product.condition}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${product.seller.sellerInfo?.businessName || product.seller.name}</div>
                <div class="text-sm text-gray-500">${product.seller.email}</div>
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
            <td class="px-6 py-4 whitespace-nowrap">
                <button class="toggle-featured ${product.featured ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600" 
                        data-product-id="${product._id}" data-featured="${product.featured}">
                    <i class="fas fa-star"></i>
                </button>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                    <button class="text-primary-600 hover:text-primary-900 view-admin-product" data-product-id="${product._id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="text-green-600 hover:text-green-900 edit-admin-product" data-product-id="${product._id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900 delete-admin-product" data-product-id="${product._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Add event listeners
    addAdminProductActionListeners();
}

function displayDemoAdminProducts() {
    const demoProducts = [
        {
            _id: 'admin-demo1',
            title: 'iPhone 14 Pro Max',
            category: 'electronics',
            condition: 'like-new',
            price: 999,
            originalPrice: 1199,
            inventory: { quantity: 2 },
            status: 'active',
            featured: true,
            images: [{ url: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=100&q=80' }],
            seller: { name: 'TechStore Pro', email: 'tech@store.com', sellerInfo: { businessName: 'TechStore Pro' } }
        },
        {
            _id: 'admin-demo2',
            title: 'Samsung Galaxy S23 Ultra',
            category: 'electronics',
            condition: 'like-new',
            price: 849,
            originalPrice: 1199,
            inventory: { quantity: 3 },
            status: 'active',
            featured: true,
            images: [{ url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100&q=80' }],
            seller: { name: 'Mobile World', email: 'mobile@world.com', sellerInfo: { businessName: 'Mobile World' } }
        },
        {
            _id: 'admin-demo3',
            title: 'MacBook Pro 16" M2 Max',
            category: 'electronics',
            condition: 'like-new',
            price: 2299,
            originalPrice: 2699,
            inventory: { quantity: 1 },
            status: 'active',
            featured: false,
            images: [{ url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100&q=80' }],
            seller: { name: 'Apple Reseller', email: 'apple@reseller.com', sellerInfo: { businessName: 'Apple Reseller' } }
        },
        {
            _id: 'admin-demo4',
            title: 'Sony WH-1000XM5',
            category: 'electronics',
            condition: 'like-new',
            price: 299,
            originalPrice: 399,
            inventory: { quantity: 4 },
            status: 'active',
            featured: true,
            images: [{ url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=100&q=80' }],
            seller: { name: 'Audio Pro', email: 'audio@pro.com', sellerInfo: { businessName: 'Audio Pro' } }
        },
        {
            _id: 'admin-demo5',
            title: 'DJI Mini 3 Pro',
            category: 'electronics',
            condition: 'like-new',
            price: 649,
            originalPrice: 759,
            inventory: { quantity: 1 },
            status: 'pending',
            featured: false,
            images: [{ url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=100&q=80' }],
            seller: { name: 'Drone Hub', email: 'drone@hub.com', sellerInfo: { businessName: 'Drone Hub' } }
        }
    ];

    displayAdminProducts(demoProducts);
}

function addAdminProductActionListeners() {
    // Select all checkbox
    document.getElementById('selectAllProducts').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.product-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });

    // Featured toggle buttons
    document.querySelectorAll('.toggle-featured').forEach(btn => {
        btn.addEventListener('click', async function() {
            const productId = this.dataset.productId;
            const isFeatured = this.dataset.featured === 'true';
            
            try {
                const response = await apiRequest(`/api/products/${productId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ featured: !isFeatured })
                });

                if (response && response.ok) {
                    this.dataset.featured = (!isFeatured).toString();
                    this.classList.toggle('text-yellow-500', !isFeatured);
                    this.classList.toggle('text-gray-400', isFeatured);
                    
                    showToast(`Product ${!isFeatured ? 'added to' : 'removed from'} featured`, 'success');
                } else {
                    throw new Error('Failed to update featured status');
                }
            } catch (error) {
                console.error('Error updating featured status:', error);
                showToast('Failed to update featured status', 'error');
            }
        });
    });

    // View product buttons
    document.querySelectorAll('.view-admin-product').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.productId;
            viewAdminProduct(productId);
        });
    });

    // Edit product buttons
    document.querySelectorAll('.edit-admin-product').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.productId;
            editAdminProduct(productId);
        });
    });

    // Delete product buttons
    document.querySelectorAll('.delete-admin-product').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.productId;
            if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
                deleteAdminProduct(productId);
            }
        });
    });
}

async function loadAdminUsers() {
    const tableBody = document.getElementById('adminUsersTableBody');
    
    // Show loading
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="px-6 py-12 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p class="text-gray-600">Loading users...</p>
            </td>
        </tr>
    `;

    try {
        const response = await apiRequest('/api/users');
        
        if (response && response.ok) {
            const data = await response.json();
            displayAdminUsers(data.users);
        } else {
            throw new Error('Failed to load users');
        }
    } catch (error) {
        console.error('Error loading admin users:', error);
        displayDemoAdminUsers();
    }
}

function displayDemoAdminUsers() {
    const demoUsers = [
        {
            _id: 'user1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'buyer',
            isVerified: true,
            createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
            lastActive: new Date(Date.now() - 3600000).toISOString()
        },
        {
            _id: 'user2',
            name: 'TechStore Pro',
            email: 'tech@store.com',
            role: 'seller',
            isVerified: true,
            createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
            lastActive: new Date(Date.now() - 1800000).toISOString(),
            sellerInfo: { businessName: 'TechStore Pro', rating: 4.8 }
        },
        {
            _id: 'user3',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'buyer',
            isVerified: false,
            createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
            lastActive: new Date(Date.now() - 7200000).toISOString()
        }
    ];

    displayAdminUsers(demoUsers);
}

function displayAdminUsers(users) {
    const tableBody = document.getElementById('adminUsersTableBody');
    
    if (users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center">
                    <i class="fas fa-users text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600">No users found</p>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = users.map(user => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                        <i class="fas fa-user text-gray-600"></i>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-900">${user.name}</div>
                        <div class="text-sm text-gray-500">${user.email}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="badge ${getRoleBadgeClass(user.role)}">${user.role}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="badge ${user.isVerified ? 'badge-success' : 'badge-warning'}">
                    ${user.isVerified ? 'Verified' : 'Unverified'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatDate(user.createdAt)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${getRelativeTime(user.lastActive)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                    <button class="text-primary-600 hover:text-primary-900 view-admin-user" data-user-id="${user._id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="text-green-600 hover:text-green-900 edit-user-role" data-user-id="${user._id}" data-current-role="${user.role}">
                        <i class="fas fa-user-tag"></i>
                    </button>
                    ${user.role !== 'admin' ? `
                        <button class="text-red-600 hover:text-red-900 delete-admin-user" data-user-id="${user._id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');

    // Add event listeners
    addAdminUserActionListeners();
}

function addAdminUserActionListeners() {
    // View user buttons
    document.querySelectorAll('.view-admin-user').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.dataset.userId;
            viewAdminUser(userId);
        });
    });

    // Edit role buttons
    document.querySelectorAll('.edit-user-role').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.dataset.userId;
            const currentRole = this.dataset.currentRole;
            editUserRole(userId, currentRole);
        });
    });

    // Delete user buttons
    document.querySelectorAll('.delete-admin-user').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.dataset.userId;
            if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                deleteAdminUser(userId);
            }
        });
    });
}

function getRoleBadgeClass(role) {
    const roleClasses = {
        'admin': 'bg-red-100 text-red-800',
        'seller': 'bg-green-100 text-green-800',
        'buyer': 'bg-blue-100 text-blue-800'
    };
    
    return roleClasses[role] || 'bg-gray-100 text-gray-800';
}

function getRelativeTime(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return formatDate(dateString);
}

function initializeCharts() {
    // Initialize revenue chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx && typeof Chart !== 'undefined') {
        new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue',
                    data: [12000, 19000, 15000, 25000, 22000, 30000],
                    borderColor: '#0ea5e9',
                    backgroundColor: 'rgba(14, 165, 233, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
}

async function viewAdminProduct(productId) {
    const modal = document.getElementById('productDetailsModal');
    const content = document.getElementById('productDetailsContent');
    
    modal.classList.remove('hidden');
    content.innerHTML = `
        <div class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p class="text-gray-600">Loading product details...</p>
        </div>
    `;

    try {
        const response = await apiRequest(`/api/products/${productId}`);
        if (response && response.ok) {
            const product = await response.json();
            displayAdminProductDetails(product);
        } else {
            throw new Error('Failed to load product');
        }
    } catch (error) {
        content.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                <p class="text-gray-600">Failed to load product details</p>
            </div>
        `;
    }
}

function displayAdminProductDetails(product) {
    const content = document.getElementById('productDetailsContent');
    
    content.innerHTML = `
        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <img src="${product.images[0]?.url || '/images/placeholder.svg'}" 
                         alt="${product.title}" 
                         class="w-full h-64 object-cover rounded-lg">
                </div>
                <div class="space-y-4">
                    <div>
                        <h3 class="text-xl font-semibold">${product.title}</h3>
                        <p class="text-gray-600">${product.category} • ${product.condition}</p>
                    </div>
                    <div>
                        <span class="text-2xl font-bold text-primary-600">$${product.price}</span>
                        ${product.originalPrice ? `<span class="ml-2 text-lg text-gray-500 line-through">$${product.originalPrice}</span>` : ''}
                    </div>
                    <div>
                        <p class="text-sm text-gray-600"><strong>Seller:</strong> ${product.seller.sellerInfo?.businessName || product.seller.name}</p>
                        <p class="text-sm text-gray-600"><strong>Stock:</strong> ${product.inventory.quantity} units</p>
                        <p class="text-sm text-gray-600"><strong>Views:</strong> ${product.views || 0}</p>
                        <p class="text-sm text-gray-600"><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(product.status)}">${product.status}</span></p>
                    </div>
                </div>
            </div>
            <div>
                <h4 class="font-semibold mb-2">Description</h4>
                <p class="text-gray-700">${product.description}</p>
            </div>
            <div class="flex justify-end space-x-3">
                <button class="btn-secondary" onclick="document.getElementById('productDetailsModal').classList.add('hidden')">
                    Close
                </button>
                <button class="btn-primary" onclick="editAdminProduct('${product._id}')">
                    <i class="fas fa-edit mr-2"></i>
                    Edit Product
                </button>
            </div>
        </div>
    `;
}

// Close modal handlers
document.getElementById('closeProductDetailsModal').addEventListener('click', function() {
    document.getElementById('productDetailsModal').classList.add('hidden');
});

document.getElementById('closeUserDetailsModal').addEventListener('click', function() {
    document.getElementById('userDetailsModal').classList.add('hidden');
});

// Modal click outside to close
document.getElementById('productDetailsModal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.add('hidden');
    }
});

document.getElementById('userDetailsModal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.add('hidden');
    }
});

async function loadAdminOverview() {
    loadRecentActivities();
    
    // Animate stats cards
    if (typeof gsap !== 'undefined') {
        gsap.from('.bg-white.rounded-lg.shadow-md', {
            duration: 0.6,
            y: 20,
            opacity: 0,
            stagger: 0.1,
            ease: 'power2.out'
        });
    }
}

async function loadAdminOrders() {
    const tableBody = document.getElementById('adminOrdersTableBody');
    
    // Show loading
    tableBody.innerHTML = `
        <tr>
            <td colspan="8" class="px-6 py-12 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p class="text-gray-600">Loading orders...</p>
            </td>
        </tr>
    `;

    // Display demo orders
    const demoOrders = [
        {
            _id: 'order1',
            orderNumber: 'ORD-12456',
            buyer: { name: 'John Doe', email: 'john@example.com' },
            seller: { name: 'TechStore Pro' },
            items: [{ product: { title: 'iPhone 13 Pro' }, quantity: 1 }],
            totals: { total: 899 },
            status: 'shipped',
            createdAt: new Date().toISOString()
        },
        {
            _id: 'order2',
            orderNumber: 'ORD-12455',
            buyer: { name: 'Jane Smith', email: 'jane@example.com' },
            seller: { name: 'Apple Reseller' },
            items: [{ product: { title: 'MacBook Air' }, quantity: 1 }],
            totals: { total: 1099 },
            status: 'processing',
            createdAt: new Date(Date.now() - 86400000).toISOString()
        }
    ];

    displayAdminOrders(demoOrders);
}

function displayAdminOrders(orders) {
    const tableBody = document.getElementById('adminOrdersTableBody');
    
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
                <div class="text-sm text-gray-900">${order.seller?.name || 'Multiple Sellers'}</div>
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
                    <button class="text-primary-600 hover:text-primary-900 view-admin-order" data-order-id="${order._id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="text-green-600 hover:text-green-900 update-admin-order-status" data-order-id="${order._id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function loadAdminAnalytics() {
    // Initialize additional charts for analytics
    const categoryCtx = document.getElementById('categoryChart');
    const userRegistrationCtx = document.getElementById('userRegistrationChart');

    if (categoryCtx && typeof Chart !== 'undefined') {
        new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: ['Electronics', 'Clothing', 'Home', 'Sports', 'Books', 'Other'],
                datasets: [{
                    data: [35, 25, 15, 10, 8, 7],
                    backgroundColor: [
                        '#0ea5e9',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6',
                        '#6b7280'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    if (userRegistrationCtx && typeof Chart !== 'undefined') {
        new Chart(userRegistrationCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'New Users',
                    data: [65, 89, 123, 156, 178, 201],
                    backgroundColor: '#0ea5e9'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}