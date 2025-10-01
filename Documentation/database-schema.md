# Orbit Student Engagement Analyzer - Database Schema Documentation

## Overview
This document describes the complete database schema for the Orbit Student Engagement Analyzer system. The system uses Firebase Firestore as the primary database, organized into collections that store student data, activities, courses, teachers, and system statistics.

## Database Structure

### Collections Overview
| Collection | Purpose | Documents | Key Features |
|------------|---------|-----------|--------------|
| `students` | Student profiles and enrollment data | 20 | Academic info, preferences, status tracking |
| `teachers` | Faculty profiles and teaching data | 5 | Departments, specializations, experience |
| `courses` | Course catalog and scheduling | 8 | Prerequisites, enrollment limits, schedules |
| `activities` | Student engagement activities | 350+ | Scores, engagement metrics, timestamps |
| `system` | System statistics and metadata | 1 | Analytics, health metrics, usage stats |

---

## Collection Schemas

### 1. Students Collection (`students`)

**Purpose**: Stores comprehensive student profiles, academic information, and system preferences.

#### Schema Definition
```typescript
interface Student {
  id: string;                    // Unique identifier (student_XXX format)
  firstName: string;             // Student's first name
  lastName: string;              // Student's last name
  fullName: string;              // Complete display name
  email: string;                 // University email address (unique)
  studentId: string;             // Official student ID (STU + 8 digits)
  major: string;                 // Academic major/program
  year: number;                  // Academic year (1-4)
  gpa: string;                   // Grade Point Average (2.50-4.00)
  enrollmentDate: Date;          // Date of enrollment
  status: 'active' | 'inactive' | 'suspended' | 'graduated';
  profilePicture: string;        // URL to profile image
  preferences: StudentPreferences;
  createdAt: Date;               // Account creation timestamp
  lastLoginAt: Date;             // Most recent login
}

interface StudentPreferences {
  notifications: boolean;        // Push notification settings
  emailUpdates: boolean;         // Email notification preference
  darkMode: boolean;             // UI theme preference
}
```

#### Sample Data
```json
{
  "id": "student_001",
  "firstName": "Alice",
  "lastName": "Johnson",
  "fullName": "Alice Johnson",
  "email": "alice.johnson1@university.edu",
  "studentId": "STU20240001",
  "major": "Computer Science",
  "year": 3,
  "gpa": "3.75",
  "enrollmentDate": "2024-09-15T00:00:00.000Z",
  "status": "active",
  "profilePicture": "https://ui-avatars.com/api/?name=Alice+Johnson&background=random&size=150",
  "preferences": {
    "notifications": true,
    "emailUpdates": true,
    "darkMode": false
  },
  "createdAt": "2024-09-29T10:30:00.000Z",
  "lastLoginAt": "2024-09-28T14:22:00.000Z"
}
```

#### Validation Rules
- `email`: Must be unique, valid university email format
- `studentId`: Must be unique, format: STU + 8 digits
- `gpa`: Decimal string between "2.00" and "4.00"
- `year`: Integer between 1 and 4
- `status`: Must be one of defined enum values
- `major`: Selected from predefined list of academic programs

---

### 2. Teachers Collection (`teachers`)

**Purpose**: Faculty profiles, department affiliations, and teaching credentials.

#### Schema Definition
```typescript
interface Teacher {
  id: string;                    // Unique identifier (teacher_XX format)
  firstName: string;             // Faculty first name
  lastName: string;              // Faculty last name
  fullName: string;              // Complete name with title
  title: string;                 // Academic title (Dr., Prof., Ms., Mr.)
  email: string;                 // Faculty email address (unique)
  employeeId: string;            // Official employee ID (EMP + 5 digits)
  department: string;            // Academic department
  specialization: string;        // Area of expertise
  officeHours: string;           // Office hours schedule
  yearsExperience: number;       // Teaching experience in years
  rating: string;                // Student rating (1.0-5.0)
  coursesTeaching: number;       // Number of current courses
  status: 'active' | 'inactive' | 'sabbatical';
  profilePicture: string;        // URL to profile image
  createdAt: Date;               // Account creation timestamp
}
```

