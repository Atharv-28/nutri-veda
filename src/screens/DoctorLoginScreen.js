import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const DoctorLoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Demo: accept any input (including empty) and navigate to doctor dashboard
    const doctor = { id: Math.floor(Math.random() * 10000), name: username || 'Dr. Demo', specialization: 'Ayurveda' };
    navigation.navigate('DoctorDashboard', { doctor });
  };

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.appTitle}>NutriVeda</Text>
        <Text style={styles.appSubtitle}>Ayurvedic Diet Management</Text>
      </View>

      <View style={styles.card}>
        <Ionicons name="medical" size={72} color="#667eea" />
        <Text style={styles.title}>Doctor Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#9aa0c4"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9aa0c4"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('DoctorCreateAccount')}>
          <Text style={styles.link}>Create an account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Doctors: review patient assessments and create diet plans.</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, paddingHorizontal: 20 },
  header: { alignItems: 'center', paddingTop: 80, paddingBottom: 20 },
  backButton: { position: 'absolute', left: 12, top: 48, padding: 6 },
  appTitle: { color: 'white', fontSize: 32, fontWeight: '700' },
  appSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 6 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 22,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  title: { fontSize: 20, fontWeight: '700', marginTop: 8, color: '#2b2b5c' },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e6e9fb',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    backgroundColor: '#fbfbff',
    color: '#333'
  },
  button: {
    backgroundColor: '#667eea',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 16
  },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },
  link: { color: '#667eea', marginTop: 12 },
  footer: { alignItems: 'center', marginTop: 18 },
  footerText: { color: 'rgba(255,255,255,0.9)', fontSize: 13 }
});

export default DoctorLoginScreen;
