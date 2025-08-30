// Products page functionality
let currentPage = 1;
let currentFilters = {};
let isLoading = false;

document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    initializeViewToggle();
    loadProducts();
    initializeSearch();
});

function initializeFilters() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    // Set filter values from URL
    document.getElementById('categoryFilter').value = urlParams.get('category') || '';
    document.getElementById('conditionFilter').value = urlParams.get('condition') || '';
    document.getElementById('minPrice').value = urlParams.get('minPrice') || '';
    document.getElementById('maxPrice').value = urlParams.get('maxPrice') || '';
    document.getElementById('searchInput').value = urlParams.get('search') || '';
    
    const sortBy = urlParams.get('sortBy') || 'createdAt';
    const sortOrder = urlParams.get('sortOrder') || 'desc';
    document.getElementById('sortFilter').value = `${sortBy}-${sortOrder}`;

    // Apply filters button
    document.getElementById('applyFilters').addEventListener('click', function() {
        currentPage = 1;
        loadProducts();
    });

    // Clear filters button
    document.getElementById('clearFilters').addEventListener('click', function() {
        document.getElementById('categoryFilter').value = '';
        document.getElementById('conditionFilter').value = '';
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('sortFilter').value = 'createdAt-desc';
        
        currentPage = 1;
        currentFilters = {};
        
        // Update URL
        window.history.pushState({}, '', '/products');
        
        loadProducts();
    });

    // Real-time search
    const searchInput = document.getElementById('searchInput');
    const debouncedSearch = debounce(() => {
        currentPage = 1;
        loadProducts();
    }, 500);

    searchInput.addEventListener('input', debouncedSearch);

    // Limit filter
    document.getElementById('limitFilter').addEventListener('change', function() {
        currentPage = 1;
        loadProducts();
    });
}

function initializeViewToggle() {
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');

    gridView.addEventListener('click', function() {
        setViewMode('grid');
    });

    listView.addEventListener('click', function() {
        setViewMode('list');
    });
}

function setViewMode(mode) {
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    const container = document.getElementById('productsContainer');

    if (mode === 'grid') {
        gridView.classList.add('bg-primary-100', 'text-primary-600');
        gridView.classList.remove('text-gray-400', 'hover:bg-gray-100');
        listView.classList.remove('bg-primary-100', 'text-primary-600');
        listView.classList.add('text-gray-400', 'hover:bg-gray-100');
        
        container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    } else {
        listView.classList.add('bg-primary-100', 'text-primary-600');
        listView.classList.remove('text-gray-400', 'hover:bg-gray-100');
        gridView.classList.remove('bg-primary-100', 'text-primary-600');
        gridView.classList.add('text-gray-400', 'hover:bg-gray-100');
        
        container.className = 'space-y-4';
    }

    localStorage.setItem('viewMode', mode);
    loadProducts(); // Reload with new view
}

async function loadProducts() {
    if (isLoading) return;
    isLoading = true;

    showLoading();
    
    try {
        const filters = buildFilters();
        const queryString = new URLSearchParams(filters).toString();
        
        // Update URL without page reload
        const newUrl = queryString ? `/products?${queryString}` : '/products';
        window.history.pushState({}, '', newUrl);

        const response = await fetch(`/api/products?${queryString}`);
        
        if (response.ok) {
            const data = await response.json();
            displayProducts(data.products);
            updateProductCount(data.total);
            displayPagination(data.totalPages, data.currentPage);
        } else {
            throw new Error('Failed to load products');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        displayDemoProducts();
    } finally {
        hideLoading();
        isLoading = false;
    }
}

function buildFilters() {
    const filters = {
        page: currentPage,
        limit: document.getElementById('limitFilter').value
    };

    const category = document.getElementById('categoryFilter').value;
    const condition = document.getElementById('conditionFilter').value;
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;
    const search = document.getElementById('searchInput').value;
    const sort = document.getElementById('sortFilter').value.split('-');

    if (category) filters.category = category;
    if (condition) filters.condition = condition;
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;
    if (search) filters.search = search;
    if (sort.length === 2) {
        filters.sortBy = sort[0];
        filters.sortOrder = sort[1];
    }

    currentFilters = filters;
    return filters;
}

function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    const noProductsFound = document.getElementById('noProductsFound');
    
    if (products.length === 0) {
        container.classList.add('hidden');
        noProductsFound.classList.remove('hidden');
        return;
    }

    noProductsFound.classList.add('hidden');
    container.classList.remove('hidden');

    const viewMode = localStorage.getItem('viewMode') || 'grid';
    
    if (viewMode === 'list') {
        container.innerHTML = products.map(product => createListProductCard(product)).join('');
    } else {
        container.innerHTML = products.map(product => createProductCard(product)).join('');
    }

    // Add event listeners
    addProductEventListeners();

    // Animate products
    if (typeof gsap !== 'undefined') {
        gsap.from('.product-card', {
            duration: 0.6,
            y: 20,
            opacity: 0,
            stagger: 0.1,
            ease: 'power2.out'
        });
    }
}

