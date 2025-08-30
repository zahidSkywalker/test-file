// Enhanced Products JavaScript with Modern Features
class ProductCatalog {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.categories = [];
        this.currentFilters = {
            category: '',
            minPrice: 0,
            maxPrice: 100000,
            search: '',
            colors: []
        };
        this.sortBy = 'featured';
        this.currentPage = 1;
        this.productsPerPage = 12;
        
        this.init();
    }

    async init() {
        try {
            await this.loadProducts();
            this.setupEventListeners();
            this.renderProducts();
            this.renderFilters();
            this.initializeAnimations();
        } catch (error) {
            console.error('Failed to initialize product catalog:', error);
            this.showError('Failed to load products. Please refresh the page.');
        }
    }

    async loadProducts() {
        try {
            const response = await fetch('/data/products.json');
            if (!response.ok) throw new Error('Failed to fetch products');
            
            const data = await response.json();
            this.products = data.electronics_products;
            this.categories = data.categories;
            this.filteredProducts = [...this.products];
            
            console.log(`Loaded ${this.products.length} products`);
        } catch (error) {
            console.error('Error loading products:', error);
            // Fallback to demo products if JSON fails
            this.loadDemoProducts();
        }
    }

    loadDemoProducts() {
        this.products = [
            {
                id: "demo_001",
                name: "Professional Hair Trimmer - Rechargeable",
                description: "High-quality rechargeable hair trimmer with titanium blades. Multiple length settings, waterproof design.",
                colors: ["Black", "Silver", "Blue"],
                images: [
                    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80",
                    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80"
                ],
                price: 2500,
                originalPrice: 3500,
                category: "Personal Care",
                featured: true,
                inStock: true,
                seller: "Electronics BD",
                rating: 4.7,
                reviews: 156
            },
            {
                id: "demo_002",
                name: "Electric Mosquito Killer Zapper",
                description: "Powerful UV light mosquito zapper. Chemical-free insect control for home and office use.",
                colors: ["White", "Black"],
                images: [
                    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
                    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"
                ],
                price: 1200,
                originalPrice: 1800,
                category: "Home Appliances",
                featured: true,
                inStock: true,
                seller: "Home Gadgets BD",
                rating: 4.8,
                reviews: 89
            },
            {
                id: "demo_003",
                name: "High Voltage Stun Gun - Self Defense",
                description: "Compact self-defense electric stun gun with LED flashlight. Rechargeable battery with safety features.",
                colors: ["Black", "Pink"],
                images: [
                    "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80",
                    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80"
                ],
                price: 3200,
                originalPrice: 4500,
                category: "Security & Safety",
                featured: true,
                inStock: true,
                seller: "Security Pro BD",
                rating: 4.6,
                reviews: 67
            }
        ];
        this.filteredProducts = [...this.products];
        this.categories = ["Personal Care", "Home Appliances", "Security & Safety"];
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value;
                this.applyFilters();
            });
        }

        // Category filters
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-filter')) {
                const category = e.target.dataset.category;
                this.currentFilters.category = category === this.currentFilters.category ? '' : category;
                this.applyFilters();
                this.updateFilterUI();
            }
        });

        // Sort dropdown
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.applyFilters();
            });
        }

        // Price range
        const priceRange = document.getElementById('priceRange');
        if (priceRange) {
            priceRange.addEventListener('input', (e) => {
                this.currentFilters.maxPrice = parseInt(e.target.value);
                this.applyFilters();
                document.getElementById('priceValue').textContent = `৳${e.target.value.toLocaleString()}`;
            });
        }
    }

    applyFilters() {
        let filtered = [...this.products];

        // Search filter
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm)
            );
        }

        // Category filter
        if (this.currentFilters.category) {
            filtered = filtered.filter(product => product.category === this.currentFilters.category);
        }

        // Price filter
        filtered = filtered.filter(product => 
            product.price >= this.currentFilters.minPrice && 
            product.price <= this.currentFilters.maxPrice
        );

        // Sort
        switch (this.sortBy) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'featured':
                filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
                break;
            default:
                // Keep original order
                break;
        }

        this.filteredProducts = filtered;
        this.currentPage = 1;
        this.renderProducts();
        this.updateResultsCount();
    }

    renderProducts() {
        const container = document.getElementById('productsGrid');
        if (!container) return;

        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);

        if (productsToShow.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                    <p class="text-gray-500">Try adjusting your filters or search terms</p>
                </div>
            `;
            return;
        }

        container.innerHTML = productsToShow.map(product => this.createProductCard(product)).join('');
        this.renderPagination();
        this.animateProductCards();
    }

    createProductCard(product) {
        const discount = product.originalPrice ? 
            Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

        return `
            <div class="product-card bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden" 
                 data-product-id="${product.id}">
                <div class="relative">
                    <img src="${product.images[0]}" 
                         alt="${product.name}" 
                         class="w-full h-64 object-cover">
                    
                    ${discount > 0 ? `
                        <div class="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            -${discount}%
                        </div>
                    ` : ''}
                    
                    <div class="absolute top-3 right-3">
                        <button class="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 transition-colors wishlist-btn" 
                                data-product-id="${product.id}">
                            <i class="far fa-heart text-gray-600 hover:text-red-500"></i>
                        </button>
                    </div>
                    
                    <div class="absolute bottom-3 left-3">
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-800">
                            <i class="fas fa-star text-yellow-400 mr-1"></i>
                            ${product.rating}
                        </span>
                    </div>
                </div>
                
                <div class="p-6">
                    <div class="mb-2">
                        <span class="text-xs text-primary-600 font-medium uppercase tracking-wider">${product.category}</span>
                    </div>
                    
                    <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">${product.name}</h3>
                    
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2 h-10">${product.description}</p>
                    
                    <!-- Color Options -->
                    <div class="mb-4">
                        <div class="flex flex-wrap gap-1">
                            ${product.colors.slice(0, 4).map(color => `
                                <span class="w-6 h-6 rounded-full border-2 border-gray-200" 
                                      style="background-color: ${this.getColorCode(color)}"
                                      title="${color}"></span>
                            `).join('')}
                            ${product.colors.length > 4 ? `<span class="text-xs text-gray-500 ml-1">+${product.colors.length - 4}</span>` : ''}
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-2">
                            <span class="text-2xl font-bold text-primary-600">৳${product.price.toLocaleString()}</span>
                            ${product.originalPrice ? `
                                <span class="text-sm text-gray-500 line-through">৳${product.originalPrice.toLocaleString()}</span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="flex items-center text-sm text-gray-600 mb-4">
                        <i class="fas fa-store mr-2"></i>
                        <span>${product.seller}</span>
                        <div class="ml-auto flex items-center">
                            <span class="text-yellow-400 mr-1">★</span>
                            <span>(${product.reviews})</span>
                        </div>
                    </div>
                    
                    <div class="flex space-x-2">
                        <button class="flex-1 btn-primary py-2 text-sm view-product-btn" data-product-id="${product.id}">
                            <i class="fas fa-eye mr-2"></i>
                            View Details
                        </button>
                        <button class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors order-now-btn" 
                                data-product-id="${product.id}">
                            <i class="fas fa-shopping-cart mr-2"></i>
                            Order Now
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getColorCode(colorName) {
        const colorMap = {
            'Black': '#000000',
            'White': '#FFFFFF',
            'Silver': '#C0C0C0',
            'Blue': '#0066CC',
            'Red': '#FF0000',
            'Pink': '#FF69B4',
            'Purple': '#800080',
            'Green': '#008000',
            'Orange': '#FFA500',
            'Yellow': '#FFFF00',
            'Gray': '#808080',
            'Graphite': '#2F2F2F',
            'Violet': '#8A2BE2',
            'Lime': '#32CD32',
            'Midnight': '#191970',
            'Starlight': '#F5F5DC',
            'Teal': '#008080',
            'RGB': 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)'
        };
        
        return colorMap[colorName] || '#CCCCCC';
    }

    renderFilters() {
        const filtersContainer = document.getElementById('filtersContainer');
        if (!filtersContainer) return;

        filtersContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h3 class="font-semibold text-lg mb-4">Filters</h3>
                
                <!-- Category Filter -->
                <div class="mb-6">
                    <h4 class="font-medium text-gray-900 mb-3">Categories</h4>
                    <div class="space-y-2">
                        ${this.categories.map(category => `
                            <label class="flex items-center cursor-pointer">
                                <input type="radio" name="category" value="${category}" 
                                       class="category-filter sr-only" data-category="${category}">
                                <div class="w-4 h-4 border-2 border-gray-300 rounded mr-3 flex items-center justify-center">
                                    <div class="w-2 h-2 bg-primary-600 rounded hidden"></div>
                                </div>
                                <span class="text-gray-700 hover:text-primary-600">${category}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Price Range -->
                <div class="mb-6">
                    <h4 class="font-medium text-gray-900 mb-3">Price Range</h4>
                    <div class="space-y-3">
                        <input type="range" id="priceRange" min="0" max="100000" value="100000" 
                               class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                        <div class="flex justify-between text-sm text-gray-600">
                            <span>৳0</span>
                            <span id="priceValue">৳1,00,000</span>
                        </div>
                    </div>
                </div>
                
                <!-- Clear Filters -->
                <button id="clearFilters" class="w-full btn-secondary py-2">
                    <i class="fas fa-times mr-2"></i>
                    Clear All Filters
                </button>
            </div>
        `;

        // Setup filter event listeners
        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });
    }

    clearFilters() {
        this.currentFilters = {
            category: '',
            minPrice: 0,
            maxPrice: 100000,
            search: '',
            colors: []
        };
        this.sortBy = 'featured';
        
        // Reset UI
        document.getElementById('priceRange').value = 100000;
        document.getElementById('priceValue').textContent = '৳1,00,000';
        document.querySelectorAll('.category-filter').forEach(input => input.checked = false);
        
        this.applyFilters();
    }

    updateFilterUI() {
        // Update category filter UI
        document.querySelectorAll('.category-filter').forEach(input => {
            const isSelected = input.dataset.category === this.currentFilters.category;
            const indicator = input.parentElement.querySelector('div div');
            if (isSelected) {
                indicator.classList.remove('hidden');
                input.parentElement.classList.add('text-primary-600');
            } else {
                indicator.classList.add('hidden');
                input.parentElement.classList.remove('text-primary-600');
            }
        });
    }

    updateResultsCount() {
        const countElement = document.getElementById('resultsCount');
        if (countElement) {
            countElement.textContent = `${this.filteredProducts.length} products found`;
        }
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        const paginationContainer = document.getElementById('pagination');
        
        if (!paginationContainer || totalPages <= 1) return;

        let paginationHTML = '<div class="flex justify-center items-center space-x-2 mt-8">';
        
        // Previous button
        paginationHTML += `
            <button class="px-3 py-2 rounded-lg border ${this.currentPage === 1 ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-primary-600 text-primary-600 hover:bg-primary-50'}" 
                    ${this.currentPage === 1 ? 'disabled' : ''} onclick="productCatalog.goToPage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button class="px-4 py-2 rounded-lg ${i === this.currentPage ? 'bg-primary-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}" 
                            onclick="productCatalog.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<span class="px-2 text-gray-400">...</span>';
            }
        }

        // Next button
        paginationHTML += `
            <button class="px-3 py-2 rounded-lg border ${this.currentPage === totalPages ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-primary-600 text-primary-600 hover:bg-primary-50'}" 
                    ${this.currentPage === totalPages ? 'disabled' : ''} onclick="productCatalog.goToPage(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        paginationHTML += '</div>';
        paginationContainer.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    animateProductCards() {
        if (typeof gsap !== 'undefined') {
            gsap.from('.product-card', {
                duration: 0.6,
                y: 30,
                opacity: 0,
                stagger: 0.1,
                ease: 'power2.out'
            });
        }
    }

    initializeAnimations() {
        // Initialize Framer Motion-style animations
        this.setupScrollAnimations();
    }

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.product-card, .filter-card').forEach(el => {
            observer.observe(el);
        });
    }

    showError(message) {
        const container = document.getElementById('productsGrid');
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
                    <p class="text-gray-600">${message}</p>
                    <button onclick="location.reload()" class="mt-4 btn-primary">
                        <i class="fas fa-refresh mr-2"></i>
                        Try Again
                    </button>
                </div>
            `;
        }
    }

    // Featured Products Carousel
    renderFeaturedCarousel() {
        const carouselContainer = document.getElementById('featuredCarousel');
        if (!carouselContainer) return;

        const featuredProducts = this.products.filter(p => p.featured).slice(0, 8);
        
        carouselContainer.innerHTML = `
            <div class="relative overflow-hidden">
                <div class="flex transition-transform duration-500 ease-in-out" id="carouselTrack">
                    ${featuredProducts.map(product => `
                        <div class="flex-shrink-0 w-80 mx-4">
                            ${this.createProductCard(product)}
                        </div>
                    `).join('')}
                </div>
                
                <button class="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors" 
                        id="carouselPrev">
                    <i class="fas fa-chevron-left text-gray-600"></i>
                </button>
                
                <button class="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors" 
                        id="carouselNext">
                    <i class="fas fa-chevron-right text-gray-600"></i>
                </button>
            </div>
        `;

        this.setupCarouselControls();
    }

    setupCarouselControls() {
        let currentSlide = 0;
        const track = document.getElementById('carouselTrack');
        const totalSlides = track.children.length;
        const slideWidth = 320; // 80 * 4 (w-80 + margin)

        document.getElementById('carouselPrev').addEventListener('click', () => {
            currentSlide = currentSlide > 0 ? currentSlide - 1 : totalSlides - 1;
            track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
        });

        document.getElementById('carouselNext').addEventListener('click', () => {
            currentSlide = currentSlide < totalSlides - 1 ? currentSlide + 1 : 0;
            track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
        });

        // Auto-play carousel
        setInterval(() => {
            currentSlide = currentSlide < totalSlides - 1 ? currentSlide + 1 : 0;
            track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
        }, 5000);
    }
}

