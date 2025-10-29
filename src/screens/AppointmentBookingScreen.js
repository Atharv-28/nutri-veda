import React, { useState } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const AppointmentBookingScreen = ({ route, navigation }) => {
  const { patient, doctor } = route.params;
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Available time slots
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
    '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'
  ];

  // Appointment reasons
  const appointmentReasons = [
    { id: 'consultation', label: 'Initial Consultation', icon: 'medical' },
    { id: 'followup', label: 'Follow-up Visit', icon: 'repeat' },
    { id: 'dietplan', label: 'Diet Plan Discussion', icon: 'nutrition' },
    { id: 'assessment', label: 'Health Assessment', icon: 'clipboard' },
    { id: 'other', label: 'Other', icon: 'ellipsis-horizontal' }
  ];

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatDateShort = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      // Ensure date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date >= today) {
        setSelectedDate(date);
      } else {
        Alert.alert('Invalid Date', 'Please select a future date');
      }
    }
  };

  const handleBookAppointment = () => {
    // Validation
    if (!selectedTime) {
      Alert.alert('Select Time', 'Please select a time slot for your appointment');
      return;
    }
    if (!selectedReason) {
      Alert.alert('Select Reason', 'Please select a reason for your visit');
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const confirmBooking = async () => {
    try {
      setLoading(true);
      setShowConfirmModal(false);

      const appointmentData = {
        patientId: patient.uid,
        patientName: patient.fullName || patient.name,
        patientEmail: patient.email,
        patientMobile: patient.mobile,
        doctorId: doctor.uid,
        doctorName: doctor.name,
        doctorSpecialization: doctor.specialization,
        clinicName: doctor.clinicName || 'Doctor\'s Clinic',
        clinicAddress: doctor.address || 'Address not provided',
        appointmentDate: selectedDate.toISOString().split('T')[0],
        appointmentTime: selectedTime,
        reason: selectedReason,
        reasonLabel: appointmentReasons.find(r => r.id === selectedReason)?.label || selectedReason,
        status: 'pending', // pending, confirmed, completed, cancelled
        type: 'offline', // offline appointment at clinic
        consultationFees: doctor.consultationFees || 'Not specified',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: `Offline appointment at ${doctor.clinicName || 'doctor\'s clinic'}`
      };

      // Add appointment to Firestore
      const appointmentRef = await addDoc(collection(db, 'appointments'), appointmentData);

      // Update patient document with next appointment
      const appointmentDateTime = `${formatDateShort(selectedDate)} at ${selectedTime}`;
      await updateDoc(doc(db, 'patients', patient.uid), {
        nextAppointment: appointmentDateTime,
        lastUpdated: new Date().toISOString()
      });

      setLoading(false);

      Alert.alert(
        'Appointment Booked! 🎉',
        `Your appointment with Dr. ${doctor.name} has been scheduled for ${formatDateShort(selectedDate)} at ${selectedTime}.\n\nLocation: ${doctor.clinicName || 'Doctor\'s Clinic'}\nAddress: ${doctor.address || 'Please contact doctor for address'}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      setLoading(false);
      console.error('Error booking appointment:', error);
      Alert.alert('Error', 'Failed to book appointment. Please try again.');
    }
  };

  const renderConfirmationModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showConfirmModal}
      onRequestClose={() => setShowConfirmModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.confirmModalContent}>
          <View style={styles.confirmHeader}>
            <Ionicons name="calendar-sharp" size={40} color="#667eea" />
            <Text style={styles.confirmTitle}>Confirm Appointment</Text>
          </View>

          <View style={styles.confirmBody}>
            <View style={styles.offlineNotice}>
              <Ionicons name="location" size={24} color="#E74C3C" />
              <View style={styles.offlineNoticeText}>
                <Text style={styles.offlineNoticeTitle}>Offline Appointment</Text>
                <Text style={styles.offlineNoticeSubtitle}>
                  This is an in-person appointment at the doctor's clinic. Please arrive on time.
                </Text>
              </View>
            </View>

            <View style={styles.confirmSection}>
              <Text style={styles.confirmLabel}>Doctor</Text>
              <Text style={styles.confirmValue}>Dr. {doctor.name}</Text>
              <Text style={styles.confirmSubValue}>{doctor.specialization}</Text>
            </View>

            <View style={styles.confirmSection}>
              <Text style={styles.confirmLabel}>Date & Time</Text>
              <Text style={styles.confirmValue}>{formatDateShort(selectedDate)}</Text>
              <Text style={styles.confirmSubValue}>{selectedTime}</Text>
            </View>

            <View style={styles.confirmSection}>
              <Text style={styles.confirmLabel}>Reason</Text>
              <Text style={styles.confirmValue}>
                {appointmentReasons.find(r => r.id === selectedReason)?.label}
              </Text>
            </View>

            <View style={styles.confirmSection}>
              <Text style={styles.confirmLabel}>Clinic Location</Text>
              <Text style={styles.confirmValue}>{doctor.clinicName || 'Doctor\'s Clinic'}</Text>
              <Text style={styles.confirmSubValue}>{doctor.address || 'Address not provided'}</Text>
            </View>

            <View style={styles.confirmSection}>
              <Text style={styles.confirmLabel}>Consultation Fees</Text>
              <Text style={styles.confirmValue}>
                {doctor.consultationFees ? `₹${doctor.consultationFees}` : 'Not specified'}
              </Text>
            </View>
          </View>

          <View style={styles.confirmActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowConfirmModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmBooking}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Booking</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Doctor Info Card */}
        <View style={styles.doctorCard}>
          <View style={styles.doctorAvatar}>
            <Ionicons name="medical" size={40} color="#667eea" />
          </View>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>Dr. {doctor.name}</Text>
            <Text style={styles.doctorSpecialization}>{doctor.specialization}</Text>
            <View style={styles.doctorMeta}>
              <Ionicons name="location" size={14} color="#666" />
              <Text style={styles.doctorMetaText}>
                {doctor.clinicName || 'Doctor\'s Clinic'}
              </Text>
            </View>
          </View>
        </View>

        {/* Offline Appointment Notice */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Ionicons name="information-circle" size={24} color="#667eea" />
            <Text style={styles.noticeTitle}>Offline Appointment</Text>
          </View>
          <Text style={styles.noticeText}>
            This is an in-person consultation at the doctor's clinic. Please arrive 10 minutes early.
          </Text>
          <View style={styles.clinicInfo}>
            <Ionicons name="business" size={18} color="#666" />
            <View style={styles.clinicDetails}>
              <Text style={styles.clinicName}>{doctor.clinicName || 'Doctor\'s Clinic'}</Text>
              <Text style={styles.clinicAddress}>{doctor.address || 'Address not provided'}</Text>
            </View>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={24} color="#667eea" />
            <Text style={styles.dateButtonText}>{formatDate(selectedDate)}</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Time Slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time Slot</Text>
          <View style={styles.timeSlotsContainer}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.timeSlotSelected
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[
                  styles.timeSlotText,
                  selectedTime === time && styles.timeSlotTextSelected
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reason for Visit */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reason for Visit</Text>
          <View style={styles.reasonsContainer}>
            {appointmentReasons.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.reasonCard,
                  selectedReason === reason.id && styles.reasonCardSelected
                ]}
                onPress={() => setSelectedReason(reason.id)}
              >
                <Ionicons 
                  name={reason.icon} 
                  size={24} 
                  color={selectedReason === reason.id ? '#667eea' : '#666'} 
                />
                <Text style={[
                  styles.reasonText,
                  selectedReason === reason.id && styles.reasonTextSelected
                ]}>
                  {reason.label}
                </Text>
                {selectedReason === reason.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#667eea" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Consultation Fees Info */}
        <View style={styles.feesCard}>
          <View style={styles.feesRow}>
            <Text style={styles.feesLabel}>Consultation Fees</Text>
            <Text style={styles.feesValue}>
              {doctor.consultationFees ? `₹${doctor.consultationFees}` : 'Not specified'}
            </Text>
          </View>
          <Text style={styles.feesNote}>Payment to be made at the clinic</Text>
        </View>

        {/* Book Button */}
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={handleBookAppointment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text style={styles.bookButtonText}>Book Appointment</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {renderConfirmationModal()}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
  },
  doctorCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  doctorAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  doctorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  doctorSpecialization: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
    marginTop: 4,
  },
  doctorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 5,
  },
  doctorMetaText: {
    fontSize: 12,
    color: '#666',
  },
  noticeCard: {
    backgroundColor: '#e8f0fe',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  noticeText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  clinicInfo: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  clinicDetails: {
    flex: 1,
  },
  clinicName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  clinicAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateButtonText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: '30%',
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  reasonsContainer: {
    gap: 10,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reasonCardSelected: {
    backgroundColor: '#e8f0fe',
    borderColor: '#667eea',
    borderWidth: 2,
  },
  reasonText: {
    flex: 1,
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  reasonTextSelected: {
    color: '#333',
    fontWeight: '600',
  },
  feesCard: {
    backgroundColor: '#fff8e1',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  feesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feesLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  feesValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  feesNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  bookButton: {
    flexDirection: 'row',
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
    elevation: 3,
  },
  bookButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  confirmModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 20,
    maxHeight: '90%',
  },
  confirmHeader: {
    alignItems: 'center',
    padding: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  confirmBody: {
    padding: 20,
  },
  offlineNotice: {
    flexDirection: 'row',
    backgroundColor: '#fff3f3',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  offlineNoticeText: {
    flex: 1,
  },
  offlineNoticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 5,
  },
  offlineNoticeSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  confirmSection: {
    marginBottom: 20,
  },
  confirmLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  confirmValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  confirmSubValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  confirmActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: '#667eea',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AppointmentBookingScreen;
