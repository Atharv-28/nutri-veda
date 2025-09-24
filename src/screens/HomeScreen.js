import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.appName}>NutriVeda</Text>
        <Text style={styles.subtitle}>Your Ayurvedic Nutrition Guide</Text>
      </View>

      <View style={styles.doshaSection}>
        <Text style={styles.sectionTitle}>Understanding Your Dosha</Text>
        <View style={styles.doshaCards}>
          <View style={styles.doshaCard}>
            <Ionicons name="leaf-outline" size={30} color="#FF6B6B" />
            <Text style={styles.doshaName}>Vata</Text>
            <Text style={styles.doshaDescription}>Air & Space</Text>
          </View>
          <View style={styles.doshaCard}>
            <Ionicons name="flame-outline" size={30} color="#FF8E53" />
            <Text style={styles.doshaName}>Pitta</Text>
            <Text style={styles.doshaDescription}>Fire & Water</Text>
          </View>
          <View style={styles.doshaCard}>
            <Ionicons name="water-outline" size={30} color="#4ECDC4" />
            <Text style={styles.doshaName}>Kapha</Text>
            <Text style={styles.doshaDescription}>Earth & Water</Text>
          </View>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('PrakrutiTest')}
        >
          <Ionicons name="fitness-outline" size={24} color="#8B4513" />
          <Text style={styles.actionText}>Take Prakruiti Test</Text>
          <Ionicons name="chevron-forward" size={20} color="#8B4513" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('DietPlan', { dosha: 'vata' })}
        >
          <Ionicons name="nutrition-outline" size={24} color="#8B4513" />
          <Text style={styles.actionText}>View Sample Diet Plan</Text>
          <Ionicons name="chevron-forward" size={20} color="#8B4513" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('PrakrutiTest')}
        >
          <Ionicons name="restaurant-outline" size={24} color="#8B4513" />
          <Text style={styles.actionText}>Start Your Wellness Journey</Text>
          <Ionicons name="chevron-forward" size={20} color="#8B4513" />
        </TouchableOpacity>
      </View>

      <View style={styles.tipSection}>
        <Text style={styles.sectionTitle}>Daily Tip</Text>
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={24} color="#FFD700" />
          <Text style={styles.tipText}>
            Start your day with warm water and lemon to balance your digestive fire (Agni).
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEF7',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#F5F5DC',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '400',
  },
  appName: {
    fontSize: 36,
    color: '#8B4513',
    fontWeight: 'bold',
    marginVertical: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#A0522D',
    fontStyle: 'italic',
  },
  doshaSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 15,
  },
  doshaCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  doshaCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 0.3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  doshaName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    marginTop: 8,
  },
  doshaDescription: {
    fontSize: 12,
    color: '#A0522D',
    textAlign: 'center',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  actionButton: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#8B4513',
    marginLeft: 15,
    fontWeight: '500',
  },
  tipSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  tipCard: {
    backgroundColor: '#FFFACD',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#8B4513',
    marginLeft: 15,
    lineHeight: 20,
  },
});
