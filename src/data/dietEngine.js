// Advanced Diet Plan Generation Engine
// This module creates personalized diet plans based on detailed Prakruti assessment

export class DietPlanEngine {
  constructor() {
    this.foodDatabase = {
      vata: {
        favorable: {
          grains: ['rice', 'wheat', 'oats', 'quinoa'],
          vegetables: ['carrots', 'beets', 'sweet potatoes', 'asparagus'],
          fruits: ['bananas', 'avocados', 'mangoes', 'dates', 'figs'],
          proteins: ['mung dal', 'tofu', 'eggs', 'chicken', 'fish'],
          dairy: ['warm milk', 'ghee', 'fresh cheese'],
          spices: ['ginger', 'cinnamon', 'cardamom', 'cumin', 'coriander'],
          oils: ['sesame oil', 'olive oil', 'ghee']
        },
        unfavorable: {
          foods: ['raw vegetables', 'cold foods', 'dry foods', 'carbonated drinks'],
          excess: ['bitter', 'pungent', 'astringent']
        }
      },
      pitta: {
        favorable: {
          grains: ['basmati rice', 'wheat', 'barley', 'oats'],
          vegetables: ['leafy greens', 'cucumber', 'zucchini', 'broccoli'],
          fruits: ['melons', 'grapes', 'coconut', 'pomegranate'],
          proteins: ['mung dal', 'chickpeas', 'tofu', 'white meat'],
          dairy: ['milk', 'ghee', 'fresh butter'],
          spices: ['coriander', 'fennel', 'cardamom', 'mint', 'dill'],
          oils: ['coconut oil', 'sunflower oil', 'ghee']
        },
        unfavorable: {
          foods: ['spicy foods', 'fermented foods', 'citrus fruits', 'tomatoes'],
          excess: ['sour', 'salty', 'pungent']
        }
      },
      kapha: {
        favorable: {
          grains: ['barley', 'millet', 'quinoa', 'buckwheat'],
          vegetables: ['leafy greens', 'cabbage', 'cauliflower', 'radish'],
          fruits: ['apples', 'pears', 'berries', 'pomegranate'],
          proteins: ['red lentils', 'black beans', 'lean meat'],
          dairy: ['low-fat milk', 'buttermilk'],
          spices: ['ginger', 'black pepper', 'turmeric', 'mustard seeds'],
          oils: ['mustard oil', 'sunflower oil (small amounts)']
        },
        unfavorable: {
          foods: ['heavy foods', 'oily foods', 'cold foods', 'sweet foods'],
          excess: ['sweet', 'sour', 'salty']
        }
      }
    };

    this.mealTemplates = {
      vata: {
        timing: { breakfast: '7-8 AM', lunch: '12-1 PM', dinner: '6-7 PM' },
        portions: { large: 'lunch', medium: 'breakfast', small: 'dinner' },
        temperature: 'warm',
        consistency: 'moist, oily'
      },
      pitta: {
        timing: { breakfast: '6-7 AM', lunch: '12-1 PM', dinner: '7-8 PM' },
        portions: { large: 'lunch', medium: 'breakfast', medium2: 'dinner' },
        temperature: 'cool to moderate',
        consistency: 'moderate'
      },
      kapha: {
        timing: { breakfast: '7-8 AM', lunch: '11 AM-12 PM', dinner: '5-6 PM' },
        portions: { small: 'breakfast', large: 'lunch', small2: 'dinner' },
        temperature: 'warm to hot',
        consistency: 'light, dry'
      }
    };
  }

  // Generate personalized diet plan based on assessment scores and individual factors
  generatePersonalizedPlan(assessmentData) {
    const { dominant, scores, age, gender, activity, health, season } = assessmentData;
    
    // Calculate dosha percentages
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const doshaPercentages = {};
    Object.keys(scores).forEach(dosha => {
      doshaPercentages[dosha] = (scores[dosha] / total) * 100;
    });

    // Base plan on dominant dosha
    let basePlan = this.createBasePlan(dominant);

    // Modify based on secondary doshas
    basePlan = this.adjustForSecondaryDoshas(basePlan, doshaPercentages, dominant);

    // Personalize based on individual factors
    basePlan = this.personalizeForFactors(basePlan, { age, gender, activity, health, season });

    return {
      ...basePlan,
      doshaProfile: {
        dominant,
        percentages: doshaPercentages,
        constitution: this.getConstitutionType(doshaPercentages)
      },
      personalizedRecommendations: this.generateSpecificRecommendations(assessmentData)
    };
  }

