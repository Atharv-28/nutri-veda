import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const SelectDoctorScreen = ({ route, navigation }) => {
  const { patient } = route.params;
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const doctors = [
    { 
      id: 1, 
      name: 'Dr. Rajesh Sharma', 
      specialization: 'Ayurveda', 
      experience: '15 years',
      rating: 4.8,
      patients: 120,
      description: 'Expert in traditional Ayurvedic medicine and Panchakarma treatments.'
    },
    { 
      id: 2, 
      name: 'Dr. Priya Patel', 
      specialization: 'Nutrition', 
      experience: '12 years',
      rating: 4.9,
      patients: 95,
      description: 'Specialized in Ayurvedic nutrition and dietary counseling.'
    },
    { 
      id: 3, 
      name: 'Dr. Amit Gupta', 
      specialization: 'Panchakarma', 
      experience: '20 years',
      rating: 4.7,
      patients: 150,
      description: 'Leading expert in Panchakarma detoxification therapies.'
    },
  ];

  const handleSelectDoctor = () => {
    if (!selectedDoctor) {
      Alert.alert('Error', 'Please select a doctor');
      return;
    }

    // In a real app, this would update the patient's assigned doctor in the database
    Alert.alert(
      'Success',
      `You have been assigned to ${selectedDoctor.name}. You can now access your personalized diet plan.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('PatientDashboard', { 
            patient: { ...patient, doctorId: selectedDoctor.id },
            doctor: selectedDoctor
          })
        }
      ]
    );
  };

  const renderDoctorCard = (doctor) => (
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
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorSpecialization}>{doctor.specialization}</Text>
          <Text style={styles.doctorExperience}>{doctor.experience} experience</Text>
        </View>
        {selectedDoctor?.id === doctor.id && (
          <Ionicons name="checkmark-circle" size={24} color="#28a745" />
        )}
      </View>

      <View style={styles.doctorStats}>
        <View style={styles.statItem}>
          <Ionicons name="star" size={16} color="#ffa500" />
          <Text style={styles.statText}>{doctor.rating}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="people" size={16} color="#667eea" />
          <Text style={styles.statText}>{doctor.patients} patients</Text>
        </View>
      </View>

      <Text style={styles.doctorDescription}>{doctor.description}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Your Doctor</Text>
        <Text style={styles.headerSubtitle}>
          Welcome {patient.name}! Choose a doctor to get your personalized diet plan.
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {doctors.map(renderDoctorCard)}

        <TouchableOpacity
          style={[
            styles.confirmButton,
            !selectedDoctor && styles.disabledButton
          ]}
          onPress={handleSelectDoctor}
          disabled={!selectedDoctor}
        >
          <Text style={styles.confirmButtonText}>
            {selectedDoctor ? `Select ${selectedDoctor.name}` : 'Select a Doctor'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
