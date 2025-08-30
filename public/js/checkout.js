// Checkout page functionality
let orderData = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        return;
    }

    // Check if cart has items
    const cart = getCart();
    if (cart.length === 0) {
        showToast('Your cart is empty', 'warning');
        window.location.href = '/cart';
        return;
    }

    initializeCheckout();
    loadOrderSummary();
    initializeForms();
});

function initializeCheckout() {
    // Load user data into form
    const user = getCurrentUser();
    if (user) {
        document.getElementById('shippingName').value = user.name || '';
        document.getElementById('shippingPhone').value = user.phone || '';
        
        if (user.address) {
            document.getElementById('shippingStreet').value = user.address.street || '';
            document.getElementById('shippingCity').value = user.address.city || '';
            document.getElementById('shippingState').value = user.address.state || '';
            document.getElementById('shippingZip').value = user.address.zipCode || '';
            document.getElementById('shippingCountry').value = user.address.country || '';
        }
    }

    // Same as shipping checkbox
    document.getElementById('sameAsShipping').addEventListener('change', function() {
        const billingFields = document.getElementById('billingFields');
        
        if (this.checked) {
            billingFields.classList.add('hidden');
        } else {
            billingFields.classList.remove('hidden');
        }
    });
}

function loadOrderSummary() {
    const cart = getCart();
    const orderItemsContainer = document.getElementById('orderItems');
    
    // Display order items
    orderItemsContainer.innerHTML = cart.map(item => `
        <div class="flex items-center space-x-3 py-3 border-b border-gray-100 last:border-b-0">
            <img src="${item.image}" alt="${item.title}" class="w-12 h-12 object-cover rounded">
            <div class="flex-1">
                <p class="font-medium text-sm text-gray-900">${item.title}</p>
                <p class="text-xs text-gray-600">Qty: ${item.quantity} • ${item.condition}</p>
            </div>
            <div class="text-right">
                <p class="font-medium text-sm">$${(item.price * item.quantity).toFixed(2)}</p>
            </div>
        </div>
    `).join('');

    // Update totals
    updateCheckoutTotals();
}

