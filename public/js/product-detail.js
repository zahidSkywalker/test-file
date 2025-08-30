// Product detail page functionality
let currentProduct = null;
let selectedRating = 0;

document.addEventListener('DOMContentLoaded', function() {
    loadProductDetails();
    initializeTabs();
    initializeImageGallery();
    initializeQuantityControls();
    initializeReviewForm();
});

async function loadProductDetails() {
    const productId = getProductIdFromUrl();
    if (!productId) {
        showErrorState();
        return;
    }

    showLoading();

    try {
        const response = await fetch(`/api/products/${productId}`);
        
        if (response.ok) {
            currentProduct = await response.json();
            displayProductDetails(currentProduct);
            loadRelatedProducts(currentProduct.category, productId);
        } else if (response.status === 404) {
            showErrorState();
        } else {
            throw new Error('Failed to load product');
        }
    } catch (error) {
        console.error('Error loading product:', error);
        displayDemoProduct(productId);
    } finally {
        hideLoading();
    }
}

function getProductIdFromUrl() {
    const path = window.location.pathname;
    const matches = path.match(/\/product\/([^\/]+)/);
    return matches ? matches[1] : null;
}

function displayProductDetails(product) {
    // Update page title and breadcrumb
    document.title = `${product.title} - ResellerHub`;
    document.getElementById('breadcrumbProduct').textContent = product.title;

    // Main product info
    document.getElementById('productTitle').textContent = product.title;
    document.getElementById('currentPrice').textContent = `$${product.price}`;
    
    if (product.originalPrice) {
        document.getElementById('originalPrice').textContent = `$${product.originalPrice}`;
        document.getElementById('originalPrice').classList.remove('hidden');
        
        const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        const discountBadge = document.getElementById('discountBadge');
        discountBadge.textContent = `-${discount}%`;
        discountBadge.classList.remove('hidden');
    }

    // Condition badge
    const conditionBadge = document.getElementById('productCondition');
    conditionBadge.textContent = product.condition.charAt(0).toUpperCase() + product.condition.slice(1);
    conditionBadge.className = `badge ${getConditionBadgeClass(product.condition)}`;

    // Rating
    document.getElementById('productRating').innerHTML = generateStarRating(product.rating?.average || 0);
    document.getElementById('ratingCount').textContent = `(${product.rating?.count || 0} reviews)`;

    // Seller info
    document.getElementById('sellerName').textContent = product.seller.sellerInfo?.businessName || product.seller.name;
    document.getElementById('sellerRating').innerHTML = generateStarRating(product.seller.sellerInfo?.rating || 0);
    document.getElementById('sellerRatingText').textContent = `(${product.seller.sellerInfo?.rating || 0})`;

    // Stock info
    const stockInfo = document.getElementById('stockInfo');
    const quantity = product.inventory.quantity;
    if (quantity > 10) {
        stockInfo.textContent = 'In Stock';
        stockInfo.className = 'text-sm text-green-600';
    } else if (quantity > 0) {
        stockInfo.textContent = `Only ${quantity} left`;
        stockInfo.className = 'text-sm text-orange-600';
    } else {
        stockInfo.textContent = 'Out of Stock';
        stockInfo.className = 'text-sm text-red-600';
        document.getElementById('addToCartBtn').disabled = true;
        document.getElementById('buyNowBtn').disabled = true;
    }

    // Set max quantity
    document.getElementById('quantity').max = quantity;

    // Images
    displayProductImages(product.images);

    // Description and specifications
    document.getElementById('productDescription').textContent = product.description;
    displaySpecifications(product.specifications);

    // Reviews
    displayReviews(product.reviews);
    document.getElementById('reviewsTabCount').textContent = `(${product.reviews?.length || 0})`;

    // Shipping info
    const shippingCost = document.getElementById('shippingCost');
    if (product.shipping?.freeShipping) {
        shippingCost.textContent = 'FREE';
    } else {
        shippingCost.textContent = `$${product.shipping?.shippingCost || 5.99}`;
    }

    // Show product details
    document.getElementById('productDetails').classList.remove('hidden');

    // Animate product details
    if (typeof gsap !== 'undefined') {
        gsap.from('#productDetails', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: 'power2.out'
        });
    }
}

