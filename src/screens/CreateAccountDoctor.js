import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreateAccountDoctor = ({ navigation }) => {
  // Common fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [age, setAge] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);

  // Doctor-specific fields
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [qualification, setQualification] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [consultationFees, setConsultationFees] = useState('');
  const [address, setAddress] = useState('');
  const [availability, setAvailability] = useState('');
  const [documentsUploaded, setDocumentsUploaded] = useState(false);

  useEffect(() => {
    if (dob) {
      const parts = dob.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const birth = new Date(y, m, d);
        if (!isNaN(birth.getTime())) {
          const today = new Date();
          let calcAge = today.getFullYear() - birth.getFullYear();
          const mDiff = today.getMonth() - birth.getMonth();
          if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) {
            calcAge -= 1;
          }
          setAge(String(calcAge));
        }
      }
    }
  }, [dob]);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event.type === 'dismissed') return;
    const current = selectedDate || new Date();
    setDob(formatDate(current));
  };

  const handleUploadPhoto = () => {
    Alert.alert('Upload Photo', 'Profile photo upload not implemented in demo');
  };

  const handleUploadDocuments = () => {
    Alert.alert('Upload Documents', 'Document upload not implemented in demo');
    setDocumentsUploaded(true);
  };

  const handleCreate = () => {
    // Basic validation for required fields
    if (!fullName || !email || !mobile || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all required common fields (Name, Mobile, Email, Password)');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    // Doctor-specific minimal validation
    if (!registrationNumber || !qualification || !specialization || !yearsExperience) {
      Alert.alert('Error', 'Please fill doctor verification fields (Registration number, Qualification, Specialization, Experience)');
      return;
    }

    const doctor = {
      id: Math.floor(Math.random() * 10000),
      name: fullName,
      email,
      mobile,
      age: age || null,
      dob: dob || null,
      gender: gender || null,
      profilePhoto: profilePhoto || null,
      registrationNumber,
      qualification,
      specialization,
      yearsExperience,
      clinicName: clinicName || null,
      consultationFees: consultationFees || null,
      address: address || null,
      availability: availability || null,
      documentsUploaded
    };

    Alert.alert('Account Created', 'Doctor account created (demo)\n' + JSON.stringify(doctor, null, 2));
    navigation.navigate('DoctorLogin');
  };

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.wrapper}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <Text style={styles.appTitle}>Create Doctor Account</Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="medical" size={64} color="#667eea" />
          <Text style={styles.title}>Doctor Details</Text>

          <TextInput style={styles.input} placeholder="Full name *" value={fullName} onChangeText={setFullName} />
          <TextInput style={styles.input} placeholder="Mobile number *" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="Email *" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

          <TextInput style={styles.input} placeholder="Password *" value={password} onChangeText={setPassword} secureTextEntry />
          <TextInput style={styles.input} placeholder="Confirm Password *" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

          <View style={styles.pickerContainer}>
            <Picker selectedValue={gender} onValueChange={(v) => setGender(v)} style={styles.picker}>
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>

          {/* Date of Birth */}
          <TouchableOpacity style={[styles.input, styles.dateInput]} onPress={() => setShowDatePicker(true)}>
            <Text style={dob ? styles.inputText : styles.placeholderText}>{dob || 'Date of Birth (tap to select)'}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dob ? new Date(dob) : new Date(1990, 0, 1)}
              mode="date"
              display="default"
              onChange={onChangeDate}
              maximumDate={new Date()}
            />
          )}

          <TextInput style={styles.input} placeholder="Age (auto or manual)" value={age} onChangeText={setAge} keyboardType="numeric" />

          <TouchableOpacity style={styles.smallButton} onPress={handleUploadPhoto}>
            <Text style={styles.smallButtonText}>{profilePhoto ? 'Change Profile Photo' : 'Upload Profile Photo (Optional)'}</Text>
          </TouchableOpacity>

          <Text style={[styles.subHeading]}>Verification & Professional</Text>
          <TextInput style={styles.input} placeholder="Registration Number / License ID *" value={registrationNumber} onChangeText={setRegistrationNumber} />
          <TextInput style={styles.input} placeholder="Qualification (e.g., BAMS) *" value={qualification} onChangeText={setQualification} />
          <TextInput style={styles.input} placeholder="Years of Experience *" value={yearsExperience} onChangeText={setYearsExperience} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Specialization (e.g., Panchakarma) *" value={specialization} onChangeText={setSpecialization} />

          <Text style={[styles.subHeading]}>Clinic & Availability</Text>
          <TextInput style={styles.input} placeholder="Clinic / Hospital Name" value={clinicName} onChangeText={setClinicName} />
          <TextInput style={styles.input} placeholder="Consultation Fees (Optional)" value={consultationFees} onChangeText={setConsultationFees} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Address / Location" value={address} onChangeText={setAddress} />
          <TextInput style={styles.input} placeholder="Availability / Timings" value={availability} onChangeText={setAvailability} />

          <TouchableOpacity style={styles.smallButton} onPress={handleUploadDocuments}>
            <Text style={styles.smallButtonText}>{documentsUploaded ? 'Documents Uploaded' : 'Upload Degree / License (Optional)'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleCreate}>
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, paddingHorizontal: 12 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 10 },
  backButton: { position: 'absolute', left: 12, top: 46, padding: 6 },
  appTitle: { color: 'white', fontSize: 20, fontWeight: '700' },
  card: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 20, marginTop: 20, elevation: 6, alignItems: 'stretch', width: '100%' },
  title: { fontSize: 18, fontWeight: '700', marginTop: 8, color: '#2b2b5c' },
  subHeading: { width: '100%', marginTop: 12, fontWeight: '700', color: '#2b2b5c' },
  input: { width: '100%', height: 52, borderWidth: 1, borderColor: '#e6e9fb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 10, backgroundColor: '#fbfbff', justifyContent: 'center' },
  dateInput: { paddingVertical: 12 },
  inputText: { color: '#111' },
  placeholderText: { color: '#999' },
  pickerContainer: { width: '100%', borderWidth: 1, borderColor: '#e6e9fb', borderRadius: 10, marginTop: 10, backgroundColor: '#fbfbff', overflow: 'hidden' },
  picker: { width: '100%' , height: 52},
  button: { backgroundColor: '#667eea', paddingVertical: 14, borderRadius: 10, width: '100%', alignItems: 'center', marginTop: 14 },
  buttonText: { color: 'white', fontWeight: '700' },
  smallButton: { marginTop: 10, backgroundColor: '#f1f2ff', padding: 10, borderRadius: 8, width: '100%', alignItems: 'center' },
  smallButtonText: { color: '#333' },
});

export default CreateAccountDoctor;
