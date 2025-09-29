// Enhanced Teacher Dashboard with Advanced Analytics and DSA Integration
// Import DSA algorithms
let engagementAnalyzer, predictiveAnalyzer, recommendationEngine;
let currentUser = null;
let teacherData = null;

// Load DSA modules
document.addEventListener('DOMContentLoaded', async () => {
    // Load DSA algorithms
    await loadDSAModules();
    
    // Simple authentication check - no role requirements
    const authResult = await AuthUtils.requireAuth();
    
    if (authResult) {
        const { user } = authResult;
        currentUser = user;
        console.log('Initializing Enhanced Teacher Dashboard for user:', user.email);
        
        // Get full user profile for additional data
        const userProfile = await window.authManager.getUserProfile(user.uid);
        await initializeTeacherDashboard(user, userProfile);
    }
});

async function loadDSAModules() {
    try {
        // Load all DSA algorithms
        if (typeof EngagementAnalyzer !== 'undefined') {
            engagementAnalyzer = new EngagementAnalyzer();
            console.log('Engagement Analyzer loaded');
        }
        
        if (typeof PredictiveEngagementAnalyzer !== 'undefined') {
            predictiveAnalyzer = new PredictiveEngagementAnalyzer();
            console.log('Predictive Analyzer loaded');
        }
        
        if (typeof RecommendationEngine !== 'undefined') {
            recommendationEngine = new RecommendationEngine();
            console.log('Recommendation Engine loaded');
        }
        
        // Initialize with sample data for demonstration
        await initializeSampleTeacherData();
        
    } catch (error) {
        console.error('Error loading DSA modules:', error);
        // Continue without DSA features
    }
}

async function initializeSampleTeacherData() {
    if (!engagementAnalyzer) return;
    
    // Generate comprehensive sample data for teacher's classes
    const students = [
        'alice_johnson', 'bob_smith', 'carol_davis', 'david_wilson', 'emma_brown',
        'frank_miller', 'grace_lee', 'henry_garcia', 'iris_chen', 'jack_taylor',
        'kate_anderson', 'liam_thomas', 'maya_rodriguez', 'noah_white', 'olivia_martin'
    ];
    
    const activityTypes = ['assignment_submission', 'quiz_completion', 'discussion_participation', 
                          'lecture_attendance', 'peer_collaboration', 'resource_access', 'question_asking'];
    
    // Generate activities for each student over the last 30 days
    students.forEach(studentId => {
        const numActivities = Math.floor(Math.random() * 25) + 15; // 15-40 activities per student
        
        for (let i = 0; i < numActivities; i++) {
            const activity = {
                studentId: studentId,
                type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
                timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
                quality: Math.floor(Math.random() * 40) + 60, // 60-100 quality score
                score: Math.floor(Math.random() * 7) + 3, // 3-10 score
                duration: Math.floor(Math.random() * 120) + 10 // 10-130 minutes
            };
            
            engagementAnalyzer.addStudentActivity(studentId, activity);
        }
        
        // Add to other analyzers
        if (predictiveAnalyzer) {
            predictiveAnalyzer.analyzeStudentPatterns(studentId);
        }
        if (recommendationEngine) {
            recommendationEngine.addStudentInteraction(studentId, 'course_material', 0.8);
        }
    });
    
    console.log('Sample teacher data initialized for', students.length, 'students');
}

async function initializeTeacherDashboard(user, userProfile) {
    // Set teacher name
    document.getElementById('teacher-name').textContent = userProfile.displayName || user.displayName || 'Teacher';
    
    // Initialize enhanced dashboard components with analytics
    await Promise.all([
        loadEnhancedDashboardStats(),
        loadAdvancedStudentActivity(),
        loadAnalyticsClassList(),
        loadIntelligentAlerts(),
        initializeAdvancedEngagementChart(),
        loadClassroomAnalytics(),
        loadStudentPerformanceMetrics(),
        loadEngagementPredictions()
    ]);
    
    // Setup enhanced event listeners
    setupAdvancedEventListeners();
    
    // Initialize real-time updates
    initializeRealTimeTeacherUpdates();
    
    console.log('Enhanced Teacher Dashboard fully initialized');
}