#### Sample Data
```json
{
  "id": "teacher_01",
  "firstName": "Sarah",
  "lastName": "Johnson",
  "fullName": "Dr. Sarah Johnson",
  "title": "Dr.",
  "email": "sarah.johnson@university.edu",
  "employeeId": "EMP10001",
  "department": "Computer Science",
  "specialization": "Algorithms",
  "officeHours": "MW 2:00-4:00 PM",
  "yearsExperience": 12,
  "rating": "4.7",
  "coursesTeaching": 3,
  "status": "active",
  "profilePicture": "https://ui-avatars.com/api/?name=Sarah+Johnson&background=random&size=150",
  "createdAt": "2024-09-29T10:30:00.000Z"
}
```

#### Validation Rules
- `email`: Must be unique, valid faculty email format
- `employeeId`: Must be unique, format: EMP + 5 digits
- `yearsExperience`: Non-negative integer
- `rating`: Decimal string between "1.0" and "5.0"
- `coursesTeaching`: Non-negative integer
- `department`: Selected from predefined department list

---

### 3. Courses Collection (`courses`)

**Purpose**: Course catalog, scheduling, and enrollment management.

#### Schema Definition
```typescript
interface Course {
  id: string;                    // Unique identifier (course_XX format)
  courseCode: string;            // Official course code (e.g., CS101)
  courseName: string;            // Full course title
  credits: number;               // Credit hours (1-4)
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  teacherId: string;             // Reference to teacher
  teacherName: string;           // Teacher's display name
  department: string;            // Academic department
  semester: string;              // Current semester (e.g., "Fall 2024")
  maxStudents: number;           // Maximum enrollment capacity
  enrolledStudents: number;      // Current enrollment count
  schedule: CourseSchedule;      // Meeting times and location
  description: string;           // Course description
  prerequisites: string[];       // Required prerequisite courses
  status: 'active' | 'inactive' | 'archived';
  createdAt: Date;               // Course creation timestamp
}

interface CourseSchedule {
  days: string[];                // Meeting days (e.g., ["Monday", "Wednesday"])
  time: string;                  // Meeting time (e.g., "10:00-11:30 AM")
  room: string;                  // Classroom assignment
}
```

#### Sample Data
```json
{
  "id": "course_01",
  "courseCode": "CS101",
  "courseName": "Introduction to Programming",
  "credits": 3,
  "level": "Beginner",
  "teacherId": "teacher_01",
  "teacherName": "Dr. Sarah Johnson",
  "department": "Computer Science",
  "semester": "Fall 2024",
  "maxStudents": 35,
  "enrolledStudents": 28,
  "schedule": {
    "days": ["Monday", "Wednesday", "Friday"],
    "time": "10:00-11:30 AM",
    "room": "Room 142"
  },
  "description": "Comprehensive course covering introduction to programming concepts and practical applications.",
  "prerequisites": [],
  "status": "active",
  "createdAt": "2024-09-29T10:30:00.000Z"
}
```

#### Validation Rules
- `courseCode`: Must be unique, alphanumeric format
- `credits`: Integer between 1 and 4
- `maxStudents`: Positive integer, typically 15-50
- `enrolledStudents`: Non-negative integer ≤ maxStudents
- `teacherId`: Must reference existing teacher
- `prerequisites`: Array of valid course codes

---

### 4. Activities Collection (`activities`)

**Purpose**: Student engagement tracking, assignment submissions, and learning analytics.

