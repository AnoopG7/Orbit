// Navbar functionality
(function() {
    'use strict';
    
    // Set active navigation link based on current page
    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.navbar-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            // Check if the link href matches current path
            const linkPath = new URL(link.href, window.location.origin).pathname;
            if (linkPath === currentPath || 
                (currentPath === '/' && link.getAttribute('data-page') === 'home') ||
                (currentPath.includes('student-dashboard') && link.getAttribute('data-page') === 'student-dashboard') ||
                (currentPath.includes('teacher-dashboard') && link.getAttribute('data-page') === 'analytics') ||
                (currentPath.includes('admin-dashboard') && link.getAttribute('data-page') === 'admin')) {
                link.classList.add('active');
            }
        });
    }
    
    // Theme toggle functionality
    function initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const themeToggleMobile = document.getElementById('theme-toggle-mobile');
        const themeIcon = document.getElementById('theme-icon');
        const themeIconMobile = document.getElementById('theme-icon-mobile');
        
        console.log('Initializing theme toggle...', { themeToggle, themeToggleMobile, themeIcon, themeIconMobile });
        
        if (!themeToggle && !themeToggleMobile) {
            console.error('No theme toggle buttons found');
            return;
        }
        
        function updateThemeIcon(theme) {
            console.log('Updating theme icon for theme:', theme);
            const sunIcon = `
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5"/>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
            `;
            const moonIcon = `
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
            `;
            
            const iconHtml = theme === 'dark' ? sunIcon : moonIcon;
            if (themeIcon) {
                themeIcon.innerHTML = iconHtml;
            }
            if (themeIconMobile) {
                themeIconMobile.innerHTML = iconHtml;
            }
        }
        
        function toggleTheme(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Theme toggle clicked');
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            console.log('Switching from', currentTheme, 'to', newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        }
        
        // Initialize icon based on current theme
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        updateThemeIcon(currentTheme);
        
        // Add event listeners
        if (themeToggle && !themeToggle.dataset.initialized) {
            themeToggle.addEventListener('click', toggleTheme);
            themeToggle.dataset.initialized = 'true';
            console.log('Desktop theme toggle initialized');
        }
        if (themeToggleMobile && !themeToggleMobile.dataset.initialized) {
            themeToggleMobile.addEventListener('click', toggleTheme);
            themeToggleMobile.dataset.initialized = 'true';
            console.log('Mobile theme toggle initialized');
        }
    }
    
    // Mobile menu functionality
    function initMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const hamburgerIcon = document.getElementById('hamburger-icon');
        
        console.log('Initializing mobile menu...', { mobileMenuToggle, mobileMenu, hamburgerIcon });
        
        if (mobileMenuToggle && mobileMenu && hamburgerIcon && !mobileMenuToggle.dataset.initialized) {
            mobileMenuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Mobile menu toggle clicked');
                const isOpen = !mobileMenu.classList.contains('hidden');
                
                if (isOpen) {
                    mobileMenu.classList.add('hidden');
                    // Hamburger icon
                    hamburgerIcon.innerHTML = `
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    `;
                } else {
                    mobileMenu.classList.remove('hidden');
                    // Close (X) icon
                    hamburgerIcon.innerHTML = `
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    `;
                }
            });
            
            // Close menu when clicking on a link
            const mobileNavLinks = mobileMenu.querySelectorAll('.navbar-link');
            mobileNavLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.add('hidden');
                    hamburgerIcon.innerHTML = `
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    `;
                });
            });
            
            mobileMenuToggle.dataset.initialized = 'true';
            console.log('Mobile menu initialized');
        }
    }

    // Auth button functionality
    function initAuthButtons() {
        const authButton = document.getElementById('auth-button');
        const authButtonMobile = document.getElementById('auth-button-mobile');
        
        function updateAuthButtons(user) {
            const buttons = [authButton, authButtonMobile].filter(Boolean);
            
            buttons.forEach(button => {
                if (user) {
                    // User is authenticated - show logout
                    button.textContent = 'Logout';
                    button.href = '#';
                    button.onclick = (e) => {
                        e.preventDefault();
                        handleLogout();
                    };
                } else {
                    // User is not authenticated - show login
                    button.textContent = 'Login';
                    button.href = '/pages/login.html';
                    button.onclick = null;
                }
            });
        }

        async function handleLogout() {
            if (window.authManager) {
                try {
                    // Clear any local storage auth data
                    localStorage.removeItem('firebase:authUser');
                    localStorage.removeItem('firebase:host');
                    
                    const result = await window.authManager.signOut();
                    console.log('Logout result:', result);
                    
                    // Force clear the auth state
                    window.authManager.currentUser = null;
                    
                    // Clear session storage as well
                    sessionStorage.clear();
                    
                    // Redirect to home page after successful logout
                    window.location.href = '/';
                } catch (error) {
                    console.error('Error during logout:', error);
                    // Force redirect even on error
                    window.location.href = '/';
                }
            } else {
                // Fallback if authManager not available
                window.location.href = '/';
            }
        }

        // Check auth state and update buttons
        if (window.authManager) {
            // Listen for auth state changes
            window.authManager.onAuthStateChange(updateAuthButtons);
            
            // Check current auth state
            const currentUser = window.authManager.getCurrentUser();
            updateAuthButtons(currentUser);
        } else {
            // Wait for authManager to be available
            setTimeout(() => {
                if (window.authManager) {
                    initAuthButtons();
                }
            }, 500);
        }
    }

    // Main initialization function
    function initializeNavbar() {
        try {
            // Wait a bit for elements to be available
            const themeToggle = document.getElementById('theme-toggle');
            const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
            
            if (!themeToggle || !mobileMenuToggle) {
                console.log('Navbar elements not yet available, retrying...');
                setTimeout(initializeNavbar, 100);
                return;
            }
            
            setActiveNavLink();
            initThemeToggle();
            initMobileMenu();
            initAuthButtons();
            console.log('Navbar initialized successfully');
        } catch (error) {
            console.error('Error initializing navbar:', error);
            // Retry on error
            setTimeout(initializeNavbar, 200);
        }
    }

    // Initialize with multiple strategies to ensure it works
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initializeNavbar, 100);
        });
    } else {
        // DOM is already loaded
        setTimeout(initializeNavbar, 100);
    }
    
    // Also listen for component loaded events
    document.addEventListener('componentLoaded', (e) => {
        if (e.detail && e.detail.componentPath && e.detail.componentPath.includes('navbar')) {
            console.log('Navbar component loaded event received');
            setTimeout(initializeNavbar, 100);
        }
    });
    
    // Additional fallback initialization
    setTimeout(() => {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle && !themeToggle.dataset.initialized) {
            console.log('Fallback navbar initialization');
            initializeNavbar();
        }
    }, 500);
})();
