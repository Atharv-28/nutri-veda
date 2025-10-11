# NutriVeda App - User Flow Diagram

## Main Application Flow

```
┌─────────────────────┐
│   NutriVeda App     │
│      Start          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Login Screen      │
│ Select User Type    │
│ (Doctor/Patient)    │
└──────────┬──────────┘
           │
           ▼
      ┌─────────┐
      │ Doctor  │◄──────── User Choice
      │   or    │
      │Patient? │──────────┐
      └─────────┘          │
           │               │
    [Doctor]│               │[Patient]
           ▼               ▼
┌─────────────────────┐   ┌─────────────────────┐
│  Doctor Dashboard   │   │  Select Doctor      │
│ - View Patients     │   │     Screen          │
│ - Manage Cases      │   └──────────┬──────────┘
│ - Patient Status    │              │
└──────────┬──────────┘              ▼
           │                ┌─────────────────────┐
           ▼                │ Patient Dashboard   │
    ┌─────────────┐         │ - View Doctor Info  │
    │   Patient   │         │ - Health Overview   │
    │ Assessment  │         │ - Quick Actions     │
    │ Complete?   │         └──────────┬──────────┘
    └─────┬───┬───┘                    │
          │   │                        ▼
     [No] │   │ [Yes]           ┌─────────────┐
          │   │                 │ Assessment  │
          │   └─────────────────┤ Completed?  │
          │                     └─────┬───┬───┘
          ▼                           │   │
┌─────────────────────┐          [No] │   │ [Yes]
│ Wait for Patient    │               │   │
│ to Complete         │               ▼   ▼
│ Assessment          │    ┌─────────────────────┐   ┌─────────────────────┐
└─────────────────────┘    │   Prakruti Test     │   │   View Diet Plan    │
          │                │ (Constitution       │   │   (Read Only)       │
          │                │  Assessment)        │   └──────────┬──────────┘
          │                └──────────┬──────────┘              │
          │                           │                         │
          │                    [Complete]                      │
          │                           │                         │
          │                           ▼                         │
          │                ┌─────────────────────┐              │
          └────────────────┤ Update Patient      │              │
                           │ Dashboard with      │              │
                           │ Dosha Results       │              │
                           └──────────┬──────────┘              │
                                      │                         │
                                      ▼                         │
                           ┌─────────────────────┐              │
                           │ Doctor Can Now      │              │
                           │ Create Diet Plan    │              │
                           └──────────┬──────────┘              │
                                      │                         │
                                      ▼                         │
                           ┌─────────────────────┐              │
                           │  Create/Edit        │◄─────────────┘
                           │   Diet Plan         │
                           │   Screen            │
                           └──────────┬──────────┘
                                      │
                                      ▼
                           ┌─────────────────────┐
                           │   Diet Plan         │
                           │     Screen          │
                           │ - Meal Plans        │
                           │ - Dosha-based       │
                           │ - Recommendations   │
                           │ - Spices & Tips     │
                           └─────────────────────┘
```

## User Roles & Permissions

### 🩺 Doctor Flow:
1. **Login** → Select "Doctor"
2. **Doctor Dashboard** → View list of patients
3. **Check Patient Status:**
   - ✅ Assessment Complete → Create Diet Plan
   - ❌ Assessment Pending → Wait for patient
4. **Create Diet Plan** → Based on patient's dosha
5. **Manage Patients** → Monitor progress

### 👤 Patient Flow:
1. **Login** → Select "Patient"
2. **Select Doctor** → Choose from available doctors
3. **Patient Dashboard** → View doctor info & health overview
4. **Assessment Check:**
   - ❌ Not Done → Complete Prakruti Test (Required)
   - ✅ Done → View Diet Plan (if created by doctor)
5. **Prakruti Test** → Determine constitution (Vata/Pitta/Kapha)
6. **View Diet Plan** → Access personalized recommendations

## Key Features:

### 🔐 Authentication:
- **Demo Mode**: No username/password required
- **Role Selection**: Doctor or Patient
- **Auto-login**: Direct access to respective dashboards

### 📊 Assessment System:
- **Patient-Side**: Prakruti constitution test
- **Dosha Detection**: Vata, Pitta, or Kapha
- **Doctor Dependency**: Diet plan creation requires completed assessment

### 🍽️ Diet Management:
- **Doctor Creates**: Personalized diet plans
- **Patient Views**: Read-only access to their plan
- **Dosha-Based**: Recommendations based on constitution
- **Comprehensive**: Meal plans, spices, tips

### 🔄 Workflow:
1. Patient selects doctor
2. Patient completes assessment
3. Doctor views results
4. Doctor creates diet plan
5. Patient accesses their plan

## Screen Navigation:

```
LoginScreen
├── DoctorDashboard (Doctor users)
│   └── DietPlan (Create/Edit mode)
└── SelectDoctor (Patient users)
    └── PatientDashboard
        ├── PrakrutiTest (Assessment)
        └── DietPlan (View mode)
```

## Current Demo Users:

### Doctor:
- **Name**: Dr. Rajesh Sharma
- **Specialization**: Ayurveda
- **Experience**: 15 years

### Patient:
- **Name**: Amit Joshi
- **Age**: 42
- **Status**: New (needs doctor selection)

This flow ensures proper role separation and maintains the Ayurvedic treatment process where assessment comes before treatment planning.
