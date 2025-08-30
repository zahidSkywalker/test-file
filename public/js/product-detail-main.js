// Product detail page functionality
let currentProduct = null;
let selectedColor = null;
let selectedQuantity = 1;

document.addEventListener('DOMContentLoaded', function() {
    showLoading();
    const productId = getProductIdFromUrl();
    
    setTimeout(() => {
        loadProductDetails(productId);
        hideLoading();
        initializeEventListeners();
    }, 1000);
});

function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id')) || 1;
}

function showLoading() {
    document.getElementById('loading-skeleton').classList.remove('hidden');
    document.getElementById('product-content').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loading-skeleton').classList.add('hidden');
    document.getElementById('product-content').classList.remove('hidden');
}

function loadProductDetails(productId) {
    currentProduct = electronicsProducts.find(p => p.id === productId);
    
    if (!currentProduct) {
        window.location.href = '/products-new';
        return;
    }
    
    updateProductInfo();
    updateProductImages();
    updateColorOptions();
    updatePricing();
}

function updateProductInfo() {
    document.getElementById('category-badge').textContent = currentProduct.category;
    document.getElementById('product-title').textContent = currentProduct.name;
    document.getElementById('product-description').textContent = currentProduct.description;
    
    const ratingStars = document.getElementById('rating-stars');
    ratingStars.innerHTML = Array(5).fill().map((_, i) => 
        `<i class="fas fa-star ${i < Math.floor(currentProduct.rating.average) ? 'text-yellow-400' : 'text-gray-300'}"></i>`
    ).join('');
    
    document.getElementById('rating-text').textContent = `${currentProduct.rating.average} out of 5 (${currentProduct.rating.count} reviews)`;
}

function updateProductImages() {
    const mainImage = document.getElementById('main-image');
    mainImage.src = currentProduct.images[0];
    
    const thumbnailsHTML = currentProduct.images.map((image, index) => `
        <img src="${image}" alt="${currentProduct.name}" 
             class="thumbnail w-20 h-20 object-cover rounded-lg cursor-pointer border-2 border-gray-200 ${index === 0 ? 'active border-blue-500' : ''}"
             onclick="changeMainImage('${image}', ${index})">
    `).join('');
    
    document.getElementById('thumbnails-container').innerHTML = thumbnailsHTML;
}

function changeMainImage(imageSrc, index) {
    document.getElementById('main-image').src = imageSrc;
    
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        if (i === index) {
            thumb.classList.add('active', 'border-blue-500');
            thumb.classList.remove('border-gray-200');
        } else {
            thumb.classList.remove('active', 'border-blue-500');
            thumb.classList.add('border-gray-200');
        }
    });
}

function updateColorOptions() {
    const colorOptions = document.getElementById('color-options');
    
    if (currentProduct.colors && currentProduct.colors.length > 0) {
        const colorsHTML = currentProduct.colors.map((color, index) => `
            <div class="color-option w-12 h-12 rounded-full border-2 cursor-pointer ${getColorClass(color)} ${index === 0 ? 'selected border-blue-500' : 'border-gray-300'}"
                 onclick="selectColor('${color}', ${index})"
                 title="${color}">
            </div>
        `).join('');
        
        colorOptions.innerHTML = colorsHTML;
        selectedColor = currentProduct.colors[0];
        document.getElementById('selected-color').textContent = selectedColor;
    }
}

function selectColor(color, index) {
    selectedColor = color;
    document.getElementById('selected-color').textContent = color;
    
    document.querySelectorAll('.color-option').forEach((option, i) => {
        if (i === index) {
            option.classList.add('selected', 'border-blue-500');
            option.classList.remove('border-gray-300');
        } else {
            option.classList.remove('selected', 'border-blue-500');
            option.classList.add('border-gray-300');
        }
    });
}

function getColorClass(color) {
    const colorMap = {
        'Black': 'bg-black',
        'White': 'bg-white',
        'Blue': 'bg-blue-500',
        'Red': 'bg-red-500',
        'Silver': 'bg-gray-300',
        'Gray': 'bg-gray-500',
        'Pink': 'bg-pink-500',
        'Orange': 'bg-orange-500',
        'Purple': 'bg-purple-500'
    };
    
    for (const [key, value] of Object.entries(colorMap)) {
        if (color.toLowerCase().includes(key.toLowerCase())) {
            return value;
        }
    }
    return 'bg-gray-400';
}

function updatePricing() {
    document.getElementById('current-price').textContent = currentProduct.price;
    
    if (currentProduct.originalPrice && currentProduct.discount) {
        document.getElementById('original-price').textContent = currentProduct.originalPrice;
        document.getElementById('original-price').classList.remove('hidden');
        document.getElementById('discount-percentage').textContent = `Save ${currentProduct.discount}%`;
        document.getElementById('discount-percentage').classList.remove('hidden');
        document.getElementById('discount-badge').textContent = `-${currentProduct.discount}% OFF`;
        document.getElementById('discount-badge').classList.remove('hidden');
    }
}

function initializeEventListeners() {
    document.getElementById('quantity-minus').addEventListener('click', () => {
        if (selectedQuantity > 1) {
            selectedQuantity--;
            document.getElementById('quantity-display').textContent = selectedQuantity;
        }
    });
    
    document.getElementById('quantity-plus').addEventListener('click', () => {
        selectedQuantity++;
        document.getElementById('quantity-display').textContent = selectedQuantity;
    });
    
    document.getElementById('add-to-cart-btn').addEventListener('click', addToCart);
    document.getElementById('buy-now-btn').addEventListener('click', buyNow);
}

function addToCart() {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === currentProduct.id);
    
    if (existingItem) {
        existingItem.quantity += selectedQuantity;
    } else {
        cart.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            image: currentProduct.images[0],
            quantity: selectedQuantity,
            selectedColor: selectedColor
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    showNotification(`${currentProduct.name} added to cart!`, 'success');
}

function buyNow() {
    addToCart();
    setTimeout(() => {
        window.location.href = '/checkout-enhanced';
    }, 1000);
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