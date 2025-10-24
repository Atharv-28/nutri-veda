# NutriVeda Data Model & User Relationships

## Current Structure

### Firebase Authentication
- Single auth system for both doctors and patients
- Each user has a unique `uid`

### Firestore Collections

#### 1. `doctors/{doctorId}`
```javascript
{
  uid: "doctor_firebase_uid",
  email: "doctor@example.com",
  role: "doctor",
  name: "Dr. John Doe",
  specialization: "Ayurveda",
  registrationNumber: "REG123456",
  patients: ["patient_uid_1", "patient_uid_2"], // Array of patient UIDs
  createdAt: "2025-01-01T00:00:00.000Z"
}
```

#### 2. `patients/{patientId}`
```javascript
{
  uid: "patient_firebase_uid",
  email: "patient@example.com",
  role: "patient",
  name: "Jane Smith",
  assignedDoctorId: "doctor_firebase_uid", // Reference to doctor
  assignedDoctorName: "Dr. John Doe",
  dosha: null, // Set after Prakruti test
  hasCompletedAssessment: false,
  hasDietPlan: false,
  createdAt: "2025-01-01T00:00:00.000Z"
}
```

#### 3. `dietPlans/{planId}` (New Collection)
```javascript
{
  id: "auto_generated_id",
  patientId: "patient_uid",
  patientName: "Jane Smith",
  doctorId: "doctor_uid",
  doctorName: "Dr. John Doe",
  dosha: "vata",
  meals: {
    breakfast: [...],
    lunch: [...],
    dinner: [...]
  },
  recommendations: "...",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z"
}
```

#### 4. `assessments/{assessmentId}` (New Collection)
```javascript
{
  id: "auto_generated_id",
  patientId: "patient_uid",
  patientName: "Jane Smith",
  doctorId: "doctor_uid", // Optional, if doctor administered
  dosha: "vata",
  scores: { vata: 10, pitta: 6, kapha: 4 },
  answers: { ... },
  completedAt: "2025-01-01T00:00:00.000Z"
}
```

## User Workflows

### 1. Patient Selects Doctor
```
Patient Dashboard → Select Doctor → Updates patient.assignedDoctorId
                                  → Updates doctor.patients array
```

### 2. Patient Takes Assessment
```
Patient Dashboard → Prakruti Test → Saves to assessments collection
                                  → Updates patient.dosha
                                  → Updates patient.hasCompletedAssessment
```

### 3. Doctor Views Patients
```
Doctor Dashboard → Fetch all patients where patient.assignedDoctorId === doctorId
                → OR fetch doctor.patients array
```

### 4. Doctor Creates Diet Plan
```
Doctor Dashboard → Select Patient → Create Diet Plan → Save to dietPlans collection
                                                      → Update patient.hasDietPlan = true
```

### 5. Patient Views Diet Plan
```
Patient Dashboard → View Diet Plan → Fetch from dietPlans where patientId === currentUserId
                                   → Display most recent plan
```

## Key Relationships

### One-to-Many: Doctor → Patients
- One doctor can have multiple patients
- Store patient UIDs in `doctor.patients[]` array
- OR query `patients` collection where `assignedDoctorId === doctorId`

### Many-to-One: Patient → Doctor
- Each patient has one assigned doctor (can be changed)
- Store in `patient.assignedDoctorId`

### One-to-Many: Patient → Diet Plans
- One patient can have multiple diet plans (history)
- Query `dietPlans` where `patientId === patientUid`
- Display most recent plan

### One-to-Many: Doctor → Diet Plans
- One doctor creates many diet plans
- Query `dietPlans` where `doctorId === doctorUid`

