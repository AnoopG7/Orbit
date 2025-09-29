// Predictive Engagement & Pattern Recognition Algorithm
// Uses dynamic programming and statistical analysis for predicting student performance

class PredictiveEngagementAnalyzer {
    constructor() {
        this.patterns = new Map();
        this.predictionCache = new Map();
        this.riskFactors = {
            'declining_submissions': 15,
            'missed_deadlines': 12,
            'low_class_participation': 10,
            'irregular_login_patterns': 8,
            'peer_collaboration_decline': 9,
            'assignment_quality_drop': 14
        };
    }

    // Analyze behavioral patterns using dynamic programming
    analyzeStudentPatterns(studentId, activities) {
        const cacheKey = `${studentId}_${activities.length}`;
        
        // Check cache for optimization (memoization technique)
        if (this.predictionCache.has(cacheKey)) {
            return this.predictionCache.get(cacheKey);
        }

        const patterns = {
            submissionPatterns: this.analyzeSubmissionPatterns(activities),
            participationTrends: this.analyzeParticipationTrends(activities),
            qualityTrends: this.analyzeQualityTrends(activities),
            timeManagement: this.analyzeTimeManagement(activities),
            collaborationPatterns: this.analyzeCollaborationPatterns(activities)
        };

        // Cache the result
        this.predictionCache.set(cacheKey, patterns);
        
        // Store in global patterns map
        this.patterns.set(studentId, patterns);
        
        return patterns;
    }

    // Analyze submission patterns using sliding window technique
    analyzeSubmissionPatterns(activities) {
        const submissionActivities = activities.filter(
            a => ['assignment_upload', 'quiz_submission'].includes(a.type)
        ).sort((a, b) => a.timestamp - b.timestamp);

        if (submissionActivities.length < 3) {
            return { trend: 'insufficient_data', reliability: 0 };
        }

        // Use sliding window to detect trends
        const windowSize = 5;
        const trends = [];
        
        for (let i = 0; i <= submissionActivities.length - windowSize; i++) {
            const window = submissionActivities.slice(i, i + windowSize);
            const avgQuality = window.reduce((sum, act) => sum + (act.quality || 70), 0) / window.length;
            const onTimeRate = window.filter(act => !act.isLate).length / window.length;
            
            trends.push({
                period: i + 1,
                averageQuality: avgQuality,
                onTimeSubmissionRate: onTimeRate,
                activityCount: window.length
            });
        }

        // Calculate trend direction using linear regression
        const trendDirection = this.calculateTrendDirection(trends);
        
        return {
            trend: trendDirection,
            recentPerformance: trends[trends.length - 1] || null,
            reliability: Math.min(100, trends.length * 20),
            patterns: trends
        };
    }

    // Analyze participation trends using moving averages
    analyzeParticipationTrends(activities) {
        const participationActivities = activities.filter(
            a => ['class_participation', 'forum_post', 'peer_collaboration'].includes(a.type)
        ).sort((a, b) => a.timestamp - b.timestamp);

        const weeklyParticipation = this.groupActivitiesByWeek(participationActivities);
        const movingAverages = this.calculateMovingAverages(weeklyParticipation, 3);

        return {
            weeklyData: weeklyParticipation,
            movingAverages,
            currentTrend: this.determineTrendDirection(movingAverages),
            participationScore: this.calculateParticipationScore(participationActivities)
        };
    }

