import mongoose from 'mongoose';
import { connectDatabase } from '../utils/database';
import { MealPlanModel } from '../models/MealPlan';
import { RecipeModel } from '../models/Recipe';

interface SampleMealPlan {
  name: string;
  description: string;
  isTemplate: boolean;
  isPublic: boolean;
  templateCategory?: 'weight-loss' | 'muscle-gain' | 'maintenance' | 'athletic' | 'therapeutic' | 'other';
  dietaryPreferences: string[];
  allergens: string[];
  weeklyNutritionGoals?: {
    calories?: number;
    protein?: number;
    carbohydrates?: number;
    fat?: number;
    fiber?: number;
  };
  durationDays: number;
  mealPlan: Array<{
    day: number; // 0-based day index
    meals: Array<{
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      recipeName?: string;
      customMeal?: {
        name: string;
        description?: string;
        estimatedCalories?: number;
      };
      servings: number;
      notes?: string;
    }>;
  }>;
}

const sampleMealPlans: SampleMealPlan[] = [
  {
    name: "High Protein Muscle Building Plan",
    description: "7-day meal plan focused on muscle building with high protein content and balanced nutrition for active individuals.",
    isTemplate: true,
    isPublic: true,
    templateCategory: "muscle-gain",
    dietaryPreferences: ["high-protein", "fitness"],
    allergens: [],
    weeklyNutritionGoals: {
      calories: 2200,
      protein: 150,
      carbohydrates: 200,
      fat: 80,
      fiber: 35
    },
    durationDays: 7,
    mealPlan: [
      {
        day: 0, // Day 1
        meals: [
          { mealType: "breakfast", recipeName: "Simple Scrambled Eggs", servings: 1, notes: "With whole grain toast" },
          { mealType: "lunch", recipeName: "Protein Power Bowl", servings: 1 },
          { mealType: "dinner", recipeName: "Baked Salmon with Vegetables", servings: 1 },
          { mealType: "snack", recipeName: "Simple Banana Snack", servings: 1 }
        ]
      },
      {
        day: 1, // Day 2
        meals: [
          { mealType: "breakfast", recipeName: "Simple Scrambled Eggs", servings: 1.5, notes: "Extra protein" },
          { mealType: "lunch", recipeName: "Protein Power Bowl", servings: 1 },
          { mealType: "dinner", recipeName: "Baked Salmon with Vegetables", servings: 1 },
          { mealType: "snack", recipeName: "Fresh Apple Slices", servings: 1 }
        ]
      },
      {
        day: 2, // Day 3
        meals: [
          { mealType: "breakfast", recipeName: "Simple Scrambled Eggs", servings: 1, notes: "With avocado" },
          { mealType: "lunch", recipeName: "Protein Power Bowl", servings: 1.2 },
          { mealType: "dinner", recipeName: "Baked Salmon with Vegetables", servings: 1 },
          { mealType: "snack", customMeal: { name: "Protein Shake", estimatedCalories: 200 }, servings: 1 }
        ]
      }
    ]
  },
  {
    name: "Balanced Weight Management Plan",
    description: "Sustainable 5-day meal plan for healthy weight management with balanced macronutrients and portion control.",
    isTemplate: true,
    isPublic: true,
    templateCategory: "weight-loss",
    dietaryPreferences: ["balanced", "portion-control"],
    allergens: [],
    weeklyNutritionGoals: {
      calories: 1800,
      protein: 100,
      carbohydrates: 180,
      fat: 60,
      fiber: 30
    },
    durationDays: 5,
    mealPlan: [
      {
        day: 0, // Day 1
        meals: [
          { mealType: "breakfast", recipeName: "Simple Scrambled Eggs", servings: 0.8 },
          { mealType: "lunch", recipeName: "Baked Salmon with Vegetables", servings: 0.8 },
          { mealType: "dinner", recipeName: "Protein Power Bowl", servings: 0.8 },
          { mealType: "snack", recipeName: "Fresh Apple Slices", servings: 1 }
        ]
      },
      {
        day: 1, // Day 2
        meals: [
          { mealType: "breakfast", recipeName: "Simple Scrambled Eggs", servings: 0.8 },
          { mealType: "lunch", recipeName: "Protein Power Bowl", servings: 0.8 },
          { mealType: "dinner", recipeName: "Baked Salmon with Vegetables", servings: 0.8 },
          { mealType: "snack", recipeName: "Simple Banana Snack", servings: 1 }
        ]
      }
    ]
  },
  {
    name: "Quick & Easy Meal Plan",
    description: "Simple 3-day meal plan for busy people with quick preparation times and minimal cooking.",
    isTemplate: true,
    isPublic: true,
    templateCategory: "maintenance",
    dietaryPreferences: ["quick-prep", "simple"],
    allergens: [],
    weeklyNutritionGoals: {
      calories: 2000,
      protein: 120,
      carbohydrates: 220,
      fat: 70,
      fiber: 25
    },
    durationDays: 3,
    mealPlan: [
      {
        day: 0, // Day 1
        meals: [
          { mealType: "breakfast", recipeName: "Simple Scrambled Eggs", servings: 1 },
          { mealType: "lunch", customMeal: { name: "Quick Sandwich", estimatedCalories: 350 }, servings: 1 },
          { mealType: "dinner", recipeName: "Baked Salmon with Vegetables", servings: 1 },
          { mealType: "snack", recipeName: "Simple Banana Snack", servings: 1 }
        ]
      },
      {
        day: 1, // Day 2
        meals: [
          { mealType: "breakfast", customMeal: { name: "Yogurt & Fruit", estimatedCalories: 200 }, servings: 1 },
          { mealType: "lunch", recipeName: "Protein Power Bowl", servings: 1 },
          { mealType: "dinner", customMeal: { name: "Grilled Chicken Salad", estimatedCalories: 400 }, servings: 1 },
          { mealType: "snack", recipeName: "Fresh Apple Slices", servings: 1 }
        ]
      }
    ]
  }
];

