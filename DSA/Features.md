1. ✅ **Searching for a Student (Admin Dashboard) - IMPLEMENTED**

**Problem**: Admin wants to find a student quickly from the list.

**DSA Application**: 
- Store student IDs/names in a Binary Search Tree (BST) or simply apply Binary Search on a sorted array.
- **Implementation**: `DSA/search.js` with Binary Search algorithm
- **Features**: 
  - Real-time search with O(log n) complexity
  - Auto-complete suggestions
  - Multi-field search (name, email, ID)
  - Performance counter showing search time
  - Case-insensitive search

**Files**:
- `DSA/search.js` - Binary Search implementation
- `DSA/test-search.js` - Test cases and performance benchmarks
- `pages/admin-dashboard.html` - Search UI components
- `Scripts/admin-dashboard.js` - Integration with existing user management



2. Ranking Students (Leaderboards)

Problem: Teachers/admins want to see top engaged students.

DSA Application:

Take student engagement scores and apply Merge Sort / Quick Sort.


3. Activity Logs (Student Dashboard)

Problem: Activities should be stored in a way that supports order & retrieval.

DSA Application:

Use a Queue for activity logs (FIFO — oldest to newest).

Optionally: Use a Stack for undo/recent actions (LIFO).


4. Performance Analytics (Tree-based)

Problem: Track engagement trends.

Easy Hack: Use a Binary Tree structure to represent “engagement score” ranges.

Example: root = average engagement; left child = low-engagement students; right child = high-engagement students.

