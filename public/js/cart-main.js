// Cart functionality
let cartItems = [];
let allProducts = [];

document.addEventListener('DOMContentLoaded', function() {
    showLoading();
    loadProducts();
    setTimeout(() => {
        loadCartItems();
        hideLoading();
        initializeEventListeners();
    }, 1000);
});

async function loadProducts() {
    try {
        const response = await fetch('/api/electronics');
        if (response.ok) {
            const data = await response.json();
            allProducts = data.products || [];
        } else {
            allProducts = electronicsProducts || [];
        }
    } catch (error) {
        allProducts = electronicsProducts || [];
    }
}

function showLoading() {
    document.getElementById('cart-loading').classList.remove('hidden');
    document.getElementById('cart-content').classList.add('hidden');
    document.getElementById('empty-cart').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('cart-loading').classList.add('hidden');
}

function loadCartItems() {
    cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cartItems.length === 0) {
        showEmptyCart();
    } else {
        showCartContent();
        renderCartItems();
        updateCartSummary();
    }
}

function showEmptyCart() {
    document.getElementById('empty-cart').classList.remove('hidden');
    document.getElementById('cart-content').classList.add('hidden');
}

function showCartContent() {
    document.getElementById('cart-content').classList.remove('hidden');
    document.getElementById('empty-cart').classList.add('hidden');
}

function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    const countElement = document.getElementById('cart-items-count');
    
    countElement.textContent = cartItems.length;
    
    const cartHTML = cartItems.map((item, index) => `
        <div class="cart-item bg-gray-50 rounded-2xl p-6" data-item-id="${item.id}">
            <div class="flex items-center space-x-6">
                <img src="${item.image}" alt="${item.name}" 
                     class="w-24 h-24 object-cover rounded-xl cursor-pointer"
                     onclick="viewProduct(${item.id})">
                
                <div class="flex-1">
                    <h3 class="text-lg font-bold text-gray-900 mb-2">${item.name}</h3>
                    
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="flex items-center border-2 border-gray-200 rounded-xl">
                                <button onclick="updateQuantity(${index}, -1)" 
                                        class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-xl">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="px-4 py-2 font-semibold">${item.quantity}</span>
                                <button onclick="updateQuantity(${index}, 1)" 
                                        class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-xl">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            
                            <button onclick="removeFromCart(${index})" 
                                    class="text-red-600 hover:text-red-700 p-2">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                        
                        <div class="text-right">
                            <div class="price-gradient text-xl font-bold">${item.price}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = cartHTML;
}

function updateQuantity(index, change) {
    if (index >= 0 && index < cartItems.length) {
        cartItems[index].quantity += change;
        
        if (cartItems[index].quantity <= 0) {
            removeFromCart(index);
            return;
        }
        
        saveCart();
        renderCartItems();
        updateCartSummary();
        updateNavCartCount();
    }
}

function removeFromCart(index) {
    if (index >= 0 && index < cartItems.length) {
        cartItems.splice(index, 1);
        saveCart();
        
        if (cartItems.length === 0) {
            showEmptyCart();
        } else {
            renderCartItems();
            updateCartSummary();
        }
        
        updateNavCartCount();
        showNotification('Item removed from cart', 'success');
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cartItems));
}

function updateCartSummary() {
    const subtotal = cartItems.reduce((sum, item) => {
        return sum + (getNumericPrice(item.price) * item.quantity);
    }, 0);
    
    const shipping = subtotal > 5000 ? 0 : 100;
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + shipping + tax;
    
    document.getElementById('cart-subtotal').textContent = `৳${subtotal.toLocaleString()}`;
    document.getElementById('cart-shipping').textContent = shipping === 0 ? 'Free' : `৳${shipping}`;
    document.getElementById('cart-tax').textContent = `৳${tax.toLocaleString()}`;
    document.getElementById('cart-total').textContent = `৳${total.toLocaleString()}`;
}

function initializeEventListeners() {
    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cartItems.length > 0) {
            window.location.href = '/checkout-enhanced';
        }
    });
}

function viewProduct(productId) {
    window.location.href = `/product-detail?id=${productId}`;
}

function getNumericPrice(priceString) {
    return parseFloat(priceString.replace(/[^\d.-]/g, ''));
}

function updateNavCartCount() {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
        element.style.display = totalItems > 0 ? 'block' : 'none';
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl text-white font-medium transform translate-x-full transition-all duration-300 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

updateNavCartCount();