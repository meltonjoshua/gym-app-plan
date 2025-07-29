import mongoose, { Document, Schema } from 'mongoose';

export interface IMealPlanMeal {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId?: mongoose.Types.ObjectId;
  customMeal?: {
    name: string;
    description?: string;
    estimatedCalories?: number;
  };
  servings: number;
  notes?: string;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface IMealPlanDay {
  date: Date;
  meals: IMealPlanMeal[];
  dailyNutritionGoals?: {
    calories?: number;
    protein?: number;
    carbohydrates?: number;
    fat?: number;
    fiber?: number;
  };
  actualNutrition?: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  notes?: string;
}

export interface IMealPlan extends Document {
  // Basic information
  name: string;
  description?: string;
  userId: mongoose.Types.ObjectId;
  
  // Plan duration
  startDate: Date;
  endDate: Date;
  
  // Meal plan data
  days: IMealPlanDay[];
  
  // Template and sharing
  isTemplate: boolean;
  isPublic: boolean;
  templateCategory?: 'weight-loss' | 'muscle-gain' | 'maintenance' | 'athletic' | 'therapeutic' | 'other';
  
  // Goals and preferences
  weeklyNutritionGoals?: {
    calories?: number;
    protein?: number;
    carbohydrates?: number;
    fat?: number;
    fiber?: number;
  };
  
  dietaryPreferences?: string[];
  allergens?: string[];
  
  // Usage tracking
  timesUsed: number;
  avgRating?: number;
  ratingCount: number;
  
  // Shopping list generation
  lastShoppingListGenerated?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  calculatePlanNutrition(): Promise<void>;
  generateShoppingList(): Promise<any[]>;
  getDayByDate(date: Date): IMealPlanDay | undefined;
  addMealToDay(date: Date, meal: IMealPlanMeal): Promise<IMealPlan>;
  markMealComplete(date: Date, mealIndex: number): Promise<IMealPlan>;
  getCompletionRate(): number;
}

const mealPlanMealSchema = new Schema<IMealPlanMeal>({
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  
  recipeId: {
    type: Schema.Types.ObjectId,
    ref: 'Recipe'
  },
  
  customMeal: {
    name: String,
    description: String,
    estimatedCalories: Number
  },
  
  servings: {
    type: Number,
    required: true,
    min: 0.1,
    max: 20
  },
  
  notes: String,
  
  isCompleted: {
    type: Boolean,
    default: false
  },
  
  completedAt: Date
});

const nutritionGoalsSchema = new Schema({
  calories: { type: Number, min: 0 },
  protein: { type: Number, min: 0 },
  carbohydrates: { type: Number, min: 0 },
  fat: { type: Number, min: 0 },
  fiber: { type: Number, min: 0 }
});

const actualNutritionSchema = new Schema({
  calories: { type: Number, required: true, min: 0 },
  protein: { type: Number, required: true, min: 0 },
  carbohydrates: { type: Number, required: true, min: 0 },
  fat: { type: Number, required: true, min: 0 },
  fiber: { type: Number, required: true, min: 0 },
  sugar: { type: Number, required: true, min: 0 },
  sodium: { type: Number, required: true, min: 0 }
});

const mealPlanDaySchema = new Schema<IMealPlanDay>({
  date: {
    type: Date,
    required: true
  },
  
  meals: [mealPlanMealSchema],
  
  dailyNutritionGoals: nutritionGoalsSchema,
  
  actualNutrition: actualNutritionSchema,
  
  notes: String
});

const mealPlanSchema = new Schema<IMealPlan>({
  name: {
    type: String,
    required: true,
    trim: true,
    index: 'text'
  },
  
  description: {
    type: String,
    trim: true,
    index: 'text'
  },
  
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  
  endDate: {
    type: Date,
    required: true,
    index: true
  },
  
  days: [mealPlanDaySchema],
  
  isTemplate: {
    type: Boolean,
    default: false,
    index: true
  },
  
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  
  templateCategory: {
    type: String,
    enum: ['weight-loss', 'muscle-gain', 'maintenance', 'athletic', 'therapeutic', 'other'],
    index: true
  },
  
  weeklyNutritionGoals: nutritionGoalsSchema,
  
  dietaryPreferences: [{
    type: String,
    index: true
  }],
  
  allergens: [{
    type: String,
    index: true
  }],
  
  timesUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  
  avgRating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  ratingCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  lastShoppingListGenerated: Date
}, {
  timestamps: true
});

// Indexes for efficient queries
mealPlanSchema.index({ userId: 1, startDate: -1 });
mealPlanSchema.index({ isTemplate: 1, isPublic: 1, templateCategory: 1 });
mealPlanSchema.index({ userId: 1, isTemplate: 1 });
mealPlanSchema.index({ 'days.date': 1 });

// Text search index
mealPlanSchema.index({
  name: 'text',
  description: 'text',
  dietaryPreferences: 'text'
}, {
  weights: {
    name: 10,
    description: 5,
    dietaryPreferences: 3
  },
  name: 'meal_plan_text_search'
});

// Validation
mealPlanSchema.pre('validate', function(this: IMealPlan) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    throw new Error('Start date must be before end date');
  }
});