  createBasePlan(dosha) {
    const foods = this.foodDatabase[dosha];
    const template = this.mealTemplates[dosha];

    return {
      dosha,
      mealTiming: template.timing,
      portionGuidance: template.portions,
      foodPreferences: {
        temperature: template.temperature,
        consistency: template.consistency
      },
      meals: {
        breakfast: this.generateMeal('breakfast', foods, dosha),
        lunch: this.generateMeal('lunch', foods, dosha),
        dinner: this.generateMeal('dinner', foods, dosha),
        snacks: this.generateSnacks(foods, dosha)
      },
      beverages: this.generateBeverages(dosha),
      spiceRecommendations: foods.favorable.spices,
      foodsToAvoid: foods.unfavorable.foods
    };
  }

  generateMeal(mealType, foods, dosha) {
    const meals = {
      vata: {
        breakfast: [
          `Warm ${foods.favorable.grains[0]} porridge with ${foods.favorable.spices[0]}`,
          `Cooked ${foods.favorable.fruits[0]} with ${foods.favorable.dairy[2]}`,
          `${foods.favorable.spices[1]} tea`
        ],
        lunch: [
          `${foods.favorable.grains[0]} with ${foods.favorable.proteins[0]}`,
          `Steamed ${foods.favorable.vegetables[0]} and ${foods.favorable.vegetables[1]}`,
          `${foods.favorable.dairy[0]} with ${foods.favorable.spices[2]}`
        ],
        dinner: [
          `Light ${foods.favorable.grains[1]} soup`,
          `Sautéed ${foods.favorable.vegetables[2]} with ${foods.favorable.oils[0]}`,
          `Herbal tea with ${foods.favorable.fruits[3]}`
        ]
      },
      pitta: {
        breakfast: [
          `Cool ${foods.favorable.grains[0]} with ${foods.favorable.fruits[1]}`,
          `${foods.favorable.dairy[0]} smoothie with ${foods.favorable.fruits[2]}`,
          `${foods.favorable.spices[3]} tea (room temperature)`
        ],
        lunch: [
          `${foods.favorable.grains[1]} with ${foods.favorable.proteins[1]}`,
          `Fresh ${foods.favorable.vegetables[0]} salad`,
          `${foods.favorable.dairy[1]} lassi with ${foods.favorable.spices[0]}`
        ],
        dinner: [
          `Light ${foods.favorable.grains[2]} with ${foods.favorable.vegetables[2]}`,
          `Steamed ${foods.favorable.vegetables[3]}`,
          `Cool herbal tea`
        ]
      },
      kapha: {
        breakfast: [
          `Warm spiced ${foods.favorable.grains[1]}`,
          `Light ${foods.favorable.fruits[0]} with ${foods.favorable.spices[0]}`,
          `${foods.favorable.spices[1]} tea`
        ],
        lunch: [
          `${foods.favorable.grains[2]} with ${foods.favorable.proteins[1]}`,
          `Steamed ${foods.favorable.vegetables[1]} with ${foods.favorable.spices[2]}`,
          `${foods.favorable.dairy[1]}`
        ],
        dinner: [
          `Light ${foods.favorable.vegetables[0]} soup`,
          `Sautéed ${foods.favorable.vegetables[2]} with ${foods.favorable.spices[3]}`,
          `Warm herbal tea`
        ]
      }
    };

    return meals[dosha][mealType] || [];
  }

  generateSnacks(foods, dosha) {
    const snacks = {
      vata: [`${foods.favorable.fruits[3]} and ${foods.favorable.proteins[0].split(' ')[0]} nuts`, 'Warm spiced milk'],
      pitta: [`${foods.favorable.fruits[1]}`, `${foods.favorable.fruits[2]} water`],
      kapha: [`${foods.favorable.fruits[0]} with ${foods.favorable.spices[0]}`, 'Herbal tea']
    };
    return snacks[dosha] || [];
  }

  generateBeverages(dosha) {
    const beverages = {
      vata: ['Warm water', 'Herbal teas (ginger, cinnamon)', 'Warm milk with spices'],
      pitta: ['Room temperature water', 'Coconut water', 'Mint tea', 'Rose water'],
      kapha: ['Warm water', 'Ginger tea', 'Honey water (warm)', 'Spiced teas']
    };
    return beverages[dosha] || [];
  }

