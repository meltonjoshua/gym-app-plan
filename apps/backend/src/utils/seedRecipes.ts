import mongoose from 'mongoose';
import { connectDatabase } from '../utils/database';
import { RecipeModel } from '../models/Recipe';
import { Food } from '../models/Food';

interface SampleRecipe {
  name: string;
  description: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'beverage' | 'other';
  cuisine?: string;
  servings: number;
  prepTime?: number;
  cookTime?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Array<{
    foodName: string;
    quantity: number;
    unit: string;
    notes?: string;
  }>;
  instructions: Array<{
    stepNumber: number;
    instruction: string;
    estimatedTime?: number;
  }>;
  tags: string[];
  isPublic: boolean;
}

const sampleRecipes: SampleRecipe[] = [
  {
    name: "Protein Power Bowl",
    description: "A nutritious bowl packed with lean protein and fresh vegetables for post-workout recovery.",
    category: "lunch",
    cuisine: "American",
    servings: 2,
    prepTime: 15,
    cookTime: 20,
    difficulty: "easy",
    ingredients: [
      { foodName: "Chicken breast, skinless, boneless, raw", quantity: 200, unit: "g" },
      { foodName: "Rice, white, long-grain, regular, cooked", quantity: 150, unit: "g", notes: "cooked" },
      { foodName: "Broccoli, raw", quantity: 100, unit: "g", notes: "steamed" },
      { foodName: "Egg, whole, raw, fresh", quantity: 1, unit: "large", notes: "hard-boiled" }
    ],
    instructions: [
      { stepNumber: 1, instruction: "Season chicken breast with salt and pepper", estimatedTime: 2 },
      { stepNumber: 2, instruction: "Grill chicken breast for 6-7 minutes per side until cooked through", estimatedTime: 15 },
      { stepNumber: 3, instruction: "Steam broccoli until tender", estimatedTime: 5 },
      { stepNumber: 4, instruction: "Boil egg for 10 minutes, then cool and peel", estimatedTime: 12 },
      { stepNumber: 5, instruction: "Slice chicken and arrange over rice with broccoli and sliced egg", estimatedTime: 3 }
    ],
    tags: ["high-protein", "healthy", "post-workout", "gluten-free"],
    isPublic: true
  },
  {
    name: "Simple Banana Snack",
    description: "Fresh banana slice - perfect natural energy for pre or post workout.",
    category: "snack",
    cuisine: "American",
    servings: 1,
    prepTime: 2,
    cookTime: 0,
    difficulty: "easy",
    ingredients: [
      { foodName: "Banana, raw", quantity: 1, unit: "medium", notes: "sliced" }
    ],
    instructions: [
      { stepNumber: 1, instruction: "Peel banana and slice into rounds", estimatedTime: 1 },
      { stepNumber: 2, instruction: "Enjoy fresh or add to other dishes", estimatedTime: 1 }
    ],
    tags: ["quick", "natural", "potassium", "energy"],
    isPublic: true
  },
  {
    name: "Baked Salmon with Vegetables",
    description: "Heart-healthy salmon baked with colorful vegetables, rich in omega-3 fatty acids.",
    category: "dinner",
    cuisine: "Mediterranean",
    servings: 4,
    prepTime: 10,
    cookTime: 25,
    difficulty: "medium",
    ingredients: [
      { foodName: "Salmon, Atlantic, farmed, cooked, dry heat", quantity: 400, unit: "g", notes: "4 fillets" },
      { foodName: "Broccoli, raw", quantity: 200, unit: "g", notes: "cut into florets" }
    ],
    instructions: [
      { stepNumber: 1, instruction: "Preheat oven to 400°F (200°C)", estimatedTime: 5 },
      { stepNumber: 2, instruction: "Season salmon fillets with salt, pepper, and lemon juice", estimatedTime: 3 },
      { stepNumber: 3, instruction: "Arrange salmon and broccoli on baking sheet", estimatedTime: 2 },
      { stepNumber: 4, instruction: "Bake for 20-25 minutes until salmon flakes easily", estimatedTime: 25 },
      { stepNumber: 5, instruction: "Serve immediately with lemon wedges", estimatedTime: 2 }
    ],
    tags: ["omega-3", "heart-healthy", "low-carb", "gluten-free"],
    isPublic: true
  },
  {
    name: "Fresh Apple Slices",
    description: "Crisp apple slices - nature's perfect snack packed with fiber and vitamins.",
    category: "snack",
    servings: 1,
    prepTime: 3,
    cookTime: 0,
    difficulty: "easy",
    ingredients: [
      { foodName: "Apple, raw, with skin", quantity: 1, unit: "medium", notes: "finely diced" }
    ],
    instructions: [
      { stepNumber: 1, instruction: "Wash apple thoroughly", estimatedTime: 1 },
      { stepNumber: 2, instruction: "Core and slice into wedges or dice as preferred", estimatedTime: 2 },
      { stepNumber: 3, instruction: "Enjoy fresh or with nut butter", estimatedTime: 0 }
    ],
    tags: ["fiber", "vitamins", "natural-sweetness", "antioxidants"],
    isPublic: true
  },
  {
    name: "Simple Scrambled Eggs",
    description: "Classic breakfast staple, quick and protein-rich to start your day right.",
    category: "breakfast",
    servings: 1,
    prepTime: 2,
    cookTime: 5,
    difficulty: "easy",
    ingredients: [
      { foodName: "Egg, whole, raw, fresh", quantity: 2, unit: "large", notes: "room temperature" }
    ],
    instructions: [
      { stepNumber: 1, instruction: "Crack eggs into a bowl and whisk with salt and pepper", estimatedTime: 1 },
      { stepNumber: 2, instruction: "Heat butter in non-stick pan over medium-low heat", estimatedTime: 1 },
      { stepNumber: 3, instruction: "Pour in eggs and gently stir continuously", estimatedTime: 3 },
      { stepNumber: 4, instruction: "Remove from heat while still slightly creamy", estimatedTime: 1 },
      { stepNumber: 5, instruction: "Serve immediately", estimatedTime: 1 }
    ],
    tags: ["quick", "protein", "breakfast", "vegetarian"],
    isPublic: true
  }
];

