/**
 * DSA Implementation: Binary Search Tree for Student Engagement Analysis
 * Time Complexity: O(log n) average, O(n) worst case for operations
 * Space Complexity: O(n) for tree storage, O(h) for recursion stack
 * 
 * Purpose: Efficiently categorize and analyze students by engagement scores
 * Use Cases: Performance ranking, engagement analytics, score-based grouping
 */

/**
 * Node structure for BST
 */
class StudentNode {
    constructor(studentId, score, studentData = {}) {
        this.studentId = studentId;
        this.score = score;
        this.studentData = studentData; // Additional student information
        this.left = null;
        this.right = null;
        this.timestamp = Date.now(); // When this score was recorded
    }
}

/**
 * Binary Search Tree for Student Engagement Analysis
 */
class StudentEngagementBST {
    constructor() {
        this.root = null;
        this.size = 0;
        this.lastUpdated = Date.now();
    }

    /**
     * Insert a student into the BST by engagement score
     * Time Complexity: O(log n) average, O(n) worst case
     * @param {string} studentId - Unique student identifier
     * @param {number} score - Engagement score (0-100)
     * @param {Object} studentData - Additional student data
     * @returns {StudentEngagementBST} - Returns this for chaining
     */
    insert(studentId, score, studentData = {}) {
        // Validate input
        if (!studentId || typeof studentId !== 'string') {
            throw new Error('Student ID must be a valid string');
        }
        
        if (typeof score !== 'number' || score < 0 || score > 100) {
            throw new Error('Score must be a number between 0 and 100');
        }

        const newNode = new StudentNode(studentId, score, studentData);
        
        if (this.root === null) {
            this.root = newNode;
            this.size = 1;
            console.log(`🌳 BST initialized with student ${studentId} (score: ${score})`);
        } else {
            this._insertNode(this.root, newNode);
            this.size++;
            console.log(`📊 Added student ${studentId} with score ${score} to BST`);
        }
        
        this.lastUpdated = Date.now();
        return this;
    }

    /**
     * Helper method to recursively insert a node
     * @param {StudentNode} node - Current node
     * @param {StudentNode} newNode - Node to insert
     */
    _insertNode(node, newNode) {
        if (newNode.score < node.score) {
            if (node.left === null) {
                node.left = newNode;
            } else {
                this._insertNode(node.left, newNode);
            }
        } else {
            // Insert to right for scores >= current node score
            if (node.right === null) {
                node.right = newNode;
            } else {
                this._insertNode(node.right, newNode);
            }
        }
    }

    /**
     * In-order traversal to get students sorted by engagement score
     * Time Complexity: O(n)
     * @param {StudentNode} root - Root node (optional, uses this.root if not provided)
     * @returns {Array} - Array of students sorted by score (ascending)
     */
    inOrderTraversal(root = this.root) {
        const result = [];
        this._inOrder(root, result);
        return result;
    }

    /**
     * Helper method for in-order traversal
     * @param {StudentNode} node - Current node
     * @param {Array} result - Array to store results
     */
    _inOrder(node, result) {
        if (node !== null) {
            this._inOrder(node.left, result);
            result.push({
                studentId: node.studentId,
                score: node.score,
                studentData: node.studentData,
                timestamp: node.timestamp
            });
            this._inOrder(node.right, result);
        }
    }

    /**
     * Categorize students by engagement level
     * Time Complexity: O(n)
     * @param {StudentNode} root - Root node (optional, uses this.root if not provided)
     * @returns {Object} - {low: [], medium: [], high: []} categorized students
     */
    categorize(root = this.root) {
        const categories = {
            low: [],      // score < 30
            medium: [],   // score 30-70
            high: []      // score > 70
        };
        
        this._categorizeNodes(root, categories);
        
        console.log(`📊 Categorization complete:`, {
            low: categories.low.length,
            medium: categories.medium.length,
            high: categories.high.length,
            total: this.size
        });
        
        return categories;
    }

