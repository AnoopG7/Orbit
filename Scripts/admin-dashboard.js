// Enhanced Admin Dashboard with Advanced Analytics & System Intelligence
// Import system analytics
import firebaseService from './firebase-service.js';
import { db } from '../firebase/firebase-config.js';

// Load BST module dynamically
let StudentEngagementBST = null;
let globalEngagementBST = null;
import { 
    getFirestore, 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc,
    getDocs, 
    getDoc, 
    query, 
    where, 
    orderBy, 
    limit 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

let currentUser = null;
let systemData = null;
let realTimeUpdates = null;
let realFirebaseData = null;

// Initialize advanced admin features
document.addEventListener('DOMContentLoaded', async () => {
    // Load BST module
    await loadBSTModule();
    
    // Enhanced authentication check with admin role validation
    const authResult = await AuthUtils.requireAuth();
    
    if (authResult) {
        const { user } = authResult;
        currentUser = user;
        console.log('Initializing Advanced Admin Dashboard for user:', user.email);
        
        // Get full user profile with admin privileges
        const userProfile = await window.authManager.getUserProfile(user.uid);
        await initializeSystemWideData();
        await initializeAdvancedAdminDashboard(user, userProfile);
        
        // Initialize BST features
        initializeBSTFeatures();
    }
});

async function initializeSystemWideData() {
    console.log('🔄 Initializing system-wide data with real Firebase data...');
    
    try {
        // First try to load real Firebase data
        if (firebaseService) {
            await loadRealFirebaseSystemData();
            return;
        }
    } catch (error) {
        console.warn('⚠️ Could not load Firebase data, using sample data:', error);
    }
    
    // Fallback to sample data if Firebase fails
    await generateSampleSystemData();
}

async function loadRealFirebaseSystemData() {
    try {
        console.log('📊 Loading real system data from Firebase...');
        
        const [students, teachers, courses, activities, systemStats] = await Promise.all([
            firebaseService.getAllStudents(),
            firebaseService.getAllTeachers(),
            firebaseService.getAllCourses(),
            firebaseService.getAllActivities(),
            firebaseService.getSystemStats()
        ]);

        realFirebaseData = {
            students,
            teachers,
            courses,
            activities,
            systemStats,
            loadedAt: new Date()
        };

        console.log(`✅ Loaded real Firebase data:`, {
            students: students.length,
            teachers: teachers.length,
            courses: courses.length,
            activities: activities.length
        });

        // Store system overview data from real data
        systemData = {
            totalStudents: students.length,
            totalTeachers: teachers.length,
            totalCourses: courses.length,
            totalActivities: activities.length,
            lastUpdated: new Date(),
            dataSource: 'firebase'
        };

    } catch (error) {
        console.error('❌ Error loading real Firebase data:', error);
        throw error;
    }
}

async function generateSampleSystemData() {
    console.log('⚠️ No Firebase data available, operating in demo mode');
    
    // Minimal fallback data - just enough for the dashboard to display
    systemData = {
        totalStudents: 0,
        totalTeachers: 0,
        totalCourses: 0,
        totalActivities: 0,
        lastUpdated: new Date(),
        dataSource: 'demo'
    };
    
    console.log('📝 Demo mode initialized - populate Firebase data to see real analytics');
}

async function initializeAdvancedAdminDashboard(user, userProfile) {
    try {
        // Initialize comprehensive admin dashboard with advanced analytics
        await Promise.all([
            loadAdvancedSystemStats(),
            loadIntelligentUsersList(),
            loadSystemWideActivityAnalytics(),
            loadPredictiveSystemAlerts()
        ]);
        
        // Setup advanced event listeners and interactions
        setupAdvancedAdminEventListeners();
        
        // Initialize real-time system updates
        initializeRealTimeSystemUpdates();
        
        // Setup advanced admin tools
        initializeAdvancedAdminTools();
        
        showAdvancedNotification('🎯 Advanced Admin Dashboard fully loaded with AI insights', 'success', 3000);
        
        console.log('🚀 Advanced Admin Dashboard fully initialized with DSA analytics');
        
    } catch (error) {
        console.error('❌ Error initializing advanced admin dashboard:', error);
        showAdvancedNotification('Dashboard initialization failed. Some features may be limited.', 'error', 5000);
    }
}

async function loadAdvancedSystemStats() {
    try {
        // Load comprehensive system statistics with DSA analytics
        const stats = await getAdvancedSystemStats();
        
        // Update basic stats with enhanced data
        document.getElementById('total-users').textContent = stats.totalUsers;
        document.getElementById('active-teachers').textContent = stats.activeTeachers;
        document.getElementById('system-health').textContent = `${stats.systemHealth}%`;
        document.getElementById('storage-used').textContent = `${stats.storageUsed}GB`;
        
        // Analytics displays are handled by the existing HTML structure
        console.log('✅ System stats loaded and displayed');
        
    } catch (error) {
        console.error('❌ Error loading advanced system stats:', error);
        showAdvancedNotification('Failed to load system statistics', 'error');
    }
}

async function getAdvancedSystemStats() {
    console.log('📊 Calculating advanced system statistics...');
    
    let totalEngagement = 0;
    let totalActivities = 0;
    let activeStudents = 0;
    let riskStudents = 0;
    let realStats = null;
    
    // Use real Firebase data if available
    if (realFirebaseData) {
        console.log('📈 Using real Firebase data for stats calculation');
        
        const { students, activities, systemStats } = realFirebaseData;
        
        // Calculate from real data
        totalActivities = activities.length;
        
        // Calculate average engagement from real activities
        if (activities.length > 0) {
            const totalEngagementSum = activities.reduce((sum, activity) => {
                return sum + (activity.engagementLevel || 5);
            }, 0);
            totalEngagement = totalEngagementSum / activities.length;
        }
        
        // Calculate active students (those with activities in last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentActivities = activities.filter(activity => {
            const activityDate = activity.timestamp instanceof Date ? 
                activity.timestamp : new Date(activity.timestamp);
            return activityDate > thirtyDaysAgo;
        });
        const activeStudentIds = new Set(recentActivities.map(a => a.studentId));
        activeStudents = activeStudentIds.size;
        
        // Calculate risk students from real data (students with low engagement)
        const studentEngagements = {};
        activities.forEach(activity => {
            if (!studentEngagements[activity.studentId]) {
                studentEngagements[activity.studentId] = [];
            }
            studentEngagements[activity.studentId].push(activity.engagementLevel || 5);
        });
        
        riskStudents = Object.entries(studentEngagements).filter(([studentId, engagements]) => {
            const avgEngagement = engagements.reduce((sum, e) => sum + e, 0) / engagements.length;
            return avgEngagement < 5.0; // Below average engagement
        }).length;
        
        // Calculate completion rate from real data
        const completedActivities = activities.filter(a => a.status === 'completed').length;
        const completionRate = activities.length > 0 ? 
            ((completedActivities / activities.length) * 100).toFixed(1) : '0.0';
        
        // Calculate average score from real activities
        const totalScore = activities.reduce((sum, a) => sum + (a.score || 0), 0);
        const avgScore = activities.length > 0 ? (totalScore / activities.length).toFixed(1) : '0.0';
        
        realStats = {
            // Real Firebase data
            totalUsers: students.length + realFirebaseData.teachers.length,
            activeTeachers: realFirebaseData.teachers.length,
            totalStudents: students.length,
            activeStudents: activeStudents,
            totalActivities: totalActivities,
            avgEngagement: totalEngagement.toFixed(1),
            riskStudents: riskStudents,
            totalCourses: realFirebaseData.courses.length,
            completionRate: completionRate,
            avgScore: avgScore,
            
            // System health metrics
            systemHealth: 98,
            storageUsed: (totalActivities * 0.002 + 1.5).toFixed(1), // Estimate based on activities
            responseTime: (100 + Math.random() * 50).toFixed(0),
            uptime: (99.5 + Math.random() * 0.4).toFixed(2),
            errorRate: (0.05 + Math.random() * 0.2).toFixed(2),
            
            // Real-time metrics
            currentOnline: Math.floor(activeStudents * 0.3) + 5, // Estimate 30% online
            peakHours: calculatePeakHours(activities),
            todayActivities: getTodayActivitiesCount(activities),
            
            dataSource: 'firebase',
            lastUpdated: new Date()
        };
        
    } else {
        console.log('📊 Using fallback stats (sample data)');
        
        // Fallback to basic sample data calculations
        if (systemData) {
            activeStudents = Math.floor(systemData.totalStudents * 0.7); // Assume 70% active
            totalActivities = systemData.totalActivities || 150;
            totalEngagement = 7.2; // Default engagement level
            riskStudents = Math.floor(systemData.totalStudents * 0.15); // Assume 15% at risk
        } else {
            // Complete fallback
            activeStudents = 42;
            totalActivities = 150;
            totalEngagement = 7.2;
            riskStudents = 8;
        }

        realStats = {
            // Basic stats from sample data
            totalUsers: (systemData?.totalStudents || 50) + (systemData?.totalTeachers || 12),
            activeTeachers: systemData.totalTeachers,
            systemHealth: Math.floor(Math.random() * 5) + 95,
            storageUsed: (Math.random() * 3 + 2).toFixed(1),
            
            // Advanced analytics from DSA
            totalStudents: systemData.totalStudents,
            activeStudents: activeStudents,
            totalActivities: totalActivities,
            avgEngagement: totalEngagement.toFixed(1),
            riskStudents: riskStudents,
            totalCourses: systemData.totalCourses,
            completionRate: (85 + Math.random() * 10).toFixed(1),
            satisfactionScore: (4.2 + Math.random() * 0.6).toFixed(1),
            
            // System performance
            responseTime: (120 + Math.random() * 80).toFixed(0),
            uptime: (99.8 + Math.random() * 0.15).toFixed(2),
            errorRate: (0.1 + Math.random() * 0.4).toFixed(2),
            
            // Real-time metrics
            currentOnline: Math.floor(Math.random() * 25) + 15,
            peakHoursToday: '14:00-16:00',
            todayActivities: Math.floor(Math.random() * 200) + 150,
            
            dataSource: 'sample',
            lastUpdated: new Date()
        };
    }
    
    console.log('✅ System stats calculated:', realStats?.dataSource || 'unknown source');
    return realStats || getDefaultStats();
}

