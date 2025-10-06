/**
 * MERGE SORT ALGORITHMS - Student Performance Ranking System
 * 
 * This file implements merge sort algorithms optimized for ranking students by
 * engagement scores and performance metrics. It provides stable, efficient O(n log n)
 * sorting with comprehensive analytics for educational data.
 * 
 * Key Features:
 * - Merge sort for students by engagement scores (descending order)
 * - Student ranking with percentile calculations and top performer identification
 * - Performance analytics class with real-time sorting metrics
 * - Flexible score extraction from various data structures
 * - Top performer analysis and comprehensive statistics generation
 * - Performance timing and optimization tracking
 * 
 * Used by: Admin dashboards, performance analytics, student leaderboards
 * Global Access: window.StudentMergeSort
 */

/**
 * Merge Sort for Students by Engagement Score
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 * 
 * @param {Array} students - Array of student objects with engagement scores
 * @returns {Array} - Students sorted in descending order by engagement score
 */
function mergeSortStudents(students) {
    // Base case: arrays with 0 or 1 element are already sorted
    if (students.length <= 1) {
        return students;
    }
    
    // Divide: split the array into two halves
    const middle = Math.floor(students.length / 2);
    const left = students.slice(0, middle);
    const right = students.slice(middle);
    
    // Conquer: recursively sort both halves
    const sortedLeft = mergeSortStudents(left);
    const sortedRight = mergeSortStudents(right);
    
    // Combine: merge the sorted halves
    return mergeStudents(sortedLeft, sortedRight);
}

/**
 * Merge two sorted arrays of students in descending order by engagement score
 * 
 * @param {Array} left - Left sorted array of students
 * @param {Array} right - Right sorted array of students
 * @returns {Array} - Merged sorted array in descending order
 */
function mergeStudents(left, right) {
    const result = [];
    let leftIndex = 0;
    let rightIndex = 0;
    
    // Compare elements from both arrays and merge in descending order
    while (leftIndex < left.length && rightIndex < right.length) {
        const leftScore = getEngagementScore(left[leftIndex]);
        const rightScore = getEngagementScore(right[rightIndex]);
        
        // Sort in descending order (highest scores first)
        if (leftScore >= rightScore) {
            result.push(left[leftIndex]);
            leftIndex++;
        } else {
            result.push(right[rightIndex]);
            rightIndex++;
        }
    }
    
    // Add remaining elements from left array
    while (leftIndex < left.length) {
        result.push(left[leftIndex]);
        leftIndex++;
    }
    
    // Add remaining elements from right array
    while (rightIndex < right.length) {
        result.push(right[rightIndex]);
        rightIndex++;
    }
    
    return result;
}

/**
 * Extract engagement score from student object
 * Handles various score field formats
 * 
 * @param {Object} student - Student object
 * @returns {number} - Engagement score (0 if not found or invalid)
 */
function getEngagementScore(student) {
    // Check various possible score fields
    if (student.analytics?.engagementScore) {
        const score = parseFloat(student.analytics.engagementScore);
        return isNaN(score) ? 0 : score;
    }
    
    if (student.engagementScore) {
        const score = parseFloat(student.engagementScore);
        return isNaN(score) ? 0 : score;
    }
    
    if (student.score) {
        const score = parseFloat(student.score);
        return isNaN(score) ? 0 : score;
    }
    
    // If no score found, return 0
    return 0;
}

/**
 * Rank students using merge sort and add ranking information
 * 
 * @param {Array} students - Array of student objects
 * @returns {Array} - Students sorted by engagement score with ranking info
 */
function rankStudentsByEngagement(students) {
    if (!students || students.length === 0) {
        return [];
    }
    
    // Filter out non-student users and those without valid scores
    const studentsOnly = students.filter(user => 
        user.role === 'student' && getEngagementScore(user) > 0
    );
    
    if (studentsOnly.length === 0) {
        return [];
    }
    
    // Sort using merge sort
    const sortedStudents = mergeSortStudents(studentsOnly);
    
    // Add ranking information
    return sortedStudents.map((student, index) => ({
        ...student,
        ranking: index + 1,
        percentile: Math.round(((studentsOnly.length - index) / studentsOnly.length) * 100),
        isTopPerformer: index < Math.ceil(studentsOnly.length * 0.2) // Top 20%
    }));
}

/**
 * Get top performing students using merge sort
 * 
 * @param {Array} students - Array of student objects
 * @param {number} limit - Number of top students to return (default: 10)
 * @returns {Array} - Top performing students
 */
function getTopPerformingStudents(students, limit = 10) {
    const rankedStudents = rankStudentsByEngagement(students);
    return rankedStudents.slice(0, limit);
}

/**
 * Student Performance Analytics using Merge Sort
 */
class StudentPerformanceAnalyzer {
    constructor() {
        this.students = [];
        this.lastSortTime = 0;
    }
    
    /**
     * Initialize with student data
     * @param {Array} students - Array of student objects
     */
    initialize(students) {
        this.students = students || [];
    }
    
    /**
     * Get ranked students with performance analysis
     * @returns {Array} - Ranked students with analytics
     */
    getRankedStudents() {
        const startTime = performance.now();
        const ranked = rankStudentsByEngagement(this.students);
        const endTime = performance.now();
        
        this.lastSortTime = endTime - startTime;
        
        console.log(`🏆 Merge Sort completed in ${this.lastSortTime.toFixed(2)}ms for ${ranked.length} students`);
        
        return ranked;
    }
    
    /**
     * Get top performers using merge sort
     * @param {number} limit - Number of top students to return
     * @returns {Array} - Top performing students
     */
    getTopPerformers(limit = 10) {
        const ranked = this.getRankedStudents();
        return ranked.slice(0, limit);
    }
    
    /**
     * Get performance statistics
     * @returns {Object} - Performance statistics
     */
    getPerformanceStats() {
        const ranked = this.getRankedStudents();
        
        if (ranked.length === 0) {
            return {
                totalStudents: 0,
                averageScore: 0,
                topScore: 0,
                lastSortTime: this.lastSortTime
            };
        }
        
        const scores = ranked.map(student => getEngagementScore(student));
        const totalScore = scores.reduce((sum, score) => sum + score, 0);
        
        return {
            totalStudents: ranked.length,
            averageScore: (totalScore / ranked.length).toFixed(2),
            topScore: scores[0] || 0,
            lastSortTime: this.lastSortTime.toFixed(2),
            topPerformersCount: ranked.filter(s => s.isTopPerformer).length
        };
    }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        mergeSortStudents,
        mergeStudents,
        getEngagementScore,
        rankStudentsByEngagement,
        getTopPerformingStudents,
        StudentPerformanceAnalyzer
    };
}

// Make functions available globally for browser use
if (typeof window !== 'undefined') {
    window.StudentMergeSort = {
        mergeSortStudents,
        mergeStudents,
        getEngagementScore,
        rankStudentsByEngagement,
        getTopPerformingStudents,
        StudentPerformanceAnalyzer
    };
}