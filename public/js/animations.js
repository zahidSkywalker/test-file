// Animation utilities using GSAP and Framer Motion concepts
class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        this.initScrollAnimations();
        this.initHoverAnimations();
        this.initPageTransitions();
    }

    initScrollAnimations() {
        // Wait for GSAP to load before registering ScrollTrigger
        if (typeof gsap !== 'undefined') {
            try {
                // Check if ScrollTrigger is available
                if (typeof ScrollTrigger !== 'undefined') {
                    gsap.registerPlugin(ScrollTrigger);
                    console.log('ScrollTrigger registered successfully');
                } else {
                    console.log('ScrollTrigger not loaded, using basic animations');
                }
            } catch (e) {
                console.log('ScrollTrigger registration failed, using basic animations:', e);
            }
        } else {
            console.log('GSAP not loaded, using CSS animations only');
        }

        // Animate elements on scroll with error handling
        try {
            this.observeElements();
        } catch (e) {
            console.error('Animation initialization failed:', e);
        }
    }

    observeElements() {
        try {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        try {
                            this.animateElement(entry.target);
                        } catch (animError) {
                            console.error('Element animation failed:', animError);
                        }
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -20px 0px'
            });

            // Observe elements with animation classes
            const elementsToAnimate = document.querySelectorAll('.animate-on-scroll, .feature-card, .product-card, .stat-item');
            elementsToAnimate.forEach(el => {
                if (el) {
                    observer.observe(el);
                }
            });
            
            console.log(`Observing ${elementsToAnimate.length} elements for animations`);
        } catch (error) {
            console.error('Failed to initialize scroll observer:', error);
        }
    }

    animateElement(element) {
        if (!element || element.classList.contains('animated')) return;
        
        try {
            element.classList.add('animated');
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(element, 
                    {
                        y: 30,
                        opacity: 0
                    },
                    {
                        duration: 0.8,
                        y: 0,
                        opacity: 1,
                        ease: 'power2.out',
                        delay: Math.random() * 0.3,
                        onComplete: () => {
                            // Ensure element is visible after animation
                            element.style.opacity = '';
                            element.style.transform = '';
                        }
                    }
                );
            } else {
                // Fallback CSS animation
                element.style.animation = 'slideUp 0.8s ease-out forwards';
                element.style.opacity = '1';
            }
        } catch (error) {
            console.error('Failed to animate element:', error);
            // Ensure element is visible even if animation fails
            if (element) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        }
    }

    initHoverAnimations() {
        // Product cards hover effects
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (typeof gsap !== 'undefined') {
                    gsap.to(card, {
                        duration: 0.3,
                        y: -5,
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        ease: 'power2.out'
                    });
                }
            });

            card.addEventListener('mouseleave', () => {
                if (typeof gsap !== 'undefined') {
                    gsap.to(card, {
                        duration: 0.3,
                        y: 0,
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        ease: 'power2.out'
                    });
                }
            });
        });

        // Button hover effects
        document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (typeof gsap !== 'undefined') {
                    gsap.to(btn, {
                        duration: 0.2,
                        scale: 1.05,
                        ease: 'power2.out'
                    });
                }
            });

            btn.addEventListener('mouseleave', () => {
                if (typeof gsap !== 'undefined') {
                    gsap.to(btn, {
                        duration: 0.2,
                        scale: 1,
                        ease: 'power2.out'
                    });
                }
            });
        });
    }

    initPageTransitions() {
        // Animate page load
        if (typeof gsap !== 'undefined') {
            gsap.from('body', {
                duration: 0.5,
                opacity: 0,
                ease: 'power2.out'
            });
        }

        // Animate hero section if present
        const heroTitle = document.getElementById('heroTitle');
        const heroSubtitle = document.getElementById('heroSubtitle');
        const heroButtons = document.getElementById('heroButtons');

        if (heroTitle && typeof gsap !== 'undefined') {
            const tl = gsap.timeline();
            
            tl.to(heroTitle, {
                duration: 0.8,
                opacity: 1,
                y: 0,
                ease: 'power2.out'
            })
            .to(heroSubtitle, {
                duration: 0.8,
                opacity: 1,
                y: 0,
                ease: 'power2.out'
            }, '-=0.4')
            .to(heroButtons, {
                duration: 0.8,
                opacity: 1,
                y: 0,
                ease: 'power2.out'
            }, '-=0.4');
        }

        // Animate features grid
        const featuresGrid = document.getElementById('featuresGrid');
        if (featuresGrid && typeof gsap !== 'undefined') {
            gsap.from('#featuresGrid .feature-card', {
                duration: 0.8,
                y: 50,
                opacity: 0,
                stagger: 0.2,
                ease: 'power2.out',
                delay: 0.5
            });
        }
    }

    // Animate modal open/close
    animateModal(modal, show = true) {
        if (typeof gsap !== 'undefined') {
            if (show) {
                modal.classList.remove('hidden');
                gsap.from(modal, {
                    duration: 0.3,
                    opacity: 0,
                    ease: 'power2.out'
                });
                gsap.from(modal.querySelector('.bg-white'), {
                    duration: 0.4,
                    scale: 0.9,
                    y: 20,
                    ease: 'back.out(1.7)'
                });
            } else {
                gsap.to(modal, {
                    duration: 0.3,
                    opacity: 0,
                    ease: 'power2.in',
                    onComplete: () => {
                        modal.classList.add('hidden');
                    }
                });
            }
        } else {
            if (show) {
                modal.classList.remove('hidden');
            } else {
                modal.classList.add('hidden');
            }
        }
    }

    // Animate form validation
    animateFormError(input) {
        if (typeof gsap !== 'undefined') {
            gsap.to(input, {
                duration: 0.1,
                x: -5,
                repeat: 5,
                yoyo: true,
                ease: 'power2.inOut'
            });
        }
        
        input.classList.add('border-red-500');
        setTimeout(() => {
            input.classList.remove('border-red-500');
        }, 2000);
    }

    // Animate success states
    animateSuccess(element) {
        if (typeof gsap !== 'undefined') {
            gsap.to(element, {
                duration: 0.3,
                scale: 1.05,
                ease: 'back.out(1.7)',
                onComplete: () => {
                    gsap.to(element, {
                        duration: 0.3,
                        scale: 1,
                        ease: 'power2.out'
                    });
                }
            });
        }
    }

    // Stagger animation for lists
    staggerAnimation(elements, delay = 0.1) {
        if (typeof gsap !== 'undefined') {
            gsap.from(elements, {
                duration: 0.6,
                y: 20,
                opacity: 0,
                stagger: delay,
                ease: 'power2.out'
            });
        }
    }

    // Loading animation
    showLoading(container, message = 'Loading...') {
        const loadingHTML = `
            <div class="loading-container text-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p class="text-gray-600">${message}</p>
            </div>
        `;
        
        if (container) {
            container.innerHTML = loadingHTML;
        }
    }

    hideLoading(container) {
        const loadingContainer = container?.querySelector('.loading-container');
        if (loadingContainer) {
            if (typeof gsap !== 'undefined') {
                gsap.to(loadingContainer, {
                    duration: 0.3,
                    opacity: 0,
                    onComplete: () => {
                        loadingContainer.remove();
                    }
                });
            } else {
                loadingContainer.remove();
            }
        }
    }

    // Animate number counting
    animateCounter(element, target, duration = 2000) {
        if (typeof gsap !== 'undefined') {
            const obj = { value: 0 };
            gsap.to(obj, {
                duration: duration / 1000,
                value: target,
                ease: 'power2.out',
                onUpdate: () => {
                    element.textContent = Math.round(obj.value);
                }
            });
        } else {
            element.textContent = target;
        }
    }

    // Page transition
    pageTransition(callback) {
        if (typeof gsap !== 'undefined') {
            gsap.to('body', {
                duration: 0.3,
                opacity: 0,
                ease: 'power2.in',
                onComplete: callback
            });
        } else {
            callback();
        }
    }
}

// Global animation instance
const animations = new AnimationManager();

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Animate stats counters if present
    const statItems = document.querySelectorAll('.stat-item');
    if (statItems.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const numberElement = entry.target.querySelector('div');
                    const targetValue = parseInt(numberElement.textContent.replace(/\D/g, ''));
                    if (targetValue) {
                        animations.animateCounter(numberElement, targetValue);
                    }
                    observer.unobserve(entry.target);
                }
            });
        });

        statItems.forEach(item => observer.observe(item));
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading states to forms
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                animations.animateSuccess(submitBtn);
            }
        });
    });

    // Animate image loading
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('load', function() {
            if (typeof gsap !== 'undefined') {
                gsap.from(this, {
                    duration: 0.5,
                    opacity: 0,
                    scale: 1.1,
                    ease: 'power2.out'
                });
            }
        });
    });
});

// Export for use in other files
window.animations = animations;
window.showToast = showToast;