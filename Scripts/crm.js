// CRM (Customer Relationship Management) Page JavaScript functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Simple authentication check - no role requirements
    const authResult = await AuthUtils.requireAuth();
    
    if (authResult) {
        const { user } = authResult;
        console.log('Initializing CRM for user:', user.email);
        
        initializeCRM(user);
    }
});

async function initializeCRM(user) {
    try {
        // Initialize CRM components
        await Promise.all([
            loadCRMStats(),
            loadStudentsList(),
            loadRecentInteractions(),
            loadAttentionList(),
            loadUpcomingTasks(),
            initEngagementTrendChart()
        ]);
        
        // Setup event listeners
        setupCRMEventListeners();
        
        console.log('CRM initialized successfully');
    } catch (error) {
        console.error('Error initializing CRM:', error);
        AuthUtils.showToast('Failed to load CRM data', 'error');
    }
}

async function loadCRMStats() {
    try {
        // Simulate loading CRM statistics
        const stats = await getCRMStats();
        
        document.getElementById('total-students').textContent = stats.totalStudents;
        document.getElementById('active-engagements').textContent = stats.activeEngagements;
        document.getElementById('avg-engagement').textContent = `${stats.avgEngagement}%`;
        document.getElementById('followups-needed').textContent = stats.followupsNeeded;
        
    } catch (error) {
        console.error('Error loading CRM stats:', error);
    }
}

async function getCRMStats() {
    // Simulate API call - replace with actual Firebase queries
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                totalStudents: 156,
                activeEngagements: 89,
                avgEngagement: 78,
                followupsNeeded: 12
            });
        }, 500);
    });
}

async function loadStudentsList() {
    try {
        const students = await getStudentsData();
        const studentsContainer = document.getElementById('students-list');
        
        if (students.length === 0) {
            studentsContainer.innerHTML = `
                <div class="text-center py-8 text-secondary">
                    <div class="text-4xl mb-3">👨‍🎓</div>
                    <p>No students found</p>
                </div>
            `;
            return;
        }
        
        studentsContainer.innerHTML = students.map(student => `
            <div class="student-card p-4 border border-primary rounded-lg hover:border-blue transition-colors cursor-pointer" data-student-id="${student.id}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue to-purple flex items-center justify-center text-white font-bold">
                            ${student.initials}
                        </div>
                        <div>
                            <h4 class="font-semibold text-primary">${student.name}</h4>
                            <p class="text-sm text-muted">${student.email}</p>
                            <p class="text-xs text-secondary">ID: ${student.studentId}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="engagement-badge ${getEngagementBadgeClass(student.engagementLevel)}">
                                ${student.engagementLevel}
                            </span>
                        </div>
                        <p class="text-sm text-muted">Score: ${student.engagementScore}%</p>
                        <p class="text-xs text-secondary">Last active: ${student.lastActive}</p>
                    </div>
                </div>
                <div class="mt-3 flex gap-2">
                    <button class="btn btn-ghost btn-xs" onclick="viewStudentDetails('${student.id}')">
                        View Details
                    </button>
                    <button class="btn btn-ghost btn-xs" onclick="scheduleFollowup('${student.id}')">
                        Follow-up
                    </button>
                    <button class="btn btn-ghost btn-xs" onclick="sendMessage('${student.id}')">
                        Message
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading students list:', error);
    }
}

async function getStudentsData() {
    // Simulate API call - replace with actual Firebase queries
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: '1',
                    name: 'Alice Johnson',
                    email: 'alice.johnson@email.com',
                    studentId: 'STU001',
                    initials: 'AJ',
                    engagementLevel: 'High',
                    engagementScore: 92,
                    lastActive: '2 hours ago'
                },
                {
                    id: '2',
                    name: 'Bob Smith',
                    email: 'bob.smith@email.com',
                    studentId: 'STU002',
                    initials: 'BS',
                    engagementLevel: 'Medium',
                    engagementScore: 76,
                    lastActive: '1 day ago'
                },
                {
                    id: '3',
                    name: 'Carol Davis',
                    email: 'carol.davis@email.com',
                    studentId: 'STU003',
                    initials: 'CD',
                    engagementLevel: 'Low',
                    engagementScore: 45,
                    lastActive: '3 days ago'
                },
                {
                    id: '4',
                    name: 'David Wilson',
                    email: 'david.wilson@email.com',
                    studentId: 'STU004',
                    initials: 'DW',
                    engagementLevel: 'High',
                    engagementScore: 88,
                    lastActive: '30 minutes ago'
                },
                {
                    id: '5',
                    name: 'Emma Brown',
                    email: 'emma.brown@email.com',
                    studentId: 'STU005',
                    initials: 'EB',
                    engagementLevel: 'At Risk',
                    engagementScore: 32,
                    lastActive: '1 week ago'
                }
            ]);
        }, 700);
    });
}

function getEngagementBadgeClass(level) {
    switch (level) {
        case 'High': return 'badge-success';
        case 'Medium': return 'badge-warning';
        case 'Low': return 'badge-error';
        case 'At Risk': return 'badge-danger';
        default: return 'badge-secondary';
    }
}

async function loadRecentInteractions() {
    try {
        const interactions = await getRecentInteractions();
        const interactionsContainer = document.getElementById('recent-interactions');
        
        if (interactions.length === 0) {
            interactionsContainer.innerHTML = `
                <div class="text-center py-8 text-secondary">
                    <div class="text-4xl mb-3">💬</div>
                    <p>No recent interactions</p>
                </div>
            `;
            return;
        }
        
        interactionsContainer.innerHTML = interactions.map(interaction => `
            <div class="interaction-item p-4 bg-tertiary rounded-lg">
                <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded-full bg-blue flex items-center justify-center text-white text-sm font-bold">
                        ${interaction.studentInitials}
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="font-medium text-primary">${interaction.studentName}</span>
                            <span class="interaction-type-badge ${getInteractionTypeBadge(interaction.type)}">
                                ${interaction.type}
                            </span>
                        </div>
                        <p class="text-sm text-secondary mb-2">${interaction.description}</p>
                        <div class="flex items-center gap-4 text-xs text-muted">
                            <span>${interaction.timestamp}</span>
                            <span>${interaction.channel}</span>
                        </div>
                    </div>
                    <button class="btn btn-ghost btn-xs" onclick="followUpInteraction('${interaction.id}')">
                        Follow-up
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading recent interactions:', error);
    }
}

async function getRecentInteractions() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: '1',
                    studentName: 'Alice Johnson',
                    studentInitials: 'AJ',
                    type: 'Question',
                    description: 'Asked about assignment deadline extension for Project Alpha',
                    timestamp: '2 hours ago',
                    channel: 'Email'
                },
                {
                    id: '2',
                    studentName: 'David Wilson',
                    studentInitials: 'DW',
                    type: 'Feedback',
                    description: 'Provided positive feedback on recent lecture content',
                    timestamp: '4 hours ago',
                    channel: 'In-person'
                },
                {
                    id: '3',
                    studentName: 'Emma Brown',
                    studentInitials: 'EB',
                    type: 'Concern',
                    description: 'Expressed difficulty with course material - needs support',
                    timestamp: '1 day ago',
                    channel: 'Phone'
                }
            ]);
        }, 600);
    });
}

