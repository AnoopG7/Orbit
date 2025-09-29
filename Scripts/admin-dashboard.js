// Admin Dashboard JavaScript functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Simple authentication check - no role requirements
    const authResult = await AuthUtils.requireAuth();
    
    if (authResult) {
        const { user } = authResult;
        console.log('Initializing Admin Dashboard for user:', user.email);
        
        // Get full user profile for additional data
        const userProfile = await window.authManager.getUserProfile(user.uid);
        initializeAdminDashboard(user, userProfile);
    }
});

async function initializeAdminDashboard(user, userProfile) {
    // Initialize admin dashboard components
    await Promise.all([
        loadSystemStats(),
        loadUsersList(),
        loadActivityLog(),
        loadSystemAlerts()
    ]);
    
    // Setup event listeners
    setupEventListeners();
}

async function loadSystemStats() {
    try {
        // Simulate loading system stats - replace with actual Firebase queries
        const stats = await getSystemStats();
        
        document.getElementById('total-users').textContent = stats.totalUsers;
        document.getElementById('active-teachers').textContent = stats.activeTeachers;
        document.getElementById('system-health').textContent = `${stats.systemHealth}%`;
        document.getElementById('storage-used').textContent = `${stats.storageUsed}GB`;
        
    } catch (error) {
        console.error('Error loading system stats:', error);
        AuthUtils.showToast('Failed to load system statistics', 'error');
    }
}

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

async function loadUsersList() {
    try {
        const usersContainer = document.getElementById('users-list');
        const users = await getAllUsers();
        
        if (users.length === 0) {
            usersContainer.innerHTML = `
                <div class="text-center py-8 text-secondary">
                    <div class="text-4xl mb-3">👥</div>
                    <p>No users found</p>
                </div>
            `;
            return;
        }
        
        usersContainer.innerHTML = users.map(user => `
            <div class="flex items-center justify-between p-4 bg-tertiary rounded-lg">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-blue text-white flex items-center justify-center font-bold text-sm">
                        ${getUserInitials(user.displayName)}
                    </div>
                    <div>
                        <p class="font-medium">${user.displayName}</p>
                        <p class="text-sm text-secondary">${user.email}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="badge badge-${getRoleBadgeColor(user.role)}">${user.role.toUpperCase()}</span>
                    <div class="flex gap-1">
                        <button class="btn btn-ghost btn-sm" onclick="editUser('${user.id}')" title="Edit User">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
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
        `).join('');
        
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('users-list').innerHTML = `
            <div class="text-center py-8 text-error">
                <p>Failed to load users</p>
            </div>
        `;
    }
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

async function loadActivityLog() {
    try {
        const activityContainer = document.getElementById('activity-log');
        const activities = await getSystemActivity();
        
        if (activities.length === 0) {
            activityContainer.innerHTML = `
                <div class="text-center py-8 text-secondary">
                    <div class="text-4xl mb-3">📊</div>
                    <p>No recent system activity</p>
                </div>
            `;
            return;
        }
        
        activityContainer.innerHTML = activities.map(activity => `
            <div class="flex items-center justify-between p-3 bg-hover rounded-lg">
                <div class="flex items-center gap-3">
                    <div class="text-2xl">${getActivityIcon(activity.type)}</div>
                    <div>
                        <p class="font-medium text-sm">${activity.action}</p>
                        <p class="text-xs text-secondary">${activity.user} • ${formatTime(activity.timestamp)}</p>
                    </div>
                </div>
                <span class="badge badge-${getActivityBadgeColor(activity.type)}">${activity.type}</span>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading activity log:', error);
    }
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

async function loadSystemAlerts() {
    try {
        const alertsContainer = document.getElementById('system-alerts');
        const alerts = await getSystemAlerts();
        
        if (alerts.length === 0) {
            alertsContainer.innerHTML = `
                <div class="text-center py-4 text-secondary">
                    <div class="text-3xl mb-2">🛡️</div>
                    <p class="text-sm">All systems operational</p>
                </div>
            `;
            return;
        }
        
        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert alert-${alert.severity} p-3">
                <div class="flex items-start gap-2">
                    <div class="text-lg">${getAlertIcon(alert.severity)}</div>
                    <div class="flex-1">
                        <p class="font-medium text-sm">${alert.title}</p>
                        <p class="text-xs opacity-80">${alert.message}</p>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading system alerts:', error);
    }
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

function setupEventListeners() {
    // Add user button
    document.getElementById('add-user-btn').addEventListener('click', () => {
        AuthUtils.showToast('Add user feature coming soon!', 'info');
    });
    
    // Export data button
    document.getElementById('export-system-data-btn').addEventListener('click', () => {
        AuthUtils.showToast('System export feature coming soon!', 'info');
    });
    
    // Admin action buttons
    document.getElementById('manage-roles-btn').addEventListener('click', () => {
        AuthUtils.showToast('Role management feature coming soon!', 'info');
    });
    
    document.getElementById('system-settings-btn').addEventListener('click', () => {
        AuthUtils.showToast('System settings feature coming soon!', 'info');
    });
    
    document.getElementById('backup-data-btn').addEventListener('click', () => {
        AuthUtils.showToast('Backup feature coming soon!', 'info');
    });
    
    document.getElementById('view-analytics-btn').addEventListener('click', () => {
        AuthUtils.showToast('Analytics feature coming soon!', 'info');
    });
    
    // Role filter
    document.getElementById('role-filter').addEventListener('change', (e) => {
        filterUsers(e.target.value);
    });
    
    // Refresh users
    document.getElementById('refresh-users-btn').addEventListener('click', () => {
        loadUsersList();
        AuthUtils.showToast('Users refreshed', 'success');
    });
}

function filterUsers(roleFilter) {
    AuthUtils.showToast(`Filtering users by: ${roleFilter}`, 'info');
    // In a real implementation, you'd reload the users list with the filter
}

// Global functions for user management
function editUser(userId) {
    AuthUtils.showToast(`Editing user ${userId}`, 'info');
    // In a real implementation, open edit modal
}

function deleteUser(userId) {
    const confirmed = confirm('Are you sure you want to delete this user?');
    if (confirmed) {
        AuthUtils.showToast(`User ${userId} deleted`, 'success');
        // In a real implementation, delete from Firebase and refresh list
    }
}

// Global utility functions for the admin dashboard
window.AdminDashboard = {
    refreshStats: loadSystemStats,
    refreshUsers: loadUsersList,
    refreshActivity: loadActivityLog,
    refreshAlerts: loadSystemAlerts
};
