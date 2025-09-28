// Login Page JavaScript functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is already logged in
    if (window.authManager) {
        await window.authManager.waitForAuthState();
        if (window.authManager.isAuthenticated()) {
            AuthUtils.redirectToDashboard(window.authManager.getCurrentUser());
            return;
        }
    }
    
    // Initialize login page functionality
    initializeLoginPage();
});

function initializeLoginPage() {
    // Form elements
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const resetForm = document.getElementById('reset-form');
    
    // Toggle buttons
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const backToLogin = document.getElementById('back-to-login');
    
    // Form toggle elements
    const loginToggle = document.getElementById('login-toggle');
    const signupToggle = document.getElementById('signup-toggle');
    
    // Password visibility toggles
    const toggleLoginPassword = document.getElementById('toggle-login-password');
    const toggleSignupPassword = document.getElementById('toggle-signup-password');
    
    // Social buttons
    const googleSignin = document.getElementById('google-signin');
    const googleSignup = document.getElementById('google-signup');
    
    // Password strength elements
    const signupPassword = document.getElementById('signup-password');
    const passwordStrengthBar = document.getElementById('password-strength-bar');
    const passwordStrengthText = document.getElementById('password-strength-text');
    const confirmPassword = document.getElementById('confirm-password');
    
    // Initialize form validators
    const loginValidator = new FormValidator(loginForm);
    const signupValidator = new FormValidator(signupForm);
    const resetValidator = new FormValidator(resetForm);
    
    // Add validation rules
    loginValidator.addValidator('email', AuthUtils.validateEmail, 'Please enter a valid email address');
    loginValidator.addValidator('password', (password) => password.length >= 6, 'Password must be at least 6 characters');
    loginValidator.addValidator('role', (role) => ['student', 'teacher', 'admin'].includes(role), 'Please select your role');
    
    signupValidator.addValidator('name', AuthUtils.validateDisplayName, 'Name must be at least 2 characters');
    signupValidator.addValidator('email', AuthUtils.validateEmail, 'Please enter a valid email address');
    signupValidator.addValidator('password', (password) => AuthUtils.validatePassword(password).isValid, 'Password must contain uppercase, lowercase, and numbers');
    signupValidator.addValidator('confirmPassword', (confirmPwd) => {
        return confirmPwd === signupPassword.value;
    }, 'Passwords do not match');
    signupValidator.addValidator('role', (role) => ['student', 'teacher', 'admin'].includes(role), 'Please select your role');
    
    resetValidator.addValidator('email', AuthUtils.validateEmail, 'Please enter a valid email address');
    
    // Form switching functions
    function showLoginForm() {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        resetForm.classList.add('hidden');
        loginToggle.classList.remove('hidden');
        signupToggle.classList.add('hidden');
        clearAllErrors();
    }
    
    function showSignupForm() {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        resetForm.classList.add('hidden');
        loginToggle.classList.add('hidden');
        signupToggle.classList.remove('hidden');
        clearAllErrors();
    }
    
    function showResetForm() {
        loginForm.classList.add('hidden');
        signupForm.classList.add('hidden');
        resetForm.classList.remove('hidden');
        loginToggle.classList.add('hidden');
        signupToggle.classList.add('hidden');
        clearAllErrors();
    }
    
    function clearAllErrors() {
        document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
        document.querySelectorAll('.form-input').forEach(el => {
            el.classList.remove('border-error', 'border-success', 'error-shake');
        });
    }
    
    // Event listeners for form switching
    showSignup.addEventListener('click', showSignupForm);
    showLogin.addEventListener('click', showLoginForm);
    forgotPasswordLink.addEventListener('click', showResetForm);
    backToLogin.addEventListener('click', showLoginForm);
    
    // Password visibility toggles
    toggleLoginPassword.addEventListener('click', () => {
        togglePasswordVisibilityWithIcon('login-password', 'toggle-login-password');
    });
    
    toggleSignupPassword.addEventListener('click', () => {
        togglePasswordVisibilityWithIcon('signup-password', 'toggle-signup-password');
    });
    
    // Enhanced password visibility toggle with proper icons
    function togglePasswordVisibilityWithIcon(inputId, toggleId) {
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
    
    // Password strength checker
    signupPassword.addEventListener('input', AuthUtils.debounce(() => {
        const password = signupPassword.value;
        if (password.length === 0) {
            passwordStrengthBar.className = 'password-strength-bar';
            passwordStrengthText.textContent = '';
            return;
        }
        
        const strength = AuthUtils.getPasswordStrength(password);
        passwordStrengthBar.className = `password-strength-bar strength-${strength.level}`;
        passwordStrengthText.textContent = `Password strength: ${strength.text}`;
        passwordStrengthText.className = `text-xs mt-1 text-${strength.color}`;
    }, 300));
    
    // Confirm password validation
    confirmPassword.addEventListener('input', AuthUtils.debounce(() => {
        if (confirmPassword.value && confirmPassword.value !== signupPassword.value) {
            confirmPassword.classList.add('border-error');
            document.getElementById('confirm-password-error').textContent = 'Passwords do not match';
        } else {
            confirmPassword.classList.remove('border-error');
            document.getElementById('confirm-password-error').textContent = '';
        }
    }, 300));
    
    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!loginValidator.isFormValid()) {
            loginForm.classList.add('error-shake');
            setTimeout(() => loginForm.classList.remove('error-shake'), 500);
            return;
        }
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const selectedRole = document.getElementById('login-role').value;
        const rememberMe = document.getElementById('remember-me').checked;
        
        const loginButton = document.getElementById('login-submit');
        AuthUtils.setLoadingState(loginButton, true, 'Sign In');
        
        try {
            const result = await window.authManager.signIn(email, password);
            
            if (result.success) {
                // Verify the user's stored role matches the selected role
                const storedRole = await AuthUtils.getUserRole(result.user);
                
                if (storedRole !== selectedRole) {
                    AuthUtils.showToast(`Access denied: Your account role is '${storedRole}', not '${selectedRole}'`, 'error');
                    // Clear the form
                    document.getElementById('login-password').value = '';
                    document.getElementById('login-role').value = '';
                    return;
                }
                
                AuthUtils.showToast('Successfully signed in! Redirecting...', 'success');
                
                // Save remember me preference
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }
                
                // Redirect after short delay
                setTimeout(() => {
                    AuthUtils.redirectToDashboard(result.user, selectedRole);
                }, 1500);
            } else {
                AuthUtils.showToast(result.error, 'error');
                loginForm.classList.add('error-shake');
                setTimeout(() => loginForm.classList.remove('error-shake'), 500);
            }
        } catch (error) {
            AuthUtils.showToast('An unexpected error occurred', 'error');
            console.error('Login error:', error);
        } finally {
            AuthUtils.setLoadingState(loginButton, false, 'Sign In');
        }
    });
    
    // Signup form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!signupValidator.isFormValid()) {
            signupForm.classList.add('error-shake');
            setTimeout(() => signupForm.classList.remove('error-shake'), 500);
            return;
        }
        
        const name = AuthUtils.formatDisplayName(document.getElementById('signup-name').value);
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPwd = document.getElementById('confirm-password').value;
        const selectedRole = document.getElementById('signup-role').value;
        const termsAgreed = document.getElementById('terms-agreement').checked;
        
        if (password !== confirmPwd) {
            AuthUtils.showToast('Passwords do not match', 'error');
            return;
        }
        
        if (!termsAgreed) {
            AuthUtils.showToast('Please agree to the Terms of Service', 'error');
            return;
        }
        
        const signupButton = document.getElementById('signup-submit');
        AuthUtils.setLoadingState(signupButton, true, 'Create Account');
        
        try {
            const result = await window.authManager.signUp(email, password, name);
            
            if (result.success) {
                // Set the user's role in Firestore
                await AuthUtils.setUserRole(result.user, selectedRole);
                
                const roleMessage = selectedRole === 'admin' ? 
                    'Account created! Admin access requires approval. Please contact existing administrators.' :
                    'Account created successfully!';
                
                AuthUtils.showToast(`${roleMessage} Please sign in with your new account.`, 'success');
                
                // Switch to login form after successful signup
                setTimeout(() => {
                    showLoginForm();
                    document.getElementById('login-email').value = email;
                    document.getElementById('login-role').value = selectedRole;
                }, 2000);
            } else {
                AuthUtils.showToast(result.error, 'error');
                signupForm.classList.add('error-shake');
                setTimeout(() => signupForm.classList.remove('error-shake'), 500);
            }
        } catch (error) {
            AuthUtils.showToast('An unexpected error occurred', 'error');
            console.error('Signup error:', error);
        } finally {
            AuthUtils.setLoadingState(signupButton, false, 'Create Account');
        }
    });
    
    // Password reset form submission
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!resetValidator.isFormValid()) {
            resetForm.classList.add('error-shake');
            setTimeout(() => resetForm.classList.remove('error-shake'), 500);
            return;
        }
        
        const email = document.getElementById('reset-email').value;
        const resetButton = document.getElementById('reset-submit');
        
        AuthUtils.setLoadingState(resetButton, true, 'Send Reset Link');
        
        try {
            const result = await window.authManager.resetPassword(email);
            
            if (result.success) {
                AuthUtils.showToast(result.message, 'success');
                setTimeout(showLoginForm, 2000);
            } else {
                AuthUtils.showToast(result.error, 'error');
            }
        } catch (error) {
            AuthUtils.showToast('An unexpected error occurred', 'error');
            console.error('Reset password error:', error);
        } finally {
            AuthUtils.setLoadingState(resetButton, false, 'Send Reset Link');
        }
    });
    
    // Google Sign In/Up
    async function handleGoogleAuth(isSignup = false) {
        try {
            const result = await window.authManager.signInWithGoogle();
            
            if (result.success) {
                let userRole = await AuthUtils.getUserRole(result.user);
                
                // If this is a new user (signup) or user has no role, set default role
                if (!userRole || (isSignup && userRole === 'student')) {
                    // For Google signup, default to student role
                    // In a real application, you might want to show a role selection modal
                    const defaultRole = 'student';
                    await AuthUtils.setUserRole(result.user, defaultRole);
                    userRole = defaultRole;
                    
                    AuthUtils.showToast(`Welcome to Orbit! You've been registered as a ${defaultRole}. Contact an administrator to change your role if needed.`, 'success');
                } else {
                    AuthUtils.showToast('Successfully signed in with Google!', 'success');
                }
                
                setTimeout(() => {
                    AuthUtils.redirectToDashboard(result.user, userRole);
                }, 1500);
            } else {
                AuthUtils.showToast(result.error, 'error');
            }
        } catch (error) {
            AuthUtils.showToast('Google sign-in failed', 'error');
            console.error('Google auth error:', error);
        }
    }
    
    googleSignin.addEventListener('click', () => handleGoogleAuth(false));
    googleSignup.addEventListener('click', () => handleGoogleAuth(true));
    
    // Load saved form data
    const savedLoginData = AuthUtils.loadFormData('login');
    if (savedLoginData && savedLoginData.rememberMe) {
        document.getElementById('login-email').value = savedLoginData.email || '';
        document.getElementById('remember-me').checked = true;
    }
}