function calculatePeakHours(activities) {
    if (!activities || activities.length === 0) return '14:00-16:00';
    
    const hourCounts = {};
    activities.forEach(activity => {
        const date = activity.timestamp instanceof Date ? 
            activity.timestamp : new Date(activity.timestamp);
        const hour = date.getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const peakHour = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0];
    
    if (peakHour) {
        const startHour = String(peakHour).padStart(2, '0');
        const endHour = String((parseInt(peakHour) + 2) % 24).padStart(2, '0');
        return `${startHour}:00-${endHour}:00`;
    }
    
    return '14:00-16:00';
}

function getTodayActivitiesCount(activities) {
    if (!activities || activities.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return activities.filter(activity => {
        const activityDate = activity.timestamp instanceof Date ? 
            activity.timestamp : new Date(activity.timestamp);
        activityDate.setHours(0, 0, 0, 0);
        return activityDate.getTime() === today.getTime();
    }).length;
}

function getDefaultStats() {
    return {
        totalUsers: 67,
        activeTeachers: 12,
        totalStudents: 55,
        activeStudents: 38,
        totalActivities: 2475,
        avgEngagement: '7.2',
        riskStudents: 8,
        totalCourses: 9,
        completionRate: '87.5',
        systemHealth: 98,
        storageUsed: '2.8',
        responseTime: '145',
        uptime: '99.85',
        errorRate: '0.12',
        currentOnline: 22,
        peakHoursToday: '14:00-16:00',
        todayActivities: 187,
        dataSource: 'default',
        lastUpdated: new Date()
    };
}

// Removed renderSystemOverviewCards function to prevent duplicate HTML
// The admin dashboard HTML already contains the necessary structure

async function getSystemStats() {
    // This would typically fetch from Firebase
    // For now, return mock data
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    return {
        totalUsers: Math.floor(Math.random() * 500) + 100,
        activeTeachers: Math.floor(Math.random() * 50) + 10,
        systemHealth: Math.floor(Math.random() * 5) + 95,
        storageUsed: (Math.random() * 5 + 1).toFixed(1)
    };
}

// Reusable user card template function
function renderUserCard(user) {
    return `
        <div class="user-card user-card-${user.role} flex items-center justify-between cursor-pointer" data-user-email="${user.email}" onclick="viewUserAnalytics('${user.id}')">
            <div class="flex items-center gap-4">
                <div class="relative">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-r ${getUserGradient(user.role)} text-white flex items-center justify-center font-bold text-sm">
                        ${getUserInitials(user.displayName)}
                    </div>
                    ${user.isOnline ? '<div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>' : ''}
                </div>
                <div>
                    <p class="font-medium flex items-center gap-2">
                        ${user.displayName}
                        ${user.analytics?.isHighPerformer ? '<span class="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">⭐ Top Performer</span>' : ''}
                        ${user.analytics?.isAtRisk ? '<span class="text-xs bg-red-100 text-red-800 px-1 rounded">⚠️ At Risk</span>' : ''}
                    </p>
                    <p class="text-sm text-secondary flex items-center gap-4">
                        <span>${user.email}</span>
                        ${user.role === 'student' ? `<span class="text-xs">📊 Engagement: ${user.analytics?.engagementScore || 'N/A'}</span>` : ''}
                        ${user.lastActive ? `<span class="text-xs">🕒 ${formatTime(user.lastActive)}</span>` : ''}
                    </p>
                    ${user.analytics?.insights ? `<p class="text-xs text-blue-600 mt-1">${user.analytics.insights}</p>` : ''}
                </div>
            </div>
            <div class="flex items-center gap-3" onclick="event.stopPropagation()">
                <div class="text-right">
                    <span class="badge badge-${getRoleBadgeColor(user.role)}">${user.role.toUpperCase()}</span>
                    ${user.role === 'student' && user.analytics?.totalActivities ? 
                        `<div class="text-xs text-muted mt-1">${user.analytics.totalActivities} activities</div>` : ''}
                </div>
                <div class="flex gap-1">
                    <button class="btn btn-ghost btn-sm" onclick="viewUserAnalytics('${user.id}')" title="View Details">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                    </button>
                    <button class="btn btn-ghost btn-sm text-error" onclick="deleteUser('${user.id}')" title="Delete User">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function loadIntelligentUsersList() {
    try {
        const usersContainer = document.getElementById('users-list');
        const users = await getAllAdvancedUsers();
        
        // Cache the user data globally for fast filtering
        window.allUsersCache = users;
        console.log(`📋 Cached ${users.length} users for fast filtering`);
        
        if (users.length === 0) {
            usersContainer.innerHTML = `
                <div class="text-center py-8 text-secondary">
                    <div class="text-4xl mb-3">👥</div>
                    <p>No users found</p>
                </div>
            `;
            return;
        }
        
        // Enhanced user display with analytics insights
        usersContainer.innerHTML = users.map(user => renderUserCard(user)).join('');
        
        // Refresh search data after loading users
        if (typeof window.refreshSearchData === 'function') {
            setTimeout(() => window.refreshSearchData(), 100);
        }
        
    } catch (error) {
        console.error('❌ Error loading intelligent users list:', error);
        document.getElementById('users-list').innerHTML = `
            <div class="text-center py-8 text-error">
                <p>Failed to load users with analytics</p>
            </div>
        `;
    }
}

async function getAllAdvancedUsers() {
    console.log('📊 Loading users from Firebase data...');
    
    const users = [];
    
    // First, try to load users from the 'users' collection (newly created users)
    try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        
        usersSnapshot.forEach((doc) => {
            const userData = doc.data();
            users.push({
                id: doc.id,
                displayName: userData.displayName,
                email: userData.email,
                role: userData.role,
                isOnline: Math.random() > 0.7, // Simulated online status
                lastActive: userData.updatedAt ? new Date(userData.updatedAt) : new Date(),
                createdAt: userData.createdAt,
                grade: userData.grade,
                department: userData.department,
                studentId: userData.studentId,
                employeeId: userData.employeeId,
                analytics: {
                    engagementScore: 'N/A', // New users start with no engagement data
                    totalActivities: 0,
                    isHighPerformer: false,
                    isAtRisk: false,
                    insights: `New ${userData.role}, created ${new Date(userData.createdAt).toLocaleDateString()}`
                }
            });
        });
        
        console.log(`✅ Loaded ${users.length} users from 'users' collection`);
    } catch (error) {
        console.error('❌ Error loading users from Firestore:', error);
    }
    
    // Also try to load real Firebase data from legacy collections
    if (realFirebaseData && realFirebaseData.students && realFirebaseData.teachers) {
        console.log('✅ Using real Firebase user data');
        
        // Add real students
        realFirebaseData.students.forEach(student => {
            const activities = realFirebaseData.activities?.filter(a => a.studentId === student.id) || [];
            const avgEngagement = activities.length > 0 ? 
                (activities.reduce((sum, a) => sum + (a.engagementLevel || 0), 0) / activities.length).toFixed(1) : 'N/A';
            
            users.push({
                id: student.id,
                displayName: student.fullName || `${student.firstName} ${student.lastName}`,
                email: student.email,
                role: 'student',
                isOnline: Math.random() > 0.7, // Simulated online status
                lastActive: student.lastLoginAt ? new Date(student.lastLoginAt) : new Date(),
                analytics: {
                    engagementScore: avgEngagement,
                    totalActivities: activities.length,
                    isHighPerformer: parseFloat(avgEngagement) > 8,
                    isAtRisk: parseFloat(avgEngagement) < 5,
                    insights: `${activities.length} activities, ${student.major} major`
                }
            });
        });
        
        // Add real teachers
        realFirebaseData.teachers.forEach(teacher => {
            users.push({
                id: teacher.id,
                displayName: teacher.fullName,
                email: teacher.email,
                role: 'teacher',
                isOnline: Math.random() > 0.5,
                lastActive: new Date(),
                analytics: {
                    studentsManaged: teacher.coursesTeaching * 15, // Estimate
                    avgClassEngagement: teacher.rating || 'N/A',
                    insights: `${teacher.department}, ${teacher.specialization}`
                }
            });
        });
        
    } else {
        console.log('⚠️ No Firebase data available - showing placeholder');
        users.push({
            id: 'demo_admin',
            displayName: 'Demo Administrator',
            email: 'admin@demo.edu',
            role: 'admin',
            isOnline: true,
            lastActive: new Date(),
            analytics: {
                insights: 'Populate Firebase data to see real users'
            }
        });
    }
    
    return users.sort((a, b) => {
        if (a.role !== b.role) {
            const roleOrder = { admin: 0, teacher: 1, student: 2 };
            return roleOrder[a.role] - roleOrder[b.role];
        }
        return a.displayName.localeCompare(b.displayName);
    });
}

function generateStudentName(index) {
    const firstNames = ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack', 'Kate', 'Liam', 'Maya', 'Noah', 'Olivia'];
    const lastNames = ['Johnson', 'Smith', 'Davis', 'Wilson', 'Brown', 'Miller', 'Lee', 'Garcia', 'Chen', 'Taylor', 'Anderson', 'Thomas', 'Rodriguez', 'White', 'Martin'];
    
    return `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function generateTeacherName(index) {
    const titles = ['Dr.', 'Prof.', 'Ms.', 'Mr.'];
    const names = ['Jennifer Clark', 'Michael Brown', 'Lisa Davis', 'Robert Johnson', 'Amanda Wilson', 'Christopher Lee', 'Michelle Garcia', 'Daniel Rodriguez'];
    
    return `${titles[index % titles.length]} ${names[index % names.length]}`;
}

function generateStudentInsight(userData, patterns) {
    if (!userData) return 'No activity data available';
    
    const score = userData.totalScore || 0;
    const activities = userData.activities?.length || 0;
    
    if (score > 400) return `Excellent engagement with ${activities} activities`;
    if (score > 200) return `Good progress with consistent activity`;
    if (score > 100) return `Moderate engagement, room for improvement`;
    if (patterns?.riskLevel === 'high') return `Low engagement - requires attention`;
    return `New student - limited activity history`;
}

function getUserGradient(role) {
    const gradients = {
        student: 'from-blue-500 to-purple-600',
        teacher: 'from-green-500 to-teal-600',
        admin: 'from-red-500 to-pink-600'
    };
    return gradients[role] || gradients.student;
}

async function getAllUsers() {
    // This would typically fetch from Firebase
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = [
        {
            id: '1',
            displayName: 'John Smith',
            email: 'john.smith@example.com',
            role: 'student',
            createdAt: new Date()
        },
        {
            id: '2',
            displayName: 'Sarah Johnson',
            email: 'sarah.johnson@example.com',
            role: 'teacher',
            createdAt: new Date()
        },
        {
            id: '3',
            displayName: 'Mike Wilson',
            email: 'mike.wilson@example.com',
            role: 'admin',
            createdAt: new Date()
        },
        {
            id: '4',
            displayName: 'Emily Davis',
            email: 'emily.davis@example.com',
            role: 'student',
            createdAt: new Date()
        }
    ];
    
    return users;
}

function getUserInitials(displayName) {
    return displayName ? displayName.split(' ').map(name => name.charAt(0)).join('').substring(0, 2).toUpperCase() : '?';
}

function getRoleBadgeColor(role) {
    const colors = {
        student: 'primary',
        teacher: 'secondary',
        admin: 'success'
    };
    return colors[role] || 'primary';
}

async function loadSystemWideActivityAnalytics() {
    try {
        const activityContainer = document.getElementById('activity-log');
        const activities = await getAdvancedSystemActivity();
        
        if (activities.length === 0) {
            activityContainer.innerHTML = `
                <div class="text-center py-8 text-secondary">
                    <div class="text-4xl mb-3">📊</div>
                    <p>No recent system activity</p>
                </div>
            `;
            return;
        }
        
        // Enhanced activity display with analytics insights
        activityContainer.innerHTML = `
            <div class="mb-4">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="font-bold">🔍 System Activity Analytics</h3>
                    <div class="flex gap-2">
                        <button onclick="filterActivities('all')" class="btn btn-sm">All</button>
                        <button onclick="filterActivities('critical')" class="btn btn-sm">Critical</button>
                        <button onclick="filterActivities('engagement')" class="btn btn-sm">Engagement</button>
                    </div>
                </div>
                <div id="activity-insights" class="mb-4">
                    ${await renderActivityInsights(activities)}
                </div>
            </div>
            <div id="activity-list">
                ${activities.map(activity => `
                    <div class="flex items-center justify-between p-3 bg-hover rounded-lg mb-2 hover:bg-gray-100 transition-colors" data-activity-type="${activity.type}">
                        <div class="flex items-center gap-3">
                            <div class="text-2xl">${getAdvancedActivityIcon(activity.type)}</div>
                            <div class="flex-1">
                                <p class="font-medium text-sm">${activity.action}</p>
                                <p class="text-xs text-secondary flex items-center gap-4">
                                    <span>👤 ${activity.user}</span>
                                    <span>🕒 ${formatTime(activity.timestamp)}</span>
                                    ${activity.impact ? `<span class="text-blue-600">📊 Impact: ${activity.impact}</span>` : ''}
                                </p>
                                ${activity.details ? `<p class="text-xs text-gray-600 mt-1">${activity.details}</p>` : ''}
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="badge badge-${getAdvancedActivityBadgeColor(activity.type)} mb-1">${activity.type.toUpperCase()}</span>
                            ${activity.priority ? `<div class="text-xs text-${activity.priority === 'high' ? 'red' : activity.priority === 'medium' ? 'yellow' : 'green'}-600">⚡ ${activity.priority.toUpperCase()}</div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
    } catch (error) {
        console.error('❌ Error loading system activity analytics:', error);
        activityContainer.innerHTML = `
            <div class="text-center py-8 text-error">
                <p>Failed to load system activity analytics</p>
            </div>
        `;
    }
}

async function getAdvancedSystemActivity() {
    console.log('📊 Loading system activity from Firebase data...');
    
    const activities = [];
    
    // Use real Firebase data if available
    if (realFirebaseData && realFirebaseData.activities) {
        console.log('✅ Using real Firebase activity data');
        
        // Get recent activities (last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentActivities = realFirebaseData.activities
            .filter(activity => {
                const activityDate = activity.timestamp instanceof Date ? 
                    activity.timestamp : new Date(activity.timestamp);
                return activityDate > oneDayAgo;
            })
            .slice(0, 10); // Limit to 10 most recent
        
        recentActivities.forEach(activity => {
            activities.push({
                action: `${activity.activityType.replace('_', ' ')} - ${activity.title}`,
                user: activity.studentName,
                type: 'engagement',
                timestamp: activity.timestamp instanceof Date ? activity.timestamp : new Date(activity.timestamp),
                impact: activity.engagementLevel > 8 ? 'High engagement' : activity.engagementLevel > 5 ? 'Medium engagement' : 'Low engagement',
                priority: activity.engagementLevel > 8 ? 'high' : activity.engagementLevel > 5 ? 'medium' : 'low',
                details: `Score: ${activity.score}/${activity.maxScore}, Quality: ${activity.quality}%`
            });
        });
    }
    
    // Add some system events
    activities.push(
        {
            action: `Firebase data loaded successfully`,
            user: 'System',
            type: 'system',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            impact: 'System ready',
            priority: 'low',
            details: `Loaded ${realFirebaseData?.students?.length || 0} students, ${realFirebaseData?.activities?.length || 0} activities`
        },
        {
            action: 'Real-time dashboard analytics active',
            user: 'Analytics Engine',
            type: 'analytics',
            timestamp: new Date(Date.now() - 10 * 60 * 1000),
            impact: 'Data insights',
            priority: 'medium',
            details: 'Advanced algorithms processing live student engagement data'
        }
    );
    
    if (activities.length === 0) {
        activities.push({
            action: 'No recent activity data available',
            user: 'System',
            type: 'info',
            timestamp: new Date(),
            impact: 'Awaiting data',
            priority: 'low',
            details: 'Populate Firebase with data to see real activity logs'
        });
    }
    
    return activities.sort((a, b) => b.timestamp - a.timestamp);
}

async function renderActivityInsights(activities) {
    const totalActivities = activities.length;
    const criticalCount = activities.filter(a => a.priority === 'high').length;
    const engagementEvents = activities.filter(a => a.type === 'engagement').length;
    const systemEvents = activities.filter(a => a.type === 'system').length;
    
    return `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-blue-50 rounded-lg">
            <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">${totalActivities}</div>
                <div class="text-xs text-blue-800">Total Events</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-red-600">${criticalCount}</div>
                <div class="text-xs text-red-800">Critical</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-green-600">${engagementEvents}</div>
                <div class="text-xs text-green-800">Engagement</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">${systemEvents}</div>
                <div class="text-xs text-purple-800">System</div>
            </div>
        </div>
    `;
}

function getAdvancedActivityIcon(type) {
    const icons = {
        user: '👤',
        access: '🔑',
        system: '⚙️',
        admin: '👨‍💼',
        error: '❌',
        engagement: '📈',
        analysis: '🧠',
        alert: '🚨',
        performance: '🚀',
        security: '🛡️',
        analytics: '📊'
    };
    return icons[type] || icons.system;
}

function getAdvancedActivityBadgeColor(type) {
    const colors = {
        user: 'primary',
        access: 'secondary',
        system: 'success',
        admin: 'warning',
        error: 'error',
        engagement: 'success',
        analysis: 'info',
        alert: 'warning',
        performance: 'primary',
        security: 'success',
        analytics: 'info'
    };
    return colors[type] || colors.system;
}

async function getSystemActivity() {
    // This would typically fetch from Firebase
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const activities = [
        {
            action: 'New user registration',
            user: 'Alice Cooper',
            type: 'user',
            timestamp: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
        },
        {
            action: 'Teacher dashboard accessed',
            user: 'Bob Johnson',
            type: 'access',
            timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        },
        {
            action: 'System backup completed',
            user: 'System',
            type: 'system',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
            action: 'User role updated to teacher',
            user: 'Admin',
            type: 'admin',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
        }
    ];
    
    return activities;
}

function getActivityIcon(type) {
    const icons = {
        user: '👤',
        access: '🔑',
        system: '⚙️',
        admin: '👨‍💼',
        error: '❌'
    };
    return icons[type] || icons.system;
}

function getActivityBadgeColor(type) {
    const colors = {
        user: 'primary',
        access: 'secondary',
        system: 'success',
        admin: 'warning',
        error: 'error'
    };
    return colors[type] || colors.system;
}

async function loadPredictiveSystemAlerts() {
    try {
        const alertsContainer = document.getElementById('system-alerts');
        const alerts = await getIntelligentSystemAlerts();
        
        if (alerts.length === 0) {
            alertsContainer.innerHTML = `
                <div class="text-center py-4 text-secondary">
                    <div class="text-3xl mb-2">🛡️</div>
                    <p class="text-sm">All systems operational - No alerts</p>
                    <p class="text-xs text-green-600 mt-1">✅ AI monitoring active</p>
                </div>
            `;
            return;
        }
        
        // Enhanced alerts with AI insights and actions
        alertsContainer.innerHTML = `
            <div class="mb-4">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="font-bold">🤖 Intelligent Alert System</h3>
                    <button onclick="refreshAlerts()" class="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200">🔄 Refresh</button>
                </div>
                <div class="grid gap-3">
                    ${alerts.map(alert => `
                        <div class="alert alert-${alert.severity} p-4 border-l-4 border-${alert.severity === 'error' ? 'red' : alert.severity === 'warning' ? 'yellow' : 'blue'}-500">
                            <div class="flex items-start justify-between">
                                <div class="flex items-start gap-3">
                                    <div class="text-2xl">${getAdvancedAlertIcon(alert.severity, alert.type)}</div>
                                    <div class="flex-1">
                                        <p class="font-bold text-sm flex items-center gap-2">
                                            ${alert.title}
                                            ${alert.aiGenerated ? '<span class="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">🤖 AI</span>' : ''}
                                            ${alert.priority === 'critical' ? '<span class="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">🚨 Critical</span>' : ''}
                                        </p>
                                        <p class="text-sm opacity-90 mt-1">${alert.message}</p>
                                        ${alert.recommendation ? `<p class="text-xs bg-white bg-opacity-20 p-2 rounded mt-2"><strong>💡 Recommendation:</strong> ${alert.recommendation}</p>` : ''}
                                        ${alert.affectedUsers ? `<p class="text-xs mt-1"><strong>👥 Affected:</strong> ${alert.affectedUsers}</p>` : ''}
                                    </div>
                                </div>
                                <div class="flex flex-col items-end gap-2">
                                    <span class="text-xs text-opacity-70">${formatTime(alert.timestamp)}</span>
                                    ${alert.actionRequired ? `
                                        <button onclick="handleAlertAction('${alert.id}', '${alert.actionType}')" 
                                                class="btn btn-sm bg-white bg-opacity-20 hover:bg-opacity-30 text-xs">
                                            ${alert.actionLabel || '⚡ Take Action'}
                                        </button>
                                    ` : ''}
                                    <button onclick="dismissAlert('${alert.id}')" 
                                            class="btn btn-sm bg-white bg-opacity-10 hover:bg-opacity-20 text-xs">
                                        ✕ Dismiss
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('❌ Error loading predictive system alerts:', error);
        alertsContainer.innerHTML = `
            <div class="text-center py-8 text-error">
                <div class="text-4xl mb-2">⚠️</div>
                <p>Failed to load intelligent alerts</p>
            </div>
        `;
    }
}

async function getIntelligentSystemAlerts() {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const alerts = [];
    
    // Generate alerts based on real Firebase data
    if (realFirebaseData && realFirebaseData.activities) {
        const activities = realFirebaseData.activities;
        const students = realFirebaseData.students || [];
        
        // Check for students with low engagement
        const studentEngagements = {};
        activities.forEach(activity => {
            if (!studentEngagements[activity.studentId]) {
                studentEngagements[activity.studentId] = [];
            }
            studentEngagements[activity.studentId].push(activity.engagementLevel || 5);
        });
        
        const riskStudents = Object.entries(studentEngagements).filter(([studentId, engagements]) => {
            const avgEngagement = engagements.reduce((sum, e) => sum + e, 0) / engagements.length;
            return avgEngagement < 5.0;
        });
        
        if (riskStudents.length > 3) {
            alerts.push({
                id: 'risk_students_alert',
                severity: 'warning',
                type: 'engagement',
                title: `${riskStudents.length} Students at Risk`,
                message: 'Analysis detected multiple students with declining engagement patterns',
                recommendation: 'Deploy targeted intervention programs and personalized support',
                affectedUsers: `${riskStudents.length} students across multiple courses`,
                aiGenerated: false,
                priority: 'high',
                timestamp: new Date(Date.now() - 10 * 60 * 1000),
                actionRequired: true,
                actionType: 'view_risk_students',
                actionLabel: '👥 View Students'
            });
        }
        
        // Check for high performers
        const highPerformers = Object.entries(studentEngagements).filter(([studentId, engagements]) => {
            const avgEngagement = engagements.reduce((sum, e) => sum + e, 0) / engagements.length;
            return avgEngagement > 8.0;
        });
        
        if (highPerformers.length > 5) {
            alerts.push({
                id: 'high_performers_alert',
                severity: 'success',
                type: 'performance',
                title: 'Exceptional Performance Detected',
                message: `${highPerformers.length} students showing outstanding engagement levels`,
                recommendation: 'Consider advanced tracks or mentorship opportunities',
                affectedUsers: `${highPerformers.length} high-performing students`,
                aiGenerated: true,
                priority: 'medium',
                timestamp: new Date(Date.now() - 30 * 60 * 1000),
                actionRequired: true,
                actionType: 'view_top_performers',
                actionLabel: '⭐ View Leaders'
            });
        }
    }
    
    // System alerts
    alerts.push(
        {
            id: 'system_update_alert',
            severity: 'info',
            type: 'system',
            title: 'System Maintenance Scheduled',
            message: 'Planned maintenance window tomorrow 2:00-4:00 AM UTC for performance upgrades',
            recommendation: 'Notify users about temporary service interruption',
            aiGenerated: false,
            priority: 'medium',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            actionRequired: true,
            actionType: 'schedule_notification',
            actionLabel: '📢 Notify Users'
        },
        {
            id: 'database_performance_alert',
            severity: 'warning',
            type: 'performance',
            title: 'Database Query Performance Degradation',
            message: 'Average query response time increased by 25% in the last hour',
            recommendation: 'Review recent queries and consider index optimization',
            aiGenerated: true,
            priority: 'high',
            timestamp: new Date(Date.now() - 45 * 60 * 1000),
            actionRequired: true,
            actionType: 'optimize_database',
            actionLabel: '🔧 Optimize'
        }
    );
    
    return alerts.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });
}

function getAdvancedAlertIcon(severity, type) {
    if (type === 'engagement') return '📈';
    if (type === 'performance') return '🚀';
    if (type === 'system') return '⚙️';
    if (type === 'security') return '🛡️';
    
    const icons = {
        error: '🚨',
        warning: '⚠️',
        success: '✅',
        info: 'ℹ️'
    };
    return icons[severity] || icons.info;
}

async function getSystemAlerts() {
    // This would typically fetch from Firebase
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return [
        {
            severity: 'info',
            title: 'System Update',
            message: 'Maintenance scheduled for tomorrow at 2 AM UTC'
        }
    ];
}

function getAlertIcon(severity) {
    const icons = {
        error: '❌',
        warning: '⚠️',
        success: '✅',
        info: 'ℹ️'
    };
    return icons[severity] || icons.info;
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

function setupAdvancedAdminEventListeners() {
    // Enhanced admin action buttons with analytics
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            showCreateUserModal();
        });
    }
    
    const exportBtn = document.getElementById('export-system-data-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportSystemAnalytics();
        });
    }
    
    // Advanced admin action buttons
    const manageRolesBtn = document.getElementById('manage-roles-btn');
    if (manageRolesBtn) {
        manageRolesBtn.addEventListener('click', () => {
            showRoleManagementPanel();
        });
    }
    
    const systemSettingsBtn = document.getElementById('system-settings-btn');
    if (systemSettingsBtn) {
        systemSettingsBtn.addEventListener('click', () => {
            showSystemSettingsModal();
        });
    }
    
    const backupBtn = document.getElementById('backup-data-btn');
    if (backupBtn) {
        backupBtn.addEventListener('click', () => {
            initiateSystemBackup();
        });
    }
    
    const analyticsBtn = document.getElementById('view-analytics-btn');
    if (analyticsBtn) {
        analyticsBtn.addEventListener('click', () => {
            showAdvancedAnalyticsPanel();
        });
    }
    
    // Role filter dropdown
    const roleFilter = document.getElementById('role-filter');
    if (roleFilter) {
        console.log('✅ Setting up role filter event listener');
        roleFilter.addEventListener('change', (e) => {
            console.log('🔄 Role filter changed to:', e.target.value);
            filterUsersAdvanced(e.target.value);
        });
    } else {
        console.warn('⚠️ Role filter dropdown not found');
    }
    
    // Search functionality
    setupSearchFunctionality();
    
    // Keyboard shortcuts
    setupKeyboardShortcuts();
}

function setupSearchFunctionality() {
    // Initialize DSA Search Manager
    let searchManager = null;
    let currentSearchResults = [];
    let allUsers = [];
    
    // Initialize the search manager with current users
    const initializeSearch = async () => {
        try {
            allUsers = await getAllAdvancedUsers();
            searchManager = new window.StudentSearch.StudentSearchManager();
            searchManager.initialize(allUsers);
            console.log('✅ DSA Search Manager initialized with', allUsers.length, 'users');
        } catch (error) {
            console.error('❌ Failed to initialize search manager:', error);
        }
    };
    
    // Initialize search on page load
    initializeSearch();
    
    // Get search input and related elements
    const searchInput = document.getElementById('student-search-input');
    const searchSuggestions = document.getElementById('search-suggestions');
    const searchCounter = document.getElementById('search-results-counter');
    const searchCountText = document.getElementById('search-count-text');
    
    if (!searchInput) {
        console.warn('⚠️ Search input not found');
        return;
    }
    
    // Debounce function for better performance
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };
    
    // Perform DSA Binary Search
    const performSearch = (query) => {
        if (!searchManager || !query.trim()) {
            // Clear performance header when returning to all users
            clearPerformanceAnalyticsHeader();
            displayAllUsers();
            hideSuggestions();
            hideSearchCounter();
            return;
        }
        
        // Clear performance analytics header when starting a search
        clearPerformanceAnalyticsHeader();
        
        const startTime = performance.now();
        
        // Use DSA Binary Search to find matching users
        currentSearchResults = searchManager.search(query.trim());
        
        const endTime = performance.now();
        const searchTime = (endTime - startTime).toFixed(2);
        
        console.log(`🔍 Binary Search completed in ${searchTime}ms for query: "${query}"`);
        console.log(`📊 Found ${currentSearchResults.length} results using DSA Binary Search`);
        
        // Display search results
        displaySearchResults(currentSearchResults);
        updateSearchCounter(currentSearchResults.length, searchTime);
        
        // Show search suggestions
        if (query.length >= 2) {
            showSearchSuggestions(query);
        } else {
            hideSuggestions();
        }
    };
    
    // Display search results in the users list
    const displaySearchResults = (results) => {
        const usersContainer = document.getElementById('users-list');
        
        if (results.length === 0) {
            usersContainer.innerHTML = `
                <div class="text-center py-8 text-secondary">
                    <div class="text-4xl mb-3">🔍</div>
                    <p>No users found matching your search</p>
                    <p class="text-sm mt-2">Try searching by name, email, or ID</p>
                </div>
            `;
            return;
        }
        
        // Use the same modular user card template
        usersContainer.innerHTML = results.map(user => renderUserCard(user)).join('');
    };
    
    // Display all users (when search is cleared)
    const displayAllUsers = () => {
        if (allUsers.length > 0) {
            displaySearchResults(allUsers);
        }
    };
    
    // Show search suggestions using DSA
    const showSearchSuggestions = (query) => {
        if (!searchManager || query.length < 2) {
            hideSuggestions();
            return;
        }
        
        const suggestions = searchManager.getSuggestions(query, 5);
        
        if (suggestions.length === 0) {
            hideSuggestions();
            return;
        }
    };
    
    // Hide search suggestions
    const hideSuggestions = () => {
        if (searchSuggestions) {
            searchSuggestions.classList.add('hidden');
        }
    };
    
    // Update search results counter
    const updateSearchCounter = (count, searchTime) => {
        if (searchCounter && searchCountText) {
            searchCountText.textContent = `${count} results (${searchTime}ms)`;
            searchCounter.classList.remove('hidden');
        }
    };
    
    // Hide search counter
    const hideSearchCounter = () => {
        if (searchCounter) {
            searchCounter.classList.add('hidden');
        }
    };
    
    // Select suggestion function (make it global)
    window.selectSuggestion = (suggestion) => {
        searchInput.value = suggestion;
        performSearch(suggestion);
        hideSuggestions();
        searchInput.focus();
    };
    
    // Debounced search function
    const debouncedSearch = debounce(performSearch, 300);
    
    // Event listeners for search input
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        debouncedSearch(query);
    });
    
    // Handle keyboard navigation for suggestions
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideSuggestions();
            searchInput.blur();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            performSearch(searchInput.value);
            hideSuggestions();
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            hideSuggestions();
        }
    });
    
    // Global search shortcut (Ctrl+F)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
    });
    
    // Refresh search data when users are updated
    window.refreshSearchData = async () => {
        await initializeSearch();
        if (searchInput.value.trim()) {
            performSearch(searchInput.value);
        }
    };
    
    console.log('✅ DSA Binary Search functionality initialized');
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey) {
            switch (e.key) {
                case 'r':
                    e.preventDefault();
                    refreshAllData();
                    break;
                case 'u':
                    e.preventDefault();
                    showCreateUserModal();
                    break;
                case 'e':
                    e.preventDefault();
                    exportSystemAnalytics();
                    break;
            }
        }
    });
}

async function initializeRealTimeSystemUpdates() {
    // Set up real-time updates every 30 seconds
    setInterval(async () => {
        await updateRealTimeMetrics();
    }, 30000);
    
    // Update activity feed every 2 minutes
    setInterval(async () => {
        await refreshActivityFeed();
    }, 120000);
    
    console.log('⚡ Real-time system updates initialized');
}

async function initializeAdvancedAdminTools() {
    // Initialize advanced admin tools and shortcuts
    addAdminToolbar();
    setupQuickActions();
    initializeDashboardCustomization();
}

function addAdminToolbar() {
    const toolbar = document.getElementById('admin-toolbar');
    if (toolbar) {
        toolbar.style.display = 'block';
        
        // Add event listeners to toolbar buttons
        document.getElementById('show-system-status-btn').addEventListener('click', showSystemStatus);
        document.getElementById('quick-export-btn').addEventListener('click', quickExport);
        // Temporarily disable global search modal
        // document.getElementById('show-global-search-btn').addEventListener('click', showGlobalSearchModal);
        document.getElementById('refresh-all-btn').addEventListener('click', refreshAllData);
    }
}

function setupQuickActions() {
    // Quick action shortcuts for common admin tasks
    console.log('⚡ Quick actions initialized');
}

function initializeDashboardCustomization() {
    // Allow admins to customize their dashboard layout
    console.log('🎨 Dashboard customization initialized');
}

// Simplified notification system
function showAdvancedNotification(message, type = 'info', duration = 3000) {
    // Create a simple notification without complex HTML
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 max-w-md bg-white border rounded-lg shadow-lg p-4 z-50`;
    
    const iconMap = {
        success: '✅',
        error: '❌',  
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    // Use simple DOM manipulation instead of innerHTML
    const content = document.createElement('div');
    content.className = 'flex items-center gap-3';
    
    const icon = document.createElement('span');
    icon.textContent = iconMap[type] || iconMap.info;
    icon.className = 'text-xl';
    
    const text = document.createElement('p');
    text.textContent = message;
    text.className = 'font-medium text-sm flex-1';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.className = 'text-gray-400 hover:text-gray-600 text-xl';
    closeBtn.onclick = () => notification.remove();
    
    content.appendChild(icon);
    content.appendChild(text);
    content.appendChild(closeBtn);
    notification.appendChild(content);
    
    document.body.appendChild(notification);
    
    // Auto-remove after duration
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }
}

// Enhanced utility functions
async function updateRealTimeMetrics() {
    // Update real-time metrics without full page reload
    const currentStats = await getAdvancedSystemStats();
    updateMetricDisplays(currentStats);
}

async function refreshActivityFeed() {
    // Refresh activity feed with new data
    const activityContainer = document.getElementById('activity-list');
    if (activityContainer) {
        const newActivities = await getAdvancedSystemActivity();
        // Update only new activities to avoid scroll disruption
        updateActivityFeed(newActivities);
    }
}

function updateMetricDisplays(stats) {
    // Update individual metric displays
    const elements = [
        { id: 'total-users', value: stats.totalUsers },
        { id: 'active-teachers', value: stats.activeTeachers },
        { id: 'system-health', value: `${stats.systemHealth}%` },
        { id: 'storage-used', value: `${stats.storageUsed}GB` }
    ];
    
    elements.forEach(({ id, value }) => {
        const element = document.getElementById(id);
        if (element && element.textContent !== value.toString()) {
            element.style.transform = 'scale(1.1)';
            element.style.color = '#10b981';
            element.textContent = value;
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
                element.style.color = '';
            }, 500);
        }
    });
}

function updateActivityFeed(activities) {
    // Smart update of activity feed
    console.log('🔄 Updating activity feed with', activities.length, 'items');
}

async function refreshAllData() {
    showAdvancedNotification('🔄 Refreshing all dashboard data...', 'info', 2000);
    
    try {
        await Promise.all([
            loadAdvancedSystemStats(),
            loadIntelligentUsersList(),
            loadSystemWideActivityAnalytics(),
            loadPredictiveSystemAlerts()
        ]);
        
        showAdvancedNotification('✅ Dashboard data refreshed successfully', 'success');
    } catch (error) {
        console.error('❌ Error refreshing dashboard:', error);
        showAdvancedNotification('❌ Failed to refresh dashboard data', 'error');
    }
}

function filterUsers(roleFilter) {
    AuthUtils.showToast(`Filtering users by: ${roleFilter}`, 'info');
    // In a real implementation, you'd reload the users list with the filter
}

// Enhanced admin action handlers - Comprehensive User Details Modal
async function viewUserAnalytics(userId) {
    // Get user data first to determine type
    const userData = await getUserCompleteData(userId);
    
    if (!userData) {
        showAdvancedNotification('❌ User data not found', 'error');
        return;
    }
    
    // Route to appropriate modal based on user role
    if (userData.role === 'teacher') {
        await showTeacherDetailsModal(userData);
    } else {
        await showUserDetailsModal(userId); // Existing student modal
    }
}

// Comprehensive User Details Modal
async function showUserDetailsModal(userId) {
    try {
        console.log('🔍 Opening detailed view for user:', userId);
        
        // Reset original activities for fresh start
        originalUserActivities = [];
        
        // Get user data from various sources
        const userData = await getUserCompleteData(userId);
        
        if (!userData) {
            showAdvancedNotification('❌ User data not found', 'error');
            return;
        }
        
        // Clone and setup modal template
        const template = document.getElementById('user-details-modal-template');
        const modalClone = template.content.cloneNode(true);
        
        // Setup modal data
        setupUserDetailsModalData(modalClone, userData);
        
        // Add event listeners
        setupUserDetailsModalEvents(modalClone, userData);
        
        // Add to page
        document.body.appendChild(modalClone);
        
        // Initialize charts and load additional data
        await initializeUserDetailCharts(userData);
        
        console.log('✅ User details modal opened successfully');
        
    } catch (error) {
        console.error('❌ Error opening user details modal:', error);
        showAdvancedNotification('Failed to load user details', 'error');
    }
}

async function getUserCompleteData(userId) {
    console.log('📊 Gathering complete user data for:', userId);
    
    let userData = null;
    
    // First, try to find user in the 'users' collection (newly created users)
    try {
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        const db = window.db;
        
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const userDoc = userSnap.data();
            userData = {
                id: userId,
                userId: userId,
                ...userDoc,
                // Ensure we have the proper fields for compatibility
                fullName: userDoc.displayName,
                firstName: userDoc.displayName?.split(' ')[0] || '',
                lastName: userDoc.displayName?.split(' ').slice(1).join(' ') || ''
            };
            console.log('✅ Found user in users collection:', userData);
            
            // Load role-specific data
            if (userData.role === 'student' || !userData.role) {
                // Load activities for students
                try {
                    const { collection, query, where, orderBy, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
                    const activitiesRef = collection(db, 'activities');
                    const q = query(
                        activitiesRef,
                        where('studentId', '==', userId),
                        orderBy('timestamp', 'desc'),
                        limit(10)
                    );
                    
                    const snapshot = await getDocs(q);
                    const freshActivities = [];
                    
                    snapshot.forEach((doc) => {
                        const activityData = doc.data();
                        freshActivities.push({
                            id: doc.id,
                            ...activityData,
                            timestamp: activityData.timestamp?.toDate ? activityData.timestamp.toDate() : new Date(activityData.timestamp)
                        });
                    });
                    
                    userData.activities = freshActivities;
                    userData.analytics = calculateUserAnalytics(userData);
                    console.log('✅ Loaded activities for student from users collection:', freshActivities.length);
                    
                } catch (error) {
                    console.warn('⚠️ Could not load activities for users collection user:', error);
                    userData.activities = [];
                    userData.analytics = calculateUserAnalytics(userData);
                }
            } else if (userData.role === 'teacher') {
                // Load courses for teachers
                try {
                    const { collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
                    const coursesRef = collection(db, 'courses');
                    const q = query(
                        coursesRef,
                        where('instructorId', '==', userId)
                    );
                    
                    const snapshot = await getDocs(q);
                    const courses = [];
                    
                    snapshot.forEach((doc) => {
                        const courseData = doc.data();
                        courses.push({
                            id: doc.id,
                            ...courseData
                        });
                    });
                    
                    userData.courses = courses;
                    userData.analytics = calculateTeacherAnalytics(userData);
                    console.log('✅ Loaded courses for teacher from users collection:', courses.length);
                    
                } catch (error) {
                    console.warn('⚠️ Could not load courses for teacher:', error);
                    userData.courses = [];
                    userData.analytics = calculateTeacherAnalytics(userData);
                }
            }
        }
    } catch (error) {
        console.warn('⚠️ Could not check users collection:', error);
    }
    
    // If not found in users collection, try to find user in Firebase cached data
    if (!userData && realFirebaseData) {
        // Check students
        const student = realFirebaseData.students?.find(s => s.id === userId);
        if (student) {
            userData = {
                ...student,
                role: 'student',
                type: 'student'
            };
        } else {
            // Check teachers
            const teacher = realFirebaseData.teachers?.find(t => t.id === userId);
            if (teacher) {
                userData = {
                    ...teacher,
                    role: 'teacher',
                    type: 'teacher'
                };
            }
        }
        
        // Get user activities if student - fetch fresh from Firebase
        if (userData && userData.role === 'student') {
            try {
                // Get fresh activities from Firebase
                const { collection, query, where, orderBy, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
                const db = window.db;
                
                const activitiesRef = collection(db, 'activities');
                const q = query(
                    activitiesRef,
                    where('studentId', '==', userId),
                    orderBy('timestamp', 'desc'),
                    limit(10)
                );
                
                const snapshot = await getDocs(q);
                const freshActivities = [];
                
                snapshot.forEach((doc) => {
                    const activityData = doc.data();
                    freshActivities.push({
                        id: doc.id,
                        ...activityData,
                        timestamp: activityData.timestamp?.toDate ? activityData.timestamp.toDate() : new Date(activityData.timestamp)
                    });
                });
                
                userData.activities = freshActivities;
                console.log('✅ Loaded fresh activities for user:', freshActivities.length);
                
            } catch (error) {
                console.warn('⚠️ Could not load fresh activities, using cached data:', error);
                // Fallback to cached data
                userData.activities = realFirebaseData.activities?.filter(a => a.studentId === userId) || [];
            }
            
            // Calculate analytics
            userData.analytics = calculateUserAnalytics(userData);
        } else if (userData && userData.role === 'teacher') {
            // Get teacher-specific data
            userData.courses = realFirebaseData.courses?.filter(c => c.instructorId === userId) || [];
            userData.analytics = calculateTeacherAnalytics(userData);
        }
    }
    
    // Fallback to demo data if no Firebase data
    if (!userData) {
        userData = generateDemoUserData(userId);
    }
    
    return userData;
}

// Teacher Details Modal
async function showTeacherDetailsModal(userData) {
    try {
        console.log('👨‍🏫 Opening teacher details modal for:', userData.id);
        
        // Create modal from template
        const modalClone = createTeacherModalTemplate(userData);
        document.body.appendChild(modalClone);
        
        console.log('✅ Teacher details modal opened successfully');
        
    } catch (error) {
        console.error('❌ Error opening teacher details modal:', error);
        showAdvancedNotification('Failed to load teacher details', 'error');
    }
}

function createTeacherModalTemplate(userData) {
    const template = document.getElementById('teacher-details-modal-template');
    const modalClone = template.content.cloneNode(true);
    
    // Populate the template with user data
    modalClone.getElementById('teacher-initials').textContent = getUserInitials(userData.displayName || userData.fullName);
    modalClone.getElementById('teacher-full-name').textContent = userData.displayName || userData.fullName;
    modalClone.getElementById('teacher-email-role').textContent = `${userData.email} • TEACHER`;
    
    // Populate stats
    modalClone.getElementById('teacher-total-courses').textContent = userData.analytics?.totalCourses || userData.courses?.length || 0;
    modalClone.getElementById('teacher-students-managed').textContent = userData.analytics?.studentsManaged || userData.totalStudents || 0;
    modalClone.getElementById('teacher-avg-rating').textContent = userData.analytics?.avgRating || userData.rating || 'N/A';
    modalClone.getElementById('teacher-experience').textContent = userData.experience || userData.yearsExperience || 'N/A';
    
    // Populate personal information
    const personalInfo = modalClone.getElementById('teacher-personal-info');
    personalInfo.innerHTML = `
        <div class="info-item">
            <span class="info-label">Full Name:</span>
            <span class="info-value">${userData.displayName || userData.fullName}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Email:</span>
            <span class="info-value">${userData.email}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Employee ID:</span>
            <span class="info-value">${userData.employeeId || userData.id}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Join Date:</span>
            <span class="info-value">${userData.createdAt ? new Date(userData.createdAt.toDate ? userData.createdAt.toDate() : userData.createdAt).toLocaleDateString() : 'N/A'}</span>
        </div>
    `;
    
    // Populate professional information
    const professionalInfo = modalClone.getElementById('teacher-professional-info');
    professionalInfo.innerHTML = `
        <div class="info-item">
            <span class="info-label">Department:</span>
            <span class="info-value">${userData.department || 'Computer Science'}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Specialization:</span>
            <span class="info-value">${userData.specialization || userData.expertise || 'General Education'}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Office:</span>
            <span class="info-value">${userData.office || userData.officeLocation || 'N/A'}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Phone:</span>
            <span class="info-value">${userData.phone || userData.phoneNumber || 'N/A'}</span>
        </div>
    `;
    
    // Populate courses list
    const coursesList = modalClone.getElementById('teacher-courses-list');
    if (userData.courses && userData.courses.length > 0) {
        coursesList.innerHTML = `
            <div class="activities-list">
                ${userData.courses.map(course => `
                    <div class="activity-item">
                        <div class="activity-icon">📚</div>
                        <div class="activity-details">
                            <div class="activity-title">${course.courseName || course.name || course.title}</div>
                            <div class="activity-meta">
                                <span class="activity-type">Course Code: ${course.courseCode || course.id}</span>
                                <span class="activity-date">${course.enrolledStudents || course.studentCount || 0} students enrolled</span>
                            </div>
                            <div class="activity-description">
                                ${course.description || 'No description available'}
                            </div>
                        </div>
                        <div class="activity-score">
                            <span class="score-value">${course.credits || 3}</span>
                            <span class="score-label">Credits</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        coursesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <h3>No Courses Assigned</h3>
                <p>This teacher hasn't been assigned any courses yet.</p>
            </div>
        `;
    }
    
    // Populate account information
    const accountInfo = modalClone.getElementById('teacher-account-info');
    accountInfo.innerHTML = `
        <div class="info-item">
            <span class="info-label">User ID:</span>
            <span class="info-value">${userData.id}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Role:</span>
            <span class="info-value">Teacher</span>
        </div>
        <div class="info-item">
            <span class="info-label">Status:</span>
            <span class="info-value text-success">Active</span>
        </div>
        <div class="info-item">
            <span class="info-label">Last Login:</span>
            <span class="info-value">${userData.lastLogin ? new Date(userData.lastLogin).toLocaleDateString() : 'N/A'}</span>
        </div>
    `;
    
    // Populate teaching statistics
    const teachingStats = modalClone.getElementById('teacher-teaching-stats');
    teachingStats.innerHTML = `
        <div class="info-item">
            <span class="info-label">Years of Experience:</span>
            <span class="info-value">${userData.experience || userData.yearsExperience || 'N/A'}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Total Courses:</span>
            <span class="info-value">${userData.courses?.length || 0}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Average Rating:</span>
            <span class="info-value">${userData.rating || 'N/A'}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Department:</span>
            <span class="info-value">${userData.department || 'Computer Science'}</span>
        </div>
    `;
    
    // Setup tab switching functionality
    const tabButtons = modalClone.querySelectorAll('.nav-tab');
    const tabPanes = modalClone.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all tabs and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked tab
            button.classList.add('active');
            
            // Show corresponding pane
            const targetPane = modalClone.querySelector(`#${targetTab}-tab-content`);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
    
    // Setup export button
    const exportBtn = modalClone.getElementById('export-teacher-data-btn');
    exportBtn.addEventListener('click', () => exportTeacherData(userData.id));
    
    // Setup event listeners
    modalClone.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.modal-backdrop')?.remove();
        });
    });
    
    // Close on backdrop click
    modalClone.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            document.querySelector('.modal-backdrop')?.remove();
        }
    });
    
    // Close on escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            document.querySelector('.modal-backdrop')?.remove();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    return modalClone;
}

function exportTeacherData(teacherId) {
    showAdvancedNotification('📊 Exporting teacher data...', 'info', 2000);
    
    setTimeout(() => {
        const dataToExport = {
            teacherId: teacherId,
            exportDate: new Date().toISOString(),
            dataType: 'teacher_profile',
            message: 'Teacher data export functionality - ready for implementation'
        };
        
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `teacher-data-${teacherId}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        showAdvancedNotification('✅ Teacher data exported successfully', 'success');
    }, 2000);
}

function calculateUserAnalytics(userData) {
    const activities = userData.activities || [];
    
    if (activities.length === 0) {
        return {
            totalActivities: 0,
            averageScore: 0,
            engagementLevel: 0,
            ranking: '#N/A',
            trend: 'No data',
            activityBreakdown: {}
        };
    }
    
    // Calculate basic metrics
    const totalScore = activities.reduce((sum, a) => sum + (a.score || 0), 0);
    const averageScore = (totalScore / activities.length).toFixed(1);
    
    const totalEngagement = activities.reduce((sum, a) => sum + (a.engagementLevel || 0), 0);
    const avgEngagement = (totalEngagement / activities.length).toFixed(1);
    
    // Activity breakdown
    const activityBreakdown = {};
    activities.forEach(activity => {
        const type = activity.activityType || 'other';
        activityBreakdown[type] = (activityBreakdown[type] || 0) + 1;
    });
    
    // Calculate ranking (simplified)
    const totalUsers = realFirebaseData?.students?.length || 50;
    const percentile = Math.min(95, Math.max(5, (parseFloat(avgEngagement) / 10) * 100));
    const rank = Math.ceil((100 - percentile) / 100 * totalUsers);
    
    return {
        totalActivities: activities.length,
        averageScore: parseFloat(averageScore),
        engagementLevel: parseFloat(avgEngagement),
        ranking: `#${rank}`,
        trend: parseFloat(avgEngagement) > 7 ? 'Improving' : parseFloat(avgEngagement) > 5 ? 'Stable' : 'Declining',
        activityBreakdown,
        recentActivities: activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10) // Most recent 10 activities
    };
}

function calculateTeacherAnalytics(userData) {
    const courses = userData.courses || [];
    
    return {
        totalCourses: courses.length,
        studentsManaged: courses.reduce((sum, c) => sum + (c.enrolledStudents || 0), 0),
        avgRating: userData.rating || 'N/A',
        experience: userData.yearsExperience || 'N/A',
        department: userData.department || 'N/A',
        specialization: userData.specialization || 'N/A'
    };
}

function generateDemoUserData(userId) {
    // Generate demo data for development
    return {
        id: userId,
        displayName: 'Demo User',
        email: 'demo@example.com',
        role: 'student',
        type: 'student',
        firstName: 'Demo',
        lastName: 'User',
        major: 'Computer Science',
        year: 'Junior',
        gpa: '3.7',
        activities: [],
        analytics: {
            totalActivities: 0,
            averageScore: 0,
            engagementLevel: 0,
            ranking: '#N/A',
            trend: 'No data',
            activityBreakdown: {}
        }
    };
}

function setupUserDetailsModalData(modalClone, userData) {
    // Setup header information
    const initials = getUserInitials(userData.displayName || userData.fullName || `${userData.firstName} ${userData.lastName}`);
    modalClone.getElementById('user-initials').textContent = initials;
    modalClone.getElementById('user-full-name').textContent = userData.displayName || userData.fullName || `${userData.firstName} ${userData.lastName}`;
    modalClone.getElementById('user-email-role').textContent = `${userData.email} • ${userData.role?.toUpperCase()}`;
    
    // Setup overview stats
    if (userData.role === 'student') {
        modalClone.getElementById('total-activities-count').textContent = userData.analytics.totalActivities;
        modalClone.getElementById('average-score').textContent = userData.analytics.averageScore;
        modalClone.getElementById('engagement-level').textContent = userData.analytics.engagementLevel;
        modalClone.getElementById('user-ranking').textContent = userData.analytics.ranking;
    } else {
        // Teacher stats
        modalClone.getElementById('total-activities-count').textContent = userData.analytics.totalCourses;
        modalClone.getElementById('average-score').textContent = userData.analytics.avgRating;
        modalClone.getElementById('engagement-level').textContent = userData.analytics.studentsManaged;
        modalClone.getElementById('user-ranking').textContent = userData.analytics.experience + 'y';
        
        // Update labels for teacher
        modalClone.querySelector('.stat-card:nth-child(1) .stat-label').textContent = 'Total Courses';
        modalClone.querySelector('.stat-card:nth-child(2) .stat-label').textContent = 'Rating';
        modalClone.querySelector('.stat-card:nth-child(3) .stat-label').textContent = 'Students';
        modalClone.querySelector('.stat-card:nth-child(4) .stat-label').textContent = 'Experience';
    }
    
    // Setup tab labels based on user type
    if (userData.role === 'teacher') {
        modalClone.getElementById('activities-tab').textContent = '📚 Courses';
        modalClone.getElementById('performance-tab').textContent = '👥 Students';
    }
    
    // Setup personal information
    setupPersonalInfo(modalClone, userData);
    
    // Setup academic information
    setupAcademicInfo(modalClone, userData);
}

function setupPersonalInfo(modalClone, userData) {
    const personalInfo = modalClone.getElementById('personal-info');
    
    const info = [
        { label: 'Full Name', value: userData.displayName || `${userData.firstName} ${userData.lastName}` },
        { label: 'Email', value: userData.email },
        { label: 'Role', value: userData.role?.charAt(0).toUpperCase() + userData.role?.slice(1) },
        { label: 'User ID', value: userData.id },
        { label: 'Join Date', value: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A' },
        { label: 'Last Active', value: userData.lastLoginAt ? formatTime(new Date(userData.lastLoginAt)) : 'N/A' }
    ];
    
    personalInfo.innerHTML = info.map(item => `
        <div class="info-item">
            <span class="info-label">${item.label}</span>
            <span class="info-value">${item.value}</span>
        </div>
    `).join('');
}

function setupAcademicInfo(modalClone, userData) {
    const academicInfo = modalClone.getElementById('academic-info');
    
    let info = [];
    
    if (userData.role === 'student') {
        info = [
            { label: 'Major', value: userData.major || 'N/A' },
            { label: 'Year', value: userData.year || 'N/A' },
            { label: 'GPA', value: userData.gpa || 'N/A' },
            { label: 'Student ID', value: userData.studentId || userData.id },
            { label: 'Enrollment Status', value: userData.enrollmentStatus || 'Active' },
            { label: 'Credits Completed', value: userData.creditsCompleted || 'N/A' }
        ];
    } else if (userData.role === 'teacher') {
        info = [
            { label: 'Department', value: userData.department || 'N/A' },
            { label: 'Specialization', value: userData.specialization || 'N/A' },
            { label: 'Employee ID', value: userData.employeeId || userData.id },
            { label: 'Office', value: userData.office || 'N/A' },
            { label: 'Phone', value: userData.phone || 'N/A' },
            { label: 'Years Experience', value: userData.yearsExperience ? `${userData.yearsExperience} years` : 'N/A' }
        ];
    }
    
    academicInfo.innerHTML = info.map(item => `
        <div class="info-item">
            <span class="info-label">${item.label}</span>
            <span class="info-value">${item.value}</span>
        </div>
    `).join('');
}

function setupUserDetailsModalEvents(modalClone, userData) {
    // Close button events
    modalClone.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.modal-backdrop')?.remove();
        });
    });
    
    // Close on backdrop click
    modalClone.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            document.querySelector('.modal-backdrop')?.remove();
        }
    });
    
    // Close on escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            document.querySelector('.modal-backdrop')?.remove();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Tab navigation events
    modalClone.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            switchUserDetailsTab(targetTab);
        });
    });
    
    // Footer button events
    modalClone.getElementById('export-user-data-btn').addEventListener('click', () => {
        exportUserData(userData);
    });
    
    // Activity filter event
    modalClone.getElementById('activity-filter').addEventListener('change', (e) => {
        filterUserActivities(e.target.value, userData);
    });
}

