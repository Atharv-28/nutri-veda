import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { signOutUser } from '../services/authService';
import { getDietPlan } from '../services/relationshipService';

const DoctorDashboardScreen = ({ route, navigation }) => {
  const { doctor } = route.params;
  const [activeTab, setActiveTab] = useState('patients');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  // Reload when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadPatients();
    }, [doctor.uid])
  );

  const loadPatients = async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching patients for doctor:', doctor.uid);

      // Query patients where assignedDoctorId matches this doctor
      const patientsQuery = query(
        collection(db, 'patients'),
        where('assignedDoctorId', '==', doctor.uid)
      );

      const querySnapshot = await getDocs(patientsQuery);
      const patientsData = [];

      for (const docSnap of querySnapshot.docs) {
        const patientData = { id: docSnap.id, ...docSnap.data() };
        
        // Fetch diet plan info for each patient
        if (patientData.hasDietPlan) {
          try {
            const dietPlan = await getDietPlan(patientData.uid || docSnap.id);
            patientData.dietPlanApproved = dietPlan?.approved || false;
            patientData.dietPlanId = dietPlan?.id || null;
          } catch (error) {
            console.log('No diet plan found for patient:', patientData.uid);
            patientData.dietPlanApproved = false;
          }
        }

        patientsData.push(patientData);
      }

      console.log('✅ Loaded', patientsData.length, 'patients');
      setPatients(patientsData);
    } catch (error) {
      console.error('❌ Error loading patients:', error);
      Alert.alert('Error', 'Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPatients();
  };

  const handleApproveDietPlan = async (patient) => {
    Alert.alert(
      'Approve Diet Plan',
      `Are you sure you want to approve the AI-generated diet plan for ${patient.fullName || patient.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              // Update diet plan document to mark as approved
              if (patient.dietPlanId) {
                await updateDoc(doc(db, 'dietPlans', patient.dietPlanId), {
                  approved: true,
                  approvedBy: doctor.uid,
                  approvedByName: doctor.name,
                  approvedAt: new Date().toISOString()
                });

                Alert.alert('Success', 'Diet plan approved successfully!');
                loadPatients(); // Refresh the list
              } else {
                Alert.alert('Error', 'Diet plan not found');
              }
            } catch (error) {
              console.error('Error approving diet plan:', error);
              Alert.alert('Error', 'Failed to approve diet plan');
            }
          }
        }
      ]
    );
  };

  const handleCreateDietPlan = (patient) => {
    if (!patient.dosha) {
      Alert.alert(
        'Prakruti Assessment Required',
        'Patient needs to complete Prakruti assessment first.',
        [
          {
            text: 'Start Assessment',
            onPress: () => navigation.navigate('PrakrutiTest', { 
              patient,
              doctor,
              isForPatient: true,
              role: 'doctor'
            })
          },
          { text: 'Cancel' }
        ]
      );
    } else {
      navigation.navigate('CreateDietPlan', { patient, doctor });
    }
  };

  const handleViewDietPlan = (patient) => {
    // Navigate to view-only diet plan screen
    navigation.navigate('DietPlan', { 
      dosha: patient.dosha,
      patient,
      doctor,
      readOnly: true
    });
  };

  const handleEditDietPlan = (patient) => {
    // Navigate to edit screen for doctors
    navigation.navigate('EditDietPlan', { 
      patient,
      doctor
    });
  };

  const renderPatientCard = ({ item: patient }) => (
    <View style={styles.patientCard}>
      <View style={styles.patientHeader}>
        <View style={styles.patientAvatar}>
          <Ionicons name="person" size={24} color="#667eea" />
        </View>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patient.fullName || patient.name}</Text>
          <Text style={styles.patientAge}>Age: {patient.age || 'N/A'}</Text>
          <Text style={[styles.patientStatus, { color: patient.hasCompletedAssessment ? '#28a745' : '#ff6b6b' }]}>
            {patient.hasCompletedAssessment ? 'Active' : 'New'}
          </Text>
        </View>
        <View style={styles.patientMeta}>
          {patient.dosha && (
            <View style={[styles.doshaTag, { backgroundColor: getDoshaColor(patient.dosha) }]}>
              <Text style={styles.doshaText}>{patient.dosha.toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.lastVisit}>
            {patient.lastAssessmentDate 
              ? `Last: ${new Date(patient.lastAssessmentDate).toLocaleDateString()}` 
              : 'No assessment'}
          </Text>
        </View>
      </View>

      <View style={styles.patientActions}>
        {patient.hasDietPlan ? (
          <>
            <TouchableOpacity
              style={styles.viewPlanButton}
              onPress={() => handleViewDietPlan(patient)}
            >
              <Ionicons name="eye" size={16} color="#667eea" />
              <Text style={styles.viewPlanText}>View Plan</Text>
            </TouchableOpacity>
            
            {!patient.dietPlanApproved && (
              <TouchableOpacity
                style={styles.approveButton}
                onPress={() => handleApproveDietPlan(patient)}
              >
                <Ionicons name="checkmark-circle" size={16} color="white" />
                <Text style={styles.approveText}>Approve</Text>
              </TouchableOpacity>
            )}
            
            {patient.dietPlanApproved && (
              <View style={styles.approvedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                <Text style={styles.approvedText}>Approved</Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditDietPlan(patient)}
            >
              <Ionicons name="create" size={16} color="#666" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.createPlanButton}
            onPress={() => handleCreateDietPlan(patient)}
          >
            <Ionicons name="add" size={16} color="white" />
            <Text style={styles.createPlanText}>Create Diet Plan</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const getDoshaColor = (dosha) => {
    const colors = {
      vata: '#8E44AD',
      pitta: '#E74C3C',
      kapha: '#27AE60'
    };
    return colors[dosha] || '#666';
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

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Ionicons name="people" size={24} color="#667eea" />
        <Text style={styles.statNumber}>{patients.length}</Text>
        <Text style={styles.statLabel}>Total Patients</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="checkmark-circle" size={24} color="#28a745" />
        <Text style={styles.statNumber}>{patients.filter(p => p.hasDietPlan).length}</Text>
        <Text style={styles.statLabel}>Active Plans</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="add-circle" size={24} color="#ff6b6b" />
        <Text style={styles.statNumber}>{patients.filter(p => !p.hasDietPlan).length}</Text>
        <Text style={styles.statLabel}>Pending Plans</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.doctorInfo}>
          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorSpecialization}>{doctor.specialization}</Text>
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

      {renderStats()}

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'patients' && styles.activeTab]}
          onPress={() => setActiveTab('patients')}
        >
          <Text style={[styles.tabText, activeTab === 'patients' && styles.activeTabText]}>
            My Patients
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
          onPress={() => setActiveTab('schedule')}
        >
          <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>
            Schedule
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Loading patients...</Text>
          </View>
        ) : activeTab === 'patients' ? (
          patients.length > 0 ? (
            <FlatList
              data={patients}
              renderItem={renderPatientCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.patientsList}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No patients assigned yet</Text>
              <Text style={styles.emptySubtext}>Patients will appear here when they select you as their doctor</Text>
            </View>
          )
        ) : (
          <View style={styles.scheduleContainer}>
            <Text style={styles.scheduleText}>Schedule functionality coming soon!</Text>
          </View>
        )}
      </View>
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
  doctorInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  doctorSpecialization: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#667eea',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  patientsList: {
    padding: 20,
  },
  patientCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  patientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  patientAge: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  patientStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  patientMeta: {
    alignItems: 'flex-end',
  },
  doshaTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 5,
  },
  doshaText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  lastVisit: {
    fontSize: 12,
    color: '#666',
  },
  patientActions: {
    flexDirection: 'row',
    gap: 10,
  },
  createPlanButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  createPlanText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  viewPlanButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  viewPlanText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  approveButton: {
    flexDirection: 'row',
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  approveText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  approvedBadge: {
    flexDirection: 'row',
    backgroundColor: '#d4edda',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  approvedText: {
    color: '#28a745',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  scheduleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleText: {
    fontSize: 18,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DoctorDashboardScreen;
