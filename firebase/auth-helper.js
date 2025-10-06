/**
 * FIREBASE AUTH HELPER - Anonymous Authentication for Data Operations
 * 
 * This utility provides lightweight anonymous authentication specifically for background
 * data operations that don't require user accounts. It's designed for scripts and 
 * operations that need Firebase access without full user authentication.
 * 
 * Key Features:
 * - Anonymous user authentication for data access
 * - Automatic authentication state management
 * - Timeout protection and error handling
 * - Ensures Firebase operations cannot proceed without user login
 * 
 * Used by: Data population scripts, background operations, public data access
 * Global Access: window.firebaseAuthHelper
 */

// Firebase Authentication Helper
// Provides simple authentication for data operations

import { auth } from './firebase-config.js';
import { signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';

class FirebaseAuthHelper {
    constructor() {
        this.user = null;
        this.initialized = false;
    }

    // Initialize authentication
    async initialize() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Authentication timeout'));
            }, 10000); // 10 second timeout

            onAuthStateChanged(auth, (user) => {
                clearTimeout(timeout);
                this.user = user;
                this.initialized = true;
                
                if (user) {
                    console.log('✅ User authenticated:', user.uid);
                    resolve(user);
                } else {
                    console.log('❌ No user authenticated');
                    resolve(null);
                }
            });
        });
    }

    // Sign in anonymously for data operations
    async signInAnonymously() {
        try {
            console.log('🔐 Signing in anonymously...');
            const userCredential = await signInAnonymously(auth);
            this.user = userCredential.user;
            console.log('✅ Anonymous sign-in successful:', this.user.uid);
            return this.user;
        } catch (error) {
            console.error('❌ Anonymous sign-in failed:', error);
            throw error;
        }
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.user !== null;
    }

    // Ensure user is authenticated
    async ensureAuthenticated() {
        if (!this.initialized) {
            await this.initialize();
        }

        if (!this.isAuthenticated()) {
            await this.signInAnonymously();
        }

        return this.user;
    }
}

// Create global instance
const authHelper = new FirebaseAuthHelper();

// Export for use in other modules
window.firebaseAuthHelper = authHelper;

export { authHelper as default, FirebaseAuthHelper };

console.log('🔐 Firebase Auth Helper loaded and ready!');