function displayDemoProduct(productId) {
    const demoProduct = {
        _id: productId,
        title: 'iPhone 14 Pro Max - Deep Purple',
        description: 'Excellent condition iPhone 14 Pro Max with original box and accessories. Features the powerful A16 Bionic chip, Pro camera system with 3x optical zoom, and stunning 6.7-inch Super Retina XDR display. No scratches or dents, well-maintained device with 96% battery health. Includes original Lightning cable and documentation.',
        price: 999,
        originalPrice: 1199,
        condition: 'like-new',
        category: 'electronics',
        brand: 'Apple',
        images: [
            { url: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=600&q=80', alt: 'iPhone 14 Pro Max Deep Purple' },
            { url: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=600&q=80', alt: 'iPhone 14 Pro Max back view' }
        ],
        seller: {
            name: 'TechStore Pro',
            sellerInfo: {
                businessName: 'TechStore Pro',
                rating: 4.8
            }
        },
        inventory: { quantity: 2 },
        rating: { average: 4.7, count: 23 },
        specifications: {
            weight: '240g',
            color: 'Deep Purple',
            size: '6.7 inches',
            material: 'Surgical-grade stainless steel and glass',
            dimensions: '160.8 x 78.1 x 7.85 mm'
        },
        shipping: {
            freeShipping: true,
            shippingCost: 0
        },
        reviews: [
            {
                user: { name: 'John Doe' },
                rating: 5,
                comment: 'Excellent condition, exactly as described. The Deep Purple color is stunning and the camera quality is amazing. Fast shipping and great packaging!',
                createdAt: new Date().toISOString()
            },
            {
                user: { name: 'Jane Smith' },
                rating: 4,
                comment: 'Great phone, works perfectly. Minor wear on the case but the device itself is pristine. Battery life is excellent.',
                createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                user: { name: 'Mike Johnson' },
                rating: 5,
                comment: 'Perfect transaction! Phone arrived exactly as described. TechStore Pro is a reliable seller.',
                createdAt: new Date(Date.now() - 172800000).toISOString()
            }
        ]
    };

    currentProduct = demoProduct;
    displayProductDetails(demoProduct);
}

function displayProductImages(images) {
    if (!images || images.length === 0) {
        document.getElementById('mainImage').src = '/images/placeholder.svg';
        return;
    }

    // Set main image
    document.getElementById('mainImage').src = images[0].url;
    document.getElementById('mainImage').alt = images[0].alt || 'Product image';

    // Create thumbnails
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    thumbnailContainer.innerHTML = images.map((image, index) => `
        <img src="${image.url}" 
             alt="${image.alt || 'Product image'}" 
             class="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity ${index === 0 ? 'ring-2 ring-primary-500' : ''}"
             data-index="${index}">
    `).join('');

    // Add click handlers for thumbnails
    thumbnailContainer.querySelectorAll('img').forEach((thumb, index) => {
        thumb.addEventListener('click', function() {
            // Update main image
            document.getElementById('mainImage').src = images[index].url;
            
            // Update thumbnail selection
            thumbnailContainer.querySelectorAll('img').forEach(img => {
                img.classList.remove('ring-2', 'ring-primary-500');
            });
            this.classList.add('ring-2', 'ring-primary-500');
        });
    });

    // Add click handler for main image zoom
    document.getElementById('mainImage').addEventListener('click', function() {
        openImageZoom(this.src);
    });
}

function openImageZoom(imageSrc) {
    const modal = document.getElementById('imageZoomModal');
    const zoomedImage = document.getElementById('zoomedImage');
    
    zoomedImage.src = imageSrc;
    modal.classList.remove('hidden');

    // Animate modal
    if (typeof gsap !== 'undefined') {
        gsap.from(modal, {
            duration: 0.3,
            opacity: 0,
            ease: 'power2.out'
        });
    }
}

function displaySpecifications(specs) {
    const container = document.getElementById('specificationsContent');
    if (!specs) {
        container.innerHTML = '<p class="text-gray-600">No specifications available.</p>';
        return;
    }

    const specEntries = Object.entries(specs).filter(([key, value]) => value);
    
    if (specEntries.length === 0) {
        container.innerHTML = '<p class="text-gray-600">No specifications available.</p>';
        return;
    }

    container.innerHTML = `
        <div class="space-y-3">
            ${specEntries.map(([key, value]) => `
                <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="font-medium text-gray-700 capitalize">${key.replace(/([A-Z])/g, ' $1')}</span>
                    <span class="text-gray-900">${value}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function displayReviews(reviews) {
    const container = document.getElementById('reviewsList');
    
    if (!reviews || reviews.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-star text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-600">No reviews yet</p>
                <p class="text-sm text-gray-500">Be the first to review this product!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = reviews.map(review => `
        <div class="border-b border-gray-200 pb-6 mb-6 last:border-b-0">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-gray-600"></i>
                    </div>
                    <div>
                        <p class="font-medium text-gray-900">${review.user.name}</p>
                        <div class="flex text-yellow-400 text-sm">
                            ${generateStarRating(review.rating)}
                        </div>
                    </div>
                </div>
                <span class="text-sm text-gray-500">${formatDate(review.createdAt)}</span>
            </div>
            <p class="text-gray-700">${review.comment}</p>
        </div>
    `).join('');
}

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-primary-500', 'text-primary-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });

    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.remove('border-transparent', 'text-gray-500');
        activeTab.classList.add('border-primary-500', 'text-primary-600');
    }

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    const activeContent = document.getElementById(`${tabName}Tab`);
    if (activeContent) {
        activeContent.classList.remove('hidden');

        // Animate content
        if (typeof gsap !== 'undefined') {
            gsap.from(activeContent, {
                duration: 0.5,
                y: 10,
                opacity: 0,
                ease: 'power2.out'
            });
        }
    }
}

