const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Health check for nutrition service
router.get('/health', (req, res) => {
  res.json({
    service: 'ai-nutrition',
    status: 'operational',
    features: ['meal_planning', 'macro_tracking', 'nutrition_coaching', 'supplement_advice'],
    timestamp: new Date().toISOString()
  });
});

// Generate personalized nutrition plan
router.post('/:userId/plan', (req, res) => {
  const { userId } = req.params;
  const { 
    goal, // weight_loss, muscle_gain, maintenance, performance
    activityLevel, // sedentary, lightly_active, moderately_active, very_active
    dietaryRestrictions, // vegetarian, vegan, gluten_free, etc.
    currentWeight,
    targetWeight,
    height,
    age,
    gender
  } = req.body;

  logger.info({
    service: 'ai-service',
    action: 'generate_nutrition_plan',
    userId: userId,
    goal: goal
  });

  // Calculate BMR and total daily energy expenditure
  const bmr = gender === 'male' 
    ? 88.362 + (13.397 * currentWeight) + (4.799 * height) - (5.677 * age)
    : 447.593 + (9.247 * currentWeight) + (3.098 * height) - (4.330 * age);

  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725
  };

  const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);
  
  // Adjust calories based on goal
  let targetCalories = tdee;
  if (goal === 'weight_loss') targetCalories *= 0.85; // 15% deficit
  if (goal === 'muscle_gain') targetCalories *= 1.1; // 10% surplus

  // Calculate macros
  const proteinPerKg = goal === 'muscle_gain' ? 2.2 : 1.8;
  const protein = Math.round(currentWeight * proteinPerKg);
  const proteinCalories = protein * 4;
  
  const fatPercent = 0.25; // 25% of calories from fat
  const fatCalories = targetCalories * fatPercent;
  const fat = Math.round(fatCalories / 9);
  
  const carbCalories = targetCalories - proteinCalories - fatCalories;
  const carbs = Math.round(carbCalories / 4);

  const nutritionPlan = {
    dailyCalories: Math.round(targetCalories),
    macros: {
      protein: protein,
      carbs: carbs,
      fat: fat
    },
    mealTiming: {
      breakfast: Math.round(targetCalories * 0.25),
      lunch: Math.round(targetCalories * 0.30),
      dinner: Math.round(targetCalories * 0.30),
      snacks: Math.round(targetCalories * 0.15)
    },
    hydration: Math.round(currentWeight * 35), // ml per kg
    supplements: getSupplementRecommendations(goal, dietaryRestrictions),
    mealIdeas: getMealIdeas(goal, dietaryRestrictions)
  };

  res.json({
    nutritionPlan,
    userId,
    goal,
    duration: '4-week plan',
    adjustmentNote: 'Plan will be adjusted based on progress tracking',
    generatedAt: new Date().toISOString()
  });
});

// Get meal suggestions
router.get('/:userId/meals', (req, res) => {
  const { userId } = req.params;
  const { mealType, calories, dietaryRestrictions } = req.query;

  logger.info({
    service: 'ai-service',
    action: 'get_meal_suggestions',
    userId: userId,
    mealType: mealType
  });

  const mealSuggestions = getMealSuggestionsByType(mealType, parseInt(calories), dietaryRestrictions);

  res.json({
    meals: mealSuggestions,
    mealType,
    targetCalories: calories,
    userId,
    timestamp: new Date().toISOString()
  });
});

// Track nutrition and get feedback
router.post('/:userId/track', (req, res) => {
  const { userId } = req.params;
  const { meals, totalCalories, macros, date } = req.body;

  logger.info({
    service: 'ai-service',
    action: 'track_nutrition',
    userId: userId,
    date: date
  });

  // Analyze nutrition intake
  const feedback = analyzeNutritionIntake(totalCalories, macros);

  res.json({
    logged: true,
    feedback,
    suggestions: feedback.suggestions,
    userId,
    date: date || new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString()
  });
});

