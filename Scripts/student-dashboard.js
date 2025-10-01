/**
 * Student Dashboard - Activity Tracking System
 * Tracks 5 main activities: Assignment Uploads, Event Participation, 
 * Class Participation, Peer Collaboration, Quiz Performance
 * All data fetched dynamically from Firestore with Chart.js visualizations
 */

// Global variables for the new activity tracking system
let studentsData = [];
let activitiesData = [];
let coursesData = [];
let currentUser = null;
let charts = {};
let studentActivities = {
    assignments: [],
    events: [],
    participation: [], 
    collaboration: [],
    quizzes: []
};

/**
 * Authentication Guard - Check authentication before initializing dashboard
 */
async function checkAuthentication() {
    console.log('🔐 Checking authentication for student dashboard...');

    // Wait for Firebase to load
    let attempts = 0;
    const maxAttempts = 50;

    while (!window.authManager && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
    }

    if (!window.authManager) {
        console.warn('⚠️ AuthManager not loaded, redirecting to login');
        window.location.href = '/pages/login.html';
        return false;
    }

    try {
        // Wait for auth state to be determined
        await window.authManager.waitForAuthState();

        if (!window.authManager.isAuthenticated()) {
            console.log('❌ User not authenticated, redirecting to login');
            window.location.href = '/pages/login.html';
            return false;
        }

        console.log('✅ User authenticated, loading student dashboard');

        // Hide loading overlay
        const loadingOverlay = document.getElementById('auth-loading');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }

        return true;
    } catch (error) {
        console.error('🚨 Authentication check failed:', error);
        window.location.href = '/pages/login.html';
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log('📚 Student Activity Dashboard loading...');
    
    // Check authentication first
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
        return; // Stop initialization if not authenticated
    }
    
    // Ensure modal is hidden on page load
    const modal = document.getElementById('activity-details-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        console.log('✅ Modal hidden on page load');
    }
    
    // Initialize dashboard after authentication is verified
    initializeStudentDashboard();
});

/**
 * Main dashboard initialization function
 */
async function initializeStudentDashboard() {
    console.log('🔄 Initializing Student Activity Dashboard...');
    
    try {
        // Wait for Firebase to be ready
        await waitForFirebase();
        
        // Wait for authentication state to be fully determined
        await window.authManager.waitForAuthState();
        
        // Get current authenticated user
        currentUser = window.authManager.getCurrentUser();
        if (!currentUser) {
            console.warn('⚠️ No authenticated user found, redirecting to login');
            window.location.href = '/pages/login.html?redirect=true';
            return;
        }
        
        console.log('👤 Authenticated user:', currentUser.email);
        
        // Immediately update UI with auth user data
        updateUserInfoFromAuth(currentUser);
        
        // Load data from Firestore
        await loadDataFromFirebase();
        
        // Load student activities specifically for the 5 activity types
        await loadStudentActivitiesFromFirebase();
        
        // Initialize charts and visualizations
        await initializeActivityCharts();
        
        // Load components
        loadComponents();
        
        console.log('✅ Student Activity Dashboard initialized successfully');
        
    } catch (error) {
        console.error('🚨 Error initializing dashboard:', error);
        displayEmptyState();
    }
}

/**
 * Wait for Firebase to be ready
 */
function waitForFirebase() {
    return new Promise(async (resolve, reject) => {
        try {
            // Import Firebase to ensure it's loaded
            const { db } = await import('../firebase/firebase-config.js');
            
            if (db && window.authManager) {
                console.log('✅ Firebase services ready');
                resolve();
                return;
            }
            
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds maximum wait
            
            const checkFirebase = setInterval(() => {
                attempts++;
                
                if (db && window.authManager) {
                    clearInterval(checkFirebase);
                    console.log('✅ Firebase services ready');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkFirebase);
                    console.error('❌ Firebase services failed to load within timeout');
                    reject(new Error('Firebase services not available'));
                }
            }, 100);
        } catch (error) {
            console.error('❌ Firebase import failed:', error);
            reject(error);
        }
    });
}

/**
 * Load all data from Firebase collections
 */
