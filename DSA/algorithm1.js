// Student Engagement Analysis Algorithm - HashMap & Sorting Based Analytics
// This algorithm processes student activity data and calculates engagement metrics

class EngagementAnalyzer {
    constructor() {
        this.studentEngagementMap = new Map();
        this.activityWeights = {
            'assignment_upload': 10,
            'event_participation': 8,
            'class_participation': 12,
            'peer_collaboration': 9,
            'quiz_submission': 11,
            'forum_post': 6,
            'resource_access': 4,
            'attendance': 15
        };
    }

    // Add or update student engagement data using HashMap for O(1) access
    addStudentActivity(studentId, activity) {
        if (!this.studentEngagementMap.has(studentId)) {
            this.studentEngagementMap.set(studentId, {
                activities: [],
                totalScore: 0,
                lastActivity: null,
                engagementLevel: 'low',
                consistencyScore: 0,
                weeklyAverage: 0
            });
        }

        const student = this.studentEngagementMap.get(studentId);
        
        // Add activity with timestamp
        const activityData = {
            ...activity,
            timestamp: new Date(),
            score: this.calculateActivityScore(activity)
        };
        
        student.activities.push(activityData);
        student.totalScore += activityData.score;
        student.lastActivity = activityData.timestamp;
        
        // Update engagement metrics
        this.updateEngagementMetrics(studentId);
        
        return activityData.score;
    }

    // Calculate score for individual activity
    calculateActivityScore(activity) {
        const baseScore = this.activityWeights[activity.type] || 5;
        
        // Apply quality multiplier if available
        const qualityMultiplier = activity.quality ? activity.quality / 100 : 1;
        
        // Apply timeliness bonus (submitted before deadline)
        const timelinessBonus = activity.submittedEarly ? 1.2 : 1;
        
        return Math.round(baseScore * qualityMultiplier * timelinessBonus);
    }

    // Update comprehensive engagement metrics for a student
    updateEngagementMetrics(studentId) {
        const student = this.studentEngagementMap.get(studentId);
        const activities = student.activities;
        
        if (activities.length === 0) return;

        // Calculate consistency score using activity frequency
        student.consistencyScore = this.calculateConsistencyScore(activities);
        
        // Calculate weekly average
        student.weeklyAverage = this.calculateWeeklyAverage(activities);
        
        // Determine engagement level
        student.engagementLevel = this.determineEngagementLevel(student.totalScore, student.consistencyScore);
        
        this.studentEngagementMap.set(studentId, student);
    }

    // Calculate consistency score based on activity distribution
    calculateConsistencyScore(activities) {
        if (activities.length < 2) return 0;
        
        // Group activities by week
        const weeklyActivities = new Map();
        const now = new Date();
        
        activities.forEach(activity => {
            const weekKey = this.getWeekKey(activity.timestamp, now);
            if (!weeklyActivities.has(weekKey)) {
                weeklyActivities.set(weekKey, 0);
            }
            weeklyActivities.set(weekKey, weeklyActivities.get(weekKey) + 1);
        });
        
        // Calculate consistency as inverse of standard deviation
        const counts = Array.from(weeklyActivities.values());
        const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
        const variance = counts.reduce((acc, count) => acc + Math.pow(count - mean, 2), 0) / counts.length;
        const standardDeviation = Math.sqrt(variance);
        
        // Convert to 0-100 scale (lower deviation = higher consistency)
        return Math.max(0, 100 - (standardDeviation * 10));
    }

    // Calculate weekly average activities
    calculateWeeklyAverage(activities) {
        const weeksSpan = this.getWeeksSpan(activities);
        return weeksSpan > 0 ? (activities.length / weeksSpan).toFixed(2) : activities.length;
    }

    // Get week key for grouping activities
    getWeekKey(date, referenceDate) {
        const weekDiff = Math.floor((referenceDate - date) / (7 * 24 * 60 * 60 * 1000));
        return weekDiff;
    }

    // Get span of weeks for activities
    getWeeksSpan(activities) {
        if (activities.length < 2) return 1;
        
        const dates = activities.map(a => a.timestamp).sort((a, b) => a - b);
        const spanMs = dates[dates.length - 1] - dates[0];
        return Math.max(1, Math.ceil(spanMs / (7 * 24 * 60 * 60 * 1000)));
    }

    // Determine engagement level based on score and consistency
    determineEngagementLevel(totalScore, consistencyScore) {
        const combinedScore = (totalScore * 0.7) + (consistencyScore * 0.3);
        
        if (combinedScore >= 80) return 'high';
        if (combinedScore >= 50) return 'medium';
        return 'low';
    }

