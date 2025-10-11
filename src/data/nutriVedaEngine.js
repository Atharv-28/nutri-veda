// Integration utility for assessment and diet plan generation
import { DietPlanEngine } from './dietEngine';
import { EnhancedAssessmentCalculator } from './enhancedAssessment';

export class NutriVedaEngine {
  constructor() {
    this.dietEngine = new DietPlanEngine();
    this.assessmentCalculator = new EnhancedAssessmentCalculator();
  }

  // Complete workflow: Assessment -> Analysis -> Diet Plan
  generateCompletePlan(assessmentAnswers, demographics) {
    try {
      // Step 1: Calculate detailed assessment results
      const assessmentResults = this.assessmentCalculator.calculateDetailedResults(
        assessmentAnswers, 
        demographics
      );

      // Step 2: Prepare data for diet plan generation
      const dietPlanInput = {
        dominant: assessmentResults.dominant,
        scores: assessmentResults.scores,
        age: demographics.age,
        gender: demographics.gender,
        activity: demographics.activity,
        health: demographics.health || [],
        season: demographics.season,
        goals: demographics.goals || [],
        constitutionType: assessmentResults.constitutionType,
        imbalances: assessmentResults.imbalances
      };

      // Step 3: Generate personalized diet plan
      const dietPlan = this.dietEngine.generatePersonalizedPlan(dietPlanInput);

      // Step 4: Combine results into comprehensive report
      return {
        assessmentResults,
        dietPlan,
        summary: this.generateSummaryReport(assessmentResults, dietPlan),
        createdAt: new Date().toISOString(),
        version: '1.0'
      };

    } catch (error) {
      console.error('Error generating complete plan:', error);
      throw new Error('Failed to generate personalized plan. Please try again.');
    }
  }

  generateSummaryReport(assessmentResults, dietPlan) {
    const { dominant, constitutionType, percentages } = assessmentResults;
    
    return {
      constitution: {
        primary: dominant,
        type: constitutionType,
        breakdown: percentages
      },
      keyRecommendations: [
        `Your primary dosha is ${dominant.toUpperCase()}`,
        `Constitution type: ${constitutionType}`,
        ...dietPlan.personalizedRecommendations.slice(0, 3),
        'Follow the personalized diet plan for best results'
      ],
      focusAreas: this.identifyFocusAreas(assessmentResults, dietPlan),
      expectedBenefits: this.generateExpectedBenefits(dominant, assessmentResults.demographics)
    };
  }

  identifyFocusAreas(assessmentResults, dietPlan) {
    const focusAreas = [];
    const { imbalances, demographics } = assessmentResults;
    
    // Focus areas based on imbalances
    if (imbalances.some(imbalance => imbalance.includes('digestion'))) {
      focusAreas.push({
        area: 'Digestive Health',
        priority: 'High',
        action: 'Follow meal timing and food combination guidelines'
      });
    }

    if (imbalances.some(imbalance => imbalance.includes('anxiety'))) {
      focusAreas.push({
        area: 'Stress Management',
        priority: 'High',
        action: 'Incorporate calming foods and regular routines'
      });
    }

    if (imbalances.some(imbalance => imbalance.includes('energy'))) {
      focusAreas.push({
        area: 'Energy Balance',
        priority: 'Medium',
        action: 'Adjust meal portions and timing as recommended'
      });
    }

    // Focus areas based on goals
    if (demographics.goals) {
      demographics.goals.forEach(goal => {
        switch(goal) {
          case 'Weight Management':
            focusAreas.push({
              area: 'Weight Management',
              priority: 'High',
              action: 'Follow portion guidelines and exercise recommendations'
            });
            break;
          case 'Better Sleep':
            focusAreas.push({
              area: 'Sleep Quality',
              priority: 'Medium',
              action: 'Follow evening routine and dietary recommendations'
            });
            break;
          case 'Increased Energy':
            focusAreas.push({
              area: 'Energy Optimization',
              priority: 'High',
              action: 'Follow meal timing and energy-boosting food guidelines'
            });
            break;
        }
      });
    }

    return focusAreas;
  }

  generateExpectedBenefits(dominant, demographics) {
    const baseBenefits = {
      vata: [
        'Improved digestion and reduced bloating',
        'Better sleep quality and reduced anxiety',
        'Increased energy and vitality',
        'Enhanced mental clarity and focus'
      ],
      pitta: [
        'Better temperature regulation and cooling',
        'Reduced irritability and improved mood',
        'Enhanced mental focus and decision-making',
        'Improved skin health and complexion'
      ],
      kapha: [
        'Increased energy and motivation',
        'Better weight management',
        'Enhanced mental alertness',
        'Improved respiratory health'
      ]
    };

    let benefits = [...baseBenefits[dominant]];

    // Add goal-specific benefits
    if (demographics.goals) {
      if (demographics.goals.includes('Weight Management')) {
        benefits.push('Gradual and sustainable weight management');
      }
      if (demographics.goals.includes('Better Digestion')) {
        benefits.push('Improved digestive function and comfort');
      }
      if (demographics.goals.includes('Stress Management')) {
        benefits.push('Better stress resilience and emotional balance');
      }
    }

    return benefits;
  }

