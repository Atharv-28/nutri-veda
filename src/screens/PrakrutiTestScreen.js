import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { saveAssessment, saveDietPlan } from '../services/relationshipService';

const questions = [
  {
    id: 1,
    question: "What is your body build?",
    options: [
      { text: "Thin, light frame", dosha: "vata", points: 2 },
      { text: "Medium build", dosha: "pitta", points: 2 },
      { text: "Large, heavy frame", dosha: "kapha", points: 2 }
    ]
  },
  {
    id: 2,
    question: "How is your skin?",
    options: [
      { text: "Dry, rough, cool", dosha: "vata", points: 2 },
      { text: "Warm, oily, prone to rashes", dosha: "pitta", points: 2 },
      { text: "Thick, oily, cool, smooth", dosha: "kapha", points: 2 }
    ]
  },
  {
    id: 3,
    question: "How is your hair?",
    options: [
      { text: "Dry, brittle, thin", dosha: "vata", points: 2 },
      { text: "Fine, oily, early graying", dosha: "pitta", points: 2 },
      { text: "Thick, oily, wavy, lustrous", dosha: "kapha", points: 2 }
    ]
  },
  {
    id: 4,
    question: "How is your appetite?",
    options: [
      { text: "Variable, skip meals easily", dosha: "vata", points: 2 },
      { text: "Strong, get irritable when hungry", dosha: "pitta", points: 2 },
      { text: "Steady, can skip meals without discomfort", dosha: "kapha", points: 2 }
    ]
  },
  {
    id: 5,
    question: "How is your digestion?",
    options: [
      { text: "Irregular, gas, bloating", dosha: "vata", points: 2 },
      { text: "Strong, heartburn, loose stools", dosha: "pitta", points: 2 },
      { text: "Slow but steady", dosha: "kapha", points: 2 }
    ]
  },
  {
    id: 6,
    question: "How is your sleep?",
    options: [
      { text: "Light, interrupted, 6-7 hours", dosha: "vata", points: 2 },
      { text: "Sound, moderate, 6-8 hours", dosha: "pitta", points: 2 },
      { text: "Deep, long, 8+ hours", dosha: "kapha", points: 2 }
    ]
  },
  {
    id: 7,
    question: "How is your energy level?",
    options: [
      { text: "Comes in bursts, gets tired easily", dosha: "vata", points: 2 },
      { text: "Moderate, consistent", dosha: "pitta", points: 2 },
      { text: "Steady, good endurance", dosha: "kapha", points: 2 }
    ]
  },
  {
    id: 8,
    question: "How is your mental activity?",
    options: [
      { text: "Quick thinking, restless mind", dosha: "vata", points: 2 },
      { text: "Sharp, focused, judgmental", dosha: "pitta", points: 2 },
      { text: "Calm, steady, good long-term memory", dosha: "kapha", points: 2 }
    ]
  }
];