// Get nutrition insights and trends
router.get('/:userId/insights', (req, res) => {
  const { userId } = req.params;
  const { period = '7d' } = req.query; // 7d, 30d, 90d

  logger.info({
    service: 'ai-service',
    action: 'get_nutrition_insights',
    userId: userId,
    period: period
  });

  // Mock nutrition insights
  const insights = {
    averageDailyCalories: 2150,
    macroConsistency: {
      protein: 'good', // consistently meeting targets
      carbs: 'excellent',
      fat: 'needs_improvement'
    },
    trends: {
      calorieConsistency: 85, // percentage
      mealTimingConsistency: 78,
      hydrationConsistency: 92
    },
    achievements: [
      'Hit protein target 6 out of 7 days',
      'Maintained calorie goals consistently',
      'Excellent hydration this week'
    ],
    recommendations: [
      'Focus on healthy fat sources like avocados and nuts',
      'Consider meal prep to improve consistency',
      'Add more variety to your vegetable intake'
    ]
  };

  res.json({
    insights,
    period,
    userId,
    generatedAt: new Date().toISOString()
  });
});

// Helper functions
function getSupplementRecommendations(goal, restrictions) {
  const baseSupplements = [
    { name: 'Multivitamin', reason: 'Fill nutritional gaps', timing: 'with breakfast' },
    { name: 'Omega-3', reason: 'Heart and brain health', timing: 'with meals' }
  ];

  if (goal === 'muscle_gain') {
    baseSupplements.push(
      { name: 'Whey Protein', reason: 'Muscle protein synthesis', timing: 'post-workout' },
      { name: 'Creatine', reason: 'Strength and power', timing: '3-5g daily' }
    );
  }

  if (restrictions?.includes('vegan')) {
    baseSupplements.push(
      { name: 'B12', reason: 'Essential for vegans', timing: 'daily' },
      { name: 'Plant Protein', reason: 'Complete amino acid profile', timing: 'post-workout' }
    );
  }

  return baseSupplements;
}

function getMealIdeas(goal, restrictions) {
  const meals = {
    breakfast: [
      'Greek yogurt with berries and granola',
      'Oatmeal with banana and almond butter',
      'Scrambled eggs with avocado toast'
    ],
    lunch: [
      'Grilled chicken salad with mixed vegetables',
      'Quinoa bowl with roasted vegetables',
      'Turkey and hummus wrap with vegetables'
    ],
    dinner: [
      'Baked salmon with sweet potato and broccoli',
      'Lean beef stir-fry with brown rice',
      'Lentil curry with quinoa'
    ],
    snacks: [
      'Apple with almond butter',
      'Greek yogurt with nuts',
      'Protein smoothie with spinach'
    ]
  };

  // Filter based on dietary restrictions
  if (restrictions?.includes('vegetarian')) {
    meals.lunch = meals.lunch.filter(meal => !meal.includes('chicken') && !meal.includes('turkey'));
    meals.dinner = meals.dinner.filter(meal => !meal.includes('salmon') && !meal.includes('beef'));
  }

  return meals;
}

function getMealSuggestionsByType(mealType, calories, restrictions) {
  const suggestions = [
    {
      name: 'High Protein Bowl',
      calories: calories || 400,
      ingredients: ['grilled chicken', 'quinoa', 'black beans', 'avocado'],
      macros: { protein: 35, carbs: 30, fat: 15 },
      prepTime: '15 minutes'
    },
    {
      name: 'Mediterranean Salad',
      calories: calories || 350,
      ingredients: ['mixed greens', 'feta cheese', 'olives', 'tomatoes', 'olive oil'],
      macros: { protein: 12, carbs: 20, fat: 25 },
      prepTime: '10 minutes'
    },
    {
      name: 'Power Smoothie',
      calories: calories || 300,
      ingredients: ['protein powder', 'banana', 'spinach', 'almond milk'],
      macros: { protein: 25, carbs: 35, fat: 8 },
      prepTime: '5 minutes'
    }
  ];

  return suggestions.slice(0, 3); // Return top 3 suggestions
}

function analyzeNutritionIntake(calories, macros) {
  const feedback = {
    overall: 'good',
    details: [],
    suggestions: []
  };

  if (calories < 1200) {
    feedback.details.push('Calorie intake is quite low');
    feedback.suggestions.push('Consider adding healthy snacks between meals');
    feedback.overall = 'needs_attention';
  }

  if (macros.protein < 100) {
    feedback.details.push('Protein intake could be higher');
    feedback.suggestions.push('Add a protein source to each meal');
  }

  if (macros.fat < 50) {
    feedback.details.push('Healthy fats are important for hormone production');
    feedback.suggestions.push('Include nuts, avocado, or olive oil in your meals');
  }

  if (feedback.details.length === 0) {
    feedback.details.push('Great nutrition choices today!');
    feedback.suggestions.push('Keep up the consistent eating patterns');
  }

  return feedback;
}

module.exports = router;
