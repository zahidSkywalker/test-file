// Main JavaScript functionality for the homepage
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('Initializing homepage...');
        loadFeaturedProducts();
        initializeSearch();
        
        // Initialize animations for homepage with delay
        setTimeout(() => {
            try {
                initHomepageAnimations();
            } catch (animError) {
                console.error('Animation initialization failed:', animError);
            }
        }, 100);
        
    } catch (error) {
        console.error('Main initialization failed:', error);
    }
});

async function loadFeaturedProducts() {
    try {
        const response = await fetch('/api/products?featured=true&limit=4');
        if (!response.ok) throw new Error('Failed to load products');
        
        const data = await response.json();
        displayFeaturedProducts(data.products);
    } catch (error) {
        console.error('Error loading featured products:', error);
        // Show demo products if API fails
        displayDemoProducts();
    }
}

function displayFeaturedProducts(products) {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    if (products.length === 0) {
        displayDemoProducts();
        return;
    }

    container.innerHTML = products.map(product => createProductCard(product)).join('');
    
    // Animate product cards
    if (typeof gsap !== 'undefined') {
        gsap.from('#featuredProducts .product-card', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            stagger: 0.1,
            ease: 'power2.out'
        });
    }
}

function displayDemoProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    const demoProducts = [
        {
            _id: 'demo1',
            title: 'Professional Hair Trimmer - Rechargeable',
            price: 2500,
            originalPrice: 3500,
            condition: 'like-new',
            images: [{ url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80', alt: 'Professional Hair Trimmer' }],
            seller: { name: 'Electronics BD', sellerInfo: { businessName: 'Electronics BD', rating: 4.8 } },
            rating: { average: 4.7, count: 156 }
        },
        {
            _id: 'demo2',
            title: 'Electric Mosquito Killer Zapper - UV Light',
            price: 1200,
            originalPrice: 1800,
            condition: 'new',
            images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', alt: 'Electric Mosquito Zapper' }],
            seller: { name: 'Home Gadgets BD', sellerInfo: { businessName: 'Home Gadgets BD', rating: 4.9 } },
            rating: { average: 4.8, count: 89 }
        },
        {
            _id: 'demo3',
            title: 'High Voltage Stun Gun - Self Defense',
            price: 3200,
            originalPrice: 4500,
            condition: 'new',
            images: [{ url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=80', alt: 'Electric Stun Gun' }],
            seller: { name: 'Security Pro BD', sellerInfo: { businessName: 'Security Pro BD', rating: 4.7 } },
            rating: { average: 4.6, count: 67 }
        },
        {
            _id: 'demo4',
            title: 'Wireless Gaming Earbuds - RGB LED',
            price: 1800,
            originalPrice: 2800,
            condition: 'like-new',
            images: [{ url: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&q=80', alt: 'Gaming Earbuds' }],
            seller: { name: 'Gaming Zone BD', sellerInfo: { businessName: 'Gaming Zone BD', rating: 4.8 } },
            rating: { average: 4.5, count: 124 }
        }
    ];

    container.innerHTML = demoProducts.map(product => createProductCard(product)).join('');
    
    // Animate product cards
    if (typeof gsap !== 'undefined') {
        gsap.from('#featuredProducts .product-card', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            stagger: 0.1,
            ease: 'power2.out'
        });
    }
}

function createProductCard(product) {
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
        <div class="product-card" data-product-id="${product._id}">
            <div class="relative">
                <img src="${product.images[0]?.url || '/images/placeholder.svg'}" 
                     alt="${product.images[0]?.alt || product.title}" 
                     class="product-image">
                ${discountPercentage > 0 ? `
                    <div class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        -${discountPercentage}%
                    </div>
                ` : ''}
                <div class="absolute top-2 right-2">
                    <span class="badge ${conditionColors[product.condition] || 'bg-gray-100 text-gray-800'}">
                        ${product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
                    </span>
                </div>
                <button class="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors wishlist-btn" 
                        data-product-id="${product._id}">
                    <i class="far fa-heart text-gray-600 hover:text-red-500"></i>
                </button>
            </div>
            
            <div class="mt-4">
                <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">${product.title}</h3>
                
                <div class="flex items-center mb-2">
                    <div class="flex text-yellow-400 text-sm">
                        ${generateStarRating(product.rating?.average || 0)}
                    </div>
                    <span class="ml-2 text-sm text-gray-600">(${product.rating?.count || 0})</span>
                </div>
                
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-2">
                        <span class="text-xl font-bold text-primary-600">৳${product.price.toLocaleString()}</span>
                        ${product.originalPrice ? `
                            <span class="text-sm text-gray-500 line-through">৳${product.originalPrice.toLocaleString()}</span>
                        ` : ''}
                    </div>
                </div>
                
                <div class="flex items-center text-sm text-gray-600 mb-4">
                    <i class="fas fa-store mr-1"></i>
                    <span>${product.seller.sellerInfo?.businessName || product.seller.name}</span>
                    <div class="ml-auto flex text-yellow-400 text-xs">
                        ${generateStarRating(product.seller.sellerInfo?.rating || 0)}
                    </div>
                </div>
                
                <div class="flex space-x-2">
                    <button class="flex-1 btn-primary py-2 text-sm add-to-cart-btn" data-product-id="${product._id}">
                        <i class="fas fa-cart-plus mr-1"></i>
                        Add to Cart
                    </button>
                    <a href="/product/${product._id}" class="flex-1 btn-secondary py-2 text-sm text-center">
                        <i class="fas fa-eye mr-1"></i>
                        View
                    </a>
                </div>
            </div>
        </div>
    `;
}

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const debouncedSearch = debounce(async (query) => {
        if (query.length < 2) return;
        
        try {
            const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=5`);
            if (response.ok) {
                const data = await response.json();
                showSearchSuggestions(data.products, query);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    }, 300);

    searchInput.addEventListener('input', function() {
        debouncedSearch(this.value);
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch(this.value);
        }
    });
}

function showSearchSuggestions(products, query) {
    // Remove existing suggestions
    const existingSuggestions = document.getElementById('searchSuggestions');
    if (existingSuggestions) {
        existingSuggestions.remove();
    }

    if (products.length === 0) return;

    const searchInput = document.getElementById('searchInput');
    const suggestions = document.createElement('div');
    suggestions.id = 'searchSuggestions';
    suggestions.className = 'absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-50 max-h-64 overflow-y-auto';

    suggestions.innerHTML = products.map(product => `
        <a href="/product/${product._id}" class="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
            <div class="flex items-center space-x-3">
                <img src="${product.images[0]?.url || '/images/placeholder.svg'}" 
                     alt="${product.title}" 
                     class="w-10 h-10 object-cover rounded">
                <div class="flex-1">
                    <div class="font-medium text-sm text-gray-900">${product.title}</div>
                    <div class="text-xs text-gray-600">$${product.price} • ${product.condition}</div>
                </div>
            </div>
        </a>
    `).join('');

    // Add "View all results" link
    suggestions.innerHTML += `
        <a href="/products?search=${encodeURIComponent(query)}" 
           class="block px-4 py-3 text-center text-primary-600 hover:bg-primary-50 font-medium border-t">
            View all results for "${query}"
        </a>
    `;

    searchInput.parentNode.appendChild(suggestions);

    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.parentNode.contains(e.target)) {
            suggestions.remove();
        }
    }, { once: true });
}