function initializeImageGallery() {
    // Close image zoom modal
    document.getElementById('closeImageZoom').addEventListener('click', function() {
        document.getElementById('imageZoomModal').classList.add('hidden');
    });

    // Close modal when clicking outside
    document.getElementById('imageZoomModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.add('hidden');
        }
    });
}

function initializeQuantityControls() {
    const quantityInput = document.getElementById('quantity');
    const decreaseBtn = document.getElementById('decreaseQty');
    const increaseBtn = document.getElementById('increaseQty');

    decreaseBtn.addEventListener('click', function() {
        const currentQty = parseInt(quantityInput.value);
        if (currentQty > 1) {
            quantityInput.value = currentQty - 1;
        }
    });

    increaseBtn.addEventListener('click', function() {
        const currentQty = parseInt(quantityInput.value);
        const maxQty = parseInt(quantityInput.max) || 10;
        if (currentQty < maxQty) {
            quantityInput.value = currentQty + 1;
        }
    });

    // Add to cart button
    document.getElementById('addToCartBtn').addEventListener('click', function() {
        if (!currentProduct) return;

        const quantity = parseInt(document.getElementById('quantity').value);
        const productForCart = {
            id: currentProduct._id,
            title: currentProduct.title,
            price: currentProduct.price,
            image: currentProduct.images[0]?.url || '/images/placeholder.svg',
            condition: currentProduct.condition,
            seller: currentProduct.seller.sellerInfo?.businessName || currentProduct.seller.name,
            sellerId: currentProduct.seller._id,
            inventory: currentProduct.inventory
        };

        if (addToCart(productForCart, quantity)) {
            showToast(`${quantity} item(s) added to cart!`, 'success');
            
            // Animate button
            if (typeof gsap !== 'undefined') {
                gsap.to(this, {
                    duration: 0.2,
                    scale: 1.05,
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
    });

    // Buy now button
    document.getElementById('buyNowBtn').addEventListener('click', function() {
        if (!currentProduct) return;

        const quantity = parseInt(document.getElementById('quantity').value);
        const productForCart = {
            id: currentProduct._id,
            title: currentProduct.title,
            price: currentProduct.price,
            image: currentProduct.images[0]?.url || '/images/placeholder.svg',
            condition: currentProduct.condition,
            seller: currentProduct.seller.sellerInfo?.businessName || currentProduct.seller.name,
            sellerId: currentProduct.seller._id,
            inventory: currentProduct.inventory
        };

        // Clear cart and add this product
        clearCart();
        if (addToCart(productForCart, quantity)) {
            window.location.href = '/checkout';
        }
    });
}

function initializeReviewForm() {
    const starButtons = document.querySelectorAll('.star-btn');
    const reviewForm = document.getElementById('reviewForm');

    // Star rating interaction
    starButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            updateStarDisplay();
        });

        btn.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            highlightStars(rating);
        });
    });

    document.getElementById('ratingInput').addEventListener('mouseleave', function() {
        updateStarDisplay();
    });

    // Review form submission
    if (reviewForm) {
        reviewForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await submitReview();
        });
    }

    // Show review form for logged-in users
    if (isLoggedIn()) {
        document.getElementById('addReviewForm').classList.remove('hidden');
    }
}

function highlightStars(rating) {
    const starButtons = document.querySelectorAll('.star-btn i');
    starButtons.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('text-gray-300');
            star.classList.add('text-yellow-400');
        } else {
            star.classList.remove('text-yellow-400');
            star.classList.add('text-gray-300');
        }
    });
}

function updateStarDisplay() {
    highlightStars(selectedRating);
}

