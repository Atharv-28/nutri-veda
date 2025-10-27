import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getDietPlan } from '../services/relationshipService';

const dietPlans = {
  vata: {
    color: '#8E44AD',
    title: 'Vata Diet Plan',
    principles: [
      'Eat warm, cooked foods',
      'Regular meal times',
      'Sweet, sour, and salty tastes',
      'Avoid cold, dry, and raw foods'
    ],
    breakfast: [
      'Warm oatmeal with nuts and honey',
      'Cooked fruits like stewed apples',
      'Herbal tea (ginger, cinnamon)',
      'Whole grain toast with ghee'
    ],
    lunch: [
      'Rice with dal and vegetables',
      'Steamed vegetables with spices',
      'Warm soup or stew',
      'Buttermilk or warm milk'
    ],
    dinner: [
      'Khichdi with ghee',
      'Cooked vegetables',
      'Warm herbal tea',
      'Light, easy to digest foods'
    ],
    snacks: [
      'Dates and nuts',
      'Warm milk with turmeric',
      'Cooked sweet fruits',
      'Herbal teas'
    ],
    spices: ['Ginger', 'Cinnamon', 'Cardamom', 'Cumin', 'Coriander', 'Fennel']
  },
  pitta: {
    color: '#E74C3C',
    title: 'Pitta Diet Plan',
    principles: [
      'Eat cool, refreshing foods',
      'Sweet, bitter, and astringent tastes',
      'Avoid spicy, sour, and salty foods',
      'Regular meal times, don\'t skip meals'
    ],
    breakfast: [
      'Fresh fruit salad',
      'Coconut water',
      'Oats with milk and sweet fruits',
      'Herbal tea (mint, rose)'
    ],
    lunch: [
      'Basmati rice with mild dal',
      'Leafy green vegetables',
      'Cucumber and mint salad',
      'Coconut water or buttermilk'
    ],
    dinner: [
      'Light rice or quinoa',
      'Steamed vegetables',
      'Cool herbal teas',
      'Avoid late night eating'
    ],
    snacks: [
      'Sweet fruits (melons, grapes)',
      'Coconut water',
      'Cool smoothies',
      'Almonds (soaked)'
    ],
    spices: ['Coriander', 'Fennel', 'Cardamom', 'Mint', 'Dill', 'Turmeric (small amounts)']
  },
  kapha: {
    color: '#27AE60',
    title: 'Kapha Diet Plan',
    principles: [
      'Eat light, warm, spicy foods',
      'Pungent, bitter, and astringent tastes',
      'Avoid heavy, oily, sweet foods',
      'Eat your largest meal at lunch'
    ],
    breakfast: [
      'Light fruits (apples, pears)',
      'Herbal tea with honey',
      'Light grains (barley, quinoa)',
      'Spiced tea with ginger'
    ],
    lunch: [
      'Quinoa or barley with vegetables',
      'Spiced lentils',
      'Raw salads with lemon',
      'Herbal tea or warm water'
    ],
    dinner: [
      'Light soup or broth',
      'Steamed vegetables',
      'Herbal tea',
      'Early, light dinner'
    ],
    snacks: [
      'Apples with cinnamon',
      'Herbal teas',
      'Small portions of nuts',
      'Vegetable juices'
    ],
    spices: ['Ginger', 'Black pepper', 'Turmeric', 'Cinnamon', 'Cloves', 'Mustard seeds']
  }
};

const DietPlanScreen = ({ route, navigation }) => {
  const { dosha, patient, doctor, readOnly } = route.params || { dosha: 'vata' };
  const [activeTab, setActiveTab] = useState('breakfast');
  const [loading, setLoading] = useState(false);
  const [customDietPlan, setCustomDietPlan] = useState(null);
  
  // Fetch custom diet plan from Firestore if patient is provided
  useEffect(() => {
    const fetchDietPlan = async () => {
      if (patient?.uid) {
        setLoading(true);
        try {
          const plan = await getDietPlan(patient.uid);
          if (plan) {
            setCustomDietPlan(plan);
          }
        } catch (error) {
          console.error('Error fetching diet plan:', error);
          Alert.alert('Error', 'Failed to load diet plan from database.');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchDietPlan();
  }, [patient?.uid]);

  // Use custom diet plan if available, otherwise use default template
  const plan = customDietPlan 
    ? {
        ...dietPlans[dosha],
        breakfast: customDietPlan.meals?.breakfast || dietPlans[dosha].breakfast,
        lunch: customDietPlan.meals?.lunch || dietPlans[dosha].lunch,
        dinner: customDietPlan.meals?.dinner || dietPlans[dosha].dinner,
        snacks: customDietPlan.meals?.snacks || dietPlans[dosha].snacks,
        principles: customDietPlan.recommendations || dietPlans[dosha].principles,
      }
    : dietPlans[dosha];

  const tabs = [
    { key: 'breakfast', title: 'Breakfast', icon: 'sunny' },
    { key: 'lunch', title: 'Lunch', icon: 'restaurant' },
    { key: 'dinner', title: 'Dinner', icon: 'moon' },
    { key: 'snacks', title: 'Snacks', icon: 'nutrition' }
  ];

  const renderFoodItem = ({ item }) => (
    <View style={styles.foodItem}>
      <Ionicons name="checkmark-circle" size={20} color={plan.color} />
      <Text style={styles.foodText}>{item}</Text>
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
        <Text style={styles.headerTitle}>{plan.title}</Text>
        {customDietPlan && (
          <View style={styles.customBadge}>
            <Ionicons name="star" size={14} color="#FFC107" />
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading your diet plan...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
        <View style={styles.principlesCard}>
          <Text style={styles.cardTitle}>Key Principles</Text>
          {plan.principles.map((principle, index) => (
            <View key={index} style={styles.principleItem}>
              <Ionicons name="leaf" size={16} color={plan.color} />
              <Text style={styles.principleText}>{principle}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && { backgroundColor: plan.color }
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons 
                name={tab.icon} 
                size={20} 
                color={activeTab === tab.key ? 'white' : plan.color} 
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

        <View style={styles.foodCard}>
          <Text style={styles.cardTitle}>
            {tabs.find(t => t.key === activeTab)?.title} Options
          </Text>
          <FlatList
            data={plan[activeTab]}
            renderItem={renderFoodItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        </View>

        <View style={styles.spicesCard}>
          <Text style={styles.cardTitle}>Recommended Spices</Text>
          <View style={styles.spicesContainer}>
            {plan.spices.map((spice, index) => (
              <View key={index} style={[styles.spiceTag, { borderColor: plan.color }]}>
                <Text style={[styles.spiceText, { color: plan.color }]}>{spice}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.cardTitle}>Additional Tips</Text>
          <View style={styles.tipItem}>
            <Ionicons name="time" size={16} color={plan.color} />
            <Text style={styles.tipText}>Eat at regular times daily</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="water" size={16} color={plan.color} />
            <Text style={styles.tipText}>Stay hydrated with appropriate beverages</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="walk" size={16} color={plan.color} />
            <Text style={styles.tipText}>Include appropriate exercise for your dosha</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="bed" size={16} color={plan.color} />
            <Text style={styles.tipText}>Maintain regular sleep schedule</Text>
          </View>
        </View>
        </ScrollView>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  customBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 20,
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
  content: {
    flex: 1,
    padding: 20,
  },
  principlesCard: {
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
  principleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  principleText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
    color: '#666',
  },
  foodCard: {
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
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  spicesCard: {
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
  spicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  spiceTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  spiceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tipsCard: {
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
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
});

export default DietPlanScreen;
