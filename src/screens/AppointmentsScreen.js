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
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const AppointmentsScreen = ({ route, navigation }) => {
  const { doctor } = route.params;
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past

  useEffect(() => {
    loadAppointments();
  }, [activeTab]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      console.log('📅 Fetching appointments for doctor:', doctor.uid);

      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('doctorId', '==', doctor.uid)
      );

      const querySnapshot = await getDocs(appointmentsQuery);
      const appointmentsData = [];

      querySnapshot.forEach((docSnap) => {
        const appointmentData = { id: docSnap.id, ...docSnap.data() };
        appointmentsData.push(appointmentData);
      });

      // Sort by date
      appointmentsData.sort((a, b) => {
        const dateA = new Date(a.appointmentDate);
        const dateB = new Date(b.appointmentDate);
        return activeTab === 'upcoming' ? dateA - dateB : dateB - dateA;
      });

      // Filter based on tab
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const filtered = appointmentsData.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        aptDate.setHours(0, 0, 0, 0);
        
        if (activeTab === 'upcoming') {
          return aptDate >= today && apt.status !== 'cancelled';
        } else {
          return aptDate < today || apt.status === 'completed' || apt.status === 'cancelled';
        }
      });

      console.log('✅ Loaded', filtered.length, 'appointments');
      setAppointments(filtered);
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
      Alert.alert('Error', 'Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointment) => {
    Alert.alert(
      'Confirm Appointment',
      `Confirm appointment with ${appointment.patientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'appointments', appointment.id), {
                status: 'confirmed',
                confirmedAt: new Date().toISOString()
              });
              Alert.alert('Success', 'Appointment confirmed!');
              loadAppointments();
            } catch (error) {
              console.error('Error confirming appointment:', error);
              Alert.alert('Error', 'Failed to confirm appointment');
            }
          }
        }
      ]
    );
  };

  const handleCancelAppointment = async (appointment) => {
    Alert.alert(
      'Cancel Appointment',
      `Are you sure you want to cancel this appointment with ${appointment.patientName}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'appointments', appointment.id), {
                status: 'cancelled',
                cancelledAt: new Date().toISOString(),
                cancelledBy: 'doctor'
              });
              Alert.alert('Success', 'Appointment cancelled');
              loadAppointments();
            } catch (error) {
              console.error('Error cancelling appointment:', error);
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          }
        }
      ]
    );
  };

  const handleCompleteAppointment = async (appointment) => {
    Alert.alert(
      'Mark as Completed',
      `Mark appointment with ${appointment.patientName} as completed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'appointments', appointment.id), {
                status: 'completed',
                completedAt: new Date().toISOString()
              });
              Alert.alert('Success', 'Appointment marked as completed!');
              loadAppointments();
            } catch (error) {
              console.error('Error completing appointment:', error);
              Alert.alert('Error', 'Failed to update appointment');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      confirmed: '#28a745',
      completed: '#667eea',
      cancelled: '#E74C3C'
    };
    return colors[status] || '#666';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'time',
      confirmed: 'checkmark-circle',
      completed: 'checkmark-done-circle',
      cancelled: 'close-circle'
    };
    return icons[status] || 'help-circle';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const renderAppointmentCard = ({ item: appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.patientInfo}>
          <View style={styles.patientAvatar}>
            <Ionicons name="person" size={24} color="#667eea" />
          </View>
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>{appointment.patientName}</Text>
            <Text style={styles.appointmentReason}>{appointment.reasonLabel}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
          <Ionicons name={getStatusIcon(appointment.status)} size={14} color="white" />
          <Text style={styles.statusText}>{appointment.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>{formatDate(appointment.appointmentDate)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={styles.detailText}>{appointment.appointmentTime}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.detailText}>
            {appointment.clinicName} - Offline
          </Text>
        </View>
      </View>

      {activeTab === 'upcoming' && appointment.status === 'pending' && (
        <View style={styles.appointmentActions}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => handleConfirmAppointment(appointment)}
          >
            <Ionicons name="checkmark" size={18} color="white" />
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelAppointment(appointment)}
          >
            <Ionicons name="close" size={18} color="#E74C3C" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'upcoming' && appointment.status === 'confirmed' && (
        <View style={styles.appointmentActions}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => handleCompleteAppointment(appointment)}
          >
            <Ionicons name="checkmark-done" size={18} color="white" />
            <Text style={styles.confirmButtonText}>Mark Completed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelAppointment(appointment)}
          >
            <Ionicons name="close" size={18} color="#E74C3C" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointments</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadAppointments}
        >
          <Ionicons name="refresh" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Loading appointments...</Text>
          </View>
        ) : appointments.length > 0 ? (
          <FlatList
            data={appointments}
            renderItem={renderAppointmentCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.appointmentsList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'upcoming' 
                ? 'Appointments booked by patients will appear here'
                : 'Completed and cancelled appointments will appear here'
              }
            </Text>
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
    paddingTop: 40,
  },
  backButton: {
    padding: 8,
  },
  refreshButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
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
  appointmentsList: {
    padding: 20,
  },
  appointmentCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  patientInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  patientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  appointmentReason: {
    fontSize: 14,
    color: '#667eea',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  appointmentDetails: {
    gap: 10,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#28a745',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#667eea',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  cancelButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  cancelButtonText: {
    color: '#E74C3C',
    fontSize: 14,
    fontWeight: '600',
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

export default AppointmentsScreen;