  adjustForSecondaryDoshas(basePlan, percentages, dominant) {
    // If secondary dosha is significant (>30%), incorporate some elements
    const sortedDoshas = Object.entries(percentages)
      .sort(([,a], [,b]) => b - a)
      .filter(([dosha]) => dosha !== dominant);

    if (sortedDoshas.length > 0 && sortedDoshas[0][1] > 30) {
      const secondaryDosha = sortedDoshas[0][0];
      // Add some foods and recommendations from secondary dosha
      const secondaryFoods = this.foodDatabase[secondaryDosha];
      
      // Mix in some secondary dosha foods
      basePlan.meals.snacks.push(...this.generateSnacks(secondaryFoods, secondaryDosha).slice(0, 1));
      basePlan.spiceRecommendations.push(...secondaryFoods.favorable.spices.slice(0, 2));
    }

    return basePlan;
  }

  personalizeForFactors(basePlan, factors) {
    const { age, gender, activity, health, season } = factors;

    // Age adjustments
    if (age < 16 || age > 60) {
      basePlan.specialNotes = basePlan.specialNotes || [];
      basePlan.specialNotes.push('Easily digestible foods recommended due to age');
    }

    // Activity level adjustments
    if (activity === 'high') {
      basePlan.specialNotes = basePlan.specialNotes || [];
      basePlan.specialNotes.push('Increase portion sizes and include more proteins');
    }

    // Seasonal adjustments
    if (season) {
      basePlan.seasonalAdjustments = this.getSeasonalAdjustments(basePlan.dosha, season);
    }

    // Health condition adjustments
    if (health && health.length > 0) {
      basePlan.healthAdjustments = this.getHealthAdjustments(health);
    }

    return basePlan;
  }

  getSeasonalAdjustments(dosha, season) {
    const adjustments = {
      spring: 'Reduce kapha-increasing foods, add more bitter and pungent tastes',
      summer: 'Focus on cooling foods, avoid excessive heat and spice',
      monsoon: 'Boost digestion with warm, light foods',
      winter: 'Increase warming foods and healthy fats'
    };
    return adjustments[season] || '';
  }

  getHealthAdjustments(healthConditions) {
    const adjustments = {
      diabetes: 'Avoid sweet and refined foods, focus on complex carbs',
      hypertension: 'Reduce salt intake, increase potassium-rich foods',
      digestive: 'Focus on easily digestible foods, proper food combining'
    };
    
    return healthConditions.map(condition => adjustments[condition]).filter(Boolean);
  }

  getConstitutionType(percentages) {
    const sorted = Object.entries(percentages).sort(([,a], [,b]) => b - a);
    const [first, second] = sorted;
    
    if (first[1] > 60) return `${first[0]}-dominant`;
    if (first[1] > 40 && second[1] > 30) return `${first[0]}-${second[0]}`;
    return 'tri-doshic';
  }

  generateSpecificRecommendations(assessmentData) {
    const { dominant, age, activity, health } = assessmentData;
    
    const recommendations = [];
    
    // Dosha-specific recommendations
    const doshaRecs = {
      vata: [
        'Eat at regular intervals',
        'Favor warm, cooked foods',
        'Practice calming activities like meditation',
        'Go to bed early (before 10 PM)'
      ],
      pitta: [
        'Avoid skipping meals',
        'Stay cool and avoid excessive heat',
        'Practice moderation in all activities',
        'Include cooling activities like swimming'
      ],
      kapha: [
        'Eat your largest meal at midday',
        'Stay active and exercise regularly',
        'Avoid heavy, oily foods',
        'Wake up early (before 6 AM)'
      ]
    };

    recommendations.push(...doshaRecs[dominant]);

    // Activity-based recommendations
    if (activity === 'low') {
      recommendations.push('Start with gentle exercises like walking or yoga');
    } else if (activity === 'high') {
      recommendations.push('Ensure adequate rest and recovery time');
    }

    return recommendations;
  }

  // Method to update plan based on progress and feedback
  updatePlanBasedOnFeedback(currentPlan, feedback) {
    // This would allow dynamic adjustment of the diet plan
    // based on patient feedback and progress
    const updatedPlan = { ...currentPlan };
    
    if (feedback.energyLevel === 'low') {
      updatedPlan.recommendations = updatedPlan.recommendations || [];
      updatedPlan.recommendations.push('Consider adding more warming spices and proteins');
    }
    
    if (feedback.digestion === 'poor') {
      updatedPlan.recommendations.push('Focus on lighter, more easily digestible foods');
    }
    
    return updatedPlan;
  }
}

// Usage example:
// const engine = new DietPlanEngine();
// const assessmentData = {
//   dominant: 'vata',
//   scores: { vata: 14, pitta: 8, kapha: 6 },
//   age: 30,
//   gender: 'female',
//   activity: 'moderate',
//   health: ['digestive'],
//   season: 'winter'
// };
// const personalizedPlan = engine.generatePersonalizedPlan(assessmentData);
