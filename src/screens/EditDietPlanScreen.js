import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { getDietPlan } from '../services/relationshipService';

const EditDietPlanScreen = ({ route, navigation }) => {
  const { patient, doctor } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dietPlan, setDietPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('breakfast');
  
  // Editable meal items
  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  });
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    loadDietPlan();
  }, []);

  const loadDietPlan = async () => {
    try {
      setLoading(true);
      console.log('📋 Loading diet plan for patient:', patient.uid);
      
      const plan = await getDietPlan(patient.uid);
      
      if (plan) {
        setDietPlan(plan);
        setMeals(plan.meals || { breakfast: [], lunch: [], dinner: [], snacks: [] });
        setRecommendations(plan.recommendations || []);
        console.log('✅ Diet plan loaded');
      } else {
        Alert.alert('Error', 'No diet plan found for this patient');
        navigation.goBack();
      }
    } catch (error) {
      console.error('❌ Error loading diet plan:', error);
      Alert.alert('Error', 'Failed to load diet plan');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAddMealItem = (mealType) => {
    Alert.prompt(
      `Add ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Item`,
      'Enter food item:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (text) => {
            if (text && text.trim()) {
              setMeals({
                ...meals,
                [mealType]: [...meals[mealType], text.trim()]
              });
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleEditMealItem = (mealType, index) => {
    Alert.prompt(
      'Edit Item',
      'Update food item:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: (text) => {
            if (text && text.trim()) {
              const updatedMeals = [...meals[mealType]];
              updatedMeals[index] = text.trim();
              setMeals({
                ...meals,
                [mealType]: updatedMeals
              });
            }
          }
        }
      ],
      'plain-text',
      meals[mealType][index]
    );
  };

  const handleDeleteMealItem = (mealType, index) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedMeals = meals[mealType].filter((_, i) => i !== index);
            setMeals({
              ...meals,
              [mealType]: updatedMeals
            });
          }
        }
      ]
    );
  };

  const handleAddRecommendation = () => {
    Alert.prompt(
      'Add Recommendation',
      'Enter dietary recommendation:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (text) => {
            if (text && text.trim()) {
              setRecommendations([...recommendations, text.trim()]);
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleEditRecommendation = (index) => {
    Alert.prompt(
      'Edit Recommendation',
      'Update recommendation:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: (text) => {
            if (text && text.trim()) {
              const updated = [...recommendations];
              updated[index] = text.trim();
              setRecommendations(updated);
            }
          }
        }
      ],
      'plain-text',
      recommendations[index]
    );
  };

  const handleDeleteRecommendation = (index) => {
    Alert.alert(
      'Delete Recommendation',
      'Are you sure you want to delete this recommendation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setRecommendations(recommendations.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!dietPlan?.id) {
        Alert.alert('Error', 'Diet plan ID not found');
        return;
      }

      console.log('💾 Saving updated diet plan...');
      
      await updateDoc(doc(db, 'dietPlans', dietPlan.id), {
        meals,
        recommendations,
        updatedAt: new Date().toISOString(),
        lastEditedBy: doctor.uid,
        lastEditedByName: doctor.name
      });

      console.log('✅ Diet plan updated successfully');
      Alert.alert('Success', 'Diet plan updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('❌ Error saving diet plan:', error);
      Alert.alert('Error', 'Failed to save diet plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndApprove = async () => {
    Alert.alert(
      'Save & Approve',
      'Save changes and approve this diet plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save & Approve',
          onPress: async () => {
            try {
              setSaving(true);
              
              await updateDoc(doc(db, 'dietPlans', dietPlan.id), {
                meals,
                recommendations,
                updatedAt: new Date().toISOString(),
                lastEditedBy: doctor.uid,
                lastEditedByName: doctor.name,
                approved: true,
                approvedBy: doctor.uid,
                approvedByName: doctor.name,
                approvedAt: new Date().toISOString()
              });

              Alert.alert('Success', 'Diet plan saved and approved!', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error:', error);
              Alert.alert('Error', 'Failed to save and approve');
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  const getDoshaColor = () => {
    const colors = {
      vata: '#8E44AD',
      pitta: '#E74C3C',
      kapha: '#27AE60'
    };
    return colors[patient.dosha] || '#667eea';
  };

  const tabs = [
    { key: 'breakfast', title: 'Breakfast', icon: 'sunny' },
    { key: 'lunch', title: 'Lunch', icon: 'restaurant' },
    { key: 'dinner', title: 'Dinner', icon: 'moon' },
    { key: 'snacks', title: 'Snacks', icon: 'nutrition' }
  ];

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading diet plan...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.titleText}>Edit Diet Plan</Text>
          <Text style={styles.patientName}>{patient.fullName || patient.name}</Text>
        </View>
        {dietPlan?.approved && (
          <View style={styles.approvedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#28a745" />
          </View>
        )}
      </View>

      <View style={[styles.doshaIndicator, { backgroundColor: getDoshaColor() }]}>
        <Text style={styles.doshaText}>
          {patient.dosha?.toUpperCase() || 'UNKNOWN'} CONSTITUTION
        </Text>
      </View>

      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && { backgroundColor: getDoshaColor() }
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons 
              name={tab.icon} 
              size={18} 
              color={activeTab === tab.key ? 'white' : '#666'} 
            />
            <Text 
              style={[
                styles.tabText,
                activeTab === tab.key && { color: 'white' }
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {tabs.find(t => t.key === activeTab)?.title} Items
            </Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => handleAddMealItem(activeTab)}
            >
              <Ionicons name="add-circle" size={24} color={getDoshaColor()} />
            </TouchableOpacity>
          </View>

          {meals[activeTab].map((item, index) => (
            <View key={index} style={styles.mealItem}>
              <View style={styles.mealItemContent}>
                <Ionicons name="nutrition" size={18} color={getDoshaColor()} />
                <Text style={styles.mealItemText}>{item}</Text>
              </View>
              <View style={styles.mealItemActions}>
                <TouchableOpacity 
                  onPress={() => handleEditMealItem(activeTab, index)}
                  style={styles.iconButton}
                >
                  <Ionicons name="create" size={18} color="#667eea" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleDeleteMealItem(activeTab, index)}
                  style={styles.iconButton}
                >
                  <Ionicons name="trash" size={18} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {meals[activeTab].length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No items added yet</Text>
              <Text style={styles.emptySubtext}>Tap + to add food items</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dietary Recommendations</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddRecommendation}
            >
              <Ionicons name="add-circle" size={24} color={getDoshaColor()} />
            </TouchableOpacity>
          </View>

          {recommendations.map((item, index) => (
            <View key={index} style={styles.recommendationItem}>
              <View style={styles.recommendationContent}>
                <Ionicons name="checkmark-circle" size={18} color="#28a745" />
                <Text style={styles.recommendationText}>{item}</Text>
              </View>
              <View style={styles.mealItemActions}>
                <TouchableOpacity 
                  onPress={() => handleEditRecommendation(index)}
                  style={styles.iconButton}
                >
                  <Ionicons name="create" size={18} color="#667eea" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleDeleteRecommendation(index)}
                  style={styles.iconButton}
                >
                  <Ionicons name="trash" size={18} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {recommendations.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No recommendations added yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        {!dietPlan?.approved && (
          <TouchableOpacity 
            style={[styles.approveButton, saving && styles.disabledButton]}
            onPress={handleSaveAndApprove}
            disabled={saving}
          >
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={styles.approveButtonText}>Save & Approve</Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    flex: 1,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  patientName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  approvedBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 20,
  },
  doshaIndicator: {
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  doshaText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 5,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 5,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#667eea',
  },
  mealItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  mealItemText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  mealItemActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    padding: 5,
  },
  recommendationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fff8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745',
  },
  recommendationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 10,
  },
  saveButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  approveButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    gap: 8,
  },
  approveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default EditDietPlanScreen;
