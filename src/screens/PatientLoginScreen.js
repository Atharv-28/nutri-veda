import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { signIn } from '../services/authService';

const PatientLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(email.trim().toLowerCase(), password, 'patient');
      
      setLoading(false);

      if (result.success) {
        // Navigate to patient dashboard with user data
        navigation.navigate('PatientDashboard', { 
          patient: result.user,
          doctor: null 
        });
      } else {
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'An unexpected error occurred');
    }
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
        <Ionicons name="person-circle" size={72} color="#667eea" />
        <Text style={styles.title}>Patient Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9aa0c4"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9aa0c4"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('PatientCreateAccount')}>
          <Text style={styles.link}>Create an account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Need help? Contact your Ayurvedic practitioner.</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, paddingHorizontal: 20 },
  header: { alignItems: 'center', paddingTop: 30, paddingBottom: 20 },
  backButton: { position: 'absolute', left: 12, top: 48, padding: 6 },
  appTitle: { color: 'white', fontSize: 32, fontWeight: '700' },
  appSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 6 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 22,
    marginTop: 80,
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

export default PatientLoginScreen;
