import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AdvancedNutritionState, NutritionAI, SmartMealPlan, NutritionChat, NutritionMessage, FoodAnalysis, Recipe } from '../../types';

// Sample AI Nutritionist
const sampleNutritionist: NutritionAI = {
  id: 'ai_nutritionist_dr_nova',
  name: 'Dr. Nova',
  personality: 'scientific',
  specialties: ['weight_loss', 'muscle_building', 'sports_nutrition', 'heart_healthy'],
  profilePhoto: 'https://via.placeholder.com/150',
  bio: 'AI-powered nutritionist with extensive knowledge of sports science, metabolism, and personalized nutrition strategies. I create evidence-based meal plans tailored to your fitness goals.',
};

// Sample recipes
const sampleRecipes: Recipe[] = [
  {
    id: 'recipe_protein_smoothie',
    name: 'Post-Workout Protein Smoothie',
    description: 'Perfect recovery drink with balanced macros for muscle building',
    ingredients: [
      { foodId: 'banana', quantity: 1, unit: 'medium', isOptional: false, substitutes: ['apple', 'berries'] },
      { foodId: 'protein_powder', quantity: 30, unit: 'grams', isOptional: false },
      { foodId: 'spinach', quantity: 50, unit: 'grams', isOptional: true },
      { foodId: 'almond_milk', quantity: 250, unit: 'ml', isOptional: false, substitutes: ['oat milk', 'regular milk'] },
      { foodId: 'peanut_butter', quantity: 15, unit: 'grams', isOptional: true, substitutes: ['almond butter'] },
    ],
    instructions: [
      'Add all ingredients to a blender',
      'Blend on high for 60 seconds until smooth',
      'Add ice if desired for a colder drink',
      'Enjoy within 30 minutes of your workout'
    ],
    difficulty: 'easy',
    cuisineType: 'American',
    dietaryTags: ['high_protein', 'post_workout', 'vegetarian_friendly'],
    servings: 1,
    nutritionPer100g: {
      calories: 320,
      protein: 25,
      carbs: 35,
      fat: 8,
      fiber: 5,
      sugar: 22,
      sodium: 150,
    },
  },
  {
    id: 'recipe_quinoa_bowl',
    name: 'Power Quinoa Bowl',
    description: 'Nutrient-dense meal with complete proteins and healthy fats',
    ingredients: [
      { foodId: 'quinoa', quantity: 100, unit: 'grams', isOptional: false },
      { foodId: 'chicken_breast', quantity: 120, unit: 'grams', isOptional: false, substitutes: ['tofu', 'salmon'] },
      { foodId: 'avocado', quantity: 0.5, unit: 'medium', isOptional: false },
      { foodId: 'cherry_tomatoes', quantity: 100, unit: 'grams', isOptional: false },
      { foodId: 'cucumber', quantity: 50, unit: 'grams', isOptional: false },
      { foodId: 'olive_oil', quantity: 10, unit: 'ml', isOptional: false },
    ],
    instructions: [
      'Cook quinoa according to package instructions',
      'Season and grill chicken breast until cooked through',
      'Slice avocado, tomatoes, and cucumber',
      'Assemble bowl with quinoa as base',
      'Top with chicken and vegetables',
      'Drizzle with olive oil and season to taste'
    ],
    difficulty: 'medium',
    cuisineType: 'Mediterranean',
    dietaryTags: ['high_protein', 'gluten_free', 'balanced'],
    servings: 1,
    nutritionPer100g: {
      calories: 450,
      protein: 35,
      carbs: 40,
      fat: 18,
      fiber: 8,
      sugar: 6,
      sodium: 200,
    },
  }
];

const initialState: AdvancedNutritionState = {
  // Existing nutrition state properties
  meals: [],
  foods: [],
  dailyGoals: {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
  },
  isLoading: false,
  error: undefined,
  
  // Phase 3 additions
  aiNutritionist: sampleNutritionist,
  mealPlans: [],
  nutritionChats: [],
  foodAnalyses: [],
  recipes: sampleRecipes,
  groceryLists: [],
};

