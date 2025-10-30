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
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const ProgressTrackingScreen = ({ route, navigation }) => {
  const { patient } = route.params;
  
  const [activeTab, setActiveTab] = useState('weight'); // weight, adherence, vitals, habits
  const [loading, setLoading] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  
  // Weight tracking
  const [weightHistory, setWeightHistory] = useState([]);
  const [currentWeight, setCurrentWeight] = useState(patient?.weight || '');
  const [goalWeight, setGoalWeight] = useState('');
  const [weightNotes, setWeightNotes] = useState('');
  
  // Adherence tracking
  const [adherenceHistory, setAdherenceHistory] = useState([]);
  const [todayAdherence, setTodayAdherence] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
    snacks: false,
  });
  
  // Vitals tracking
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [currentVitals, setCurrentVitals] = useState({
    bloodPressure: '',
    bloodSugar: '',
    energyLevel: 3,
    sleepQuality: 3,
    digestion: 3,
    stressLevel: 2,
  });
  
  // Habits tracking
  const [habitsHistory, setHabitsHistory] = useState([]);
  const [todayHabits, setTodayHabits] = useState({
    waterIntake: 0,
    exercise: false,
    meditation: false,
    oilPulling: false,
    herbsTaken: [],
  });
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadProgressData();
  }, [activeTab]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'weight') {
        await loadWeightHistory();
      } else if (activeTab === 'adherence') {
        await loadAdherenceHistory();
      } else if (activeTab === 'vitals') {
        await loadVitalsHistory();
      } else if (activeTab === 'habits') {
        await loadHabitsHistory();
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeightHistory = async () => {
    try {
      const q = query(
        collection(db, 'weightHistory'),
        where('patientId', '==', patient.uid),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWeightHistory(data);
      
      if (data.length > 0) {
        setGoalWeight(data[0].goalWeight || '');
      }
    } catch (error) {
      console.error('Error loading weight history:', error);
    }
  };

  const loadAdherenceHistory = async () => {
    try {
      const q = query(
        collection(db, 'adherenceLog'),
        where('patientId', '==', patient.uid),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAdherenceHistory(data);
      
      // Check if today's log exists
      const today = new Date().toISOString().split('T')[0];
      const todayLog = data.find(log => log.date === today);
      if (todayLog) {
        setTodayAdherence(todayLog.meals);
      }
    } catch (error) {
      console.error('Error loading adherence history:', error);
    }
  };

  const loadVitalsHistory = async () => {
    try {
      const q = query(
        collection(db, 'vitalsHistory'),
        where('patientId', '==', patient.uid),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVitalsHistory(data);
    } catch (error) {
      console.error('Error loading vitals history:', error);
    }
  };

  const loadHabitsHistory = async () => {
    try {
      const q = query(
        collection(db, 'habitsHistory'),
        where('patientId', '==', patient.uid),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHabitsHistory(data);
      
      // Check if today's log exists
      const today = new Date().toISOString().split('T')[0];
      const todayLog = data.find(log => log.date === today);
      if (todayLog) {
        setTodayHabits(todayLog.habits);
      }
    } catch (error) {
      console.error('Error loading habits history:', error);
    }
  };

  const saveWeightEntry = async () => {
    if (!currentWeight) {
      Alert.alert('Error', 'Please enter your current weight');
      return;
    }

    try {
      setLoading(true);
      
      const weightEntry = {
        patientId: patient.uid,
        weight: parseFloat(currentWeight),
        goalWeight: parseFloat(goalWeight) || null,
        notes: weightNotes,
        date: selectedDate.toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'weightHistory'), weightEntry);
      
      // Update patient document with current weight
      await updateDoc(doc(db, 'patients', patient.uid), {
        weight: currentWeight,
        lastWeightUpdate: new Date().toISOString(),
      });

      Alert.alert('Success', 'Weight entry saved!');
      setShowLogModal(false);
      setCurrentWeight('');
      setWeightNotes('');
      loadWeightHistory();
    } catch (error) {
      console.error('Error saving weight entry:', error);
      Alert.alert('Error', 'Failed to save weight entry');
    } finally {
      setLoading(false);
    }
  };

  const saveAdherenceEntry = async () => {
    try {
      setLoading(true);
      
      const mealsFollowed = Object.keys(todayAdherence).filter(meal => todayAdherence[meal]);
      const totalMeals = Object.keys(todayAdherence).length;
      const adherenceScore = Math.round((mealsFollowed.length / totalMeals) * 100);

      const adherenceEntry = {
        patientId: patient.uid,
        date: new Date().toISOString().split('T')[0],
        meals: todayAdherence,
        mealsFollowed,
        adherenceScore,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'adherenceLog'), adherenceEntry);

      Alert.alert('Success', `Diet adherence logged! Score: ${adherenceScore}%`);
      setShowLogModal(false);
      loadAdherenceHistory();
    } catch (error) {
      console.error('Error saving adherence entry:', error);
      Alert.alert('Error', 'Failed to save adherence entry');
    } finally {
      setLoading(false);
    }
  };

  const saveVitalsEntry = async () => {
    try {
      setLoading(true);
      
      const vitalsEntry = {
        patientId: patient.uid,
        date: selectedDate.toISOString().split('T')[0],
        ...currentVitals,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'vitalsHistory'), vitalsEntry);

      Alert.alert('Success', 'Vitals entry saved!');
      setShowLogModal(false);
      loadVitalsHistory();
    } catch (error) {
      console.error('Error saving vitals entry:', error);
      Alert.alert('Error', 'Failed to save vitals entry');
    } finally {
      setLoading(false);
    }
  };

  const saveHabitsEntry = async () => {
    try {
      setLoading(true);
      
      const habitsEntry = {
        patientId: patient.uid,
        date: new Date().toISOString().split('T')[0],
        habits: todayHabits,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'habitsHistory'), habitsEntry);

      Alert.alert('Success', 'Habits logged!');
      setShowLogModal(false);
      loadHabitsHistory();
    } catch (error) {
      console.error('Error saving habits entry:', error);
      Alert.alert('Error', 'Failed to save habits entry');
    } finally {
      setLoading(false);
    }
  };

  const getWeightChange = () => {
    if (weightHistory.length < 2) return null;
    const latest = weightHistory[0].weight;
    const previous = weightHistory[1].weight;
    const change = latest - previous;
    return change.toFixed(1);
  };

  const getAverageAdherence = () => {
    if (adherenceHistory.length === 0) return 0;
    const last7 = adherenceHistory.slice(0, 7);
    const sum = last7.reduce((acc, log) => acc + log.adherenceScore, 0);
    return Math.round(sum / last7.length);
  };

  const getCurrentStreak = () => {
    let streak = 0;
    for (const log of adherenceHistory) {
      if (log.adherenceScore === 100) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const renderWeightTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Current Weight</Text>
          <Text style={styles.statValue}>
            {weightHistory.length > 0 ? `${weightHistory[0].weight} kg` : 'Not logged'}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Goal Weight</Text>
          <Text style={styles.statValue}>
            {goalWeight ? `${goalWeight} kg` : 'Not set'}
          </Text>
        </View>
        {getWeightChange() && (
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Last Change</Text>
            <Text style={[styles.statValue, { color: getWeightChange() < 0 ? '#28a745' : '#E74C3C' }]}>
              {getWeightChange() > 0 ? '+' : ''}{getWeightChange()} kg
            </Text>
          </View>
        )}
      </View>

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Weight History</Text>
        {weightHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="scale-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No weight entries yet</Text>
            <Text style={styles.emptySubtext}>Start tracking your weight progress</Text>
          </View>
        ) : (
          <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
            {weightHistory.map((entry) => (
              <View key={entry.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Ionicons name="scale" size={20} color="#667eea" />
                  <Text style={styles.historyDate}>{entry.date}</Text>
                </View>
                <Text style={styles.historyValue}>{entry.weight} kg</Text>
                {entry.notes && <Text style={styles.historyNotes}>{entry.notes}</Text>}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );

  const renderAdherenceTab = () => {
    const avgAdherence = getAverageAdherence();
    const streak = getCurrentStreak();

    return (
      <View style={styles.tabContent}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>7-Day Average</Text>
            <Text style={styles.statValue}>{avgAdherence}%</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Current Streak</Text>
            <Text style={styles.statValue}>{streak} days 🔥</Text>
          </View>
        </View>

        <View style={styles.todaySection}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          <View style={styles.mealCheckboxes}>
            {Object.keys(todayAdherence).map((meal) => (
              <TouchableOpacity
                key={meal}
                style={[styles.mealCheckbox, todayAdherence[meal] && styles.mealCheckboxChecked]}
                onPress={() => setTodayAdherence({ ...todayAdherence, [meal]: !todayAdherence[meal] })}
              >
                <Ionicons 
                  name={todayAdherence[meal] ? "checkmark-circle" : "ellipse-outline"} 
                  size={24} 
                  color={todayAdherence[meal] ? "#28a745" : "#ccc"} 
                />
                <Text style={styles.mealLabel}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={saveAdherenceEntry}>
            <Text style={styles.saveButtonText}>Save Today's Adherence</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Adherence History</Text>
          {adherenceHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No adherence logs yet</Text>
              <Text style={styles.emptySubtext}>Track your daily meal adherence</Text>
            </View>
          ) : (
            <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
              {adherenceHistory.map((entry) => (
                <View key={entry.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Ionicons name="nutrition" size={20} color="#28a745" />
                    <Text style={styles.historyDate}>{entry.date}</Text>
                  </View>
                  <View style={styles.adherenceScoreRow}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${entry.adherenceScore}%` }]} />
                    </View>
                    <Text style={styles.adherenceScore}>{entry.adherenceScore}%</Text>
                  </View>
                  <Text style={styles.mealsFollowed}>
                    Followed: {entry.mealsFollowed.join(', ')}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    );
  };

  const renderVitalsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.vitalsForm}>
        <Text style={styles.sectionTitle}>Log Your Vitals</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Blood Pressure</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 120/80"
            value={currentVitals.bloodPressure}
            onChangeText={(text) => setCurrentVitals({ ...currentVitals, bloodPressure: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Blood Sugar (mg/dL)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 95"
            keyboardType="numeric"
            value={currentVitals.bloodSugar}
            onChangeText={(text) => setCurrentVitals({ ...currentVitals, bloodSugar: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Energy Level (1-5)</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.ratingButton, currentVitals.energyLevel === level && styles.ratingButtonActive]}
                onPress={() => setCurrentVitals({ ...currentVitals, energyLevel: level })}
              >
                <Text style={[styles.ratingText, currentVitals.energyLevel === level && styles.ratingTextActive]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Sleep Quality (1-5)</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.ratingButton, currentVitals.sleepQuality === level && styles.ratingButtonActive]}
                onPress={() => setCurrentVitals({ ...currentVitals, sleepQuality: level })}
              >
                <Text style={[styles.ratingText, currentVitals.sleepQuality === level && styles.ratingTextActive]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Digestion (1-5)</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.ratingButton, currentVitals.digestion === level && styles.ratingButtonActive]}
                onPress={() => setCurrentVitals({ ...currentVitals, digestion: level })}
              >
                <Text style={[styles.ratingText, currentVitals.digestion === level && styles.ratingTextActive]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveVitalsEntry}>
          <Text style={styles.saveButtonText}>Save Vitals Entry</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Vitals History</Text>
        {vitalsHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="fitness-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No vitals logged yet</Text>
          </View>
        ) : (
          <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
            {vitalsHistory.map((entry) => (
              <View key={entry.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Ionicons name="fitness" size={20} color="#E74C3C" />
                  <Text style={styles.historyDate}>{entry.date}</Text>
                </View>
                <View style={styles.vitalsGrid}>
                  {entry.bloodPressure && (
                    <Text style={styles.vitalItem}>BP: {entry.bloodPressure}</Text>
                  )}
                  {entry.bloodSugar && (
                    <Text style={styles.vitalItem}>Sugar: {entry.bloodSugar}</Text>
                  )}
                  <Text style={styles.vitalItem}>Energy: {entry.energyLevel}/5</Text>
                  <Text style={styles.vitalItem}>Sleep: {entry.sleepQuality}/5</Text>
                  <Text style={styles.vitalItem}>Digestion: {entry.digestion}/5</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );

  const renderHabitsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.todaySection}>
        <Text style={styles.sectionTitle}>Today's Habits</Text>
        
        <View style={styles.habitItem}>
          <View style={styles.habitInfo}>
            <Ionicons name="water" size={24} color="#667eea" />
            <Text style={styles.habitLabel}>Water Intake (glasses)</Text>
          </View>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setTodayHabits({ ...todayHabits, waterIntake: Math.max(0, todayHabits.waterIntake - 1) })}
            >
              <Ionicons name="remove" size={20} color="#667eea" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{todayHabits.waterIntake}</Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setTodayHabits({ ...todayHabits, waterIntake: todayHabits.waterIntake + 1 })}
            >
              <Ionicons name="add" size={20} color="#667eea" />
            </TouchableOpacity>
          </View>
        </View>

        {['exercise', 'meditation', 'oilPulling'].map((habit) => (
          <TouchableOpacity
            key={habit}
            style={[styles.habitCheckbox, todayHabits[habit] && styles.habitCheckboxChecked]}
            onPress={() => setTodayHabits({ ...todayHabits, [habit]: !todayHabits[habit] })}
          >
            <Ionicons 
              name={todayHabits[habit] ? "checkmark-circle" : "ellipse-outline"} 
              size={24} 
              color={todayHabits[habit] ? "#28a745" : "#ccc"} 
            />
            <Text style={styles.habitLabel}>
              {habit === 'exercise' ? 'Exercise/Yoga' : 
               habit === 'meditation' ? 'Meditation' : 
               'Oil Pulling'}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.saveButton} onPress={saveHabitsEntry}>
          <Text style={styles.saveButtonText}>Save Today's Habits</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Habits History</Text>
        {habitsHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkbox-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No habits logged yet</Text>
          </View>
        ) : (
          <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
            {habitsHistory.map((entry) => (
              <View key={entry.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Ionicons name="checkbox" size={20} color="#8E44AD" />
                  <Text style={styles.historyDate}>{entry.date}</Text>
                </View>
                <Text style={styles.habitsSummary}>
                  Water: {entry.habits.waterIntake} glasses
                  {entry.habits.exercise && ' • Exercised'}
                  {entry.habits.meditation && ' • Meditated'}
                  {entry.habits.oilPulling && ' • Oil Pulling'}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );

  const renderLogModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showLogModal}
      onRequestClose={() => setShowLogModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Log Weight Entry</Text>
            <TouchableOpacity onPress={() => setShowLogModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color="#667eea" />
              <Text style={styles.dateButtonText}>
                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 72.5"
                keyboardType="numeric"
                value={currentWeight}
                onChangeText={setCurrentWeight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Goal Weight (kg) - Optional</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 70"
                keyboardType="numeric"
                value={goalWeight}
                onChangeText={setGoalWeight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes - Optional</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="How are you feeling?"
                multiline
                numberOfLines={3}
                value={weightNotes}
                onChangeText={setWeightNotes}
              />
            </View>

            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={saveWeightEntry}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.modalSaveButtonText}>Save Entry</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
          maximumDate={new Date()}
        />
      )}
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
        <Text style={styles.headerTitle}>Progress Tracking</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'weight' && styles.tabButtonActive]}
          onPress={() => setActiveTab('weight')}
        >
          <Ionicons name="scale" size={20} color={activeTab === 'weight' ? '#667eea' : '#999'} />
          <Text style={[styles.tabButtonText, activeTab === 'weight' && styles.tabButtonTextActive]}>
            Weight
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'adherence' && styles.tabButtonActive]}
          onPress={() => setActiveTab('adherence')}
        >
          <Ionicons name="checkmark-circle" size={20} color={activeTab === 'adherence' ? '#667eea' : '#999'} />
          <Text style={[styles.tabButtonText, activeTab === 'adherence' && styles.tabButtonTextActive]}>
            Adherence
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'vitals' && styles.tabButtonActive]}
          onPress={() => setActiveTab('vitals')}
        >
          <Ionicons name="fitness" size={20} color={activeTab === 'vitals' ? '#667eea' : '#999'} />
          <Text style={[styles.tabButtonText, activeTab === 'vitals' && styles.tabButtonTextActive]}>
            Vitals
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'habits' && styles.tabButtonActive]}
          onPress={() => setActiveTab('habits')}
        >
          <Ionicons name="checkbox" size={20} color={activeTab === 'habits' ? '#667eea' : '#999'} />
          <Text style={[styles.tabButtonText, activeTab === 'habits' && styles.tabButtonTextActive]}>
            Habits
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Loading progress data...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'weight' && renderWeightTab()}
            {activeTab === 'adherence' && renderAdherenceTab()}
            {activeTab === 'vitals' && renderVitalsTab()}
            {activeTab === 'habits' && renderHabitsTab()}
          </>
        )}
      </View>

      {activeTab === 'weight' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowLogModal(true)}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}

      {renderLogModal()}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: '#f0f2f5',
  },
  tabButtonText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  tabButtonTextActive: {
    color: '#667eea',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  tabContent: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  historySection: {
    flex: 1,
    marginTop: 20,
  },
  historyList: {
    flex: 1,
  },
  historyCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  historyValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  historyNotes: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  todaySection: {
    marginBottom: 20,
  },
  mealCheckboxes: {
    gap: 10,
  },
  mealCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  mealCheckboxChecked: {
    backgroundColor: '#f0fff0',
    borderWidth: 2,
    borderColor: '#28a745',
  },
  mealLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#667eea',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  adherenceScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
  },
  adherenceScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  mealsFollowed: {
    fontSize: 13,
    color: '#666',
  },
  vitalsForm: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ratingButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ratingButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  ratingText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
  ratingTextActive: {
    color: 'white',
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vitalItem: {
    fontSize: 13,
    color: '#666',
    backgroundColor: 'white',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  habitLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
  habitCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    gap: 12,
    marginBottom: 10,
  },
  habitCheckboxChecked: {
    backgroundColor: '#f0fff0',
    borderWidth: 2,
    borderColor: '#28a745',
  },
  habitsSummary: {
    fontSize: 13,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 10,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateButtonText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  modalSaveButton: {
    backgroundColor: '#667eea',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  modalSaveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProgressTrackingScreen;
