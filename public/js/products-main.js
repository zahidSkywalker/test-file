// Main products page functionality
let filteredProducts = [...electronicsProducts];
let currentCategory = 'all';
let currentSort = 'featured';

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    showLoading();
    setTimeout(() => {
        hideLoading();
        renderProducts();
        renderFeaturedCarousel();
        updateProductCount();
        initializeEventListeners();
    }, 1000);
});

function showLoading() {
    const loadingSkeleton = document.getElementById('loading-skeleton');
    const productsGrid = document.getElementById('products-grid');
    
    loadingSkeleton.classList.remove('hidden');
    productsGrid.classList.add('hidden');
    
    const skeletonHTML = Array(8).fill().map(() => `
        <div class="bg-white rounded-2xl shadow-lg p-6">
            <div class="loading-skeleton h-48 rounded-xl mb-4"></div>
            <div class="loading-skeleton h-4 rounded mb-2"></div>
            <div class="loading-skeleton h-4 rounded w-3/4 mb-4"></div>
            <div class="loading-skeleton h-6 rounded w-1/2"></div>
        </div>
    `).join('');
    
    loadingSkeleton.innerHTML = skeletonHTML;
}

function hideLoading() {
    document.getElementById('loading-skeleton').classList.add('hidden');
    document.getElementById('products-grid').classList.remove('hidden');
}

function renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    const noResults = document.getElementById('no-results');
    
    if (filteredProducts.length === 0) {
        productsGrid.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }
    
    productsGrid.classList.remove('hidden');
    noResults.classList.add('hidden');
    
    const productsHTML = filteredProducts.map(product => createProductCard(product)).join('');
    productsGrid.innerHTML = productsHTML;
}

function createProductCard(product) {
    const discountBadge = product.discount ? `
        <div class="absolute top-3 left-3 discount-badge text-white px-3 py-1 rounded-full text-sm font-bold z-10">
            -${product.discount}%
        </div>
    ` : '';
    
    return `
        <div class="product-card bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer group" data-product-id="${product.id}">
            <div class="relative overflow-hidden">
                ${discountBadge}
                <img src="${product.images[0]}" alt="${product.name}" 
                     class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500">
            </div>
            
            <div class="p-6">
                <div class="category-chip inline-block text-white px-3 py-1 rounded-full text-xs font-medium mb-3">
                    ${product.category}
                </div>
                
                <h3 class="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    ${product.name}
                </h3>
                
                <p class="text-gray-600 text-sm mb-4">
                    ${product.description.substring(0, 80)}...
                </p>
                
                <div class="flex items-center mb-3">
                    <div class="flex text-yellow-400 mr-2">
                        ${Array(5).fill().map((_, i) => 
                            `<i class="fas fa-star ${i < Math.floor(product.rating.average) ? '' : 'text-gray-300'}"></i>`
                        ).join('')}
                    </div>
                    <span class="text-sm text-gray-600">(${product.rating.count})</span>
                </div>
                
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <span class="price-gradient text-2xl font-bold">
                            ${product.price}
                        </span>
                        ${product.originalPrice ? `
                            <span class="text-gray-400 line-through text-sm ml-2">
                                ${product.originalPrice}
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                <div class="flex space-x-3">
                    <button onclick="viewProduct(${product.id})" 
                            class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                        <i class="fas fa-eye mr-2"></i>View
                    </button>
                    <button onclick="addToCart(${product.id})" 
                            class="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all">
                        <i class="fas fa-shopping-cart mr-2"></i>Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderFeaturedCarousel() {
    const featuredProducts = electronicsProducts.filter(p => p.isFeatured);
    const featuredCarousel = document.getElementById('featured-carousel');
    
    const carouselHTML = featuredProducts.map(product => `
        <div class="flex-shrink-0 w-80 snap-center">
            <div class="product-card bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer group">
                <div class="relative overflow-hidden">
                    ${product.discount ? `
                        <div class="absolute top-3 left-3 discount-badge text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                            -${product.discount}% OFF
                        </div>
                    ` : ''}
                    <img src="${product.images[0]}" alt="${product.name}" 
                         class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500">
                </div>
                
                <div class="p-6">
                    <h3 class="font-bold text-lg text-gray-900 mb-2">${product.name}</h3>
                    <div class="flex items-center mb-3">
                        <div class="flex text-yellow-400 mr-2">
                            ${Array(5).fill().map((_, i) => 
                                `<i class="fas fa-star ${i < Math.floor(product.rating.average) ? '' : 'text-gray-300'}"></i>`
                            ).join('')}
                        </div>
                        <span class="text-sm text-gray-600">(${product.rating.count})</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="price-gradient text-xl font-bold">${product.price}</span>
                        <button onclick="addToCart(${product.id})" 
                                class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    featuredCarousel.innerHTML = carouselHTML;
}

function initializeEventListeners() {
    // Search
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-active'));
            btn.classList.add('filter-active');
            currentCategory = btn.dataset.category;
            filterProducts();
        });
    });
    
    // Sort
    document.getElementById('sort-select').addEventListener('change', (e) => {
        currentSort = e.target.value;
        sortProducts();
    });
}

function handleSearch() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    
    filteredProducts = electronicsProducts.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const matchesSearch = query === '' || 
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query);
        
        return matchesCategory && matchesSearch;
    });
    
    sortProducts();
}

function filterProducts() {
    handleSearch();
}

function sortProducts() {
    switch (currentSort) {
        case 'price-low':
            filteredProducts.sort((a, b) => parseFloat(a.price.replace(/[^\d.-]/g, '')) - parseFloat(b.price.replace(/[^\d.-]/g, '')));
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => parseFloat(b.price.replace(/[^\d.-]/g, '')) - parseFloat(a.price.replace(/[^\d.-]/g, '')));
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating.average - a.rating.average);
            break;
        default:
            filteredProducts.sort((a, b) => {
                if (a.isFeatured && !b.isFeatured) return -1;
                if (!a.isFeatured && b.isFeatured) return 1;
                return b.rating.average - a.rating.average;
            });
    }
    
    renderProducts();
    updateProductCount();
}

function updateProductCount() {
    document.getElementById('product-count').textContent = filteredProducts.length;
}

function viewProduct(productId) {
    window.location.href = `/product-detail?id=${productId}`;
}

function addToCart(productId) {
    const product = electronicsProducts.find(p => p.id === productId);
    if (!product) return;
    
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            image: product.images[0],
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    showNotification(`${product.name} added to cart!`, 'success');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium transform translate-x-full transition-transform duration-300 ${
        type === 'success' ? 'bg-green-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}