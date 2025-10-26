import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { linkPatientToDoctor } from '../services/relationshipService';

const SelectDoctorScreen = ({ route, navigation }) => {
  const { patient } = route.params;
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching doctors from Firestore...');
      
      // Fetch all doctors from Firestore
      const doctorsQuery = query(
        collection(db, 'doctors'),
        orderBy('createdAt', 'desc'),
        limit(50) // Limit to 50 doctors for performance
      );
      
      const doctorsSnapshot = await getDocs(doctorsQuery);
      const doctorsList = [];
      
      doctorsSnapshot.forEach((doc) => {
        doctorsList.push({
          id: doc.id,
          uid: doc.id,
          ...doc.data()
        });
      });

      console.log(`✅ Loaded ${doctorsList.length} doctors`);
      setDoctors(doctorsList);

      if (doctorsList.length === 0) {
        Alert.alert(
          'No Doctors Available',
          'There are currently no doctors registered in the system. Please try again later.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('❌ Error loading doctors:', error);
      Alert.alert('Error', 'Failed to load doctors. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDoctor = async () => {
    if (!selectedDoctor) {
      Alert.alert('Error', 'Please select a doctor');
      return;
    }

    setAssigning(true);

    try {
      console.log('🔗 Linking patient to doctor...');
      
      // Link patient to doctor in Firestore
      const result = await linkPatientToDoctor(patient.uid, {
        uid: selectedDoctor.uid,
        name: selectedDoctor.name || selectedDoctor.fullName,
        specialization: selectedDoctor.specialization || 'Ayurveda'
      });

      if (result.success) {
        Alert.alert(
          'Success',
          `You have been assigned to ${selectedDoctor.name || selectedDoctor.fullName}. You can now access your personalized diet plan.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('PatientDashboard', { 
                patient: { 
                  ...patient, 
                  assignedDoctorId: selectedDoctor.uid,
                  assignedDoctorName: selectedDoctor.name || selectedDoctor.fullName,
                  assignedDoctorSpecialization: selectedDoctor.specialization
                },
                doctor: selectedDoctor
              })
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to assign doctor. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error assigning doctor:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  const renderDoctorCard = (doctor) => {
    const doctorName = doctor.name || doctor.fullName || 'Unknown Doctor';
    const doctorSpecialization = doctor.specialization || 'Ayurveda';
    const doctorExperience = doctor.experience || doctor.yearsExperience || 'Not specified';
    const patientCount = doctor.patients?.length || 0;
    
    return (
      <TouchableOpacity
        key={doctor.id}
        style={[
          styles.doctorCard,
          selectedDoctor?.id === doctor.id && styles.selectedDoctorCard
        ]}
        onPress={() => setSelectedDoctor(doctor)}
      >
        <View style={styles.doctorHeader}>
          <View style={styles.doctorAvatar}>
            <Ionicons name="person" size={30} color="#667eea" />
          </View>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctorName}</Text>
            <Text style={styles.doctorSpecialization}>{doctorSpecialization}</Text>
            <Text style={styles.doctorExperience}>{doctorExperience}</Text>
          </View>
          {selectedDoctor?.id === doctor.id && (
            <Ionicons name="checkmark-circle" size={24} color="#28a745" />
          )}
        </View>

        <View style={styles.doctorStats}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={16} color="#667eea" />
            <Text style={styles.statText}>{patientCount} patients</Text>
          </View>
          {doctor.registrationNumber && (
            <View style={styles.statItem}>
              <Ionicons name="shield-checkmark" size={16} color="#28a745" />
              <Text style={styles.statText}>Verified</Text>
            </View>
          )}
        </View>

        {doctor.qualification && (
          <Text style={styles.doctorDescription}>
            {doctor.qualification}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Your Doctor</Text>
        <Text style={styles.headerSubtitle}>
          Welcome {patient?.fullName || patient?.name || 'Patient'}! Choose a doctor to get your personalized diet plan.
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading doctors...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {doctors.map(renderDoctorCard)}

          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!selectedDoctor || assigning) && styles.disabledButton
            ]}
            onPress={handleSelectDoctor}
            disabled={!selectedDoctor || assigning}
          >
            {assigning ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.confirmButtonText}>
                {selectedDoctor ? `Select ${selectedDoctor.name || selectedDoctor.fullName}` : 'Select a Doctor'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 60,
    zIndex: 10,
    padding: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
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
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDoctorCard: {
    borderColor: '#28a745',
    backgroundColor: '#f8fff8',
  },
  doctorHeader: {
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
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
    marginBottom: 2,
  },
  doctorExperience: {
    fontSize: 12,
    color: '#666',
  },
  doctorStats: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  doctorDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SelectDoctorScreen;