function updateCheckoutTotals() {
    const cart = getCart();
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 5.99;
    const tax = subtotal * 0.08;
    
    // Apply promo code if any
    const appliedPromo = JSON.parse(localStorage.getItem('appliedPromo') || 'null');
    let discount = 0;
    
    if (appliedPromo) {
        discount = subtotal * appliedPromo.discount;
        document.getElementById('discountRow').classList.remove('hidden');
        document.getElementById('discountAmount').textContent = `-$${discount.toFixed(2)}`;
    }

    const total = subtotal + shipping + tax - discount;

    document.getElementById('checkoutSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('checkoutShipping').textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    document.getElementById('checkoutTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('checkoutTotal').textContent = `$${total.toFixed(2)}`;
}

function initializeForms() {
    const checkoutForm = document.getElementById('checkoutForm');
    const placeOrderBtn = document.getElementById('placeOrderBtn');

    placeOrderBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        if (validateCheckoutForm()) {
            await processOrder();
        }
    });

    // Form validation on input
    const requiredFields = checkoutForm.querySelectorAll('input[required], select[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

function validateCheckoutForm() {
    const form = document.getElementById('checkoutForm');
    const requiredFields = form.querySelectorAll('input[required], select[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    
    if (!value) {
        field.classList.add('border-red-500');
        if (typeof gsap !== 'undefined') {
            gsap.to(field, {
                duration: 0.1,
                x: -5,
                repeat: 3,
                yoyo: true,
                ease: 'power2.inOut'
            });
        }
        return false;
    } else {
        field.classList.remove('border-red-500');
        return true;
    }
}

async function processOrder() {
    const cart = getCart();
    if (cart.length === 0) {
        showToast('Your cart is empty', 'warning');
        return;
    }

    // Show processing modal
    document.getElementById('processingModal').classList.remove('hidden');

    try {
        // Prepare order data
        const shippingAddress = {
            name: document.getElementById('shippingName').value,
            phone: document.getElementById('shippingPhone').value,
            street: document.getElementById('shippingStreet').value,
            city: document.getElementById('shippingCity').value,
            state: document.getElementById('shippingState').value,
            zipCode: document.getElementById('shippingZip').value,
            country: document.getElementById('shippingCountry').value
        };

        const sameAsShipping = document.getElementById('sameAsShipping').checked;
        const billingAddress = sameAsShipping ? shippingAddress : {
            name: document.getElementById('billingName').value,
            street: document.getElementById('billingStreet').value,
            city: document.getElementById('billingCity').value,
            state: document.getElementById('billingState').value,
            zipCode: document.getElementById('billingZip').value,
            country: document.getElementById('billingCountry').value
        };

        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

        const orderPayload = {
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity
            })),
            shippingAddress,
            billingAddress,
            paymentMethod
        };

        // Create order
        const orderResponse = await apiRequest('/api/orders', {
            method: 'POST',
            body: JSON.stringify(orderPayload)
        });

        if (!orderResponse || !orderResponse.ok) {
            throw new Error('Failed to create order');
        }

        const orderData = await orderResponse.json();
        
        if (paymentMethod === 'sslcommerz') {
            // Initialize payment
            const paymentResponse = await apiRequest('/api/payments/initialize', {
                method: 'POST',
                body: JSON.stringify({ orderId: orderData.order._id })
            });

            if (paymentResponse && paymentResponse.ok) {
                const paymentData = await paymentResponse.json();
                
                // For demo, simulate payment process
                setTimeout(async () => {
                    const success = Math.random() > 0.1; // 90% success rate for demo
                    
                    const demoPaymentResponse = await apiRequest('/api/payments/demo-complete', {
                        method: 'POST',
                        body: JSON.stringify({
                            orderId: orderData.order._id,
                            success: success
                        })
                    });

                    document.getElementById('processingModal').classList.add('hidden');

                    if (success) {
                        // Clear cart and redirect to success page
                        clearCart();
                        localStorage.removeItem('appliedPromo');
                        window.location.href = `/checkout/success?order=${orderData.order._id}`;
                    } else {
                        showToast('Payment failed. Please try again.', 'error');
                    }
                }, 3000);
                
            } else {
                throw new Error('Failed to initialize payment');
            }
        } else {
            // Cash on delivery
            document.getElementById('processingModal').classList.add('hidden');
            clearCart();
            localStorage.removeItem('appliedPromo');
            window.location.href = `/checkout/success?order=${orderData.order._id}`;
        }

    } catch (error) {
        console.error('Error processing order:', error);
        document.getElementById('processingModal').classList.add('hidden');
        showToast(error.message || 'Failed to process order', 'error');
    }
}

// Progress steps animation
function updateProgress(step) {
    const steps = ['shipping', 'payment', 'confirmation'];
    
    steps.forEach((stepName, index) => {
        const circle = document.getElementById(`step${index + 1}Circle`);
        const text = document.getElementById(`step${index + 1}Text`);
        
        if (index < step) {
            // Completed step
            circle.classList.remove('bg-gray-300', 'text-gray-600');
            circle.classList.add('bg-green-500', 'text-white');
            text.classList.remove('text-gray-500');
            text.classList.add('text-green-600');
        } else if (index === step) {
            // Current step
            circle.classList.remove('bg-gray-300', 'text-gray-600');
            circle.classList.add('bg-primary-600', 'text-white');
            text.classList.remove('text-gray-500');
            text.classList.add('text-primary-600');
        } else {
            // Future step
            circle.classList.add('bg-gray-300', 'text-gray-600');
            circle.classList.remove('bg-primary-600', 'bg-green-500', 'text-white');
            text.classList.add('text-gray-500');
            text.classList.remove('text-primary-600', 'text-green-600');
        }
    });
}

// Initialize progress
updateProgress(0); // Start with shipping step