function performSearch(query) {
    if (query.trim()) {
        window.location.href = `/products?search=${encodeURIComponent(query.trim())}`;
    }
}

function initHomepageAnimations() {
    // Animate hero section
    if (typeof gsap !== 'undefined') {
        const tl = gsap.timeline();
        
        tl.from('#heroTitle', {
            duration: 1,
            y: 30,
            opacity: 0,
            ease: 'power2.out'
        })
        .from('#heroSubtitle', {
            duration: 0.8,
            y: 20,
            opacity: 0,
            ease: 'power2.out'
        }, '-=0.5')
        .from('#heroButtons', {
            duration: 0.8,
            y: 20,
            opacity: 0,
            ease: 'power2.out'
        }, '-=0.3');
    }

    // Animate categories on scroll
    const categoriesObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (typeof gsap !== 'undefined') {
                    gsap.from('#categoriesGrid .category-card', {
                        duration: 0.6,
                        y: 20,
                        opacity: 0,
                        stagger: 0.1,
                        ease: 'power2.out'
                    });
                }
                categoriesObserver.unobserve(entry.target);
            }
        });
    });

    const categoriesGrid = document.getElementById('categoriesGrid');
    if (categoriesGrid) {
        categoriesObserver.observe(categoriesGrid);
    }
}

// Add to cart functionality for homepage
document.addEventListener('click', function(e) {
    if (e.target.closest('.add-to-cart-btn')) {
        e.preventDefault();
        const btn = e.target.closest('.add-to-cart-btn');
        const productId = btn.dataset.productId;
        
        // For demo, create a simple product object
        const productCard = btn.closest('.product-card');
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
            inventory: { quantity: 10 } // Demo quantity
        };

        if (addToCart(product)) {
            // Animate button
            if (typeof gsap !== 'undefined') {
                gsap.to(btn, {
                    duration: 0.2,
                    scale: 1.1,
                    ease: 'back.out(1.7)',
                    onComplete: () => {
                        gsap.to(btn, {
                            duration: 0.2,
                            scale: 1,
                            ease: 'power2.out'
                        });
                    }
                });
            }
            
            showToast('Product added to cart!', 'success');
        }
    }

    // Wishlist functionality
    if (e.target.closest('.wishlist-btn')) {
        e.preventDefault();
        const btn = e.target.closest('.wishlist-btn');
        const icon = btn.querySelector('i');
        
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
    }
});

// Newsletter signup (if present)
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        
        // Demo newsletter signup
        showToast('Thank you for subscribing!', 'success');
        this.reset();
    });
}

// Smooth scroll to sections
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Parallax effect for hero section with error handling
window.addEventListener('scroll', function() {
    try {
        const scrolled = window.pageYOffset;
        const heroContent = document.getElementById('heroContent');
        
        if (heroContent && scrolled < window.innerHeight) {
            const speed = scrolled * 0.5;
            heroContent.style.transform = `translateY(${speed}px)`;
        }
    } catch (error) {
        console.error('Scroll animation error:', error);
        // Remove the event listener if it's causing issues
        window.removeEventListener('scroll', arguments.callee);
    }
});

// Initialize Intersection Observer for animations with error handling
try {
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                try {
                    entry.target.classList.add('animate-fade-in');
                    
                    if (typeof gsap !== 'undefined') {
                        gsap.from(entry.target, {
                            duration: 0.8,
                            y: 30,
                            opacity: 0,
                            ease: 'power2.out'
                        });
                    }
                } catch (animError) {
                    console.error('Animation error:', animError);
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -10px 0px'
    });

    // Observe sections for animation
    document.querySelectorAll('section').forEach(section => {
        animationObserver.observe(section);
    });
} catch (error) {
    console.error('Failed to initialize animation observer:', error);
}