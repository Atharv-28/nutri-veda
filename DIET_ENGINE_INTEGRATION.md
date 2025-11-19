# NutriVeda Diet Generation Engine - Integration Guide

## Overview

The NutriVeda Diet Generation Engine is a sophisticated, modular system that generates personalized Ayurvedic diet plans based on scientific principles of Ayurveda. It incorporates **Dosha theory**, **Rasa (taste) balancing**, **Agni (digestive fire) awareness**, and **Mindful Eating** practices.

## Architecture

### Core Components

1. **nutriVedaDietEngine.js** - Main diet generation engine
   - Location: `src/data/nutriVedaDietEngine.js`
   - Exports: `generateDailyPlan()`, `checkAgni()`, `getDoshaRecommendations()`, and helper functions

2. **relationshipService.js** - Service layer integration
   - Added: `generateAIDietPlan()` function
   - Integrates the diet engine with Firestore database

3. **PrakrutiTestScreen.js** - Assessment integration
   - Uses `generateAIDietPlan()` after assessment completion
   - Automatically generates and saves personalized diet plans

4. **DietPlanScreen.js** - Enhanced display screen
   - Displays all aspects of the generated diet plan
   - Shows meals, mindful eating principles, daily routine, and dosha-specific information

## Key Features

### 1. Dosha-Based Food Selection

The engine maintains comprehensive food databases for each Dosha:

- **Vata Foods**: Warm, moist, heavy, oily foods (Sweet, Sour, Salty tastes)
- **Pitta Foods**: Cool, heavy foods (Sweet, Bitter, Astringent tastes)
- **Kapha Foods**: Light, dry, warm foods (Pungent, Bitter, Astringent tastes)

Each ingredient is categorized by:
- Rasas (tastes)
- Qualities (heavy/light, warming/cooling, oily/dry)
- Food category (grains, vegetables, proteins, fats, fruits, spices, beverages)

### 2. Meal Structure Based on Agni

The engine generates meals according to Ayurvedic timing principles:

- **Breakfast** (7-9 AM): Light, easy to digest
- **Lunch** (12-2 PM): Heaviest meal (Agni is strongest)
- **Dinner** (6-7 PM): Lightest meal
- **Snacks**: Only when truly hungry

### 3. Mindful Eating Integration

Each diet plan includes comprehensive mindful eating guidelines:

#### Pre-Meal Reminders
- Create a calm environment
- Take deep breaths
- Express gratitude
- Avoid distractions

#### During Meal
- Chew each bite 32 times
- Focus on taste, texture, aroma
- Eat at a moderate pace
- Stop when 75% full

#### Post-Meal
- Take a short walk
- Sit in Vajrasana pose
- Rest but avoid immediate sleep
- Sip warm water

#### Timing Rules
- Eat largest meal at lunch
- Maintain regular meal times
- Wait 3-4 hours between meals
- Only eat when hungry (check Agni)

### 4. Rasa (Taste) Balancing

Each Dosha requires specific taste combinations:

- **Vata**: Sweet, Sour, Salty (grounding and nourishing)
- **Pitta**: Sweet, Bitter, Astringent (cooling and calming)
- **Kapha**: Pungent, Bitter, Astringent (stimulating and lightening)

The engine automatically selects foods with appropriate Rasas for each Dosha.

### 5. Spice Recommendations

Dosha-specific spice recommendations to enhance Agni:

- **Vata**: Ginger, Cinnamon, Cardamom, Cumin, Fennel
- **Pitta**: Coriander, Fennel, Cardamom, Mint, Dill
- **Kapha**: Black Pepper, Ginger, Turmeric, Cinnamon, Cloves, Mustard Seeds

## Data Structure

### Generated Diet Plan Object

