# NutriVeda - Diet Plan Generation Documentation

## Current Implementation (Basic Version)

### What We're Currently Using for Diet Plans Based on Assessment Results:

#### 1. **Assessment System**
- **Simple Point-Based Scoring**: Each question gives 2 points to Vata, Pitta, or Kapha
- **12 Traditional Questions**: Covering physical constitution, digestion, mental traits, etc.
- **Winner-Takes-All Logic**: Highest scoring dosha becomes the dominant type

#### 2. **Diet Plan Generation**
- **Static Predefined Plans**: Hardcoded meal plans for each dosha type
- **Basic Categorization**: Plans organized by breakfast, lunch, dinner, snacks
- **General Principles**: Each dosha has general dietary guidelines
- **No Personalization**: Same plan for all people of the same dosha type

#### 3. **Current Algorithm Flow**
```
User answers 12 questions 
→ System calculates dosha scores (Vata: X, Pitta: Y, Kapha: Z)
→ Highest score = Dominant dosha
→ System selects corresponding static diet plan
→ User receives predefined meal suggestions
```

### Limitations of Current Approach:
- ❌ No consideration of age, activity level, health conditions
- ❌ No seasonal adjustments
- ❌ No personalized portion sizes or meal timing
- ❌ No integration of multiple dosha influences
- ❌ No progress tracking or plan adjustments

---

## Enhanced Implementation Available

### What We've Built for Advanced Diet Plan Generation:

#### 1. **Enhanced Assessment System** (`enhancedAssessment.js`)
- **Comprehensive Questionnaire**: 12+ detailed questions across 6 categories
- **Demographic Collection**: Age, gender, activity level, health conditions, goals
- **Category Analysis**: Breakdown by Physical, Mental, Digestive, Sleep, etc.
- **Constitution Typing**: Single-dosha, dual-dosha, or tri-doshic classification

#### 2. **Advanced Diet Plan Engine** (`dietEngine.js`)
- **AI-Powered Generation**: Dynamic plan creation based on multiple factors
- **Food Database**: Extensive categorized foods for each dosha
- **Personalization Logic**: Considers age, activity, health, season, goals
- **Meal Templates**: Smart meal structure based on dosha requirements
- **Portion Guidance**: Customized serving sizes and meal timing

#### 3. **Integrated NutriVeda Engine** (`nutriVedaEngine.js`)
- **Complete Workflow**: Assessment → Analysis → Personalized Plan
- **Progress Tracking**: Feedback integration and plan adjustments
- **Doctor Integration**: Export plans for medical review
- **Shopping Lists**: Automated grocery lists from meal plans
- **Insights Generation**: Progress analytics and recommendations

#### 4. **Enhanced Algorithm Flow**
```
User completes comprehensive assessment (questions + demographics)
→ System calculates detailed dosha analysis with percentages
→ AI analyzes constitution type and individual factors
→ Dynamic diet plan generation using:
  • Primary & secondary dosha influences
  • Age-appropriate modifications
  • Activity level adjustments
  • Health condition considerations
  • Seasonal recommendations
  • Personal goals alignment
→ User receives personalized meal plan with:
  • Specific meal timing
  • Portion guidance
  • Food temperature preferences
  • Spice recommendations
  • Foods to avoid
  • Lifestyle suggestions
```

---

## Implementation Comparison

| Feature | Current (Basic) | Enhanced Available |
|---------|-----------------|-------------------|
| **Assessment** | 12 simple questions | 12+ detailed + demographics |
| **Scoring** | Simple point addition | Weighted category analysis |
| **Constitution** | Single dosha winner | Complex dosha relationships |
| **Diet Plans** | Static predefined | Dynamic AI-generated |
| **Personalization** | None | Age, activity, health, season |
| **Meal Timing** | General suggestions | Personalized timing |
| **Portions** | One-size-fits-all | Customized portions |
| **Progress Tracking** | None | Feedback & adjustments |
| **Doctor Integration** | Basic view/edit | Comprehensive review system |
| **Seasonal Adjustments** | None | Automatic seasonal modifications |

---

## How to Upgrade to Enhanced Version

### Step 1: Enable Enhanced Features
```javascript
// In src/data/appConfig.js
export const APP_CONFIG = {
  assessment: {
    mode: 'enhanced', // Change from 'basic'
    enableDetailedQuestions: true,
    enableDemographicCollection: true
  },
  dietPlan: {
    generationMode: 'dynamic', // Change from 'static'
    enablePersonalization: true,
    enableSeasonalAdjustments: true
  }
};
```

### Step 2: Update Assessment Screen
```javascript
// In PrakrutiTestScreen.js
import { enhancedQuestions, demographicQuestions } from '../data/enhancedAssessment';
import nutriVedaEngine from '../data/nutriVedaEngine';

// Replace current questions with enhancedQuestions
// Add demographic collection phase
// Use nutriVedaEngine.generateCompletePlan() for results
```

### Step 3: Update Diet Plan Display
```javascript
// In DietPlanScreen.js
// Replace static diet plans with dynamic plan display
// Show personalized meal timing, portions, and recommendations
// Add progress tracking interface
```

### Step 4: Enhance Doctor Dashboard
```javascript
// In DoctorDashboardScreen.js
// Add detailed patient assessment review
// Show constitution breakdown and category scores
// Enable plan customization and notes
```

---

## Technical Architecture

### Current Simple Architecture:
```
Assessment Questions → Simple Scoring → Static Plan Selection → Display
```

### Enhanced Architecture:
```
Comprehensive Assessment → AI Analysis Engine → Personalization Layer → Dynamic Plan Generation → Progress Tracking → Doctor Review → Plan Refinement
```

---

## Benefits of Enhanced Approach

### For Patients:
✅ **Personalized Plans**: Truly customized to individual needs
✅ **Better Results**: Plans consider multiple factors for effectiveness
✅ **Lifestyle Integration**: Meal timing and portions fit personal schedule
✅ **Seasonal Adaptation**: Plans adjust for weather and seasonal foods
✅ **Progress Tracking**: Monitor improvements and adjust accordingly

### For Doctors:
✅ **Detailed Insights**: Comprehensive patient assessment breakdown
✅ **Evidence-Based**: Clear reasoning behind diet recommendations
✅ **Customizable**: Ability to modify plans based on medical knowledge
✅ **Progress Monitoring**: Track patient adherence and outcomes
✅ **Professional Reports**: Export detailed reports for medical records

### For the System:
✅ **Scalable**: Can handle complex individual variations
✅ **Learning**: Can improve recommendations based on feedback
✅ **Comprehensive**: Addresses multiple aspects of health and wellness
✅ **Professional**: Suitable for clinical and commercial use

---

## Current Status

- ✅ **Basic Implementation**: Working app with simple assessment and static diet plans
- ✅ **Enhanced System Built**: All advanced components are coded and ready
- 🔄 **Configuration Based**: Easy switch between basic and enhanced modes
- 📋 **Documentation Complete**: Full implementation guides available

**To use the enhanced system, simply update the configuration in `appConfig.js` and modify the screens to use the enhanced components.**