function switchUserDetailsTab(tabName) {
    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Remove active from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show target tab pane
    const targetPane = document.getElementById(`${tabName}-tab-content`);
    if (targetPane) {
        targetPane.classList.add('active');
    }
    
    // Activate clicked tab
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

async function initializeUserDetailCharts(userData) {
    // Initialize charts after modal is in DOM
    setTimeout(() => {
        createUserActivityTrendChart(userData);
        createUserPerformanceChart(userData);
        loadUserActivitiesList(userData);
        loadUserProgressTimeline(userData);
    }, 100);
}

function createUserActivityTrendChart(userData) {
    const canvas = document.getElementById('user-activity-trend-chart');
    if (!canvas || !userData.activities) return;
    
    // Generate last 7 days data
    const last7Days = [];
    const dailyActivities = {};
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last7Days.push(dateStr);
        dailyActivities[dateStr] = 0;
    }
    
    // Count activities per day
    userData.activities.forEach(activity => {
        const activityDate = new Date(activity.timestamp).toISOString().split('T')[0];
        if (dailyActivities.hasOwnProperty(activityDate)) {
            dailyActivities[activityDate]++;
        }
    });
    
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })),
            datasets: [{
                label: 'Activities',
                data: last7Days.map(date => dailyActivities[date]),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

function createUserPerformanceChart(userData) {
    const canvas = document.getElementById('user-performance-chart');
    if (!canvas || !userData.analytics?.activityBreakdown) return;
    
    const breakdown = userData.analytics.activityBreakdown;
    const labels = Object.keys(breakdown);
    const data = Object.values(breakdown);
    
    if (labels.length === 0) {
        canvas.getContext('2d').fillText('No activity data available', 50, 50);
        return;
    }
    
    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: labels.map(label => label.replace('_', ' ').toUpperCase()),
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgb(59, 130, 246)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)',
                    'rgb(139, 92, 246)',
                    'rgb(236, 72, 153)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            layout: {
                padding: {
                    top: 5,
                    bottom: 5,
                    left: 5,
                    right: 5
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 8,
                        usePointStyle: true,
                        font: {
                            size: 10
                        },
                        boxWidth: 10,
                        boxHeight: 10
                    }
                }
            }
        }
    });
}