function getInteractionTypeBadge(type) {
    switch (type) {
        case 'Question': return 'badge-info';
        case 'Feedback': return 'badge-success';
        case 'Concern': return 'badge-warning';
        case 'Complaint': return 'badge-error';
        default: return 'badge-secondary';
    }
}

async function loadAttentionList() {
    try {
        const attentionItems = await getAttentionItems();
        const attentionContainer = document.getElementById('attention-list');
        
        if (attentionItems.length === 0) {
            attentionContainer.innerHTML = `
                <div class="text-center py-6 text-secondary">
                    <div class="text-3xl mb-2">✅</div>
                    <p class="text-sm">All students on track!</p>
                </div>
            `;
            return;
        }
        
        attentionContainer.innerHTML = attentionItems.map(item => `
            <div class="attention-item p-3 bg-tertiary rounded-lg border-l-4 border-${item.priority === 'high' ? 'error' : 'warning'}">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-primary">${item.studentName}</span>
                    <span class="priority-badge badge-${item.priority === 'high' ? 'error' : 'warning'} text-xs">
                        ${item.priority.toUpperCase()}
                    </span>
                </div>
                <p class="text-sm text-secondary mb-2">${item.reason}</p>
                <div class="flex gap-2">
                    <button class="btn btn-ghost btn-xs" onclick="contactStudent('${item.studentId}')">Contact</button>
                    <button class="btn btn-ghost btn-xs" onclick="scheduleFollowup('${item.studentId}')">Schedule</button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading attention list:', error);
    }
}

async function getAttentionItems() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    studentId: '3',
                    studentName: 'Carol Davis',
                    reason: 'Low engagement for 2 weeks',
                    priority: 'medium'
                },
                {
                    studentId: '5',
                    studentName: 'Emma Brown',
                    reason: 'Hasn\'t logged in for 1 week',
                    priority: 'high'
                }
            ]);
        }, 500);
    });
}

async function loadUpcomingTasks() {
    try {
        const tasks = await getUpcomingTasks();
        const tasksContainer = document.getElementById('upcoming-tasks');
        
        if (tasks.length === 0) {
            tasksContainer.innerHTML = `
                <div class="text-center py-6 text-secondary">
                    <div class="text-3xl mb-2">📅</div>
                    <p class="text-sm">No tasks scheduled</p>
                </div>
            `;
            return;
        }
        
        tasksContainer.innerHTML = tasks.map(task => `
            <div class="task-item p-3 bg-tertiary rounded-lg">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-primary">${task.title}</span>
                    <span class="text-xs text-muted">${task.dueDate}</span>
                </div>
                <p class="text-sm text-secondary mb-2">${task.description}</p>
                <div class="flex justify-between items-center">
                    <span class="task-type-badge badge-secondary text-xs">${task.type}</span>
                    <button class="btn btn-ghost btn-xs" onclick="completeTask('${task.id}')">Mark Complete</button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading upcoming tasks:', error);
    }
}

async function getUpcomingTasks() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: '1',
                    title: 'Follow up with Emma Brown',
                    description: 'Check on student progress and provide support',
                    dueDate: 'Today',
                    type: 'Follow-up'
                },
                {
                    id: '2',
                    title: 'Send engagement report',
                    description: 'Weekly engagement summary to department',
                    dueDate: 'Tomorrow',
                    type: 'Report'
                }
            ]);
        }, 400);
    });
}

