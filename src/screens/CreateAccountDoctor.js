import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CreateAccountDoctor = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');

  const handleCreate = () => {
    if (!name || !email || !password || !specialization || !experience) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    Alert.alert('Account Created', 'Doctor account created (demo)');
    navigation.navigate('DoctorLogin');
  };

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.appTitle}>Create Doctor Account</Text>
      </View>

      <View style={styles.card}>
        <Ionicons name="medical" size={64} color="#667eea" />
        <Text style={styles.title}>Doctor Details</Text>

        <TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <TextInput style={styles.input} placeholder="Specialization (e.g., Ayurveda)" value={specialization} onChangeText={setSpecialization} />
        <TextInput style={styles.input} placeholder="Experience (years)" value={experience} onChangeText={setExperience} keyboardType="numeric" />

        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, paddingHorizontal: 20 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 10 },
  backButton: { position: 'absolute', left: 12, top: 46, padding: 6 },
  appTitle: { color: 'white', fontSize: 20, fontWeight: '700' },
  card: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 20, marginTop: 20, elevation: 6, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', marginTop: 8, color: '#2b2b5c' },
  input: { width: '100%', borderWidth: 1, borderColor: '#e6e9fb', borderRadius: 10, padding: 12, marginTop: 10, backgroundColor: '#fbfbff' },
  button: { backgroundColor: '#667eea', paddingVertical: 14, borderRadius: 10, width: '100%', alignItems: 'center', marginTop: 14 },
  buttonText: { color: 'white', fontWeight: '700' }
});

export default CreateAccountDoctor;