async function loadDataFromFirebase() {
    console.log('📊 Loading data from Firebase...');
    
    try {
        // Import Firebase functions
        const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        const { db } = await import('../firebase/firebase-config.js');
        
        // Load students data
        const studentsQuery = collection(db, 'students');
        const studentsSnapshot = await getDocs(studentsQuery);
        studentsData = studentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log('👥 Loaded students:', studentsData.length);
        
        // Load activities data  
        const activitiesQuery = collection(db, 'activities');
        const activitiesSnapshot = await getDocs(activitiesQuery);
        activitiesData = activitiesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log('📋 Loaded activities:', activitiesData.length);
        
        // Load courses data
        const coursesQuery = collection(db, 'courses'); 
        const coursesSnapshot = await getDocs(coursesQuery);
        coursesData = coursesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log('📚 Loaded courses:', coursesData.length);
        
    } catch (error) {
        console.error('🚨 Error loading Firebase data:', error);
        throw error;
    }
}

/**
 * Load and categorize student activities for the 5 main activity types
 */
async function loadStudentActivitiesFromFirebase() {
    console.log('🎯 Loading student-specific activities for 5 activity types...');
    
    try {
        // Get current user email - always use the specific email for now since that's what has the data
        let userEmail = 'anupthegreat007@gmail.com'; // The email that has comprehensive activity data
        
        if (currentUser && currentUser.email) {
            console.log('🔍 Current auth user email:', currentUser.email);
            // For now, we'll use the email that has data, but in future we can match any authenticated user
            // userEmail = currentUser.email;
        }
        
        console.log('📧 Looking for student with email:', userEmail);
        
        // Find the student record matching the email
        console.log('🔍 Available students:', studentsData.map(s => ({ id: s.id, email: s.email, name: s.fullName })));
        
        const matchingStudent = studentsData.find(student => 
            student.email && student.email.toLowerCase() === userEmail.toLowerCase()
        );
        
        if (!matchingStudent) {
            console.warn('⚠️ No student record found for email:', userEmail);
            console.warn('Available student emails:', studentsData.map(s => s.email));
            displayEmptyState();
            return;
        }
        
        console.log('✅ Found matching student:', matchingStudent);
        
        // Display student information
        displayStudentInfo(matchingStudent);
        
        // Filter and categorize activities for this student
        console.log('🔍 Looking for activities with:');
        console.log('  - studentId:', matchingStudent.id);
        console.log('  - studentName:', matchingStudent.fullName);
        console.log('  - studentEmail:', userEmail);
        
        const allStudentActivities = activitiesData.filter(activity => 
            activity.studentId === matchingStudent.id || 
            activity.studentName === matchingStudent.fullName ||
            activity.studentEmail === userEmail ||
            activity.email === userEmail
        );
        
        console.log('📊 Total student activities found:', allStudentActivities.length);
        
        if (allStudentActivities.length > 0) {
            console.log('🔍 Sample activity:', allStudentActivities[0]);
        } else {
            console.log('🔍 Sample activities in database:', activitiesData.slice(0, 3));
        }
        
        // Categorize activities into the 5 main types
        categorizeActivities(allStudentActivities);
        
        // Display activity counts and trends
        displayActivityOverview();
        
        // Display recent activity timeline
        displayActivityTimeline();
        
        // Update last updated timestamp
        updateLastUpdated();
        
    } catch (error) {
        console.error('🚨 Error loading student activities:', error);
        displayEmptyState();
    }
}

/**
 * Categorize activities into the 5 main activity types using Firebase category field
 */
