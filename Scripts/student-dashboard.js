// Student Dashboard functionality
(function() {
    'use strict';

    let isInitialized = false;
    let authChecked = false;

    // Proper auth check without loops
    function immediateAuthCheck() {
        // If no auth manager is available, block access immediately
        if (!window.authManager) {
            return false;
        }
        
        // If auth manager exists but no current user, block access
        const currentUser = window.authManager.getCurrentUser();
        if (!currentUser) {
            return false;
        }
        
        return true;
    }

    // Initialize dashboard when DOM is loaded with role-based auth
    document.addEventListener('DOMContentLoaded', async () => {
        if (!isInitialized) {
            await initializeStudentDashboard();
        }
    });

    async function initializeStudentDashboard() {
        if (isInitialized) {
            console.log('Dashboard already initialized, skipping...');
            return;
        }

        // Use new role-based authentication - student role required
        const authResult = await AuthUtils.requireAuth('student');
        
        if (!authResult) {
            // Auth failed, user will be redirected by requireAuth
            return;
        }

        const { user, userRole } = authResult;
        console.log('Initializing Student Dashboard for user:', user.email, 'Role:', userRole);
        isInitialized = true;
        
        // Initialize dashboard components
        animateProgressBars();
        animateStatCards();
        initializeInteractiveElements();
        setupRealTimeUpdates();
        initializeQuickActions();
        
        // Load user data with role info
        loadStudentData(user, userRole);
        
        // Listen for auth state changes to handle logout
        setupAuthStateListener();
        
        console.log('Student Dashboard initialized successfully');
    }

    function animateProgressBars() {
        // Animate course progress bars with delay
        const progressBars = document.querySelectorAll('[style*="width:"]');
        
        progressBars.forEach((bar, index) => {
            const targetWidth = bar.style.width;
            bar.style.width = '0%';
            bar.style.transition = 'width 1.5s ease-in-out';
            
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 500 + (index * 200));
        });

        // Animate circular progress (study time)
        const circularProgress = document.querySelector('circle[stroke-dashoffset]');
        if (circularProgress) {
            const targetOffset = circularProgress.getAttribute('stroke-dashoffset');
            circularProgress.setAttribute('stroke-dashoffset', '251.2');
            
            setTimeout(() => {
                circularProgress.style.transition = 'stroke-dashoffset 2s ease-in-out';
                circularProgress.setAttribute('stroke-dashoffset', targetOffset);
            }, 800);
        }
    }

    function animateStatCards() {
        // Animate stat numbers with counting effect
        const statNumbers = document.querySelectorAll('.text-3xl.font-bold');
        
        statNumbers.forEach((element, index) => {
            const finalValue = element.textContent;
            const isNumeric = !isNaN(parseFloat(finalValue));
            
            if (isNumeric) {
                const targetNumber = parseFloat(finalValue);
                let currentNumber = 0;
                const increment = targetNumber / 30; // 30 steps for smooth animation
                
                element.textContent = '0';
                
                const timer = setInterval(() => {
                    currentNumber += increment;
                    if (currentNumber >= targetNumber) {
                        element.textContent = finalValue;
                        clearInterval(timer);
                    } else {
                        element.textContent = Math.floor(currentNumber).toString();
                    }
                }, 50);
                
                // Start animation with delay based on card position
                setTimeout(() => {
                    // Animation will start when timeout completes
                }, index * 200);
            }
        });
    }

    function initializeInteractiveElements() {
        // Add hover effects and click handlers to activity items
        const activityItems = document.querySelectorAll('.card-body .space-y-4 > div');
        
        activityItems.forEach(item => {
            item.addEventListener('click', function() {
                // Add click animation
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
                
                // You can add more functionality here like opening details modal
                console.log('Activity item clicked');
            });
        });

        // Add functionality to course progress items
        const courseItems = document.querySelectorAll('.card-body .space-y-6 > div');
        courseItems.forEach(item => {
            item.addEventListener('click', function() {
                console.log('Course progress clicked');
                // Could open detailed course view
            });
            
            item.style.cursor = 'pointer';
            item.classList.add('hover:bg-hover', 'transition-colors', 'rounded-lg', 'p-2', '-m-2');
        });

        // Add functionality to deadline items
        const deadlineItems = document.querySelectorAll('[class*="border-l-4"]');
        deadlineItems.forEach(item => {
            item.addEventListener('click', function() {
                console.log('Deadline item clicked');
                // Could open assignment details
            });
            
            item.style.cursor = 'pointer';
            item.classList.add('hover:shadow-md', 'transition-all');
        });
    }

    function loadStudentData() {
        if (authChecked) {
            console.log('Auth already checked, skipping...');
            return;
        }

        // Wait for Firebase to be ready, then check auth
        function checkAuth() {
            if (window.authManager) {
                window.authManager.waitForAuthState().then(user => {
                    authChecked = true;
                    if (user) {
                        console.log('Authenticated user found:', user.email);
                        updateUserInfo(user);
                    } else {
                        // No user - redirect to login
                        console.warn('No authenticated user, redirecting');
                        window.location.href = '/pages/login.html';
                    }
                }).catch(error => {
                    console.error('Auth check failed:', error);
                    window.location.href = '/pages/login.html';
                });
            } else {
                // Check again in a moment if auth manager isn't ready
                setTimeout(checkAuth, 200);
            }
        }
        
        checkAuth();
    }

    function updateUserInfo(user) {
        // Update student name from Firebase Auth
        const studentNameElement = document.getElementById('student-name');
        if (studentNameElement && user.displayName) {
            studentNameElement.textContent = user.displayName;
        }

        // Update avatar with user initials
        const avatarElement = document.querySelector('.w-12.h-12.rounded-full');
        if (avatarElement && user.displayName) {
            const initials = getInitials(user.displayName);
            avatarElement.textContent = initials;
        }

        // Generate student ID based on user info (could be stored in Firestore)
        const studentIdElement = document.querySelector('p.text-xs.text-muted');
        if (studentIdElement && user.uid) {
            // Generate a formatted student ID from user UID
            const studentId = `ST${user.uid.substring(0, 7).toUpperCase()}`;
            studentIdElement.textContent = `Student ID: ${studentId}`;
        }

        // Get additional user data from Firestore if available
        if (window.authManager.getUserProfile) {
            window.authManager.getUserProfile(user.uid).then(profile => {
                if (profile) {
                    console.log('User profile loaded:', profile);
                    // You can update additional fields here based on Firestore data
                }
            });
        }

        console.log('User data loaded from Firebase:', {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            emailVerified: user.emailVerified
        });
    }

    function updateUserInfoFallback() {
        // Temporary fallback while Firebase loads
        const studentNameElement = document.getElementById('student-name');
        if (studentNameElement) {
            studentNameElement.textContent = 'Loading...';
        }
        console.log('Using temporary fallback while auth loads');
    }

    function getInitials(name) {
        if (!name) return 'U';
        return name.split(' ')
            .map(word => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase();
    }

    function setupAuthStateListener() {
        if (window.authManager) {
            // Listen for auth state changes
            window.authManager.onAuthStateChange(user => {
                if (!user && authChecked) {
                    // User logged out - immediate redirect
                    console.log('User logged out, redirecting...');
                    window.location.href = '/pages/login.html';
                }
            });
        }
    }

    function setupRealTimeUpdates() {
        // Simulate real-time updates (in production, this would use WebSockets or Server-Sent Events)
        setInterval(() => {
            updateActivityFeed();
        }, 30000); // Update every 30 seconds

        // Update study streak
        setInterval(() => {
            updateStudyStreak();
        }, 60000); // Update every minute
    }

    function updateActivityFeed() {
        // Simulate new activity
        console.log('Checking for new activities...');
        
        // In a real app, you'd fetch new activities from your API
        // and prepend them to the activity feed
    }

    function updateStudyStreak() {
        // Check if student is currently active and update streak
        if (document.visibilityState === 'visible') {
            console.log('Student is active - maintaining study streak');
        }
    }

    function initializeQuickActions() {
        const quickActionButtons = document.querySelectorAll('.card:last-child .btn');
        
        quickActionButtons.forEach((button, index) => {
            button.addEventListener('click', function() {
                const actionName = this.querySelector('.text-xs').textContent;
                handleQuickAction(actionName);
                
                // Visual feedback
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            });
        });
    }

    function handleQuickAction(actionName) {
        console.log('Quick action clicked:', actionName);
        
        switch(actionName) {
            case 'Study Plan':
                // Open study plan modal or navigate to study planner
                showNotification('Opening study plan...', 'info');
                break;
            case 'Submit Work':
                // Navigate to assignment submission
                showNotification('Opening assignment submission...', 'info');
                break;
            case 'Ask Question':
                // Open discussion forum or chat
                showNotification('Opening discussion forum...', 'info');
                break;
            case 'View Grades':
                // Navigate to grades page
                showNotification('Opening grades view...', 'info');
                break;
            default:
                showNotification('Feature coming soon!', 'warning');
        }
    }

    function showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white z-50 transition-all duration-300 transform translate-x-full`;
        
        switch(type) {
            case 'success':
                notification.classList.add('bg-accent-success');
                break;
            case 'warning':
                notification.classList.add('bg-accent-warning');
                break;
            case 'error':
                notification.classList.add('bg-accent-error');
                break;
            default:
                notification.classList.add('bg-blue');
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Utility function to format dates
    function formatRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours} hours ago`;
        return `${days} days ago`;
    }

    // Export functions for external use
    window.StudentDashboard = {
        refresh: initializeStudentDashboard,
        showNotification: showNotification,
        loadData: loadStudentData,
        updateProgress: animateProgressBars
    };

})();
