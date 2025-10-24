# Environment Variables Setup Guide

## What Was Done

Your Firebase credentials are now stored in environment variables instead of being hardcoded. This is crucial for:
- **Security**: Credentials won't be exposed in your Git repository
- **Flexibility**: Easy to switch between development/production environments
- **Team Collaboration**: Each developer can have their own Firebase project

## Files Created/Modified

### 1. `.env` (Your actual credentials - NOT committed to Git)
Contains your real Firebase credentials.

### 2. `.env.example` (Template - Safe to commit)
Template file showing what environment variables are needed.

### 3. `babel.config.js` (Created)
Configures Babel to use react-native-dotenv plugin.

### 4. `.gitignore` (Updated)
Added `.env` to prevent committing sensitive credentials.

### 5. `src/config/firebaseConfig.js` (Updated)
Now imports credentials from environment variables.

## Setup Instructions for Your Team

When someone clones your repository, they need to:

### Step 1: Copy the Template
```bash
cp .env.example .env
```

### Step 2: Get Firebase Credentials
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to Project Settings (gear icon) → General
4. Scroll to "Your apps" section
5. Click on the Web app (</> icon)
6. Copy the config values

### Step 3: Fill in `.env`
Open `.env` and replace the placeholder values:

```env
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
FIREBASE_MEASUREMENT_ID=G-ABC123XYZ
```

### Step 4: Clear Cache and Restart
```bash
npx expo start -c
```

## Current Setup (Your Credentials)

Your actual Firebase credentials are now in `.env` and are automatically loaded when the app starts.

## Testing

After setup, verify it works:

1. Start the app: `npx expo start`
2. Try creating an account
3. Try logging in
4. Check console for Firebase connection logs

If you see errors like "undefined is not an object", it means:
- Environment variables aren't loading
- Try clearing cache: `npx expo start -c`
- Restart your terminal

## Git Safety

✅ **What's Safe to Commit:**
- `.env.example` (template with placeholders)
- `babel.config.js`
- `firebaseConfig.js` (imports from env)
- Updated `.gitignore`

❌ **Never Commit:**
- `.env` (contains your real credentials)

## Verify Git Ignore

Before your first commit, verify `.env` is ignored:

```bash
git status
```

You should see:
- ✅ `.env.example` (in changes)
- ❌ `.env` (should NOT appear)

If `.env` appears in git status:
```bash
git rm --cached .env
git commit -m "Remove .env from git"
```

## Multiple Environments (Optional)

You can have different Firebase projects for development and production:

### Development
`.env.development`
```env
FIREBASE_API_KEY=dev_key_here
FIREBASE_PROJECT_ID=nutriveda-dev
# ... other dev credentials
```

### Production
`.env.production`
```env
FIREBASE_API_KEY=prod_key_here
FIREBASE_PROJECT_ID=nutriveda-prod
# ... other prod credentials
```

Then load the appropriate one based on your environment.

## Troubleshooting

### Error: "Cannot find module '@env'"

**Solution 1**: Clear cache
```bash
npx expo start -c
```

**Solution 2**: Restart terminal and metro bundler

**Solution 3**: Check `babel.config.js` is properly configured

### Error: "FIREBASE_API_KEY is undefined"

**Causes:**
1. `.env` file doesn't exist
2. `.env` file has wrong format
3. Metro bundler hasn't reloaded

**Solution:**
```bash
# 1. Verify .env exists and has correct format
cat .env

# 2. Clear cache and restart
npx expo start -c
```

### Error: After git clone, app doesn't work

This is expected! The new developer needs to:
1. Copy `.env.example` to `.env`
2. Fill in their Firebase credentials
3. Run `npx expo start -c`

## Security Best Practices

1. ✅ Never commit `.env` file
2. ✅ Use different Firebase projects for dev/prod
3. ✅ Enable Firestore security rules
4. ✅ Set up Firebase App Check (for production)
5. ✅ Rotate API keys if accidentally exposed
6. ✅ Use environment-specific credentials

## Need Help?

If environment variables aren't working:
1. Check `.env` file exists in project root
2. Verify `babel.config.js` has the dotenv plugin
3. Clear Metro bundler cache
4. Restart your development server
5. Check console for import errors

## Summary

✨ **Your Firebase credentials are now secure!**

- Credentials stored in `.env` (not committed)
- Template in `.env.example` (safe to commit)
- Git configured to ignore sensitive files
- Team members can use their own Firebase projects
- Ready to push to GitHub safely! 🚀
