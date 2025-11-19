/**
 * NutriVeda Diet Generation Engine
 * Generates personalized Ayurvedic diet plans based on Dosha imbalance,
 * Rasas (tastes), Agni (digestive fire), and Mindful Eating principles.
 */

// ============= ENUMS & TYPES =============

export const Dosha = {
  VATA: 'vata',
  PITTA: 'pitta',
  KAPHA: 'kapha'
};

export const Rasa = {
  SWEET: 'sweet',
  SOUR: 'sour',
  SALTY: 'salty',
  PUNGENT: 'pungent',
  BITTER: 'bitter',
  ASTRINGENT: 'astringent'
};

export const MealType = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACKS: 'snacks'
};

// ============= INGREDIENT DATABASE =============

const IngredientDatabase = {
  // VATA-BALANCING FOODS (Sweet, Sour, Salty)
  vataFoods: {
    grains: [
      { name: 'Basmati Rice', rasas: [Rasa.SWEET], isHeavy: true, isWarming: true, isOily: true },
      { name: 'Oatmeal (cooked)', rasas: [Rasa.SWEET], isHeavy: true, isWarming: true, isOily: true },
      { name: 'Wheat Bread', rasas: [Rasa.SWEET], isHeavy: true, isWarming: true, isOily: false },
      { name: 'Quinoa (cooked)', rasas: [Rasa.SWEET], isHeavy: true, isWarming: true, isOily: false }
    ],
    vegetables: [
      { name: 'Cooked Carrots', rasas: [Rasa.SWEET], isHeavy: true, isWarming: true, isOily: false },
      { name: 'Cooked Beets', rasas: [Rasa.SWEET], isHeavy: true, isWarming: true, isOily: false },
      { name: 'Sweet Potato (cooked)', rasas: [Rasa.SWEET], isHeavy: true, isWarming: true, isOily: false },
      { name: 'Cooked Zucchini', rasas: [Rasa.SWEET], isHeavy: false, isWarming: true, isOily: false }
    ],
    proteins: [
      { name: 'Mung Dal (cooked)', rasas: [Rasa.SWEET], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Paneer', rasas: [Rasa.SWEET], isHeavy: true, isWarming: false, isOily: true },
      { name: 'Eggs (cooked)', rasas: [Rasa.SWEET], isHeavy: true, isWarming: true, isOily: true },
      { name: 'Chicken (well-cooked)', rasas: [Rasa.SWEET], isHeavy: true, isWarming: true, isOily: true }
    ],
    fats: [
      { name: 'Ghee', rasas: [Rasa.SWEET], isHeavy: true, isWarming: true, isOily: true },
      { name: 'Sesame Oil', rasas: [Rasa.SWEET], isHeavy: true, isWarming: true, isOily: true },
      { name: 'Avocado', rasas: [Rasa.SWEET], isHeavy: true, isWarming: false, isOily: true }
    ],
    fruits: [
      { name: 'Stewed Apples', rasas: [Rasa.SWEET], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Ripe Bananas', rasas: [Rasa.SWEET], isHeavy: true, isWarming: false, isOily: false },
      { name: 'Cooked Pears', rasas: [Rasa.SWEET], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Sweet Mango', rasas: [Rasa.SWEET, Rasa.SOUR], isHeavy: true, isWarming: false, isOily: false }
    ],
    spices: [
      { name: 'Ginger', rasas: [Rasa.PUNGENT], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Cinnamon', rasas: [Rasa.SWEET, Rasa.PUNGENT], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Cardamom', rasas: [Rasa.SWEET, Rasa.PUNGENT], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Cumin', rasas: [Rasa.PUNGENT], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Fennel', rasas: [Rasa.SWEET], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Rock Salt', rasas: [Rasa.SALTY], isHeavy: false, isWarming: true, isOily: false }
    ],
    beverages: [
      { name: 'Warm Milk with Honey', rasas: [Rasa.SWEET], isHeavy: true, isWarming: true, isOily: true },
      { name: 'Ginger Tea', rasas: [Rasa.PUNGENT], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Warm Water', rasas: [Rasa.SWEET], isHeavy: false, isWarming: true, isOily: false }
    ]
  },

  // PITTA-BALANCING FOODS (Sweet, Bitter, Astringent)
  pittaFoods: {
    grains: [
      { name: 'Basmati Rice', rasas: [Rasa.SWEET], isHeavy: true, isWarming: false, isOily: false },
      { name: 'Barley', rasas: [Rasa.SWEET, Rasa.ASTRINGENT], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Oats (cooked)', rasas: [Rasa.SWEET], isHeavy: true, isWarming: false, isOily: false },
      { name: 'Wheat', rasas: [Rasa.SWEET], isHeavy: true, isWarming: false, isOily: false }
    ],
    vegetables: [
      { name: 'Cucumber', rasas: [Rasa.SWEET, Rasa.ASTRINGENT], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Cilantro', rasas: [Rasa.BITTER, Rasa.ASTRINGENT], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Leafy Greens', rasas: [Rasa.BITTER, Rasa.ASTRINGENT], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Zucchini', rasas: [Rasa.SWEET], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Asparagus', rasas: [Rasa.SWEET, Rasa.BITTER], isHeavy: false, isWarming: false, isOily: false }
    ],
    proteins: [
      { name: 'Mung Dal', rasas: [Rasa.SWEET, Rasa.ASTRINGENT], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Chickpeas', rasas: [Rasa.SWEET, Rasa.ASTRINGENT], isHeavy: true, isWarming: false, isOily: false },
      { name: 'Tofu', rasas: [Rasa.SWEET], isHeavy: true, isWarming: false, isOily: false }
    ],
    fats: [
      { name: 'Ghee (small amount)', rasas: [Rasa.SWEET], isHeavy: true, isWarming: false, isOily: true },
      { name: 'Coconut Oil', rasas: [Rasa.SWEET], isHeavy: true, isWarming: false, isOily: true },
      { name: 'Sunflower Oil', rasas: [Rasa.SWEET], isHeavy: false, isWarming: false, isOily: true }
    ],
    fruits: [
      { name: 'Sweet Grapes', rasas: [Rasa.SWEET], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Watermelon', rasas: [Rasa.SWEET], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Sweet Apple', rasas: [Rasa.SWEET, Rasa.ASTRINGENT], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Pomegranate', rasas: [Rasa.SWEET, Rasa.ASTRINGENT], isHeavy: false, isWarming: false, isOily: false }
    ],
    spices: [
      { name: 'Coriander', rasas: [Rasa.SWEET, Rasa.BITTER], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Fennel', rasas: [Rasa.SWEET], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Cardamom', rasas: [Rasa.SWEET, Rasa.PUNGENT], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Mint', rasas: [Rasa.PUNGENT, Rasa.BITTER], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Turmeric (small)', rasas: [Rasa.BITTER, Rasa.PUNGENT], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Dill', rasas: [Rasa.PUNGENT], isHeavy: false, isWarming: false, isOily: false }
    ],
    beverages: [
      { name: 'Coconut Water', rasas: [Rasa.SWEET], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Mint Tea', rasas: [Rasa.BITTER], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Rose Water', rasas: [Rasa.SWEET, Rasa.ASTRINGENT], isHeavy: false, isWarming: false, isOily: false }
    ]
  },

  // KAPHA-BALANCING FOODS (Pungent, Bitter, Astringent)
  kaphaFoods: {
    grains: [
      { name: 'Barley', rasas: [Rasa.SWEET, Rasa.ASTRINGENT], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Millet', rasas: [Rasa.SWEET, Rasa.ASTRINGENT], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Quinoa', rasas: [Rasa.SWEET, Rasa.ASTRINGENT], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Buckwheat', rasas: [Rasa.SWEET, Rasa.ASTRINGENT], isHeavy: false, isWarming: true, isOily: false }
    ],
    vegetables: [
      { name: 'Leafy Greens', rasas: [Rasa.BITTER, Rasa.ASTRINGENT], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Radish', rasas: [Rasa.PUNGENT], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Cabbage', rasas: [Rasa.SWEET, Rasa.ASTRINGENT], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Cauliflower', rasas: [Rasa.SWEET, Rasa.ASTRINGENT], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Bitter Gourd', rasas: [Rasa.BITTER], isHeavy: false, isWarming: false, isOily: false }
    ],
    proteins: [
      { name: 'Red Lentils', rasas: [Rasa.SWEET, Rasa.ASTRINGENT], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Mung Dal', rasas: [Rasa.SWEET, Rasa.ASTRINGENT], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Chickpeas (dry)', rasas: [Rasa.SWEET, Rasa.ASTRINGENT], isHeavy: false, isWarming: true, isOily: false }
    ],
    fats: [
      { name: 'Mustard Oil (small)', rasas: [Rasa.PUNGENT], isHeavy: false, isWarming: true, isOily: true },
      { name: 'Sunflower Oil (small)', rasas: [Rasa.SWEET], isHeavy: false, isWarming: false, isOily: true }
    ],
    fruits: [
      { name: 'Apple', rasas: [Rasa.SWEET, Rasa.ASTRINGENT], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Pear', rasas: [Rasa.SWEET, Rasa.ASTRINGENT], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Pomegranate', rasas: [Rasa.SWEET, Rasa.ASTRINGENT], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Cranberries', rasas: [Rasa.ASTRINGENT], isHeavy: false, isWarming: false, isOily: false }
    ],
    spices: [
      { name: 'Black Pepper', rasas: [Rasa.PUNGENT], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Ginger', rasas: [Rasa.PUNGENT], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Turmeric', rasas: [Rasa.BITTER, Rasa.PUNGENT], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Cinnamon', rasas: [Rasa.PUNGENT, Rasa.SWEET], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Cloves', rasas: [Rasa.PUNGENT], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Mustard Seeds', rasas: [Rasa.PUNGENT], isHeavy: false, isWarming: true, isOily: false }
    ],
    beverages: [
      { name: 'Ginger Tea', rasas: [Rasa.PUNGENT], isHeavy: false, isWarming: true, isOily: false },
      { name: 'Green Tea', rasas: [Rasa.BITTER, Rasa.ASTRINGENT], isHeavy: false, isWarming: false, isOily: false },
      { name: 'Warm Water with Honey', rasas: [Rasa.SWEET], isHeavy: false, isWarming: true, isOily: false }
    ]
  }
};

// ============= MINDFUL EATING PRINCIPLES =============

const MindfulEatingPrinciples = {
  preMealReminders: [
    '🧘 Sit in a calm, peaceful environment',
    '🙏 Take 3 deep breaths before eating',
    '💭 Express gratitude for the meal',
    '📵 Avoid distractions (TV, phone, work)',
    '😌 Ensure you are in a calm emotional state'
  ],
  duringMeal: [
    '🍽️ Chew each bite 32 times for optimal digestion',
    '👁️ Focus on the taste, texture, and aroma',
    '⏱️ Eat at a moderate, relaxed pace',
    '💧 Sip warm water between bites if needed',
    '🛑 Stop eating when 75% full',
    '🗣️ Avoid excessive conversation while eating'
  ],
  postMeal: [
    '🚶 Take a short 10-minute walk',
    '🧘 Sit in Vajrasana (thunderbolt pose) for 5-10 minutes',
    '💤 Rest for 15 minutes, but avoid sleeping immediately',
    '💧 Avoid cold water; sip warm water instead'
  ],
  timingRules: [
    '☀️ Largest meal at LUNCH (12 PM - 2 PM) when Agni is strongest',
    '🌅 Light breakfast to awaken digestion',
    '🌙 Lightest meal at DINNER (before 7 PM)',
    '⏰ Maintain regular meal times daily',
    '🍽️ Wait 3-4 hours between meals',
    '🤔 Only eat when truly hungry (check your Agni)'
  ]
};

// ============= AGNI ASSESSMENT =============

/**
 * Check if the user should eat based on hunger signals
 * @param {boolean} isHungry - User's hunger status
 * @returns {object} Recommendation
 */
export function checkAgni(isHungry) {
  if (!isHungry) {
    return {
      shouldEat: false,
      message: '🔥 Your Agni (digestive fire) may not be ready. Wait until you feel true hunger before eating.',
      recommendation: 'Try light movement, drink warm water, or wait 30-60 minutes.'
    };
  }
  return {
    shouldEat: true,
    message: '✅ Your Agni is ready. Enjoy your meal mindfully.',
    recommendation: 'Follow the pre-meal reminders for optimal digestion.'
  };
}

// ============= MEAL GENERATION ALGORITHM =============

/**
 * Select random items from an array
 * @param {Array} array - Source array
 * @param {number} count - Number of items to select
 * @returns {Array} Selected items
 */
function selectRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Generate a meal based on Dosha type and meal type
 * @param {string} doshaType - Dosha type (vata, pitta, kapha)
 * @param {string} mealType - Meal type (breakfast, lunch, dinner, snacks)
 * @returns {object} Meal composition
 */
function generateMeal(doshaType, mealType) {
  const doshaKey = `${doshaType}Foods`;
  const foodDatabase = IngredientDatabase[doshaKey];

  if (!foodDatabase) {
    throw new Error(`Invalid Dosha type: ${doshaType}`);
  }

  let meal = {};

  switch (mealType) {
    case MealType.BREAKFAST:
      // Light breakfast to awaken digestion
      meal = {
        grains: selectRandomItems(foodDatabase.grains, 1).map(i => i.name),
        fruits: selectRandomItems(foodDatabase.fruits, 2).map(i => i.name),
        beverages: selectRandomItems(foodDatabase.beverages, 1).map(i => i.name),
        portions: 'Light (1-1.5 cups total)',
        timing: '7:00 AM - 9:00 AM',
        note: 'Start your day gently. Breakfast should be light and easy to digest.'
      };
      break;

    case MealType.LUNCH:
      // Heaviest meal - Agni is strongest at noon
      meal = {
        grains: selectRandomItems(foodDatabase.grains, 2).map(i => i.name),
        vegetables: selectRandomItems(foodDatabase.vegetables, 3).map(i => i.name),
        proteins: selectRandomItems(foodDatabase.proteins, 2).map(i => i.name),
        fats: selectRandomItems(foodDatabase.fats, 1).map(i => i.name),
        beverages: selectRandomItems(foodDatabase.beverages, 1).map(i => i.name),
        portions: 'Substantial (2-3 cups total)',
        timing: '12:00 PM - 2:00 PM',
        note: '🔥 MAIN MEAL OF THE DAY. Your Agni is strongest now. Include all food groups.'
      };
      break;

    case MealType.DINNER:
      // Lightest meal - easy to digest
      meal = {
        grains: selectRandomItems(foodDatabase.grains, 1).map(i => i.name),
        vegetables: selectRandomItems(foodDatabase.vegetables, 2).map(i => i.name),
        proteins: selectRandomItems(foodDatabase.proteins, 1).map(i => i.name),
        beverages: selectRandomItems(foodDatabase.beverages, 1).map(i => i.name),
        portions: 'Light (1-1.5 cups total)',
        timing: '6:00 PM - 7:00 PM',
        note: '🌙 Keep it light and simple. Avoid heavy foods before sleep.'
      };
      break;

    case MealType.SNACKS:
      // Light snacks between meals if truly hungry
      meal = {
        fruits: selectRandomItems(foodDatabase.fruits, 1).map(i => i.name),
        beverages: selectRandomItems(foodDatabase.beverages, 1).map(i => i.name),
        portions: 'Very light (handful or 1/2 cup)',
        timing: 'Only if truly hungry between meals',
        note: 'Snack only when genuinely hungry. Wait 3-4 hours between meals.'
      };
      break;

    default:
      throw new Error(`Invalid meal type: ${mealType}`);
  }

  return meal;
}

// ============= MAIN ALGORITHM =============

/**
 * Generate a complete daily diet plan based on Dosha imbalance
 * @param {string} doshaType - The dominant/excess Dosha (vata, pitta, kapha)
 * @param {object} options - Additional options
 * @returns {object} Complete daily diet plan
 */
export function generateDailyPlan(doshaType, options = {}) {
  const doshaKey = `${doshaType}Foods`;
  const foodDatabase = IngredientDatabase[doshaKey];

  if (!foodDatabase) {
    throw new Error(`Invalid Dosha type: ${doshaType}. Must be one of: vata, pitta, kapha`);
  }

  // Dosha-specific goals
  const doshaGoals = {
    vata: {
      goal: 'Balance excess Vata',
      qualities: 'Warmth, Oiliness, Heaviness',
      rasas: 'Sweet, Sour, Salty',
      avoid: 'Cold, dry, raw foods',
      color: '#8E44AD'
    },
    pitta: {
      goal: 'Balance excess Pitta',
      qualities: 'Cooling, Heaviness, Dryness',
      rasas: 'Sweet, Bitter, Astringent',
      avoid: 'Spicy, sour, salty foods',
      color: '#E74C3C'
    },
    kapha: {
      goal: 'Balance excess Kapha',
      qualities: 'Lightness, Warmth, Dryness',
      rasas: 'Pungent, Bitter, Astringent',
      avoid: 'Heavy, oily, sweet foods',
      color: '#27AE60'
    }
  };

  // Generate meals
  const breakfast = generateMeal(doshaType, MealType.BREAKFAST);
  const lunch = generateMeal(doshaType, MealType.LUNCH);
  const dinner = generateMeal(doshaType, MealType.DINNER);
  const snacks = generateMeal(doshaType, MealType.SNACKS);

  // Compile complete plan
  return {
    doshaType: doshaType.charAt(0).toUpperCase() + doshaType.slice(1),
    doshaInfo: doshaGoals[doshaType],
    meals: {
      breakfast,
      lunch,
      dinner,
      snacks
    },
    spices: foodDatabase.spices.map(s => s.name),
    spicesNote: 'Use these spices liberally to balance your Dosha. They enhance Agni and aid digestion.',
    mindfulEating: MindfulEatingPrinciples,
    dailyRoutine: [
      '🌅 Wake up: 6:00 AM - 7:00 AM',
      '🚰 Drink warm water upon waking',
      '🍽️ Breakfast: 7:00 AM - 9:00 AM (Light)',
      '🍽️ Lunch: 12:00 PM - 2:00 PM (Heaviest meal)',
      '🍽️ Dinner: 6:00 PM - 7:00 PM (Lightest meal)',
      '😴 Sleep: 10:00 PM - 11:00 PM'
    ],
    keyPrinciples: [
      `Focus on ${doshaGoals[doshaType].rasas} tastes`,
      `Seek ${doshaGoals[doshaType].qualities} qualities in food`,
      `Avoid ${doshaGoals[doshaType].avoid}`,
      'Eat your largest meal at lunch when Agni is strongest',
      'Only eat when truly hungry',
      'Follow mindful eating practices'
    ],
    generatedAt: new Date().toISOString(),
    version: '1.0.0'
  };
}

// ============= HELPER FUNCTIONS =============

/**
 * Get Dosha-specific recommendations
 * @param {string} doshaType - Dosha type
 * @returns {Array} List of recommendations
 */
export function getDoshaRecommendations(doshaType) {
  const recommendations = {
    vata: [
      'Eat warm, cooked, and moist foods',
      'Use healthy fats like ghee and sesame oil',
      'Maintain regular meal times',
      'Avoid cold drinks and raw salads',
      'Focus on grounding and nourishing foods',
      'Create a calm, warm eating environment'
    ],
    pitta: [
      'Eat cooling and refreshing foods',
      'Include sweet fruits and vegetables',
      'Avoid spicy, sour, and fermented foods',
      'Don\'t skip meals (causes anger/irritation)',
      'Eat in a peaceful environment',
      'Avoid eating when stressed or angry'
    ],
    kapha: [
      'Eat light, dry, and warm foods',
      'Use stimulating spices generously',
      'Avoid heavy, oily, and sweet foods',
      'Eat your largest meal at lunch',
      'Skip breakfast if not hungry',
      'Include regular exercise before meals'
    ]
  };
  
  return recommendations[doshaType] || [];
}

/**
 * Format meal items for display
 * @param {object} meal - Meal object
 * @returns {Array} Formatted meal items
 */
export function formatMealItems(meal) {
  const items = [];
  
  Object.keys(meal).forEach(category => {
    if (Array.isArray(meal[category]) && meal[category].length > 0) {
      meal[category].forEach(item => {
        items.push(item);
      });
    }
  });
  
  return items;
}

/**
 * Get color scheme for Dosha
 * @param {string} doshaType - Dosha type
 * @returns {string} Hex color code
 */
export function getDoshaColor(doshaType) {
  const colors = {
    vata: '#8E44AD',
    pitta: '#E74C3C',
    kapha: '#27AE60'
  };
  return colors[doshaType] || '#667eea';
}

// ============= EXPORTS =============

export default {
  generateDailyPlan,
  checkAgni,
  getDoshaRecommendations,
  formatMealItems,
  getDoshaColor,
  Dosha,
  Rasa,
  MealType,
  MindfulEatingPrinciples
};