const PrakrutiTestScreen = ({ navigation, route }) => {
  const { patient, doctor, fromPatientDashboard, role } = route.params || {};
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);

  const generateDietPlan = (dosha, patientData) => {
    const dietPlans = {
      vata: {
        meals: {
          breakfast: ['Warm oatmeal with ghee', 'Stewed fruits', 'Herbal tea with ginger'],
          lunch: ['Kitchari (rice and lentils)', 'Steamed vegetables', 'Warm soup'],
          dinner: ['Warm vegetable stew', 'Whole grain bread', 'Herbal tea'],
          snacks: ['Nuts and dried fruits', 'Warm milk with honey', 'Banana']
        },
        recommendations: [
          'Eat warm, cooked, and moist foods',
          'Favor sweet, sour, and salty tastes',
          'Avoid cold, dry, and raw foods',
          'Maintain regular meal times',
          'Use warming spices like ginger, cumin, and cinnamon',
          'Stay hydrated with warm beverages'
        ]
      },
      pitta: {
        meals: {
          breakfast: ['Cool oatmeal with milk', 'Fresh fruits', 'Coconut water'],
          lunch: ['Basmati rice with vegetables', 'Salad with cucumber', 'Buttermilk'],
          dinner: ['Quinoa with greens', 'Steamed vegetables', 'Herbal cooling tea'],
          snacks: ['Fresh fruits', 'Coconut water', 'Sweet lassi']
        },
        recommendations: [
          'Eat cooling and refreshing foods',
          'Favor sweet, bitter, and astringent tastes',
          'Avoid spicy, oily, and fried foods',
          'Avoid excessive heat and sun',
          'Use cooling spices like coriander, fennel, and mint',
          'Drink plenty of cool (not cold) water'
        ]
      },
      kapha: {
        meals: {
          breakfast: ['Light breakfast', 'Herbal tea with honey', 'Fresh fruits'],
          lunch: ['Light grain with vegetables', 'Bean soup', 'Ginger tea'],
          dinner: ['Light vegetable soup', 'Steamed vegetables', 'Herbal tea'],
          snacks: ['Fresh fruits', 'Honey', 'Herbal tea']
        },
        recommendations: [
          'Eat light, warm, and dry foods',
          'Favor pungent, bitter, and astringent tastes',
          'Avoid heavy, oily, and cold foods',
          'Exercise regularly to stimulate metabolism',
          'Use warming spices like black pepper, ginger, and turmeric',
          'Reduce dairy and sweet foods'
        ]
      }
    };

    return dietPlans[dosha] || dietPlans.vata;
  };

  const handleAnswer = (option) => {
    const newAnswers = { ...answers, [currentQuestion]: option };
    setAnswers(newAnswers);
    // user will navigate with Next/Previous buttons
  };
  
  const handleNext = () => {
    if (!answers[currentQuestion]) {
      Alert.alert('Please select an option', 'Choose an option before proceeding to the next question.');
      return;
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult(answers);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      navigation.goBack();
    }
  };

  // Navigate to the correct dashboard depending on the logged-in role.
  const handleGoToDashboard = () => {
    if (fromPatientDashboard && patient) {
      // Navigate back to patient dashboard with updated data
      navigation.navigate('PatientDashboard', { 
        patient: {
          ...patient,
          dosha: showResult.dominant,
          hasCompletedAssessment: true,
          hasDietPlan: true
        },
        doctor
      });
      return;
    }
    
    const roleFromRoute = route?.params?.role || role;
    if (roleFromRoute === 'doctor') {
      navigation.navigate('DoctorDashboard');
      return;
    }
    if (roleFromRoute === 'patient') {
      navigation.navigate('PatientDashboard', {
        patient: {
          ...patient,
          dosha: showResult.dominant,
          hasCompletedAssessment: true,
          hasDietPlan: true
        },
        doctor
      });
      return;
    }
    
    navigation.goBack();
  };

  const calculateResult = async (allAnswers) => {
    const scores = { vata: 0, pitta: 0, kapha: 0 };
    
    Object.values(allAnswers).forEach(answer => {
      scores[answer.dosha] += answer.points;
    });

    const dominant = Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    );

    // Save assessment to Firestore
    if (patient?.uid) {
      setSaving(true);
      try {
        console.log('💾 Saving assessment results...');
        
        // Save assessment to assessments collection
        const assessmentData = {
          patientId: patient.uid,
          patientName: patient.fullName || patient.name,
          doctorId: patient.assignedDoctorId || null,
          dosha: dominant,
          scores: scores,
          answers: allAnswers,
          completedAt: new Date().toISOString()
        };
        
        await saveAssessment(assessmentData);
        
        // Update patient document with assessment results
        await updateDoc(doc(db, 'patients', patient.uid), {
          dosha: dominant,
          doshaScores: scores,
          hasCompletedAssessment: true,
          lastAssessmentDate: new Date().toISOString()
        });
        
        // Generate basic diet plan automatically
        const dietPlan = generateDietPlan(dominant, patient);
        
        // Save diet plan to Firestore
        await saveDietPlan({
          patientId: patient.uid,
          patientName: patient.fullName || patient.name,
          doctorId: patient.assignedDoctorId || 'system',
          doctorName: patient.assignedDoctorName || 'Auto-generated',
          dosha: dominant,
          meals: dietPlan.meals,
          recommendations: dietPlan.recommendations,
          createdAt: new Date().toISOString()
        });
        
        // Update patient document with diet plan flag
        await updateDoc(doc(db, 'patients', patient.uid), {
          hasDietPlan: true
        });
        
        console.log('✅ Assessment and diet plan saved successfully');
        
      } catch (error) {
        console.error('❌ Error saving assessment:', error);
        Alert.alert('Error', 'Failed to save assessment results. Please try again.');
      } finally {
        setSaving(false);
      }
    }

    setShowResult({ dominant, scores });
  };

  const getDoshaDescription = (dosha) => {
    const descriptions = {
      vata: { 
        title: 'Vata Dominant', 
        description: 'You have a Vata constitution characterized by creativity, quick thinking, and adaptability. You may experience dry skin, irregular digestion, and variable energy levels.',
        color: '#8E44AD',
        characteristics: ['Light frame', 'Quick movements', 'Creative mind', 'Variable appetite'],
      },
      pitta: { 
        title: 'Pitta Dominant', 
        description: 'You have a Pitta constitution characterized by strong digestion, sharp intellect, and leadership qualities. You may experience heat sensitivity and irritability when hungry.',
        color: '#E74C3C',
        characteristics: ['Medium build', 'Sharp mind', 'Strong appetite', 'Warm body'],
      },
      kapha: { 
        title: 'Kapha Dominant', 
        description: 'You have a Kapha constitution characterized by stability, strength, and calm demeanor. You have good endurance but may gain weight easily.',
        color: '#27AE60',
        characteristics: ['Solid frame', 'Calm nature', 'Steady energy', 'Good stamina'],
      }
    };
    return descriptions[dosha];
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleCancelTest = () => {
    Alert.alert(
      'Cancel Assessment',
      'Are you sure you want to cancel the assessment? Your progress will be lost.',
      [
        { text: 'No' },
        { text: 'Yes', style: 'destructive', onPress: () => {
            resetTest();
            navigation.goBack();
          }
        }
      ]
    );
  };

  if (showResult) {
    const result = getDoshaDescription(showResult.dominant);
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.resultCard}>
            <Ionicons name="checkmark-circle" size={64} color={result.color} />
            <Text style={styles.resultTitle}>{result.title}</Text>
            <Text style={styles.resultDescription}>{result.description}</Text>
            
            <View style={styles.characteristicsContainer}>
              <Text style={styles.sectionTitle}>Your Characteristics:</Text>
              {result.characteristics.map((char, index) => (
                <View key={index} style={styles.characteristicItem}>
                  <Ionicons name="checkmark" size={16} color={result.color} />
                  <Text style={styles.characteristicText}>{char}</Text>
                </View>
              ))}
            </View>

            <View style={styles.scoresContainer}>
              <Text style={styles.sectionTitle}>Your Dosha Scores:</Text>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Vata:</Text>
                <View style={styles.scoreBar}>
                  <View style={[styles.scoreBarFill, { width: `${(showResult.scores.vata / 16) * 100}%`, backgroundColor: '#8E44AD' }]} />
                </View>
                <Text style={styles.scoreValue}>{showResult.scores.vata}</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Pitta:</Text>
                <View style={styles.scoreBar}>
                  <View style={[styles.scoreBarFill, { width: `${(showResult.scores.pitta / 16) * 100}%`, backgroundColor: '#E74C3C' }]} />
                </View>
                <Text style={styles.scoreValue}>{showResult.scores.pitta}</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Kapha:</Text>
                <View style={styles.scoreBar}>
                  <View style={[styles.scoreBarFill, { width: `${(showResult.scores.kapha / 16) * 100}%`, backgroundColor: '#27AE60' }]} />
                </View>
                <Text style={styles.scoreValue}>{showResult.scores.kapha}</Text>
              </View>
            </View>

            {saving ? (
              <View style={styles.savingContainer}>
                <ActivityIndicator size="large" color="#667eea" />
                <Text style={styles.savingText}>Saving your results and generating diet plan...</Text>
              </View>
            ) : (
              <>
                <View style={styles.successContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#28a745" />
                  <Text style={styles.successText}>Assessment saved! Diet plan generated.</Text>
                </View>

                <TouchableOpacity 
                  style={styles.continueButton} 
                  onPress={() => navigation.navigate('DietPlan', { 
                    dosha: showResult.dominant,
                    patient,
                    doctor,
                    readOnly: true
                  })}
                >
                  <Text style={styles.buttonText}>View My Diet Plan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.goHomeButton}
                  onPress={handleGoToDashboard}
                >
                  <Text style={styles.buttonText}>Go to Dashboard</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.retakeButton} onPress={resetTest}>
                  <Text style={styles.retakeButtonText}>Retake Test</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={[styles.header, styles.headerRow]}>
        <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Prakruti Assessment</Text>
          <Text style={styles.progressText}>
            Question {currentQuestion + 1} of {questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        <TouchableOpacity onPress={handleCancelTest} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            {questions[currentQuestion].question}
          </Text>
          
          <View style={styles.optionsContainer}>
            {questions[currentQuestion].options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  answers[currentQuestion] && answers[currentQuestion].text === option.text ? styles.optionSelected : null
                ]}
                onPress={() => handleAnswer(option)}
              >
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.navButtonsRow}>
            <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navButton, !answers[currentQuestion] ? styles.navButtonDisabled : null]} onPress={handleNext}>
              <Text style={styles.navButtonText}>{currentQuestion < questions.length - 1 ? 'Next' : 'Finish'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 12,
    paddingTop: 16,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { padding: 8 },
  cancelText: { color: 'rgba(255,255,255,0.9)', fontSize: 16 },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressText: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 15,
  },
  optionButton: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  optionSelected: {
    backgroundColor: '#e9eefc',
    borderColor: '#667eea',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  navButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#667eea',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#bfc6ff',
  },
  navButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 15,
  },
  resultDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  scoresContainer: {
    width: '100%',
    marginBottom: 20,
  },
  scoresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recommendationsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  retakeButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 10,
  },
  retakeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    width: '100%',
    marginBottom: 10,
  },
  goHomeButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  characteristicsContainer: {
    width: '100%',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  characteristicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  characteristicText: {
    fontSize: 15,
    color: '#555',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 5,
  },
  scoreBar: {
    flex: 1,
    height: 20,
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  savingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  savingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  successText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#155724',
    fontWeight: '500',
  },
});

export default PrakrutiTestScreen;
