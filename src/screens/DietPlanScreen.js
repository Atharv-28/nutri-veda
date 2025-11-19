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
import { generateDailyPlan, getDoshaColor } from '../data/nutriVedaDietEngine';

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

  // Helper function to format meal items from the new diet engine structure
  const formatMealItems = (meal) => {
    if (!meal) return [];
    
    const items = [];
    // Extract all food items from meal object
    if (meal.grains) items.push(...meal.grains);
    if (meal.vegetables) items.push(...meal.vegetables);
    if (meal.proteins) items.push(...meal.proteins);
    if (meal.fats) items.push(...meal.fats);
    if (meal.fruits) items.push(...meal.fruits);
    if (meal.beverages) items.push(...meal.beverages);
    
    // Add timing and portion information as separate items
    if (meal.timing) items.push(`⏰ Best time: ${meal.timing}`);
    if (meal.portions) items.push(`📊 Portions: ${meal.portions}`);
    if (meal.note) items.push(`💡 Note: ${meal.note}`);
    
    return items.length > 0 ? items : ['No items available'];
  };

  // Generate default plan using the diet engine
  const generateDefaultPlan = (doshaType) => {
    try {
      const generatedPlan = generateDailyPlan(doshaType.toLowerCase());
      return {
        color: getDoshaColor(doshaType.toLowerCase()),
        title: `${generatedPlan.doshaType} Diet Plan`,
        breakfast: formatMealItems(generatedPlan.meals.breakfast),
        lunch: formatMealItems(generatedPlan.meals.lunch),
        dinner: formatMealItems(generatedPlan.meals.dinner),
        snacks: formatMealItems(generatedPlan.meals.snacks),
        principles: generatedPlan.keyPrinciples,
        spices: generatedPlan.spices,
        spicesNote: generatedPlan.spicesNote,
        doshaInfo: generatedPlan.doshaInfo,
        mindfulEating: generatedPlan.mindfulEating,
        dailyRoutine: generatedPlan.dailyRoutine
      };
    } catch (error) {
      console.error('Error generating default plan:', error);
      // Fallback minimal plan
      return {
        color: getDoshaColor(doshaType.toLowerCase()),
        title: `${doshaType.charAt(0).toUpperCase() + doshaType.slice(1)} Diet Plan`,
        breakfast: ['Please complete assessment to view personalized plan'],
        lunch: ['Please complete assessment to view personalized plan'],
        dinner: ['Please complete assessment to view personalized plan'],
        snacks: ['Please complete assessment to view personalized plan'],
        principles: ['Complete your Prakruti assessment to get personalized recommendations'],
        spices: []
      };
    }
  };

  // Use custom diet plan if available, otherwise generate using diet engine
  const plan = customDietPlan 
    ? {
        color: getDoshaColor(dosha.toLowerCase()),
        title: `${dosha.charAt(0).toUpperCase() + dosha.slice(1)} Diet Plan`,
        breakfast: customDietPlan.meals?.breakfast 
          ? formatMealItems(customDietPlan.meals.breakfast)
          : generateDefaultPlan(dosha).breakfast,
        lunch: customDietPlan.meals?.lunch 
          ? formatMealItems(customDietPlan.meals.lunch)
          : generateDefaultPlan(dosha).lunch,
        dinner: customDietPlan.meals?.dinner 
          ? formatMealItems(customDietPlan.meals.dinner)
          : generateDefaultPlan(dosha).dinner,
        snacks: customDietPlan.meals?.snacks 
          ? formatMealItems(customDietPlan.meals.snacks)
          : generateDefaultPlan(dosha).snacks,
        principles: customDietPlan.keyPrinciples || customDietPlan.recommendations || generateDefaultPlan(dosha).principles,
        spices: customDietPlan.spices || generateDefaultPlan(dosha).spices,
        doshaInfo: customDietPlan.doshaInfo,
        mindfulEating: customDietPlan.mindfulEating,
        dailyRoutine: customDietPlan.dailyRoutine,
        spicesNote: customDietPlan.spicesNote
      }
    : generateDefaultPlan(dosha);

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
          {plan.spicesNote && (
            <Text style={styles.spicesNote}>{plan.spicesNote}</Text>
          )}
          <View style={styles.spicesContainer}>
            {plan.spices.map((spice, index) => (
              <View key={index} style={[styles.spiceTag, { borderColor: plan.color }]}>
                <Text style={[styles.spiceText, { color: plan.color }]}>{spice}</Text>
              </View>
            ))}
          </View>
        </View>

        {plan.doshaInfo && (
          <View style={styles.doshaInfoCard}>
            <Text style={styles.cardTitle}>Your Dosha Balance Goal</Text>
            <View style={styles.doshaInfoItem}>
              <Ionicons name="fitness" size={16} color={plan.color} />
              <Text style={styles.doshaInfoText}>Goal: {plan.doshaInfo.goal}</Text>
            </View>
            <View style={styles.doshaInfoItem}>
              <Ionicons name="leaf" size={16} color={plan.color} />
              <Text style={styles.doshaInfoText}>Focus on: {plan.doshaInfo.qualities}</Text>
            </View>
            <View style={styles.doshaInfoItem}>
              <Ionicons name="restaurant" size={16} color={plan.color} />
              <Text style={styles.doshaInfoText}>Tastes: {plan.doshaInfo.rasas}</Text>
            </View>
            <View style={styles.doshaInfoItem}>
              <Ionicons name="close-circle" size={16} color="#E74C3C" />
              <Text style={styles.doshaInfoText}>Avoid: {plan.doshaInfo.avoid}</Text>
            </View>
          </View>
        )}

        {plan.dailyRoutine && (
          <View style={styles.routineCard}>
            <Text style={styles.cardTitle}>Daily Routine</Text>
            {plan.dailyRoutine.map((routine, index) => (
              <View key={index} style={styles.routineItem}>
                <Ionicons name="time" size={16} color={plan.color} />
                <Text style={styles.routineText}>{routine}</Text>
              </View>
            ))}
          </View>
        )}

        {plan.mindfulEating && (
          <>
            <View style={styles.mindfulCard}>
              <Text style={styles.cardTitle}>🧘 Pre-Meal Reminders</Text>
              {plan.mindfulEating.preMealReminders.map((reminder, index) => (
                <View key={index} style={styles.mindfulItem}>
                  <Text style={styles.mindfulText}>{reminder}</Text>
                </View>
              ))}
            </View>

            <View style={styles.mindfulCard}>
              <Text style={styles.cardTitle}>🍽️ During Your Meal</Text>
              {plan.mindfulEating.duringMeal.map((tip, index) => (
                <View key={index} style={styles.mindfulItem}>
                  <Text style={styles.mindfulText}>{tip}</Text>
                </View>
              ))}
            </View>

            <View style={styles.mindfulCard}>
              <Text style={styles.cardTitle}>✨ After Your Meal</Text>
              {plan.mindfulEating.postMeal.map((tip, index) => (
                <View key={index} style={styles.mindfulItem}>
                  <Text style={styles.mindfulText}>{tip}</Text>
                </View>
              ))}
            </View>

            <View style={styles.mindfulCard}>
              <Text style={styles.cardTitle}>⏰ Meal Timing Rules</Text>
              {plan.mindfulEating.timingRules.map((rule, index) => (
                <View key={index} style={styles.mindfulItem}>
                  <Text style={styles.mindfulText}>{rule}</Text>
                </View>
              ))}
            </View>
          </>
        )}

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
  spicesNote: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
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
  doshaInfoCard: {
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
  doshaInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doshaInfoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  routineCard: {
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
  routineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routineText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  mindfulCard: {
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
  mindfulItem: {
    marginBottom: 10,
    paddingLeft: 10,
  },
  mindfulText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