    // Get top performing students (uses sorting algorithm)
    getTopStudents(limit = 10) {
        const students = Array.from(this.studentEngagementMap.entries());
        
        // Sort by total score descending using merge sort algorithm
        const sortedStudents = this.mergeSort(students, (a, b) => b[1].totalScore - a[1].totalScore);
        
        return sortedStudents.slice(0, limit).map(([id, data]) => ({
            studentId: id,
            ...data,
            rank: sortedStudents.findIndex(([studentId]) => studentId === id) + 1
        }));
    }

    // Merge Sort implementation for efficient sorting
    mergeSort(arr, compareFn) {
        if (arr.length <= 1) return arr;
        
        const mid = Math.floor(arr.length / 2);
        const left = this.mergeSort(arr.slice(0, mid), compareFn);
        const right = this.mergeSort(arr.slice(mid), compareFn);
        
        return this.merge(left, right, compareFn);
    }

    // Merge function for merge sort
    merge(left, right, compareFn) {
        const result = [];
        let i = 0, j = 0;
        
        while (i < left.length && j < right.length) {
            if (compareFn(left[i], right[j]) <= 0) {
                result.push(left[i++]);
            } else {
                result.push(right[j++]);
            }
        }
        
        return result.concat(left.slice(i)).concat(right.slice(j));
    }

    // Get students by engagement level
    getStudentsByEngagementLevel(level) {
        const result = [];
        
        this.studentEngagementMap.forEach((data, studentId) => {
            if (data.engagementLevel === level) {
                result.push({ studentId, ...data });
            }
        });
        
        return result.sort((a, b) => b.totalScore - a.totalScore);
    }

    // Get engagement trends for analytics
    getEngagementTrends(studentId, days = 30) {
        const student = this.studentEngagementMap.get(studentId);
        if (!student) return null;
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const recentActivities = student.activities.filter(
            activity => activity.timestamp >= cutoffDate
        );
        
        // Group by day for trend analysis
        const dailyEngagement = new Map();
        
        recentActivities.forEach(activity => {
            const dayKey = activity.timestamp.toISOString().split('T')[0];
            if (!dailyEngagement.has(dayKey)) {
                dailyEngagement.set(dayKey, { count: 0, score: 0 });
            }
            
            const dayData = dailyEngagement.get(dayKey);
            dayData.count++;
            dayData.score += activity.score;
            dailyEngagement.set(dayKey, dayData);
        });
        
        return Array.from(dailyEngagement.entries()).map(([date, data]) => ({
            date,
            activities: data.count,
            score: data.score,
            average: (data.score / data.count).toFixed(2)
        })).sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Get comprehensive analytics
    getAnalytics() {
        const totalStudents = this.studentEngagementMap.size;
        const engagementLevels = { high: 0, medium: 0, low: 0 };
        let totalActivities = 0;
        let totalScore = 0;
        
        this.studentEngagementMap.forEach((data) => {
            engagementLevels[data.engagementLevel]++;
            totalActivities += data.activities.length;
            totalScore += data.totalScore;
        });
        
        return {
            totalStudents,
            totalActivities,
            averageScore: totalStudents > 0 ? (totalScore / totalStudents).toFixed(2) : 0,
            engagementDistribution: {
                high: ((engagementLevels.high / totalStudents) * 100).toFixed(1),
                medium: ((engagementLevels.medium / totalStudents) * 100).toFixed(1),
                low: ((engagementLevels.low / totalStudents) * 100).toFixed(1)
            },
            topPerformers: this.getTopStudents(5)
        };
    }

    // Export student data for external use
    exportStudentData(studentId) {
        const student = this.studentEngagementMap.get(studentId);
        if (!student) return null;
        
        return {
            studentId,
            ...student,
            recentTrends: this.getEngagementTrends(studentId, 14),
            recommendations: this.generateRecommendations(student)
        };
    }

    // Generate personalized recommendations
    generateRecommendations(studentData) {
        const recommendations = [];
        
        if (studentData.engagementLevel === 'low') {
            recommendations.push("Increase class participation to boost engagement scores");
            recommendations.push("Set daily study goals and track progress");
        }
        
        if (studentData.consistencyScore < 50) {
            recommendations.push("Try to maintain consistent daily activity");
            recommendations.push("Use study planners and reminders");
        }
        
        if (studentData.weeklyAverage < 3) {
            recommendations.push("Aim for at least 5 activities per week");
            recommendations.push("Participate in more collaborative projects");
        }
        
        return recommendations;
    }
}

// Export for use in other modules
window.EngagementAnalyzer = EngagementAnalyzer;
export default EngagementAnalyzer;