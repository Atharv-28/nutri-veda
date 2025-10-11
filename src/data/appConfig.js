// Configuration for NutriVeda Assessment and Diet Plan Generation

export const APP_CONFIG = {
  // Assessment Configuration
  assessment: {
    // Use 'basic' for simple implementation, 'enhanced' for comprehensive assessment
    mode: 'basic', // Change to 'enhanced' to use advanced assessment
    enableDetailedQuestions: false, // Set to true for more comprehensive assessment
    enableDemographicCollection: false, // Set to true to collect age, activity level, etc.
    enableProgressTracking: false // Set to true for progress monitoring features
  },

  // Diet Plan Generation Configuration
  dietPlan: {
    // Use 'static' for predefined plans, 'dynamic' for AI-generated plans
    generationMode: 'static', // Change to 'dynamic' for personalized generation
    enablePersonalization: false, // Set to true for personalized recommendations
    enableSeasonalAdjustments: false, // Set to true for seasonal diet modifications
    enableHealthConditionSupport: false // Set to true for health-condition-specific plans
  },

  // Features Configuration
  features: {
    enableDoctorReview: true, // Allow doctors to review and modify plans
    enableExportToPDF: false, // Enable PDF export functionality
    enableShoppingList: false, // Generate shopping lists from diet plans
    enableProgressInsights: false, // Track progress and generate insights
    enableFeedbackSystem: false // Allow patients to provide feedback on plans
  },

  // UI Configuration
  ui: {
    showDetailedResults: false, // Show detailed assessment breakdown
    showConstitutionType: true, // Show constitution type (vata-dominant, etc.)
    showCategoryBreakdown: false, // Show scores by category
    showPersonalityTraits: false, // Show dosha-based personality traits
    enableAnimations: true // Enable UI animations and transitions
  }
};

// Current Implementation Status
export const IMPLEMENTATION_STATUS = {
  // What's currently implemented (basic version)
  current: {
    assessment: 'Basic Prakruti test with 12 questions',
    dietPlans: 'Static predefined diet plans for each dosha',
    doctorFlow: 'Doctor can view patients and create diet plans',
    patientFlow: 'Patient can take assessment and view diet plan'
  },

  // What the enhanced version would add
  enhanced: {
    assessment: 'Comprehensive 12+ question assessment with demographics',
    dietPlans: 'AI-generated personalized plans based on detailed analysis',
    doctorFlow: 'Advanced patient management with detailed insights',
    patientFlow: 'Progress tracking, feedback system, shopping lists'
  }
};

// Instructions for upgrading to enhanced version
export const UPGRADE_INSTRUCTIONS = {
  steps: [
    '1. Change APP_CONFIG.assessment.mode to "enhanced"',
    '2. Change APP_CONFIG.dietPlan.generationMode to "dynamic"',
    '3. Enable desired features in APP_CONFIG.features',
    '4. Update PrakrutiTestScreen.js to use enhancedQuestions',
    '5. Update DietPlanScreen.js to use DietPlanEngine',
    '6. Update DoctorDashboardScreen.js for enhanced patient management'
  ],
  files_to_modify: [
    'src/screens/PrakrutiTestScreen.js',
    'src/screens/DietPlanScreen.js', 
    'src/screens/DoctorDashboardScreen.js',
    'src/screens/PatientDashboardScreen.js'
  ]
};

export default APP_CONFIG;