// Methods
mealPlanSchema.methods.calculatePlanNutrition = async function(this: IMealPlan) {
  const Recipe = mongoose.model('Recipe');
  
  for (const day of this.days) {
    let dayNutrition = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    };
    
    for (const meal of day.meals) {
      if (meal.recipeId) {
        const recipe = await Recipe.findById(meal.recipeId);
        if (recipe) {
          // Calculate nutrition based on servings
          const mealNutrition = {
            calories: recipe.nutritionPerServing.calories * meal.servings,
            protein: recipe.nutritionPerServing.protein * meal.servings,
            carbohydrates: recipe.nutritionPerServing.carbohydrates * meal.servings,
            fat: recipe.nutritionPerServing.fat * meal.servings,
            fiber: (recipe.nutritionPerServing.fiber || 0) * meal.servings,
            sugar: (recipe.nutritionPerServing.sugar || 0) * meal.servings,
            sodium: (recipe.nutritionPerServing.sodium || 0) * meal.servings
          };
          
          dayNutrition.calories += mealNutrition.calories;
          dayNutrition.protein += mealNutrition.protein;
          dayNutrition.carbohydrates += mealNutrition.carbohydrates;
          dayNutrition.fat += mealNutrition.fat;
          dayNutrition.fiber += mealNutrition.fiber;
          dayNutrition.sugar += mealNutrition.sugar;
          dayNutrition.sodium += mealNutrition.sodium;
        }
      } else if (meal.customMeal?.estimatedCalories) {
        dayNutrition.calories += meal.customMeal.estimatedCalories * meal.servings;
      }
    }
    
    // Round values
    Object.keys(dayNutrition).forEach(key => {
      dayNutrition[key as keyof typeof dayNutrition] = Math.round(
        (dayNutrition[key as keyof typeof dayNutrition] as number) * 10
      ) / 10;
    });
    
    day.actualNutrition = dayNutrition;
  }
};

