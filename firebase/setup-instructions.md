# Firebase Setup Instructions

## Current Issue
The Firebase data population is failing due to authentication/permission issues. Here's how to fix it:

## 1. Enable Anonymous Authentication
In the Firebase Console:
1. Go to Authentication > Sign-in method
2. Enable "Anonymous" authentication
3. Save changes

## 2. Update Firestore Security Rules
In the Firebase Console:
1. Go to Firestore Database > Rules
2. Replace the current rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access for development
    // TODO: Implement proper security rules for production
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click "Publish"

## 3. Alternative: Use the Rules File
Deploy the firestore.rules file created in this project:
```bash
firebase deploy --only firestore:rules
```

## 4. Test the Population
After making these changes:
1. Refresh the populate-data.html page
2. Click "Start Data Population" again
3. The authentication should work and data should populate successfully

## Security Note
The current rules allow all read/write access for development purposes. 
For production, implement proper authentication-based rules.