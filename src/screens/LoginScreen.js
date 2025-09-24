import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
  const [userType, setUserType] = useState(null);

  // Mock user data for demo
  const mockUsers = {
    doctors: [
      { id: 1, name: 'Dr. Rajesh Sharma', specialization: 'Ayurveda', experience: '15 years' },
      { id: 2, name: 'Dr. Priya Patel', specialization: 'Nutrition', experience: '12 years' },
      { id: 3, name: 'Dr. Amit Gupta', specialization: 'Panchakarma', experience: '20 years' },
    ],
    patients: [
      { id: 1, name: 'Ravi Kumar', age: 35, doctorId: 1 },
      { id: 2, name: 'Priya Singh', age: 28, doctorId: 2 },
      { id: 3, name: 'Amit Joshi', age: 42, doctorId: null }, // No doctor assigned
    ]
  };

  const handleLogin = () => {
    if (!userType) {
      Alert.alert('Error', 'Please select user type (Doctor or Patient)');
      return;
    }

    // For demo purposes, use the first user of selected type
    if (userType === 'doctor') {
      const doctor = mockUsers.doctors[0]; // Use first doctor for demo
      navigation.navigate('DoctorDashboard', { doctor });
    } else {
      const patient = mockUsers.patients[2]; // Use patient without doctor for demo
      if (!patient.doctorId) {
        // Patient needs to select a doctor first
        navigation.navigate('SelectDoctor', { patient });
      } else {
        const doctor = mockUsers.doctors.find(d => d.id === patient.doctorId);
        navigation.navigate('PatientDashboard', { patient, doctor });
      }
    }
  };

  const renderUserTypeSelection = () => (
    <View style={styles.userTypeContainer}>
      <Text style={styles.selectText}>Select User Type</Text>
      
      <TouchableOpacity
        style={[
          styles.userTypeButton,
          userType === 'doctor' && styles.selectedUserType
        ]}
        onPress={() => setUserType('doctor')}
      >
        <Ionicons 
          name="medical" 
          size={40} 
          color={userType === 'doctor' ? 'white' : '#667eea'} 
        />
        <Text style={[
          styles.userTypeText,
          userType === 'doctor' && styles.selectedUserTypeText
        ]}>
          Doctor
        </Text>
        <Text style={[
          styles.userTypeDesc,
          userType === 'doctor' && styles.selectedUserTypeDesc
        ]}>
          Create and manage patient diet plans
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.userTypeButton,
          userType === 'patient' && styles.selectedUserType
        ]}
        onPress={() => setUserType('patient')}
      >
        <Ionicons 
          name="person" 
          size={40} 
          color={userType === 'patient' ? 'white' : '#667eea'} 
        />
        <Text style={[
          styles.userTypeText,
          userType === 'patient' && styles.selectedUserTypeText
        ]}>
          Patient
        </Text>
        <Text style={[
          styles.userTypeDesc,
          userType === 'patient' && styles.selectedUserTypeDesc
        ]}>
          Access your personalized diet plan
        </Text>
      </TouchableOpacity>

      {userType && (
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>
            Continue as {userType === 'doctor' ? 'Doctor' : 'Patient'}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.demoContainer}>
        <Text style={styles.demoTitle}>🎯 Demo Mode</Text>
        <Text style={styles.demoText}>
          {userType === 'doctor' 
            ? 'Login as Dr. Rajesh Sharma to manage patients and create diet plans'
            : userType === 'patient'
            ? 'Login as Amit Joshi - you will need to select a doctor first'
            : 'Select Doctor or Patient to continue with the demo'
          }
        </Text>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>NutriVeda</Text>
        <Text style={styles.subtitle}>Ayurvedic Diet Management</Text>
      </View>

      <View style={styles.content}>
        {renderUserTypeSelection()}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
  },
  userTypeContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  selectText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
  },
  userTypeButton: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectedUserType: {
    backgroundColor: '#667eea',
  },
  userTypeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  selectedUserTypeText: {
    color: 'white',
  },
  userTypeDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  selectedUserTypeDesc: {
    color: 'rgba(255,255,255,0.8)',
  },
  loginButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  demoContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
    marginTop: 30,
  },
  demoTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  demoText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LoginScreen;
