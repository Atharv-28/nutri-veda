# Firebase Setup Instructions for NutriVeda

## Prerequisites
- A Google account
- Node.js and npm installed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `NutriVeda` (or your preferred name)
4. Accept terms and click "Continue"
5. Disable Google Analytics (optional) or configure it
6. Click "Create project"

## Step 2: Register Your App

1. In the Firebase Console, click on the Web icon (</>) to add a web app
2. Register app with nickname: "NutriVeda App"
3. Don't check "Also set up Firebase Hosting" (unless you want hosting)
4. Click "Register app"

## Step 3: Get Firebase Configuration

After registering, Firebase will show you a configuration object that looks like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "nutriveda-xxxxx.firebaseapp.com",
  projectId: "nutriveda-xxxxx",
  storageBucket: "nutriveda-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};
```

## Step 4: Update Firebase Configuration in Your App

1. Open the file: `src/config/firebaseConfig.js`
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_AUTH_DOMAIN",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_STORAGE_BUCKET",
  messagingSenderId: "YOUR_ACTUAL_MESSAGING_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

## Step 5: Enable Authentication

1. In Firebase Console, go to "Authentication" from the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Click on "Email/Password"
5. Enable the first toggle (Email/Password)
6. Click "Save"

## Step 6: Set Up Firestore Database

1. In Firebase Console, go to "Firestore Database" from the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
   - **Note**: For production, you'll need to set up proper security rules
4. Select a location closest to your users
5. Click "Enable"

## Step 7: Configure Firestore Security Rules (Important!)

For development, you can use test mode rules, but for production, update the rules:

1. Go to Firestore Database > Rules
2. Replace with these basic rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Doctors collection - only authenticated users can read, only owner can write
    match /doctors/{doctorId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == doctorId;
    }
    
    // Patients collection - only authenticated users can read, only owner can write
    match /patients/{patientId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == patientId;
    }
  }
}
```

3. Click "Publish"

## Step 8: Test Your Setup

1. Start your Expo app:
   ```bash
   npm start
   ```

2. Try creating a new account (Doctor or Patient)
3. Try logging in with the created account
4. Verify in Firebase Console:
   - Authentication > Users (you should see the created user)
   - Firestore Database > Data (you should see collections: doctors or patients)

## Troubleshooting

### Error: "Firebase config not found"
- Make sure you've updated `src/config/firebaseConfig.js` with your actual Firebase credentials

### Error: "Auth operation failed"
- Check that Email/Password authentication is enabled in Firebase Console
- Verify your internet connection

### Error: "Missing or insufficient permissions"
- Check Firestore security rules
- Make sure you're in test mode or have proper rules configured

### Error: "Network request failed"
- Check your internet connection
- Verify Firebase config values are correct
- Make sure your Firebase project is active

## Important Notes

⚠️ **Security Reminders:**
1. Never commit your `firebaseConfig.js` with real credentials to public repositories
2. Use environment variables for production apps
3. Update Firestore security rules before going to production
4. Enable App Check for additional security

## Next Steps

After successful setup:
- Test user registration and login flows
- Verify data is being saved to Firestore
- Test the Select Doctor feature
- Test the Prakruti Assessment flow
- Implement additional features like password reset

## Additional Features to Implement

You can enhance the authentication system with:
- Email verification
- Password reset functionality
- Social login (Google, Facebook, etc.)
- Profile photo upload to Firebase Storage
- Real-time data synchronization
- Offline support with Firestore

---

For more information, visit the [Firebase Documentation](https://firebase.google.com/docs)
