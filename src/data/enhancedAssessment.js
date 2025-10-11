// Enhanced Prakruti Assessment System
// More comprehensive assessment for better diet plan generation

export const enhancedQuestions = [
  {
    id: 1,
    category: 'Physical Constitution',
    question: "What is your body build?",
    options: [
      { text: "Thin, light frame, prominent bones", dosha: "vata", points: 3 },
      { text: "Medium build, well-proportioned", dosha: "pitta", points: 3 },
      { text: "Large, heavy frame, broad shoulders", dosha: "kapha", points: 3 }
    ]
  },
  {
    id: 2,
    category: 'Physical Constitution',
    question: "How is your skin texture and appearance?",
    options: [
      { text: "Dry, rough, cool to touch, thin", dosha: "vata", points: 2 },
      { text: "Warm, oily, soft, prone to rashes/acne", dosha: "pitta", points: 2 },
      { text: "Thick, oily, cool, smooth, pale", dosha: "kapha", points: 2 }
    ]
  },
  {
    id: 3,
    category: 'Physical Constitution',
    question: "Describe your hair characteristics:",
    options: [
      { text: "Dry, brittle, thin, coarse", dosha: "vata", points: 2 },
      { text: "Fine, oily, early graying/balding", dosha: "pitta", points: 2 },
      { text: "Thick, oily, wavy, lustrous, strong", dosha: "kapha", points: 2 }
    ]
  },
  {
    id: 4,
    category: 'Digestive Patterns',
    question: "How is your appetite throughout the day?",
    options: [
      { text: "Variable, sometimes forget to eat", dosha: "vata", points: 3 },
      { text: "Strong, get irritable when hungry", dosha: "pitta", points: 3 },
      { text: "Steady, can skip meals easily", dosha: "kapha", points: 3 }
    ]
  },
  {
    id: 5,
    category: 'Digestive Patterns',
    question: "How is your digestion after meals?",
    options: [
      { text: "Variable, sometimes bloated/gassy", dosha: "vata", points: 2 },
      { text: "Strong, digest quickly, rarely bloated", dosha: "pitta", points: 2 },
      { text: "Slow, feel heavy after eating", dosha: "kapha", points: 2 }
    ]
  },
  {
    id: 6,
    category: 'Digestive Patterns',
    question: "What foods do you naturally crave?",
    options: [
      { text: "Sweet, sour, salty foods", dosha: "vata", points: 2 },
      { text: "Sweet, bitter, astringent foods", dosha: "pitta", points: 2 },
      { text: "Pungent, bitter, astringent foods", dosha: "kapha", points: 2 }
    ]
  },
  {
    id: 7,
    category: 'Mental & Emotional',
    question: "How do you typically handle stress?",
    options: [
      { text: "Become anxious, worried, restless", dosha: "vata", points: 2 },
      { text: "Become irritable, angry, impatient", dosha: "pitta", points: 2 },
      { text: "Become withdrawn, depressed, lethargic", dosha: "kapha", points: 2 }
    ]
  },
  {
    id: 8,
    category: 'Mental & Emotional',
    question: "Describe your memory and learning style:",
    options: [
      { text: "Quick to learn, quick to forget", dosha: "vata", points: 2 },
      { text: "Sharp memory, focused learning", dosha: "pitta", points: 2 },
      { text: "Slow to learn, excellent long-term memory", dosha: "kapha", points: 2 }
    ]
  },
  {
    id: 9,
    category: 'Sleep & Energy',
    question: "How is your sleep pattern?",
    options: [
      { text: "Light sleeper, difficulty falling asleep", dosha: "vata", points: 2 },
      { text: "Moderate sleep, wake up refreshed", dosha: "pitta", points: 2 },
      { text: "Deep sleeper, need more than 8 hours", dosha: "kapha", points: 2 }
    ]
  },
  {
    id: 10,
    category: 'Sleep & Energy',
    question: "When do you have the most energy?",
    options: [
      { text: "Energy comes in bursts, then crashes", dosha: "vata", points: 2 },
      { text: "Consistent energy throughout the day", dosha: "pitta", points: 2 },
      { text: "Slow to start, steady energy once going", dosha: "kapha", points: 2 }
    ]
  },
  {
    id: 11,
    category: 'Physical Activity',
    question: "What type of exercise do you prefer?",
    options: [
      { text: "Light, flexible activities (yoga, walking)", dosha: "vata", points: 2 },
      { text: "Moderate, competitive activities (swimming, cycling)", dosha: "pitta", points: 2 },
      { text: "Gentle, consistent activities (walking, light weights)", dosha: "kapha", points: 2 }
    ]
  },
  {
    id: 12,
    category: 'Environmental Preferences',
    question: "What weather/climate do you prefer?",
    options: [
      { text: "Warm, humid weather", dosha: "vata", points: 2 },
      { text: "Cool, moderate weather", dosha: "pitta", points: 2 },
      { text: "Warm, dry weather", dosha: "kapha", points: 2 }
    ]
  }
];