// Product Detail Modal
class ProductDetailModal {
    constructor() {
        this.currentProduct = null;
        this.selectedColor = '';
        this.quantity = 1;
        this.currentImageIndex = 0;
    }

    show(productId) {
        const product = productCatalog.products.find(p => p.id === productId);
        if (!product) return;

        this.currentProduct = product;
        this.selectedColor = product.colors[0];
        this.quantity = 1;
        this.currentImageIndex = 0;

        this.render();
        document.body.style.overflow = 'hidden';
    }

    hide() {
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.remove();
        }
        document.body.style.overflow = '';
    }

    render() {
        const product = this.currentProduct;
        
        const modalHTML = `
            <div id="productModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl max-w-6xl w-full max-h-screen overflow-y-auto">
                    <div class="relative">
                        <button class="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center z-10" 
                                onclick="productDetailModal.hide()">
                            <i class="fas fa-times text-gray-600"></i>
                        </button>
                        
                        <div class="grid lg:grid-cols-2 gap-8 p-8">
                            <!-- Image Gallery -->
                            <div class="space-y-4">
                                <div class="relative">
                                    <img id="mainProductImage" 
                                         src="${product.images[this.currentImageIndex]}" 
                                         alt="${product.name}"
                                         class="w-full h-96 object-cover rounded-lg cursor-zoom-in">
                                    
                                    <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 rounded-lg flex items-center justify-center cursor-zoom-in">
                                        <i class="fas fa-search-plus text-white text-2xl opacity-0 hover:opacity-100 transition-opacity"></i>
                                    </div>
                                </div>
                                
                                <div class="flex space-x-2 overflow-x-auto">
                                    ${product.images.map((image, index) => `
                                        <img src="${image}" 
                                             alt="${product.name} ${index + 1}"
                                             class="w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${index === this.currentImageIndex ? 'border-primary-600' : 'border-gray-200'}"
                                             onclick="productDetailModal.changeImage(${index})">
                                    `).join('')}
                                </div>
                            </div>
                            
                            <!-- Product Details -->
                            <div class="space-y-6">
                                <div>
                                    <span class="text-sm text-primary-600 font-medium uppercase tracking-wider">${product.category}</span>
                                    <h1 class="text-3xl font-bold text-gray-900 mt-2">${product.name}</h1>
                                    
                                    <div class="flex items-center mt-3">
                                        <div class="flex text-yellow-400">
                                            ${Array(5).fill().map((_, i) => `
                                                <i class="fas fa-star ${i < Math.floor(product.rating) ? '' : 'text-gray-300'}"></i>
                                            `).join('')}
                                        </div>
                                        <span class="ml-2 text-gray-600">${product.rating} (${product.reviews} reviews)</span>
                                    </div>
                                </div>
                                
                                <div class="border-t border-b border-gray-200 py-6">
                                    <div class="flex items-center space-x-4">
                                        <span class="text-3xl font-bold text-primary-600">৳${product.price.toLocaleString()}</span>
                                        ${product.originalPrice ? `
                                            <span class="text-xl text-gray-500 line-through">৳${product.originalPrice.toLocaleString()}</span>
                                            <span class="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                                                Save ৳${(product.originalPrice - product.price).toLocaleString()}
                                            </span>
                                        ` : ''}
                                    </div>
                                    <p class="text-sm text-gray-600 mt-2">
                                        <i class="fas fa-truck mr-2"></i>
                                        Free delivery in Dhaka | Cash on Delivery Available
                                    </p>
                                </div>
                                
                                <div>
                                    <h3 class="font-semibold text-gray-900 mb-3">Description</h3>
                                    <p class="text-gray-700 leading-relaxed">${product.description}</p>
                                </div>
                                
                                <!-- Color Selection -->
                                <div>
                                    <h3 class="font-semibold text-gray-900 mb-3">Available Colors</h3>
                                    <div class="flex flex-wrap gap-3">
                                        ${product.colors.map(color => `
                                            <button class="flex items-center space-x-2 px-4 py-2 border-2 rounded-lg transition-all ${this.selectedColor === color ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}"
                                                    onclick="productDetailModal.selectColor('${color}')">
                                                <div class="w-6 h-6 rounded-full border border-gray-300" 
                                                     style="background: ${this.getColorCode(color)}"></div>
                                                <span class="text-sm font-medium">${color}</span>
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                <!-- Quantity Selection -->
                                <div>
                                    <h3 class="font-semibold text-gray-900 mb-3">Quantity</h3>
                                    <div class="flex items-center space-x-4">
                                        <div class="flex items-center border border-gray-300 rounded-lg">
                                            <button class="px-3 py-2 hover:bg-gray-100" onclick="productDetailModal.changeQuantity(-1)">
                                                <i class="fas fa-minus"></i>
                                            </button>
                                            <span id="quantityDisplay" class="px-4 py-2 font-semibold">${this.quantity}</span>
                                            <button class="px-3 py-2 hover:bg-gray-100" onclick="productDetailModal.changeQuantity(1)">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                        <span class="text-sm text-gray-600">In Stock: 50+ available</span>
                                    </div>
                                </div>
                                
                                <!-- Seller Info -->
                                <div class="bg-gray-50 rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center space-x-3">
                                            <div class="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                                                <i class="fas fa-store text-white"></i>
                                            </div>
                                            <div>
                                                <h4 class="font-semibold text-gray-900">${product.seller}</h4>
                                                <div class="flex items-center">
                                                    <div class="flex text-yellow-400 text-sm">
                                                        ${Array(5).fill().map((_, i) => `
                                                            <i class="fas fa-star ${i < 4 ? '' : 'text-gray-300'}"></i>
                                                        `).join('')}
                                                    </div>
                                                    <span class="ml-2 text-sm text-gray-600">4.8 seller rating</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button class="text-primary-600 hover:text-primary-700 font-medium text-sm">
                                            View Store
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Action Buttons -->
                                <div class="flex space-x-4">
                                    <button class="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors"
                                            onclick="productDetailModal.orderNow()">
                                        <i class="fas fa-shopping-cart mr-2"></i>
                                        Order Now - ৳${(product.price * this.quantity).toLocaleString()}
                                    </button>
                                    <button class="px-6 py-4 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 rounded-lg font-semibold transition-colors"
                                            onclick="productDetailModal.addToCart()">
                                        <i class="fas fa-heart mr-2"></i>
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Animate modal appearance
        if (typeof gsap !== 'undefined') {
            gsap.from('#productModal > div', {
                duration: 0.3,
                scale: 0.9,
                opacity: 0,
                ease: 'power2.out'
            });
        }
    }

    changeImage(index) {
        this.currentImageIndex = index;
        document.getElementById('mainProductImage').src = this.currentProduct.images[index];
        
        // Update thumbnail borders
        document.querySelectorAll('#productModal img[onclick*="changeImage"]').forEach((img, i) => {
            img.className = img.className.replace(/border-(primary-600|gray-200)/, i === index ? 'border-primary-600' : 'border-gray-200');
        });
    }

    selectColor(color) {
        this.selectedColor = color;
        this.render();
    }

    changeQuantity(delta) {
        const newQuantity = this.quantity + delta;
        if (newQuantity >= 1 && newQuantity <= 50) {
            this.quantity = newQuantity;
            document.getElementById('quantityDisplay').textContent = this.quantity;
            
            // Update order button price
            const orderBtn = document.querySelector('[onclick="productDetailModal.orderNow()"]');
            if (orderBtn) {
                orderBtn.innerHTML = `
                    <i class="fas fa-shopping-cart mr-2"></i>
                    Order Now - ৳${(this.currentProduct.price * this.quantity).toLocaleString()}
                `;
            }
        }
    }

    orderNow() {
        const orderData = {
            product: this.currentProduct,
            color: this.selectedColor,
            quantity: this.quantity,
            totalPrice: this.currentProduct.price * this.quantity
        };
        
        // Store order data and redirect to checkout
        localStorage.setItem('orderData', JSON.stringify(orderData));
        window.location.href = '/checkout';
    }

    addToCart() {
        const cartItem = {
            productId: this.currentProduct.id,
            name: this.currentProduct.name,
            price: this.currentProduct.price,
            color: this.selectedColor,
            quantity: this.quantity,
            image: this.currentProduct.images[0]
        };
        
        // Add to cart logic
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.productId === cartItem.productId && item.color === cartItem.color);
        
        if (existingItem) {
            existingItem.quantity += cartItem.quantity;
        } else {
            cart.push(cartItem);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Show success message
        this.showToast('Product added to cart!', 'success');
        this.updateCartCount();
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'} mr-2"></i>
            ${message}
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
    }

    getColorCode(colorName) {
        return productCatalog.getColorCode(colorName);
    }
}

// Initialize when DOM is loaded
let productCatalog;
let productDetailModal;

document.addEventListener('DOMContentLoaded', function() {
    productCatalog = new ProductCatalog();
    productDetailModal = new ProductDetailModal();
    
    // Setup global event listeners
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-product-btn') || e.target.closest('.view-product-btn')) {
            const productId = e.target.dataset.productId || e.target.closest('.view-product-btn').dataset.productId;
            productDetailModal.show(productId);
        }
        
        if (e.target.classList.contains('order-now-btn') || e.target.closest('.order-now-btn')) {
            const productId = e.target.dataset.productId || e.target.closest('.order-now-btn').dataset.productId;
            productDetailModal.show(productId);
        }
    });
    
    // Initialize cart count
    productDetailModal.updateCartCount();
});