function createListProductCard(product) {
    const discountPercentage = product.originalPrice ? 
        Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    
    const conditionColors = {
        'new': 'bg-green-100 text-green-800',
        'like-new': 'bg-blue-100 text-blue-800',
        'good': 'bg-yellow-100 text-yellow-800',
        'fair': 'bg-orange-100 text-orange-800',
        'poor': 'bg-red-100 text-red-800'
    };

    return `
        <div class="product-card bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow" data-product-id="${product._id}">
            <div class="flex space-x-6">
                <div class="relative flex-shrink-0">
                    <img src="${product.images[0]?.url || '/images/placeholder.svg'}" 
                         alt="${product.title}" 
                         class="w-32 h-32 object-cover rounded-lg">
                    ${discountPercentage > 0 ? `
                        <div class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            -${discountPercentage}%
                        </div>
                    ` : ''}
                </div>
                
                <div class="flex-1">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-semibold text-lg text-gray-900 mb-2">${product.title}</h3>
                        <button class="wishlist-btn text-gray-400 hover:text-red-500" data-product-id="${product._id}">
                            <i class="far fa-heart text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="flex items-center mb-3">
                        <div class="flex text-yellow-400 text-sm">
                            ${generateStarRating(product.rating?.average || 0)}
                        </div>
                        <span class="ml-2 text-sm text-gray-600">(${product.rating?.count || 0} reviews)</span>
                        <span class="ml-4 badge ${conditionColors[product.condition] || 'bg-gray-100 text-gray-800'}">
                            ${product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
                        </span>
                    </div>
                    
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2">${product.description || 'No description available.'}</p>
                    
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <span class="text-2xl font-bold text-primary-600">$${product.price}</span>
                            ${product.originalPrice ? `
                                <span class="text-lg text-gray-500 line-through">$${product.originalPrice}</span>
                            ` : ''}
                        </div>
                        
                        <div class="flex space-x-2">
                            <button class="btn-primary px-4 py-2 text-sm add-to-cart-btn" data-product-id="${product._id}">
                                <i class="fas fa-cart-plus mr-1"></i>
                                Add to Cart
                            </button>
                            <a href="/product/${product._id}" class="btn-secondary px-4 py-2 text-sm">
                                <i class="fas fa-eye mr-1"></i>
                                View Details
                            </a>
                        </div>
                    </div>
                    
                    <div class="flex items-center mt-3 pt-3 border-t text-sm text-gray-600">
                        <i class="fas fa-store mr-2"></i>
                        <span>${product.seller.sellerInfo?.businessName || product.seller.name}</span>
                        <div class="ml-auto flex text-yellow-400 text-xs">
                            ${generateStarRating(product.seller.sellerInfo?.rating || 0)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function displayDemoProducts() {
    const demoProducts = [
        {
            _id: 'demo1',
            title: 'iPhone 13 Pro Max - Unlocked',
            description: 'Excellent condition iPhone 13 Pro Max with original box and accessories. No scratches or dents.',
            price: 899,
            originalPrice: 1099,
            condition: 'like-new',
            images: [{ url: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400', alt: 'iPhone 13 Pro Max' }],
            seller: { name: 'TechStore Pro', sellerInfo: { businessName: 'TechStore Pro', rating: 4.8 } },
            rating: { average: 4.7, count: 23 }
        },
        {
            _id: 'demo2',
            title: 'Nike Air Jordan 1 Retro High',
            description: 'Classic Air Jordan 1 in great condition. Minimal wear, authentic sneakers.',
            price: 180,
            originalPrice: 220,
            condition: 'good',
            images: [{ url: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400', alt: 'Nike Air Jordan 1' }],
            seller: { name: 'Sneaker World', sellerInfo: { businessName: 'Sneaker World', rating: 4.6 } },
            rating: { average: 4.5, count: 15 }
        },
        {
            _id: 'demo3',
            title: 'MacBook Air M2 13-inch',
            description: 'Like new MacBook Air with M2 chip. Includes original charger and packaging.',
            price: 1099,
            originalPrice: 1299,
            condition: 'like-new',
            images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', alt: 'MacBook Air M2' }],
            seller: { name: 'Apple Reseller', sellerInfo: { businessName: 'Apple Reseller', rating: 4.9 } },
            rating: { average: 4.8, count: 31 }
        },
        {
            _id: 'demo4',
            title: 'Vintage Leather Jacket',
            description: 'Authentic vintage leather jacket from the 80s. Great character and patina.',
            price: 85,
            originalPrice: 150,
            condition: 'good',
            images: [{ url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', alt: 'Vintage Leather Jacket' }],
            seller: { name: 'Vintage Fashion', sellerInfo: { businessName: 'Vintage Fashion', rating: 4.4 } },
            rating: { average: 4.3, count: 8 }
        },
        {
            _id: 'demo5',
            title: 'Canon EOS R5 Camera',
            description: 'Professional mirrorless camera in excellent condition. Low shutter count.',
            price: 2899,
            originalPrice: 3899,
            condition: 'like-new',
            images: [{ url: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400', alt: 'Canon EOS R5' }],
            seller: { name: 'Camera Pro', sellerInfo: { businessName: 'Camera Pro', rating: 4.7 } },
            rating: { average: 4.6, count: 12 }
        },
        {
            _id: 'demo6',
            title: 'Gaming Chair - Ergonomic',
            description: 'High-quality gaming chair with lumbar support. Barely used, like new condition.',
            price: 299,
            originalPrice: 399,
            condition: 'like-new',
            images: [{ url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', alt: 'Gaming Chair' }],
            seller: { name: 'Office Furniture Plus', sellerInfo: { businessName: 'Office Furniture Plus', rating: 4.5 } },
            rating: { average: 4.4, count: 7 }
        }
    ];

    displayProducts(demoProducts);
    updateProductCount(demoProducts.length);
    displayPagination(1, 1);
}

async function loadProducts() {
    if (isLoading) return;
    isLoading = true;

    showLoading();
    
    try {
        const filters = buildFilters();
        const queryString = new URLSearchParams(filters).toString();
        
        const response = await fetch(`/api/products?${queryString}`);
        
        if (response.ok) {
            const data = await response.json();
            displayProducts(data.products);
            updateProductCount(data.total);
            displayPagination(data.totalPages, data.currentPage);
        } else {
            throw new Error('Failed to load products');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        displayDemoProducts();
    } finally {
        hideLoading();
        isLoading = false;
    }
}

function buildFilters() {
    const filters = {
        page: currentPage,
        limit: document.getElementById('limitFilter').value
    };

    const category = document.getElementById('categoryFilter').value;
    const condition = document.getElementById('conditionFilter').value;
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;
    const search = document.getElementById('searchInput').value;
    const sort = document.getElementById('sortFilter').value.split('-');

    if (category) filters.category = category;
    if (condition) filters.condition = condition;
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;
    if (search) filters.search = search;
    if (sort.length === 2) {
        filters.sortBy = sort[0];
        filters.sortOrder = sort[1];
    }

    return filters;
}

function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    const noProductsFound = document.getElementById('noProductsFound');
    
    if (products.length === 0) {
        container.classList.add('hidden');
        noProductsFound.classList.remove('hidden');
        return;
    }

    noProductsFound.classList.add('hidden');
    container.classList.remove('hidden');

    const viewMode = localStorage.getItem('viewMode') || 'grid';
    
    if (viewMode === 'list') {
        container.innerHTML = products.map(product => createListProductCard(product)).join('');
    } else {
        container.innerHTML = products.map(product => createProductCard(product)).join('');
    }

    addProductEventListeners();

    // Animate products
    if (typeof gsap !== 'undefined') {
        gsap.from('.product-card', {
            duration: 0.6,
            y: 20,
            opacity: 0,
            stagger: 0.05,
            ease: 'power2.out'
        });
    }
}

function addProductEventListeners() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            const productId = this.dataset.productId;
            
            try {
                // In a real app, fetch product details
                const productCard = this.closest('.product-card');
                const title = productCard.querySelector('h3').textContent;
                const priceText = productCard.querySelector('.text-2xl, .text-xl').textContent;
                const price = parseFloat(priceText.replace('$', ''));
                const image = productCard.querySelector('img').src;
                const condition = productCard.querySelector('.badge').textContent.toLowerCase();
                const sellerElement = productCard.querySelector('.fas.fa-store').parentNode;
                const seller = sellerElement.textContent.trim();

                const product = {
                    id: productId,
                    title,
                    price,
                    image,
                    condition,
                    seller,
                    inventory: { quantity: 10 }
                };

                if (addToCart(product)) {
                    showToast('Product added to cart!', 'success');
                    
                    // Animate button
                    if (typeof gsap !== 'undefined') {
                        gsap.to(this, {
                            duration: 0.2,
                            scale: 1.1,
                            ease: 'back.out(1.7)',
                            onComplete: () => {
                                gsap.to(this, {
                                    duration: 0.2,
                                    scale: 1,
                                    ease: 'power2.out'
                                });
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error adding to cart:', error);
                showToast('Failed to add product to cart', 'error');
            }
        });
    });

    // Wishlist buttons
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const icon = this.querySelector('i');
            
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas', 'text-red-500');
                showToast('Added to wishlist', 'success');
            } else {
                icon.classList.remove('fas', 'text-red-500');
                icon.classList.add('far');
                showToast('Removed from wishlist', 'info');
            }

            // Animate heart
            if (typeof gsap !== 'undefined') {
                gsap.to(icon, {
                    duration: 0.3,
                    scale: 1.3,
                    ease: 'back.out(1.7)',
                    onComplete: () => {
                        gsap.to(icon, {
                            duration: 0.2,
                            scale: 1,
                            ease: 'power2.out'
                        });
                    }
                });
            }
        });
    });

    // Quick view buttons
    document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.dataset.productId;
            openQuickView(productId);
        });
    });
}

function updateProductCount(total) {
    const productCount = document.getElementById('productCount');
    if (productCount) {
        productCount.textContent = `Showing ${total} products`;
    }
}

function displayPagination(totalPages, currentPageNum) {
    const pagination = document.getElementById('pagination');
    if (!pagination || totalPages <= 1) {
        pagination.classList.add('hidden');
        return;
    }

    pagination.classList.remove('hidden');
    
    let paginationHTML = '';
    
    // Previous button
    if (currentPageNum > 1) {
        paginationHTML += `
            <button class="pagination-btn px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50" 
                    data-page="${currentPageNum - 1}">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
    }

    // Page numbers
    const startPage = Math.max(1, currentPageNum - 2);
    const endPage = Math.min(totalPages, currentPageNum + 2);

    if (startPage > 1) {
        paginationHTML += `
            <button class="pagination-btn px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50" data-page="1">1</button>
        `;
        if (startPage > 2) {
            paginationHTML += `<span class="px-3 py-2 text-sm font-medium text-gray-700">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPageNum;
        paginationHTML += `
            <button class="pagination-btn px-3 py-2 text-sm font-medium ${isActive ? 'text-primary-600 bg-primary-50 border-primary-500' : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'} border" 
                    data-page="${i}">
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="px-3 py-2 text-sm font-medium text-gray-700">...</span>`;
        }
        paginationHTML += `
            <button class="pagination-btn px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50" data-page="${totalPages}">${totalPages}</button>
        `;
    }

    // Next button
    if (currentPageNum < totalPages) {
        paginationHTML += `
            <button class="pagination-btn px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50" 
                    data-page="${currentPageNum + 1}">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }

    pagination.innerHTML = `<div class="flex">${paginationHTML}</div>`;

    // Add event listeners to pagination buttons
    document.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentPage = parseInt(this.dataset.page);
            loadProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

function showLoading() {
    const loadingState = document.getElementById('loadingState');
    const productsContainer = document.getElementById('productsContainer');
    const noProductsFound = document.getElementById('noProductsFound');
    const pagination = document.getElementById('pagination');

    loadingState.classList.remove('hidden');
    productsContainer.classList.add('hidden');
    noProductsFound.classList.add('hidden');
    pagination.classList.add('hidden');
}

function hideLoading() {
    const loadingState = document.getElementById('loadingState');
    loadingState.classList.add('hidden');
}

async function openQuickView(productId) {
    const modal = document.getElementById('quickViewModal');
    const content = document.getElementById('quickViewContent');
    
    // Show modal with loading
    modal.classList.remove('hidden');
    content.innerHTML = `
        <div class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p class="text-gray-600">Loading product details...</p>
        </div>
    `;

    try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
            const product = await response.json();
            displayQuickView(product);
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

function displayQuickView(product) {
    const content = document.getElementById('quickViewContent');
    
    content.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <img src="${product.images[0]?.url || '/images/placeholder.svg'}" 
                     alt="${product.title}" 
                     class="w-full h-64 object-cover rounded-lg">
            </div>
            <div>
                <h3 class="text-xl font-semibold mb-2">${product.title}</h3>
                <div class="flex items-center mb-3">
                    <div class="flex text-yellow-400 text-sm">
                        ${generateStarRating(product.rating?.average || 0)}
                    </div>
                    <span class="ml-2 text-sm text-gray-600">(${product.rating?.count || 0})</span>
                </div>
                <div class="text-2xl font-bold text-primary-600 mb-4">$${product.price}</div>
                <p class="text-gray-600 mb-4">${product.description}</p>
                <div class="flex space-x-3">
                    <button class="btn-primary flex-1 add-to-cart-btn" data-product-id="${product._id}">
                        Add to Cart
                    </button>
                    <a href="/product/${product._id}" class="btn-secondary flex-1 text-center">
                        View Details
                    </a>
                </div>
            </div>
        </div>
    `;

    // Add event listeners
    content.querySelector('.add-to-cart-btn').addEventListener('click', function() {
        const productForCart = {
            id: product._id,
            title: product.title,
            price: product.price,
            image: product.images[0]?.url || '/images/placeholder.svg',
            condition: product.condition,
            seller: product.seller.sellerInfo?.businessName || product.seller.name,
            inventory: product.inventory
        };

        if (addToCart(productForCart)) {
            showToast('Product added to cart!', 'success');
            document.getElementById('quickViewModal').classList.add('hidden');
        }
    });
}

// Close quick view modal
document.getElementById('closeQuickView').addEventListener('click', function() {
    document.getElementById('quickViewModal').classList.add('hidden');
});

// Close modal when clicking outside
document.getElementById('quickViewModal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.add('hidden');
    }
});

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            currentPage = 1;
            loadProducts();
        }
    });
}