// Authentication utilities
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = this.token ? JSON.parse(localStorage.getItem('userData') || '{}') : null;
        this.init();
    }

    init() {
        this.updateNavigation();
        this.checkAuthOnProtectedPages();
    }

    isLoggedIn() {
        return !!this.token && !!this.user;
    }

    getUser() {
        return this.user;
    }

    getToken() {
        return this.token;
    }

    async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('userData', JSON.stringify(this.user));
                this.updateNavigation();
                return { success: true, data };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    async register(userData) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('userData', JSON.stringify(this.user));
                this.updateNavigation();
                return { success: true, data };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('rememberMe');
        this.updateNavigation();
        
        // Redirect to home page
        if (window.location.pathname !== '/') {
            window.location.href = '/';
        }
    }

    updateNavigation() {
        const userMenuText = document.getElementById('userMenuText');
        const loginLink = document.getElementById('loginLink');
        const registerLink = document.getElementById('registerLink');
        const profileLink = document.getElementById('profileLink');
        const ordersLink = document.getElementById('ordersLink');
        const menuDivider = document.getElementById('menuDivider');
        const logoutBtn = document.getElementById('logoutBtn');
        const sellLink = document.getElementById('sellLink');

        if (!userMenuText) return; // Navigation not loaded yet

        if (this.isLoggedIn()) {
            userMenuText.textContent = this.user.name.split(' ')[0];
            
            if (loginLink) loginLink.classList.add('hidden');
            if (registerLink) registerLink.classList.add('hidden');
            if (profileLink) profileLink.classList.remove('hidden');
            if (ordersLink) ordersLink.classList.remove('hidden');
            if (menuDivider) menuDivider.classList.remove('hidden');
            if (logoutBtn) {
                logoutBtn.classList.remove('hidden');
                logoutBtn.addEventListener('click', () => this.logout());
            }

            // Update sell link based on role
            if (sellLink) {
                if (this.user.role === 'seller') {
                    sellLink.href = '/seller-dashboard';
                    sellLink.textContent = 'Dashboard';
                } else if (this.user.role === 'admin') {
                    sellLink.href = '/admin-dashboard';
                    sellLink.textContent = 'Admin';
                }
            }
        } else {
            userMenuText.textContent = 'Account';
            
            if (loginLink) loginLink.classList.remove('hidden');
            if (registerLink) registerLink.classList.remove('hidden');
            if (profileLink) profileLink.classList.add('hidden');
            if (ordersLink) ordersLink.classList.add('hidden');
            if (menuDivider) menuDivider.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');
        }
    }

    checkAuthOnProtectedPages() {
        const protectedPages = ['/seller-dashboard', '/admin-dashboard', '/checkout'];
        const currentPath = window.location.pathname;

        if (protectedPages.some(page => currentPath.includes(page))) {
            if (!this.isLoggedIn()) {
                window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
                return;
            }

            // Check role-based access
            if (currentPath.includes('/admin-dashboard') && this.user.role !== 'admin') {
                window.location.href = '/';
                return;
            }

            if (currentPath.includes('/seller-dashboard') && !['seller', 'admin'].includes(this.user.role)) {
                window.location.href = '/';
                return;
            }
        }
    }

    async makeAuthenticatedRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        };

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
                // Token expired or invalid
                this.logout();
                return null;
            }

            return response;
        } catch (error) {
            console.error('API request failed:', error);
            return null;
        }
    }
}

// Global auth instance
const auth = new AuthManager();

// Global helper functions for backward compatibility
function isLoggedIn() {
    return auth.isLoggedIn();
}

function getCurrentUser() {
    return auth.getUser();
}

function getAuthToken() {
    return auth.getToken();
}

// User menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenu = document.getElementById('userMenu');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (userMenuBtn && userMenu) {
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userMenu.classList.toggle('hidden');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function() {
            userMenu.classList.add('hidden');
        });

        userMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
});