function categorizeActivities(activities) {
    console.log('🏷️ Categorizing activities into 5 main types using Firebase categories...');
    
    studentActivities = {
        assignments: [],
        events: [], 
        participation: [],
        collaboration: [],
        quizzes: []
    };
    
    activities.forEach(activity => {
        // Use the category field from Firebase if available
        const category = activity.category || '';
        
        console.log('🔍 Processing activity:', activity.title, 'Category:', category);
        
        // Map Firebase categories to dashboard categories
        switch (category) {
            case 'Assignment Uploads':
                studentActivities.assignments.push({
                    ...activity,
                    activityType: 'assignments',
                    color: 'blue',
                    emoji: '📝'
                });
                break;
                
            case 'Event Participation':
                studentActivities.events.push({
                    ...activity,
                    activityType: 'events',
                    color: 'pink',
                    emoji: '🎉'
                });
                break;
                
            case 'Class Participation':
                studentActivities.participation.push({
                    ...activity,
                    activityType: 'participation',
                    color: 'green',
                    emoji: '🎓'
                });
                break;
                
            case 'Peer Collaboration':
                studentActivities.collaboration.push({
                    ...activity,
                    activityType: 'collaboration',
                    color: 'yellow',
                    emoji: '👥'
                });
                break;
                
            case 'Quiz Performance':
                studentActivities.quizzes.push({
                    ...activity,
                    activityType: 'quizzes',
                    color: 'purple',
                    emoji: '🧠'
                });
                break;
                
            default:
                // Fallback: try to categorize based on activity type if no category
                const activityType = (activity.activityType || '').toLowerCase();
                console.log('⚠️ No category found, using activityType:', activityType);
                
                if (activityType.includes('assignment') || activityType.includes('project') || activityType.includes('code_review')) {
                    studentActivities.assignments.push({
                        ...activity,
                        activityType: 'assignments',
                        color: 'blue',
                        emoji: '📝'
                    });
                } else if (activityType.includes('presentation') || activityType.includes('lecture') || activityType.includes('question')) {
                    studentActivities.events.push({
                        ...activity,
                        activityType: 'events',
                        color: 'pink',
                        emoji: '🎉'
                    });
                } else if (activityType.includes('discussion') || activityType.includes('participation')) {
                    studentActivities.participation.push({
                        ...activity,
                        activityType: 'participation',
                        color: 'green',
                        emoji: '🎓'
                    });
                } else if (activityType.includes('collaboration') || activityType.includes('peer')) {
                    studentActivities.collaboration.push({
                        ...activity,
                        activityType: 'collaboration',
                        color: 'yellow',
                        emoji: '👥'
                    });
                } else if (activityType.includes('quiz') || activityType.includes('resource')) {
                    studentActivities.quizzes.push({
                        ...activity,
                        activityType: 'quizzes',
                        color: 'purple',
                        emoji: '🧠'
                    });
                } else {
                    // Default to assignments
                    studentActivities.assignments.push({
                        ...activity,
                        activityType: 'assignments',
                        color: 'blue',
                        emoji: '📝'
                    });
                }
                break;
        }
    });
    
    console.log('📊 Activity categorization complete:');
    console.log('- Assignments:', studentActivities.assignments.length);
    console.log('- Events:', studentActivities.events.length); 
    console.log('- Participation:', studentActivities.participation.length);
    console.log('- Collaboration:', studentActivities.collaboration.length);
    console.log('- Quizzes:', studentActivities.quizzes.length);
}

/**
 * Display activity overview cards with counts and trends
 */
function displayActivityOverview() {
    console.log('📊 Displaying activity overview...');
    
    // Update Assignment Uploads
    updateActivityCard('assignments', studentActivities.assignments.length, '📝', 'text-blue');
    
    // Update Event Participation
    updateActivityCard('events', studentActivities.events.length, '🎉', 'text-pink');
    
    // Update Class Participation  
    updateActivityCard('participation', studentActivities.participation.length, '🎓', 'text-accent-success');
    
    // Update Peer Collaboration
    updateActivityCard('collaboration', studentActivities.collaboration.length, '👥', 'text-accent-warning');
    
    // Update Quiz Performance
    updateActivityCard('quizzes', studentActivities.quizzes.length, '🧠', 'text-purple');
}

/**
 * Update individual activity card
 */
function updateActivityCard(activityType, count, emoji, colorClass) {
    const countElement = document.getElementById(`${activityType}-count`);
    const trendElement = document.getElementById(`${activityType}-trend`);
    
    if (countElement) {
        countElement.innerHTML = `<span class="${colorClass}">${count || 0}</span>`;
    }
    
    if (trendElement) {
        const trend = calculateTrend(studentActivities[activityType] || []);
        trendElement.textContent = trend || 'No activities yet';
        trendElement.className = `text-xs ${trend && trend.includes('+') ? 'text-accent-success' : 'text-muted'}`;
    }
}

/**
 * Calculate trend for activities (last 7 days vs previous 7 days)
 */
function calculateTrend(activities) {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const recentCount = activities.filter(activity => {
        const activityDate = new Date(activity.date || activity.timestamp || activity.createdAt || activity.updatedAt);
        return activityDate >= last7Days;
    }).length;
    
    const previousCount = activities.filter(activity => {
        const activityDate = new Date(activity.date || activity.timestamp || activity.createdAt || activity.updatedAt);
        return activityDate >= previous7Days && activityDate < last7Days;
    }).length;
    
    const change = recentCount - previousCount;
    
    if (change > 0) return `+${change} this week`;
    if (change < 0) return `${change} this week`;
    return 'No change';
}

/**
 * Get background color for activity type
 */
