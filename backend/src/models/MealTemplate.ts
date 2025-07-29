import mongoose, { Schema, Document } from 'mongoose';

export interface IMealTemplateFood {
  foodId: mongoose.Types.ObjectId;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface IMealTemplate extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: IMealTemplateFood[];
  isPublic: boolean;
  tags: string[];
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
  useCount: number;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Instance methods
export interface IMealTemplateDocument extends IMealTemplate {
  calculateNutrition(): Promise<void>;
  incrementUseCount(): Promise<IMealTemplateDocument>;
  toFoodLogEntries(targetDate: Date): Promise<any[]>;
}

// Static methods
export interface IMealTemplateModel extends mongoose.Model<IMealTemplateDocument> {
  getUserTemplates(userId: string, mealType?: string): Promise<IMealTemplateDocument[]>;
  getPublicTemplates(mealType?: string, limit?: number): Promise<IMealTemplateDocument[]>;
  getMostUsedTemplates(userId: string, limit?: number): Promise<IMealTemplateDocument[]>;
  searchTemplates(query: string, userId?: string): Promise<IMealTemplateDocument[]>;
}

const mealTemplateFoodSchema = new Schema<IMealTemplateFood>({
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
    required: true,
    enum: ['g', 'oz', 'cup', 'ml', 'tbsp', 'tsp', 'piece', 'slice', 'serving']
  },
  notes: {
    type: String,
    maxlength: 200
  }
}, { _id: false });

const mealTemplateSchema = new Schema<IMealTemplateDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    index: true
  },
  foods: [mealTemplateFoodSchema],
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  estimatedCalories: {
    type: Number,
    default: 0,
    min: 0
  },
  estimatedProtein: {
    type: Number,
    default: 0,
    min: 0
  },
  estimatedCarbs: {
    type: Number,
    default: 0,
    min: 0
  },
  estimatedFat: {
    type: Number,
    default: 0,
    min: 0
  },
  useCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
mealTemplateSchema.index({ userId: 1, mealType: 1 });
mealTemplateSchema.index({ isPublic: 1, mealType: 1 });
mealTemplateSchema.index({ userId: 1, useCount: -1 });
mealTemplateSchema.index({ userId: 1, lastUsed: -1 });
mealTemplateSchema.index({ tags: 1 });
mealTemplateSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for populated foods
mealTemplateSchema.virtual('populatedFoods', {
  ref: 'Food',
  localField: 'foods.foodId',
  foreignField: '_id'
});

// Instance methods
mealTemplateSchema.methods.calculateNutrition = async function(): Promise<void> {
  await this.populate('foods.foodId', 'nutritionPer100g');
  
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const food of this.foods) {
    if (food.foodId && (food.foodId as any).nutritionPer100g) {
      const nutrition = (food.foodId as any).nutritionPer100g;
      const factor = food.quantity / 100; // Nutrition is per 100g
      
      totalCalories += (nutrition.calories || 0) * factor;
      totalProtein += (nutrition.protein || 0) * factor;
      totalCarbs += (nutrition.carbohydrates || 0) * factor;
      totalFat += (nutrition.fat || 0) * factor;
    }
  }

  this.estimatedCalories = Math.round(totalCalories);
  this.estimatedProtein = Math.round(totalProtein * 10) / 10;
  this.estimatedCarbs = Math.round(totalCarbs * 10) / 10;
  this.estimatedFat = Math.round(totalFat * 10) / 10;
};

mealTemplateSchema.methods.incrementUseCount = async function(): Promise<IMealTemplateDocument> {
  this.useCount += 1;
  this.lastUsed = new Date();
  return await this.save();
};

mealTemplateSchema.methods.toFoodLogEntries = async function(targetDate: Date): Promise<any[]> {
  const FoodLog = mongoose.model('FoodLog');
  
  return this.foods.map((food: any) => ({
    userId: this.userId,
    foodId: food.foodId,
    quantity: food.quantity,
    unit: food.unit,
    mealType: this.mealType,
    date: targetDate,
    notes: food.notes,
    source: 'template',
    templateId: this._id
  }));
};

// Static methods
mealTemplateSchema.statics.getUserTemplates = async function(
  userId: string, 
  mealType?: string
): Promise<IMealTemplateDocument[]> {
  const query: any = { userId };
  if (mealType && mealType !== 'all') {
    query.mealType = mealType;
  }
  
  return await this.find(query)
    .populate('foods.foodId', 'description brandName nutritionPer100g')
    .sort({ useCount: -1, lastUsed: -1 });
};

mealTemplateSchema.statics.getPublicTemplates = async function(
  mealType?: string, 
  limit: number = 20
): Promise<IMealTemplateDocument[]> {
  const query: any = { isPublic: true };
  if (mealType && mealType !== 'all') {
    query.mealType = mealType;
  }
  
  return await this.find(query)
    .populate('foods.foodId', 'description brandName nutritionPer100g')
    .populate('userId', 'username')
    .sort({ useCount: -1, createdAt: -1 })
    .limit(limit);
};

mealTemplateSchema.statics.getMostUsedTemplates = async function(
  userId: string, 
  limit: number = 10
): Promise<IMealTemplateDocument[]> {
  return await this.find({ userId })
    .populate('foods.foodId', 'description brandName nutritionPer100g')
    .sort({ useCount: -1, lastUsed: -1 })
    .limit(limit);
};

mealTemplateSchema.statics.searchTemplates = async function(
  query: string, 
  userId?: string
): Promise<IMealTemplateDocument[]> {
  const searchQuery: any = {
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  };

  if (userId) {
    searchQuery.$and = [
      { $or: [{ userId }, { isPublic: true }] }
    ];
  } else {
    searchQuery.isPublic = true;
  }
  
  return await this.find(searchQuery)
    .populate('foods.foodId', 'description brandName nutritionPer100g')
    .sort({ useCount: -1, createdAt: -1 })
    .limit(20);
};

// Pre-save hook to calculate nutrition
mealTemplateSchema.pre('save', async function(next) {
  if (this.isModified('foods')) {
    await this.calculateNutrition();
  }
  next();
});

export const MealTemplate = mongoose.model<IMealTemplateDocument, IMealTemplateModel>(
  'MealTemplate', 
  mealTemplateSchema
);

export default MealTemplate;
