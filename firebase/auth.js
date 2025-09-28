// Authentication Utilities with Role-Based Access Control
class AuthUtils {
    // User roles hierarchy
    static ROLES = {
        STUDENT: 'student',
        TEACHER: 'teacher', 
        ADMIN: 'admin'
    };

    // Role hierarchy for permissions (higher number = more permissions)
    static ROLE_HIERARCHY = {
        student: 1,
        teacher: 2,
        admin: 3
    };

    // Dashboard routes for each role
    static DASHBOARD_ROUTES = {
        student: '/pages/student-dashboard.html',
        teacher: '/pages/teacher-dashboard.html',
        admin: '/pages/admin-dashboard.html'
    };

    // Get user role from Firestore
    static async getUserRole(user) {
        try {
            if (!user || !user.uid) return 'student';
            
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                return userDoc.data().role || 'student';
            }
            
            // Default role for new users
            return 'student';
        } catch (error) {
            console.error('Error getting user role:', error);
            return 'student';
        }
    }

    // Set user role in Firestore
    static async setUserRole(user, role) {
        try {
            if (!user || !user.uid) {
                throw new Error('Invalid user object');
            }
            
            if (!['student', 'teacher', 'admin'].includes(role)) {
                throw new Error('Invalid role specified');
            }
            
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                role: role,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }, { merge: true });
            
            console.log(`User role set to: ${role} for user: ${user.email}`);
            return true;
        } catch (error) {
            console.error('Error setting user role:', error);
            throw error;
        }
    }

    // Check if user has required role or higher
    static hasRoleAccess(userRole, requiredRole) {
        if (!userRole || !requiredRole) return false;
        
        const userLevel = this.ROLE_HIERARCHY[userRole] || 0;
        const requiredLevel = this.ROLE_HIERARCHY[requiredRole] || 999;
        
        return userLevel >= requiredLevel;
    }

    // Get allowed navigation items based on user role
    static getNavItemsForRole(userRole) {
        const baseItems = [
            { href: '/', label: 'Home', page: 'home', roles: ['student', 'teacher', 'admin'] },
            { href: '/pages/profile.html', label: 'Profile', page: 'profile', roles: ['student', 'teacher', 'admin'] }
        ];

        const roleSpecificItems = [
            { href: '/pages/student-dashboard.html', label: 'My Dashboard', page: 'student-dashboard', roles: ['student'] },
            { href: '/pages/teacher-dashboard.html', label: 'Teacher Dashboard', page: 'teacher-dashboard', roles: ['teacher', 'admin'] },
            { href: '/pages/admin-dashboard.html', label: 'Admin Panel', page: 'admin-dashboard', roles: ['admin'] }
        ];

        const allItems = [...baseItems, ...roleSpecificItems];
        
        return allItems.filter(item => 
            item.roles.includes(userRole) || 
            (userRole === 'admin' && item.roles.includes('teacher')) // Admins can access teacher features
        );
    }

    // Redirect user to appropriate dashboard based on role
    static redirectToDashboard(user, userRole) {
        const dashboardUrl = this.DASHBOARD_ROUTES[userRole] || this.DASHBOARD_ROUTES.student;
        window.location.href = dashboardUrl;
    }

    // Check if current page is accessible by user role
    static isPageAccessible(currentPath, userRole) {
        // Always allow access to these pages
        const publicPages = ['/', '/index.html', '/pages/login.html', '/pages/profile.html'];
        
        if (publicPages.some(page => currentPath.includes(page))) {
            return true;
        }

        // Role-specific page access
        const rolePages = {
            student: ['/pages/student-dashboard.html'],
            teacher: ['/pages/student-dashboard.html', '/pages/teacher-dashboard.html'], 
            admin: ['/pages/student-dashboard.html', '/pages/teacher-dashboard.html', '/pages/admin-dashboard.html']
        };

        const allowedPages = rolePages[userRole] || rolePages.student;
        return allowedPages.some(page => currentPath.includes(page));
    }

    // Enhanced authentication guard for pages
    static async requireAuth(requiredRole = null) {
        try {
            if (!window.authManager) {
                this.redirectToLogin();
                return null;
            }

            await window.authManager.waitForAuthState();
            
            if (!window.authManager.isAuthenticated()) {
                this.redirectToLogin();
                return null;
            }

            const user = window.authManager.getCurrentUser();
            const userRole = await this.getUserRole(user);

            // Check role-based access if required role specified
            if (requiredRole && !this.hasRoleAccess(userRole, requiredRole)) {
                this.showToast(`Access denied. ${requiredRole} role required.`, 'error');
                setTimeout(() => {
                    this.redirectToDashboard(user, userRole);
                }, 2000);
                return null;
            }

            // Check if current page is accessible
            const currentPath = window.location.pathname;
            if (!this.isPageAccessible(currentPath, userRole)) {
                this.showToast('Access denied for this page.', 'error');
                setTimeout(() => {
                    this.redirectToDashboard(user, userRole);
                }, 2000);
                return null;
            }

            return { user, userRole };
        } catch (error) {
            console.error('Authentication check failed:', error);
            this.redirectToLogin();
            return null;
        }
    }

    // Redirect to login page
    static redirectToLogin() {
        window.location.href = '/pages/login.html';
    }
    // Form validation utilities
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        const minLength = 6;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);

        return {
            isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
            length: password.length >= minLength,
            upperCase: hasUpperCase,
            lowerCase: hasLowerCase,
            numbers: hasNumbers
        };
    }

    static validateDisplayName(name) {
        return name.trim().length >= 2;
    }

    // Password strength indicator
    static getPasswordStrength(password) {
        let strength = 0;
        const checks = this.validatePassword(password);

        if (checks.length) strength++;
        if (checks.upperCase) strength++;
        if (checks.lowerCase) strength++;
        if (checks.numbers) strength++;
        if (password.length >= 8) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

        if (strength <= 2) return { level: 'weak', color: 'error', text: 'Weak' };
        if (strength <= 4) return { level: 'medium', color: 'warning', text: 'Medium' };
        return { level: 'strong', color: 'success', text: 'Strong' };
    }

    // Form state management
    static togglePasswordVisibility(inputId, toggleId) {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(toggleId);
        
        if (input.type === 'password') {
            input.type = 'text';
            // Eye-off icon (password visible)
            toggle.innerHTML = `
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                </svg>
            `;
        } else {
            input.type = 'password';
            // Eye icon (password hidden)
            toggle.innerHTML = `
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
            `;
        }
    }

    // Loading state management
    static setLoadingState(button, isLoading, originalText = 'Submit') {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = `
                <span class="spinner"></span>
                <span>Loading...</span>
            `;
        } else {
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    // Show toast notifications
    static showToast(message, type = 'info', duration = 5000) {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast toast-${type} fixed top-4 right-4 z-toast animate-slide-down`;
        toast.innerHTML = `
            <div class="flex items-center gap-3 p-4 bg-card border border-${type === 'error' ? 'error' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'primary'} rounded-lg shadow-lg max-w-md">
                <div class="text-${type === 'error' ? 'error' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'primary'}">
                    ${this.getToastIcon(type)}
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium">${message}</p>
                </div>
                <button class="text-muted hover:text-primary transition-colors" onclick="this.parentElement.parentElement.remove()">
                    ✕
                </button>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto-remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'slideUp 0.3s ease-out';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }

    static getToastIcon(type) {
        const icons = {
            success: '✅',
            error: '❌', 
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    // Redirect with authentication check
    static redirectToDashboard(user) {
        // You can customize this based on user roles
        const dashboardUrl = '/pages/student-dashboard.html';
        window.location.href = dashboardUrl;
    }

    // Check if user should be redirected (already logged in)
    static checkAuthAndRedirect() {
        if (window.authManager && window.authManager.isAuthenticated()) {
            this.redirectToDashboard(window.authManager.getCurrentUser());
            return true;
        }
        return false;
    }

    // Sanitize and format user input
    static sanitizeInput(input) {
        return input.trim().replace(/[<>]/g, '');
    }

    // Generate random avatar color based on name
    static getAvatarColor(name) {
        const colors = [
            'bg-blue-500', 'bg-pink-500', 'bg-green-500', 'bg-yellow-500',
            'bg-purple-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500'
        ];
        const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        return colors[index];
    }

    // Format user display name
    static formatDisplayName(name) {
        return name.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    // Get initials from name
    static getInitials(name) {
        return name.split(' ')
            .map(word => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase();
    }

    // Debounce function for real-time validation
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Local storage utilities for form data
    static saveFormData(formId, data) {
        try {
            localStorage.setItem(`form_${formId}`, JSON.stringify(data));
        } catch (error) {
            console.warn('Could not save form data:', error);
        }
    }

    static loadFormData(formId) {
        try {
            const data = localStorage.getItem(`form_${formId}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn('Could not load form data:', error);
            return null;
        }
    }

    static clearFormData(formId) {
        try {
            localStorage.removeItem(`form_${formId}`);
        } catch (error) {
            console.warn('Could not clear form data:', error);
        }
    }

    // Theme-aware styling
    static getThemeAwareClasses() {
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        return {
            isDark: theme === 'dark',
            bgClass: theme === 'dark' ? 'bg-primary' : 'bg-white',
            textClass: theme === 'dark' ? 'text-white' : 'text-gray-900',
            borderClass: theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
        };
    }
}

// Real-time form validation
class FormValidator {
    constructor(formElement) {
        this.form = formElement;
        this.validators = new Map();
        this.init();
    }

    init() {
        this.form.addEventListener('input', this.handleInput.bind(this));
        this.form.addEventListener('blur', this.handleBlur.bind(this), true);
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    addValidator(fieldName, validatorFn, errorMessage) {
        this.validators.set(fieldName, { validatorFn, errorMessage });
    }

    handleInput(e) {
        const field = e.target;
        if (this.validators.has(field.name)) {
            this.validateField(field);
        }
    }

    handleBlur(e) {
        const field = e.target;
        if (this.validators.has(field.name)) {
            this.validateField(field);
        }
    }

    handleSubmit(e) {
        let isValid = true;
        
        this.validators.forEach((validator, fieldName) => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            e.preventDefault();
        }
    }

    validateField(field) {
        const validator = this.validators.get(field.name);
        if (!validator) return true;

        const isValid = validator.validatorFn(field.value);
        const errorElement = this.form.querySelector(`#${field.name}-error`);
        
        if (isValid) {
            field.classList.remove('border-error');
            field.classList.add('border-success');
            if (errorElement) errorElement.textContent = '';
        } else {
            field.classList.remove('border-success');
            field.classList.add('border-error');
            if (errorElement) errorElement.textContent = validator.errorMessage;
        }

        return isValid;
    }

    isFormValid() {
        let isValid = true;
        this.validators.forEach((validator, fieldName) => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });
        return isValid;
    }
}

// Export utilities
window.AuthUtils = AuthUtils;
window.FormValidator = FormValidator;
