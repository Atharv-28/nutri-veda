# Role-Based Authentication Strategy in NutriVeda

## Overview

NutriVeda implements a **multi-layered role differentiation system** that distinguishes between doctors and patients at multiple levels: UI, authentication flow, data storage, and access control.

---

## 🎯 How Users Are Differentiated

### 1. **Separate Entry Points (UI Level)**

Users choose their role **before** logging in or registering:

```
HomeScreen
├── "I'm a Patient" → PatientLoginScreen
├── "I'm a Doctor" → DoctorLoginScreen
```

- **PatientLoginScreen** → Calls `signIn(email, password, 'patient')`
- **DoctorLoginScreen** → Calls `signIn(email, password, 'doctor')`

**Key Point:** The role is passed explicitly to the authentication service based on which screen the user accessed.

---

### 2. **Role Stored in Firestore (Data Level)**

When a user registers, their role is stored in their Firestore document:

```javascript
// CreateAccountPatient.js
const userData = {
  email: email.trim().toLowerCase(),
  password: password,
  role: 'patient', // ← Role stored here
  fullName,
  dateOfBirth,
  gender,
  contact,
  address,
  medicalHistory
};

await createAccount(userData);
```

**Firestore Structure:**
```
/doctors/{uid}
  - uid: "abc123"
  - email: "doctor@example.com"
  - role: "doctor" ← Stored in document
  - name: "Dr. Smith"
  - ...

/patients/{uid}
  - uid: "xyz789"
  - email: "patient@example.com"
  - role: "patient" ← Stored in document
  - fullName: "John Doe"
  - ...
```

---

### 3. **Role Verification During Login (Auth Level)**

When a user logs in, the system:
1. Authenticates with Firebase Auth (email/password)
2. Fetches user data from Firestore
3. **Verifies the role matches** the login screen they used

```javascript
// authService.js - signIn function
const collection = role === 'doctor' ? 'doctors' : 'patients';
const userDoc = await getDoc(doc(db, collection, user.uid));

if (userDoc.exists()) {
  userData = userDoc.data();
  
  // ✅ ROLE VERIFICATION
  if (userData.role !== role) {
    await firebaseSignOut(auth);
    return {
      success: false,
      error: `This account is registered as a ${userData.role}, not a ${role}`
    };
  }
}
```

**Example Scenario:**
- A doctor tries to log in through "Patient Login"
- System fetches from `/patients/{uid}` (no document found) OR finds role mismatch
- Login is **rejected** with an error message
- User is forced to use the correct login screen

---

### 4. **Separate Firestore Collections (Database Level)**

Doctors and patients are stored in **separate Firestore collections**:

```
Firestore Database
├── /doctors
│   ├── {doctorUid1}
│   ├── {doctorUid2}
│   └── ...
├── /patients
│   ├── {patientUid1}
│   ├── {patientUid2}
│   └── ...
├── /assessments
└── /dietPlans
```

**Benefits:**
- Clear data separation
- Easy to query all doctors or all patients
- Different access rules per collection
- Optimized indexing per role type

---

### 5. **Role-Based Navigation (Flow Level)**

After successful login, users are routed to different dashboards:

```javascript
// PatientLoginScreen.js
if (result.success) {
  navigation.navigate('PatientDashboard', { 
    patient: result.user
  });
}

// DoctorLoginScreen.js
if (result.success) {
  navigation.navigate('DoctorDashboard', { 
    doctor: result.user
  });
}
```

**Patient Flow:**
```
PatientLogin → PatientDashboard → [SelectDoctor, PrakrutiTest, DietPlan]
```

**Doctor Flow:**
```
DoctorLogin → DoctorDashboard → [View Patients, Create Diet Plans, View Assessments]
```

---

## 🔒 Security Layers

### Layer 1: UI Separation
- Users must choose "Patient" or "Doctor" before login/registration
- Reduces accidental wrong role selection

### Layer 2: Role Verification
- System checks role during login against Firestore data
- Prevents cross-role access even if someone has credentials

### Layer 3: Collection Isolation
- Separate Firestore collections prevent data mixing
- Query operations naturally filter by role

### Layer 4: Firestore Security Rules (Future)
```javascript
// Firestore Rules (to be implemented)
match /patients/{patientId} {
  allow read, write: if request.auth != null && 
                        request.auth.uid == patientId;
}

match /doctors/{doctorId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
                  request.auth.uid == doctorId;
}
```

---

## 🔄 Authentication Flow Diagram

### Patient Registration & Login
```
User clicks "I'm a Patient"
  ↓
CreateAccountPatient.js
  ↓
createAccount({ role: 'patient', ... })
  ↓
Firebase Auth creates user
  ↓
Firestore: /patients/{uid} created with role='patient'
  ↓
AsyncStorage: User cached locally with role
  ↓
PatientDashboard
```