export const seedRecipes = async (userId?: string) => {
  try {
    await connectDatabase();
    
    // Use a default user ID for seeding (in production, you'd use real user IDs)
    const defaultUserId = userId || new mongoose.Types.ObjectId();
    
    console.log('Starting recipe seeding...');
    
    // Clear existing recipes for clean seed
    await RecipeModel.deleteMany({ userId: defaultUserId });
    console.log('Cleared existing seeded recipes');
    
    let createdCount = 0;
    
    for (const recipeData of sampleRecipes) {
      try {
        // Find food items by name (case-insensitive)
        const recipeIngredients = [];
        
        for (const ingredient of recipeData.ingredients) {
          const food = await Food.findOne({ 
            description: { $regex: new RegExp(ingredient.foodName, 'i') }
          });
          
          if (food) {
            recipeIngredients.push({
              foodId: food._id,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
              notes: ingredient.notes
            });
          } else {
            console.warn(`Food not found for ingredient: ${ingredient.foodName}`);
            // Skip this recipe if we can't find the food items
            continue;
          }
        }
        
        // Only create recipe if we found all ingredients
        if (recipeIngredients.length === recipeData.ingredients.length) {
          const recipe = new RecipeModel({
            name: recipeData.name,
            description: recipeData.description,
            category: recipeData.category,
            cuisine: recipeData.cuisine,
            servings: recipeData.servings,
            prepTime: recipeData.prepTime,
            cookTime: recipeData.cookTime,
            difficulty: recipeData.difficulty,
            ingredients: recipeIngredients,
            instructions: recipeData.instructions,
            tags: recipeData.tags,
            userId: defaultUserId,
            isPublic: recipeData.isPublic,
            // These will be calculated by pre-save middleware
            nutritionPerServing: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
            nutritionTotal: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
          });
          
          await recipe.save();
          createdCount++;
          console.log(`✓ Created recipe: ${recipeData.name}`);
        } else {
          console.log(`✗ Skipped recipe: ${recipeData.name} (missing ingredients)`);
        }
        
      } catch (error) {
        console.error(`Error creating recipe ${recipeData.name}:`, error);
      }
    }
    
    console.log(`\n🎉 Successfully seeded ${createdCount} recipes!`);
    
    // Display created recipes with nutrition info
    const createdRecipes = await RecipeModel.find({ userId: defaultUserId })
      .populate('ingredients.foodId', 'description');
    
    console.log('\n📋 Created Recipes:');
    createdRecipes.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.name}`);
      console.log(`   Category: ${recipe.category} | Difficulty: ${recipe.difficulty}`);
      console.log(`   Nutrition per serving: ${Math.round(recipe.nutritionPerServing.calories)} cal, ${Math.round(recipe.nutritionPerServing.protein)}g protein`);
      console.log(`   Ingredients: ${recipe.ingredients.length} items`);
      console.log(`   Tags: ${recipe.tags.join(', ')}`);
      console.log('');
    });
    
    return createdRecipes;
    
  } catch (error) {
    console.error('Error seeding recipes:', error);
    throw error;
  }
};

// Allow running this script directly
if (require.main === module) {
  seedRecipes()
    .then(() => {
      console.log('Recipe seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Recipe seeding failed:', error);
      process.exit(1);
    });
}