#### Schema Definition
```typescript
interface Activity {
  id: string;                    // Unique identifier (activity_XXXX format)
  studentId: string;             // Reference to student
  studentName: string;           // Student's display name
  studentEmail: string;          // Student's email for matching (NEW)
  courseId: string;              // Reference to course
  courseName: string;            // Course display name
  teacherId: string;             // Reference to teacher
  activityType: ActivityType;    // Type of engagement activity
  category: ActivityCategory;    // NEW: Dashboard category (1 of 5)
  title: string;                 // Activity title/name
  description: string;           // Detailed description
  timestamp: Date;               // Activity occurrence time
  submissionTime: Date;          // Actual submission time
  score: number;                 // Points earned (0-10)
  maxScore: number;              // Maximum possible points
  quality: number;               // Quality assessment (0-100)
  duration: number;              // Time spent in minutes
  difficulty: number;            // Difficulty level (1.0-6.0)
  engagementLevel: number;       // Engagement metric (1.0-11.0)
  feedback: string;              // Instructor feedback
  status: 'completed' | 'pending' | 'late' | 'missed';
  createdAt: Date;               // Record creation timestamp
}

type ActivityType = 
  | 'assignment_submission'
  | 'quiz_completion'
  | 'discussion_participation'
  | 'lecture_attendance'
  | 'peer_collaboration'
  | 'resource_access'
  | 'question_asking'
  | 'project_upload'
  | 'code_review'
  | 'presentation';

type ActivityCategory = 
  | 'Assignment Uploads'      // assignment_submission, project_upload, code_review
  | 'Event Participation'     // presentation, lecture_attendance, question_asking
  | 'Class Participation'     // discussion_participation, peer_collaboration
  | 'Peer Collaboration'      // peer_collaboration, code_review, discussion_participation
  | 'Quiz Performance';       // quiz_completion, resource_access
```

#### Sample Data
```json
{
  "id": "activity_0001",
  "studentId": "student_001",
  "studentName": "Anoop Gupta",
  "studentEmail": "anupthegreat007@gmail.com",
  "courseId": "course_02",
  "courseName": "Data Structures & Algorithms",
  "teacherId": "teacher_01",
  "activityType": "assignment_submission",
  "category": "Assignment Uploads",
  "title": "Data Structures & Algorithms Assignment #3",
  "description": "Completed and submitted assignment with detailed solutions",
  "timestamp": "2024-09-25T14:30:00.000Z",
  "submissionTime": "2024-09-25T13:45:00.000Z",
  "score": 8,
  "maxScore": 10,
  "quality": 87,
  "duration": 95,
  "difficulty": 4.2,
  "engagementLevel": 8.5,
  "feedback": "Excellent work! Keep up the great effort.",
  "status": "completed",
  "createdAt": "2024-09-29T10:30:00.000Z"
}
```

#### Validation Rules
- `score`: Number between 0 and maxScore
- `maxScore`: Positive number, typically 10
- `quality`: Integer between 0 and 100
- `duration`: Positive integer (minutes)
- `difficulty`: Decimal between 1.0 and 6.0
- `engagementLevel`: Decimal between 1.0 and 11.0
- `activityType`: Must be one of predefined types
- `status`: Must be one of defined enum values

---

### 5. System Collection (`system`)

**Purpose**: System-wide statistics, analytics, and operational metrics.

#### Schema Definition
```typescript
interface SystemStats {
  totalStudents: number;         // Count of all students
  totalTeachers: number;         // Count of all teachers
  totalCourses: number;          // Count of all courses
  totalActivities: number;       // Count of all activities
  avgEngagement: string;         // Average engagement score
  activeUsers: number;           // Currently active users
  systemHealth: number;          // System health percentage (0-100)
  lastUpdated: Date;             // Last statistics update
  createdAt: Date;               // Initial creation timestamp
}
```

#### Sample Data
```json
{
  "totalStudents": 20,
  "totalTeachers": 5,
  "totalCourses": 8,
  "totalActivities": 350,
  "avgEngagement": "7.8",
  "activeUsers": 14,
  "systemHealth": 98,
  "lastUpdated": "2024-09-29T10:30:00.000Z",
  "createdAt": "2024-09-29T10:30:00.000Z"
}
```

---

## Activity Categorization System (New)

### Purpose
The Activity Categorization System organizes all student activities into 5 key performance areas for comprehensive tracking in the Student Dashboard.

### Category Mappings
| Category | Activity Types | Description | Dashboard Color |
|----------|----------------|-------------|-----------------|
| **Assignment Uploads** | `assignment_submission`, `project_upload`, `code_review` | Academic submissions and code reviews | Blue gradient |
| **Event Participation** | `presentation`, `lecture_attendance`, `question_asking` | Active participation in events and lectures | Green gradient |
| **Class Participation** | `discussion_participation`, `peer_collaboration` | Engagement in class discussions and group work | Purple gradient |
| **Peer Collaboration** | `peer_collaboration`, `code_review`, `discussion_participation` | Collaboration-focused activities with classmates | Orange gradient |
| **Quiz Performance** | `quiz_completion`, `resource_access` | Assessment performance and resource utilization | Pink gradient |