### One-to-One: Patient → Latest Assessment
- Each patient has one active assessment result
- Store latest dosha in `patient.dosha`
- Keep full history in `assessments` collection

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Doctors collection
    match /doctors/{doctorId} {
      // Any authenticated user can read doctor info (for selection)
      allow read: if request.auth != null;
      // Only the doctor can update their own profile
      allow write: if request.auth != null && request.auth.uid == doctorId;
    }
    
    // Patients collection
    match /patients/{patientId} {
      // Patients can read their own data
      allow read: if request.auth != null && request.auth.uid == patientId;
      // Assigned doctor can read patient data
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/patients/$(patientId)).data.assignedDoctorId == request.auth.uid;
      // Patient can update their own data
      allow write: if request.auth != null && request.auth.uid == patientId;
    }
    
    // Diet Plans collection
    match /dietPlans/{planId} {
      // Patient can read their own diet plans
      allow read: if request.auth != null && 
                     resource.data.patientId == request.auth.uid;
      // Doctor can read diet plans they created
      allow read: if request.auth != null && 
                     resource.data.doctorId == request.auth.uid;
      // Only doctors can create/update diet plans
      allow create: if request.auth != null && 
                       request.resource.data.doctorId == request.auth.uid;
      allow update: if request.auth != null && 
                       resource.data.doctorId == request.auth.uid;
    }
    
    // Assessments collection
    match /assessments/{assessmentId} {
      // Patient can read their own assessments
      allow read: if request.auth != null && 
                     resource.data.patientId == request.auth.uid;
      // Assigned doctor can read patient's assessments
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/patients/$(resource.data.patientId)).data.assignedDoctorId == request.auth.uid;
      // Patient can create their own assessment
      allow create: if request.auth != null && 
                       request.resource.data.patientId == request.auth.uid;
    }
  }
}
```

## Query Examples

### Get Doctor's Patients
```javascript
// Method 1: Query patients collection
const patientsQuery = query(
  collection(db, 'patients'),
  where('assignedDoctorId', '==', doctorUid)
);
const patientsSnapshot = await getDocs(patientsQuery);

// Method 2: Use doctor.patients array (if maintained)
const doctorDoc = await getDoc(doc(db, 'doctors', doctorUid));
const patientIds = doctorDoc.data().patients || [];
// Then fetch each patient document
```

### Get Patient's Doctor
```javascript
const patientDoc = await getDoc(doc(db, 'patients', patientUid));
const doctorId = patientDoc.data().assignedDoctorId;

if (doctorId) {
  const doctorDoc = await getDoc(doc(db, 'doctors', doctorId));
  const doctorData = doctorDoc.data();
}
```

### Get Patient's Diet Plans
```javascript
const plansQuery = query(
  collection(db, 'dietPlans'),
  where('patientId', '==', patientUid),
  orderBy('createdAt', 'desc'),
  limit(1) // Get most recent
);
const plansSnapshot = await getDocs(plansQuery);
```

### Get All Doctors (for patient selection)
```javascript
const doctorsQuery = query(collection(db, 'doctors'));
const doctorsSnapshot = await getDocs(doctorsQuery);
```

## Implementation Priority

### Phase 1: Basic Relationships ✅
- [x] Separate doctor/patient authentication
- [x] Store user data in respective collections
- [ ] Link patient to doctor when selected

### Phase 2: Doctor-Patient Connection
- [ ] Update SelectDoctorScreen to save relationship
- [ ] Update DoctorDashboard to fetch assigned patients
- [ ] Update PatientDashboard to show assigned doctor

### Phase 3: Assessment & Diet Plans
- [ ] Save assessment results to Firestore
- [ ] Link assessments to patients
- [ ] Create diet plans collection
- [ ] Link diet plans to patients & doctors

### Phase 4: Real-time Updates
- [ ] Use Firestore listeners for real-time updates
- [ ] Notify patient when doctor creates diet plan
- [ ] Notify doctor when patient completes assessment

## Next Steps

I'll create service functions to handle these relationships:
1. `linkPatientToDoctor()` - Assign patient to doctor
2. `getDoctorPatients()` - Fetch all patients for a doctor
3. `getPatientDoctor()` - Get patient's assigned doctor
4. `saveDietPlan()` - Create/update diet plan
5. `getPatientDietPlans()` - Fetch patient's diet plans
6. `saveAssessment()` - Save Prakruti assessment

Would you like me to implement these functions now?
