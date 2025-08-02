import mongoose, { Document, Schema } from 'mongoose';

export interface IRecipeIngredient {
  foodId: mongoose.Types.ObjectId;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface IRecipeInstruction {
  stepNumber: number;
  instruction: string;
  estimatedTime?: number; // minutes
}

export interface IRecipeNutrition {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  saturatedFat?: number;
  transFat?: number;
}

export interface IRecipe extends Document {
  // Basic recipe information
  name: string;
  description?: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'beverage' | 'other';
  cuisine?: string;
  
  // Recipe details
  servings: number;
  prepTime?: number;     // minutes
  cookTime?: number;     // minutes
  totalTime?: number;    // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Ingredients and instructions
  ingredients: IRecipeIngredient[];
  instructions: IRecipeInstruction[];
  
  // Nutrition (calculated from ingredients)
  nutritionPerServing: IRecipeNutrition;
  nutritionTotal: IRecipeNutrition;
  
  // Media and presentation
  imageUrl?: string;
  tags: string[];
  
  // User and sharing
  userId: mongoose.Types.ObjectId;
  isPublic: boolean;
  isVerified: boolean;
  
  // Usage analytics
  timesMade: number;
  avgRating?: number;
  ratingCount: number;
  lastMade?: Date;
  
  // Search and discovery
  searchTerms: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  calculateNutrition(): Promise<void>;
  updateSearchTerms(): void;
  incrementTimesMade(): Promise<IRecipe>;
}

const recipeIngredientSchema = new Schema<IRecipeIngredient>({
  foodId: {
    type: Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true
  },
  notes: String
});

const recipeInstructionSchema = new Schema<IRecipeInstruction>({
  stepNumber: {
    type: Number,
    required: true,
    min: 1
  },
  instruction: {
    type: String,
    required: true
  },
  estimatedTime: {
    type: Number,
    min: 0
  }
});

const nutritionSchema = new Schema<IRecipeNutrition>({
  calories: { type: Number, required: true, min: 0 },
  protein: { type: Number, required: true, min: 0 },
  carbohydrates: { type: Number, required: true, min: 0 },
  fat: { type: Number, required: true, min: 0 },
  fiber: { type: Number, min: 0 },
  sugar: { type: Number, min: 0 },
  sodium: { type: Number, min: 0 },
  cholesterol: { type: Number, min: 0 },
  saturatedFat: { type: Number, min: 0 },
  transFat: { type: Number, min: 0 }
});

const recipeSchema = new Schema<IRecipe>({
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
  
  category: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'beverage', 'other'],
    required: true,
    index: true
  },
  
  cuisine: {
    type: String,
    trim: true,
    index: true
  },
  
  servings: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  
  prepTime: {
    type: Number,
    min: 0
  },
  
  cookTime: {
    type: Number,
    min: 0
  },
  
  totalTime: {
    type: Number,
    min: 0
  },
  
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
    index: true
  },
  
  ingredients: [recipeIngredientSchema],
  
  instructions: [recipeInstructionSchema],
  
  nutritionPerServing: {
    type: nutritionSchema,
    required: true
  },
  
  nutritionTotal: {
    type: nutritionSchema,
    required: true
  },
  
  imageUrl: String,
  
  tags: [{
    type: String,
    index: 'text'
  }],
  
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  
  timesMade: {
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
  
  lastMade: Date,
  
  searchTerms: [{
    type: String,
    index: 'text'
  }]
}, {
  timestamps: true
});

// Create compound text index for search
recipeSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
  searchTerms: 'text',
  cuisine: 'text'
}, {
  weights: {
    name: 10,
    description: 5,
    tags: 3,
    searchTerms: 2,
    cuisine: 1
  },
  name: 'recipe_text_search'
});

// Compound indexes for common queries
recipeSchema.index({ userId: 1, isPublic: 1 });
recipeSchema.index({ category: 1, difficulty: 1 });
recipeSchema.index({ timesMade: -1, avgRating: -1 });
recipeSchema.index({ isPublic: 1, isVerified: 1, avgRating: -1 });

// Virtual for popularity score
recipeSchema.virtual('popularityScore').get(function() {
  const timesMadeWeight = this.timesMade * 2;
  const ratingWeight = (this.avgRating || 0) * this.ratingCount;
  return timesMadeWeight + ratingWeight;
});

