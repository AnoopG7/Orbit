# Firebase Role-Based Authentication Setup Guide

This guide provides step-by-step instructions for setting up and verifying the role-based authentication system in Firebase for the Orbit project.

## 📋 Table of Contents

1. [Firebase Console Setup](#firebase-console-setup)
2. [Firestore Database Configuration](#firestore-database-configuration)
3. [Authentication Setup](#authentication-setup)
4. [Testing Role-Based Login](#testing-role-based-login)
5. [User Management](#user-management)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Firebase Console Setup

### Step 1: Access Your Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Navigate to your `orbit-65e7a` project
3. Click on your project name to enter the dashboard

### Step 2: Verify Project Configuration

1. In the project dashboard, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Verify your web app configuration matches the config in `firebase/app.js`

---

## 🗄️ Firestore Database Configuration

### Step 1: Enable Firestore Database

1. In the Firebase console, click on "Firestore Database" in the left sidebar
2. If not already created, click "Create database"
3. Choose "Start in test mode" for initial setup (we'll secure it later)
4. Select your preferred location (close to your users)

### Step 2: Create Required Collections

#### Users Collection Structure
```
📁 users (collection)
  📄 {userId} (document - automatically generated user UID)
    ├── email: "user@example.com"
    ├── displayName: "John Doe"
    ├── role: "student" | "teacher" | "admin"
    ├── createdAt: timestamp
    ├── updatedAt: timestamp
    ├── emailVerified: boolean
    └── lastLoginAt: timestamp
```

### Step 3: Set Firestore Security Rules

1. In Firestore Database, click on "Rules" tab
2. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection rules
    match /users/{userId} {
      // Allow users to read/write their own document
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow creation of new user document during signup (when document doesn't exist)
      allow create: if request.auth != null && 
        request.auth.uid == userId &&
        request.resource.data.keys().hasAll(['email', 'role', 'createdAt']) &&
        request.resource.data.role in ['student', 'teacher', 'admin'];
      
      // Allow admins to read all user documents
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Only allow admins to change user roles (but not during initial creation)
      allow update: if request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' &&
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['role', 'updatedAt']);
    }
    
    // Deny all other reads/writes
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click "Publish" to save the rules

---

## 🔐 Authentication Setup

### Step 1: Enable Authentication Methods

1. Click on "Authentication" in the left sidebar
2. Go to the "Sign-in method" tab
3. Enable the following sign-in providers:

#### Email/Password
1. Click on "Email/Password"
2. Enable both "Email/Password" and "Email link (passwordless sign-in)"
3. Click "Save"

#### Google Sign-In
1. Click on "Google"
2. Enable Google sign-in
3. Add your support email
4. Click "Save"

### Step 2: Configure Authorized Domains

1. In the "Sign-in method" tab, scroll down to "Authorized domains"
2. Make sure the following domains are added:
   - `localhost` (for local development)
   - Your production domain (when deployed)

---

## 🧪 Testing Role-Based Login

### Step 1: Create Test Users

1. **Method 1: Through the Application**
   - Navigate to your login page (`/pages/login.html`)
   - Click "Sign up here" to create a new account
   - Fill in the form and select a role (Student/Teacher/Admin)
   - Complete the signup process

2. **Method 2: Through Firebase Console**
   - Go to Authentication > Users
   - Click "Add user"
   - Enter email and password
   - After creating, manually add user document in Firestore

### Step 2: Manually Create User Documents in Firestore

For users created through Firebase Console:

1. Go to Firestore Database
2. Click "Start collection" and name it `users`
3. Create a document with the user's UID as the document ID
4. Add the following fields:
   ```
   email: user@example.com
   displayName: John Doe
   role: student (or teacher/admin)
   createdAt: timestamp (current time)
   emailVerified: true
   ```

### Step 3: Test Role-Based Access

#### Test Student Access:
```bash
Email: student@test.com
Password: student123
Role: Student
Expected: Should redirect to /pages/student-dashboard.html
```

#### Test Teacher Access:
```bash
Email: teacher@test.com
Password: teacher123
Role: Teacher
Expected: Should redirect to /pages/teacher-dashboard.html
```

#### Test Admin Access:
```bash
Email: admin@test.com
Password: admin123
Role: Admin
Expected: Should redirect to /pages/admin-dashboard.html
```

### Step 4: Verify Role Validation

1. **Test Role Mismatch:**
   - Create a user with role "student" in Firestore
   - Try to login selecting "teacher" role
   - Expected: Should show error "Access denied: Your account role is 'student', not 'teacher'"

2. **Test Dashboard Access:**
   - Login as student
   - Try to manually navigate to `/pages/teacher-dashboard.html`
   - Expected: Should be redirected back to student dashboard

---

## 👥 User Management

### Adding Users Programmatically

```javascript
// Create a new user with role
async function createUserWithRole(email, password, displayName, role) {
    try {
        // Create auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Set user profile
        await updateProfile(userCredential.user, { displayName });
        
        // Set role in Firestore
        await AuthUtils.setUserRole(userCredential.user, role);
        
        console.log('User created successfully with role:', role);
    } catch (error) {
        console.error('Error creating user:', error);
    }
}

// Usage examples:
// createUserWithRole('student@test.com', 'password123', 'Test Student', 'student');
// createUserWithRole('teacher@test.com', 'password123', 'Test Teacher', 'teacher');
// createUserWithRole('admin@test.com', 'password123', 'Test Admin', 'admin');
```

### Changing User Roles

```javascript
// Change user role (admin only)
async function changeUserRole(userId, newRole) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            role: newRole,
            updatedAt: serverTimestamp()
        });
        console.log('User role updated to:', newRole);
    } catch (error) {
        console.error('Error updating user role:', error);
    }
}
```

---

## 🔍 Verification Checklist

### ✅ Database Setup
- [ ] Firestore database is created and accessible
- [ ] `users` collection exists
- [ ] Security rules are properly configured
- [ ] Test user documents have all required fields

### ✅ Authentication Setup
- [ ] Email/Password sign-in is enabled
- [ ] Google sign-in is enabled (optional)
- [ ] Authorized domains include your app's domain
- [ ] Test users can be created successfully

### ✅ Role-Based Access
- [ ] Users are assigned correct roles during signup
- [ ] Login validates user role matches selected role
- [ ] Dashboard redirects work for all role types
- [ ] Unauthorized access is properly blocked
- [ ] Role mismatch shows appropriate error messages

### ✅ Application Functions
- [ ] `AuthUtils.getUserRole()` returns correct role
- [ ] `AuthUtils.setUserRole()` saves role to Firestore
- [ ] `AuthUtils.redirectToDashboard()` routes correctly
- [ ] `AuthUtils.requireAuth()` validates permissions

---

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. "Permission denied" errors
**Issue:** Firestore security rules are blocking access
**Solution:** 
- Check if security rules are properly configured
- Ensure user document exists in Firestore
- Verify user is authenticated before accessing Firestore

#### 2. Role not found or undefined
**Issue:** User document missing role field
**Solution:**
```javascript
// Fix missing role for existing users
async function fixUserRole(userId, role = 'student') {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        role: role,
        updatedAt: serverTimestamp()
    });
}
```

#### 3. Google Sign-in shows wrong role
**Issue:** Google users get default 'student' role
**Solution:** Create admin interface to change roles or modify the Google auth handler

#### 4. Dashboard redirects not working
**Issue:** Route protection not working properly
**Solution:**
- Check if `AuthUtils.requireAuth()` is called on page load
- Verify role hierarchy permissions are correctly set
- Ensure user role is properly retrieved from Firestore

### Debug Commands

```javascript
// Check current user and role
console.log('Current user:', window.authManager.getCurrentUser());
AuthUtils.getUserRole(window.authManager.getCurrentUser()).then(role => {
    console.log('User role:', role);
});

// Check if user has access to specific role
AuthUtils.hasRoleAccess('admin', 'teacher').then(hasAccess => {
    console.log('Admin can access teacher features:', hasAccess);
});

// Test dashboard routing
AuthUtils.redirectToDashboard(window.authManager.getCurrentUser(), 'admin');
```

---

## 📞 Support

If you encounter issues:

1. **Check Browser Console:** Look for JavaScript errors
2. **Check Firebase Console:** Verify authentication and database logs
3. **Test with Different Browsers:** Rule out browser-specific issues
4. **Review Security Rules:** Ensure they match your application needs

---

## 🎯 Quick Start Commands

```bash
# Create test users (run in browser console)
await createUserWithRole('admin@orbit.com', 'admin123', 'Admin User', 'admin');
await createUserWithRole('teacher@orbit.com', 'teacher123', 'Teacher User', 'teacher');
await createUserWithRole('student@orbit.com', 'student123', 'Student User', 'student');
```

Your Firebase role-based authentication system is now ready! Users can sign up, select their roles, and access appropriate dashboards based on their permissions.