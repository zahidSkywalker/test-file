// Homepage functionality with real product integration
let allProducts = [];

// Initialize homepage
document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedProducts();
    initializeCounters();
    initializeSearch();
});

// Load featured products from API or fallback
async function loadFeaturedProducts() {
    try {
        // Try to load from API first
        const response = await fetch('/api/electronics?featured=true');
        if (response.ok) {
            const data = await response.json();
            allProducts = data.products || [];
        } else {
            throw new Error('API not available');
        }
    } catch (error) {
        console.log('Using fallback data:', error.message);
        // Fallback to static data
        allProducts = electronicsProducts.filter(p => p.isFeatured) || [];
    }
    
    setTimeout(() => {
        renderFeaturedProducts();
    }, 1000);
}

// Render featured products
function renderFeaturedProducts() {
    const loadingElement = document.getElementById('featured-loading');
    const productsElement = document.getElementById('featured-products');
    
    if (!allProducts || allProducts.length === 0) {
        loadingElement.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-exclamation-triangle text-4xl text-gray-400 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600">No featured products available</h3>
                <p class="text-gray-500 mt-2">Check back soon for amazing deals!</p>
            </div>
        `;
        return;
    }
    
    const productsHTML = allProducts.slice(0, 8).map((product, index) => `
        <div class="product-card bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer group" 
             data-product-id="${product.id}"
             data-aos="fade-up" 
             data-aos-delay="${(index + 1) * 100}"
             onclick="viewProduct(${product.id})">
            
            <div class="relative overflow-hidden">
                ${product.discount ? `
                    <div class="absolute top-3 left-3 discount-badge text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                        -${product.discount}% OFF
                    </div>
                ` : ''}
                
                <div class="absolute top-3 right-3 z-10">
                    <button onclick="event.stopPropagation(); addToWishlist(${product.id})" 
                            class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all">
                        <i class="far fa-heart text-gray-600 hover:text-red-500"></i>
                    </button>
                </div>
                
                <img src="${product.images[0]}" alt="${product.name}" 
                     class="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500">
                     
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
            </div>
            
            <div class="p-6">
                <div class="flex items-center justify-between mb-2">
                    <span class="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        ${product.category}
                    </span>
                    <div class="flex text-yellow-400">
                        ${Array(5).fill().map((_, i) => 
                            `<i class="fas fa-star ${i < Math.floor(product.rating.average) ? '' : 'text-gray-300'} text-xs"></i>`
                        ).join('')}
                    </div>
                </div>
                
                <h3 class="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    ${product.name}
                </h3>
                
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                    ${product.description}
                </p>
                
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
                    <span class="text-green-600 text-sm">
                        <i class="fas fa-check-circle mr-1"></i>In Stock
                    </span>
                </div>
                
                <div class="flex space-x-2 mb-4">
                    ${product.colors.slice(0, 4).map(color => `
                        <div class="w-6 h-6 rounded-full border-2 border-gray-200 ${getColorClass(color)}" 
                             title="${color}"></div>
                    `).join('')}
                    ${product.colors.length > 4 ? `<span class="text-sm text-gray-500">+${product.colors.length - 4}</span>` : ''}
                </div>
                
                <div class="flex space-x-3">
                    <button onclick="event.stopPropagation(); viewProduct(${product.id})" 
                            class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                        <i class="fas fa-eye mr-2"></i>View
                    </button>
                    <button onclick="event.stopPropagation(); addToCart(${product.id})" 
                            class="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all pulse-animation">
                        <i class="fas fa-shopping-cart mr-2"></i>Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    loadingElement.classList.add('hidden');
    productsElement.innerHTML = productsHTML;
    productsElement.classList.remove('hidden');
    
    // Re-initialize AOS for new elements
    AOS.refresh();
}

// Get color class for display
function getColorClass(color) {
    const colorMap = {
        'Black': 'bg-black',
        'White': 'bg-white border-gray-300',
        'Blue': 'bg-blue-500',
        'Red': 'bg-red-500',
        'Silver': 'bg-gray-300',
        'Gray': 'bg-gray-500',
        'Pink': 'bg-pink-500',
        'Orange': 'bg-orange-500',
        'Purple': 'bg-purple-500',
        'Teal': 'bg-teal-500',
        'Graphite': 'bg-gray-800',
        'Midnight': 'bg-gray-900',
        'Starlight': 'bg-yellow-100',
        'Lime': 'bg-lime-500'
    };
    
    for (const [key, value] of Object.entries(colorMap)) {
        if (color.toLowerCase().includes(key.toLowerCase())) {
            return value;
        }
    }
    return 'bg-gray-400';
}

// Initialize animated counters
function initializeCounters() {
    const counters = document.querySelectorAll('.stat-counter [data-count]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                const increment = target / 100;
                let current = 0;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    
                    if (target === 24) {
                        counter.textContent = Math.floor(current) + '/7';
                    } else {
                        counter.textContent = Math.floor(current) + '+';
                    }
                }, 20);
                
                observer.unobserve(counter);
            }
        });
    });
    
    counters.forEach(counter => observer.observe(counter));
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.querySelector('nav input[type="text"]');
    const searchButton = document.querySelector('nav button');
    
    function performSearch() {
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `/products?search=${encodeURIComponent(query)}`;
        } else {
            window.location.href = '/products';
        }
    }
    
    searchButton.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Search suggestions (optional enhancement)
    searchInput.addEventListener('input', debounce(function() {
        const query = this.value.toLowerCase().trim();
        if (query.length > 2) {
            // Could implement search suggestions here
            console.log('Searching for:', query);
        }
    }, 300));
}

// Product actions
function viewProduct(productId) {
    window.location.href = `/product-detail?id=${productId}`;
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId) || 
                   (electronicsProducts && electronicsProducts.find(p => p.id === productId));
    
    if (!product) {
        showNotification('Product not found!', 'error');
        return;
    }
    
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
            quantity: 1,
            selectedColor: product.colors[0]
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    showNotification(`${product.name} added to cart!`, 'success');
    updateCartCount();
}

function addToWishlist(productId) {
    const product = allProducts.find(p => p.id === productId) || 
                   (electronicsProducts && electronicsProducts.find(p => p.id === productId));
    
    if (!product) return;
    
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (!wishlist.find(item => item.id === productId)) {
        wishlist.push({
            id: productId,
            name: product.name,
            price: product.price,
            image: product.images[0]
        });
        
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        showNotification('Added to wishlist!', 'success');
        
        // Update heart icon
        const heartIcon = event.target;
        heartIcon.classList.remove('far');
        heartIcon.classList.add('fas', 'text-red-500');
    } else {
        showNotification('Already in wishlist!', 'info');
    }
}

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
        element.style.display = totalItems > 0 ? 'block' : 'none';
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl text-white font-medium transform translate-x-full transition-all duration-300 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Newsletter subscription
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.querySelector('section input[type="email"]');
    const subscribeButton = newsletterForm?.nextElementSibling;
    
    if (subscribeButton) {
        subscribeButton.addEventListener('click', function() {
            const email = newsletterForm.value.trim();
            if (email && isValidEmail(email)) {
                showNotification('Successfully subscribed to newsletter!', 'success');
                newsletterForm.value = '';
            } else {
                showNotification('Please enter a valid email address!', 'error');
            }
        });
    }
});

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}