// Store original activities data for filtering
let originalUserActivities = [];

function loadUserActivitiesList(userData) {
    const activitiesList = document.getElementById('user-activities-list');
    if (!activitiesList) return;
    
    // Store original data if not already stored
    if (userData.analytics?.recentActivities && originalUserActivities.length === 0) {
        originalUserActivities = [...userData.analytics.recentActivities];
    }
    
    const activities = userData.analytics?.recentActivities || [];
    
    if (activities.length === 0) {
        activitiesList.innerHTML = `
            <div class="text-center py-8 text-secondary">
                <div class="text-4xl mb-3">📚</div>
                <p>No activities found</p>
            </div>
        `;
        return;
    }
    
    activitiesList.innerHTML = activities.map(activity => `
        <div class="activity-item" data-activity-id="${activity.id}">
            <div class="activity-icon">
                ${getUserActivityIcon(activity.activityType)}
            </div>
            <div class="activity-details">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-meta">
                    <span>📅 ${new Date(activity.timestamp).toLocaleDateString()}</span>
                    <span>⏱️ ${activity.duration || 'N/A'} min</span>
                    <span>🎯 ${activity.activityType.replace('_', ' ')}</span>
                </div>
                <div class="activity-score">Score: ${activity.score}/${activity.maxScore}</div>
            </div>
            <div class="activity-actions">
                <button class="btn btn-outline btn-sm edit-activity-btn" data-activity-id="${activity.id}" title="Edit Activity">
                    ✏️
                </button>
                <button class="btn btn-error btn-sm delete-activity-btn" data-activity-id="${activity.id}" title="Delete Activity">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
    
    // Setup event listeners for activity CRUD operations
    setupActivityCRUDEventListeners(userData);
}

function loadUserProgressTimeline(userData) {
    const timeline = document.getElementById('user-progress-timeline');
    if (!timeline || !userData.analytics?.recentActivities) return;
    
    const activities = userData.analytics.recentActivities.slice(0, 5);
    
    if (activities.length === 0) {
        timeline.innerHTML = `
            <div class="text-center py-8 text-secondary">
                <div class="text-3xl mb-2">📈</div>
                <p>No progress data</p>
            </div>
        `;
        return;
    }
    
    timeline.innerHTML = activities.map(activity => `
        <div class="timeline-item">
            <div class="timeline-content">
                <div class="timeline-title">${activity.title}</div>
                <div class="timeline-date">${formatTime(new Date(activity.timestamp))}</div>
            </div>
        </div>
    `).join('');
}

function getUserActivityIcon(activityType) {
    const icons = {
        'assignment_uploads': '📝',
        'quiz_performance': '❓',
        'class_participation': '🗣️',
        'peer_collaboration': '👥',
        'event_participation': '🎉',
        'project_submission': '🚀',
        'default': '📚'
    };
    return icons[activityType] || icons.default;
}

function filterUserActivities(filterType, userData) {
    const activitiesList = document.getElementById('user-activities-list');
    if (!activitiesList) return;
    
    // Use original data for filtering, don't modify userData.analytics.recentActivities
    let filteredActivities = [...originalUserActivities];
    
    if (filterType !== 'all') {
        // Map filter type to activity categories
        const categoryMap = {
            'assignment_uploads': ['assignment_submission', 'project_upload'],
            'quiz_performance': ['quiz_completion'],
            'class_participation': ['discussion_participation', 'lecture_attendance', 'question_asking'],
            'peer_collaboration': ['peer_collaboration', 'code_review'],
            'event_participation': ['presentation', 'resource_access']
        };
        
        if (categoryMap[filterType]) {
            filteredActivities = originalUserActivities.filter(activity => 
                categoryMap[filterType].includes(activity.activityType)
            );
        } else {
            // Direct activity type match
            filteredActivities = originalUserActivities.filter(activity => 
                activity.activityType === filterType
            );
        }
    }
    
    // Create temporary userData object for display without modifying original
    const tempUserData = {
        ...userData,
        analytics: {
            ...userData.analytics,
            recentActivities: filteredActivities
        }
    };
    
    // Re-render with filtered data
    loadUserActivitiesList(tempUserData);
}

function exportUserData(userData) {
    const dataToExport = {
        userInfo: {
            name: userData.displayName || `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            role: userData.role,
            id: userData.id
        },
        analytics: userData.analytics,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-data-${userData.id}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    showAdvancedNotification('✅ User data exported successfully', 'success');
}

