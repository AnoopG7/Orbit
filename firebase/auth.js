/**
 * AUTHENTICATION UTILITIES - Frontend Auth Helpers & UI Components
 * 
 * This file provides comprehensive frontend utilities for authentication workflows.
 * It handles form validation, UI interactions, security checks, and user experience
 * enhancements for all authentication-related pages.
 * 
 * Key Features:
 * - Page protection and authentication guards
 * - Real-time form validation with visual feedback
 * - Password strength indicators and visibility toggles
 * - Toast notifications and loading states
 * - User-friendly error handling and messaging
 * - Form data persistence and theme-aware styling
 * 
 * Used by: Login pages, signup forms, password reset, protected dashboards
 * Global Access: window.AuthUtils, window.FormValidator
 */

// Authentication Utilities
class AuthUtils {

    // Simple authentication guard for pages
    static async requireAuth() {
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
            return { user };
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

    // Check if user should be redirected (already logged in)
    static async checkAuthAndRedirect() {
        if (window.authManager && window.authManager.isAuthenticated()) {
            window.location.href = '/pages/student-dashboard.html';
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