```javascript
{
  doshaType: "Vata", // or "Pitta", "Kapha"
  doshaInfo: {
    goal: "Balance excess Vata",
    qualities: "Warmth, Oiliness, Heaviness",
    rasas: "Sweet, Sour, Salty",
    avoid: "Cold, dry, raw foods",
    color: "#8E44AD"
  },
  meals: {
    breakfast: {
      grains: ["Basmati Rice", "Oatmeal (cooked)"],
      fruits: ["Stewed Apples", "Ripe Bananas"],
      beverages: ["Warm Milk with Honey"],
      portions: "Light (1-1.5 cups total)",
      timing: "7:00 AM - 9:00 AM",
      note: "Start your day gently..."
    },
    lunch: { /* similar structure */ },
    dinner: { /* similar structure */ },
    snacks: { /* similar structure */ }
  },
  spices: ["Ginger", "Cinnamon", "Cardamom", ...],
  spicesNote: "Use these spices liberally to balance your Dosha...",
  mindfulEating: {
    preMealReminders: [...],
    duringMeal: [...],
    postMeal: [...],
    timingRules: [...]
  },
  dailyRoutine: [
    "🌅 Wake up: 6:00 AM - 7:00 AM",
    "🚰 Drink warm water upon waking",
    ...
  ],
  keyPrinciples: [
    "Focus on Sweet, Sour, Salty tastes",
    "Seek Warmth, Oiliness, Heaviness qualities in food",
    ...
  ],
  recommendations: [...],
  generatedAt: "2025-01-15T10:30:00.000Z",
  version: "1.0.0"
}
```

## Integration Flow

### 1. Assessment Completion (PrakrutiTestScreen.js)

```javascript
// User completes Prakruti assessment
const calculateResult = async (allAnswers) => {
  // Calculate dominant Dosha
  const dominant = calculateDominantDosha(allAnswers);
  
  // Generate AI-powered diet plan
  const dietPlan = generateDietPlan(dominant, patient);
  
  // Save to Firestore
  await saveDietPlan({
    patientId: patient.uid,
    dosha: dominant,
    meals: dietPlan.meals,
    recommendations: dietPlan.recommendations,
    // ... other fields
  });
};
```

### 2. Diet Plan Generation (relationshipService.js)

```javascript
export const generateAIDietPlan = (dosha) => {
  // Generate complete daily plan using NutriVeda engine
  const dailyPlan = generateDailyPlan(dosha.toLowerCase());
  const recommendations = getDoshaRecommendations(dosha.toLowerCase());
  
  return {
    meals: dailyPlan.meals,
    doshaInfo: dailyPlan.doshaInfo,
    spices: dailyPlan.spices,
    spicesNote: dailyPlan.spicesNote,
    mindfulEating: dailyPlan.mindfulEating,
    dailyRoutine: dailyPlan.dailyRoutine,
    keyPrinciples: dailyPlan.keyPrinciples,
    recommendations: recommendations,
    // ... metadata
  };
};
```

### 3. Display (DietPlanScreen.js)

```javascript
// Fetch from Firestore
const plan = await getDietPlan(patient.uid);

// Format meal items for display
const formatMealItems = (meal) => {
  const items = [];
  if (meal.grains) items.push(...meal.grains);
  if (meal.vegetables) items.push(...meal.vegetables);
  // ... other categories
  if (meal.timing) items.push(`⏰ Best time: ${meal.timing}`);
  if (meal.note) items.push(`💡 Note: ${meal.note}`);
  return items;
};

// Display with enhanced UI sections
<View>
  {/* Meals */}
  {/* Dosha Info */}
  {/* Daily Routine */}
  {/* Mindful Eating Principles */}
  {/* Spices & Tips */}
</View>
```

## Usage Examples

### Generate a Diet Plan

```javascript
import { generateDailyPlan } from './src/data/nutriVedaDietEngine';

// Generate a Vata-balancing diet plan
const vataPlan = generateDailyPlan('vata');

console.log(vataPlan.meals.lunch);
// Output: Complete lunch with grains, vegetables, proteins, etc.

console.log(vataPlan.mindfulEating.preMealReminders);
// Output: Array of pre-meal mindfulness practices
```

### Check Agni Before Eating

```javascript
import { checkAgni } from './src/data/nutriVedaDietEngine';

const agniStatus = checkAgni(isUserHungry);

if (agniStatus.shouldEat) {
  console.log(agniStatus.message); // "Your Agni is ready"
} else {
  console.log(agniStatus.recommendation); // "Wait 30-60 minutes"
}
```

### Get Dosha-Specific Recommendations

```javascript
import { getDoshaRecommendations } from './src/data/nutriVedaDietEngine';

const pittaRecommendations = getDoshaRecommendations('pitta');
// Returns array of lifestyle and dietary recommendations
```

## Firestore Data Model

### Diet Plan Document Structure

