// Student Dashboard functionality
(function() {
    'use strict';

    // Initialize dashboard when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        initializeStudentDashboard();
    });

    function initializeStudentDashboard() {
        console.log('Initializing Student Dashboard...');
        
        // Initialize various dashboard components
        animateProgressBars();
        animateStatCards();
        initializeInteractiveElements();
        loadStudentData();
        setupRealTimeUpdates();
        initializeQuickActions();
        
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
        // In a real application, this would fetch data from an API
        const mockStudentData = {
            name: 'Alex Johnson',
            studentId: 'ST2024001',
            email: 'alex.johnson@university.edu',
            semester: 'Fall 2024',
            year: 'Junior',
            major: 'Computer Science',
            gpa: 3.7,
            courses: [
                {
                    name: 'Advanced Mathematics',
                    professor: 'Prof. Sarah Wilson',
                    progress: 87,
                    grade: 'A-'
                },
                {
                    name: 'Quantum Physics',
                    professor: 'Prof. Michael Chen', 
                    progress: 92,
                    grade: 'A'
                },
                {
                    name: 'Data Structures & Algorithms',
                    professor: 'Prof. Emma Rodriguez',
                    progress: 95,
                    grade: 'A+'
                }
            ]
        };

        // Update student name if element exists
        const studentNameElement = document.getElementById('student-name');
        if (studentNameElement) {
            studentNameElement.textContent = mockStudentData.name;
        }

        // You can extend this to populate other dashboard elements
        console.log('Student data loaded:', mockStudentData);
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