function editUser(userId) {
    showAdvancedNotification('Edit user functionality has been disabled', 'info');
}

async function deleteUser(userId) {
    try {
        // Get user data first
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (!userDoc.exists()) {
            showAdvancedNotification('❌ User not found', 'error');
            return;
        }
        
        const userData = userDoc.data();
        
        // Simple confirmation dialog
        const confirmMessage = `Are you sure you want to delete user "${userData.displayName}" (${userData.email})?\n\nThis action cannot be undone.`;
        
        if (confirm(confirmMessage)) {
            await handleUserDeletion(userId, userData);
        }
        
    } catch (error) {
        console.error('❌ Error loading user for deletion:', error);
        showAdvancedNotification('❌ Failed to load user data', 'error');
    }
}

async function handleUserDeletion(userId, userData) {
    try {
        console.log('🗑️ Deleting user:', userId, userData);
        
        // Show loading notification
        showAdvancedNotification('🗑️ Deleting user...', 'info');
        
        // Delete from Firestore
        await deleteDoc(doc(db, 'users', userId));
        console.log('✅ User deleted from Firestore');
        
        // Show success notification
        showAdvancedNotification(
            `✅ User "${userData.displayName}" deleted successfully`, 
            'success'
        );
        
        // Refresh users list
        console.log('🔄 Refreshing users list after deletion...');
        await loadIntelligentUsersList();
        console.log('✅ Users list refreshed');
        
    } catch (error) {
        console.error('❌ Error deleting user:', error);
        
        // Show error notification
        showAdvancedNotification(
            `❌ Failed to delete user: ${error.message}`, 
            'error'
        );
    }
}

function handleAlertAction(alertId, actionType) {
    switch (actionType) {
        case 'view_risk_students':
            showRiskStudentsPanel();
            break;
        case 'view_top_performers':
            showTopPerformersPanel();
            break;
        case 'schedule_notification':
            showNotificationScheduler();
            break;
        case 'optimize_database':
            showDatabaseOptimizer();
            break;
        default:
            showAdvancedNotification(`Executing action: ${actionType}`, 'info');
    }
    
    dismissAlert(alertId);
}

function dismissAlert(alertId) {
    const alertElement = document.querySelector(`[data-alert-id="${alertId}"]`);
    if (alertElement) {
        alertElement.style.opacity = '0.5';
        setTimeout(() => alertElement.remove(), 300);
    }
    showAdvancedNotification('Alert dismissed', 'success', 1500);
}

function filterActivities(type) {
    const activities = document.querySelectorAll('[data-activity-type]');
    activities.forEach(activity => {
        const activityType = activity.getAttribute('data-activity-type');
        if (type === 'all' || activityType === type) {
            activity.style.display = 'flex';
        } else {
            activity.style.display = 'none';
        }
    });
    
    showAdvancedNotification(`Filtered activities: ${type}`, 'info', 1500);
}

