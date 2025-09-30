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

document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 Student Activity Dashboard loading...');
    
    // Ensure modal is hidden on page load
    const modal = document.getElementById('activity-details-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        console.log('✅ Modal hidden on page load');
    }
    
    // Initialize dashboard immediately since auth is already verified
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
    return new Promise((resolve, reject) => {
        if (window.db && window.authManager) {
            resolve();
            return;
        }
        
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds maximum wait
        
        const checkFirebase = setInterval(() => {
            attempts++;
            
            if (window.db && window.authManager) {
                clearInterval(checkFirebase);
                console.log('✅ Firebase services ready');
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkFirebase);
                console.error('❌ Firebase services failed to load within timeout');
                reject(new Error('Firebase services not available'));
            }
        }, 100);
    });
}

/**
 * Load all data from Firebase collections
 */
async function loadDataFromFirebase() {
    console.log('📊 Loading data from Firebase...');
    
    try {
        // Load students data
        const studentsQuery = window.db.collection('students');
        const studentsSnapshot = await studentsQuery.get();
        studentsData = studentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log('👥 Loaded students:', studentsData.length);
        
        // Load activities data  
        const activitiesQuery = window.db.collection('activities');
        const activitiesSnapshot = await activitiesQuery.get();
        activitiesData = activitiesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log('📋 Loaded activities:', activitiesData.length);
        
        // Load courses data
        const coursesQuery = window.db.collection('courses'); 
        const coursesSnapshot = await coursesQuery.get();
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
        // Get current user email
        let userEmail = null;
        if (currentUser && currentUser.email) {
            userEmail = currentUser.email;
        } else {
            userEmail = 'anupthegreat007@gmail.com'; // Your specific email
        }
        
        console.log('📧 Looking for student with email:', userEmail);
        
        // Find the student record matching the email
        const matchingStudent = studentsData.find(student => 
            student.email && student.email.toLowerCase() === userEmail.toLowerCase()
        );
        
        if (!matchingStudent) {
            console.warn('⚠️ No student record found for email:', userEmail);
            displayEmptyState();
            return;
        }
        
        console.log('✅ Found matching student:', matchingStudent);
        
        // Display student information
        displayStudentInfo(matchingStudent);
        
        // Filter and categorize activities for this student
        const allStudentActivities = activitiesData.filter(activity => 
            activity.studentId === matchingStudent.id || 
            activity.studentName === matchingStudent.name ||
            activity.email === userEmail
        );
        
        console.log('📊 Total student activities found:', allStudentActivities.length);
        
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
 * Categorize activities into the 5 main activity types
 */
function categorizeActivities(activities) {
    console.log('🏷️ Categorizing activities into 5 main types...');
    
    studentActivities = {
        assignments: [],
        events: [], 
        participation: [],
        collaboration: [],
        quizzes: []
    };
    
    activities.forEach(activity => {
        const type = (activity.type || activity.category || activity.activityType || '').toLowerCase();
        const title = (activity.title || activity.name || activity.description || '').toLowerCase();
        
        // Assignment Uploads
        if (type.includes('assignment') || type.includes('upload') || type.includes('homework') ||
            title.includes('assignment') || title.includes('homework') || title.includes('project') || title.includes('upload')) {
            studentActivities.assignments.push({
                ...activity,
                activityType: 'assignments',
                color: 'blue',
                emoji: '📝'
            });
        }
        // Event Participation  
        else if (type.includes('event') || type.includes('seminar') || type.includes('workshop') || type.includes('conference') ||
                 title.includes('event') || title.includes('seminar') || title.includes('workshop') || title.includes('conference')) {
            studentActivities.events.push({
                ...activity,
                activityType: 'events',
                color: 'pink',
                emoji: '🎉'
            });
        }
        // Class Participation
        else if (type.includes('participation') || type.includes('attendance') || type.includes('class') || type.includes('discussion') ||
                 title.includes('participation') || title.includes('attendance') || title.includes('discussion') || title.includes('class')) {
            studentActivities.participation.push({
                ...activity,
                activityType: 'participation',
                color: 'green',
                emoji: '🎓'
            });
        }
        // Peer Collaboration
        else if (type.includes('collaboration') || type.includes('group') || type.includes('peer') || type.includes('team') ||
                 title.includes('collaboration') || title.includes('group') || title.includes('peer') || title.includes('team')) {
            studentActivities.collaboration.push({
                ...activity,
                activityType: 'collaboration',
                color: 'yellow',
                emoji: '👥'
            });
        }
        // Quiz Performance
        else if (type.includes('quiz') || type.includes('test') || type.includes('exam') || type.includes('assessment') ||
                 title.includes('quiz') || title.includes('test') || title.includes('exam') || title.includes('assessment')) {
            studentActivities.quizzes.push({
                ...activity,
                activityType: 'quizzes',
                color: 'purple',
                emoji: '🧠'
            });
        }
        // Default to assignments if unclear
        else {
            studentActivities.assignments.push({
                ...activity,
                activityType: 'assignments',
                color: 'blue',
                emoji: '📝'
            });
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
        })
        .slice(0, 10); // Show last 10 activities
    
    // Generate timeline HTML
    let timelineHTML = '';
    
    if (sortedActivities.length === 0) {
        timelineHTML = `
            <div class="text-center py-8">
                <div class="text-4xl mb-2">📭</div>
                <p class="text-muted">No recent activities found</p>
                <p class="text-sm text-muted">Start participating in activities to see them here!</p>
            </div>
        `;
    } else {
        sortedActivities.forEach(activity => {
            const date = new Date(activity.date || activity.timestamp || activity.createdAt || activity.updatedAt);
            const timeAgo = getTimeAgo(date);
            
            timelineHTML += `
                <div class="flex items-center gap-3 p-3 bg-${activity.color}/5 rounded-lg hover:bg-${activity.color}/10 transition-colors cursor-pointer" 
                     onclick="showActivityDetails('${activity.activityType}', '${activity.id}')">
                    <div class="w-3 h-3 bg-${activity.color} rounded-full flex-shrink-0"></div>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-text flex items-center gap-2">
                            ${activity.emoji} ${activity.title || activity.name || activity.description || 'Activity'}
                        </p>
                        <p class="text-xs text-muted">${activity.course || activity.courseName || 'General'} • ${timeAgo}</p>
                        ${activity.score !== undefined ? `<p class="text-xs text-${activity.color}">Score: ${activity.score}%</p>` : ''}
                    </div>
                </div>
            `;
        });
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
        // Activity Trends Chart
        await createActivityTrendsChart();
        
        // Performance Distribution Chart
        await createPerformanceChart();
        
        // Hide loading indicators
        hideLoadingIndicators();
        
    } catch (error) {
        console.error('🚨 Error creating charts:', error);
    }
}

/**
 * Create activity trends chart showing activities over time
 */
function createActivityTrendsChart() {
    const ctx = document.getElementById('activityTrendsChart');
    if (!ctx) return;
    
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
    
    // Count activities per day for each type
    const datasets = [
        {
            label: 'Assignments',
            data: last7Days.map(day => countActivitiesOnDate(studentActivities.assignments, day.date)),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
        },
        {
            label: 'Events', 
            data: last7Days.map(day => countActivitiesOnDate(studentActivities.events, day.date)),
            borderColor: 'rgb(236, 72, 153)',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            tension: 0.4
        },
        {
            label: 'Participation',
            data: last7Days.map(day => countActivitiesOnDate(studentActivities.participation, day.date)),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)', 
            tension: 0.4
        }
    ];
    
    charts.activityTrends = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days.map(day => day.label),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

/**
 * Create performance distribution chart
 */
function createPerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    // Calculate performance data
    const performanceData = [
        studentActivities.assignments.length,
        studentActivities.events.length, 
        studentActivities.participation.length,
        studentActivities.collaboration.length,
        studentActivities.quizzes.length
    ];
    
    charts.performance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Assignments', 'Events', 'Participation', 'Collaboration', 'Quizzes'],
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
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
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
    
    let contentHTML = `
        <div class="mb-4">
            <p class="text-lg font-semibold">Total Activities: ${activities.length}</p>
        </div>
    `;
    
    if (activities.length === 0) {
        contentHTML += `
            <div class="text-center py-8">
                <div class="text-6xl mb-4">📭</div>
                <p class="text-muted text-lg">No ${activityType} activities yet</p>
                <p class="text-sm text-muted mt-2">Start participating to see activities here!</p>
            </div>
        `;
    } else {
        contentHTML += '<div class="space-y-3">';
        
        activities.forEach(activity => {
            const date = new Date(activity.date || activity.timestamp || activity.createdAt || activity.updatedAt);
            
            contentHTML += `
                <div class="p-4 border border-border-primary rounded-lg">
                    <h4 class="font-medium text-text">${activity.title || activity.name || activity.description || 'Activity'}</h4>
                    <p class="text-sm text-muted mt-1">${activity.course || activity.courseName || 'General Course'}</p>
                    <p class="text-sm text-muted">${date.toLocaleDateString()}</p>
                    ${activity.score !== undefined ? `<p class="text-sm font-medium mt-2">Score: ${activity.score}%</p>` : ''}
                    ${activity.description && activity.description !== activity.title ? `<p class="text-sm mt-2">${activity.description}</p>` : ''}
                    ${activity.feedback ? `<p class="text-sm mt-2 text-blue-600">Feedback: ${activity.feedback}</p>` : ''}
                </div>
            `;
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
        timelineContainer.innerHTML = `
            <div class="text-center py-8">
                <div class="text-4xl mb-2">🎓</div>
                <p class="text-muted">Welcome to your activity dashboard!</p>
                <p class="text-sm text-muted">Start participating in activities to see your progress here.</p>
            </div>
        `;
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

// Global exports for modal functions
window.showActivityDetails = showActivityDetails;
window.hideActivityDetails = hideActivityDetails;