const advancedNutritionSlice = createSlice({
  name: 'advancedNutrition',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = undefined;
    },
    
    // AI Nutritionist Chat
    startNutritionChat: (state, action: PayloadAction<{ userId: string }>) => {
      const newChat: NutritionChat = {
        id: `nutrition_chat_${Date.now()}`,
        userId: action.payload.userId,
        nutritionistId: state.aiNutritionist!.id,
        messages: [
          {
            id: `msg_${Date.now()}`,
            senderId: state.aiNutritionist!.id,
            senderType: 'ai_nutritionist',
            message: `Hello! I'm ${state.aiNutritionist!.name}, your AI nutritionist. I'm here to help you create personalized meal plans, analyze your nutrition, and guide you toward optimal health. What are your nutrition goals?`,
            messageType: 'text',
            timestamp: new Date(),
          }
        ],
        status: 'active',
        createdAt: new Date(),
        lastMessageAt: new Date(),
      };
      state.nutritionChats.unshift(newChat);
    },
    
    sendNutritionMessage: (state, action: PayloadAction<{
      chatId: string;
      senderId: string;
      senderType: 'user' | 'ai_nutritionist';
      message: string;
      messageType?: 'text' | 'meal_plan' | 'food_analysis' | 'nutrition_advice';
    }>) => {
      const chat = state.nutritionChats.find(c => c.id === action.payload.chatId);
      if (chat) {
        const newMessage: NutritionMessage = {
          id: `msg_${Date.now()}`,
          senderId: action.payload.senderId,
          senderType: action.payload.senderType,
          message: action.payload.message,
          messageType: action.payload.messageType || 'text',
          timestamp: new Date(),
        };
        chat.messages.push(newMessage);
        chat.lastMessageAt = new Date();

        // Auto-reply from AI nutritionist
        if (action.payload.senderType === 'user') {
          setTimeout(() => {
            const aiReply = generateNutritionResponse(action.payload.message);
            const aiMessage: NutritionMessage = {
              id: `msg_${Date.now() + 1}`,
              senderId: state.aiNutritionist!.id,
              senderType: 'ai_nutritionist',
              message: aiReply,
              messageType: 'text',
              timestamp: new Date(),
            };
            chat.messages.push(aiMessage);
            chat.lastMessageAt = new Date();
          }, 1500);
        }
      }
    },
    
    // Meal Plan Management
    createMealPlan: (state, action: PayloadAction<{
      userId: string;
      name: string;
      duration: number;
      goals: Array<{ type: string; targetValue: number; unit: string }>;
      restrictions: Array<{ type: string; name: string; severity: string }>;
    }>) => {
      const newMealPlan: SmartMealPlan = {
        id: `meal_plan_${Date.now()}`,
        userId: action.payload.userId,
        createdBy: state.aiNutritionist!.id,
        name: action.payload.name,
        duration: action.payload.duration,
        goals: action.payload.goals.map(g => ({
          type: g.type as any,
          targetValue: g.targetValue,
          unit: g.unit,
          priority: 'high' as const,
        })),
        restrictions: action.payload.restrictions.map(r => ({
          type: r.type as any,
          name: r.name,
          severity: r.severity as any,
        })),
        meals: [], // Would be populated by AI algorithm
        nutritionSummary: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
        },
        groceryList: [],
        estimatedCost: 0,
        createdAt: new Date(),
        isActive: true,
      };
      state.mealPlans.unshift(newMealPlan);
    },
    
    activateMealPlan: (state, action: PayloadAction<{ mealPlanId: string }>) => {
      // Deactivate all other meal plans
      state.mealPlans.forEach(plan => {
        plan.isActive = false;
      });
      
      // Activate the selected plan
      const plan = state.mealPlans.find(p => p.id === action.payload.mealPlanId);
      if (plan) {
        plan.isActive = true;
      }
    },
    
    // Food Analysis
    addFoodAnalysis: (state, action: PayloadAction<FoodAnalysis>) => {
      state.foodAnalyses.unshift(action.payload);
      // Keep only the latest 50 analyses
      if (state.foodAnalyses.length > 50) {
        state.foodAnalyses = state.foodAnalyses.slice(0, 50);
      }
    },
    
    // Recipe Management
    addRecipe: (state, action: PayloadAction<Recipe>) => {
      state.recipes.push(action.payload);
    },
    
    updateRecipe: (state, action: PayloadAction<{ recipeId: string; updates: Partial<Recipe> }>) => {
      const recipe = state.recipes.find(r => r.id === action.payload.recipeId);
      if (recipe) {
        Object.assign(recipe, action.payload.updates);
      }
    },
    
    // Grocery List Management
    generateGroceryList: (state, action: PayloadAction<{ mealPlanId: string }>) => {
      const mealPlan = state.mealPlans.find(p => p.id === action.payload.mealPlanId);
      if (mealPlan) {
        // In a real app, this would analyze the meal plan and generate a grocery list
        // For demo, we'll create a sample list
        const groceryList = [
          {
            foodId: 'banana',
            name: 'Bananas',
            category: 'Fruits',
            quantity: 7,
            unit: 'pieces',
            estimatedCost: 3.50,
            isOptional: false,
            alternatives: ['apples', 'berries'],
          },
          {
            foodId: 'chicken_breast',
            name: 'Chicken Breast',
            category: 'Proteins',
            quantity: 1,
            unit: 'lb',
            estimatedCost: 8.99,
            isOptional: false,
            alternatives: ['turkey breast', 'tofu'],
          },
          {
            foodId: 'quinoa',
            name: 'Quinoa',
            category: 'Grains',
            quantity: 500,
            unit: 'grams',
            estimatedCost: 6.99,
            isOptional: false,
            alternatives: ['brown rice', 'wild rice'],
          }
        ];
        
        state.groceryLists.push(groceryList);
        mealPlan.groceryList = groceryList;
        mealPlan.estimatedCost = groceryList.reduce((total, item) => total + item.estimatedCost, 0);
      }
    },
    
    // Update daily nutrition goals
    updateDailyGoals: (state, action: PayloadAction<{
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
    }>) => {
      state.dailyGoals = { ...state.dailyGoals, ...action.payload };
    },
    
    // Update AI Nutritionist
    updateAINutritionist: (state, action: PayloadAction<Partial<NutritionAI>>) => {
      if (state.aiNutritionist) {
        state.aiNutritionist = { ...state.aiNutritionist, ...action.payload };
      }
    },
  },
});

