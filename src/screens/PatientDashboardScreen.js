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
import { signOutUser } from '../services/authService';

const PatientDashboardScreen = ({ route, navigation }) => {
  const { patient, doctor } = route.params || {};
  
  const patientName = patient?.name || 'Patient';

  // Mock patient diet plan data
  const patientData = {
    dosha: null, // No assessment completed initially
    hasCompletedAssessment: false, // Track if patient completed assessment
    hasDietPlan: false, // Doctor hasn't created plan yet
    lastUpdated: null,
    nextAppointment: '2025-10-05',
    progress: {
      weight: '72 kg',
      energy: 'Baseline',
      digestion: 'Normal',
      sleep: 'Average'
    }
  };

  const handleViewDietPlan = () => {
    if (!patientData.hasDietPlan) {
      Alert.alert('No Diet Plan', 'Your doctor has not created a diet plan for you yet.');
      return;
    }
    navigation.navigate('DietPlan', { 
      dosha: patientData.dosha,
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
        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="call" size={16} color="#667eea" />
          <Text style={styles.contactText}>Contact Doctor</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHealthOverview = () => (
    <View style={styles.overviewCard}>
      <Text style={styles.cardTitle}>Health Overview</Text>
      
      {patientData.dosha && (
        <View style={[styles.doshaIndicator, { backgroundColor: getDoshaInfo(patientData.dosha).color }]}>
          <Text style={styles.doshaTitle}>{getDoshaInfo(patientData.dosha).title}</Text>
        </View>
      )}

      <View style={styles.progressGrid}>
        <View style={styles.progressItem}>
          <Ionicons name="scale" size={20} color="#667eea" />
          <Text style={styles.progressLabel}>Weight</Text>
          <Text style={styles.progressValue}>{patientData.progress.weight}</Text>
        </View>
        <View style={styles.progressItem}>
          <Ionicons name="flash" size={20} color="#ffa500" />
          <Text style={styles.progressLabel}>Energy</Text>
          <Text style={styles.progressValue}>{patientData.progress.energy}</Text>
        </View>
        <View style={styles.progressItem}>
          <Ionicons name="restaurant" size={20} color="#28a745" />
          <Text style={styles.progressLabel}>Digestion</Text>
          <Text style={styles.progressValue}>{patientData.progress.digestion}</Text>
        </View>
        <View style={styles.progressItem}>
          <Ionicons name="bed" size={20} color="#8E44AD" />
          <Text style={styles.progressLabel}>Sleep</Text>
          <Text style={styles.progressValue}>{patientData.progress.sleep}</Text>
        </View>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.actionsCard}>
      <Text style={styles.cardTitle}>Quick Actions</Text>
      
      {!patientData.hasCompletedAssessment ? (
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
                Constitution: {patientData.dosha ? patientData.dosha.charAt(0).toUpperCase() + patientData.dosha.slice(1) : 'Unknown'}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleViewDietPlan}
          >
            <Ionicons name="nutrition" size={24} color={patientData.hasDietPlan ? "#28a745" : "#ccc"} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View Diet Plan</Text>
              <Text style={styles.actionSubtitle}>
                {patientData.hasDietPlan 
                  ? 'Access your personalized plan' 
                  : 'Waiting for doctor to create your plan'
                }
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={patientData.hasDietPlan ? "#666" : "#ccc"} 
            />
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="calendar" size={24} color="#E74C3C" />
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Next Appointment</Text>
          <Text style={styles.actionSubtitle}>
            {patientData.nextAppointment ? patientData.nextAppointment : 'Not scheduled'}
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

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.patientInfo}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.patientName}>{patientName}</Text>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderDoctorInfo()}
        {renderHealthOverview()}
        {renderQuickActions()}
      </ScrollView>
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
  logoutButton: {
    padding: 10,
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
});

export default PatientDashboardScreen;