    /**
     * Helper method to categorize nodes
     * Updated for activity-based scoring: Low (0-4), Medium (5-14), High (15+)
     * @param {StudentNode} node - Current node
     * @param {Object} categories - Categories object to populate
     */
    _categorizeNodes(node, categories) {
        if (node !== null) {
            const student = {
                studentId: node.studentId,
                score: node.score,
                studentData: node.studentData,
                timestamp: node.timestamp
            };
            
            // New thresholds based on activity count
            if (node.score < 5) {
                categories.low.push(student);      // 0-4 activities = Low
            } else if (node.score < 15) {
                categories.medium.push(student);   // 5-14 activities = Medium
            } else {
                categories.high.push(student);     // 15+ activities = High
            }
            
            this._categorizeNodes(node.left, categories);
            this._categorizeNodes(node.right, categories);
        }
    }

    /**
     * Find a student by ID
     * Time Complexity: O(n) - we need to search by ID, not score
     * @param {string} studentId - Student ID to find
     * @returns {Object|null} - Student object or null if not found
     */
    findStudent(studentId) {
        return this._findStudentNode(this.root, studentId);
    }

    /**
     * Helper method to find student by ID
     * @param {StudentNode} node - Current node
     * @param {string} studentId - Student ID to find
     * @returns {Object|null} - Student object or null
     */
    _findStudentNode(node, studentId) {
        if (node === null) {
            return null;
        }
        
        if (node.studentId === studentId) {
            return {
                studentId: node.studentId,
                score: node.score,
                studentData: node.studentData,
                timestamp: node.timestamp
            };
        }
        
        // Search both subtrees since we're searching by ID, not score
        const leftResult = this._findStudentNode(node.left, studentId);
        if (leftResult) return leftResult;
        
        return this._findStudentNode(node.right, studentId);
    }

    /**
     * Get students within a score range
     * Time Complexity: O(n) worst case, but can be optimized
     * @param {number} minScore - Minimum score (inclusive)
     * @param {number} maxScore - Maximum score (inclusive)
     * @returns {Array} - Students within the score range
     */
    getStudentsInRange(minScore, maxScore) {
        const result = [];
        this._getInRange(this.root, minScore, maxScore, result);
        return result;
    }

    /**
     * Helper method to get students in score range
     * @param {StudentNode} node - Current node
     * @param {number} minScore - Minimum score
     * @param {number} maxScore - Maximum score
     * @param {Array} result - Array to store results
     */
    _getInRange(node, minScore, maxScore, result) {
        if (node === null) return;
        
        // If current score is in range, add to result
        if (node.score >= minScore && node.score <= maxScore) {
            result.push({
                studentId: node.studentId,
                score: node.score,
                studentData: node.studentData,
                timestamp: node.timestamp
            });
        }
        
        // Recursively search left and right subtrees
        // Optimization: only search subtrees that might contain valid scores
        if (minScore < node.score) {
            this._getInRange(node.left, minScore, maxScore, result);
        }
        if (maxScore > node.score) {
            this._getInRange(node.right, minScore, maxScore, result);
        }
    }

    /**
     * Get the top N highest scoring students
     * Time Complexity: O(n)
     * @param {number} n - Number of top students to return
     * @returns {Array} - Top N students sorted by score (descending)
     */
    getTopStudents(n) {
        const allStudents = this.inOrderTraversal();
        return allStudents
            .sort((a, b) => b.score - a.score) // Sort descending
            .slice(0, n);
    }

    /**
     * Get the bottom N lowest scoring students
     * Time Complexity: O(n)
     * @param {number} n - Number of bottom students to return
     * @returns {Array} - Bottom N students sorted by score (ascending)
     */
    getBottomStudents(n) {
        const allStudents = this.inOrderTraversal();
        return allStudents
            .sort((a, b) => a.score - b.score) // Sort ascending
            .slice(0, n);
    }