    // Analyze quality trends using statistical methods
    analyzeQualityTrends(activities) {
        const qualityData = activities
            .filter(a => a.quality !== undefined)
            .sort((a, b) => a.timestamp - b.timestamp)
            .map(a => ({
                date: a.timestamp,
                quality: a.quality,
                type: a.type
            }));

        if (qualityData.length < 5) {
            return { trend: 'insufficient_data', reliability: 0 };
        }

        // Calculate quality statistics
        const qualities = qualityData.map(d => d.quality);
        const stats = {
            mean: qualities.reduce((a, b) => a + b, 0) / qualities.length,
            median: this.calculateMedian(qualities),
            standardDeviation: this.calculateStandardDeviation(qualities),
            trend: this.calculateTrendDirection(qualityData.map((d, i) => ({ period: i, averageQuality: d.quality })))
        };

        return {
            ...stats,
            recentQuality: qualities.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, qualities.length),
            qualityConsistency: 100 - (stats.standardDeviation * 2), // Lower deviation = higher consistency
            improvement: this.calculateImprovement(qualities),
            reliability: Math.min(100, qualityData.length * 5)
        };
    }

    // Analyze time management patterns
    analyzeTimeManagement(activities) {
        const timedActivities = activities.filter(a => a.submissionTime && a.deadline);
        
        if (timedActivities.length < 3) {
            return { pattern: 'insufficient_data', score: 0 };
        }

        const timePatterns = timedActivities.map(activity => {
            const submissionTime = new Date(activity.submissionTime);
            const deadline = new Date(activity.deadline);
            const timeToDeadline = deadline - submissionTime;
            const hoursBeforeDeadline = timeToDeadline / (1000 * 60 * 60);
            
            return {
                activity: activity.type,
                hoursBeforeDeadline,
                isEarly: hoursBeforeDeadline > 0,
                isLastMinute: Math.abs(hoursBeforeDeadline) < 2
            };
        });

        const earlySubmissionRate = timePatterns.filter(p => p.isEarly).length / timePatterns.length;
        const lastMinuteRate = timePatterns.filter(p => p.isLastMinute).length / timePatterns.length;
        const avgTimeBeforeDeadline = timePatterns.reduce((sum, p) => sum + p.hoursBeforeDeadline, 0) / timePatterns.length;

        let pattern = 'average';
        if (earlySubmissionRate >= 0.8) pattern = 'proactive';
        else if (lastMinuteRate >= 0.6) pattern = 'procrastinator';
        else if (earlySubmissionRate >= 0.5) pattern = 'good_planner';

        return {
            pattern,
            earlySubmissionRate: (earlySubmissionRate * 100).toFixed(1),
            lastMinuteRate: (lastMinuteRate * 100).toFixed(1),
            averageHoursBeforeDeadline: avgTimeBeforeDeadline.toFixed(1),
            score: this.calculateTimeManagementScore(timePatterns),
            recommendations: this.getTimeManagementRecommendations(pattern)
        };
    }

    // Analyze collaboration patterns
    analyzeCollaborationPatterns(activities) {
        const collaborationActivities = activities.filter(a => a.type === 'peer_collaboration');
        
        if (collaborationActivities.length < 2) {
            return { level: 'minimal', score: 0, recommendation: 'Increase peer collaboration' };
        }

        const collaborationFrequency = this.groupActivitiesByWeek(collaborationActivities);
        const avgCollaborationsPerWeek = collaborationFrequency.length > 0 ? 
            collaborationFrequency.reduce((sum, week) => sum + week.count, 0) / collaborationFrequency.length : 0;

        let level = 'minimal';
        if (avgCollaborationsPerWeek >= 3) level = 'high';
        else if (avgCollaborationsPerWeek >= 1.5) level = 'moderate';
        else if (avgCollaborationsPerWeek >= 0.5) level = 'low';

        return {
            level,
            averagePerWeek: avgCollaborationsPerWeek.toFixed(1),
            totalCollaborations: collaborationActivities.length,
            score: Math.min(100, avgCollaborationsPerWeek * 25),
            trend: this.calculateCollaborationTrend(collaborationFrequency),
            recommendations: this.getCollaborationRecommendations(level)
        };
    }

    // Predict future performance using multiple algorithms
    predictFuturePerformance(studentId, weeksAhead = 4) {
        const patterns = this.patterns.get(studentId);
        if (!patterns) {
            return { prediction: 'insufficient_data', confidence: 0 };
        }

        // Weighted scoring system
        const weights = {
            submissionTrend: 0.25,
            participationTrend: 0.20,
            qualityTrend: 0.25,
            timeManagement: 0.15,
            collaboration: 0.15
        };

        let totalScore = 0;
        let totalWeight = 0;

        // Calculate prediction score based on patterns
        if (patterns.submissionPatterns.reliability > 50) {
            const submissionScore = this.getTrendScore(patterns.submissionPatterns.trend);
            totalScore += submissionScore * weights.submissionTrend;
            totalWeight += weights.submissionTrend;
        }

        if (patterns.participationTrends.movingAverages.length > 0) {
            const participationScore = this.getTrendScore(patterns.participationTrends.currentTrend);
            totalScore += participationScore * weights.participationTrend;
            totalWeight += weights.participationTrend;
        }

        if (patterns.qualityTrends.reliability > 50) {
            const qualityScore = this.getTrendScore(patterns.qualityTrends.trend);
            totalScore += qualityScore * weights.qualityTrend;
            totalWeight += weights.qualityTrend;
        }

        totalScore += patterns.timeManagement.score * weights.timeManagement;
        totalScore += patterns.collaborationPatterns.score * weights.collaboration;
        totalWeight += weights.timeManagement + weights.collaboration;

        const finalScore = totalWeight > 0 ? totalScore / totalWeight : 50;
        
        // Determine performance prediction
        let prediction = 'stable';
        if (finalScore >= 80) prediction = 'improving';
        else if (finalScore >= 60) prediction = 'stable';
        else if (finalScore >= 40) prediction = 'declining';
        else prediction = 'at_risk';

        // Calculate confidence based on data reliability
        const confidence = Math.min(100, (
            patterns.submissionPatterns.reliability +
            patterns.qualityTrends.reliability
        ) / 2);

        return {
            prediction,
            score: finalScore.toFixed(1),
            confidence: confidence.toFixed(1),
            weeksAhead,
            riskFactors: this.identifyRiskFactors(patterns),
            recommendations: this.generatePredictiveRecommendations(prediction, patterns),
            breakdown: {
                submissions: patterns.submissionPatterns.trend,
                participation: patterns.participationTrends.currentTrend,
                quality: patterns.qualityTrends.trend,
                timeManagement: patterns.timeManagement.pattern,
                collaboration: patterns.collaborationPatterns.level
            }
        };
    }

    // Identify students at risk using pattern recognition
    identifyAtRiskStudents(allStudentData) {
        const riskAssessments = [];

        allStudentData.forEach((studentData, studentId) => {
            const patterns = this.analyzeStudentPatterns(studentId, studentData.activities);
            const prediction = this.predictFuturePerformance(studentId);
            
            const riskScore = this.calculateRiskScore(patterns, prediction);
            
            if (riskScore >= 60) { // High risk threshold
                riskAssessments.push({
                    studentId,
                    riskScore,
                    riskLevel: riskScore >= 80 ? 'high' : 'medium',
                    primaryConcerns: this.identifyPrimaryConcerns(patterns),
                    recommendedInterventions: this.getInterventionRecommendations(patterns),
                    urgency: riskScore >= 80 ? 'immediate' : 'monitor'
                });
            }
        });

        // Sort by risk score (highest first)
        return riskAssessments.sort((a, b) => b.riskScore - a.riskScore);
    }

    // Helper methods for calculations
    calculateTrendDirection(dataPoints) {
        if (dataPoints.length < 2) return 'stable';
        
        const n = dataPoints.length;
        const sumX = dataPoints.reduce((sum, _, i) => sum + i, 0);
        const sumY = dataPoints.reduce((sum, point) => sum + point.averageQuality, 0);
        const sumXY = dataPoints.reduce((sum, point, i) => sum + (i * point.averageQuality), 0);
        const sumXX = dataPoints.reduce((sum, _, i) => sum + (i * i), 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        
        if (slope > 0.5) return 'improving';
        if (slope < -0.5) return 'declining';
        return 'stable';
    }

    calculateMedian(arr) {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? 
            (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }

    calculateStandardDeviation(arr) {
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        const variance = arr.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / arr.length;
        return Math.sqrt(variance);
    }

    groupActivitiesByWeek(activities) {
        const weeks = new Map();
        
        activities.forEach(activity => {
            const weekKey = this.getWeekKey(activity.timestamp);
            if (!weeks.has(weekKey)) {
                weeks.set(weekKey, { week: weekKey, count: 0, activities: [] });
            }
            const weekData = weeks.get(weekKey);
            weekData.count++;
            weekData.activities.push(activity);
            weeks.set(weekKey, weekData);
        });
        
        return Array.from(weeks.values()).sort((a, b) => a.week - b.week);
    }

    getWeekKey(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const week = Math.ceil((d.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
        return `${year}-W${week}`;
    }

    calculateMovingAverages(weeklyData, windowSize) {
        const averages = [];
        
        for (let i = windowSize - 1; i < weeklyData.length; i++) {
            const window = weeklyData.slice(i - windowSize + 1, i + 1);
            const average = window.reduce((sum, week) => sum + week.count, 0) / windowSize;
            averages.push({
                week: weeklyData[i].week,
                average: average.toFixed(2)
            });
        }
        
        return averages;
    }

    getTrendScore(trend) {
        switch (trend) {
            case 'improving': return 85;
            case 'stable': return 70;
            case 'declining': return 40;
            default: return 50;
        }
    }

    calculateRiskScore(patterns, prediction) {
        let riskScore = 0;
        
        // Add risk based on trends
        if (patterns.submissionPatterns.trend === 'declining') riskScore += 20;
        if (patterns.qualityTrends.trend === 'declining') riskScore += 25;
        if (patterns.participationTrends.currentTrend === 'declining') riskScore += 15;
        if (patterns.timeManagement.pattern === 'procrastinator') riskScore += 15;
        if (patterns.collaborationPatterns.level === 'minimal') riskScore += 10;
        
        // Add risk based on prediction
        if (prediction.prediction === 'at_risk') riskScore += 30;
        else if (prediction.prediction === 'declining') riskScore += 20;
        
        return Math.min(100, riskScore);
    }

    identifyRiskFactors(patterns) {
        const factors = [];
        
        if (patterns.submissionPatterns.trend === 'declining') {
            factors.push('declining_submissions');
        }
        if (patterns.qualityTrends.trend === 'declining') {
            factors.push('assignment_quality_drop');
        }
        if (patterns.timeManagement.pattern === 'procrastinator') {
            factors.push('missed_deadlines');
        }
        if (patterns.participationTrends.currentTrend === 'declining') {
            factors.push('low_class_participation');
        }
        if (patterns.collaborationPatterns.level === 'minimal') {
            factors.push('peer_collaboration_decline');
        }
        
        return factors;
    }

    generatePredictiveRecommendations(prediction, patterns) {
        const recommendations = [];
        
        switch (prediction) {
            case 'at_risk':
                recommendations.push('Schedule immediate intervention meeting');
                recommendations.push('Provide additional academic support');
                recommendations.push('Consider peer mentoring program');
                break;
            case 'declining':
                recommendations.push('Monitor closely for next 2 weeks');
                recommendations.push('Provide study skills resources');
                break;
            case 'stable':
                recommendations.push('Maintain current engagement strategies');
                break;
            case 'improving':
                recommendations.push('Recognize and encourage current progress');
                break;
        }
        
        return recommendations;
    }
}

// Export for use in other modules
window.PredictiveEngagementAnalyzer = PredictiveEngagementAnalyzer;
export default PredictiveEngagementAnalyzer;