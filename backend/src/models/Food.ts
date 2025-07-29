import mongoose, { Document, Schema } from 'mongoose';

export interface IFood extends Document {
  // USDA FoodData Central ID (if from external source)
  fdcId?: number;
  
  // Basic food information
  description: string;
  brandName?: string;
  brandOwner?: string;
  
  // Classification
  foodCategory?: string;
  dataType: 'foundation' | 'sr_legacy' | 'survey' | 'branded' | 'custom';
  
  // Nutrition per 100g (standardized)
  nutritionPer100g: {
    calories: number;
    protein: number;      // grams
    carbohydrates: number; // grams
    fat: number;          // grams
    fiber?: number;       // grams
    sugar?: number;       // grams
    sodium?: number;      // mg
    cholesterol?: number; // mg
    saturatedFat?: number; // grams
    transFat?: number;    // grams
  };
  
  // Detailed nutrients (optional micronutrients)
  detailedNutrients?: Map<string, {
    amount: number;
    unit: string;
    name: string;
  }>;
  
  // Serving information
  servingSizes?: [{
    amount: number;
    unit: string;
    description?: string;
    gramWeight?: number;
  }];
  
  // Search and organization
  searchTerms: string[];
  commonNames?: string[];
  ingredients?: string[];
  
  // User-specific data (for custom foods)
  userId?: mongoose.Types.ObjectId;
  isCustom: boolean;
  isVerified: boolean;
  
  // Usage analytics
  searchCount: number;
  lastSearched?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  incrementSearchCount(): Promise<IFood>;
  getNutritionForQuantity(quantity: number, unit?: string): any;
}

const nutritionSchema = new Schema({
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

const servingSizeSchema = new Schema({
  amount: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  description: String,
  gramWeight: Number
});

const foodSchema = new Schema<IFood>({
  fdcId: {
    type: Number,
    sparse: true,
    unique: true
  },
  
  description: {
    type: String,
    required: true,
    index: 'text'
  },
  
  brandName: {
    type: String,
    index: 'text'
  },
  
  brandOwner: String,
  
  foodCategory: {
    type: String,
    index: true
  },
  
  dataType: {
    type: String,
    enum: ['foundation', 'sr_legacy', 'survey', 'branded', 'custom'],
    required: true,
    index: true
  },
  
  nutritionPer100g: {
    type: nutritionSchema,
    required: true
  },
  
  detailedNutrients: {
    type: Map,
    of: {
      amount: Number,
      unit: String,
      name: String
    }
  },
  
  servingSizes: [servingSizeSchema],
  
  searchTerms: [{
    type: String,
    index: 'text'
  }],
  
  commonNames: [{
    type: String,
    index: 'text'
  }],
  
  ingredients: [String],
  
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  isCustom: {
    type: Boolean,
    default: false,
    index: true
  },
  
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  
  searchCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  lastSearched: Date
}, {
  timestamps: true
});

// Create compound text index for search
foodSchema.index({
  description: 'text',
  brandName: 'text',
  searchTerms: 'text',
  commonNames: 'text'
}, {
  weights: {
    description: 10,
    brandName: 5,
    searchTerms: 3,
    commonNames: 2
  },
  name: 'food_text_search'
});

// Compound indexes for common queries
foodSchema.index({ dataType: 1, isCustom: 1 });
foodSchema.index({ userId: 1, isCustom: 1 });
foodSchema.index({ foodCategory: 1, dataType: 1 });
foodSchema.index({ searchCount: -1, lastSearched: -1 });

// Virtual for popularity score
foodSchema.virtual('popularityScore').get(function() {
  const daysSinceLastSearch = this.lastSearched 
    ? (Date.now() - this.lastSearched.getTime()) / (1000 * 60 * 60 * 24)
    : 365;
  
  // Higher search count and more recent searches = higher score
  return this.searchCount * Math.exp(-daysSinceLastSearch / 30);
});

// Methods
foodSchema.methods.incrementSearchCount = function(this: IFood) {
  this.searchCount += 1;
  this.lastSearched = new Date();
  return this.save();
};

foodSchema.methods.getNutritionForQuantity = function(this: IFood, quantity: number, unit: string = 'g') {
  let gramWeight = quantity;
  
  // Convert to grams if using serving size
  if (unit !== 'g' && this.servingSizes) {
    const servingSize = this.servingSizes.find((s: any) => s.unit === unit);
    if (servingSize && servingSize.gramWeight) {
      gramWeight = quantity * servingSize.gramWeight;
    }
  }
  
  // Calculate nutrition for the specified quantity
  const factor = gramWeight / 100; // nutritionPer100g is the base
  const nutrition = {
    calories: Math.round(this.nutritionPer100g.calories * factor),
    protein: Number((this.nutritionPer100g.protein * factor).toFixed(1)),
    carbohydrates: Number((this.nutritionPer100g.carbohydrates * factor).toFixed(1)),
    fat: Number((this.nutritionPer100g.fat * factor).toFixed(1)),
    fiber: this.nutritionPer100g.fiber ? Number((this.nutritionPer100g.fiber * factor).toFixed(1)) : undefined,
    sugar: this.nutritionPer100g.sugar ? Number((this.nutritionPer100g.sugar * factor).toFixed(1)) : undefined,
    sodium: this.nutritionPer100g.sodium ? Number((this.nutritionPer100g.sodium * factor).toFixed(1)) : undefined,
    cholesterol: this.nutritionPer100g.cholesterol ? Number((this.nutritionPer100g.cholesterol * factor).toFixed(1)) : undefined,
    saturatedFat: this.nutritionPer100g.saturatedFat ? Number((this.nutritionPer100g.saturatedFat * factor).toFixed(1)) : undefined,
    transFat: this.nutritionPer100g.transFat ? Number((this.nutritionPer100g.transFat * factor).toFixed(1)) : undefined
  };
  
  return nutrition;
};

// Static methods
foodSchema.statics.searchFoods = function(query: string, options: any = {}) {
  const {
    category,
    dataType,
    isCustom,
    userId,
    limit = 20,
    skip = 0
  } = options;
  
  const filter: any = {};
  
  if (category) filter.foodCategory = category;
  if (dataType) filter.dataType = dataType;
  if (isCustom !== undefined) filter.isCustom = isCustom;
  if (userId && isCustom) filter.userId = userId;
  
  if (query.trim()) {
    // Text search with scoring
    return this.find(
      { ...filter, $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' }, searchCount: -1 })
    .limit(limit)
    .skip(skip);
  } else {
    // No search query - sort by popularity
    return this.find(filter)
      .sort({ searchCount: -1, lastSearched: -1 })
      .limit(limit)
      .skip(skip);
  }
};

export const Food = mongoose.model<IFood>('Food', foodSchema);

// Add static method typing
interface IFoodModel extends mongoose.Model<IFood> {
  searchFoods(query: string, options?: any): mongoose.Query<IFood[], IFood>;
}

export const FoodModel = Food as IFoodModel;
