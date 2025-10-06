/**
 * BINARY SEARCH ALGORITHMS - Student Search & Lookup System
 * 
 * This file implements optimized binary search algorithms specifically designed for
 * efficiently searching and filtering students by various criteria. It provides
 * fast O(log n) search operations for large student datasets.
 * 
 * Key Features:
 * - Binary search for students by any property (name, email, ID)
 * - Prefix matching for auto-complete functionality
 * - Multi-field search across name, email, and ID fields
 * - Case-insensitive searching with partial word matching
 * - Search manager class with pre-sorted data optimization
 * - Support for nested property access and flexible data structures
 * 
 * Used by: Student dashboards, admin panels, CRM search functionality
 * Global Access: window.StudentBinarySearch
 */

/**
 * DSA Implementation: Binary Search Algorithms for Student Search & Lookup
 * Time Complexity: O(log n) for binary search operations
 * Space Complexity: O(1) for search operations, O(n) for sorted arrays
 * 
 * Purpose: Efficiently search and find students by various criteria
 * Use Cases: Student lookup, auto-complete, multi-field search, user interface search
 */

/**
 * Binary Search for Students
 * Time Complexity: O(log n)
 * Space Complexity: O(1)
 * 
 * @param {Array} students - Sorted array of student objects
 * @param {string} key - Property to search by ('id', 'name', 'email', etc.)
 * @param {string} value - Target value to search for
 * @returns {Object|null} - Found student object or null if not found
 */
function binarySearchStudents(students, key, value) {
    if (!students || students.length === 0) {
        return null;
    }

    let left = 0;
    let right = students.length - 1;
    
    // Convert search value to lowercase for case-insensitive search
    const searchValue = value.toString().toLowerCase();

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const student = students[mid];
        
        // Get the value of the specified key from the student object
        const studentValue = getNestedProperty(student, key);
        if (studentValue === null) {
            return null; // Key doesn't exist in student object
        }
        
        const studentValueLower = studentValue.toString().toLowerCase();

        if (studentValueLower === searchValue) {
            return student; // Found exact match
        } else if (studentValueLower < searchValue) {
            left = mid + 1; // Search in right half
        } else {
            right = mid - 1; // Search in left half
        }
    }

    return null; // Not found
}

/**
 * Enhanced Binary Search with Prefix Matching
 * Useful for auto-complete functionality
 * 
 * @param {Array} students - Sorted array of student objects
 * @param {string} key - Property to search by
 * @param {string} prefix - Prefix to match
 * @returns {Array} - Array of students whose key starts with the prefix
 */
function binarySearchStudentsPrefix(students, key, prefix) {
    if (!students || students.length === 0 || !prefix) {
        return [];
    }

    const prefixLower = prefix.toString().toLowerCase();
    const results = [];

    // Find the first occurrence using modified binary search
    let left = 0;
    let right = students.length - 1;
    let firstIndex = -1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const student = students[mid];
        const studentValue = getNestedProperty(student, key);
        
        if (studentValue === null) {
            return [];
        }
        
        const studentValueLower = studentValue.toString().toLowerCase();

        if (studentValueLower.startsWith(prefixLower)) {
            firstIndex = mid;
            right = mid - 1; // Continue searching for the first occurrence
        } else if (studentValueLower < prefixLower) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    // If no match found
    if (firstIndex === -1) {
        return [];
    }

    // Collect all students that start with the prefix
    let index = firstIndex;
    while (index < students.length) {
        const student = students[index];
        const studentValue = getNestedProperty(student, key);
        
        if (studentValue === null) {
            break;
        }
        
        const studentValueLower = studentValue.toString().toLowerCase();
        
        if (studentValueLower.startsWith(prefixLower)) {
            results.push(student);
            index++;
        } else {
            break;
        }
    }

    return results;
}

/**
 * Multi-field Search using Binary Search
 * Searches across multiple fields (name, email, id) including individual words in names
 * 
 * @param {Array} students - Array of student objects
 * @param {string} query - Search query
 * @returns {Array} - Array of matching students
 */
function multiFieldSearch(students, query) {
    if (!students || students.length === 0 || !query) {
        return [];
    }

    const results = new Set(); // Use Set to avoid duplicates
    const searchFields = ['displayName', 'fullName', 'email', 'id', 'studentId'];
    const queryLower = query.toLowerCase().trim();

    searchFields.forEach(field => {
        // First, sort students by the current field
        const sortedStudents = [...students].sort((a, b) => {
            const aValue = getNestedProperty(a, field) || '';
            const bValue = getNestedProperty(b, field) || '';
            return aValue.toString().toLowerCase().localeCompare(bValue.toString().toLowerCase());
        });

        // Search for exact matches
        const exactMatch = binarySearchStudents(sortedStudents, field, query);
        if (exactMatch) {
            results.add(exactMatch);
        }

        // Search for prefix matches
        const prefixMatches = binarySearchStudentsPrefix(sortedStudents, field, query);
        prefixMatches.forEach(student => results.add(student));
    });

    // Additional search for individual words in names (for last name searching)
    students.forEach(student => {
        const displayName = getNestedProperty(student, 'displayName') || '';
        const fullName = getNestedProperty(student, 'fullName') || '';
        const names = [displayName, fullName];
        
        names.forEach(name => {
            if (name) {
                const words = name.toLowerCase().split(' ');
                // Check if any word starts with the query
                if (words.some(word => word.startsWith(queryLower))) {
                    results.add(student);
                }
                // Check if any word contains the query (for partial matches)
                if (words.some(word => word.includes(queryLower))) {
                    results.add(student);
                }
            }
        });

        // Enhanced email search - check if query is contained in email
        const email = getNestedProperty(student, 'email') || '';
        if (email.toLowerCase().includes(queryLower)) {
            results.add(student);
        }

        // Enhanced ID search - check all possible ID fields
        const idFields = ['id', 'studentId', 'userId'];
        idFields.forEach(idField => {
            const idValue = getNestedProperty(student, idField) || '';
            if (idValue.toString().toLowerCase().includes(queryLower)) {
                results.add(student);
            }
        });
    });

    return Array.from(results);
}

