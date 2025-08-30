// Featured Products Carousel with Framer Motion-style animations
class FeaturedCarousel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.products = [];
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.isPlaying = true;
        
        this.init();
    }

    async init() {
        try {
            await this.loadFeaturedProducts();
            this.render();
            this.setupControls();
            this.startAutoPlay();
        } catch (error) {
            console.error('Failed to initialize carousel:', error);
        }
    }

    async loadFeaturedProducts() {
        try {
            const response = await fetch('/data/products.json');
            if (response.ok) {
                const data = await response.json();
                this.products = data.electronics_products.filter(p => p.featured);
            } else {
                throw new Error('Failed to load products');
            }
        } catch (error) {
            console.error('Error loading featured products:', error);
            this.loadDemoProducts();
        }
    }

    loadDemoProducts() {
        this.products = [
            {
                id: "featured_001",
                name: "Professional Hair Trimmer",
                price: 2500,
                originalPrice: 3500,
                images: ["https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80"],
                category: "Personal Care",
                rating: 4.7,
                reviews: 156
            },
            {
                id: "featured_002", 
                name: "Electric Mosquito Zapper",
                price: 1200,
                originalPrice: 1800,
                images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"],
                category: "Home Appliances",
                rating: 4.8,
                reviews: 89
            },
            {
                id: "featured_003",
                name: "High Voltage Stun Gun",
                price: 3200,
                originalPrice: 4500,
                images: ["https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80"],
                category: "Security & Safety",
                rating: 4.6,
                reviews: 67
            }
        ];
    }

    render() {
        if (!this.container || this.products.length === 0) return;

        const carouselHTML = `
            <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-50 to-primary-100 p-8">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-gray-900">🔥 Hot Deals</h3>
                    <div class="flex space-x-2">
                        <button id="carouselPrev" class="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <i class="fas fa-chevron-left text-gray-600"></i>
                        </button>
                        <button id="carouselPlay" class="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <i class="fas fa-${this.isPlaying ? 'pause' : 'play'} text-gray-600"></i>
                        </button>
                        <button id="carouselNext" class="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <i class="fas fa-chevron-right text-gray-600"></i>
                        </button>
                    </div>
                </div>
                
                <div class="relative h-80">
                    <div id="carouselTrack" class="flex transition-transform duration-700 ease-in-out h-full">
                        ${this.products.map((product, index) => this.createCarouselSlide(product, index)).join('')}
                    </div>
                </div>
                
                <!-- Indicators -->
                <div class="flex justify-center space-x-2 mt-6">
                    ${this.products.map((_, index) => `
                        <button class="w-3 h-3 rounded-full transition-colors ${index === this.currentIndex ? 'bg-primary-600' : 'bg-gray-300'}" 
                                onclick="featuredCarousel.goToSlide(${index})"></button>
                    `).join('')}
                </div>
            </div>
        `;

        this.container.innerHTML = carouselHTML;
    }

    createCarouselSlide(product, index) {
        const discount = product.originalPrice ? 
            Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

        return `
            <div class="flex-shrink-0 w-full h-full flex items-center justify-center px-4" data-slide="${index}">
                <div class="grid md:grid-cols-2 gap-8 items-center max-w-4xl w-full">
                    <div class="relative">
                        <img src="${product.images[0]}" 
                             alt="${product.name}"
                             class="w-full h-64 object-cover rounded-xl shadow-lg">
                        
                        ${discount > 0 ? `
                            <div class="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                                Save ${discount}%
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="text-center md:text-left">
                        <span class="text-sm text-primary-600 font-medium uppercase tracking-wider">${product.category}</span>
                        <h3 class="text-3xl font-bold text-gray-900 mt-2 mb-4">${product.name}</h3>
                        
                        <div class="flex items-center justify-center md:justify-start mb-4">
                            <div class="flex text-yellow-400">
                                ${Array(5).fill().map((_, i) => `
                                    <i class="fas fa-star ${i < Math.floor(product.rating) ? '' : 'text-gray-300'}"></i>
                                `).join('')}
                            </div>
                            <span class="ml-2 text-gray-600">${product.rating} (${product.reviews} reviews)</span>
                        </div>
                        
                        <div class="flex items-center justify-center md:justify-start space-x-4 mb-6">
                            <span class="text-4xl font-bold text-primary-600">৳${product.price.toLocaleString()}</span>
                            ${product.originalPrice ? `
                                <span class="text-2xl text-gray-500 line-through">৳${product.originalPrice.toLocaleString()}</span>
                            ` : ''}
                        </div>
                        
                        <div class="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                            <button class="view-product-btn btn-primary px-8 py-3 text-lg" data-product-id="${product.id}">
                                <i class="fas fa-eye mr-2"></i>
                                View Details
                            </button>
                            <button class="order-now-btn bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors" 
                                    data-product-id="${product.id}">
                                <i class="fas fa-shopping-cart mr-2"></i>
                                Order Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupControls() {
        document.getElementById('carouselPrev').addEventListener('click', () => {
            this.previousSlide();
        });

        document.getElementById('carouselNext').addEventListener('click', () => {
            this.nextSlide();
        });

        document.getElementById('carouselPlay').addEventListener('click', () => {
            this.toggleAutoPlay();
        });

        // Touch/swipe support
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        this.container.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            e.preventDefault();
        });

        this.container.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            
            const diffX = startX - currentX;
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
            }
        });
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.products.length;
        this.updateCarousel();
    }

    previousSlide() {
        this.currentIndex = this.currentIndex === 0 ? this.products.length - 1 : this.currentIndex - 1;
        this.updateCarousel();
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateCarousel();
    }

    updateCarousel() {
        const track = document.getElementById('carouselTrack');
        if (track) {
            track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        }

        // Update indicators
        document.querySelectorAll('[onclick*="goToSlide"]').forEach((indicator, index) => {
            indicator.className = indicator.className.replace(/bg-(primary-600|gray-300)/, 
                index === this.currentIndex ? 'bg-primary-600' : 'bg-gray-300');
        });

        // Animate slide content
        if (typeof gsap !== 'undefined') {
            const currentSlide = document.querySelector(`[data-slide="${this.currentIndex}"]`);
            if (currentSlide) {
                gsap.from(currentSlide.children, {
                    duration: 0.8,
                    y: 30,
                    opacity: 0,
                    stagger: 0.2,
                    ease: 'power2.out'
                });
            }
        }
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            if (this.isPlaying) {
                this.nextSlide();
            }
        }, 5000);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    toggleAutoPlay() {
        this.isPlaying = !this.isPlaying;
        const playButton = document.getElementById('carouselPlay');
        if (playButton) {
            playButton.innerHTML = `<i class="fas fa-${this.isPlaying ? 'pause' : 'play'} text-gray-600"></i>`;
        }
        
        if (this.isPlaying && !this.autoPlayInterval) {
            this.startAutoPlay();
        }
    }

    destroy() {
        this.stopAutoPlay();
    }
}

// Initialize carousel when DOM is loaded
let featuredCarousel;

document.addEventListener('DOMContentLoaded', function() {
    const carouselContainer = document.getElementById('featuredCarousel');
    if (carouselContainer) {
        featuredCarousel = new FeaturedCarousel('featuredCarousel');
    }
});