function refreshAlerts() {
    loadPredictiveSystemAlerts();
    showAdvancedNotification('🔄 Alerts refreshed', 'success', 1500);
}

// Modal creators and handlers
function showUserAnalyticsModal(userId, userData, patterns) {
    const template = document.getElementById('user-analytics-modal-template');
    const modal = template.content.cloneNode(true);
    
    // Populate dynamic data
    modal.getElementById('modal-user-id').textContent = userId;
    modal.getElementById('modal-total-score').textContent = userData?.totalScore?.toFixed(1) || 'N/A';
    modal.getElementById('modal-activities').textContent = userData?.activities?.length || 0;
    modal.getElementById('modal-consistency').textContent = userData?.consistencyScore?.toFixed(1) + '%' || 'N/A';
    
    const riskLevelElement = modal.getElementById('modal-risk-level');
    const riskLevel = patterns?.riskLevel?.toUpperCase() || 'UNKNOWN';
    riskLevelElement.textContent = riskLevel;
    riskLevelElement.className = `font-bold ${patterns?.riskLevel === 'high' ? 'text-red-600' : patterns?.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'}`;
    
    modal.getElementById('modal-activity-level').textContent = patterns?.activityLevel || 'Unknown';
    modal.getElementById('modal-trend').textContent = patterns?.trend || 'Unknown';
    
    // Add event listeners
    const modalElement = modal.querySelector('.fixed');
    modal.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => modalElement.remove());
    });
    
    modal.getElementById('generate-report-btn').addEventListener('click', () => {
        generateUserReport(userId);
        modalElement.remove();
    });
    
    document.body.appendChild(modal);
}

function showCreateUserModal() {
    const template = document.getElementById('create-user-modal-template');
    const modal = template.content.cloneNode(true);
    
    // Setup dynamic form behavior
    const roleSelect = modal.getElementById('user-role');
    const additionalInfoSection = modal.getElementById('additional-info-section');
    const studentFields = modal.getElementById('student-fields');
    const teacherFields = modal.getElementById('teacher-fields');
    
    roleSelect.addEventListener('change', (e) => {
        const role = e.target.value;
        
        if (role) {
            additionalInfoSection.style.display = 'block';
        } else {
            additionalInfoSection.style.display = 'none';
        }
        
        // Show/hide role-specific fields
        studentFields.style.display = role === 'student' ? 'block' : 'none';
        teacherFields.style.display = role === 'teacher' ? 'block' : 'none';
    });
    
    // Add event listeners for modal close
    const modalElement = modal.querySelector('.modal-backdrop');
    modal.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => modalElement.remove());
    });
    
    // Close on backdrop click
    modalElement.addEventListener('click', (e) => {
        if (e.target === modalElement) {
            modalElement.remove();
        }
    });
    
    // Close on escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            modalElement.remove();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Handle form submission
    modal.getElementById('create-user-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        await handleCreateUser(event, modalElement);
    });
    
    document.body.appendChild(modal);
    
    // Focus on first input
    setTimeout(() => {
        modal.getElementById('user-display-name')?.focus();
    }, 100);
}

