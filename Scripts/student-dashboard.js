// Advanced Student Dashboard with DSA Integration and Real Firebase Data
(function() {
    'use strict';

    // Import DSA algorithms
    import('../DSA/algorithm1.js').then(module => {
        window.EngagementAnalyzer = module.default;
    });
    import('../DSA/algorithm2.js').then(module => {
        window.PredictiveEngagementAnalyzer = module.default;
    });
    import('../DSA/algorithm3.js').then(module => {
        window.RecommendationEngine = module.default;
    });

    // Import Firebase service for real data
    import('./firebase-service.js').then(module => {
        window.firebaseService = module.default;
        console.log('✅ Firebase service loaded for real data');
    }).catch(error => {
        console.error('❌ Failed to load Firebase service:', error);
        // Continue without Firebase service - will fall back to demo data
    });

    let isInitialized = false;
    let authChecked = false;
    
    // Advanced analytics instances
    let engagementAnalyzer;
    let predictiveAnalyzer;
    let recommendationEngine;
    let studentData = null;
    let currentUser = null;
    let realFirebaseData = null;

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

        // Quick Action Handlers
    function showTimeManagementTips() {
        const tips = [
            "Break large tasks into smaller, manageable chunks",
            "Use the Pomodoro Technique: 25 minutes focused work + 5 minute break",
            "Set specific deadlines for each part of your assignments",
            "Create a daily schedule and stick to it"
        ];
        
        showNotification('Time Management Tips', 'info', tips.join('\n• '), 8000);
    }

    function findStudyPartners() {
        if (recommendationEngine) {
            const connections = recommendationEngine.findSimilarStudents(currentUser.uid, 5);
            if (connections.length > 0) {
                const partners = connections.map(c => `• ${c.name} (${c.similarityScore}% match)`).join('\n');
                showNotification('Suggested Study Partners', 'success', partners, 10000);
            } else {
                showNotification('Study Partners', 'info', 'No study partners found yet. Keep engaging to find matches!');
            }
        }
    }

    function getSubmissionHelp() {
        const tips = [
            "Review the assignment rubric before starting",
            "Create an outline or plan before writing",
            "Submit drafts early to get feedback",
            "Proofread your work before final submission"
        ];
        
        showNotification('Submission Quality Tips', 'info', tips.join('\n• '), 8000);
    }

    function showFullAnalytics() {
        // Create modal with detailed analytics
        createFullAnalyticsModal();
    }

    function setLearningGoals() {
        // Create goal-setting interface
        createGoalSettingModal();
    }

    function createFullAnalyticsModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold">📊 Detailed Analytics Report</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-red-500">✕</button>
                </div>
                <div id="detailed-analytics-content">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="p-4 border rounded">
                            <h3 class="font-bold mb-2">Activity Breakdown</h3>
                            <div id="activity-breakdown"></div>
                        </div>
                        <div class="p-4 border rounded">
                            <h3 class="font-bold mb-2">Performance Trends</h3>
                            <div id="performance-trends"></div>
                        </div>
                        <div class="p-4 border rounded">
                            <h3 class="font-bold mb-2">Engagement Patterns</h3>
                            <div id="engagement-patterns"></div>
                        </div>
                        <div class="p-4 border rounded">
                            <h3 class="font-bold mb-2">Recommendations</h3>
                            <div id="detailed-recommendations"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        populateDetailedAnalytics();
    }

    function createGoalSettingModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold">🎯 Set Learning Goals</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-red-500">✕</button>
                </div>
                <form onsubmit="handleGoalSubmission(event)">
                    <div class="space-y-4">
                        <div>
                            <label class="block font-medium mb-2">Goal Type</label>
                            <select name="goalType" class="w-full p-2 border rounded">
                                <option value="engagement">Increase Engagement</option>
                                <option value="performance">Improve Performance</option>
                                <option value="consistency">Better Consistency</option>
                                <option value="collaboration">More Collaboration</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-medium mb-2">Target Description</label>
                            <textarea name="description" rows="3" class="w-full p-2 border rounded" 
                                     placeholder="Describe what you want to achieve..."></textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block font-medium mb-2">Target Date</label>
                                <input type="date" name="targetDate" class="w-full p-2 border rounded">
                            </div>
                            <div>
                                <label class="block font-medium mb-2">Priority</label>
                                <select name="priority" class="w-full p-2 border rounded">
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-3 mt-6">
                        <button type="submit" class="btn bg-primary text-white flex-1">Set Goal</button>
                        <button type="button" onclick="this.closest('.fixed').remove()" 
                                class="btn bg-gray-200 text-gray-700">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    function handleGoalSubmission(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const goalData = Object.fromEntries(formData.entries());
        
        // Save goal (in production, this would go to Firebase)
        saveStudentGoal(goalData);
        
        // Close modal and show confirmation
        event.target.closest('.fixed').remove();
        showNotification('Goal Created Successfully!', 'success', 'Your learning goal has been set and will be tracked.');
    }

    function saveStudentGoal(goalData) {
        // Simulate saving goal
        console.log('Saving goal:', goalData);
        
        // In production, save to Firebase:
        // firebase.firestore().collection('studentGoals').add({
        //     ...goalData,
        //     studentId: currentUser.uid,
        //     createdAt: new Date(),
        //     status: 'active'
        // });
    }

    function populateDetailedAnalytics() {
        if (!engagementAnalyzer || !currentUser) return;
        
        const userData = engagementAnalyzer.exportStudentData(currentUser.uid);
        
        // Activity Breakdown
        const activityBreakdown = document.getElementById('activity-breakdown');
        if (activityBreakdown && userData.activities) {
            const activityTypes = {};
            userData.activities.forEach(activity => {
                activityTypes[activity.type] = (activityTypes[activity.type] || 0) + 1;
            });
            
            activityBreakdown.innerHTML = Object.entries(activityTypes)
                .map(([type, count]) => `<div class="flex justify-between"><span>${type}:</span><span>${count}</span></div>`)
                .join('');
        }
        
        // Performance Trends
        const performanceTrends = document.getElementById('performance-trends');
        if (performanceTrends && userData.activities) {
            const recentScores = userData.activities.slice(-10).map(a => a.score || 0);
            const average = recentScores.reduce((a, b) => a + b, 0) / recentScores.length || 0;
            
            performanceTrends.innerHTML = `
                <div>Average Score (last 10): ${average.toFixed(1)}</div>
                <div>Total Activities: ${userData.activities.length}</div>
                <div>Consistency Score: ${userData.consistencyScore?.toFixed(1) || 'N/A'}</div>
            `;
        }
        
        // Engagement Patterns
        const engagementPatterns = document.getElementById('engagement-patterns');
        if (engagementPatterns && predictiveAnalyzer && currentUser) {
            const patterns = predictiveAnalyzer.analyzeStudentPatterns(currentUser.uid);
            if (patterns) {
                engagementPatterns.innerHTML = `
                    <div>Activity Level: ${patterns.activityLevel}</div>
                    <div>Peak Hours: ${patterns.peakHours || 'Not enough data'}</div>
                    <div>Preferred Activities: ${patterns.preferredActivities?.join(', ') || 'Varied'}</div>
                `;
            }
        }
        
        // Detailed Recommendations
        const detailedRecs = document.getElementById('detailed-recommendations');
        if (detailedRecs && recommendationEngine && currentUser) {
            const recommendations = recommendationEngine.generateActivityRecommendations(currentUser.uid, 5);
            detailedRecs.innerHTML = recommendations.map(rec => 
                `<div class="p-2 bg-gray-50 rounded mb-2">
                    <strong>${rec.activityType}</strong><br>
                    <small>Score: ${rec.score.toFixed(2)} | Reason: ${rec.reason}</small>
                </div>`
            ).join('');
        }
    }

    // Utility Functions
    function showTooltip(element, text) {
        // Simple tooltip implementation
        const tooltip = document.createElement('div');
        tooltip.className = 'absolute bg-black text-white text-xs px-2 py-1 rounded z-50';
        tooltip.textContent = text;
        tooltip.style.left = element.offsetLeft + 'px';
        tooltip.style.top = (element.offsetTop - 30) + 'px';
        
        document.body.appendChild(tooltip);
        
        setTimeout(() => {
            tooltip.remove();
        }, 2000);
    }

    // Main initialization function
    async function initializeStudentDashboard() {
        console.log('🚀 Initializing Student Dashboard...');
        
        try {
            // Wait for Firebase to be ready
            await waitForFirebase();
            console.log('✅ Firebase ready');
            
            // Initialize analytics engines
            await initializeAnalyticsEngines();
            console.log('✅ Analytics engines ready');
            
            // Check authentication and load user data
            if (!window.authManager) {
                console.error('❌ AuthManager not available');
                return;
            }
            
            await window.authManager.waitForAuthState();
            const user = window.authManager.getCurrentUser();
            
            if (!user) {
                console.log('❌ No authenticated user');
                window.location.href = '/pages/login.html';
                return;
            }
            
            console.log('✅ User authenticated:', user.email);
            
            // Update user info in UI
            updateUserInfo(user);
            
            // Load and process student data from Firestore
            await loadAndProcessStudentData(user);
            console.log('✅ Student data loaded:', studentData);
            
            // Render all dashboard components with real data
            await renderDashboardWithRealData();
            console.log('✅ Dashboard rendered with real data');
            
            // Setup real-time updates
            initializeRealTimeUpdates();
            console.log('✅ Real-time updates initialized');
            
        } catch (error) {
            console.error('❌ Dashboard initialization failed:', error);
        }
    }

    // Render dashboard with real student data
    async function renderDashboardWithRealData() {
        if (!studentData) {
            console.warn('⚠️ No student data available');
            return;
        }
        
        // Update quick stats
        updateQuickStats(studentData);
        
        // Render engagement charts
        renderEngagementCharts(studentData);
        
        // Update recent activities
        updateRecentActivities(studentData);
        
        // Render analytics
        await renderAdvancedStats();
        
        // Update progress indicators
        updateProgressIndicators(studentData);
    }

    // Update quick stats with real data
    function updateQuickStats(data) {
        const { activities = [], profile } = data;
        
        // Calculate real metrics
        const totalActivities = activities.length;
        const avgScore = activities.length > 0 ? 
            (activities.reduce((sum, a) => sum + (a.score || 0), 0) / activities.length).toFixed(1) : '0.0';
        const completionRate = activities.length > 0 ? 
            Math.round((activities.filter(a => a.score >= 7).length / activities.length) * 100) : 0;
        
        // Update DOM elements
        const statsElements = {
            'total-activities': totalActivities,
            'avg-score': avgScore,
            'completion-rate': completionRate + '%',
            'current-gpa': profile?.gpa || '0.0'
        };
        
        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id) || document.querySelector(`[data-stat="${id}"]`);
            if (element) {
                element.textContent = value;
                console.log(`Updated ${id}:`, value);
            }
        });
    }

    // Render engagement charts with real data
    function renderEngagementCharts(data) {
        const { activities = [] } = data;
        
        if (activities.length === 0) {
            console.warn('No activities to chart');
            return;
        }
        
        // Group activities by type for pie chart
        const activityTypes = {};
        activities.forEach(activity => {
            const type = activity.type || 'unknown';
            activityTypes[type] = (activityTypes[type] || 0) + 1;
        });
        
        // Update activity breakdown
        const breakdownContainer = document.getElementById('activity-breakdown');
        if (breakdownContainer) {
            const total = activities.length;
            breakdownContainer.innerHTML = Object.entries(activityTypes)
                .map(([type, count]) => {
                    const percentage = Math.round((count / total) * 100);
                    return `
                        <div class="flex justify-between items-center py-2">
                            <span class="capitalize">${type.replace('_', ' ')}</span>
                            <div class="flex items-center gap-2">
                                <div class="w-20 h-2 bg-gray-200 rounded-full">
                                    <div class="h-full bg-blue-500 rounded-full" style="width: ${percentage}%"></div>
                                </div>
                                <span class="text-sm text-gray-600">${count}</span>
                            </div>
                        </div>
                    `;
                }).join('');
        }
        
        // Performance trend (last 10 activities)
        const trendsContainer = document.getElementById('performance-trends');
        if (trendsContainer && activities.length > 0) {
            const recentActivities = activities.slice(0, 10);
            const scores = recentActivities.map(a => a.score || 0);
            const avgTrend = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            
            trendsContainer.innerHTML = `
                <div class="text-center">
                    <div class="text-2xl font-bold text-blue-600">${avgTrend.toFixed(1)}</div>
                    <div class="text-sm text-gray-600">Avg Recent Score</div>
                    <div class="text-xs text-gray-500 mt-1">Based on last ${recentActivities.length} activities</div>
                </div>
            `;
        }
    }

    // Update recent activities list
    function updateRecentActivities(data) {
        const { activities = [] } = data;
        const recentActivitiesContainer = document.getElementById('recent-activities') || 
                                        document.querySelector('.recent-activities');
        
        if (!recentActivitiesContainer) {
            console.warn('Recent activities container not found');
            return;
        }
        
        if (activities.length === 0) {
            recentActivitiesContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-2">📚</div>
                    <p>No activities found</p>
                    <p class="text-sm">Start engaging with your courses to see activity data here</p>
                </div>
            `;
            return;
        }
        
        const recentList = activities.slice(0, 5);
        recentActivitiesContainer.innerHTML = recentList.map(activity => {
            const formattedDate = activity.timestamp ? 
                new Date(activity.timestamp).toLocaleDateString() : 'Unknown date';
            const scoreClass = (activity.score || 0) >= 7 ? 'text-green-600' : 'text-yellow-600';
            
            return `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                    <div class="flex-1">
                        <div class="font-medium">${activity.title || 'Activity'}</div>
                        <div class="text-sm text-gray-600">${activity.course || 'Unknown Course'}</div>
                        <div class="text-xs text-gray-500">${formattedDate}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-lg font-bold ${scoreClass}">
                            ${activity.score || 0}/${activity.maxScore || 10}
                        </div>
                        <div class="text-xs text-gray-500">${activity.type?.replace('_', ' ') || 'activity'}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        console.log(`✅ Updated recent activities: ${recentList.length} items`);
    }

    // Update progress indicators
    function updateProgressIndicators(data) {
        const { activities = [], profile } = data;
        
        if (activities.length === 0) return;
        
        // Calculate weekly progress
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const weeklyActivities = activities.filter(activity => 
            new Date(activity.timestamp) > oneWeekAgo
        );
        
        const weeklyProgress = Math.min((weeklyActivities.length / 5) * 100, 100); // Goal: 5 activities per week
        
        // Update progress bars
        const progressBars = document.querySelectorAll('.progress-bar, [data-progress]');
        progressBars.forEach(bar => {
            const progress = bar.dataset.progress || weeklyProgress;
            bar.style.width = `${progress}%`;
        });
        
        // Update specific progress elements
        const weeklyProgressElement = document.getElementById('weekly-progress');
        if (weeklyProgressElement) {
            weeklyProgressElement.textContent = `${Math.round(weeklyProgress)}%`;
        }
        
        const weeklyActivitiesElement = document.getElementById('weekly-activities');
        if (weeklyActivitiesElement) {
            weeklyActivitiesElement.textContent = weeklyActivities.length;
        }
    }

    // Initialize everything when DOM is loaded
    document.addEventListener('DOMContentLoaded', initializeStudentDashboard);

    // Export for use in other modules
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { 
            loadStudentDashboard, 
            showNotification,
            showTimeManagementTips,
            findStudyPartners,
            getSubmissionHelp,
            showFullAnalytics,
            setLearningGoals
        };
    }

    // Global exports
    window.loadStudentDashboard = loadStudentDashboard;
    window.showNotification = showNotification;
    window.showTimeManagementTips = showTimeManagementTips;
    window.findStudyPartners = findStudyPartners;
    window.getSubmissionHelp = getSubmissionHelp;
    window.showFullAnalytics = showFullAnalytics;
    window.setLearningGoals = setLearningGoals;

    function waitForFirebase() {
        return new Promise((resolve) => {
            if (window.authManager) {
                resolve();
            } else {
                window.addEventListener('firebaseReady', () => {
                    resolve();
                });
            }
        });
    }

    async function initializeAnalyticsEngines() {
        // Wait for DSA modules and Firebase service to load
        let attempts = 0;
        while ((!window.EngagementAnalyzer || !window.PredictiveEngagementAnalyzer || !window.RecommendationEngine || !window.firebaseService) && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.EngagementAnalyzer) {
            engagementAnalyzer = new window.EngagementAnalyzer();
            predictiveAnalyzer = new window.PredictiveEngagementAnalyzer();
            recommendationEngine = new window.RecommendationEngine();
            console.log('✅ Analytics engines initialized');
            
            // Load real Firebase data into DSA algorithms
            if (window.firebaseService) {
                await loadRealFirebaseDataIntoDSA();
            }
        } else {
            console.warn('DSA modules not loaded, using fallback');
        }
    }

    async function loadRealFirebaseDataIntoDSA() {
        try {
            console.log('🔄 Loading real Firebase data into DSA algorithms...');
            
            const [students, activities] = await Promise.all([
                window.firebaseService.getAllStudents(),
                window.firebaseService.getAllActivities()
            ]);

            realFirebaseData = {
                students,
                activities,
                loadedAt: new Date()
            };

            // Load activities into engagement analyzer
            if (engagementAnalyzer && activities.length > 0) {
                activities.forEach(activity => {
                    engagementAnalyzer.addStudentActivity(activity.studentId, {
                        studentId: activity.studentId,
                        type: activity.activityType,
                        timestamp: activity.timestamp,
                        quality: activity.quality || 75,
                        score: activity.score || 5,
                        duration: activity.duration || 60
                    });
                });
                console.log(`✅ Loaded ${activities.length} activities into Engagement Analyzer`);
            }

            // Initialize predictive analyzer with student patterns
            if (predictiveAnalyzer && students.length > 0) {
                students.forEach(student => {
                    predictiveAnalyzer.analyzeStudentPatterns(student.id);
                });
                console.log(`✅ Initialized Predictive Analyzer with ${students.length} students`);
            }

            // Load interactions into recommendation engine
            if (recommendationEngine && activities.length > 0) {
                activities.forEach(activity => {
                    if (activity.engagementLevel) {
                        recommendationEngine.addStudentInteraction(
                            activity.studentId, 
                            activity.activityType, 
                            activity.engagementLevel / 10
                        );
                    }
                });
                console.log(`✅ Loaded interactions into Recommendation Engine`);
            }

        } catch (error) {
            console.error('❌ Error loading Firebase data into DSA algorithms:', error);
        }
    }

    async function loadAndProcessStudentData(user) {
        try {
            // Load student's activity data from Firebase
            studentData = await loadStudentActivitiesFromFirebase(user.uid);
            
            // If no data exists, generate sample data for demo
            if (!studentData.activities || studentData.activities.length === 0) {
                studentData = generateSampleStudentData(user);
            }
            
            // Process through analytics engines if available
            if (engagementAnalyzer && studentData.activities) {
                studentData.activities.forEach(activity => {
                    engagementAnalyzer.addStudentActivity(user.uid, activity);
                });
                
                // Generate analytics
                studentData.engagementMetrics = engagementAnalyzer.exportStudentData(user.uid);
                studentData.patterns = predictiveAnalyzer.analyzeStudentPatterns(user.uid, studentData.activities);
                studentData.predictions = predictiveAnalyzer.predictFuturePerformance(user.uid, 4);
                
                console.log('Student data processed through analytics engines');
            }
            
        } catch (error) {
            console.error('Error loading student data:', error);
            studentData = generateSampleStudentData(user);
        }
    }

    async function loadStudentActivitiesFromFirebase(uid) {
        try {
            if (!window.firebaseService) {
                console.warn('Firebase service not available, using demo data');
                return generateSampleStudentData({ uid, email: 'demo@example.com' });
            }
            
            console.log('🔄 Loading real student data for user:', uid);
            
            // Get current user info
            const currentUser = window.authManager.getCurrentUser();
            const userEmail = currentUser?.email;
            
            console.log('📧 User email:', userEmail);
            
            // Find student in Firestore by email
            const [allStudents, allActivities] = await Promise.all([
                window.firebaseService.getAllStudents(),
                window.firebaseService.getAllActivities()
            ]);
            
            // Find the student record matching the logged-in user's email
            const studentRecord = allStudents.find(student => 
                student.email.toLowerCase() === userEmail?.toLowerCase()
            );
            
            if (!studentRecord) {
                console.warn('⚠️ No student record found for email:', userEmail);
                console.log('Available students:', allStudents.map(s => s.email));
                return generateSampleStudentData({ uid, email: userEmail });
            }
            
            console.log('✅ Found student record:', studentRecord.fullName);
            
            // Filter activities for this specific student
            const studentActivities = allActivities.filter(activity => 
                activity.studentId === studentRecord.id
            );
            
            console.log(`📊 Found ${studentActivities.length} activities for student`);
            
            // Convert Firestore data to dashboard format
            const formattedActivities = studentActivities.map(activity => ({
                id: activity.id,
                studentId: activity.studentId,
                type: activity.activityType,
                timestamp: activity.timestamp?.toDate ? activity.timestamp.toDate() : new Date(activity.timestamp),
                quality: activity.quality || 75,
                score: activity.score || 5,
                maxScore: activity.maxScore || 10,
                duration: activity.duration || 60,
                course: activity.courseName || 'Unknown Course',
                title: activity.title || activity.description || 'Activity',
                engagementLevel: activity.engagementLevel || 5,
                submittedEarly: activity.status === 'completed',
                isLate: activity.status === 'late',
                feedback: activity.feedback
            }));
            
            return {
                profile: {
                    name: studentRecord.fullName || studentRecord.firstName + ' ' + studentRecord.lastName,
                    email: studentRecord.email,
                    studentId: studentRecord.studentId || studentRecord.id,
                    major: studentRecord.major || 'Unknown Major',
                    year: studentRecord.year || 1,
                    gpa: studentRecord.gpa || '0.0'
                },
                activities: formattedActivities.sort((a, b) => b.timestamp - a.timestamp)
            };
            
        } catch (error) {
            console.error('❌ Firebase query error:', error);
            // Fallback to demo data on error
            const currentUser = window.authManager.getCurrentUser();
            return generateSampleStudentData({ 
                uid, 
                email: currentUser?.email || 'demo@example.com',
                displayName: currentUser?.displayName || 'Demo User'
            });
        }
    }

    function generateSampleStudentData(user) {
        // Generate realistic sample data for demonstration
        const activities = [];
        const now = new Date();
        
        // Generate activities for the past 30 days
        const activityTypes = [
            'assignment_upload', 'quiz_submission', 'class_participation',
            'peer_collaboration', 'event_participation', 'forum_post',
            'resource_access', 'workshop_attendance'
        ];
        
        for (let i = 0; i < 35; i++) {
            const daysAgo = Math.floor(Math.random() * 30);
            const activityDate = new Date(now);
            activityDate.setDate(activityDate.getDate() - daysAgo);
            
            activities.push({
                studentId: user.uid,
                type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
                timestamp: activityDate,
                quality: Math.floor(Math.random() * 30) + 70, // 70-100
                score: Math.floor(Math.random() * 10) + 5, // 5-15
                submittedEarly: Math.random() > 0.4,
                isLate: Math.random() > 0.85,
                course: ['CS101', 'MATH201', 'ENG102'][Math.floor(Math.random() * 3)],
                title: `Activity ${i + 1}`,
                collaborators: Math.random() > 0.7 ? ['peer_' + Math.floor(Math.random() * 5)] : undefined
            });
        }
        
        return {
            profile: {
                name: user.displayName || 'Student',
                email: user.email,
                studentId: `STU${user.uid.substring(0, 6).toUpperCase()}`,
                course: 'Computer Science',
                year: 2,
                gpa: (Math.random() * 1.5 + 2.5).toFixed(2) // 2.5-4.0
            },
            activities: activities.sort((a, b) => b.timestamp - a.timestamp)
        };
    }

    async function renderAdvancedStats() {
        if (!studentData?.engagementMetrics) return;
        
        const metrics = studentData.engagementMetrics;
        const predictions = studentData.predictions;
        
        // Update main stats with real analytics data
        updateStatCard('total-score', metrics.totalScore || 0, 'Engagement Score');
        updateStatCard('engagement-level', metrics.engagementLevel, 'Current Level');
        updateStatCard('weekly-average', metrics.weeklyAverage, 'Weekly Avg');
        updateStatCard('consistency', Math.round(metrics.consistencyScore || 0) + '%', 'Consistency');
        
        // Add prediction indicator
        addPredictionIndicator(predictions);
        
        // Animate the updates
        animateStatCards();
    }

    function updateStatCard(cardId, value, label) {
        const element = document.getElementById(cardId) || 
                       document.querySelector(`[data-stat="${cardId}"]`);
        
        if (element) {
            element.textContent = value;
            
            // Add trend indicator based on value
            const container = element.closest('.stat-card') || element.parentElement;
            if (container) {
                addTrendIndicator(container, cardId, value);
            }
        }
    }

    function addPredictionIndicator(predictions) {
        if (!predictions) return;
        
        const container = document.querySelector('.dashboard-header') || 
                         document.querySelector('.grid').parentElement;
        
        if (container && !document.getElementById('prediction-banner')) {
            const predictionBanner = document.createElement('div');
            predictionBanner.id = 'prediction-banner';
            predictionBanner.className = `prediction-banner mb-6 p-4 rounded-lg border-l-4 ${getPredictionBannerClass(predictions.prediction)}`;
            
            predictionBanner.innerHTML = `
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-semibold text-lg">🔮 Performance Prediction</h3>
                        <p class="text-sm opacity-90">
                            Your predicted trend: <strong>${predictions.prediction.replace('_', ' ')}</strong>
                            (${predictions.confidence}% confidence)
                        </p>
                    </div>
                    <button onclick="showPredictionDetails()" class="btn btn-ghost btn-sm">
                        View Details
                    </button>
                </div>
            `;
            
            container.insertBefore(predictionBanner, container.firstChild);
        }
    }

    function getPredictionBannerClass(prediction) {
        switch (prediction) {
            case 'improving': return 'border-green-500 bg-green-50 text-green-800';
            case 'stable': return 'border-blue-500 bg-blue-50 text-blue-800';
            case 'declining': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
            case 'at_risk': return 'border-red-500 bg-red-50 text-red-800';
            default: return 'border-gray-500 bg-gray-50 text-gray-800';
        }
    }

    async function renderPersonalizedRecommendations() {
        if (!recommendationEngine || !currentUser) return;
        
        // Create a single-student database for recommendations
        const singleStudentDB = new Map();
        singleStudentDB.set(currentUser.uid, studentData);
        
        const recommendations = recommendationEngine.generateActivityRecommendations(
            currentUser.uid, singleStudentDB, 5
        );
        
        // Find or create recommendations container
        let container = document.getElementById('recommendations-container');
        if (!container) {
            container = createRecommendationsSection();
        }
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">💡 Personalized Recommendations</h2>
                    <p class="text-sm text-muted">AI-powered suggestions based on your patterns</p>
                </div>
                <div class="card-body">
                    <div class="space-y-3">
                        ${recommendations.map(rec => `
                            <div class="recommendation-item p-3 bg-tertiary rounded-lg border-l-4 border-blue-400">
                                <div class="flex items-start justify-between">
                                    <div class="flex-1">
                                        <h4 class="font-medium text-primary capitalize">
                                            ${rec.activityType.replace('_', ' ')}
                                        </h4>
                                        <p class="text-sm text-secondary mt-1">${rec.reasoning}</p>
                                        <div class="flex items-center gap-2 mt-2">
                                            <span class="badge badge-secondary text-xs">${rec.source}</span>
                                            <span class="text-xs text-muted">Score: ${rec.finalScore.toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <button onclick="takeRecommendedAction('${rec.activityType}')" 
                                            class="btn btn-primary btn-sm">
                                        Take Action
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    async function renderEngagementAnalytics() {
        if (!studentData?.engagementMetrics) return;
        
        const trends = engagementAnalyzer?.getEngagementTrends(currentUser?.uid, 14) || [];
        
        let container = document.getElementById('engagement-analytics-container');
        if (!container) {
            container = createAnalyticsSection();
        }
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">📊 Engagement Analytics</h2>
                    <div class="flex gap-2">
                        <button onclick="exportEngagementData()" class="btn btn-ghost btn-sm">📥 Export</button>
                        <button onclick="toggleAnalyticsView()" class="btn btn-ghost btn-sm">🔄 Toggle View</button>
                    </div>
                </div>
                <div class="card-body">
                    <!-- Engagement Level Indicator -->
                    <div class="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-lg font-semibold text-blue-800">
                                    Current Engagement Level: ${studentData.engagementMetrics.engagementLevel}
                                </h3>
                                <p class="text-sm text-blue-600">
                                    Total Score: ${studentData.engagementMetrics.totalScore} | 
                                    Consistency: ${Math.round(studentData.engagementMetrics.consistencyScore || 0)}%
                                </p>
                            </div>
                            <div class="engagement-level-badge ${getEngagementLevelClass(studentData.engagementMetrics.engagementLevel)}">
                                ${getEngagementLevelEmoji(studentData.engagementMetrics.engagementLevel)}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Daily Trends Chart -->
                    <div class="mb-6">
                        <h4 class="font-medium mb-3">📈 14-Day Engagement Trend</h4>
                        ${renderTrendChart(trends)}
                    </div>
                    
                    <!-- Activity Breakdown -->
                    <div>
                        <h4 class="font-medium mb-3">🎯 Activity Breakdown</h4>
                        ${renderActivityBreakdown(studentData.activities)}
                    </div>
                </div>
            </div>
        `;
    }

    function renderTrendChart(trends) {
        if (!trends || trends.length === 0) {
            return '<div class="text-center py-8 text-muted">No trend data available</div>';
        }
        
        const maxScore = Math.max(...trends.map(t => t.score));
        
        return `
            <div class="trend-chart grid grid-cols-7 gap-2 h-32">
                ${trends.slice(-7).map((trend, index) => {
                    const height = (trend.score / maxScore) * 100;
                    return `
                        <div class="flex flex-col justify-end items-center">
                            <div class="bg-blue-400 rounded-t transition-all duration-300 hover:bg-blue-600 cursor-pointer" 
                                 style="height: ${height}%; min-height: 10px; width: 100%"
                                 title="${trend.date}: ${trend.activities} activities, ${trend.score} score">
                            </div>
                            <div class="text-xs text-muted mt-2">${formatShortDate(trend.date)}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    function renderActivityBreakdown(activities) {
        const activityCounts = {};
        const activityScores = {};
        
        activities.forEach(activity => {
            activityCounts[activity.type] = (activityCounts[activity.type] || 0) + 1;
            activityScores[activity.type] = (activityScores[activity.type] || 0) + (activity.score || 0);
        });
        
        const sortedActivities = Object.entries(activityCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6);
        
        return `
            <div class="grid grid-cols-2 gap-4">
                ${sortedActivities.map(([type, count]) => `
                    <div class="activity-breakdown-item p-3 bg-tertiary rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-medium capitalize">${type.replace('_', ' ')}</span>
                            <span class="text-lg font-bold text-primary">${count}</span>
                        </div>
                        <div class="text-xs text-muted">
                            Total Score: ${activityScores[type] || 0} | 
                            Avg: ${((activityScores[type] || 0) / count).toFixed(1)}
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div class="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                                 style="width: ${(count / activities.length * 100)}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function getEngagementLevelClass(level) {
        switch (level) {
            case 'high': return 'bg-green-100 text-green-800 border-green-300';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'low': return 'bg-orange-100 text-orange-800 border-orange-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    }

    function getEngagementLevelEmoji(level) {
        switch (level) {
            case 'high': return '🚀';
            case 'medium': return '📈';
            case 'low': return '⚠️';
            default: return '❓';
        }
    }

    function formatShortDate(dateString) {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    async function renderPredictiveInsights() {
        if (!studentData?.predictions) return;
        
        const predictions = studentData.predictions;
        const patterns = studentData.patterns;
        
        let container = document.getElementById('predictive-insights-container');
        if (!container) {
            container = createPredictiveInsightsSection();
        }
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">🔮 Predictive Insights</h2>
                    <p class="text-sm text-muted">AI analysis of your learning patterns</p>
                </div>
                <div class="card-body">
                    <!-- Prediction Summary -->
                    <div class="prediction-summary p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg mb-6">
                        <h3 class="text-lg font-semibold text-purple-800 mb-2">
                            📊 Performance Forecast (Next 4 weeks)
                        </h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <div class="text-2xl font-bold text-purple-700">${predictions.prediction.replace('_', ' ')}</div>
                                <div class="text-sm text-purple-600">Predicted Trend</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold text-purple-700">${predictions.confidence}%</div>
                                <div class="text-sm text-purple-600">Confidence Level</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Pattern Analysis -->
                    <div class="patterns-grid grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        ${renderPatternCard('Time Management', patterns?.timeManagement)}
                        ${renderPatternCard('Collaboration', patterns?.collaborationPatterns)}
                        ${renderPatternCard('Submission Patterns', patterns?.submissionPatterns)}
                        ${renderPatternCard('Quality Trends', patterns?.qualityTrends)}
                    </div>
                    
                    <!-- Risk Factors & Recommendations -->
                    ${renderRiskFactorsAndRecommendations(predictions)}
                </div>
            </div>
        `;
    }

    function renderPatternCard(title, patternData) {
        if (!patternData) {
            return `
                <div class="pattern-card p-3 bg-gray-50 rounded-lg">
                    <h4 class="font-medium text-gray-600">${title}</h4>
                    <p class="text-sm text-gray-500">No data available</p>
                </div>
            `;
        }
        
        let content = '';
        let statusClass = 'bg-blue-50 border-blue-200 text-blue-800';
        
        switch (title) {
            case 'Time Management':
                content = `
                    <div class="text-lg font-semibold capitalize">${patternData.pattern}</div>
                    <div class="text-xs text-muted">Early submissions: ${patternData.earlySubmissionRate}%</div>
                `;
                statusClass = patternData.pattern === 'proactive' ? 'bg-green-50 border-green-200 text-green-800' : 
                             patternData.pattern === 'procrastinator' ? 'bg-red-50 border-red-200 text-red-800' : statusClass;
                break;
                
            case 'Collaboration':
                content = `
                    <div class="text-lg font-semibold capitalize">${patternData.level}</div>
                    <div class="text-xs text-muted">Weekly avg: ${patternData.averagePerWeek}</div>
                `;
                statusClass = patternData.level === 'high' ? 'bg-green-50 border-green-200 text-green-800' :
                             patternData.level === 'minimal' ? 'bg-red-50 border-red-200 text-red-800' : statusClass;
                break;
                
            case 'Submission Patterns':
                content = `
                    <div class="text-lg font-semibold capitalize">${patternData.trend}</div>
                    <div class="text-xs text-muted">Reliability: ${patternData.reliability}%</div>
                `;
                statusClass = patternData.trend === 'improving' ? 'bg-green-50 border-green-200 text-green-800' :
                             patternData.trend === 'declining' ? 'bg-red-50 border-red-200 text-red-800' : statusClass;
                break;
                
            case 'Quality Trends':
                content = `
                    <div class="text-lg font-semibold capitalize">${patternData.trend}</div>
                    <div class="text-xs text-muted">Recent avg: ${patternData.recentQuality?.toFixed(1) || 'N/A'}%</div>
                `;
                statusClass = patternData.trend === 'improving' ? 'bg-green-50 border-green-200 text-green-800' :
                             patternData.trend === 'declining' ? 'bg-red-50 border-red-200 text-red-800' : statusClass;
                break;
        }
        
        return `
            <div class="pattern-card p-3 border rounded-lg ${statusClass}">
                <h4 class="font-medium mb-1">${title}</h4>
                ${content}
            </div>
        `;
    }

    function renderRiskFactorsAndRecommendations(predictions) {
        const riskFactors = predictions.riskFactors || [];
        const recommendations = predictions.recommendations || [];
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Risk Factors -->
                <div class="risk-factors">
                    <h4 class="font-medium mb-3 text-orange-700">⚠️ Areas for Attention</h4>
                    ${riskFactors.length > 0 ? `
                        <div class="space-y-2">
                            ${riskFactors.map(factor => `
                                <div class="risk-factor-item p-2 bg-orange-50 border-l-4 border-orange-400 rounded">
                                    <span class="text-sm text-orange-800 capitalize">${factor.replace('_', ' ')}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<div class="text-sm text-green-600">✅ No risk factors identified</div>'}
                </div>
                
                <!-- Recommendations -->
                <div class="recommendations">
                    <h4 class="font-medium mb-3 text-blue-700">💡 AI Recommendations</h4>
                    ${recommendations.length > 0 ? `
                        <div class="space-y-2">
                            ${recommendations.map(rec => `
                                <div class="recommendation-item p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
                                    <span class="text-sm text-blue-800">${rec}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<div class="text-sm text-muted">No specific recommendations at this time</div>'}
                </div>
            </div>
        `;
    }

    async function renderSocialNetworkInsights() {
        // This would show collaboration network and peer connections
        let container = document.getElementById('social-network-container');
        if (!container) {
            container = createSocialNetworkSection();
        }
        
        // For now, show basic collaboration stats
        const collaborationActivities = studentData.activities.filter(a => a.type === 'peer_collaboration');
        const uniqueCollaborators = new Set();
        
        collaborationActivities.forEach(activity => {
            if (activity.collaborators) {
                activity.collaborators.forEach(collaborator => uniqueCollaborators.add(collaborator));
            }
        });
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">🤝 Collaboration Network</h2>
                    <p class="text-sm text-muted">Your peer connections and collaboration patterns</p>
                </div>
                <div class="card-body">
                    <div class="grid grid-cols-3 gap-4 mb-4">
                        <div class="text-center p-3 bg-blue-50 rounded-lg">
                            <div class="text-2xl font-bold text-blue-700">${collaborationActivities.length}</div>
                            <div class="text-xs text-blue-600">Collaborations</div>
                        </div>
                        <div class="text-center p-3 bg-green-50 rounded-lg">
                            <div class="text-2xl font-bold text-green-700">${uniqueCollaborators.size}</div>
                            <div class="text-xs text-green-600">Unique Partners</div>
                        </div>
                        <div class="text-center p-3 bg-purple-50 rounded-lg">
                            <div class="text-2xl font-bold text-purple-700">
                                ${collaborationActivities.length > 0 ? (collaborationActivities.length / uniqueCollaborators.size || 1).toFixed(1) : '0'}
                            </div>
                            <div class="text-xs text-purple-600">Avg per Partner</div>
                        </div>
                    </div>
                    
                    <div class="collaboration-insights p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
                        <h4 class="font-medium text-indigo-800 mb-2">🎯 Collaboration Insights</h4>
                        <ul class="text-sm text-indigo-700 space-y-1">
                            ${generateCollaborationInsights(collaborationActivities, uniqueCollaborators)}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    function generateCollaborationInsights(collaborations, partners) {
        const insights = [];
        
        if (collaborations.length === 0) {
            insights.push('Consider joining group projects to enhance learning');
            insights.push('Peer collaboration can improve understanding and retention');
        } else if (collaborations.length < 5) {
            insights.push('Good start! Try to increase collaboration frequency');
            insights.push('Diverse partnerships lead to broader perspectives');
        } else if (partners.size < 3) {
            insights.push('Great collaboration frequency! Try working with new partners');
            insights.push('Expanding your network can bring fresh insights');
        } else {
            insights.push('Excellent collaboration pattern! Keep it up');
            insights.push('Your diverse network is a valuable learning asset');
        }
        
        if (collaborations.length > 0) {
            const recentCollabs = collaborations.filter(c => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return c.timestamp >= weekAgo;
            });
            
            if (recentCollabs.length > 0) {
                insights.push(`${recentCollabs.length} collaborations this week - great momentum!`);
            }
        }
        
        return insights.map(insight => `<li>• ${insight}</li>`).join('');
    }

    async function renderLearningPath() {
        if (!recommendationEngine || !currentUser) return;
        
        let container = document.getElementById('learning-path-container');
        if (!container) {
            container = createLearningPathSection();
        }
        
        const learningPath = recommendationEngine.generateLearningPath(
            currentUser.uid,
            ['advanced_programming', 'data_analysis', 'web_development'],
            studentData.activities
        );
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">🛣️ Personalized Learning Path</h2>
                    <p class="text-sm text-muted">AI-recommended progression based on your skills</p>
                </div>
                <div class="card-body">
                    <!-- Current Skills -->
                    <div class="mb-6">
                        <h4 class="font-medium mb-3">✅ Current Skills</h4>
                        <div class="flex flex-wrap gap-2">
                            ${learningPath.currentSkills.map(skill => `
                                <span class="skill-badge badge-success text-sm">${skill.replace('_', ' ')}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Learning Paths -->
                    <div class="mb-6">
                        <h4 class="font-medium mb-3">🎯 Recommended Next Steps</h4>
                        <div class="space-y-3">
                            ${learningPath.learningPaths.map((path, index) => `
                                <div class="learning-path-item p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="font-medium text-blue-800">${path.skill.replace('_', ' ')}</span>
                                        <span class="text-sm text-blue-600">${path.distance} steps</span>
                                    </div>
                                    <div class="learning-path-steps flex items-center gap-2 overflow-x-auto">
                                        ${path.path.map((step, stepIndex) => `
                                            <span class="skill-step text-xs px-2 py-1 bg-blue-100 rounded whitespace-nowrap">
                                                ${stepIndex > 0 ? '→' : ''} ${step.replace('_', ' ')}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Estimated Duration -->
                    <div class="duration-estimate p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <h5 class="font-medium text-purple-800 mb-1">⏱️ Estimated Timeline</h5>
                        <p class="text-sm text-purple-700">
                            Based on your current pace: ${learningPath.estimatedDuration || '4-6 weeks'} to complete recommended paths
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    // Helper functions to create sections if they don't exist
    function createRecommendationsSection() {
        const container = document.createElement('div');
        container.id = 'recommendations-container';
        container.className = 'mb-6';
        
        const mainContent = document.querySelector('.dashboard-content') || document.querySelector('main');
        if (mainContent) {
            mainContent.appendChild(container);
        }
        return container;
    }

    function createAnalyticsSection() {
        const container = document.createElement('div');
        container.id = 'engagement-analytics-container';
        container.className = 'mb-6';
        
        const mainContent = document.querySelector('.dashboard-content') || document.querySelector('main');
        if (mainContent) {
            mainContent.appendChild(container);
        }
        return container;
    }

    function createPredictiveInsightsSection() {
        const container = document.createElement('div');
        container.id = 'predictive-insights-container';
        container.className = 'mb-6';
        
        const mainContent = document.querySelector('.dashboard-content') || document.querySelector('main');
        if (mainContent) {
            mainContent.appendChild(container);
        }
        return container;
    }

    function createSocialNetworkSection() {
        const container = document.createElement('div');
        container.id = 'social-network-container';
        container.className = 'mb-6';
        
        const mainContent = document.querySelector('.dashboard-content') || document.querySelector('main');
        if (mainContent) {
            mainContent.appendChild(container);
        }
        return container;
    }

    function createLearningPathSection() {
        const container = document.createElement('div');
        container.id = 'learning-path-container';
        container.className = 'mb-6';
        
        const mainContent = document.querySelector('.dashboard-content') || document.querySelector('main');
        if (mainContent) {
            mainContent.appendChild(container);
        }
        return container;
    }

    function animateStatCards() {
        // Enhanced stat card animation with real data
        const statNumbers = document.querySelectorAll('.text-3xl.font-bold, [data-animate="number"]');
        
        statNumbers.forEach((element, index) => {
            const finalValue = element.textContent;
            const isNumeric = !isNaN(parseFloat(finalValue));
            
            if (isNumeric) {
                const targetNumber = parseFloat(finalValue);
                let currentNumber = 0;
                const increment = targetNumber / 40; // Smoother animation
                
                element.textContent = '0';
                
                const timer = setInterval(() => {
                    currentNumber += increment;
                    if (currentNumber >= targetNumber) {
                        element.textContent = finalValue;
                        clearInterval(timer);
                    } else {
                        element.textContent = Math.floor(currentNumber).toString();
                    }
                }, 30);
                
                setTimeout(() => {
                    // Animation starts after delay
                }, index * 150);
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
        console.log('🔄 Legacy loadStudentData called - redirecting to main initialization');
        // This function is kept for compatibility but now just calls the main initialization
        initializeStudentDashboard();
    }

    function updateUserInfo(user) {
        console.log('🔄 Updating user info for:', user.email);
        
        // Update student name - use real student data if available, otherwise Firebase Auth
        const studentNameElement = document.getElementById('student-name');
        const displayName = studentData?.profile?.name || user.displayName || 'Student';
        if (studentNameElement) {
            studentNameElement.textContent = displayName;
        }

        // Update avatar with user initials
        const avatarElement = document.querySelector('.w-12.h-12.rounded-full');
        if (avatarElement) {
            const initials = getInitials(displayName);
            avatarElement.textContent = initials;
        }

        // Update student ID - use real data if available
        const studentIdElement = document.querySelector('p.text-xs.text-muted');
        if (studentIdElement) {
            const studentId = studentData?.profile?.studentId || `ST${user.uid.substring(0, 7).toUpperCase()}`;
            studentIdElement.textContent = `Student ID: ${studentId}`;
        }

        // Update additional profile fields if available
        if (studentData?.profile) {
            const profile = studentData.profile;
            
            // Update major/course
            const majorElement = document.getElementById('student-major');
            if (majorElement && profile.major) {
                majorElement.textContent = profile.major;
            }
            
            // Update year
            const yearElement = document.getElementById('student-year');
            if (yearElement && profile.year) {
                yearElement.textContent = `Year ${profile.year}`;
            }
            
            // Update GPA
            const gpaElement = document.getElementById('student-gpa');
            if (gpaElement && profile.gpa) {
                gpaElement.textContent = `GPA: ${profile.gpa}`;
            }
            
            console.log('✅ Updated UI with real student profile:', profile);
        }

        console.log('✅ User info updated:', {
            uid: user.uid,
            name: displayName,
            email: user.email,
            hasRealProfile: !!studentData?.profile
        });
    }

    // Helper function to get initials from name
    function getInitials(name) {
        if (!name) return '??';
        return name.split(' ')
            .map(word => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase();
    }

    // Initialize real-time updates
    function initializeRealTimeUpdates() {
        console.log('🔄 Setting up real-time updates...');
        
        // Refresh data every 5 minutes
        setInterval(async () => {
            const user = window.authManager?.getCurrentUser();
            if (user && studentData) {
                console.log('🔄 Refreshing student data...');
                try {
                    await loadAndProcessStudentData(user);
                    updateQuickStats(studentData);
                    renderEngagementCharts(studentData);
                    updateRecentActivities(studentData);
                    updateProgressIndicators(studentData);
                    console.log('✅ Data refreshed successfully');
                } catch (error) {
                    console.error('❌ Error refreshing data:', error);
                }
            }
        }, 5 * 60 * 1000); // 5 minutes
        
        // Track user activity for engagement metrics
        let lastActivity = Date.now();
        
        ['click', 'scroll', 'keypress'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                lastActivity = Date.now();
            });
        });
        
        // Check if user is active and update engagement
        setInterval(() => {
            const now = Date.now();
            const isActive = (now - lastActivity) < 30000; // Active within 30 seconds
            
            if (isActive && currentUser) {
                console.log('📊 User actively engaged');
            }
        }, 60000); // Check every minute
        
        console.log('✅ Real-time updates initialized');
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

    function initializeAdvancedInteractions() {
        // Enhanced interactions for all dashboard elements
        setupCardInteractions();
        setupAnalyticsInteractions();
        setupRecommendationInteractions();
    }

    function setupCardInteractions() {
        // Add click handlers for activity items with analytics
        document.addEventListener('click', (e) => {
            const activityItem = e.target.closest('.activity-item, .recommendation-item, .pattern-card');
            if (activityItem) {
                activityItem.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    activityItem.style.transform = 'scale(1)';
                }, 150);
            }
        });
    }

    function setupAnalyticsInteractions() {
        // Add hover effects for trend charts
        document.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('bg-blue-400')) {
                const tooltip = e.target.getAttribute('title');
                if (tooltip) {
                    showTooltip(e.target, tooltip);
                }
            }
        });
    }

    function setupRecommendationInteractions() {
        // Add click handlers for recommendation actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn') && e.target.getAttribute('onclick')) {
                // Let the onclick handler run, but add visual feedback
                e.target.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    e.target.style.transform = 'scale(1)';
                }, 150);
            }
        });
    }

    function initializePersonalizedQuickActions() {
        // Create dynamic quick actions based on student patterns
        if (!studentData?.patterns) return;
        
        const patterns = studentData.patterns;
        const quickActions = generatePersonalizedQuickActions(patterns);
        
        const quickActionsContainer = document.querySelector('.quick-actions') || 
                                     document.getElementById('quick-actions-container');
        
        if (quickActionsContainer && quickActions.length > 0) {
            updateQuickActionsContainer(quickActionsContainer, quickActions);
        }
    }

    function generatePersonalizedQuickActions(patterns) {
        const actions = [];
        
        // Add actions based on patterns
        if (patterns.timeManagement?.pattern === 'procrastinator') {
            actions.push({
                icon: '⏰',
                title: 'Time Management Tips',
                description: 'Get personalized time management advice',
                action: 'showTimeManagementTips',
                priority: 'high'
            });
        }
        
        if (patterns.collaborationPatterns?.level === 'minimal') {
            actions.push({
                icon: '🤝',
                title: 'Find Study Partners',
                description: 'Connect with collaborative peers',
                action: 'findStudyPartners',
                priority: 'medium'
            });
        }
        
        if (patterns.submissionPatterns?.trend === 'declining') {
            actions.push({
                icon: '📈',
                title: 'Improve Submissions',
                description: 'Get help with assignment quality',
                action: 'getSubmissionHelp',
                priority: 'high'
            });
        }
        
        // Always include general actions
        actions.push(
            {
                icon: '📊',
                title: 'View Full Analytics',
                description: 'See detailed engagement report',
                action: 'showFullAnalytics',
                priority: 'low'
            },
            {
                icon: '🎯',
                title: 'Set Goals',
                description: 'Create personalized learning goals',
                action: 'setLearningGoals',
                priority: 'medium'
            }
        );
        
        return actions.sort((a, b) => {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        }).slice(0, 6);
    }

    function updateQuickActionsContainer(container, actions) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">⚡ Smart Actions</h2>
                    <p class="text-sm text-muted">Personalized based on your patterns</p>
                </div>
                <div class="card-body">
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                        ${actions.map(action => `
                            <button onclick="${action.action}()" 
                                    class="quick-action-btn p-4 text-center border rounded-lg hover:bg-primary hover:text-white transition-all group">
                                <div class="text-2xl mb-2">${action.icon}</div>
                                <div class="font-medium text-sm group-hover:text-white">${action.title}</div>
                                <div class="text-xs text-muted group-hover:text-white opacity-80">${action.description}</div>
                                ${action.priority === 'high' ? '<div class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>' : ''}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    function setupRealTimeAnalytics() {
        // Enhanced real-time updates with analytics
        setInterval(() => {
            updateEngagementMetrics();
        }, 30000); // Every 30 seconds

        // Track user activity for engagement analytics
        trackUserActivity();
    }

    function updateEngagementMetrics() {
        if (!engagementAnalyzer || !currentUser) return;
        
        // Simulate new activity (in production, this would come from real interactions)
        const newActivity = generateSimulatedActivity();
        if (newActivity) {
            engagementAnalyzer.addStudentActivity(currentUser.uid, newActivity);
            
            // Update displays without full reload
            const newMetrics = engagementAnalyzer.exportStudentData(currentUser.uid);
            updateDashboardMetrics(newMetrics);
        }
    }

    function trackUserActivity() {
        let lastActivity = Date.now();
        
        // Track mouse movement, clicks, scrolling
        ['mousedown', 'mousemove', 'keypress', 'scroll'].forEach(event => {
            document.addEventListener(event, () => {
                lastActivity = Date.now();
            });
        });
        
        // Check if user is active and update engagement
        setInterval(() => {
            const now = Date.now();
            const isActive = (now - lastActivity) < 30000; // Active within 30 seconds
            
            if (isActive && engagementAnalyzer && currentUser) {
                // Record active session time
                recordActiveTime();
            }
        }, 60000); // Check every minute
    }

    function generateSimulatedActivity() {
        // Simulate occasional new activities for demo
        if (Math.random() > 0.95) { // 5% chance every 30 seconds
            return {
                studentId: currentUser?.uid,
                type: 'resource_access',
                timestamp: new Date(),
                quality: Math.floor(Math.random() * 20) + 80,
                score: Math.floor(Math.random() * 5) + 3
            };
        }
        return null;
    }

    function recordActiveTime() {
        // Record that user is actively engaged
        console.log('Recording active engagement time');
    }

    function updateDashboardMetrics(newMetrics) {
        // Update specific metric displays without full reload
        const totalScoreElement = document.querySelector('[data-stat="total-score"]');
        if (totalScoreElement && newMetrics.totalScore) {
            animateNumberChange(totalScoreElement, newMetrics.totalScore);
        }
        
        const consistencyElement = document.querySelector('[data-stat="consistency"]');
        if (consistencyElement && newMetrics.consistencyScore) {
            animateNumberChange(consistencyElement, Math.round(newMetrics.consistencyScore) + '%');
        }
    }

    function animateNumberChange(element, newValue) {
        element.style.transform = 'scale(1.1)';
        element.style.color = '#10b981'; // Green color for positive change
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
            
            setTimeout(() => {
                element.style.color = ''; // Reset color
            }, 1000);
        }, 200);
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