/**
 * Utility function to get nested property from object
 * Supports dot notation like 'analytics.totalScore'
 * 
 * @param {Object} obj - Object to search in
 * @param {string} path - Property path
 * @returns {any|null} - Property value or null if not found
 */
function getNestedProperty(obj, path) {
    if (!obj || !path) {
        return null;
    }

    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
        if (result === null || result === undefined || !(key in result)) {
            return null;
        }
        result = result[key];
    }

    return result;
}

/**
 * Sort students array by a specified key
 * Required for binary search to work correctly
 * 
 * @param {Array} students - Array of student objects
 * @param {string} key - Property to sort by
 * @returns {Array} - Sorted array of students
 */
function sortStudents(students, key) {
    if (!students || students.length === 0) {
        return [];
    }

    return [...students].sort((a, b) => {
        const aValue = getNestedProperty(a, key) || '';
        const bValue = getNestedProperty(b, key) || '';
        return aValue.toString().toLowerCase().localeCompare(bValue.toString().toLowerCase());
    });
}

/**
 * Search Manager Class
 * Manages multiple sorted arrays for efficient searching
 */
class StudentSearchManager {
    constructor() {
        this.sortedByName = [];
        this.sortedByEmail = [];
        this.sortedById = [];
        this.originalData = [];
    }

    /**
     * Initialize the search manager with student data
     * @param {Array} students - Array of student objects
     */
    initialize(students) {
        if (!students || students.length === 0) {
            this.clear();
            return;
        }

        this.originalData = [...students];
        this.sortedByName = sortStudents(students, 'displayName');
        this.sortedByEmail = sortStudents(students, 'email');
        this.sortedById = sortStudents(students, 'id');
    }

    /**
     * Clear all sorted arrays
     */
    clear() {
        this.sortedByName = [];
        this.sortedByEmail = [];
        this.sortedById = [];
        this.originalData = [];
    }

    /**
     * Enhanced search with support for name parts, email, and ID searching
     * @param {string} query - Search query
     * @returns {Array} - Array of matching students
     */
    search(query) {
        if (!query || query.trim() === '') {
            return this.originalData;
        }

        const results = new Set();
        const queryLower = query.toLowerCase().trim();

        // Use the enhanced multiFieldSearch function
        const multiFieldResults = multiFieldSearch(this.originalData, query);
        multiFieldResults.forEach(student => results.add(student));

        // Additional optimization: if query looks like an email, prioritize email search
        if (query.includes('@')) {
            this.originalData.forEach(student => {
                const email = getNestedProperty(student, 'email') || '';
                if (email.toLowerCase().includes(queryLower)) {
                    results.add(student);
                }
            });
        }

        // If query is short (likely an ID), prioritize ID searches
        if (query.length <= 6 && /^[a-zA-Z0-9]+$/.test(query)) {
            this.originalData.forEach(student => {
                const idFields = ['id', 'studentId', 'userId'];
                idFields.forEach(idField => {
                    const idValue = getNestedProperty(student, idField) || '';
                    if (idValue.toString().toLowerCase().includes(queryLower)) {
                        results.add(student);
                    }
                });
            });
        }

        return Array.from(results);
    }

    /**
     * Get search suggestions for auto-complete (enhanced for name parts)
     * @param {string} query - Partial query
     * @param {number} limit - Maximum number of suggestions
     * @returns {Array} - Array of suggestion strings
     */
    getSuggestions(query, limit = 5) {
        if (!query || query.trim() === '') {
            return [];
        }

        const suggestions = new Set();
        const queryLower = query.toLowerCase().trim();
        
        // Get name suggestions (including individual words)
        this.originalData.forEach(student => {
            const displayName = getNestedProperty(student, 'displayName') || '';
            
            // Add full name if it starts with query
            if (displayName.toLowerCase().startsWith(queryLower)) {
                suggestions.add(displayName);
            }
            
            // Add individual words that start with query
            const words = displayName.split(' ');
            words.forEach(word => {
                if (word.toLowerCase().startsWith(queryLower) && word.length > 1) {
                    suggestions.add(word);
                }
            });
            
            // Add email suggestions if query contains @ or looks like email start
            const email = getNestedProperty(student, 'email') || '';
            if (query.includes('@') || email.toLowerCase().startsWith(queryLower)) {
                if (email.toLowerCase().includes(queryLower)) {
                    suggestions.add(email);
                }
            }
        });

        return Array.from(suggestions).slice(0, limit);
    }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        binarySearchStudents,
        binarySearchStudentsPrefix,
        multiFieldSearch,
        sortStudents,
        StudentSearchManager
    };
}

// Make functions available globally for browser use with updated naming
if (typeof window !== 'undefined') {
    window.StudentBinarySearch = {
        binarySearchStudents,
        binarySearchStudentsPrefix,
        multiFieldSearch,
        sortStudents,
        StudentSearchManager
    };
}