async function loadDashboardStats() {
    try {
        // Simulate loading stats - replace with actual Firebase queries
        const stats = await getDashboardStats();
        
        document.getElementById('total-students').textContent = stats.totalStudents;
        document.getElementById('active-classes').textContent = stats.activeClasses;
        document.getElementById('avg-engagement').textContent = `${stats.avgEngagement}%`;
        document.getElementById('pending-reviews').textContent = stats.pendingReviews;
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        AuthUtils.showToast('Failed to load dashboard statistics', 'error');
    }
}

async function getDashboardStats() {
    // This would typically fetch from Firebase
    // For now, return mock data
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    return {
        totalStudents: Math.floor(Math.random() * 150) + 50,
        activeClasses: Math.floor(Math.random() * 8) + 3,
        avgEngagement: Math.floor(Math.random() * 30) + 70,
        pendingReviews: Math.floor(Math.random() * 15) + 5
    };
}

async function loadStudentActivity() {
    try {
        const activityContainer = document.getElementById('student-activity');
        const activities = await getRecentActivity();
        
        if (activities.length === 0) {
            activityContainer.innerHTML = `
                <div class="text-center py-8 text-secondary">
                    <div class="text-4xl mb-3">📊</div>
                    <p>No recent student activity</p>
                </div>
            `;
            return;
        }
        
        activityContainer.innerHTML = activities.map(activity => `
            <div class="flex items-center justify-between p-4 bg-tertiary rounded-lg">
                <div class="flex items-center gap-3">
                    <div class="text-2xl">${getActivityIcon(activity.type)}</div>
                    <div>
                        <p class="font-medium">${activity.studentName}</p>
                        <p class="text-sm text-secondary">${activity.description}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm text-muted">${formatTime(activity.timestamp)}</p>
                    <span class="badge badge-${getActivityBadgeColor(activity.type)}">${activity.type}</span>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading student activity:', error);
        document.getElementById('student-activity').innerHTML = `
            <div class="text-center py-8 text-error">
                <p>Failed to load student activity</p>
            </div>
        `;
    }
}

async function getRecentActivity() {
    // This would typically fetch from Firebase
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const activities = [
        {
            studentName: 'Alice Johnson',
            description: 'Completed Assignment: Data Structures Quiz',
            type: 'assignment',
            timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        },
        {
            studentName: 'Bob Smith',
            description: 'Participated in Discussion: Algorithm Complexity',
            type: 'discussion',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
            studentName: 'Carol Davis',
            description: 'Submitted Quiz: Binary Trees',
            type: 'quiz',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
        },
        {
            studentName: 'David Wilson',
            description: 'Viewed Lecture: Graph Algorithms',
            type: 'lecture',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
        }
    ];
    
    return activities;
}

function getActivityIcon(type) {
    const icons = {
        assignment: '📝',
        quiz: '📋',
        discussion: '💬',
        lecture: '🎥',
        default: '📊'
    };
    return icons[type] || icons.default;
}

function getActivityBadgeColor(type) {
    const colors = {
        assignment: 'primary',
        quiz: 'secondary',
        discussion: 'success',
        lecture: 'warning',
        default: 'primary'
    };
    return colors[type] || colors.default;
}

function formatTime(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

async function loadClassList() {
    try {
        const classContainer = document.getElementById('class-list');
        const classes = await getTeacherClasses();
        
        if (classes.length === 0) {
            classContainer.innerHTML = `
                <div class="text-center py-4 text-secondary">
                    <div class="text-3xl mb-2">📚</div>
                    <p class="text-sm">No classes assigned</p>
                </div>
            `;
            return;
        }
        
        classContainer.innerHTML = classes.map(cls => `
            <div class="flex items-center justify-between p-3 bg-hover rounded-lg">
                <div>
                    <p class="font-medium">${cls.name}</p>
                    <p class="text-sm text-secondary">${cls.students} students</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="badge badge-${cls.status === 'active' ? 'success' : 'warning'}">${cls.status}</span>
                    <button class="btn btn-ghost btn-sm" onclick="viewClass('${cls.id}')">View</button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading class list:', error);
    }
}

async function getTeacherClasses() {
    // This would typically fetch from Firebase
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return [
        { id: '1', name: 'Data Structures & Algorithms', students: 45, status: 'active' },
        { id: '2', name: 'Computer Networks', students: 38, status: 'active' },
        { id: '3', name: 'Database Systems', students: 42, status: 'active' },
        { id: '4', name: 'Software Engineering', students: 35, status: 'paused' }
    ];
}

async function loadAlerts() {
    try {
        const alertsContainer = document.getElementById('alerts-list');
        const alerts = await getRecentAlerts();
        
        if (alerts.length === 0) {
            alertsContainer.innerHTML = `
                <div class="text-center py-4 text-secondary">
                    <div class="text-3xl mb-2">🔔</div>
                    <p class="text-sm">No new alerts</p>
                </div>
            `;
            return;
        }
        
        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert alert-${alert.type} p-3">
                <div class="flex items-start gap-2">
                    <div class="text-lg">${getAlertIcon(alert.type)}</div>
                    <div class="flex-1">
                        <p class="font-medium text-sm">${alert.title}</p>
                        <p class="text-xs opacity-80">${alert.message}</p>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading alerts:', error);
    }
}

async function getRecentAlerts() {
    // This would typically fetch from Firebase
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return [
        {
            type: 'warning',
            title: 'Assignment Deadline',
            message: 'Data Structures Quiz due in 2 hours'
        },
        {
            type: 'info',
            title: 'New Student',
            message: 'Emily Brown joined Database Systems'
        }
    ];
}

function getAlertIcon(type) {
    const icons = {
        warning: '⚠️',
        error: '❌',
        success: '✅',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

function initializeEngagementChart() {
    // Placeholder for chart initialization
    // In a real app, you'd use a charting library like Chart.js or D3.js
    const chartContainer = document.getElementById('engagement-chart');
    
    setTimeout(() => {
        chartContainer.innerHTML = `
            <div class="w-full h-full flex items-center justify-center">
                <div class="text-center">
                    <div class="text-6xl mb-4">📈</div>
                    <p class="text-lg font-medium mb-2">Engagement Chart</p>
                    <p class="text-secondary text-sm">Chart visualization would go here</p>
                    <p class="text-secondary text-xs mt-2">Integration with Chart.js or similar library needed</p>
                </div>
            </div>
        `;
    }, 1200);
}

function setupEventListeners() {
    // Quick action buttons
    document.getElementById('add-student-btn').addEventListener('click', () => {
        AuthUtils.showToast('Add student feature coming soon!', 'info');
    });
    
    document.getElementById('export-data-btn').addEventListener('click', () => {
        AuthUtils.showToast('Export feature coming soon!', 'info');
    });
    
    document.getElementById('create-assignment-btn').addEventListener('click', () => {
        AuthUtils.showToast('Create assignment feature coming soon!', 'info');
    });
    
    document.getElementById('create-quiz-btn').addEventListener('click', () => {
        AuthUtils.showToast('Create quiz feature coming soon!', 'info');
    });
    
    document.getElementById('start-discussion-btn').addEventListener('click', () => {
        AuthUtils.showToast('Start discussion feature coming soon!', 'info');
    });
    
    document.getElementById('grade-submissions-btn').addEventListener('click', () => {
        AuthUtils.showToast('Grade submissions feature coming soon!', 'info');
    });
    
    // Activity filter
    document.getElementById('activity-filter').addEventListener('change', (e) => {
        filterActivity(e.target.value);
    });
}

function filterActivity(filterType) {
    // This would filter the activity list based on type
    AuthUtils.showToast(`Filtering by: ${filterType}`, 'info');
    // In a real implementation, you'd reload the activity with the filter
}

function viewClass(classId) {
    AuthUtils.showToast(`Opening class ${classId}`, 'info');
    // In a real implementation, navigate to class detail page
}

// Global utility functions for the teacher dashboard
window.TeacherDashboard = {
    refreshStats: loadDashboardStats,
    refreshActivity: loadStudentActivity,
    refreshClasses: loadClassList,
    refreshAlerts: loadAlerts
};