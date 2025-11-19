import { db } from '../config/firebaseConfig';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  collection, 
  query, 
  where,
  orderBy,
  limit,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp 
} from 'firebase/firestore';
import { generateDailyPlan, getDoshaRecommendations } from '../data/nutriVedaDietEngine';

/**
 * Link a patient to a doctor
 * @param {string} patientId - Patient's Firebase UID
 * @param {Object} doctorData - Doctor's data {uid, name, specialization}
 * @returns {Object} - Success/error result
 */
export const linkPatientToDoctor = async (patientId, doctorData) => {
  try {
    console.log(`🔗 Linking patient ${patientId} to doctor ${doctorData.uid}`);
    
    // Update patient document with assigned doctor
    await updateDoc(doc(db, 'patients', patientId), {
      assignedDoctorId: doctorData.uid,
      assignedDoctorName: doctorData.name,
      assignedDoctorSpecialization: doctorData.specialization || '',
      assignedAt: new Date().toISOString()
    });

    // Add patient to doctor's patients array
    await updateDoc(doc(db, 'doctors', doctorData.uid), {
      patients: arrayUnion(patientId)
    });

    console.log('✅ Patient-Doctor link created');
    return { success: true };
  } catch (error) {
    console.error('❌ Error linking patient to doctor:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Unlink a patient from a doctor
 * @param {string} patientId - Patient's Firebase UID
 * @param {string} doctorId - Doctor's Firebase UID
 * @returns {Object} - Success/error result
 */
export const unlinkPatientFromDoctor = async (patientId, doctorId) => {
  try {
    // Remove doctor assignment from patient
    await updateDoc(doc(db, 'patients', patientId), {
      assignedDoctorId: null,
      assignedDoctorName: null,
      assignedDoctorSpecialization: null,
      assignedAt: null
    });

    // Remove patient from doctor's array
    await updateDoc(doc(db, 'doctors', doctorId), {
      patients: arrayRemove(patientId)
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Error unlinking patient from doctor:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Get all patients assigned to a doctor
 * @param {string} doctorId - Doctor's Firebase UID
 * @returns {Object} - Array of patients or error
 */
export const getDoctorPatients = async (doctorId) => {
  try {
    console.log(`📋 Fetching patients for doctor ${doctorId}`);
    
    const patientsQuery = query(
      collection(db, 'patients'),
      where('assignedDoctorId', '==', doctorId)
    );
    
    const patientsSnapshot = await getDocs(patientsQuery);
    const patients = [];
    
    patientsSnapshot.forEach((doc) => {
      patients.push({ id: doc.id, ...doc.data() });
    });

    console.log(`✅ Found ${patients.length} patients`);
    return { success: true, patients };
  } catch (error) {
    console.error('❌ Error fetching doctor patients:', error.message);
    return { success: false, error: error.message, patients: [] };
  }
};

/**
 * Get patient's assigned doctor
 * @param {string} patientId - Patient's Firebase UID
 * @returns {Object} - Doctor data or null
 */
export const getPatientDoctor = async (patientId) => {
  try {
    const patientDoc = await getDoc(doc(db, 'patients', patientId));
    
    if (!patientDoc.exists()) {
      return { success: false, error: 'Patient not found', doctor: null };
    }

    const patientData = patientDoc.data();
    const doctorId = patientData.assignedDoctorId;

    if (!doctorId) {
      return { success: true, doctor: null };
    }

    const doctorDoc = await getDoc(doc(db, 'doctors', doctorId));
    
    if (!doctorDoc.exists()) {
      return { success: false, error: 'Doctor not found', doctor: null };
    }

    return { success: true, doctor: { id: doctorDoc.id, ...doctorDoc.data() } };
  } catch (error) {
    console.error('❌ Error fetching patient doctor:', error.message);
    return { success: false, error: error.message, doctor: null };
  }
};

/**
 * Get all doctors (for patient selection)
 * @returns {Object} - Array of doctors or error
 */
export const getAllDoctors = async () => {
  try {
    const doctorsQuery = query(collection(db, 'doctors'));
    const doctorsSnapshot = await getDocs(doctorsQuery);
    const doctors = [];
    
    doctorsSnapshot.forEach((doc) => {
      doctors.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, doctors };
  } catch (error) {
    console.error('❌ Error fetching doctors:', error.message);
    return { success: false, error: error.message, doctors: [] };
  }
};

/**
 * Save Prakruti assessment result
 * @param {Object} assessmentData - Assessment data
 * @returns {Object} - Success/error result
 */
export const saveAssessment = async (assessmentData) => {
  try {
    const { patientId, dosha, scores, answers, doctorId = null } = assessmentData;
    
    console.log(`💾 Saving assessment for patient ${patientId}`);
    
    // Create assessment document
    const assessmentRef = doc(collection(db, 'assessments'));
    await setDoc(assessmentRef, {
      patientId,
      doctorId,
      dosha,
      scores,
      answers,
      completedAt: new Date().toISOString()
    });

    // Update patient profile with latest assessment
    await updateDoc(doc(db, 'patients', patientId), {
      dosha,
      hasCompletedAssessment: true,
      lastAssessmentDate: new Date().toISOString()
    });

    console.log('✅ Assessment saved');
    return { success: true, assessmentId: assessmentRef.id };
  } catch (error) {
    console.error('❌ Error saving assessment:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Get patient's assessments
 * @param {string} patientId - Patient's Firebase UID
 * @returns {Object} - Array of assessments or error
 */
export const getPatientAssessments = async (patientId) => {
  try {
    const assessmentsQuery = query(
      collection(db, 'assessments'),
      where('patientId', '==', patientId),
      orderBy('completedAt', 'desc')
    );
    
    const assessmentsSnapshot = await getDocs(assessmentsQuery);
    const assessments = [];
    
    assessmentsSnapshot.forEach((doc) => {
      assessments.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, assessments };
  } catch (error) {
    console.error('❌ Error fetching assessments:', error.message);
    return { success: false, error: error.message, assessments: [] };
  }
};

/**
 * Generate AI diet plan using NutriVeda Engine
 * @param {string} dosha - Dominant dosha (vata, pitta, kapha)
 * @returns {Object} - Generated diet plan
 */
export const generateAIDietPlan = (dosha) => {
  try {
    console.log(`🤖 Generating AI diet plan for ${dosha} dosha`);
    
    // Generate complete daily plan using the NutriVeda engine
    const dailyPlan = generateDailyPlan(dosha.toLowerCase());
    const recommendations = getDoshaRecommendations(dosha.toLowerCase());
    
    return {
      meals: dailyPlan.meals,
      doshaInfo: dailyPlan.doshaInfo,
      spices: dailyPlan.spices,
      spicesNote: dailyPlan.spicesNote,
      mindfulEating: dailyPlan.mindfulEating,
      dailyRoutine: dailyPlan.dailyRoutine,
      keyPrinciples: dailyPlan.keyPrinciples,
      recommendations: recommendations,
      generatedAt: dailyPlan.generatedAt,
      version: dailyPlan.version
    };
  } catch (error) {
    console.error('❌ Error generating AI diet plan:', error.message);
    throw error;
  }
};

/**
 * Save diet plan
 * @param {Object} dietPlanData - Diet plan data
 * @returns {Object} - Success/error result
 */
export const saveDietPlan = async (dietPlanData) => {
  try {
    const { patientId, doctorId, dosha, meals, recommendations, patientName, doctorName } = dietPlanData;
    
    console.log(`💾 Saving diet plan for patient ${patientId}`);
    
    const dietPlanRef = doc(collection(db, 'dietPlans'));
    await setDoc(dietPlanRef, {
      patientId,
      patientName,
      doctorId,
      doctorName,
      dosha,
      meals,
      recommendations,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Update patient profile
    await updateDoc(doc(db, 'patients', patientId), {
      hasDietPlan: true,
      lastDietPlanDate: new Date().toISOString()
    });

    console.log('✅ Diet plan saved');
    return { success: true, planId: dietPlanRef.id };
  } catch (error) {
    console.error('❌ Error saving diet plan:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Get patient's diet plans
 * @param {string} patientId - Patient's Firebase UID
 * @param {number} limitCount - Number of plans to fetch (default: 1 for latest)
 * @returns {Object} - Array of diet plans or error
 */
export const getPatientDietPlans = async (patientId, limitCount = 1) => {
  try {
    const plansQuery = query(
      collection(db, 'dietPlans'),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const plansSnapshot = await getDocs(plansQuery);
    const plans = [];
    
    plansSnapshot.forEach((doc) => {
      plans.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, plans };
  } catch (error) {
    console.error('❌ Error fetching diet plans:', error.message);
    return { success: false, error: error.message, plans: [] };
  }
};

/**
 * Get patient's latest diet plan (convenience function)
 * @param {string} patientId - Patient's Firebase UID
 * @returns {Object|null} - Latest diet plan or null
 */
export const getDietPlan = async (patientId) => {
  try {
    console.log('📋 Fetching diet plan for patient:', patientId);
    
    // Simple query without orderBy to avoid index requirement
    const plansQuery = query(
      collection(db, 'dietPlans'),
      where('patientId', '==', patientId)
    );
    
    const querySnapshot = await getDocs(plansQuery);
    
    if (querySnapshot.empty) {
      console.log('⚠️ No diet plan found for patient');
      return null;
    }
    
    // Manually sort by createdAt to get the latest plan
    const plans = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by createdAt descending and return the first (latest) one
    plans.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA; // Descending order
    });
    
    console.log('✅ Diet plan fetched successfully:', plans[0].id);
    return plans[0];
    
  } catch (error) {
    console.error('❌ Error fetching diet plan:', error);
    throw error;
  }
};

/**
 * Update diet plan
 * @param {string} planId - Diet plan document ID
 * @param {Object} updates - Fields to update
 * @returns {Object} - Success/error result
 */
export const updateDietPlan = async (planId, updates) => {
  try {
    await updateDoc(doc(db, 'dietPlans', planId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Error updating diet plan:', error.message);
    return { success: false, error: error.message };
  }
};
