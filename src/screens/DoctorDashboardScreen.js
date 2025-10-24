import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { signOutUser } from '../services/authService';

const DoctorDashboardScreen = ({ route, navigation }) => {
  const { doctor } = route.params;
  const [activeTab, setActiveTab] = useState('patients');

  // Mock patient data
  const patients = [
    { 
      id: 1, 
      name: 'Ravi Kumar', 
      age: 35, 
      dosha: 'vata',
      lastVisit: '2025-09-20',
      hasDietPlan: true,
      status: 'Active'
    },
    { 
      id: 2, 
      name: 'Priya Singh', 
      age: 28, 
      dosha: 'pitta',
      lastVisit: '2025-09-18',
      hasDietPlan: true,
      status: 'Active'
    },
    { 
      id: 3, 
      name: 'Amit Joshi', 
      age: 42, 
      dosha: null,
      lastVisit: null,
      hasDietPlan: false,
      status: 'New'
    },
  ];

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
    navigation.navigate('DietPlan', { 
      dosha: patient.dosha,
      patient,
      doctor,
      readOnly: false
    });
  };

  const renderPatientCard = ({ item: patient }) => (
    <View style={styles.patientCard}>
      <View style={styles.patientHeader}>
        <View style={styles.patientAvatar}>
          <Ionicons name="person" size={24} color="#667eea" />
        </View>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.patientAge}>Age: {patient.age}</Text>
          <Text style={[styles.patientStatus, { color: patient.status === 'New' ? '#ff6b6b' : '#28a745' }]}>
            {patient.status}
          </Text>
        </View>
        <View style={styles.patientMeta}>
          {patient.dosha && (
            <View style={[styles.doshaTag, { backgroundColor: getDoshaColor(patient.dosha) }]}>
              <Text style={styles.doshaText}>{patient.dosha.toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.lastVisit}>
            {patient.lastVisit ? `Last: ${patient.lastVisit}` : 'No visits'}
          </Text>
        </View>
      </View>

      <View style={styles.patientActions}>
        {patient.hasDietPlan ? (
          <TouchableOpacity
            style={styles.viewPlanButton}
            onPress={() => handleViewDietPlan(patient)}
          >
            <Ionicons name="eye" size={16} color="#667eea" />
            <Text style={styles.viewPlanText}>View Diet Plan</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.createPlanButton}
            onPress={() => handleCreateDietPlan(patient)}
          >
            <Ionicons name="add" size={16} color="white" />
            <Text style={styles.createPlanText}>Create Diet Plan</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => Alert.alert('Info', 'Edit patient functionality')}
        >
          <Ionicons name="create" size={16} color="#666" />
        </TouchableOpacity>
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
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={24} color="white" />
        </TouchableOpacity>
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
        {activeTab === 'patients' ? (
          <FlatList
            data={patients}
            renderItem={renderPatientCard}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.patientsList}
          />
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
});

export default DoctorDashboardScreen;
