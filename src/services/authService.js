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

    console.log('📝 Creating account for:', email, 'Role:', role);

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ Firebase Auth user created:', user.uid);

    // Update display name if provided
    if (profileData.name || profileData.fullName) {
      try {
        await updateProfile(user, {
          displayName: profileData.name || profileData.fullName
        });
        console.log('✅ Display name updated');
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

    // Store in Firestore with proper error handling
    const collection = role === 'doctor' ? 'doctors' : 'patients';
    
    try {
      console.log(`💾 Saving to Firestore: ${collection}/${user.uid}`);
      await setDoc(doc(db, collection, user.uid), userDataToStore);
      console.log(`✅ User data saved to Firestore successfully`);
    } catch (firestoreError) {
      console.error('❌ Firestore save error:', firestoreError.message);
      // Even if Firestore fails, we still have the Auth user created
      // Store locally and continue
      console.log('⚠️ Continuing with local storage only');
    }

    // Store locally
    await AsyncStorage.setItem('user', JSON.stringify(userDataToStore));
    console.log('✅ User data cached locally');

    return {
      success: true,
      user: userDataToStore
    };

  } catch (error) {
    console.error('❌ Account creation error:', error.message);
    
    // Provide more specific error messages
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered. Please login instead.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address format.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Use at least 6 characters.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection.';
    }
    
    return {
      success: false,
      error: errorMessage
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
      // ✅ SECURITY: Only use cache if BOTH uid AND role match
      // This prevents using a cached doctor account to login as patient (or vice versa)
      if (cachedUser.uid === user.uid && cachedUser.role === role) {
        console.log('✅ Using cached user data (fast login)');
        
        // Periodically verify against Firestore (every 10th login or if cache is old)
        const cacheAge = cachedUser.lastVerified ? Date.now() - new Date(cachedUser.lastVerified).getTime() : Infinity;
        const shouldVerify = !cachedUser.lastVerified || cacheAge > 24 * 60 * 60 * 1000; // 24 hours
        
        if (shouldVerify) {
          console.log('🔄 Cache verification needed, will verify in background...');
          // Verify in background, don't block login
          setTimeout(async () => {
            try {
              const collection = role === 'doctor' ? 'doctors' : 'patients';
              const userDoc = await getDoc(doc(db, collection, user.uid));
              if (userDoc.exists() && userDoc.data().role === role) {
                const updatedUser = { ...userDoc.data(), lastVerified: new Date().toISOString() };
                await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
                console.log('✅ Cache verified and updated');
              } else {
                console.log('⚠️ Cache invalid, clearing...');
                await AsyncStorage.removeItem('user');
              }
            } catch (err) {
              console.log('Background verification failed:', err.message);
            }
          }, 1000);
        }
        
        return {
          success: true,
          user: cachedUser
        };
      } else if (cachedUser.uid === user.uid && cachedUser.role !== role) {
        // ❌ SECURITY: User is trying to login with same account but different role
        console.log('❌ Role mismatch in cache');
        await firebaseSignOut(auth);
        return {
          success: false,
          error: `This account is registered as a ${cachedUser.role}, not a ${role}. Please use the ${cachedUser.role} login.`
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
        // ❌ CRITICAL: Document doesn't exist in this collection
        // User is trying to login with wrong role
        console.log('❌ No document found in', collection);
        await firebaseSignOut(auth);
        
        // Try to find the user in the opposite collection to give better error message
        const oppositeCollection = role === 'doctor' ? 'patients' : 'doctors';
        try {
          const oppositeDoc = await getDoc(doc(db, oppositeCollection, user.uid));
          if (oppositeDoc.exists()) {
            const oppositeRole = oppositeDoc.data().role;
            return {
              success: false,
              error: `This account is registered as a ${oppositeRole}, not a ${role}. Please use the ${oppositeRole} login.`
            };
          }
        } catch (err) {
          console.log('Could not check opposite collection:', err.message);
        }
        
        // Account doesn't exist in either collection
        return {
          success: false,
          error: `No ${role} account found with this email. Please register first.`
        };
      }

    } catch (firestoreError) {
      console.log('⚠️ Firestore error:', firestoreError.message);
      
      // ❌ CRITICAL: Don't allow login if we can't verify role
      // This is a security issue - we must verify the user is in the correct collection
      await firebaseSignOut(auth);
      
      return {
        success: false,
        error: 'Unable to verify account. Please check your internet connection and try again.'
      };
    }

    // Store locally for next time with verification timestamp
    const userDataWithTimestamp = {
      ...userData,
      lastVerified: new Date().toISOString()
    };
    await AsyncStorage.setItem('user', JSON.stringify(userDataWithTimestamp));
    console.log('✅ Login complete');

    return {
      success: true,
      user: userDataWithTimestamp
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