```javascript
{
  patientId: "user123",
  patientName: "John Doe",
  doctorId: "doctor456", // or "system" for auto-generated
  doctorName: "Dr. Smith",
  dosha: "vata",
  meals: {
    breakfast: { /* meal object */ },
    lunch: { /* meal object */ },
    dinner: { /* meal object */ },
    snacks: { /* meal object */ }
  },
  recommendations: [...],
  keyPrinciples: [...],
  spices: [...],
  spicesNote: "...",
  doshaInfo: { /* dosha-specific info */ },
  mindfulEating: { /* mindful eating guidelines */ },
  dailyRoutine: [...],
  createdAt: "2025-01-15T10:30:00.000Z",
  updatedAt: "2025-01-15T10:30:00.000Z",
  isApprovedByDoctor: false, // Set to true when doctor approves
  approvedAt: null,
  approvedBy: null,
  version: "1.0.0"
}
```

## Benefits of This Approach

1. **Modular Design**: Easy to extend with new foods, Doshas, or principles
2. **Scientifically Grounded**: Based on classical Ayurvedic texts and principles
3. **Randomization**: Provides variety by randomly selecting from appropriate foods
4. **Comprehensive**: Includes meals, timing, mindfulness, and lifestyle guidance
5. **Scalable**: Can easily add more ingredients, recipes, or customization options
6. **Type-Safe**: Uses clear enums and data structures
7. **Educational**: Teaches users about Ayurvedic principles through the plan

## Future Enhancements

### Planned Features

1. **Seasonal Adjustments**: Modify recommendations based on season (Ritucharya)
2. **Activity Level Integration**: Adjust portion sizes based on physical activity
3. **Recipe Suggestions**: Full recipes with preparation instructions
4. **Shopping Lists**: Auto-generate grocery lists from meal plans
5. **Meal Prep Guidance**: Weekly meal prep schedules
6. **Progress Tracking**: Track adherence and health improvements
7. **AI Refinement**: Learn from user feedback to improve recommendations
8. **Multi-Dosha Support**: Better handling of dual Dosha constitutions
9. **Allergy/Preference Filters**: Exclude foods based on allergies or preferences
10. **Regional Variations**: Adapt to local food availability

### Extensibility

To add new foods:

```javascript
// In nutriVedaDietEngine.js
const IngredientDatabase = {
  vataFoods: {
    grains: [
      { 
        name: 'New Grain', 
        rasas: [Rasa.SWEET], 
        isHeavy: true, 
        isWarming: true, 
        isOily: false 
      },
      // ... existing grains
    ],
    // ... other categories
  }
};
```

## Testing

### Unit Tests (Recommended)

```javascript
// Test diet plan generation
test('generates valid Vata diet plan', () => {
  const plan = generateDailyPlan('vata');
  expect(plan.doshaType).toBe('Vata');
  expect(plan.meals.breakfast).toBeDefined();
  expect(plan.mindfulEating).toBeDefined();
});

// Test Agni check
test('recommends waiting when not hungry', () => {
  const result = checkAgni(false);
  expect(result.shouldEat).toBe(false);
  expect(result.recommendation).toBeDefined();
});
```

## References

### Ayurvedic Principles

1. **Tridosha Theory**: Vata, Pitta, Kapha balance
2. **Rasa (Six Tastes)**: Sweet, Sour, Salty, Pungent, Bitter, Astringent
3. **Agni (Digestive Fire)**: Central to health and digestion
4. **Mindful Eating**: Conscious consumption for optimal digestion
5. **Ritucharya**: Seasonal regimens
6. **Dinacharya**: Daily routines

### Classical Texts Referenced

- Charaka Samhita (Sutra Sthana, Vimana Sthana)
- Ashtanga Hridayam
- Sushruta Samhita

## Support and Maintenance

### Troubleshooting

**Issue**: Diet plan not generating
- **Solution**: Check that Dosha value is lowercase ('vata', 'pitta', or 'kapha')

**Issue**: Missing meal items
- **Solution**: Ensure Firestore document has complete meal structure

**Issue**: Mindful eating sections not appearing
- **Solution**: Verify the diet plan was generated with the new engine (check `version` field)

### Performance Considerations

- Diet generation is CPU-bound but very fast (<10ms)
- Food selection uses randomization for variety
- Consider caching generated plans for offline access
- Firestore reads are minimized by storing complete plans

## Conclusion

The NutriVeda Diet Generation Engine represents a modern, scalable approach to implementing ancient Ayurvedic wisdom. By combining traditional knowledge with modern software architecture, we've created a system that is both authentic and practical for real-world use.

The modular design ensures that the system can grow and adapt as new research emerges and user needs evolve, while maintaining the core principles that make Ayurveda effective.

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Maintained By**: NutriVeda Development Team