### Doctor Registration & Login
```
User clicks "I'm a Doctor"
  ↓
CreateAccountDoctor.js
  ↓
createAccount({ role: 'doctor', ... })
  ↓
Firebase Auth creates user
  ↓
Firestore: /doctors/{uid} created with role='doctor'
  ↓
AsyncStorage: User cached locally with role
  ↓
DoctorDashboard
```

### Cross-Role Login Attempt (Blocked)
```
Doctor tries to use "Patient Login"
  ↓
signIn(email, password, 'patient')
  ↓
Firebase Auth succeeds (email/password valid)
  ↓
System fetches from /patients/{uid} → NOT FOUND
OR fetches but role='doctor' ≠ 'patient'
  ↓
❌ Login rejected: "This account is registered as a doctor, not a patient"
  ↓
User signs out, must use correct login screen
```

---

## 🛡️ Why This Approach?

### ✅ Pros
1. **Clear Separation**: UI, data, and logic are all role-aware
2. **Scalable**: Easy to add more roles (e.g., admin, nutritionist)
3. **Secure**: Multiple verification layers prevent unauthorized access
4. **Performant**: Cached role enables fast offline login
5. **User-Friendly**: Clear "I'm a Patient" vs "I'm a Doctor" choices

### ⚠️ Considerations
1. **Single Email Per Role**: Currently, same email can't be both doctor and patient
   - **Solution**: Could allow same email in both collections if needed
2. **No Role Switching**: Users can't switch roles without logging out
   - **Solution**: Add role picker after login if multi-role support needed
3. **Cache Dependency**: Fast login relies on cached role
   - **Fallback**: System falls back to minimal data if cache missing

---

## 🚀 Future Enhancements

### 1. Multi-Role Support
Allow users to have both doctor and patient accounts with same email:
```javascript
// Store role in custom claims or check both collections
const isDoctor = await getDoc(doc(db, 'doctors', uid));
const isPatient = await getDoc(doc(db, 'patients', uid));

if (isDoctor.exists() && isPatient.exists()) {
  // Show role picker
  showRolePicker(['doctor', 'patient']);
}
```

### 2. Admin Role
Add admin users with special permissions:
```javascript
/admins/{uid}
  - role: 'admin'
  - permissions: ['view_all_users', 'manage_doctors', 'view_analytics']
```

### 3. Dynamic Role Assignment
Allow admins to change user roles or approve doctor registrations:
```javascript
await updateDoc(doc(db, 'doctors', uid), {
  verified: true,
  verifiedBy: adminUid,
  verifiedAt: Timestamp.now()
});
```

### 4. Firebase Custom Claims
Store role in Firebase Auth custom claims for server-side verification:
```javascript
// Server-side (Firebase Functions)
admin.auth().setCustomUserClaims(uid, { role: 'doctor' });

// Client-side
const idTokenResult = await user.getIdTokenResult();
const role = idTokenResult.claims.role;
```

---

## 📝 Implementation Checklist

- [x] Separate login screens for doctor/patient
- [x] Role stored in Firestore documents
- [x] Role verification during login
- [x] Separate Firestore collections
- [x] Role-based navigation
- [x] Cached role for fast login
- [ ] Firestore security rules enforcement
- [ ] Admin role and permissions
- [ ] Role-based feature access in UI
- [ ] Multi-role support (optional)
- [ ] Custom claims for server-side verification (optional)

---

## 🧪 Testing Role Differentiation

### Test Case 1: Normal Login
1. Register as patient → Success, role='patient'
2. Login through "Patient Login" → Success, navigate to PatientDashboard
3. Logout
4. Register as doctor → Success, role='doctor'
5. Login through "Doctor Login" → Success, navigate to DoctorDashboard

### Test Case 2: Wrong Login Screen
1. Register as patient
2. Try to login through "Doctor Login" → ❌ Error: "This account is registered as a patient, not a doctor"
3. Login through correct "Patient Login" → ✅ Success

### Test Case 3: Data Isolation
1. Query `/patients` → See only patient documents
2. Query `/doctors` → See only doctor documents
3. Patient can't access doctor-specific features in UI
4. Doctor can't access patient-specific features in UI

---

## 📚 Related Documentation

- [FIREBASE_IMPLEMENTATION.md](./FIREBASE_IMPLEMENTATION.md) - Complete Firebase setup
- [DATA_MODEL.md](./docs/DATA_MODEL.md) - Firestore data structure
- [AUTHENTICATION_PERFORMANCE.md](./AUTHENTICATION_PERFORMANCE.md) - Auth performance optimization

---

## 🎓 Summary

**NutriVeda differentiates doctors and patients through:**

1. **UI**: Separate login/registration screens
2. **Database**: Separate Firestore collections (`/doctors` and `/patients`)
3. **Authentication**: Role passed to `signIn()` and verified against Firestore data
4. **Data**: `role` field stored in every user document
5. **Navigation**: Different dashboards and features based on role
6. **Security**: Role verification prevents cross-role access

This multi-layered approach ensures robust role-based access control while maintaining performance through caching and providing a clear user experience.