mealPlanSchema.methods.generateShoppingList = async function(this: IMealPlan) {
  const Recipe = mongoose.model('Recipe');
  const Food = mongoose.model('Food');
  
  const ingredientMap = new Map<string, {
    foodId: mongoose.Types.ObjectId;
    name: string;
    totalQuantity: number;
    unit: string;
    recipes: string[];
  }>();
  
  // Collect all ingredients from recipes
  for (const day of this.days) {
    for (const meal of day.meals) {
      if (meal.recipeId) {
        const recipe = await Recipe.findById(meal.recipeId).populate('ingredients.foodId');
        if (recipe) {
          for (const ingredient of recipe.ingredients) {
            const food = ingredient.foodId as any;
            const key = `${food._id}_${ingredient.unit}`;
            
            const quantity = ingredient.quantity * meal.servings;
            
            if (ingredientMap.has(key)) {
              const existing = ingredientMap.get(key)!;
              existing.totalQuantity += quantity;
              if (!existing.recipes.includes(recipe.name)) {
                existing.recipes.push(recipe.name);
              }
            } else {
              ingredientMap.set(key, {
                foodId: food._id,
                name: food.description,
                totalQuantity: quantity,
                unit: ingredient.unit,
                recipes: [recipe.name]
              });
            }
          }
        }
      }
    }
  }
  
  // Convert to shopping list format
  const shoppingList = Array.from(ingredientMap.values()).map(item => ({
    ...item,
    totalQuantity: Math.round(item.totalQuantity * 100) / 100,
    category: 'Unknown', // Could be enhanced with food categorization
    isPurchased: false
  }));
  
  // Sort by category and name
  shoppingList.sort((a, b) => a.name.localeCompare(b.name));
  
  this.lastShoppingListGenerated = new Date();
  await this.save();
  
  return shoppingList;
};

mealPlanSchema.methods.getDayByDate = function(this: IMealPlan, date: Date) {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  return this.days.find(day => {
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);
    return dayDate.getTime() === targetDate.getTime();
  });
};

mealPlanSchema.methods.addMealToDay = async function(this: IMealPlan, date: Date, meal: IMealPlanMeal) {
  let day = this.getDayByDate(date);
  
  if (!day) {
    // Create new day if it doesn't exist
    day = {
      date: new Date(date),
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
    };
    this.days.push(day);
  }
  
  day.meals.push(meal);
  
  // Recalculate nutrition for this day
  await this.calculatePlanNutrition();
  
  return this.save();
};

mealPlanSchema.methods.markMealComplete = async function(this: IMealPlan, date: Date, mealIndex: number) {
  const day = this.getDayByDate(date);
  
  if (day && day.meals[mealIndex]) {
    day.meals[mealIndex].isCompleted = true;
    day.meals[mealIndex].completedAt = new Date();
    return this.save();
  }
  
  throw new Error('Meal not found');
};

mealPlanSchema.methods.getCompletionRate = function(this: IMealPlan): number {
  let totalMeals = 0;
  let completedMeals = 0;
  
  for (const day of this.days) {
    for (const meal of day.meals) {
      totalMeals++;
      if (meal.isCompleted) {
        completedMeals++;
      }
    }
  }
  
  return totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;
};

// Static methods for searching meal plans
mealPlanSchema.statics.searchMealPlans = function(query: string, options: any = {}) {
  const {
    templateCategory,
    dietaryPreferences,
    isTemplate,
    isPublic,
    userId,
    limit = 20,
    skip = 0
  } = options;
  
  const filter: any = {};
  
  if (templateCategory) filter.templateCategory = templateCategory;
  if (isTemplate !== undefined) filter.isTemplate = isTemplate;
  if (isPublic !== undefined) filter.isPublic = isPublic;
  if (userId && !isPublic) filter.userId = userId;
  if (dietaryPreferences && dietaryPreferences.length > 0) {
    filter.dietaryPreferences = { $in: dietaryPreferences };
  }
  
  if (query && query.trim()) {
    return this.find(
      { ...filter, $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' }, timesUsed: -1 })
    .limit(limit)
    .skip(skip);
  } else {
    return this.find(filter)
      .sort({ timesUsed: -1, avgRating: -1 })
      .limit(limit)
      .skip(skip);
  }
};

export const MealPlan = mongoose.model<IMealPlan>('MealPlan', mealPlanSchema);

// Add static method typing
interface IMealPlanModel extends mongoose.Model<IMealPlan> {
  searchMealPlans(query: string, options?: any): mongoose.Query<IMealPlan[], IMealPlan>;
}

export const MealPlanModel = MealPlan as IMealPlanModel;
