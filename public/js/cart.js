// Cart management functionality
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.updateCartCount();
    }

    loadCart() {
        const cartData = localStorage.getItem('shoppingCart');
        return cartData ? JSON.parse(cartData) : [];
    }

    saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(this.cart));
        this.updateCartCount();
    }

    addToCart(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.images && product.images.length > 0 ? product.images[0].url : '/images/placeholder.svg',
                condition: product.condition,
                seller: product.seller.name || product.seller.sellerInfo?.businessName || 'Unknown Seller',
                sellerId: product.seller._id || product.seller.id,
                quantity: quantity,
                maxQuantity: product.inventory.quantity
            });
        }
        
        this.saveCart();
        return true;
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
    }

    updateQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = Math.min(newQuantity, item.maxQuantity);
                this.saveCart();
            }
        }
    }

    updateCartQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            const newQuantity = item.quantity + change;
            this.updateQuantity(productId, newQuantity);
        }
    }

    getCart() {
        return this.cart;
    }

    getCartCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    updateCartCount() {
        const cartCountElements = document.querySelectorAll('#cartCount');
        const count = this.getCartCount();
        
        cartCountElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    updateCartDisplay() {
        const cart = this.getCart();
        const subtotalElement = document.getElementById('subtotal');
        const shippingElement = document.getElementById('shipping');
        const taxElement = document.getElementById('tax');
        const totalElement = document.getElementById('total');

        if (!subtotalElement) return; // Not on cart/checkout page

        const subtotal = this.getCartTotal();
        const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
        const tax = subtotal * 0.08; // 8% tax
        
        // Apply promo code if any
        const appliedPromo = JSON.parse(localStorage.getItem('appliedPromo') || 'null');
        let discount = 0;
        
        if (appliedPromo) {
            discount = subtotal * appliedPromo.discount;
            const discountRow = document.getElementById('discountRow');
            const discountAmount = document.getElementById('discountAmount');
            
            if (discountRow && discountAmount) {
                discountRow.classList.remove('hidden');
                discountAmount.textContent = `-$${discount.toFixed(2)}`;
            }
        }

        const total = subtotal + shipping + tax - discount;

        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        shippingElement.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
        taxElement.textContent = `$${tax.toFixed(2)}`;
        totalElement.textContent = `$${total.toFixed(2)}`;

        // Update checkout totals if on checkout page
        const checkoutSubtotal = document.getElementById('checkoutSubtotal');
        const checkoutShipping = document.getElementById('checkoutShipping');
        const checkoutTax = document.getElementById('checkoutTax');
        const checkoutTotal = document.getElementById('checkoutTotal');

        if (checkoutSubtotal) {
            checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`;
            checkoutShipping.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
            checkoutTax.textContent = `$${tax.toFixed(2)}`;
            checkoutTotal.textContent = `$${total.toFixed(2)}`;
        }
    }
}

// Global cart instance
const cartManager = new CartManager();

// Global helper functions for backward compatibility
function addToCart(product, quantity = 1) {
    return cartManager.addToCart(product, quantity);
}

function removeFromCart(productId) {
    cartManager.removeFromCart(productId);
}

function updateCartQuantity(productId, change) {
    cartManager.updateCartQuantity(productId, change);
}

function getCart() {
    return cartManager.getCart();
}

function getCartCount() {
    return cartManager.getCartCount();
}

function getCartTotal() {
    return cartManager.getCartTotal();
}

function clearCart() {
    cartManager.clearCart();
}

function updateCartDisplay() {
    cartManager.updateCartDisplay();
}

// Toast notification system
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast transform translate-x-full transition-transform duration-300 ease-in-out`;
    
    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    }[type] || 'bg-blue-500';

    const icon = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    }[type] || 'fa-info-circle';

    toast.innerHTML = `
        <div class="${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-80">
            <i class="fas ${icon}"></i>
            <span class="flex-1">${message}</span>
            <button class="text-white hover:text-gray-200 ml-4" onclick="this.closest('.toast').remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);

    // Auto remove
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, duration);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(container);
    return container;
}

// API helper functions
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (auth.isLoggedIn()) {
        defaultOptions.headers['Authorization'] = `Bearer ${auth.getToken()}`;
    }

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, mergedOptions);
        
        if (response.status === 401) {
            auth.logout();
            showToast('Session expired. Please login again.', 'warning');
            return null;
        }

        return response;
    } catch (error) {
        console.error('API request failed:', error);
        showToast('Network error. Please check your connection.', 'error');
        return null;
    }
}

// Format currency
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Format date
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// Generate star rating HTML
function generateStarRating(rating, maxRating = 5) {
    let stars = '';
    for (let i = 1; i <= maxRating; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star text-yellow-400"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
        } else {
            stars += '<i class="far fa-star text-gray-300"></i>';
        }
    }
    return stars;
}

// Debounce function for search
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

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    cartManager.updateCartCount();
    cartManager.updateCartDisplay();
});