    /**
     * Calculate engagement statistics
     * Time Complexity: O(n)
     * @returns {Object} - Statistics about engagement scores
     */
    getEngagementStats() {
        if (this.size === 0) {
            return {
                total: 0,
                average: 0,
                median: 0,
                min: 0,
                max: 0,
                distribution: { low: 0, medium: 0, high: 0 }
            };
        }
        
        const students = this.inOrderTraversal();
        const scores = students.map(s => s.score);
        const categories = this.categorize();
        
        // Calculate statistics
        const total = scores.length;
        const sum = scores.reduce((acc, score) => acc + score, 0);
        const average = sum / total;
        const median = this._calculateMedian(scores);
        const min = Math.min(...scores);
        const max = Math.max(...scores);
        
        return {
            total,
            average: Math.round(average * 100) / 100,
            median,
            min,
            max,
            distribution: {
                low: categories.low.length,
                medium: categories.medium.length,
                high: categories.high.length
            },
            lastUpdated: new Date(this.lastUpdated).toISOString()
        };
    }

    /**
     * Calculate median from sorted array
     * @param {Array} sortedScores - Array of scores (already sorted)
     * @returns {number} - Median value
     */
    _calculateMedian(sortedScores) {
        const length = sortedScores.length;
        const middle = Math.floor(length / 2);
        
        if (length % 2 === 0) {
            return (sortedScores[middle - 1] + sortedScores[middle]) / 2;
        } else {
            return sortedScores[middle];
        }
    }

    /**
     * Clear the BST
     * Time Complexity: O(1)
     */
    clear() {
        this.root = null;
        this.size = 0;
        this.lastUpdated = Date.now();
        console.log('🧹 BST cleared');
    }

    /**
     * Get the size of the BST
     * @returns {number} - Number of students in the tree
     */
    getSize() {
        return this.size;
    }

    /**
     * Check if BST is empty
     * @returns {boolean} - True if empty, false otherwise
     */
    isEmpty() {
        return this.size === 0;
    }

    /**
     * Display BST structure for debugging
     * Time Complexity: O(n)
     */
    display() {
        if (this.isEmpty()) {
            console.log('🌳 BST is empty');
            return;
        }
        
        console.log(`🌳 Student Engagement BST (${this.size} students):`);
        this._displayNode(this.root, '', true);
    }

    /**
     * Helper method to display tree structure
     * @param {StudentNode} node - Current node
     * @param {string} prefix - Prefix for formatting
     * @param {boolean} isLast - Whether this is the last child
     */
    _displayNode(node, prefix = '', isLast = true) {
        if (node !== null) {
            console.log(prefix + (isLast ? '└── ' : '├── ') + 
                       `${node.studentId} (${node.score})`);
            
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            
            if (node.left !== null || node.right !== null) {
                if (node.right !== null) {
                    this._displayNode(node.right, newPrefix, node.left === null);
                }
                if (node.left !== null) {
                    this._displayNode(node.left, newPrefix, true);
                }
            }
        }
    }
}

// Export for both browser and Node.js environments
if (typeof window !== 'undefined') {
    // Browser environment
    window.StudentEngagementBST = StudentEngagementBST;
    console.log('🌳 StudentEngagementBST loaded and available globally');
} else {
    // Node.js environment
    module.exports = { StudentEngagementBST, StudentNode };
}

// Example usage (commented out for production)
/*
// Create BST instance
const engagementBST = new StudentEngagementBST();

// Insert students with engagement scores
engagementBST.insert("S1", 55, {name: "Alice", course: "CS101"});
engagementBST.insert("S2", 25, {name: "Bob", course: "CS101"});
engagementBST.insert("S3", 85, {name: "Charlie", course: "CS102"});
engagementBST.insert("S4", 45, {name: "Diana", course: "CS101"});
engagementBST.insert("S5", 95, {name: "Eve", course: "CS102"});

// Get sorted students
const sortedStudents = engagementBST.inOrderTraversal();
console.log('Sorted by score:', sortedStudents);

// Categorize by engagement level
const categories = engagementBST.categorize();
console.log('High performers:', categories.high);
console.log('Medium performers:', categories.medium);
console.log('Low performers:', categories.low);

// Get engagement statistics
const stats = engagementBST.getEngagementStats();
console.log('Engagement stats:', stats);

// Display tree structure
engagementBST.display();
*/