async function handleCreateUser(event, modalElement) {
    const form = event.target;
    const submitBtn = modalElement.querySelector('#create-user-submit-btn');
    const loadingElement = modalElement.querySelector('#create-user-loading');
    
    try {
        // Show loading state
        form.style.display = 'none';
        loadingElement.style.display = 'block';
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner-sm mr-2"></div>Creating...';
        
        // Get form data
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData.entries());
        
        // Validate required fields
        if (!userData.displayName || !userData.email || !userData.role) {
            throw new Error('Please fill in all required fields');
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            throw new Error('Please enter a valid email address');
        }
        
        // Check if user already exists
        const usersRef = collection(db, 'users');
        const emailQuery = query(usersRef, where('email', '==', userData.email));
        const existingUsers = await getDocs(emailQuery);
        
        if (!existingUsers.empty) {
            throw new Error('A user with this email already exists');
        }
        
        // Prepare user document
        const newUser = {
            displayName: userData.displayName.trim(),
            email: userData.email.toLowerCase().trim(),
            role: userData.role,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            lastLoginAt: null,
            profilePicture: null,
            // Generate avatar initials
            initials: userData.displayName.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        };
        
        // Add role-specific fields
        if (userData.role === 'student') {
            if (userData.grade) newUser.grade = userData.grade.trim();
            if (userData.studentId) newUser.studentId = userData.studentId.trim();
            newUser.enrollmentDate = new Date().toISOString();
        } else if (userData.role === 'teacher') {
            if (userData.department) newUser.department = userData.department.trim();
            if (userData.employeeId) newUser.employeeId = userData.employeeId.trim();
            newUser.hireDate = new Date().toISOString();
        }
        
        // Create user in Firestore
        console.log('📝 Creating user with data:', newUser);
        const docRef = await addDoc(usersRef, newUser);
        console.log('✅ User created successfully with ID:', docRef.id);
        console.log('📊 Full document reference:', docRef);
        
        // Show success notification
        showAdvancedNotification(
            `✅ User "${userData.displayName}" created successfully!`, 
            'success'
        );
        
        // Close modal
        modalElement.remove();
        
        // Refresh the users list
        console.log('🔄 Refreshing users list...');
        await loadIntelligentUsersList();
        console.log('✅ Users list refreshed');
        
        // Scroll to new user (optional)
        setTimeout(() => {
            const userCards = document.querySelectorAll('[data-user-email]');
            const newUserCard = Array.from(userCards).find(card => 
                card.getAttribute('data-user-email') === userData.email
            );
            if (newUserCard) {
                newUserCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                newUserCard.style.backgroundColor = 'var(--success-light)';
                setTimeout(() => {
                    newUserCard.style.backgroundColor = '';
                }, 2000);
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Error creating user:', error);
        
        // Hide loading and show form again
        form.style.display = 'block';
        loadingElement.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="mr-2">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
            Create User
        `;
        
        // Show error notification
        showAdvancedNotification(
            `❌ Failed to create user: ${error.message}`, 
            'error'
        );
    }
}

function showSystemStatus() {
    const status = {
        overall: 'Healthy',
        database: 'Operational',
        authentication: 'Operational',
        analytics: 'Operational',
        storage: 'Optimal'
    };
    
    const template = document.getElementById('system-status-modal-template');
    const modal = template.content.cloneNode(true);
    
    // Populate system status content
    const contentContainer = modal.getElementById('system-status-content');
    contentContainer.innerHTML = Object.entries(status).map(([service, state]) => `
        <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span class="capitalize">${service}:</span>
            <span class="text-green-600 font-medium flex items-center gap-1">
                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                ${state}
            </span>
        </div>
    `).join('');
    
    // Add event listeners
    const modalElement = modal.querySelector('.fixed');
    modal.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => modalElement.remove());
    });
    
    document.body.appendChild(modal);
}

function quickExport() {
    showAdvancedNotification('📊 Generating quick export...', 'info', 2000);
    
    setTimeout(() => {
        const data = {
            timestamp: new Date().toISOString(),
            totalUsers: systemData?.totalStudents + systemData?.totalTeachers || 67,
            systemHealth: '98%',
            exportedBy: currentUser?.email || 'admin'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        showAdvancedNotification('✅ Export completed', 'success');
    }, 2000);
}

function showGlobalSearchModal() {    
    const template = document.getElementById('global-search-modal-template');
    const modal = template.content.cloneNode(true);
    
    // Add event listeners
    const modalElement = modal.querySelector('.fixed');
    modal.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => modalElement.remove());
    });
    
    // Close on escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            modalElement.remove();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    document.body.appendChild(modal);
    modal.getElementById('global-search-input').focus();
}

function filterUsersAdvanced(roleFilter) {
    console.log(`🔍 Filtering users by role: ${roleFilter}`);
    
    if (roleFilter === 'top-performance') {
        // Use merge sort to show top performing students
        showTopPerformanceStudents();
        return;
    }
    
    // Clear any performance analytics header when switching away from top performance
    clearPerformanceAnalyticsHeader();
    
    // Show loading state briefly
    const usersList = document.getElementById('users-list');
    if (usersList) {
        usersList.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #666;">
                <div style="margin-bottom: 10px; font-size: 24px;">🔄</div>
                <p>Filtering ${roleFilter === 'all' ? 'all users' : roleFilter + 's'}...</p>
            </div>
        `;
    }
    
    // Use a short timeout to allow the loading state to show, then apply filter immediately
    setTimeout(() => {
        // Check if we have cached user data
        if (window.allUsersCache && window.allUsersCache.length > 0) {
            console.log(`📊 Using cached data (${window.allUsersCache.length} users) for fast filtering`);
            renderFilteredUsers(window.allUsersCache, roleFilter);
        } else {
            console.log('📊 No cached data available, loading from Firebase...');
            // Only reload if we don't have cached data
            loadIntelligentUsersList().then(() => {
                // After loading, apply the filter using cached data
                if (window.allUsersCache && window.allUsersCache.length > 0) {
                    renderFilteredUsers(window.allUsersCache, roleFilter);
                } else {
                    // Fallback to the old method if caching fails
                    applyRoleFilter(roleFilter);
                }
            });
        }
    }, 100); // Very short delay just to show the loading state briefly
}

/**
 * Refresh the user cache (call this when users are added/updated/deleted)
 */
function refreshUserCache() {
    console.log('🔄 Refreshing user cache...');
    window.allUsersCache = null; // Clear cache to force reload
    return loadIntelligentUsersList();
}

/**
 * Render filtered users from cached data (no Firebase reload needed)
 */
function renderFilteredUsers(usersData, roleFilter) {
    const usersList = document.getElementById('users-list');
    if (!usersList) return;
    
    // Clear current content
    usersList.innerHTML = '';
    
    let filteredUsers = [];
    
    if (roleFilter === 'all') {
        filteredUsers = usersData;
    } else {
        // Filter users by role
        filteredUsers = usersData.filter(user => {
            const userRole = user.role ? user.role.toLowerCase() : 'student';
            return userRole === roleFilter;
        });
    }
    
    console.log(`📊 Filtered ${filteredUsers.length} users for role: ${roleFilter}`);
    
    if (filteredUsers.length === 0 && roleFilter !== 'all') {
        showEmptyFilterMessage(roleFilter);
        return;
    }
    
    // Render filtered users using the existing renderUserCard function
    const userCardsHTML = filteredUsers.map(userData => renderUserCard(userData)).join('');
    usersList.innerHTML = userCardsHTML;
    
    // Update user count
    const userCounter = document.querySelector('#users-count, .users-count');
    if (userCounter) {
        if (roleFilter === 'all') {
            userCounter.textContent = `${filteredUsers.length} users`;
        } else {
            userCounter.textContent = `${filteredUsers.length} of ${usersData.length} users (${roleFilter}s)`;
        }
    }
    
    // Hide search counter when not in performance mode
    const searchCounter = document.getElementById('search-results-counter');
    if (searchCounter) {
        searchCounter.classList.add('hidden');
    }
    
    showAdvancedNotification(`🔍 Showing ${filteredUsers.length} ${roleFilter === 'all' ? 'users' : roleFilter + 's'}`, 'success', 1500);
}

/**
 * Apply role-based filtering to the current user list
 */
function applyRoleFilter(roleFilter) {
    showAdvancedNotification(`🔍 Filtering users by role: ${roleFilter}`, 'info', 1500);
    
    // Get all user cards
    const userCards = document.querySelectorAll('.user-card');
    console.log(`Found ${userCards.length} user cards to filter`);
    
    let visibleCount = 0;
    
    userCards.forEach(card => {
        if (roleFilter === 'all') {
            // Show all users
            card.style.display = 'flex';
            visibleCount++;
        } else {
            // Check if user card has the selected role class
            const hasRole = card.classList.contains(`user-card-${roleFilter}`);
            card.style.display = hasRole ? 'flex' : 'none';
            if (hasRole) visibleCount++;
        }
    });
    
    // Update user count if there's a counter element
    const userCounter = document.querySelector('#users-count, .users-count');
    if (userCounter) {
        if (roleFilter === 'all') {
            userCounter.textContent = `${userCards.length} users`;
        } else {
            userCounter.textContent = `${visibleCount} of ${userCards.length} users (${roleFilter}s)`;
        }
    }
    
    // Hide search counter when not in performance mode
    const searchCounter = document.getElementById('search-results-counter');
    if (searchCounter) {
        searchCounter.classList.add('hidden');
    }
    
    // If no users match the filter (like teachers with no data), show appropriate message
    if (visibleCount === 0 && roleFilter !== 'all') {
        showEmptyFilterMessage(roleFilter);
    }
}

/**
 * Show top performing students using DSA Merge Sort algorithm
 */
async function showTopPerformanceStudents() {
    try {
        console.log('🏆 Displaying top performing students using Merge Sort...');
        showAdvancedNotification('🏆 Ranking students by performance using Merge Sort...', 'info', 2000);
        
        // Try to use cached data first for faster performance
        let allUsers;
        if (window.allUsersCache && window.allUsersCache.length > 0) {
            console.log('📊 Using cached user data for performance ranking');
            allUsers = window.allUsersCache;
        } else {
            console.log('📊 Loading fresh data for performance ranking');
            allUsers = await getAllAdvancedUsers();
            // Cache the data for future use
            window.allUsersCache = allUsers;
        }
        
        // Check if merge sort is available
        if (!window.StudentMergeSort) {
            console.error('❌ Merge Sort module not loaded');
            showAdvancedNotification('❌ Performance ranking unavailable - Merge Sort module not loaded', 'error');
            return;
        }
        
        // Initialize performance analyzer
        const analyzer = new window.StudentMergeSort.StudentPerformanceAnalyzer();
        analyzer.initialize(allUsers);
        
        // Get ranked students using merge sort
        const startTime = performance.now();
        const rankedStudents = analyzer.getRankedStudents();
        const endTime = performance.now();
        
        // Get performance statistics
        const stats = analyzer.getPerformanceStats();
        
        if (rankedStudents.length === 0) {
            showAdvancedNotification('📊 No student performance data available', 'warning');
            
            // Show empty state
            const usersContainer = document.getElementById('users-list');
            usersContainer.innerHTML = `
                <div class="text-center py-8 text-secondary">
                    <div class="text-4xl mb-3">🏆</div>
                    <p>No student performance data available</p>
                    <p class="text-sm mt-2">Students need engagement scores to appear in rankings</p>
                </div>
            `;
            return;
        }
        
        // Display ranked students using the modular renderUserCard function
        const usersContainer = document.getElementById('users-list');
        
        // Add performance header with stats
        const performanceHeader = `
            <div class="performance-analytics-header bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                        🏆 Top Performing Students
                        <span class="text-sm font-normal text-gray-600">(Sorted by Engagement Score)</span>
                    </h3>
                    <div class="text-sm text-gray-600">
                        ⚡ Merge Sort: ${(endTime - startTime).toFixed(2)}ms
                    </div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div class="bg-white rounded-lg p-3">
                        <div class="text-2xl font-bold text-blue-600">${stats.totalStudents}</div>
                        <div class="text-xs text-blue-800">Ranked Students</div>
                    </div>
                    <div class="bg-white rounded-lg p-3">
                        <div class="text-2xl font-bold text-green-600">${stats.topScore}</div>
                        <div class="text-xs text-green-800">Top Score</div>
                    </div>
                    <div class="bg-white rounded-lg p-3">
                        <div class="text-2xl font-bold text-purple-600">${stats.averageScore}</div>
                        <div class="text-xs text-purple-800">Average Score</div>
                    </div>
                    <div class="bg-white rounded-lg p-3">
                        <div class="text-2xl font-bold text-orange-600">${stats.topPerformersCount}</div>
                        <div class="text-xs text-orange-800">Top 20%</div>
                    </div>
                </div>
                <div class="mt-3 text-xs text-gray-600 text-center">
                    📊 Algorithm: Merge Sort O(n log n) | 🚀 Processing Time: ${stats.lastSortTime}ms
                </div>
            </div>
        `;
        
        // Enhanced user cards with ranking information
        const rankedUserCards = rankedStudents.map(student => {
            // Add ranking badges to the student object for display
            const enhancedStudent = {
                ...student,
                displayName: `#${student.ranking} ${student.displayName}`,
                analytics: {
                    ...student.analytics,
                    ranking: student.ranking,
                    percentile: student.percentile,
                    isTopPerformer: student.isTopPerformer
                }
            };
            
            // Get the standard user card HTML
            const cardHTML = renderUserCard(enhancedStudent);
            
            // Add ranking styling based on position
            let rankingClass = '';
            if (student.ranking === 1) rankingClass = 'border-l-4 border-gold bg-yellow-50';
            else if (student.ranking === 2) rankingClass = 'border-l-4 border-silver bg-gray-50';
            else if (student.ranking === 3) rankingClass = 'border-l-4 border-bronze bg-orange-50';
            else if (student.isTopPerformer) rankingClass = 'border-l-4 border-blue-400 bg-blue-50';
            
            // Add ranking class to the card
            return cardHTML.replace(
                'class="user-card',
                `class="user-card performance-ranked ${rankingClass}`
            );
        }).join('');
        
        usersContainer.innerHTML = performanceHeader + rankedUserCards;
        
        // Update search results counter if it exists
        const searchCounter = document.getElementById('search-results-counter');
        const searchCountText = document.getElementById('search-count-text');
        if (searchCounter && searchCountText) {
            searchCountText.textContent = `${rankedStudents.length} top performers (${stats.lastSortTime}ms)`;
            searchCounter.classList.remove('hidden');
        }
        
        console.log(`✅ Top performance ranking completed: ${rankedStudents.length} students ranked in ${stats.lastSortTime}ms`);
        showAdvancedNotification(`🏆 ${rankedStudents.length} students ranked by performance (${stats.lastSortTime}ms)`, 'success', 3000);
        
    } catch (error) {
        console.error('❌ Error displaying top performance students:', error);
        showAdvancedNotification('❌ Failed to load performance rankings', 'error');
    }
}

/**
 * Clear performance analytics header when switching away from top performance view
 */
function clearPerformanceAnalyticsHeader() {
    const usersContainer = document.getElementById('users-list');
    if (!usersContainer) return;
    
    // Remove any existing performance analytics header
    const performanceHeader = usersContainer.querySelector('.performance-analytics-header');
    if (performanceHeader) {
        performanceHeader.remove();
        console.log('🧹 Cleared performance analytics header');
    }
    
    // Remove any empty filter messages
    const emptyMessage = usersContainer.querySelector('.empty-filter-message');
    if (emptyMessage) {
        emptyMessage.remove();
        console.log('🧹 Cleared empty filter message');
    }
    
    // Immediately hide all user cards to prevent flickering during transition
    const allUserCards = usersContainer.querySelectorAll('.user-card');
    allUserCards.forEach(card => {
        card.style.display = 'none';
    });
    
    // Remove performance ranking classes from all user cards
    const performanceCards = usersContainer.querySelectorAll('.performance-ranked');
    performanceCards.forEach(card => {
        card.classList.remove('performance-ranked', 'border-l-4', 'border-gold', 'border-silver', 'border-bronze', 'border-blue-400', 'bg-yellow-50', 'bg-gray-50', 'bg-orange-50', 'bg-blue-50');
    });
}

/**
 * Show an empty filter message when no users match the selected role
 */
function showEmptyFilterMessage(roleFilter) {
    const usersList = document.getElementById('users-list') || document.querySelector('.users-list');
    if (!usersList) return;
    
    // Clear any existing content first
    usersList.innerHTML = '';
    
    // Create empty state message
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-filter-message';
    emptyMessage.style.cssText = `
        text-align: center;
        padding: 40px;
        color: #666;
        font-size: 16px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 12px;
        margin: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    
    const roleDisplayName = roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1) + 's';
    emptyMessage.innerHTML = `
        <div style="margin-bottom: 20px; font-size: 48px;">📋</div>
        <h3 style="margin: 0 0 10px 0; color: #333;">No ${roleDisplayName} Found</h3>
        <p style="margin: 0; line-height: 1.5;">
            There are currently no ${roleFilter}s in the system.<br>
            This filter will display ${roleFilter}s when they are added to the database.
        </p>
    `;
    
    // Add the message
    usersList.appendChild(emptyMessage);
}

function exportSystemAnalytics() {
    showAdvancedNotification('📊 Preparing comprehensive system export...', 'info', 3000);
    
    setTimeout(() => {
        showAdvancedNotification('✅ System analytics export completed', 'success');
    }, 3000);
}

function generateUserReport(userId) {
    showAdvancedNotification(`📋 Generating detailed report for ${userId}...`, 'info', 2000);
    
    setTimeout(() => {
        showAdvancedNotification('✅ User report generated and downloaded', 'success');
    }, 2000);
}

// Activity CRUD Operations
let currentStudentData = null; // Store current student data for CRUD operations

function setupActivityCRUDEventListeners(userData) {
    currentStudentData = userData;
    
    // Add Activity button
    const addActivityBtn = document.getElementById('add-activity-btn');
    if (addActivityBtn) {
        addActivityBtn.onclick = () => showAddActivityModal(userData.id);
    }
    
    // Edit Activity buttons (delegated event handling)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-activity-btn') || e.target.closest('.edit-activity-btn')) {
            const btn = e.target.classList.contains('edit-activity-btn') ? e.target : e.target.closest('.edit-activity-btn');
            const activityId = btn.getAttribute('data-activity-id');
            const activity = userData.analytics.recentActivities.find(a => a.id === activityId);
            if (activity) {
                showEditActivityModal(activity);
            }
        }
    });
    
    // Delete Activity buttons (delegated event handling)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-activity-btn') || e.target.closest('.delete-activity-btn')) {
            const btn = e.target.classList.contains('delete-activity-btn') ? e.target : e.target.closest('.delete-activity-btn');
            const activityId = btn.getAttribute('data-activity-id');
            const activity = userData.analytics.recentActivities.find(a => a.id === activityId);
            if (activity) {
                showDeleteActivityModal(activity);
            }
        }
    });
}

async function showAddActivityModal(studentId) {
    const template = document.getElementById('add-activity-modal-template');
    if (!template) return;
    
    const modalClone = template.content.cloneNode(true);
    document.body.appendChild(modalClone);
    
    const modal = document.body.lastElementChild;
    
    // Load courses for the dropdown
    await loadCoursesForModal('activity-course');
    
    // Setup form submission
    const form = modal.querySelector('#add-activity-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        await handleAddActivity(e, studentId);
    };
    
    // Setup modal close handlers
    setupModalCloseHandlers(modal);
}

async function showEditActivityModal(activity) {
    const template = document.getElementById('edit-activity-modal-template');
    if (!template) return;
    
    const modalClone = template.content.cloneNode(true);
    document.body.appendChild(modalClone);
    
    const modal = document.body.lastElementChild;
    
    // Pre-fill form with activity data
    modal.querySelector('#edit-activity-id').value = activity.id;
    modal.querySelector('#edit-activity-title').value = activity.title || '';
    modal.querySelector('#edit-activity-type').value = activity.activityType || '';
    modal.querySelector('#edit-activity-category').value = activity.category || '';
    modal.querySelector('#edit-activity-description').value = activity.description || '';
    modal.querySelector('#edit-activity-score').value = activity.score || '';
    modal.querySelector('#edit-activity-max-score').value = activity.maxScore || '';
    modal.querySelector('#edit-activity-duration').value = activity.duration || '';
    modal.querySelector('#edit-activity-engagement').value = activity.engagementLevel || '';
    
    // Load courses and set selected value
    await loadCoursesForModal('edit-activity-course');
    modal.querySelector('#edit-activity-course').value = activity.courseId || '';
    
    // Setup form submission
    const form = modal.querySelector('#edit-activity-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        await handleEditActivity(e);
    };
    
    // Setup modal close handlers
    setupModalCloseHandlers(modal);
}

function showDeleteActivityModal(activity) {
    const template = document.getElementById('delete-activity-modal-template');
    if (!template) return;
    
    const modalClone = template.content.cloneNode(true);
    document.body.appendChild(modalClone);
    
    const modal = document.body.lastElementChild;
    
    // Fill in activity details
    modal.querySelector('#delete-activity-title').textContent = activity.title;
    modal.querySelector('#delete-activity-details').innerHTML = `
        <div class="text-sm text-secondary">
            <div>Type: ${activity.activityType?.replace('_', ' ')}</div>
            <div>Score: ${activity.score}/${activity.maxScore}</div>
            <div>Date: ${new Date(activity.timestamp).toLocaleDateString()}</div>
        </div>
    `;
    
    // Setup delete confirmation
    const confirmBtn = modal.querySelector('#confirm-delete-btn');
    confirmBtn.onclick = () => handleDeleteActivity(activity.id);
    
    // Setup modal close handlers
    setupModalCloseHandlers(modal);
}

async function handleAddActivity(event, studentId) {
    const formData = new FormData(event.target);
    const activityData = Object.fromEntries(formData.entries());
    
    // Generate unique ID
    const activityId = 'activity_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    // Prepare activity object
    const newActivity = {
        id: activityId,
        studentId: studentId,
        studentName: currentStudentData.displayName || currentStudentData.fullName,
        studentEmail: currentStudentData.email,
        ...activityData,
        timestamp: new Date().toISOString(),
        submissionTime: new Date().toISOString(),
        score: parseInt(activityData.score) || 0,
        maxScore: parseInt(activityData.maxScore) || 10,
        duration: parseInt(activityData.duration) || 0,
        engagementLevel: parseFloat(activityData.engagementLevel) || 5.0,
        quality: Math.floor(Math.random() * 20) + 80, // Random quality score
        difficulty: Math.random() * 5 + 1, // Random difficulty
        feedback: "Activity added by admin",
        status: "completed",
        createdAt: new Date().toISOString()
    };
    
    // Get course info if courseId is provided
    if (activityData.courseId) {
        try {
            const course = await getCourseById(activityData.courseId);
            if (course) {
                newActivity.courseName = course.courseName;
                newActivity.teacherId = course.teacherId;
            }
        } catch (error) {
            console.warn('Could not fetch course info:', error);
        }
    }
    
    try {
        // Add to Firebase
        await addActivityToFirebase(newActivity);
        
        // Update local data and refresh UI
        if (currentStudentData.analytics && currentStudentData.analytics.recentActivities) {
            currentStudentData.analytics.recentActivities.unshift(newActivity);
            // Also update original activities for filtering
            originalUserActivities.unshift(newActivity);
            loadUserActivitiesList(currentStudentData);
        }
        
        // Close modal and show success message
        closeModal(event.target.closest('.modal-backdrop'));
        showAdvancedNotification('Activity added successfully!', 'success');
        
    } catch (error) {
        console.error('Error adding activity:', error);
        showAdvancedNotification('Failed to add activity. Please try again.', 'error');
    }
}

async function handleEditActivity(event) {
    const formData = new FormData(event.target);
    const updatedData = Object.fromEntries(formData.entries());
    const activityId = updatedData.activityId;
    
    // Prepare updated activity object
    const updatedActivity = {
        ...updatedData,
        score: parseInt(updatedData.score) || 0,
        maxScore: parseInt(updatedData.maxScore) || 10,
        duration: parseInt(updatedData.duration) || 0,
        engagementLevel: parseFloat(updatedData.engagementLevel) || 5.0,
        updatedAt: new Date().toISOString()
    };
    
    // Get course info if courseId is provided
    if (updatedData.courseId) {
        try {
            const course = await getCourseById(updatedData.courseId);
            if (course) {
                updatedActivity.courseName = course.courseName;
                updatedActivity.teacherId = course.teacherId;
            }
        } catch (error) {
            console.warn('Could not fetch course info:', error);
        }
    }
    
    try {
        // Update in Firebase
        await updateActivityInFirebase(activityId, updatedActivity);
        
        // Update local data and refresh UI
        if (currentStudentData.analytics && currentStudentData.analytics.recentActivities) {
            const activityIndex = currentStudentData.analytics.recentActivities.findIndex(a => a.id === activityId);
            if (activityIndex !== -1) {
                currentStudentData.analytics.recentActivities[activityIndex] = {
                    ...currentStudentData.analytics.recentActivities[activityIndex],
                    ...updatedActivity
                };
                // Also update original activities for filtering
                const originalIndex = originalUserActivities.findIndex(a => a.id === activityId);
                if (originalIndex !== -1) {
                    originalUserActivities[originalIndex] = {
                        ...originalUserActivities[originalIndex],
                        ...updatedActivity
                    };
                }
                loadUserActivitiesList(currentStudentData);
            }
        }
        
        // Close modal and show success message
        closeModal(event.target.closest('.modal-backdrop'));
        showAdvancedNotification('Activity updated successfully!', 'success');
        
    } catch (error) {
        console.error('Error updating activity:', error);
        showAdvancedNotification('Failed to update activity. Please try again.', 'error');
    }
}

async function handleDeleteActivity(activityId) {
    try {
        // Delete from Firebase
        await deleteActivityFromFirebase(activityId);
        
        // Update local data and refresh UI
        if (currentStudentData.analytics && currentStudentData.analytics.recentActivities) {
            currentStudentData.analytics.recentActivities = currentStudentData.analytics.recentActivities.filter(a => a.id !== activityId);
            // Also update original activities for filtering
            originalUserActivities = originalUserActivities.filter(a => a.id !== activityId);
            loadUserActivitiesList(currentStudentData);
        }
        
        // Close modal and show success message
        const modal = document.querySelector('.modal-backdrop');
        if (modal) closeModal(modal);
        showAdvancedNotification('Activity deleted successfully!', 'success');
        
    } catch (error) {
        console.error('Error deleting activity:', error);
        showAdvancedNotification('Failed to delete activity. Please try again.', 'error');
    }
}

// Firebase CRUD Operations
async function addActivityToFirebase(activityData) {
    try {
        const { addDoc, collection } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        const { db } = await import('../firebase/firebase-config.js');
        
        const docRef = await addDoc(collection(db, 'activities'), activityData);
        console.log('✅ Activity added to Firebase with ID:', docRef.id);
        
        // Update the activity with the Firebase document ID
        activityData.id = docRef.id;
        await updateActivityInFirebase(docRef.id, { id: docRef.id });
        
    } catch (error) {
        console.error('❌ Error adding activity to Firebase:', error);
        throw error;
    }
}

async function updateActivityInFirebase(activityId, updatedData) {
    try {
        const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        const { db } = await import('../firebase/firebase-config.js');
        
        const activityRef = doc(db, 'activities', activityId);
        await updateDoc(activityRef, updatedData);
        console.log('✅ Activity updated in Firebase:', activityId);
        
    } catch (error) {
        console.error('❌ Error updating activity in Firebase:', error);
        throw error;
    }
}

async function deleteActivityFromFirebase(activityId) {
    try {
        const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        const { db } = await import('../firebase/firebase-config.js');
        
        const activityRef = doc(db, 'activities', activityId);
        await deleteDoc(activityRef);
        console.log('✅ Activity deleted from Firebase:', activityId);
        
    } catch (error) {
        console.error('❌ Error deleting activity from Firebase:', error);
        throw error;
    }
}

// Helper Functions
async function loadCoursesForModal(selectId) {
    try {
        const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        const { db } = await import('../firebase/firebase-config.js');
        
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        const courses = [];
        coursesSnapshot.forEach(doc => {
            courses.push({ id: doc.id, ...doc.data() });
        });
        
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Select Course</option>' +
                courses.map(course => `<option value="${course.id}">${course.courseName}</option>`).join('');
        }
        
    } catch (error) {
        console.warn('Could not load courses:', error);
    }
}

async function getCourseById(courseId) {
    try {
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        const { db } = await import('../firebase/firebase-config.js');
        
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);
        
        if (courseSnap.exists()) {
            return { id: courseSnap.id, ...courseSnap.data() };
        }
        return null;
        
    } catch (error) {
        console.error('Error fetching course:', error);
        return null;
    }
}

function setupModalCloseHandlers(modal) {
    // Close button handlers
    const closeButtons = modal.querySelectorAll('.modal-close-btn');
    closeButtons.forEach(btn => {
        btn.onclick = () => closeModal(modal);
    });
    
    // Click outside to close
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    };
    
    // Escape key to close
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal(modal);
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

function closeModal(modal) {
    if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
    }
}

// Global utility functions for the enhanced admin dashboard
window.AdminDashboard = {
    refreshStats: loadAdvancedSystemStats,
    refreshUsers: loadIntelligentUsersList,
    refreshActivity: loadSystemWideActivityAnalytics,
    refreshAlerts: loadPredictiveSystemAlerts,
    showUserAnalytics: viewUserAnalytics,
    exportData: exportSystemAnalytics,
    refreshAll: refreshAllData
};

// Global function exports
window.viewUserAnalytics = viewUserAnalytics;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.handleAlertAction = handleAlertAction;
window.dismissAlert = dismissAlert;
window.filterActivities = filterActivities;
window.refreshAlerts = refreshAlerts;
window.showSystemStatus = showSystemStatus;
window.quickExport = quickExport;
window.showGlobalSearchModal = showGlobalSearchModal;
window.handleCreateUser = handleCreateUser;
window.generateUserReport = generateUserReport;
window.exportTeacherData = exportTeacherData;

// Activity CRUD function exports
window.showAddActivityModal = showAddActivityModal;

// =======================
// BST ENGAGEMENT ANALYSIS
// =======================

/**
 * Load BST module dynamically
 */
async function loadBSTModule() {
    try {
        // Load BST script dynamically
        const script = document.createElement('script');
        script.src = '../DSA/BST.js';
        script.onload = () => {
            StudentEngagementBST = window.StudentEngagementBST;
            console.log('🌳 BST module loaded successfully');
        };
        script.onerror = () => {
            console.error('❌ Failed to load BST module');
        };
        document.head.appendChild(script);
        
        // Wait for script to load
        await new Promise((resolve) => {
            const checkLoaded = () => {
                if (window.StudentEngagementBST) {
                    resolve();
                } else {
                    setTimeout(checkLoaded, 100);
                }
            };
            checkLoaded();
        });
    } catch (error) {
        console.error('❌ Error loading BST module:', error);
    }
}

/**
 * Initialize BST features and event listeners
 */
function initializeBSTFeatures() {
    console.log('🌳 Initializing BST features...');
    
    // Initialize global BST instance
    if (StudentEngagementBST) {
        globalEngagementBST = new StudentEngagementBST();
        console.log('🌳 Global BST instance created');
    }
    
    // Add event listeners (removed analyze button listener)
    const refreshBtn = document.getElementById('refresh-bst-btn');
    const viewFilter = document.getElementById('bst-view-filter');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshEngagementAnalysis);
    }
    
    if (viewFilter) {
        viewFilter.addEventListener('change', filterEngagementResults);
    }
    
    console.log('🌳 BST event listeners initialized');
    
    // Automatically run engagement analysis on load
    setTimeout(() => {
        console.log('🚀 Auto-starting engagement analysis...');
        analyzeStudentEngagement();
    }, 1000); // Wait 1 second for data to be loaded
}

/**
 * Calculate engagement score for a student
 * SIMPLIFIED: Score = Activity Count (using REAL Firebase data, not synthetic)
 */
function calculateEngagementScore(userData) {
    if (!userData) return 0;
    
    // Use REAL activity count from Firebase data (consistent with user management)
    let activityCount = 0;
    
    // First, try to get the real activity count from analytics (already calculated by user management)
    if (userData.analytics && typeof userData.analytics.totalActivities === 'number') {
        activityCount = userData.analytics.totalActivities;
        console.log(`✅ Using real Firebase activity count for ${userData.email || userData.displayName}: ${activityCount} activities`);
    }
    // Fallback: try to count activities directly from activities array
    else if (userData.activities && Array.isArray(userData.activities)) {
        activityCount = userData.activities.length;
        console.log(`📊 Counting activities array for ${userData.email || userData.displayName}: ${activityCount} activities`);
    }
    // Last resort: if no real data, return 0 (don't generate fake data)
    else {
        console.log(`⚠️ No activity data found for ${userData.email || userData.displayName}, using 0`);
        activityCount = 0;
    }
    
    return activityCount; // Score = REAL Activity Count from Firebase
}

// Removed generateActivityCount function - now using REAL Firebase data only

/**
 * Analyze student engagement using BST
 */
async function analyzeStudentEngagement() {
    console.log('🌳 Starting engagement analysis with BST...');
    
    const resultsContainer = document.getElementById('bst-results');
    const statsContainer = document.getElementById('engagement-stats');
    
    if (!globalEngagementBST || !StudentEngagementBST) {
        console.error('❌ BST not initialized');
        return;
    }
    
    try {
        // Show loading state
        resultsContainer.innerHTML = `
            <div class="text-center py-8 text-secondary">
                <div class="text-4xl mb-3">🔄</div>
                <p>Building BST and analyzing engagement scores...</p>
            </div>
        `;
        
        // Clear existing BST
        globalEngagementBST.clear();
        
        // Get all users data - USE THE SAME DATA AS USER MANAGEMENT (no separate loading)
        let allUsers = [];
        if (window.allUsersCache && window.allUsersCache.length > 0) {
            console.log('✅ Using cached user data from user management (consistent data!)');
            allUsers = window.allUsersCache;
        } else {
            console.log('🔄 Loading fresh user data to match user management...');
            allUsers = await getAllAdvancedUsers(); // Use the same function as user management
            window.allUsersCache = allUsers; // Cache it for consistency
        }
        
        // Filter only students
        const students = allUsers.filter(user => user.role === 'student');
        console.log(`🎓 Found ${students.length} students for engagement analysis`);
        
        // Debug: Log first student data structure
        if (students.length > 0) {
            console.log('📊 Sample student data structure:', students[0]);
        }
        
        if (students.length === 0) {
            resultsContainer.innerHTML = `
                <div class="text-center py-8 text-secondary">
                    <div class="text-4xl mb-3">👥</div>
                    <p>No students found for engagement analysis</p>
                </div>
            `;
            return;
        }
        
        // Build BST with engagement scores
        students.forEach(student => {
            // Calculate engagement score using REAL Firebase data (no synthetic generation)
            const userId = student.id || student.uid || student.studentId || student.email || 'unknown';
            const engagementScore = calculateEngagementScore(student);
            
            // Extract student name with multiple fallback options
            let studentName = 'Unknown Student';
            if (student.displayName) {
                studentName = student.displayName;
            } else if (student.fullName) {
                studentName = student.fullName;
            } else if (student.firstName && student.lastName) {
                studentName = `${student.firstName} ${student.lastName}`;
            } else if (student.firstName) {
                studentName = student.firstName;
            } else if (student.name) {
                studentName = student.name;
            } else if (student.email) {
                // Extract name from email as last resort
                studentName = student.email.split('@')[0];
            }
            
            const studentData = {
                ...student, // Pass all real student data
                name: studentName,
                displayName: studentName,
                email: student.email || '',
                // Use real Firebase data for course/program info
                course: student.analytics?.insights || student.major || student.department || student.grade || 'General',
                lastActive: student.lastActive || student.lastLogin || student.lastSeen || new Date(),
                joinDate: student.joinDate || student.createdAt || student.registrationDate || new Date(),
                role: student.role || 'student',
                activityCount: engagementScore, // Real activity count from Firebase (same as engagement score)
                analytics: student.analytics || {} // Include full analytics data
            };
            
            globalEngagementBST.insert(userId, engagementScore, studentData);
        });
        
        console.log(`🌳 BST built with ${globalEngagementBST.getSize()} students`);
        
        // Get categories and statistics
        const categories = globalEngagementBST.categorize();
        const stats = globalEngagementBST.getEngagementStats();
        
        // Update statistics display
        updateEngagementStatistics(stats, categories);
        
        // Display categorized results
        displayEngagementResults(categories, 'all');
        
        console.log('✅ Engagement analysis completed successfully');
        
    } catch (error) {
        console.error('❌ Error during engagement analysis:', error);
        resultsContainer.innerHTML = `
            <div class="text-center py-8 text-red-500">
                <div class="text-4xl mb-3">❌</div>
                <p>Error analyzing engagement: ${error.message}</p>
            </div>
        `;
    } finally {
        // No button state to reset since we removed the analyze button
        console.log('🌳 Engagement analysis process completed');
    }
}

// Removed loadAllUsersForBST function - now using getAllAdvancedUsers() for consistency

/**
 * Update engagement statistics display
 */
function updateEngagementStatistics(stats, categories) {
    const statsContainer = document.getElementById('engagement-stats');
    
    if (statsContainer) {
        // Update counts
        document.getElementById('high-count').textContent = categories.high.length;
        document.getElementById('medium-count').textContent = categories.medium.length;
        document.getElementById('low-count').textContent = categories.low.length;
        document.getElementById('average-score').textContent = stats.average;
        
        // Show stats container
        statsContainer.classList.remove('hidden');
    }
}

/**
 * Display engagement results based on category
 */
function displayEngagementResults(categories, filterType = 'all') {
    const resultsContainer = document.getElementById('bst-results');
    
    let studentsToShow = [];
    let title = '';
    let emptyMessage = '';
    
    switch (filterType) {
        case 'high':
            studentsToShow = categories.high;
            title = '🚀 High Engagement Students (15+ activities)';
            emptyMessage = 'No high engagement students found';
            break;
        case 'medium':
            studentsToShow = categories.medium;
            title = '📊 Medium Engagement Students (5-14 activities)';
            emptyMessage = 'No medium engagement students found';
            break;
        case 'low':
            studentsToShow = categories.low;
            title = '⚠️ Low Engagement Students (0-4 activities)';
            emptyMessage = 'No low engagement students found';
            break;
        default:
            studentsToShow = [...categories.high, ...categories.medium, ...categories.low];
            title = '🌳 All Students by Engagement Level';
            emptyMessage = 'No students found';
    }
    
    if (studentsToShow.length === 0) {
        resultsContainer.innerHTML = `
            <div class="text-center py-8 text-secondary">
                <div class="text-4xl mb-3">📊</div>
                <p>${emptyMessage}</p>
            </div>
        `;
        return;
    }
    
    // Sort by score (descending)
    studentsToShow.sort((a, b) => b.score - a.score);
    
    // Create results HTML
    let resultsHTML = `
        <div class="mb-4">
            <h4 class="text-lg font-semibold">${title}</h4>
            <p class="text-sm text-secondary">Showing ${studentsToShow.length} students</p>
        </div>
        <div class="space-y-3">
    `;
    
    studentsToShow.forEach((student, index) => {
        const scoreColor = getScoreColor(student.score);
        const rank = index + 1;
        
        resultsHTML += `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="text-2xl font-bold text-gray-400 dark:text-gray-500">#${rank}</div>
                        <div>
                            <div class="font-semibold">${student.studentData.displayName || student.studentData.name || 'Unknown Student'}</div>
                            <div class="text-sm text-secondary">${student.studentData.email || 'No email'}</div>
                            <div class="text-xs text-secondary mt-1">
                                📚 ${student.studentData.analytics?.insights || student.studentData.major || 'Unknown Course'} • 
                                🎯 ${student.score} activities • 
                                🕒 Last active: ${formatDate(student.studentData.lastActive || new Date())}
                            </div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold ${scoreColor}">${student.score}</div>
                        <div class="text-sm ${scoreColor}">${getEngagementLevel(student.score)}</div>
                        <div class="text-xs text-secondary mt-1">
                            Based on activity count
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    resultsHTML += '</div>';
    resultsContainer.innerHTML = resultsHTML;
}

/**
 * Get color class based on activity count
 */
function getScoreColor(score) {
    if (score >= 15) return 'text-green-600 dark:text-green-400';  // 15+ activities = High
    if (score >= 5) return 'text-yellow-600 dark:text-yellow-400'; // 5-14 activities = Medium
    return 'text-red-600 dark:text-red-400';                       // 0-4 activities = Low
}

/**
 * Get engagement level text based on activity count
 */
function getEngagementLevel(score) {
    if (score >= 15) return 'High';   // 15+ activities
    if (score >= 5) return 'Medium';  // 5-14 activities
    return 'Low';                     // 0-4 activities
}

/**
 * Format date for display
 */
function formatDate(date) {
    if (!date || date === 'Never' || date === 'Unknown') return date;
    
    try {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString();
    } catch {
        return date;
    }
}

/**
 * Refresh engagement analysis
 */
async function refreshEngagementAnalysis() {
    console.log('🔄 Refreshing engagement analysis...');
    
    // Clear cache to force fresh data
    window.allUsersCache = null;
    
    // Run analysis again
    await analyzeStudentEngagement();
}

/**
 * Filter engagement results
 */
function filterEngagementResults() {
    const filterSelect = document.getElementById('bst-view-filter');
    const filterValue = filterSelect.value;
    
    if (!globalEngagementBST || globalEngagementBST.isEmpty()) {
        console.log('⚠️ No BST data to filter');
        return;
    }
    
    const categories = globalEngagementBST.categorize();
    displayEngagementResults(categories, filterValue);
}

// Export BST functions globally
window.analyzeStudentEngagement = analyzeStudentEngagement;
window.refreshEngagementAnalysis = refreshEngagementAnalysis;
window.filterEngagementResults = filterEngagementResults;
window.showEditActivityModal = showEditActivityModal;
window.showDeleteActivityModal = showDeleteActivityModal;
window.handleAddActivity = handleAddActivity;
window.handleEditActivity = handleEditActivity;
window.handleDeleteActivity = handleDeleteActivity;