function initEngagementTrendChart() {
    // Placeholder for engagement trend chart
    // In a real application, you would integrate with a charting library like Chart.js
    const chartContainer = document.getElementById('engagement-trend-chart');
    chartContainer.innerHTML = `
        <div class="w-full h-full flex items-center justify-center">
            <div class="text-center">
                <div class="text-4xl mb-3">📊</div>
                <p class="text-sm text-secondary">Engagement trends over time</p>
                <p class="text-xs text-muted mt-2">Chart visualization would appear here</p>
            </div>
        </div>
    `;
}

function setupCRMEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('student-search');
    if (searchInput) {
        searchInput.addEventListener('input', AuthUtils.debounce((e) => {
            filterStudents();
        }, 300));
    }
    
    // Filter functionality
    const engagementFilter = document.getElementById('engagement-filter');
    const statusFilter = document.getElementById('status-filter');
    
    if (engagementFilter) {
        engagementFilter.addEventListener('change', filterStudents);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterStudents);
    }
    
    // Export data button
    const exportBtn = document.getElementById('export-crm-data');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportCRMData);
    }
    
    // Add student button
    const addStudentBtn = document.getElementById('add-student-btn');
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', showAddStudentModal);
    }
}

function filterStudents() {
    const searchTerm = document.getElementById('student-search').value.toLowerCase();
    const engagementFilter = document.getElementById('engagement-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    // In a real application, you would filter the actual data and re-render
    console.log('Filtering students:', { searchTerm, engagementFilter, statusFilter });
    AuthUtils.showToast('Filtering students...', 'info');
    
    // Reload students list with filters
    setTimeout(() => {
        loadStudentsList();
    }, 300);
}

function exportCRMData() {
    AuthUtils.showToast('Exporting CRM data...', 'info');
    
    // Simulate export process
    setTimeout(() => {
        AuthUtils.showToast('CRM data exported successfully!', 'success');
    }, 2000);
}

function showAddStudentModal() {
    AuthUtils.showToast('Add student modal would open here', 'info');
}

// Student action functions
function viewStudentDetails(studentId) {
    console.log('Viewing details for student:', studentId);
    AuthUtils.showToast(`Opening details for student ${studentId}`, 'info');
}

function scheduleFollowup(studentId) {
    console.log('Scheduling follow-up for student:', studentId);
    AuthUtils.showToast(`Follow-up scheduled for student ${studentId}`, 'success');
}

function sendMessage(studentId) {
    console.log('Sending message to student:', studentId);
    AuthUtils.showToast(`Message composer opened for student ${studentId}`, 'info');
}

function contactStudent(studentId) {
    console.log('Contacting student:', studentId);
    AuthUtils.showToast(`Contacting student ${studentId}`, 'info');
}

function followUpInteraction(interactionId) {
    console.log('Following up on interaction:', interactionId);
    AuthUtils.showToast(`Follow-up created for interaction ${interactionId}`, 'success');
}

function completeTask(taskId) {
    console.log('Completing task:', taskId);
    AuthUtils.showToast(`Task ${taskId} marked as complete`, 'success');
    
    // Reload tasks
    setTimeout(() => {
        loadUpcomingTasks();
    }, 500);
}

// Global CRM utility functions
window.CRMUtils = {
    refreshStats: loadCRMStats,
    refreshStudents: loadStudentsList,
    refreshInteractions: loadRecentInteractions,
    refreshAttention: loadAttentionList,
    refreshTasks: loadUpcomingTasks
};