export const demographicQuestions = [
  {
    id: 'age',
    question: 'What is your age?',
    type: 'number',
    required: true
  },
  {
    id: 'gender',
    question: 'Gender:',
    type: 'select',
    options: ['Male', 'Female', 'Other'],
    required: true
  },
  {
    id: 'activity',
    question: 'Activity Level:',
    type: 'select',
    options: [
      { value: 'low', label: 'Sedentary (little or no exercise)' },
      { value: 'moderate', label: 'Moderate (exercise 3-4 times/week)' },
      { value: 'high', label: 'Active (exercise 5+ times/week)' }
    ],
    required: true
  },
  {
    id: 'health',
    question: 'Do you have any of these health conditions? (Select all that apply)',
    type: 'multiselect',
    options: [
      'Diabetes',
      'High Blood Pressure',
      'Digestive Issues',
      'Anxiety/Stress',
      'Sleep Issues',
      'Weight Management Concerns',
      'None of the above'
    ],
    required: false
  },
  {
    id: 'season',
    question: 'Current season in your location:',
    type: 'select',
    options: ['Spring', 'Summer', 'Monsoon', 'Winter'],
    required: false
  },
  {
    id: 'goals',
    question: 'What are your primary health goals? (Select all that apply)',
    type: 'multiselect',
    options: [
      'Weight Management',
      'Better Digestion',
      'Increased Energy',
      'Better Sleep',
      'Stress Management',
      'Overall Wellness',
      'Disease Prevention'
    ],
    required: false
  }
];

export class EnhancedAssessmentCalculator {
  constructor() {
    this.doshaCharacteristics = {
      vata: {
        keywords: ['variable', 'quick', 'light', 'dry', 'cold', 'rough', 'mobile'],
        traits: ['creativity', 'enthusiasm', 'flexibility', 'quick thinking']
      },
      pitta: {
        keywords: ['moderate', 'sharp', 'hot', 'oily', 'intense', 'penetrating'],
        traits: ['intelligence', 'focus', 'determination', 'leadership']
      },
      kapha: {
        keywords: ['steady', 'slow', 'heavy', 'cool', 'smooth', 'stable'],
        traits: ['stability', 'endurance', 'compassion', 'patience']
      }
    };
  }

  calculateDetailedResults(answers, demographics) {
    // Calculate basic dosha scores
    const basicScores = { vata: 0, pitta: 0, kapha: 0 };
    const categoryScores = {
      'Physical Constitution': { vata: 0, pitta: 0, kapha: 0 },
      'Digestive Patterns': { vata: 0, pitta: 0, kapha: 0 },
      'Mental & Emotional': { vata: 0, pitta: 0, kapha: 0 },
      'Sleep & Energy': { vata: 0, pitta: 0, kapha: 0 },
      'Physical Activity': { vata: 0, pitta: 0, kapha: 0 },
      'Environmental Preferences': { vata: 0, pitta: 0, kapha: 0 }
    };

    // Process answers
    Object.values(answers).forEach(answer => {
      const question = enhancedQuestions.find(q => q.id === answer.questionId);
      if (question) {
        basicScores[answer.dosha] += answer.points;
        if (categoryScores[question.category]) {
          categoryScores[question.category][answer.dosha] += answer.points;
        }
      }
    });

    // Calculate percentages
    const totalPoints = Object.values(basicScores).reduce((sum, score) => sum + score, 0);
    const percentages = {};
    Object.keys(basicScores).forEach(dosha => {
      percentages[dosha] = Math.round((basicScores[dosha] / totalPoints) * 100);
    });

    // Determine constitution type
    const dominant = Object.keys(basicScores).reduce((a, b) => 
      basicScores[a] > basicScores[b] ? a : b
    );

    const constitutionType = this.determineConstitutionType(percentages);
    const strengths = this.identifyStrengths(categoryScores, dominant);
    const imbalances = this.identifyPotentialImbalances(categoryScores, demographics);

    return {
      scores: basicScores,
      percentages,
      dominant,
      constitutionType,
      categoryBreakdown: categoryScores,
      strengths,
      imbalances,
      demographics,
      personalityTraits: this.doshaCharacteristics[dominant].traits,
      recommendations: this.generateLifestyleRecommendations(dominant, demographics)
    };
  }