// Methods
recipeSchema.methods.calculateNutrition = async function(this: IRecipe) {
  const Food = mongoose.model('Food');
  
  let totalNutrition = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0,
    saturatedFat: 0,
    transFat: 0
  };
  
  // Calculate nutrition for each ingredient
  for (const ingredient of this.ingredients) {
    const food = await Food.findById(ingredient.foodId);
    if (food) {
      const nutrition = food.getNutritionForQuantity(ingredient.quantity, ingredient.unit);
      
      totalNutrition.calories += nutrition.calories;
      totalNutrition.protein += nutrition.protein;
      totalNutrition.carbohydrates += nutrition.carbohydrates;
      totalNutrition.fat += nutrition.fat;
      totalNutrition.fiber += nutrition.fiber || 0;
      totalNutrition.sugar += nutrition.sugar || 0;
      totalNutrition.sodium += nutrition.sodium || 0;
      totalNutrition.cholesterol += nutrition.cholesterol || 0;
      totalNutrition.saturatedFat += nutrition.saturatedFat || 0;
      totalNutrition.transFat += nutrition.transFat || 0;
    }
  }
  
  // Round values
  Object.keys(totalNutrition).forEach(key => {
    totalNutrition[key as keyof typeof totalNutrition] = Math.round(
      (totalNutrition[key as keyof typeof totalNutrition] as number) * 10
    ) / 10;
  });
  
  // Calculate per serving
  const perServingNutrition = Object.keys(totalNutrition).reduce((acc, key) => {
    acc[key as keyof typeof totalNutrition] = Math.round(
      ((totalNutrition[key as keyof typeof totalNutrition] as number) / this.servings) * 10
    ) / 10;
    return acc;
  }, {} as any);
  
  this.nutritionTotal = totalNutrition;
  this.nutritionPerServing = perServingNutrition;
};

recipeSchema.methods.updateSearchTerms = function(this: IRecipe) {
  const terms = new Set<string>();
  
  // Add words from name and description
  const text = `${this.name} ${this.description || ''}`.toLowerCase();
  const words = text.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(word => word.length > 2);
  words.forEach(word => terms.add(word));
  
  // Add cuisine and category
  if (this.cuisine) terms.add(this.cuisine.toLowerCase());
  terms.add(this.category);
  
  // Add tags
  this.tags.forEach(tag => terms.add(tag.toLowerCase()));
  
  this.searchTerms = Array.from(terms);
};

recipeSchema.methods.incrementTimesMade = function(this: IRecipe) {
  this.timesMade += 1;
  this.lastMade = new Date();
  return this.save();
};

// Pre-save middleware
recipeSchema.pre('save', async function(this: IRecipe) {
  // Update search terms
  this.updateSearchTerms();
  
  // Calculate total time if not provided
  if (!this.totalTime && (this.prepTime || this.cookTime)) {
    this.totalTime = (this.prepTime || 0) + (this.cookTime || 0);
  }
  
  // Calculate nutrition if ingredients changed
  if (this.isModified('ingredients') || this.isModified('servings')) {
    await this.calculateNutrition();
  }
});

// Static methods
recipeSchema.statics.searchRecipes = function(query: string, options: any = {}) {
  const {
    category,
    difficulty,
    cuisine,
    isPublic,
    userId,
    maxTime,
    minRating,
    limit = 20,
    skip = 0
  } = options;
  
  const filter: any = {};
  
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  if (cuisine) filter.cuisine = cuisine;
  if (isPublic !== undefined) filter.isPublic = isPublic;
  if (userId && !isPublic) filter.userId = userId;
  if (maxTime) filter.totalTime = { $lte: maxTime };
  if (minRating) filter.avgRating = { $gte: minRating };
  
  if (query && query.trim()) {
    // Text search with scoring
    return this.find(
      { ...filter, $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' }, timesMade: -1 })
    .limit(limit)
    .skip(skip)
    .populate('ingredients.foodId', 'description brandName');
  } else {
    // No search query - sort by popularity
    return this.find(filter)
      .sort({ timesMade: -1, avgRating: -1 })
      .limit(limit)
      .skip(skip)
      .populate('ingredients.foodId', 'description brandName');
  }
};

export const Recipe = mongoose.model<IRecipe>('Recipe', recipeSchema);

// Add static method typing
interface IRecipeModel extends mongoose.Model<IRecipe> {
  searchRecipes(query: string, options?: any): mongoose.Query<IRecipe[], IRecipe>;
}

export const RecipeModel = Recipe as IRecipeModel;