### Implementation Details
- **Dynamic Mapping**: Activity types automatically map to categories in the dashboard
- **Cross-Category Activities**: Some activity types (like `peer_collaboration`) appear in multiple categories
- **Prioritized User**: `anupthegreat007@gmail.com` has enhanced data across all 5 categories
- **Real-time Updates**: Dashboard updates immediately when new activities are added

### Query Examples
```javascript
// Get all Assignment Upload activities for specific student
db.activities.find({ 
  studentEmail: "anupthegreat007@gmail.com",
  category: "Assignment Uploads" 
});

// Count activities by category for dashboard
db.activities.aggregate([
  { $match: { studentEmail: "anupthegreat007@gmail.com" }},
  { $group: { _id: "$category", count: { $sum: 1 }}}
]);

// Get engagement trends by category
db.activities.aggregate([
  { $match: { studentEmail: "anupthegreat007@gmail.com" }},
  { $group: { 
    _id: "$category",
    avgEngagement: { $avg: "$engagementLevel" },
    avgScore: { $avg: "$score" }
  }}
]);
```

---

## Data Relationships

### Primary Relationships
```
Students (1) ←→ (N) Activities
Teachers (1) ←→ (N) Courses
Teachers (1) ←→ (N) Activities (via Courses)
Courses (1) ←→ (N) Activities
Students (N) ←→ (N) Courses (enrollment, via Activities)
```

### Reference Integrity
- `activities.studentId` → `students.id`
- `activities.courseId` → `courses.id`
- `activities.teacherId` → `teachers.id`
- `courses.teacherId` → `teachers.id`

---

## Indexing Strategy

### Performance Indexes
```javascript
// Students Collection
db.students.createIndex({ "email": 1 }, { unique: true });
db.students.createIndex({ "studentId": 1 }, { unique: true });
db.students.createIndex({ "status": 1 });
db.students.createIndex({ "major": 1 });

// Teachers Collection
db.teachers.createIndex({ "email": 1 }, { unique: true });
db.teachers.createIndex({ "employeeId": 1 }, { unique: true });
db.teachers.createIndex({ "department": 1 });

// Courses Collection
db.courses.createIndex({ "courseCode": 1 }, { unique: true });
db.courses.createIndex({ "teacherId": 1 });
db.courses.createIndex({ "department": 1 });

// Activities Collection (Most Important)
db.activities.createIndex({ "studentId": 1 });
db.activities.createIndex({ "studentEmail": 1 });        // NEW: Email-based queries
db.activities.createIndex({ "courseId": 1 });
db.activities.createIndex({ "timestamp": -1 });
db.activities.createIndex({ "activityType": 1 });
db.activities.createIndex({ "category": 1 });            // NEW: Category-based queries
db.activities.createIndex({ "engagementLevel": -1 });
db.activities.createIndex({ "studentId": 1, "timestamp": -1 });
db.activities.createIndex({ "studentEmail": 1, "category": 1 }); // NEW: Dashboard queries
db.activities.createIndex({ "studentEmail": 1, "timestamp": -1 }); // NEW: Timeline queries
```

---

## Analytics Queries

### Common Query Patterns

#### Student Performance Analytics
```javascript
// Get student's recent activities by email (NEW)
db.activities.find({ 
  studentEmail: "anupthegreat007@gmail.com" 
}).sort({ timestamp: -1 }).limit(20);

// Calculate performance by category for specific student (NEW)
db.activities.aggregate([
  { $match: { studentEmail: "anupthegreat007@gmail.com" }},
  { $group: { 
    _id: "$category",
    avgEngagement: { $avg: "$engagementLevel" },
    avgScore: { $avg: "$score" },
    totalActivities: { $sum: 1 }
  }}
]);

// Calculate average engagement by student
db.activities.aggregate([
  { $group: { 
    _id: "$studentId", 
    avgEngagement: { $avg: "$engagementLevel" },
    totalActivities: { $sum: 1 }
  }}
]);

// Dashboard summary for specific student (NEW)
db.activities.aggregate([
  { $match: { studentEmail: "anupthegreat007@gmail.com" }},
  { $group: {
    _id: null,
    totalActivities: { $sum: 1 },
    avgEngagement: { $avg: "$engagementLevel" },
    avgScore: { $avg: "$score" },
    categories: { $addToSet: "$category" }
  }}
]);
```

