// Firebase Data Population Script
// This script populates Firebase with realistic student engagement data

import { db, auth } from '../firebase/firebase-config.js';
import { collection, addDoc, doc, setDoc, serverTimestamp, Timestamp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';

class FirebaseDataPopulator {
    constructor() {
        this.students = [];
        this.teachers = [];
        this.courses = [];
        this.activities = [];
    }

    // Generate realistic student data
    generateStudents() {
        const firstNames = [
            'Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 
            'Iris', 'Jack', 'Kate', 'Liam', 'Maya', 'Noah', 'Olivia', 'Paul',
            'Quinn', 'Rachel', 'Sam', 'Tessa', 'Uma', 'Victor', 'Wendy', 'Xander', 'Yara', 'Zoe'
        ];
        
        const lastNames = [
            'Anderson', 'Brown', 'Chen', 'Davis', 'Evans', 'Fisher', 'Garcia', 
            'Harris', 'Johnson', 'Kim', 'Lee', 'Miller', 'Nelson', 'O\'Connor',
            'Parker', 'Quinn', 'Rodriguez', 'Smith', 'Taylor', 'Wilson'
        ];

        const majors = [
            'Computer Science', 'Data Science', 'Software Engineering', 
            'Information Technology', 'Cybersecurity', 'Artificial Intelligence'
        ];

        for (let i = 1; i <= 20; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const major = majors[Math.floor(Math.random() * majors.length)];
            
            const student = {
                id: `student_${i.toString().padStart(3, '0')}`,
                firstName: firstName,
                lastName: lastName,
                fullName: `${firstName} ${lastName}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@university.edu`,
                studentId: `STU${(20240000 + i).toString()}`,
                major: major,
                year: Math.floor(Math.random() * 4) + 1, // 1-4
                gpa: (Math.random() * 2 + 2.5).toFixed(2), // 2.5-4.5
                enrollmentDate: new Date(2024, 8, Math.floor(Math.random() * 30) + 1), // September 2024
                status: 'active',
                profilePicture: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&size=150`,
                preferences: {
                    notifications: true,
                    emailUpdates: Math.random() > 0.3,
                    darkMode: Math.random() > 0.5
                },
                createdAt: serverTimestamp(),
                lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Last 7 days
            };
            
            this.students.push(student);
        }
        
        console.log(`Generated ${this.students.length} students`);
    }

    // Generate teacher data
    generateTeachers() {
        const teacherData = [
            { name: 'Dr. Sarah Johnson', department: 'Computer Science', specialization: 'Algorithms' },
            { name: 'Prof. Michael Chen', department: 'Data Science', specialization: 'Machine Learning' },
            { name: 'Dr. Lisa Rodriguez', department: 'Software Engineering', specialization: 'Web Development' },
            { name: 'Prof. David Kim', department: 'Information Technology', specialization: 'Database Systems' },
            { name: 'Dr. Emma Wilson', department: 'Cybersecurity', specialization: 'Network Security' }
        ];

        teacherData.forEach((teacher, index) => {
            const [title, ...nameParts] = teacher.name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');
            
            const teacherObj = {
                id: `teacher_${(index + 1).toString().padStart(2, '0')}`,
                firstName: firstName,
                lastName: lastName,
                fullName: teacher.name,
                title: title,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(' ', '')}@university.edu`,
                employeeId: `EMP${(10000 + index + 1).toString()}`,
                department: teacher.department,
                specialization: teacher.specialization,
                officeHours: 'MW 2:00-4:00 PM',
                yearsExperience: Math.floor(Math.random() * 15) + 5,
                rating: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5-5.0
                coursesTeaching: Math.floor(Math.random() * 3) + 2, // 2-4 courses
                status: 'active',
                profilePicture: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&size=150`,
                createdAt: serverTimestamp()
            };
            
            this.teachers.push(teacherObj);
        });
        
        console.log(`Generated ${this.teachers.length} teachers`);
    }

    // Generate course data
    generateCourses() {
        const courseData = [
            { code: 'CS101', name: 'Introduction to Programming', credits: 3, level: 'Beginner' },
            { code: 'CS201', name: 'Data Structures & Algorithms', credits: 4, level: 'Intermediate' },
            { code: 'CS301', name: 'Database Systems', credits: 3, level: 'Advanced' },
            { code: 'CS401', name: 'Machine Learning', credits: 4, level: 'Advanced' },
            { code: 'CS151', name: 'Web Development', credits: 3, level: 'Beginner' },
            { code: 'CS251', name: 'Computer Networks', credits: 3, level: 'Intermediate' },
            { code: 'CS351', name: 'Cybersecurity', credits: 4, level: 'Advanced' },
            { code: 'CS181', name: 'Mobile App Development', credits: 3, level: 'Intermediate' }
        ];

        courseData.forEach((course, index) => {
            const teacher = this.teachers[index % this.teachers.length];
            
            const courseObj = {
                id: `course_${(index + 1).toString().padStart(2, '0')}`,
                courseCode: course.code,
                courseName: course.name,
                credits: course.credits,
                level: course.level,
                teacherId: teacher.id,
                teacherName: teacher.fullName,
                department: teacher.department,
                semester: 'Fall 2024',
                maxStudents: Math.floor(Math.random() * 20) + 25, // 25-45
                enrolledStudents: Math.floor(Math.random() * 15) + 15, // 15-30
                schedule: {
                    days: ['Monday', 'Wednesday', 'Friday'],
                    time: '10:00-11:30 AM',
                    room: `Room ${Math.floor(Math.random() * 100) + 100}`
                },
                description: `Comprehensive course covering ${course.name.toLowerCase()} concepts and practical applications.`,
                prerequisites: index > 0 ? [courseData[index - 1].code] : [],
                status: 'active',
                createdAt: serverTimestamp()
            };
            
            this.courses.push(courseObj);
        });
        
        console.log(`Generated ${this.courses.length} courses`);
    }

    // Generate student activity data
    generateActivities() {
        const activityTypes = [
            'assignment_submission', 'quiz_completion', 'discussion_participation',
            'lecture_attendance', 'peer_collaboration', 'resource_access',
            'question_asking', 'project_upload', 'code_review', 'presentation'
        ];

        // Generate 300+ activities (15+ per student on average)
        for (let i = 0; i < 350; i++) {
            const student = this.students[Math.floor(Math.random() * this.students.length)];
            const course = this.courses[Math.floor(Math.random() * this.courses.length)];
            const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
            
            const activity = {
                id: `activity_${(i + 1).toString().padStart(4, '0')}`,
                studentId: student.id,
                studentName: student.fullName,
                courseId: course.id,
                courseName: course.courseName,
                teacherId: course.teacherId,
                activityType: activityType,
                title: this.generateActivityTitle(activityType, course.courseName),
                description: this.generateActivityDescription(activityType),
                timestamp: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Last 60 days
                submissionTime: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000), // Last 45 days
                score: Math.floor(Math.random() * 8) + 3, // 3-10
                maxScore: 10,
                quality: Math.floor(Math.random() * 40) + 60, // 60-100
                duration: Math.floor(Math.random() * 120) + 10, // 10-130 minutes
                difficulty: Math.random() * 5 + 1, // 1-6
                engagementLevel: Math.random() * 10 + 1, // 1-11
                feedback: this.generateFeedback(),
                status: Math.random() > 0.1 ? 'completed' : 'pending', // 90% completed
                createdAt: serverTimestamp()
            };
            
            this.activities.push(activity);
        }
        
        console.log(`Generated ${this.activities.length} activities`);
    }

    generateActivityTitle(type, courseName) {
        const titles = {
            'assignment_submission': `${courseName} Assignment #${Math.floor(Math.random() * 5) + 1}`,
            'quiz_completion': `${courseName} Quiz - Chapter ${Math.floor(Math.random() * 10) + 1}`,
            'discussion_participation': `Discussion Forum - ${courseName}`,
            'lecture_attendance': `Lecture ${Math.floor(Math.random() * 15) + 1} - ${courseName}`,
            'peer_collaboration': `Group Project - ${courseName}`,
            'resource_access': `Study Materials - ${courseName}`,
            'question_asking': `Q&A Session - ${courseName}`,
            'project_upload': `Final Project - ${courseName}`,
            'code_review': `Code Review Session - ${courseName}`,
            'presentation': `Student Presentation - ${courseName}`
        };
        
        return titles[type] || `${courseName} Activity`;
    }

    generateActivityDescription(type) {
        const descriptions = {
            'assignment_submission': 'Completed and submitted assignment with detailed solutions',
            'quiz_completion': 'Successfully completed online quiz with multiple choice and short answers',
            'discussion_participation': 'Actively participated in course discussion forum with meaningful contributions',
            'lecture_attendance': 'Attended live lecture session and took comprehensive notes',
            'peer_collaboration': 'Collaborated with classmates on group project and shared resources',
            'resource_access': 'Accessed and studied course materials including videos and documents',
            'question_asking': 'Asked thoughtful questions during office hours or class sessions',
            'project_upload': 'Uploaded completed project with documentation and source code',
            'code_review': 'Participated in peer code review session with constructive feedback',
            'presentation': 'Delivered presentation to class on assigned topic'
        };
        
        return descriptions[type] || 'Completed course activity';
    }

    generateFeedback() {
        const feedbacks = [
            'Excellent work! Keep up the great effort.',
            'Good job! Consider reviewing the concepts again.',
            'Well done! Your understanding is improving.',
            'Great participation! Very engaged in discussions.',
            'Outstanding submission! Exceeded expectations.',
            'Good effort! Room for improvement in some areas.',
            'Impressive work! Shows deep understanding.',
            'Nice work! Continue practicing these concepts.',
            'Excellent collaboration with peers!',
            'Well-structured and thoughtful response.'
        ];
        
        return feedbacks[Math.floor(Math.random() * feedbacks.length)];
    }

    // Ensure user is authenticated before populating
    async ensureAuthenticated() {
        return new Promise(async (resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Authentication timeout'));
            }, 10000);

            onAuthStateChanged(auth, async (user) => {
                clearTimeout(timeout);
                
                if (user) {
                    console.log('✅ User already authenticated:', user.uid);
                    resolve(user);
                } else {
                    console.log('🔐 No user found, signing in anonymously...');
                    try {
                        const userCredential = await signInAnonymously(auth);
                        console.log('✅ Anonymous sign-in successful:', userCredential.user.uid);
                        resolve(userCredential.user);
                    } catch (error) {
                        console.error('❌ Authentication failed:', error);
                        reject(error);
                    }
                }
            });
        });
    }

    // Insert all data into Firebase
    async populateFirebase() {
        try {
            console.log('🔄 Starting Firebase data population...');
            
            // First ensure we're authenticated
            console.log('🔐 Checking authentication...');
            await this.ensureAuthenticated();
            
            // Insert students
            console.log('📚 Inserting students...');
            for (const student of this.students) {
                await setDoc(doc(db, 'students', student.id), student);
            }
            
            // Insert teachers
            console.log('👨‍🏫 Inserting teachers...');
            for (const teacher of this.teachers) {
                await setDoc(doc(db, 'teachers', teacher.id), teacher);
            }
            
            // Insert courses
            console.log('📖 Inserting courses...');
            for (const course of this.courses) {
                await setDoc(doc(db, 'courses', course.id), course);
            }
            
            // Insert activities
            console.log('📊 Inserting activities...');
            for (const activity of this.activities) {
                await setDoc(doc(db, 'activities', activity.id), activity);
            }
            
            // Create system stats document
            console.log('⚙️ Creating system statistics...');
            const systemStats = {
                totalStudents: this.students.length,
                totalTeachers: this.teachers.length,
                totalCourses: this.courses.length,
                totalActivities: this.activities.length,
                avgEngagement: this.calculateAverageEngagement(),
                activeUsers: Math.floor(this.students.length * 0.7), // 70% active
                systemHealth: 98,
                lastUpdated: serverTimestamp(),
                createdAt: serverTimestamp()
            };
            
            await setDoc(doc(db, 'system', 'stats'), systemStats);
            
            console.log('✅ Firebase data population completed successfully!');
            console.log(`📊 Summary:`);
            console.log(`   - Students: ${this.students.length}`);
            console.log(`   - Teachers: ${this.teachers.length}`);
            console.log(`   - Courses: ${this.courses.length}`);
            console.log(`   - Activities: ${this.activities.length}`);
            
            return {
                success: true,
                data: {
                    students: this.students.length,
                    teachers: this.teachers.length,
                    courses: this.courses.length,
                    activities: this.activities.length
                }
            };
            
        } catch (error) {
            console.error('❌ Error populating Firebase:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    calculateAverageEngagement() {
        if (this.activities.length === 0) return 0;
        
        const totalEngagement = this.activities.reduce((sum, activity) => {
            return sum + (activity.engagementLevel || 0);
        }, 0);
        
        return (totalEngagement / this.activities.length).toFixed(1);
    }

    // Generate all data and populate Firebase
    async generateAndPopulate() {
        console.log('🚀 Starting data generation process...');
        
        this.generateStudents();
        this.generateTeachers();
        this.generateCourses();
        this.generateActivities();
        
        console.log('📊 Data generation completed. Starting Firebase population...');
        
        return await this.populateFirebase();
    }
}

// Export for use in other scripts
window.FirebaseDataPopulator = FirebaseDataPopulator;

// Function to run the population process
window.populateFirebaseData = async function() {
    const populator = new FirebaseDataPopulator();
    return await populator.generateAndPopulate();
};

// Auto-run if this script is loaded directly
if (typeof window !== 'undefined' && window.location.pathname.includes('populate-data')) {
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('🔄 Auto-running Firebase data population...');
        await window.populateFirebaseData();
    });
}

console.log('📦 Firebase Data Populator loaded and ready!');