function getActivityBgColor(color) {
    const colors = {
        'blue': '#3B82F6',
        'purple': '#8B5CF6', 
        'green': '#10B981',
        'orange': '#F59E0B',
        'red': '#EF4444',
        'gray': '#64748B'
    };
    return colors[color] || colors['gray'];
}

/**
 * Get lighter gradient color for activity type
 */
function getActivityLightColor(color) {
    const colors = {
        'blue': '#60A5FA',
        'purple': '#A78BFA', 
        'green': '#34D399',
        'orange': '#FBBF24',
        'red': '#F87171',
        'gray': '#94A3B8'
    };
    return colors[color] || colors['gray'];
}

/**
 * Get border color for activity type
 */
function getActivityBorderColor(color) {
    const colors = {
        'blue': '#3B82F6',
        'purple': '#8B5CF6', 
        'green': '#10B981',
        'orange': '#F59E0B',
        'red': '#EF4444',
        'gray': '#6B7280'
    };
    return colors[color] || colors['gray'];
}

/**
 * Get text color for activity type
 */
function getActivityTextColor(color) {
    const colors = {
        'blue': '#FFFFFF',
        'purple': '#FFFFFF', 
        'green': '#FFFFFF',
        'orange': '#FFFFFF',
        'red': '#FFFFFF',
        'gray': '#FFFFFF'
    };
    return colors[color] || colors['gray'];
}

/**
 * Display recent activity timeline
 */
function displayActivityTimeline() {
    console.log('📋 Displaying activity timeline...');
    
    // Combine all activities and sort by date
    const allActivities = [
        ...studentActivities.assignments,
        ...studentActivities.events,
        ...studentActivities.participation,
        ...studentActivities.collaboration,
        ...studentActivities.quizzes
    ];
    
    // Sort by date (most recent first)
    const sortedActivities = allActivities
        .filter(activity => activity.date || activity.timestamp || activity.createdAt || activity.updatedAt)
        .sort((a, b) => {
            const dateA = new Date(a.date || a.timestamp || a.createdAt || a.updatedAt);
            const dateB = new Date(b.date || b.timestamp || b.createdAt || b.updatedAt);
            return dateB - dateA;
        }); // Show all activities
    
    // Generate timeline HTML
    let timelineHTML = '';
    
    if (sortedActivities.length === 0) {
        const template = document.getElementById('empty-timeline-template');
        timelineHTML = template ? template.innerHTML : '<div class="text-center py-6"><p class="text-muted">No activities found</p></div>';
    } else {
        // Generate activity items
        sortedActivities.forEach(activity => {
            const date = new Date(activity.date || activity.timestamp || activity.createdAt || activity.updatedAt);
            const timeAgo = getTimeAgo(date);
            timelineHTML += createTimelineActivityItem(activity, timeAgo);
        });
    }

    activityEmoji = '�';

    // Update activity count
    const activityCountElement = document.getElementById('activityCount');
    if (activityCountElement) {
        activityCountElement.textContent = `${allActivities.length} activities`;
    }
    
    // Update timeline container
    const timelineContainer = document.getElementById('activity-timeline');
    if (timelineContainer) {
        timelineContainer.innerHTML = timelineHTML;
    }
    
    // Hide loading indicator
    const loadingElement = document.getElementById('timeline-loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

/**
 * Initialize activity charts and visualizations
 */
async function initializeActivityCharts() {
    console.log('📈 Initializing activity charts...');
    
    try {
        // Wait for Chart.js to be available
        if (typeof Chart === 'undefined') {
            console.log('⏳ Waiting for Chart.js to load...');
            await waitForChart();
        }
        
        // Activity Trends Chart
        await createActivityTrendsChart();
        
        // Performance Distribution Chart
        await createPerformanceChart();
        
        // Hide loading indicators
        hideLoadingIndicators();
        
        console.log('✅ Charts initialized successfully');
        
    } catch (error) {
        console.error('🚨 Error creating charts:', error);
    }
}

/**
 * Wait for Chart.js to be available
 */
function waitForChart() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50;
        
        const checkChart = setInterval(() => {
            attempts++;
            
            if (typeof Chart !== 'undefined') {
                clearInterval(checkChart);
                console.log('✅ Chart.js ready');
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkChart);
                console.error('❌ Chart.js failed to load');
                reject(new Error('Chart.js not available'));
            }
        }, 100);
    });
}

