# Troubleshooting Firestore Connection Issues

## Current Issue
You're seeing WebChannel/Listen stream errors which means Firestore can't establish a connection. This is usually due to:

1. **Firestore Security Rules blocking access**
2. **Firestore Database not created yet**
3. **Network/CORS issues**

## Quick Fix: Check Your Firebase Console

### Step 1: Verify Firestore is Created
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `nutri-veda-6553f`
3. Go to **Firestore Database** in the left sidebar
4. If you see "Get started", click it to create the database
5. Choose **"Start in test mode"** for development
6. Select your preferred region
7. Click **"Enable"**

### Step 2: Update Security Rules
Once Firestore is created:

1. Go to **Firestore Database** → **Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // For testing - allows all reads/writes for 30 days
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 11, 24);
    }
  }
}
```

3. Click **"Publish"**

**Note**: This is for testing only. Before production, use proper security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own document
    match /patients/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /doctors/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 3: Verify Authentication is Enabled
1. Go to **Authentication** in Firebase Console
2. Click **"Get started"** if needed
3. Go to **"Sign-in method"** tab
4. Make sure **"Email/Password"** is **Enabled**

### Step 4: Clear Cache and Restart
After making these changes:

```bash
# Clear Metro bundler cache
npx expo start -c

# Or if that doesn't work, delete cache manually
rm -rf node_modules/.cache
npx expo start
```

## Testing Steps

1. **Create a new patient account**
   - Watch the console for logs
   - Look for "✅ User data saved to Firestore" message

2. **Check Firebase Console**
   - Go to **Authentication** → Should see the new user
   - Go to **Firestore Database** → Should see `patients` collection with user data

3. **Try logging in**
   - Should successfully authenticate and fetch user data

## Alternative: Disable Firestore Temporarily

If you want to test without Firestore, you can modify the app to use only Firebase Auth + AsyncStorage:

1. The auth will work (accounts created in Firebase Auth)
2. User data will be stored locally only (AsyncStorage)
3. No Firestore errors

This is already implemented as a fallback in the current code - if Firestore fails, it will still work with local storage.

## Common Errors and Solutions

### Error: "Missing or insufficient permissions"
**Solution**: Update Firestore security rules to allow access

### Error: "PERMISSION_DENIED"
**Solution**: Check that Firestore rules allow the operation

### Error: "Failed to get document"
**Solution**: Make sure the user document exists in Firestore

### Warnings about WebChannel/Listen streams
**Solution**: This is normal during development with Firestore. Once rules are set correctly, these should decrease.

## Need Help?

If issues persist:
1. Share the Firebase Console screenshot showing:
   - Firestore Database status
   - Security Rules
   - Authentication settings
2. Share console logs from account creation/login

The app will still work for authentication even without Firestore - user data will just be stored locally!
