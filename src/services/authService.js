import { auth, db } from '../config/firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Create a new user account (Doctor or Patient)
 * @param {Object} userData - User data including email, password, role, etc.
 * @returns {Object} - Created user object with uid
 */
export const createAccount = async (userData) => {
  try {
    const { email, password, role, ...profileData } = userData;
    console.log('🔐 Creating new account...');

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ Firebase Auth account created');

    // Update display name if provided
    if (profileData.name || profileData.fullName) {
      try {
        await updateProfile(user, {
          displayName: profileData.name || profileData.fullName
        });
      } catch (error) {
        console.log('⚠️ Could not update display name:', error.message);
      }
    }

    // Prepare user data for Firestore
    const userDataToStore = {
      uid: user.uid,
      email: user.email,
      role: role,
      ...profileData,
      createdAt: new Date().toISOString(),
    };

    // Store locally first (immediate)
    await AsyncStorage.setItem('user', JSON.stringify(userDataToStore));
    console.log('✅ User data saved locally');

    // Try to store in Firestore with timeout (background, don't block)
    const collection = role === 'doctor' ? 'doctors' : 'patients';
    console.log(`📡 Attempting to save to Firestore (${collection})...`);
    
    // Don't await this - let it happen in background
    Promise.race([
      setDoc(doc(db, collection, user.uid), userDataToStore),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    ])
      .then(() => console.log(`✅ User data saved to Firestore: ${collection}/${user.uid}`))
      .catch((err) => console.log('⚠️ Firestore save skipped:', err.message));

    return {
      success: true,
      user: userDataToStore
    };

  } catch (error) {
    console.error('❌ Account creation error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - 'doctor' or 'patient'
 * @returns {Object} - User object with data
 */
export const signIn = async (email, password, role) => {
  try {
    console.log('🔐 Starting login process...');
    
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ Firebase Auth successful');

    // First check if we have cached user data
    const cachedUserJson = await AsyncStorage.getItem('user');
    let userData;

    if (cachedUserJson) {
      const cachedUser = JSON.parse(cachedUserJson);
      // If cached user matches current login, use it immediately
      if (cachedUser.uid === user.uid && cachedUser.role === role) {
        console.log('✅ Using cached user data (fast login)');
        return {
          success: true,
          user: cachedUser
        };
      }
    }

    // Try to fetch from Firestore with timeout
    const collection = role === 'doctor' ? 'doctors' : 'patients';
    console.log(`📡 Fetching data from Firestore (${collection})...`);
    
    try {
      // Create a timeout promise (3 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firestore timeout')), 3000)
      );
      
      // Race between Firestore fetch and timeout
      const userDoc = await Promise.race([
        getDoc(doc(db, collection, user.uid)),
        timeoutPromise
      ]);
      
      if (userDoc.exists()) {
        userData = userDoc.data();
        console.log('✅ Firestore data loaded');
        
        // Verify role matches
        if (userData.role !== role) {
          await firebaseSignOut(auth);
          return {
            success: false,
            error: `This account is registered as a ${userData.role}, not a ${role}`
          };
        }
      } else {
        console.log('⚠️ No Firestore document found, using fallback');
        userData = {
          uid: user.uid,
          email: user.email,
          role: role,
          name: email.split('@')[0],
          fullName: email.split('@')[0]
        };
      }

    } catch (firestoreError) {
      console.log('⚠️ Firestore unavailable, using fallback data');
      // Fallback: create minimal user data from auth
      userData = {
        uid: user.uid,
        email: user.email,
        role: role,
        name: email.split('@')[0],
        fullName: email.split('@')[0]
      };
    }

    // Store locally for next time
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    console.log('✅ Login complete');

    return {
      success: true,
      user: userData
    };

  } catch (error) {
    console.error('❌ Sign in error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    await AsyncStorage.removeItem('user');
    return { success: true };
  } catch (error) {
    console.error('❌ Sign out error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get current user from local storage
 */
export const getCurrentUser = async () => {
  try {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('❌ Get current user error:', error);
    return null;
  }
};

// Export signOut as signOutUser for consistency with dashboard imports
export const signOutUser = signOut;

/**
 * Update user profile in Firestore
 */
export const updateUserProfile = async (uid, role, updates) => {
  try {
    const collection = role === 'doctor' ? 'doctors' : 'patients';
    await setDoc(doc(db, collection, uid), updates, { merge: true });
    
    // Update local storage
    const currentData = await AsyncStorage.getItem('user');
    if (currentData) {
      const userData = JSON.parse(currentData);
      const updatedData = { ...userData, ...updates };
      await AsyncStorage.setItem('user', JSON.stringify(updatedData));
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Update profile error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
