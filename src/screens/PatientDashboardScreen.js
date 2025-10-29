import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { signOutUser } from '../services/authService';
import { getPatientDoctor, getDietPlan } from '../services/relationshipService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const PatientDashboardScreen = ({ route, navigation }) => {
  const { patient: initialPatient, doctor: initialDoctor } = route.params || {};
  
  const [patient, setPatient] = useState(initialPatient);
  const [doctor, setDoctor] = useState(initialDoctor);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dietPlanApproved, setDietPlanApproved] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  
  const patientName = patient?.fullName || patient?.name || 'Patient';

  // Fetch patient data and assigned doctor on mount
  useEffect(() => {
    loadPatientData();
  }, []);

  // Reload data when screen comes into focus (e.g., after completing assessment)
  useFocusEffect(
    React.useCallback(() => {
      if (patient?.uid) {
        loadPatientData();
      }
    }, [patient?.uid])
  );

  const loadPatientData = async () => {
    try {
      setLoading(true);
      
      // Fetch fresh patient data from Firestore
      if (patient?.uid) {
        const patientDoc = await getDoc(doc(db, 'patients', patient.uid));
        if (patientDoc.exists()) {
          const freshPatientData = { id: patientDoc.id, ...patientDoc.data() };
          setPatient(freshPatientData);
          
          // Fetch assigned doctor if exists
          if (freshPatientData.assignedDoctorId && !doctor) {
            const result = await getPatientDoctor(patient.uid);
            if (result.success && result.doctor) {
              setDoctor(result.doctor);
            }
          }

          // Check if diet plan is approved
          if (freshPatientData.hasDietPlan) {
            try {
              const dietPlan = await getDietPlan(patient.uid);
              if (dietPlan && dietPlan.approved) {
                setDietPlanApproved(true);
              } else {
                setDietPlanApproved(false);
              }
            } catch (error) {
              console.log('Could not fetch diet plan approval status');
              setDietPlanApproved(false);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
      Alert.alert('Error', 'Failed to load patient data. Using cached data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPatientData();
    setRefreshing(false);
  };

  const handleViewDietPlan = () => {
    if (!patient?.hasDietPlan) {
      Alert.alert('No Diet Plan', 'Your doctor has not created a diet plan for you yet.');
      return;
    }
    navigation.navigate('DietPlan', { 
      dosha: patient.dosha,
      patient,
      doctor,
      readOnly: true
    });
  };

  const handleTakePrakrutiTest = () => {
    Alert.alert(
      'Prakruti Assessment',
      'Complete your Ayurvedic constitution assessment. This will help your doctor create a personalized diet plan for you.',
      [
        {
          text: 'Start Assessment',
          onPress: () => navigation.navigate('PrakrutiTest', { 
            patient,
            doctor,
            fromPatientDashboard: true,
            role: 'patient'
          })
        },
        { text: 'Cancel' }
      ]
    );
  };

  const getDoshaInfo = (dosha) => {
    const doshaInfo = {
      vata: { color: '#8E44AD', title: 'Vata Constitution' },
      pitta: { color: '#E74C3C', title: 'Pitta Constitution' },
      kapha: { color: '#27AE60', title: 'Kapha Constitution' }
    };
    return doshaInfo[dosha] || { color: '#666', title: 'Unknown Constitution' };
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await signOutUser();
            if (result.success) {
              navigation.navigate('Login');
            } else {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  const renderDoctorInfo = () => {
    if (!doctor) {
      return (
        <View style={styles.doctorCard}>
          <Text style={styles.cardTitle}>Your Doctor</Text>
          <Text style={{ marginBottom: 12, color: '#666' }}>No doctor assigned yet.</Text>
          <TouchableOpacity style={styles.contactButton} onPress={() => navigation.navigate('SelectDoctor', { patient })}>
            <Ionicons name="person-add" size={16} color="#667eea" />
            <Text style={styles.contactText}>Select a Doctor</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.doctorCard}>
        <Text style={styles.cardTitle}>Your Doctor</Text>
        <View style={styles.doctorInfo}>
          <View style={styles.doctorAvatar}>
            <Ionicons name="medical" size={30} color="#667eea" />
          </View>
          <View style={styles.doctorDetails}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorSpecialization}>{doctor.specialization || ''}</Text>
            <Text style={styles.doctorExperience}>{doctor.yearsExperience || doctor.experience || ''} experience</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={() => setShowDoctorModal(true)}
        >
          <Ionicons name="call" size={16} color="#667eea" />
          <Text style={styles.contactText}>Contact Doctor</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHealthOverview = () => (
    <View style={styles.overviewCard}>
      <Text style={styles.cardTitle}>Health Overview</Text>
      
      {patient?.dosha && (
        <View style={[styles.doshaIndicator, { backgroundColor: getDoshaInfo(patient.dosha).color }]}>
          <Text style={styles.doshaTitle}>{getDoshaInfo(patient.dosha).title}</Text>
        </View>
      )}

      <View style={styles.progressGrid}>
        <View style={styles.progressItem}>
          <Ionicons name="scale" size={20} color="#667eea" />
          <Text style={styles.progressLabel}>Weight</Text>
          <Text style={styles.progressValue}>{patient?.weight || 'Not set'}</Text>
        </View>
        <View style={styles.progressItem}>
          <Ionicons name="leaf" size={20} color="#28a745" />
          <Text style={styles.progressLabel}>Diet Preference</Text>
          <Text style={styles.progressValue}>{patient?.dietaryPreference || 'Not set'}</Text>
        </View>
        <View style={styles.progressItem}>
          <Ionicons name="fitness" size={20} color="#E74C3C" />
          <Text style={styles.progressLabel}>Lifestyle</Text>
          <Text style={styles.progressValue}>{patient?.lifestyle || 'Not set'}</Text>
        </View>
        <View style={styles.progressItem}>
          <Ionicons name="medkit" size={20} color="#8E44AD" />
          <Text style={styles.progressLabel}>Conditions</Text>
          <Text style={styles.progressValue}>{patient?.medicalConditions || 'None'}</Text>
        </View>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.actionsCard}>
      <Text style={styles.cardTitle}>Quick Actions</Text>
      
      {!patient?.hasCompletedAssessment ? (
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryAction]}
          onPress={handleTakePrakrutiTest}
        >
          <Ionicons name="clipboard" size={24} color="#667eea" />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Complete Prakruti Assessment</Text>
            <Text style={styles.actionSubtitle}>Required: Take your constitution assessment first</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#667eea" />
        </TouchableOpacity>
      ) : (
        <>
          <View style={styles.completedAssessment}>
            <Ionicons name="checkmark-circle" size={24} color="#28a745" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Prakruti Assessment Complete</Text>
              <Text style={styles.actionSubtitle}>
                Constitution: {patient.dosha ? patient.dosha.charAt(0).toUpperCase() + patient.dosha.slice(1) : 'Unknown'}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleViewDietPlan}
          >
            <Ionicons name="nutrition" size={24} color={patient?.hasDietPlan ? "#28a745" : "#ccc"} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View Diet Plan</Text>
              <Text style={styles.actionSubtitle}>
                {patient?.hasDietPlan 
                  ? 'Access your personalized plan' 
                  : 'Waiting for doctor to create your plan'
                }
              </Text>
              {dietPlanApproved && (
                <View style={styles.approvalBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#28a745" />
                  <Text style={styles.approvalBadgeText}>Approved by Doctor</Text>
                </View>
              )}
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={patient?.hasDietPlan ? "#666" : "#ccc"} 
            />
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => {
          if (!doctor) {
            Alert.alert('No Doctor', 'Please select a doctor first to book an appointment');
            return;
          }
          navigation.navigate('AppointmentBooking', { patient, doctor });
        }}
      >
        <Ionicons name="calendar" size={24} color="#E74C3C" />
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Book Appointment</Text>
          <Text style={styles.actionSubtitle}>
            {patient?.nextAppointment ? `Next: ${patient.nextAppointment}` : 'Schedule your consultation'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="trending-up" size={24} color="#8E44AD" />
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Progress Tracking</Text>
          <Text style={styles.actionSubtitle}>View your health progress</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderDoctorDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showDoctorModal}
      onRequestClose={() => setShowDoctorModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Doctor Contact Details</Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowDoctorModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.modalDoctorInfo}>
              <View style={styles.modalDoctorAvatar}>
                <Ionicons name="medical" size={40} color="#667eea" />
              </View>
              <View>
                <Text style={styles.modalDoctorName}>{doctor?.name || 'N/A'}</Text>
                <Text style={styles.modalDoctorSpecialization}>
                  {doctor?.specialization || 'General Practitioner'}
                </Text>
              </View>
            </View>

            <View style={styles.modalInfoSection}>
              <View style={styles.modalInfoRow}>
                <Ionicons name="business" size={20} color="#667eea" />
                <View style={styles.modalInfoTextContainer}>
                  <Text style={styles.modalInfoLabel}>Clinic Name</Text>
                  <Text style={styles.modalInfoValue}>
                    {doctor?.clinicName || 'Not available'}
                  </Text>
                </View>
              </View>

              <View style={styles.modalInfoRow}>
                <Ionicons name="location" size={20} color="#E74C3C" />
                <View style={styles.modalInfoTextContainer}>
                  <Text style={styles.modalInfoLabel}>Address</Text>
                  <Text style={styles.modalInfoValue}>
                    {doctor?.address || 'Not available'}
                  </Text>
                </View>
              </View>

              <View style={styles.modalInfoRow}>
                <Ionicons name="cash" size={20} color="#28a745" />
                <View style={styles.modalInfoTextContainer}>
                  <Text style={styles.modalInfoLabel}>Consultation Fees</Text>
                  <Text style={styles.modalInfoValue}>
                    {doctor?.consultationFees ? `₹${doctor.consultationFees}` : 'Not available'}
                  </Text>
                </View>
              </View>

              {doctor?.mobile && (
                <View style={styles.modalInfoRow}>
                  <Ionicons name="call" size={20} color="#8E44AD" />
                  <View style={styles.modalInfoTextContainer}>
                    <Text style={styles.modalInfoLabel}>Phone</Text>
                    <Text style={styles.modalInfoValue}>{doctor.mobile}</Text>
                  </View>
                </View>
              )}

              {doctor?.availability && (
                <View style={styles.modalInfoRow}>
                  <Ionicons name="time" size={20} color="#FFA500" />
                  <View style={styles.modalInfoTextContainer}>
                    <Text style={styles.modalInfoLabel}>Availability</Text>
                    <Text style={styles.modalInfoValue}>{doctor.availability}</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.modalActionButtons}>
              <TouchableOpacity 
                style={styles.modalCallButton}
                onPress={() => {
                  setShowDoctorModal(false);
                  if (doctor?.mobile) {
                    Alert.alert('Call Doctor', `Calling ${doctor.mobile}...`);
                  } else {
                    Alert.alert('No Phone', 'Phone number not available');
                  }
                }}
              >
                <Ionicons name="call" size={20} color="white" />
                <Text style={styles.modalCallButtonText}>Call Now</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.modalBookButton}
                onPress={() => {
                  setShowDoctorModal(false);
                  navigation.navigate('AppointmentBooking', { patient, doctor });
                }}
              >
                <Ionicons name="calendar" size={20} color="white" />
                <Text style={styles.modalCallButtonText}>Book Appointment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.patientInfo}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.patientName}>{patientName}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <Ionicons name="refresh" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {renderDoctorInfo()}
          {renderHealthOverview()}
          {renderQuickActions()}
        </ScrollView>
      )}

      {renderDoctorDetailsModal()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 20,
  },
  patientInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  patientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  refreshButton: {
    padding: 10,
  },
  logoutButton: {
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  doctorCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  doctorSpecialization: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
    marginTop: 2,
  },
  doctorExperience: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f2f5',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  overviewCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  doshaIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  doshaTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  progressItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  primaryAction: {
    backgroundColor: '#f8f9ff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#667eea',
    borderBottomWidth: 1,
    borderBottomColor: '#667eea',
    alignSelf: 'stretch',
  },
  completedAssessment: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f8fff8',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#28a745',
  },
  actionContent: {
    flex: 1,
    marginLeft: 15,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  approvalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  approvalBadgeText: {
    fontSize: 11,
    color: '#28a745',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  modalDoctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  modalDoctorAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  modalDoctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalDoctorSpecialization: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
    marginTop: 4,
  },
  modalInfoSection: {
    marginBottom: 20,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingLeft: 5,
  },
  modalInfoTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  modalInfoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  modalInfoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalCallButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 15,
    borderRadius: 10,
    gap: 10,
  },
  modalBookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 10,
    gap: 10,
  },
  modalCallButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PatientDashboardScreen;