  // Method to update plan based on progress feedback
  updatePlanWithFeedback(currentPlan, feedback) {
    try {
      const updatedDietPlan = this.dietEngine.updatePlanBasedOnFeedback(
        currentPlan.dietPlan, 
        feedback
      );

      return {
        ...currentPlan,
        dietPlan: updatedDietPlan,
        lastUpdated: new Date().toISOString(),
        feedbackHistory: [
          ...(currentPlan.feedbackHistory || []),
          {
            date: new Date().toISOString(),
            feedback,
            adjustments: 'Plan updated based on feedback'
          }
        ]
      };
    } catch (error) {
      console.error('Error updating plan:', error);
      throw new Error('Failed to update plan. Please try again.');
    }
  }

  // Method to export plan for doctor review
  exportForDoctorReview(plan) {
    return {
      patientId: plan.patientId || 'anonymous',
      assessmentSummary: {
        constitution: plan.assessmentResults.constitutionType,
        dominantDosha: plan.assessmentResults.dominant,
        percentages: plan.assessmentResults.percentages,
        categoryBreakdown: plan.assessmentResults.categoryBreakdown
      },
      dietPlanSummary: {
        mealTiming: plan.dietPlan.mealTiming,
        keyPrinciples: plan.dietPlan.meals,
        foodsToAvoid: plan.dietPlan.foodsToAvoid,
        specialNotes: plan.dietPlan.specialNotes || []
      },
      recommendations: plan.summary.keyRecommendations,
      focusAreas: plan.summary.focusAreas,
      createdAt: plan.createdAt,
      doctorNotes: '' // Space for doctor to add notes
    };
  }

  // Method to generate shopping list based on diet plan
  generateShoppingList(dietPlan) {
    const shoppingList = {
      grains: new Set(),
      vegetables: new Set(),
      fruits: new Set(),
      proteins: new Set(),
      spices: new Set(),
      dairy: new Set(),
      others: new Set()
    };

    // Extract ingredients from all meals
    Object.values(dietPlan.meals).forEach(mealArray => {
      if (Array.isArray(mealArray)) {
        mealArray.forEach(item => {
          // Simple keyword extraction (in real app, you'd have a more sophisticated parser)
          const keywords = item.toLowerCase().split(' ');
          keywords.forEach(keyword => {
            if (['rice', 'wheat', 'oats', 'quinoa', 'barley'].includes(keyword)) {
              shoppingList.grains.add(keyword);
            } else if (['carrots', 'broccoli', 'spinach', 'cucumber', 'tomatoes'].includes(keyword)) {
              shoppingList.vegetables.add(keyword);
            } else if (['apples', 'bananas', 'melons', 'grapes', 'mangoes'].includes(keyword)) {
              shoppingList.fruits.add(keyword);
            }
          });
        });
      }
    });

    // Add recommended spices
    dietPlan.spiceRecommendations.forEach(spice => {
      shoppingList.spices.add(spice);
    });

    // Convert sets to arrays for easier use
    return Object.keys(shoppingList).reduce((acc, category) => {
      acc[category] = Array.from(shoppingList[category]);
      return acc;
    }, {});
  }

  // Method to track progress and generate insights
  generateProgressInsights(initialPlan, currentFeedback, duration) {
    const insights = {
      adherence: this.calculateAdherence(currentFeedback),
      improvements: this.identifyImprovements(initialPlan, currentFeedback),
      challenges: this.identifyChallenges(currentFeedback),
      nextSteps: this.suggestNextSteps(currentFeedback, duration)
    };

    return insights;
  }

  calculateAdherence(feedback) {
    // Simple adherence calculation based on feedback
    const adherenceScore = (
      (feedback.followedMealTiming ? 25 : 0) +
      (feedback.followedFoodGuidelines ? 25 : 0) +
      (feedback.avoidedRestrictedFoods ? 25 : 0) +
      (feedback.regularExercise ? 25 : 0)
    );

    return {
      score: adherenceScore,
      level: adherenceScore >= 75 ? 'High' : adherenceScore >= 50 ? 'Medium' : 'Low'
    };
  }

  identifyImprovements(initialPlan, feedback) {
    const improvements = [];
    
    if (feedback.energyLevel > initialPlan.baselineEnergyLevel) {
      improvements.push('Energy levels have improved');
    }
    if (feedback.digestionScore > initialPlan.baselineDigestionScore) {
      improvements.push('Digestive health has improved');
    }
    if (feedback.sleepQuality > initialPlan.baselineSleepQuality) {
      improvements.push('Sleep quality has improved');
    }

    return improvements;
  }

  identifyChallenges(feedback) {
    const challenges = [];
    
    if (!feedback.followedMealTiming) {
      challenges.push('Difficulty maintaining regular meal timing');
    }
    if (!feedback.followedFoodGuidelines) {
      challenges.push('Difficulty following food guidelines');
    }
    if (feedback.cravings && feedback.cravings.length > 0) {
      challenges.push('Managing food cravings');
    }

    return challenges;
  }

  suggestNextSteps(feedback, duration) {
    const nextSteps = [];
    
    if (duration < 7) {
      nextSteps.push('Continue following the current plan for at least one more week');
    } else if (duration >= 14 && feedback.adherence.level === 'High') {
      nextSteps.push('Consider advancing to more specific dietary modifications');
    }

    if (feedback.challenges.includes('meal timing')) {
      nextSteps.push('Focus on establishing regular meal routines');
    }

    return nextSteps;
  }
}

// Export singleton instance
export default new NutriVedaEngine();