#### Course Analytics
```javascript
// Course performance metrics
db.activities.aggregate([
  { $group: { 
    _id: "$courseId",
    avgScore: { $avg: "$score" },
    completionRate: { 
      $avg: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
    }
  }}
]);
```

#### Engagement Trend Analysis
```javascript
// Daily engagement trends
db.activities.aggregate([
  { $group: {
    _id: { 
      $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
    },
    avgEngagement: { $avg: "$engagementLevel" },
    activityCount: { $sum: 1 }
  }},
  { $sort: { "_id": 1 }}
]);
```

#### Risk Assessment Queries
```javascript
// Identify at-risk students (low engagement)
db.activities.aggregate([
  { $group: { 
    _id: "$studentId",
    avgEngagement: { $avg: "$engagementLevel" },
    recentActivities: { $sum: 1 }
  }},
  { $match: { 
    $or: [
      { avgEngagement: { $lt: 5.0 }},
      { recentActivities: { $lt: 5 }}
    ]
  }}
]);
```

---

## Data Generation Parameters

### Volume Statistics
- **Students**: 20 records
- **Teachers**: 5 records  
- **Courses**: 8 records
- **Activities**: 350+ records (15-20 per student average)
- **Time Range**: Last 60 days of activity data

### Data Distribution
- **Activity Types**: 10 different types with realistic distribution
- **Engagement Levels**: Normal distribution around 7.0 (scale 1-11)
- **Quality Scores**: Normal distribution around 80 (scale 0-100)
- **Academic Performance**: Realistic GPA distribution (2.5-4.0)
- **Course Enrollment**: 15-45 students per course

### Realistic Patterns
- **Peak Activity Hours**: 10 AM - 4 PM weekdays
- **Engagement Correlation**: Higher difficulty → variable engagement
- **Seasonal Patterns**: Increased activity during midterms/finals
- **Student Behavior**: Consistent individual engagement patterns

---

## Firebase Security Rules

### Recommended Security Configuration
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Students can read their own data
    match /students/{studentId} {
      allow read, write: if request.auth != null && 
                        request.auth.uid == studentId;
    }
    
    // Teachers can read their courses and students
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                   get(/databases/$(database)/documents/teachers/$(request.auth.uid)).data.status == 'active';
    }
    
    // Activities readable by student/teacher involved
    match /activities/{activityId} {
      allow read: if request.auth != null && (
        resource.data.studentId == request.auth.uid ||
        resource.data.teacherId == request.auth.uid
      );
    }
    
    // System stats readable by authenticated users
    match /system/{document} {
      allow read: if request.auth != null;
    }
  }
}
```

---

## Migration and Maintenance

### Data Backup Strategy
1. **Daily Backups**: Automated Firebase exports
2. **Incremental Backups**: Activity data every 6 hours
3. **Archive Policy**: Activities older than 2 years moved to cold storage
4. **Recovery Testing**: Monthly restore verification

### Performance Monitoring
1. **Query Performance**: Monitor slow queries (>1s)
2. **Index Usage**: Verify index efficiency monthly
3. **Storage Growth**: Track document size and count trends
4. **Connection Limits**: Monitor concurrent user limits

### Data Validation
1. **Referential Integrity**: Weekly validation of foreign keys
2. **Data Quality**: Monthly reports on data completeness
3. **Anomaly Detection**: Real-time monitoring of unusual patterns
4. **Consistency Checks**: Cross-collection data validation

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2024-09-29 | Initial schema design and implementation | System |
| | | Added comprehensive analytics support | |
| | | Implemented DSA algorithm integration | |

---

*This documentation is automatically maintained and updated with schema changes.*