export const seedMealPlans = async (userId?: string) => {
  try {
    await connectDatabase();
    
    // Use a default user ID for seeding (in production, you'd use real user IDs)
    const defaultUserId = userId || new mongoose.Types.ObjectId();
    
    console.log('Starting meal plan seeding...');
    
    // Clear existing meal plan templates for clean seed
    await MealPlanModel.deleteMany({ userId: defaultUserId, isTemplate: true });
    console.log('Cleared existing seeded meal plan templates');
    
    let createdCount = 0;
    
    for (const planData of sampleMealPlans) {
      try {
        // Calculate start and end dates (starting from today)
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + planData.durationDays - 1);
        
        // Generate days array
        const days: any[] = [];
        const currentDate = new Date(startDate);
        
        for (let i = 0; i < planData.durationDays; i++) {
          days.push({
            date: new Date(currentDate),
            meals: [],
            actualNutrition: {
              calories: 0,
              protein: 0,
              carbohydrates: 0,
              fat: 0,
              fiber: 0,
              sugar: 0,
              sodium: 0
            }
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Add meals to days
        for (const dayPlan of planData.mealPlan) {
          if (dayPlan.day < days.length) {
            const day = days[dayPlan.day];
            
            for (const mealData of dayPlan.meals) {
              let recipeId = undefined;
              
              // Find recipe by name if specified
              if (mealData.recipeName) {
                const recipe = await RecipeModel.findOne({ 
                  name: { $regex: new RegExp(mealData.recipeName, 'i') }
                });
                
                if (recipe) {
                  recipeId = recipe._id;
                } else {
                  console.warn(`Recipe not found: ${mealData.recipeName}`);
                  // Convert to custom meal
                  mealData.customMeal = {
                    name: mealData.recipeName,
                    estimatedCalories: 300 // Default estimate
                  };
                  delete mealData.recipeName;
                }
              }
              
              day.meals.push({
                mealType: mealData.mealType,
                recipeId,
                customMeal: mealData.customMeal,
                servings: mealData.servings,
                notes: mealData.notes,
                isCompleted: false
              });
            }
          }
        }
        
        const mealPlan = new MealPlanModel({
          name: planData.name,
          description: planData.description,
          userId: defaultUserId,
          startDate,
          endDate,
          days,
          isTemplate: planData.isTemplate,
          isPublic: planData.isPublic,
          templateCategory: planData.templateCategory,
          weeklyNutritionGoals: planData.weeklyNutritionGoals,
          dietaryPreferences: planData.dietaryPreferences,
          allergens: planData.allergens
        });
        
        // Calculate nutrition for the plan
        await mealPlan.calculatePlanNutrition();
        
        await mealPlan.save();
        createdCount++;
        console.log(`✓ Created meal plan template: ${planData.name}`);
        
      } catch (error) {
        console.error(`Error creating meal plan ${planData.name}:`, error);
      }
    }
    
    console.log(`\n🎉 Successfully seeded ${createdCount} meal plan templates!`);
    
    // Display created meal plans with nutrition info
    const createdPlans = await MealPlanModel.find({ userId: defaultUserId, isTemplate: true })
      .populate('days.meals.recipeId', 'name');
    
    console.log('\n📋 Created Meal Plan Templates:');
    createdPlans.forEach((plan, index) => {
      const totalMeals = plan.days.reduce((sum, day) => sum + day.meals.length, 0);
      const avgDailyCalories = plan.days.length > 0 
        ? Math.round(plan.days.reduce((sum, day) => sum + (day.actualNutrition?.calories || 0), 0) / plan.days.length)
        : 0;
      
      console.log(`${index + 1}. ${plan.name}`);
      console.log(`   Category: ${plan.templateCategory} | Duration: ${plan.days.length} days`);
      console.log(`   Avg daily calories: ${avgDailyCalories} | Total meals: ${totalMeals}`);
      console.log(`   Dietary preferences: ${plan.dietaryPreferences?.join(', ') || 'None'}`);
      console.log('');
    });
    
    return createdPlans;
    
  } catch (error) {
    console.error('Error seeding meal plans:', error);
    throw error;
  }
};

// Allow running this script directly
if (require.main === module) {
  seedMealPlans()
    .then(() => {
      console.log('Meal plan seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Meal plan seeding failed:', error);
      process.exit(1);
    });
}