async function submitReview() {
    if (!isLoggedIn()) {
        showToast('Please login to submit a review', 'warning');
        return;
    }

    if (selectedRating === 0) {
        showToast('Please select a rating', 'warning');
        return;
    }

    const comment = document.getElementById('reviewComment').value.trim();
    if (!comment) {
        showToast('Please write a comment', 'warning');
        return;
    }

    try {
        const response = await apiRequest(`/api/products/${currentProduct._id}/reviews`, {
            method: 'POST',
            body: JSON.stringify({
                rating: selectedRating,
                comment: comment
            })
        });

        if (response && response.ok) {
            const data = await response.json();
            showToast('Review submitted successfully!', 'success');
            
            // Reset form
            selectedRating = 0;
            document.getElementById('reviewComment').value = '';
            updateStarDisplay();
            
            // Reload product to show new review
            loadProductDetails();
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Failed to submit review');
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        showToast(error.message || 'Failed to submit review', 'error');
    }
}

async function loadRelatedProducts(category, excludeId) {
    try {
        const response = await fetch(`/api/products?category=${category}&limit=4`);
        
        if (response.ok) {
            const data = await response.json();
            const relatedProducts = data.products.filter(p => p._id !== excludeId);
            displayRelatedProducts(relatedProducts);
        } else {
            throw new Error('Failed to load related products');
        }
    } catch (error) {
        console.error('Error loading related products:', error);
        displayDemoRelatedProducts();
    }
}

function displayRelatedProducts(products) {
    const container = document.getElementById('relatedProducts');
    
    if (products.length === 0) {
        container.innerHTML = '<p class="text-gray-600 text-center col-span-4">No related products found.</p>';
        return;
    }

    container.innerHTML = products.slice(0, 4).map(product => createProductCard(product)).join('');

    // Add event listeners for related products
    container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.dataset.productId;
            
            // Create product object from card data
            const productCard = this.closest('.product-card');
            const title = productCard.querySelector('h3').textContent;
            const priceText = productCard.querySelector('.text-xl').textContent;
            const price = parseFloat(priceText.replace('$', ''));
            const image = productCard.querySelector('img').src;
            const condition = productCard.querySelector('.badge').textContent.toLowerCase();
            const seller = productCard.querySelector('.fas.fa-store').parentNode.textContent.trim();

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
            }
        });
    });
}

function displayDemoRelatedProducts() {
    const demoRelated = [
        {
            _id: 'related1',
            title: 'Samsung Galaxy S23 Ultra',
            price: 849,
            originalPrice: 1199,
            condition: 'like-new',
            images: [{ url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&q=80' }],
            seller: { name: 'Mobile World', sellerInfo: { businessName: 'Mobile World', rating: 4.6 } },
            rating: { average: 4.6, count: 28 }
        },
        {
            _id: 'related2',
            title: 'iPad Pro 12.9" M2',
            price: 999,
            originalPrice: 1399,
            condition: 'like-new',
            images: [{ url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&q=80' }],
            seller: { name: 'TechStore Pro', sellerInfo: { businessName: 'TechStore Pro', rating: 4.8 } },
            rating: { average: 4.8, count: 19 }
        },
        {
            _id: 'related3',
            title: 'Apple Watch Series 8',
            price: 349,
            originalPrice: 499,
            condition: 'like-new',
            images: [{ url: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=300&q=80' }],
            seller: { name: 'TechStore Pro', sellerInfo: { businessName: 'TechStore Pro', rating: 4.8 } },
            rating: { average: 4.5, count: 18 }
        },
        {
            _id: 'related4',
            title: 'AirPods Pro 2nd Gen',
            price: 199,
            originalPrice: 249,
            condition: 'like-new',
            images: [{ url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=300&q=80' }],
            seller: { name: 'Audio Pro', sellerInfo: { businessName: 'Audio Pro', rating: 4.7 } },
            rating: { average: 4.7, count: 35 }
        }
    ];

    displayRelatedProducts(demoRelated);
}

function getConditionBadgeClass(condition) {
    const conditionClasses = {
        'new': 'bg-green-100 text-green-800',
        'like-new': 'bg-blue-100 text-blue-800',
        'good': 'bg-yellow-100 text-yellow-800',
        'fair': 'bg-orange-100 text-orange-800',
        'poor': 'bg-red-100 text-red-800'
    };
    
    return conditionClasses[condition] || 'bg-gray-100 text-gray-800';
}

function showLoading() {
    document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('productDetails').classList.add('hidden');
    document.getElementById('errorState').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loadingState').classList.add('hidden');
}

function showErrorState() {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('productDetails').classList.add('hidden');
    document.getElementById('errorState').classList.remove('hidden');
}