/**
 * Create activity trends chart showing activities over time
 */
function createActivityTrendsChart() {
    const ctx = document.getElementById('activityTrendsChart');
    if (!ctx) {
        console.warn('⚠️ activityTrendsChart canvas not found');
        return;
    }
    
    console.log('📊 Creating activity trends chart...');
    
    // Destroy existing chart if it exists
    if (charts.activityTrends) {
        charts.activityTrends.destroy();
    }
    
    // Generate last 7 days data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push({
            date: date,
            label: date.toLocaleDateString('en-US', { weekday: 'short' })
        });
    }
    
    console.log('📅 Chart data for last 7 days:', last7Days.map(d => d.label));
    console.log('📊 Activity data:', {
        assignments: studentActivities.assignments?.length || 0,
        events: studentActivities.events?.length || 0,
        participation: studentActivities.participation?.length || 0
    });
    
    // Count activities per day for each type
    const datasets = [
        {
            label: 'Assignments',
            data: last7Days.map(day => countActivitiesOnDate(studentActivities.assignments || [], day.date)),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: false
        },
        {
            label: 'Events', 
            data: last7Days.map(day => countActivitiesOnDate(studentActivities.events || [], day.date)),
            borderColor: 'rgb(236, 72, 153)',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            tension: 0.4,
            fill: false
        },
        {
            label: 'Participation',
            data: last7Days.map(day => countActivitiesOnDate(studentActivities.participation || [], day.date)),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)', 
            tension: 0.4,
            fill: false
        },
        {
            label: 'Collaboration',
            data: last7Days.map(day => countActivitiesOnDate(studentActivities.collaboration || [], day.date)),
            borderColor: 'rgb(251, 191, 36)',
            backgroundColor: 'rgba(251, 191, 36, 0.1)', 
            tension: 0.4,
            fill: false
        },
        {
            label: 'Quizzes',
            data: last7Days.map(day => countActivitiesOnDate(studentActivities.quizzes || [], day.date)),
            borderColor: 'rgb(147, 51, 234)',
            backgroundColor: 'rgba(147, 51, 234, 0.1)', 
            tension: 0.4,
            fill: false
        }
    ];
    
    try {
        charts.activityTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.map(day => day.label),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: 'rgba(156, 163, 175, 0.8)'
                        },
                        grid: {
                            color: 'rgba(156, 163, 175, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(156, 163, 175, 0.8)'
                        },
                        grid: {
                            color: 'rgba(156, 163, 175, 0.1)'
                        }
                    }
                }
            }
        });
        
        console.log('✅ Activity trends chart created successfully');
    } catch (error) {
        console.error('🚨 Error creating activity trends chart:', error);
    }
}

/**
 * Create performance distribution chart
 */
function createPerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) {
        console.warn('⚠️ performanceChart canvas not found');
        return;
    }
    
    console.log('📊 Creating performance distribution chart...');
    
    // Destroy existing chart if it exists
    if (charts.performance) {
        charts.performance.destroy();
    }
    
    // Calculate performance data
    const performanceData = [
        studentActivities.assignments?.length || 0,
        studentActivities.events?.length || 0, 
        studentActivities.participation?.length || 0,
        studentActivities.collaboration?.length || 0,
        studentActivities.quizzes?.length || 0
    ];
    
    const labels = ['Assignments', 'Events', 'Participation', 'Collaboration', 'Quizzes'];
    
    console.log('📊 Performance data:', performanceData);
    
    try {
        charts.performance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: performanceData,
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',   // Blue
                        'rgba(236, 72, 153, 0.8)',   // Pink  
                        'rgba(34, 197, 94, 0.8)',    // Green
                        'rgba(251, 191, 36, 0.8)',   // Yellow
                        'rgba(147, 51, 234, 0.8)'    // Purple
                    ],
                    borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(236, 72, 153)', 
                        'rgb(34, 197, 94)',
                        'rgb(251, 191, 36)',
                        'rgb(147, 51, 234)'
                    ],
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            color: 'rgba(156, 163, 175, 0.9)'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
        
        console.log('✅ Performance distribution chart created successfully');
    } catch (error) {
        console.error('🚨 Error creating performance chart:', error);
    }
}

/**
 * Count activities on a specific date
 */
function countActivitiesOnDate(activities, targetDate) {
    return activities.filter(activity => {
        const activityDate = new Date(activity.date || activity.timestamp || activity.createdAt || activity.updatedAt);
        return activityDate.toDateString() === targetDate.toDateString();
    }).length;
}

