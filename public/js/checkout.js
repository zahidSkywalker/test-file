// Checkout functionality
let orderItems = [];
let selectedPaymentMethod = 'cod';

document.addEventListener('DOMContentLoaded', function() {
    loadOrderItems();
    renderOrderSummary();
    initializeEventListeners();
});

// Load order items (from cart or quick order)
function loadOrderItems() {
    const urlParams = new URLSearchParams(window.location.search);
    const isQuickOrder = urlParams.get('quick') === 'true';
    
    if (isQuickOrder) {
        // Load from quick order
        orderItems = JSON.parse(localStorage.getItem('quickOrder') || '[]');
    } else {
        // Load from regular cart
        orderItems = JSON.parse(localStorage.getItem('cart') || '[]');
    }
    
    if (orderItems.length === 0) {
        // Redirect to cart if no items
        window.location.href = '/cart';
        return;
    }
}

// Render order summary
function renderOrderSummary() {
    const container = document.getElementById('order-items');
    
    const itemsHTML = orderItems.map(item => `
        <div class="flex items-center space-x-4 bg-gray-50 rounded-xl p-4">
            <img src="${item.image}" alt="${item.name}" 
                 class="w-16 h-16 object-cover rounded-lg">
            
            <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-gray-900 text-sm">${item.name}</h4>
                <div class="flex items-center space-x-2 mt-1">
                    ${item.selectedColor ? `
                        <div class="w-3 h-3 rounded-full border ${getColorClass(item.selectedColor)}" 
                             title="${item.selectedColor}"></div>
                    ` : ''}
                    <span class="text-xs text-gray-600">Qty: ${item.quantity}</span>
                </div>
            </div>
            
            <div class="text-right">
                <div class="font-bold text-blue-600">${item.price}</div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = itemsHTML;
    
    // Calculate totals
    updateOrderTotals();
}

// Update order totals
function updateOrderTotals() {
    const subtotal = orderItems.reduce((sum, item) => {
        return sum + (getNumericPrice(item.price) * item.quantity);
    }, 0);
    
    const shipping = subtotal > 5000 ? 0 : 100; // Free shipping over ৳5000
    const tax = Math.round(subtotal * 0.05); // 5% tax
    const total = subtotal + shipping + tax;
    
    document.getElementById('order-subtotal').textContent = `৳${subtotal.toLocaleString()}`;
    document.getElementById('order-shipping').textContent = shipping === 0 ? 'Free' : `৳${shipping}`;
    document.getElementById('order-tax').textContent = `৳${tax.toLocaleString()}`;
    document.getElementById('order-total').textContent = `৳${total.toLocaleString()}`;
}

// Initialize event listeners
function initializeEventListeners() {
    // Payment method selection
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', () => {
            selectPaymentMethod(method.dataset.method);
        });
    });
    
    // Form validation
    const form = document.getElementById('checkout-form');
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
    
    // Place order button
    document.getElementById('place-order-btn').addEventListener('click', handlePlaceOrder);
    
    // Phone number formatting
    document.getElementById('phone').addEventListener('input', formatPhoneNumber);
}

// Select payment method
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('selected');
        const radio = el.querySelector('.w-6.h-6 > div');
        radio.classList.remove('bg-blue-500');
        radio.classList.add('bg-transparent');
    });
    
    const selectedElement = document.querySelector(`[data-method="${method}"]`);
    selectedElement.classList.add('selected');
    const selectedRadio = selectedElement.querySelector('.w-6.h-6 > div');
    selectedRadio.classList.remove('bg-transparent');
    selectedRadio.classList.add('bg-blue-500');
}

// Validate individual field
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    clearFieldError(field);
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }
    
    // Phone validation
    if (field.id === 'phone' && value && !isValidPhone(value)) {
        showFieldError(field, 'Please enter a valid phone number');
        return false;
    }
    
    return true;
}

// Clear field error
function clearFieldError(field) {
    if (typeof field === 'object' && field.target) {
        field = field.target;
    }
    
    field.classList.remove('border-red-500');
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

// Show field error
function showFieldError(field, message) {
    field.classList.add('border-red-500');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message text-red-500 text-sm mt-1';
    errorElement.textContent = message;
    
    field.parentNode.appendChild(errorElement);
}

// Format phone number
function formatPhoneNumber(event) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.startsWith('88')) {
        value = value.substring(2);
    }
    
    if (value.length > 0 && !value.startsWith('01')) {
        if (value.length === 10) {
            value = '0' + value;
        }
    }
    
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    
    // Format as +880 1234-567890
    if (value.length >= 3) {
        value = '+880 ' + value.substring(1, 5) + (value.length > 5 ? '-' + value.substring(5) : '');
    } else if (value.length > 0) {
        value = '+880 ' + value.substring(1);
    }
    
    event.target.value = value;
}

// Handle place order
async function handlePlaceOrder() {
    if (!validateForm()) {
        showNotification('Please fill in all required fields correctly', 'error');
        return;
    }
    
    const placeOrderBtn = document.getElementById('place-order-btn');
    const placeOrderText = document.getElementById('place-order-text');
    
    // Show loading state
    placeOrderBtn.disabled = true;
    placeOrderText.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing Order...';
    
    try {
        // Simulate order processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate order number
        const orderNumber = `TM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
        
        // Show success modal
        document.getElementById('order-number').textContent = `#${orderNumber}`;
        document.getElementById('success-modal').classList.remove('hidden');
        
        // Clear cart/quick order
        const urlParams = new URLSearchParams(window.location.search);
        const isQuickOrder = urlParams.get('quick') === 'true';
        
        if (isQuickOrder) {
            localStorage.removeItem('quickOrder');
        } else {
            localStorage.removeItem('cart');
        }
        
        // Update navigation cart count
        updateNavCartCount();
        
    } catch (error) {
        showNotification('Failed to place order. Please try again.', 'error');
        
        // Reset button
        placeOrderBtn.disabled = false;
        placeOrderText.innerHTML = '<i class="fas fa-check-circle mr-3"></i>Place Order';
    }
}

// Validate entire form
function validateForm() {
    const form = document.getElementById('checkout-form');
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Utility functions
function getColorClass(color) {
    const colorMap = {
        'Black': 'bg-black',
        'White': 'bg-white border-gray-400',
        'Blue': 'bg-blue-500',
        'Red': 'bg-red-500',
        'Silver': 'bg-gray-300',
        'Gray': 'bg-gray-500',
        'Pink': 'bg-pink-500',
        'Orange': 'bg-orange-500',
        'Purple': 'bg-purple-500',
        'Teal': 'bg-teal-500'
    };
    
    for (const [key, value] of Object.entries(colorMap)) {
        if (color.toLowerCase().includes(key.toLowerCase())) {
            return value;
        }
    }
    return 'bg-gray-400';
}

function getNumericPrice(priceString) {
    return parseFloat(priceString.replace(/[^\d.-]/g, ''));
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 13;
}

function updateNavCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = '0';
        element.style.display = 'none';
    });
}

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