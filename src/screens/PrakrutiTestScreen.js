import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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

const PrakrutiTestScreen = ({ navigation }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (option) => {
    const newAnswers = {
      ...answers,
      [currentQuestion]: option
    };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (allAnswers) => {
    const scores = { vata: 0, pitta: 0, kapha: 0 };
    
    Object.values(allAnswers).forEach(answer => {
      scores[answer.dosha] += answer.points;
    });

    const dominant = Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    );

    setShowResult({ dominant, scores });
  };

  const getDoshaDescription = (dosha) => {
    const descriptions = {
      vata: {
        title: "Vata Dominant",
        description: "You are creative, energetic, and adaptable. Focus on warm, grounding foods and regular routines.",
        color: "#8E44AD",
        foods: "Warm, cooked foods, sweet fruits, nuts, dairy products",
        avoid: "Cold, dry, raw foods, excessive caffeine"
      },
      pitta: {
        title: "Pitta Dominant", 
        description: "You are focused, intelligent, and goal-oriented. Choose cooling foods and avoid excessive heat.",
        color: "#E74C3C",
        foods: "Cool, sweet foods, leafy greens, coconut, melons",
        avoid: "Spicy, sour, salty foods, excessive heat"
      },
      kapha: {
        title: "Kapha Dominant",
        description: "You are calm, stable, and nurturing. Light, warm, spicy foods will energize you.",
        color: "#27AE60",
        foods: "Light, warm, spicy foods, vegetables, legumes",
        avoid: "Heavy, oily, sweet, cold foods"
      }
    };
    return descriptions[dosha];
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
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
            
            <View style={styles.scoresContainer}>
              <Text style={styles.scoresTitle}>Your Dosha Scores:</Text>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Vata:</Text>
                <Text style={styles.scoreValue}>{showResult.scores.vata}</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Pitta:</Text>
                <Text style={styles.scoreValue}>{showResult.scores.pitta}</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Kapha:</Text>
                <Text style={styles.scoreValue}>{showResult.scores.kapha}</Text>
              </View>
            </View>

            <View style={styles.recommendationsContainer}>
              <Text style={styles.recommendationTitle}>Recommended Foods:</Text>
              <Text style={styles.recommendationText}>{result.foods}</Text>
              
              <Text style={styles.recommendationTitle}>Foods to Avoid:</Text>
              <Text style={styles.recommendationText}>{result.avoid}</Text>
            </View>

            <TouchableOpacity style={styles.retakeButton} onPress={resetTest}>
              <Text style={styles.buttonText}>Retake Test</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={() => navigation.navigate('DietPlan', { dosha: showResult.dominant })}
            >
              <Text style={styles.buttonText}>Get Diet Plan</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            {questions[currentQuestion].question}
          </Text>
          
          <View style={styles.optionsContainer}>
            {questions[currentQuestion].options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() => handleAnswer(option)}
              >
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
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
    padding: 20,
    paddingTop: 50,
  },
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
  optionText: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
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
  continueButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PrakrutiTestScreen;