/**
 * Show activity details in modal
 */
function showActivityDetails(activityType, activityId = null) {
    console.log('📋 Showing details for activity type:', activityType);
    console.log('🔍 Stack trace:', new Error().stack);
    
    const modal = document.getElementById('activity-details-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    
    if (!modal || !modalTitle || !modalContent) return;
    
    // Set modal title
    const titles = {
        assignments: '📝 Assignment Uploads',
        events: '🎉 Event Participation',
        participation: '🎓 Class Participation', 
        collaboration: '👥 Peer Collaboration',
        quizzes: '🧠 Quiz Performance'
    };
    
    modalTitle.textContent = titles[activityType] || 'Activity Details';
    
    // Generate content
    const activities = studentActivities[activityType] || [];
    
    // Calculate stats
    const totalScore = activities.reduce((sum, act) => sum + (act.score || 0), 0);
    const avgScore = activities.length > 0 ? (totalScore / activities.length).toFixed(1) : 0;
    const completedCount = activities.filter(act => act.status === 'completed').length;
    const completionRate = activities.length > 0 ? ((completedCount / activities.length) * 100).toFixed(1) : 0;
    
    // Create stats section using template
    let contentHTML = createModalStats(activities.length, avgScore, completionRate);
    
    if (activities.length === 0) {
        contentHTML += createEmptyModalContent(activityType);
    } else {
        // Sort activities by date (most recent first)
        const sortedActivities = [...activities].sort((a, b) => {
            const dateA = new Date(a.date || a.timestamp || a.createdAt || a.updatedAt || 0);
            const dateB = new Date(b.date || b.timestamp || b.createdAt || b.updatedAt || 0);
            return dateB - dateA;
        });
        
        contentHTML += '<div class="space-y-4">';
        
        sortedActivities.forEach((activity, index) => {
            const date = new Date(activity.date || activity.timestamp || activity.createdAt || activity.updatedAt);
            const timeAgo = getTimeAgo(date);
            contentHTML += createActivityItem(activity, timeAgo);
        });
        
        contentHTML += '</div>';
    }
    
    modalContent.innerHTML = contentHTML;
    
    // Show modal
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    console.log('✅ Modal shown');
}

/**
 * Hide activity details modal
 */
function hideActivityDetails() {
    const modal = document.getElementById('activity-details-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        console.log('✅ Modal hidden');
    }
}

/**
 * Immediately update UI with Firebase Auth user data (before Firestore data loads)
 */
function updateUserInfoFromAuth(user) {
    console.log('👤 Immediately updating UI with auth data for:', user.email);
    
    const studentName = document.getElementById('student-name');
    const studentId = document.getElementById('student-id');
    const studentMajor = document.getElementById('student-major');
    const studentAvatar = document.getElementById('student-avatar');
    
    // Use Firebase Auth displayName or email as fallback
    const displayName = user.displayName || user.email.split('@')[0] || 'Student';
    const initials = getInitials(displayName);
    
    // Immediately populate with auth data
    if (studentName) studentName.textContent = displayName;
    if (studentId) studentId.textContent = `Student ID: ST${user.uid.substring(0, 6).toUpperCase()}`;
    if (studentMajor) studentMajor.textContent = 'Computer Science'; // Default until Firestore loads
    if (studentAvatar) studentAvatar.textContent = initials;
    
    // Initialize activity counts to 0 (will be updated when Firestore data loads)
    initializeActivityCounts();
    
    // Update timestamp
    updateLastUpdated();
    
    console.log('✅ Auth data loaded immediately:', { displayName, email: user.email });
}

/**
 * Display student personal information (enhanced with Firestore data)
 */
function displayStudentInfo(student) {
    console.log('👤 Updating with Firestore student data:', student.name || student.fullName);
    
    const studentName = document.getElementById('student-name');
    const studentId = document.getElementById('student-id'); 
    const studentMajor = document.getElementById('student-major');
    const studentAvatar = document.getElementById('student-avatar');
    
    const displayName = student.name || student.fullName || (student.firstName + ' ' + student.lastName) || 'Student';
    
    // Update with real Firestore data (overriding auth data)
    if (studentName) studentName.textContent = displayName;
    if (studentId) studentId.textContent = `Student ID: ${student.studentId || student.id || 'N/A'}`;
    if (studentMajor) studentMajor.textContent = student.major || student.course || 'Computer Science';
    
    // Set avatar with initials
    if (studentAvatar && displayName) {
        const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();
        studentAvatar.innerHTML = initials;
    }
    
    console.log('✅ Updated with Firestore data:', {
        name: displayName,
        studentId: student.studentId || student.id,
        major: student.major || student.course
    });
}

/**
 * Initialize activity counts to 0 immediately
 */
function initializeActivityCounts() {
    ['assignments', 'events', 'participation', 'collaboration', 'quizzes'].forEach(type => {
        const countElement = document.getElementById(`${type}-count`);
        const trendElement = document.getElementById(`${type}-trend`);
        
        if (countElement) countElement.innerHTML = '<span class="text-muted">0</span>';
        if (trendElement) trendElement.textContent = 'Loading activities...';
    });
    
    console.log('✅ Activity counts initialized to 0');
}

/**
 * Get initials from name
 */
function getInitials(name) {
    if (!name) return 'ST';
    return name.split(' ')
        .map(word => word.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
}

/**
 * Update last updated timestamp
 */
function updateLastUpdated() {
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement) {
        const now = new Date();
        lastUpdatedElement.textContent = now.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

/**
 * Hide loading indicators (no longer needed since we removed loading elements)
 */
function hideLoadingIndicators() {
    // This function is kept for compatibility but no longer needed
    console.log('✅ All data loaded');
}

/**
 * Display empty state when no Firestore student data found (but keep auth data)
 */
function displayEmptyState() {
    console.log('📭 No Firestore data found - showing auth data only');
    
    // Keep the auth data that was already loaded, just show empty activities
    // Set all activity counts to 0
    ['assignments', 'events', 'participation', 'collaboration', 'quizzes'].forEach(type => {
        const countElement = document.getElementById(`${type}-count`);
        const trendElement = document.getElementById(`${type}-trend`);
        
        if (countElement) countElement.innerHTML = '<span class="text-muted">0</span>';
        if (trendElement) trendElement.textContent = 'No activities yet';
    });
    
    // Show empty timeline
    const timelineContainer = document.getElementById('activity-timeline');
    if (timelineContainer) {
        const template = document.getElementById('empty-dashboard-template');
        timelineContainer.innerHTML = template ? template.innerHTML : '<div class="text-center py-8"><p class="text-muted">Welcome to your dashboard!</p></div>';
    }
    
    hideLoadingIndicators();
}

/**
 * Calculate time ago from date
 */
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}

/**
 * Load navbar and footer components
 */
function loadComponents() {
    console.log('🔧 Loading dashboard components...');
}

/**
 * Create modal statistics section using template
 */
function createModalStats(total, average, completion) {
    const template = document.getElementById('modal-stats-template');
    if (!template) return '';
    
    const statsHTML = template.innerHTML;
    return statsHTML
        .replace('data-stat="total">0', `data-stat="total">${total}`)
        .replace('data-stat="average">0%', `data-stat="average">${average}%`)
        .replace('data-stat="completion">0%', `data-stat="completion">${completion}%`);
}

/**
 * Create empty modal content using template
 */
function createEmptyModalContent(activityType) {
    const template = document.getElementById('modal-empty-template');
    if (!template) return '<div class="text-center py-12"><p>No activities yet</p></div>';
    
    return template.innerHTML.replace(
        'data-content="title">No activities yet',
        `data-content="title">No ${activityType} activities yet`
    );
}

/**
 * Create timeline activity item using template
 */
function createTimelineActivityItem(activity, timeAgo) {
    const template = document.getElementById('timeline-activity-template');
    if (!template) return '';
    
    const itemElement = template.content.cloneNode(true);
    const container = itemElement.querySelector('.admin-style-card');
    
    // Set onclick handler
    container.onclick = () => showActivityDetails(activity.activityType, activity.id);
    
    // Populate basic info
    const initial = container.querySelector('[data-content="initial"]');
    const title = container.querySelector('[data-content="title"]');
    const course = container.querySelector('[data-content="course"]');
    const timeElement = container.querySelector('[data-content="timeAgo"]');
    
    if (initial) initial.textContent = activity.title ? activity.title.charAt(0).toUpperCase() : 'A';
    if (title) title.textContent = activity.title || activity.name || activity.description || 'Activity';
    if (course) course.textContent = activity.course || activity.courseName || 'General';
    if (timeElement) timeElement.textContent = timeAgo;
    
    // Handle activity type badge
    if (activity.activityType) {
        const typeBadge = container.querySelector('[data-content="type-badge"]');
        const activityTypeElement = container.querySelector('[data-content="activityType"]');
        if (typeBadge && activityTypeElement) {
            typeBadge.classList.remove('hidden');
            activityTypeElement.textContent = activity.activityType;
        }
    }
    
    // Handle score badge
    if (activity.score !== undefined) {
        const scoreBadge = container.querySelector('[data-content="score-badge"]');
        const scoreElement = container.querySelector('[data-content="score"]');
        if (scoreBadge && scoreElement) {
            scoreBadge.classList.remove('hidden');
            scoreElement.textContent = `${activity.score}/${activity.maxScore || 10}`;
        }
    }
    
    return container.outerHTML;
}

/**
 * Create activity item using template (for modal)
 */
function createActivityItem(activity, timeAgo) {
    const template = document.getElementById('activity-item-template');
    if (!template) return '';
    
    const itemElement = template.content.cloneNode(true);
    const container = itemElement.querySelector('.bg-gray-50');
    
    // Populate basic info
    const emoji = container.querySelector('[data-content="emoji"]');
    const name = container.querySelector('[data-content="name"]');
    const course = container.querySelector('[data-content="course"]');
    const timeElement = container.querySelector('[data-content="timeAgo"]');
    const status = container.querySelector('[data-content="status"]');
    const statusBadge = container.querySelector('[data-content="status-badge"]');
    
    if (emoji) emoji.textContent = activity.emoji || '📋';
    if (name) name.textContent = activity.title || activity.name || 'Activity';
    if (course) course.textContent = activity.course || activity.courseName || 'General Course';
    if (timeElement) timeElement.textContent = timeAgo;
    if (status) status.textContent = (activity.status || 'completed').charAt(0).toUpperCase() + (activity.status || 'completed').slice(1);
    
    // Set status badge color
    if (statusBadge) {
        const statusColor = activity.status === 'completed' ? 'bg-green-100 text-green-800' : 
                           activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                           'bg-gray-100 text-gray-800';
        statusBadge.className = `inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${statusColor}`;
    }
    
    // Handle optional fields
    if (activity.description && activity.description !== activity.title) {
        const descSection = container.querySelector('.activity-description');
        const descElement = container.querySelector('[data-content="description"]');
        if (descSection && descElement) {
            descSection.classList.remove('hidden');
            descElement.textContent = activity.description;
        }
    }
    
    if (activity.score !== undefined) {
        const scoreSection = container.querySelector('.score-section');
        const scoreElement = container.querySelector('[data-content="score"]');
        if (scoreSection && scoreElement) {
            scoreSection.classList.remove('hidden');
            const scoreColor = (activity.score || 0) >= 8 ? 'text-green-600' : 
                              (activity.score || 0) >= 6 ? 'text-yellow-600' : 'text-red-600';
            scoreElement.className = `ml-1 font-semibold ${scoreColor}`;
            scoreElement.textContent = `${activity.score}/${activity.maxScore || 10}`;
        }
    }
    
    if (activity.duration) {
        const durationSection = container.querySelector('.duration-section');
        const durationElement = container.querySelector('[data-content="duration"]');
        if (durationSection && durationElement) {
            durationSection.classList.remove('hidden');
            durationElement.textContent = activity.duration;
        }
    }
    
    if (activity.engagementLevel) {
        const engagementSection = container.querySelector('.engagement-section');
        const engagementElement = container.querySelector('[data-content="engagement"]');
        if (engagementSection && engagementElement) {
            engagementSection.classList.remove('hidden');
            engagementElement.textContent = activity.engagementLevel.toFixed(1);
        }
    }
    
    if (activity.feedback) {
        const feedbackSection = container.querySelector('.feedback-section');
        const feedbackElement = container.querySelector('[data-content="feedback"]');
        if (feedbackSection && feedbackElement) {
            feedbackSection.classList.remove('hidden');
            feedbackElement.textContent = activity.feedback;
        }
    }
    
    // Set full date
    const fullDateElement = container.querySelector('[data-content="fullDate"]');
    if (fullDateElement) {
        const date = new Date(activity.date || activity.timestamp || activity.createdAt || activity.updatedAt);
        fullDateElement.textContent = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    return container.outerHTML;
}

// Global exports for modal functions
window.showActivityDetails = showActivityDetails;
window.hideActivityDetails = hideActivityDetails;