  determineConstitutionType(percentages) {
    const sorted = Object.entries(percentages).sort(([,a], [,b]) => b - a);
    const [first, second, third] = sorted;

    if (first[1] >= 60) {
      return `${first[0]}-dominant`;
    } else if (first[1] >= 40 && second[1] >= 30) {
      return `${first[0]}-${second[0]}`;
    } else if (Math.abs(first[1] - second[1]) <= 10 && Math.abs(second[1] - third[1]) <= 10) {
      return 'tri-doshic (balanced)';
    } else {
      return `${first[0]}-${second[0]}`;
    }
  }

  identifyStrengths(categoryScores, dominant) {
    const strengths = [];
    
    Object.entries(categoryScores).forEach(([category, scores]) => {
      if (scores[dominant] > 4) { // High score in category
        switch(category) {
          case 'Physical Constitution':
            strengths.push('Strong physical foundation');
            break;
          case 'Digestive Patterns':
            strengths.push('Good digestive capacity');
            break;
          case 'Mental & Emotional':
            strengths.push('Stable mental-emotional state');
            break;
          case 'Sleep & Energy':
            strengths.push('Good energy and sleep patterns');
            break;
        }
      }
    });

    return strengths.length ? strengths : ['Balanced overall constitution'];
  }

  identifyPotentialImbalances(categoryScores, demographics) {
    const imbalances = [];
    
    // Check for category-specific imbalances
    Object.entries(categoryScores).forEach(([category, scores]) => {
      const maxScore = Math.max(...Object.values(scores));
      const dominantInCategory = Object.keys(scores).find(dosha => scores[dosha] === maxScore);
      
      // If one dosha is too dominant in a specific category
      if (maxScore > 6) {
        switch(category) {
          case 'Digestive Patterns':
            if (dominantInCategory === 'vata') {
              imbalances.push('Irregular digestion - focus on regular eating schedule');
            } else if (dominantInCategory === 'pitta') {
              imbalances.push('Strong digestive fire - avoid skipping meals');
            } else {
              imbalances.push('Slow digestion - incorporate digestive spices');
            }
            break;
          case 'Mental & Emotional':
            if (dominantInCategory === 'vata') {
              imbalances.push('Tendency toward anxiety - practice grounding activities');
            } else if (dominantInCategory === 'pitta') {
              imbalances.push('Tendency toward irritability - practice cooling activities');
            } else {
              imbalances.push('Tendency toward lethargy - increase stimulating activities');
            }
            break;
        }
      }
    });

    // Age-related considerations
    if (demographics.age < 16) {
      imbalances.push('Growing phase - ensure adequate nutrition for development');
    } else if (demographics.age > 50) {
      imbalances.push('Mature phase - focus on easily digestible foods');
    }

    // Activity level considerations
    if (demographics.activity === 'low') {
      imbalances.push('Low activity - gradually increase movement and exercise');
    } else if (demographics.activity === 'high') {
      imbalances.push('High activity - ensure adequate rest and recovery');
    }

    return imbalances.length ? imbalances : ['No significant imbalances detected'];
  }

  generateLifestyleRecommendations(dominant, demographics) {
    const baseRecommendations = {
      vata: [
        'Maintain regular daily routines',
        'Stay warm and avoid cold, windy weather',
        'Practice calming activities like meditation',
        'Get adequate sleep (8-9 hours)',
        'Eat warm, cooked foods at regular times'
      ],
      pitta: [
        'Stay cool and avoid excessive heat',
        'Practice moderation in all activities',
        'Avoid skipping meals',
        'Include cooling activities like swimming',
        'Practice stress management techniques'
      ],
      kapha: [
        'Stay active with regular exercise',
        'Wake up early (before 6 AM)',
        'Eat lighter meals, especially dinner',
        'Include stimulating and energizing activities',
        'Avoid excessive sleep and sedentary lifestyle'
      ]
    };

    let recommendations = [...baseRecommendations[dominant]];

    // Add age-specific recommendations
    if (demographics.age > 50) {
      recommendations.push('Focus on gentle, low-impact exercises');
      recommendations.push('Pay extra attention to digestive health');
    } else if (demographics.age < 25) {
      recommendations.push('Establish healthy habits early in life');
    }

    // Add activity-specific recommendations
    if (demographics.activity === 'low') {
      recommendations.push('Start with 15-20 minutes of daily walking');
    } else if (demographics.activity === 'high') {
      recommendations.push('Balance intense workouts with restorative practices');
    }

    // Add health-specific recommendations
    if (demographics.health && demographics.health.includes('Digestive Issues')) {
      recommendations.push('Eat mindfully and chew food thoroughly');
      recommendations.push('Consider consulting an Ayurvedic practitioner for digestive support');
    }

    return recommendations;
  }
}

// Export for use in assessment screens
export default {
  enhancedQuestions,
  demographicQuestions,
  EnhancedAssessmentCalculator
};