// Helper function to generate AI nutrition responses
function generateNutritionResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  if (message.includes('weight loss') || message.includes('lose weight')) {
    return "For sustainable weight loss, I recommend creating a moderate caloric deficit through balanced nutrition. Focus on lean proteins, complex carbs, and healthy fats. Would you like me to create a personalized meal plan for your goals?";
  }
  
  if (message.includes('muscle') || message.includes('build') || message.includes('gain')) {
    return "Building muscle requires adequate protein (0.8-1.2g per lb bodyweight) and sufficient calories. I can help you design meals that support muscle protein synthesis while meeting your taste preferences. What's your current protein intake?";
  }
  
  if (message.includes('meal plan') || message.includes('diet')) {
    return "I'd love to create a personalized meal plan for you! I'll need to know your goals, dietary restrictions, food preferences, and activity level. This helps me design meals you'll actually enjoy and stick to.";
  }
  
  if (message.includes('nutrition') || message.includes('healthy')) {
    return "Great question about nutrition! The key is finding a sustainable approach that fits your lifestyle. I focus on nutrient density, proper timing around workouts, and foods you actually enjoy. What specific area would you like to improve?";
  }
  
  return "I'm here to help optimize your nutrition for better health and fitness results! Whether you need meal planning, macro tracking, or dietary advice, I can provide personalized recommendations. What's your main nutrition concern right now?";
}

export const {
  setLoading,
  setError,
  clearError,
  startNutritionChat,
  sendNutritionMessage,
  createMealPlan,
  activateMealPlan,
  addFoodAnalysis,
  addRecipe,
  updateRecipe,
  generateGroceryList,
  updateDailyGoals,
  updateAINutritionist,
} = advancedNutritionSlice.actions;

export default advancedNutritionSlice.reducer;