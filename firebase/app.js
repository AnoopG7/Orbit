// Firebase App Initialization and Core Functions
import { app, auth, db } from '/firebase/firebase-config.js';
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    sendEmailVerification
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';

import { 
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// Initialize providers using imported app/auth/db
const googleProvider = new GoogleAuthProvider();

// Auth State Management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authStateListeners = [];
        this.init();
    }

    init() {
        // Listen for authentication state changes
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            this.notifyAuthStateChange(user);
        });
    }

    // Register auth state change listener
    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);
    }

    // Notify all listeners of auth state change
    notifyAuthStateChange(user) {
        this.authStateListeners.forEach(callback => callback(user));
    }

    // Get appropriate dashboard URL based on user role
    getDashboardUrl(user) {
        // You can customize this based on user roles stored in Firestore
        return '/pages/student-dashboard.html';
    }

    // Sign in with email and password
    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await this.createOrUpdateUserProfile(userCredential.user);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Sign up with email and password
    async signUp(email, password, displayName) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Update user profile
            await updateProfile(userCredential.user, {
                displayName: displayName
            });

            // Send email verification
            await sendEmailVerification(userCredential.user);

            // Create user document in Firestore (without role - will be set separately)
            await this.createOrUpdateUserProfile(userCredential.user, {
                displayName,
                email,
                createdAt: serverTimestamp(),
                emailVerified: false
            });

            return { 
                success: true, 
                user: userCredential.user,
                message: 'Account created successfully! Please check your email for verification.'
            };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Sign in with Google
    async signInWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await this.createOrUpdateUserProfile(result.user);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Sign out
    async signOut() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Reset password
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true, message: 'Password reset email sent successfully!' };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Create or update user profile in Firestore
    async createOrUpdateUserProfile(user, additionalData = {}) {
        try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            const userData = {
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
                lastLoginAt: serverTimestamp(),
                ...additionalData
            };

            if (userSnap.exists()) {
                // Update existing user
                await updateDoc(userRef, userData);
            } else {
                // Create new user document
                await setDoc(userRef, {
                    ...userData,
                    createdAt: serverTimestamp(),
                    role: additionalData.role || 'student'
                });
            }
        } catch (error) {
            console.error('Error creating/updating user profile:', error);
        }
    }

    // Get user profile from Firestore
    async getUserProfile(uid) {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            return userSnap.exists() ? userSnap.data() : null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    }

    // Convert Firebase error codes to user-friendly messages
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password should be at least 6 characters long.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/operation-not-allowed': 'This operation is not allowed.',
            'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
            'auth/cancelled-popup-request': 'Sign-in was cancelled.',
            'auth/popup-blocked': 'Sign-in popup was blocked by the browser.',
            'auth/invalid-credential': 'Invalid credentials provided.',
            'auth/network-request-failed': 'Network error. Please check your connection.'
        };

        return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.currentUser;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Wait for auth state to be determined
    waitForAuthState() {
        return new Promise((resolve) => {
            if (this.currentUser !== null) {
                resolve(this.currentUser);
            } else {
                const unsubscribe = onAuthStateChanged(auth, (user) => {
                    unsubscribe();
                    resolve(user);
                });
            }
        });
    }
}

// Create global auth manager instance
window.authManager = new AuthManager();

// Make other Firebase objects globally available
window.auth = auth;
window.db = db;
window.updateDoc = updateDoc;
window.getDoc = getDoc;
window.doc = doc;
window.setDoc = setDoc;
window.serverTimestamp = serverTimestamp;

// Dispatch ready event when Firebase is fully initialized
window.dispatchEvent(new CustomEvent('firebaseReady', {
    detail: { authManager: window.authManager, auth, db }
}));

console.log('Firebase initialized and authManager created:', window.authManager);

// Export for module usage
export { AuthManager, app, auth, db };
