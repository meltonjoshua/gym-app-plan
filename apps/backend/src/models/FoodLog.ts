import mongoose, { Schema, Document } from 'mongoose';

export interface IFoodLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  foodId: mongoose.Types.ObjectId;
  quantity: number;
  unit: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: Date;
  notes?: string;
  source?: 'manual' | 'recipe' | 'template' | 'batch_log' | 'duplicate' | 'duplicate_day';
  recipeId?: mongoose.Types.ObjectId;
  recipeServings?: number;
  templateId?: mongoose.Types.ObjectId;
  originalLogId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Instance methods
export interface IFoodLogDocument extends IFoodLog {
  calculateNutrition(): Promise<any>;
  getDailyNutrition(date: Date): Promise<any>;
}

// Static methods
export interface IFoodLogModel extends mongoose.Model<IFoodLogDocument> {
  getUserFoodLogs(userId: string, startDate?: Date, endDate?: Date): Promise<IFoodLogDocument[]>;
  getDailyLogs(userId: string, date: Date): Promise<IFoodLogDocument[]>;
  getMealLogs(userId: string, date: Date, mealType: string): Promise<IFoodLogDocument[]>;
  getDailyNutritionSummary(userId: string, date: Date): Promise<any>;
  getWeeklyNutritionSummary(userId: string, startDate: Date): Promise<any>;
}

const foodLogSchema = new Schema<IFoodLogDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  foodId: {
    type: Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.01
  },
  unit: {
    type: String,
    required: true,
    enum: ['g', 'oz', 'cup', 'ml', 'tbsp', 'tsp', 'piece', 'slice', 'serving']
  },
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  notes: {
    type: String,
    maxlength: 500
  },
  source: {
    type: String,
    enum: ['manual', 'recipe', 'template', 'batch_log', 'duplicate', 'duplicate_day'],
    default: 'manual'
  },
  recipeId: {
    type: Schema.Types.ObjectId,
    ref: 'Recipe'
  },
  recipeServings: {
    type: Number,
    min: 0.1
  },
  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'MealTemplate'
  },
  originalLogId: {
    type: Schema.Types.ObjectId,
    ref: 'FoodLog'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
foodLogSchema.index({ userId: 1, date: 1 });
foodLogSchema.index({ userId: 1, mealType: 1, date: 1 });
foodLogSchema.index({ userId: 1, foodId: 1 });
foodLogSchema.index({ recipeId: 1 });
foodLogSchema.index({ templateId: 1 });

// Virtual for populated food details
foodLogSchema.virtual('food', {
  ref: 'Food',
  localField: 'foodId',
  foreignField: '_id',
  justOne: true
});

// Virtual for populated recipe details
foodLogSchema.virtual('recipe', {
  ref: 'Recipe',
  localField: 'recipeId',
  foreignField: '_id',
  justOne: true
});

// Virtual for populated template details
foodLogSchema.virtual('template', {
  ref: 'MealTemplate',
  localField: 'templateId',
  foreignField: '_id',
  justOne: true
});

// Instance methods
foodLogSchema.methods.calculateNutrition = async function(): Promise<any> {
  await this.populate('food', 'nutritionPer100g');
  
  if (!this.food || !this.food.nutritionPer100g) {
    return {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    };
  }

  const nutrition = this.food.nutritionPer100g;
  const factor = this.quantity / 100; // Nutrition is per 100g

  return {
    calories: Math.round((nutrition.calories || 0) * factor),
    protein: Math.round((nutrition.protein || 0) * factor * 10) / 10,
    carbohydrates: Math.round((nutrition.carbohydrates || 0) * factor * 10) / 10,
    fat: Math.round((nutrition.fat || 0) * factor * 10) / 10,
    fiber: Math.round((nutrition.fiber || 0) * factor * 10) / 10,
    sugar: Math.round((nutrition.sugar || 0) * factor * 10) / 10,
    sodium: Math.round((nutrition.sodium || 0) * factor * 10) / 10
  };
};

// Static methods
foodLogSchema.statics.getUserFoodLogs = async function(
  userId: string, 
  startDate?: Date, 
  endDate?: Date
): Promise<IFoodLogDocument[]> {
  const query: any = { userId };
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }
  
  return await this.find(query)
    .populate('food', 'description brandName nutritionPer100g')
    .sort({ date: -1, createdAt: -1 });
};

foodLogSchema.statics.getDailyLogs = async function(
  userId: string, 
  date: Date
): Promise<IFoodLogDocument[]> {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  return await this.find({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay }
  })
  .populate('food', 'description brandName nutritionPer100g')
  .sort({ mealType: 1, createdAt: 1 });
};

foodLogSchema.statics.getMealLogs = async function(
  userId: string, 
  date: Date, 
  mealType: string
): Promise<IFoodLogDocument[]> {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  return await this.find({
    userId,
    mealType,
    date: { $gte: startOfDay, $lte: endOfDay }
  })
  .populate('food', 'description brandName nutritionPer100g')
  .sort({ createdAt: 1 });
};

foodLogSchema.statics.getDailyNutritionSummary = async function(
  userId: string, 
  date: Date
): Promise<any> {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  const logs = await this.find({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay }
  }).populate('food', 'nutritionPer100g');

  type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
  
  const summary = {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbohydrates: 0,
    totalFat: 0,
    totalFiber: 0,
    totalSugar: 0,
    totalSodium: 0,
    mealBreakdown: {
      breakfast: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
      lunch: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
      dinner: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
      snack: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
    }
  };

  for (const log of logs) {
    if (log.food && log.food.nutritionPer100g) {
      const nutrition = log.food.nutritionPer100g;
      const factor = log.quantity / 100;

      const calories = (nutrition.calories || 0) * factor;
      const protein = (nutrition.protein || 0) * factor;
      const carbohydrates = (nutrition.carbohydrates || 0) * factor;
      const fat = (nutrition.fat || 0) * factor;
      const fiber = (nutrition.fiber || 0) * factor;
      const sugar = (nutrition.sugar || 0) * factor;
      const sodium = (nutrition.sodium || 0) * factor;

      summary.totalCalories += calories;
      summary.totalProtein += protein;
      summary.totalCarbohydrates += carbohydrates;
      summary.totalFat += fat;
      summary.totalFiber += fiber;
      summary.totalSugar += sugar;
      summary.totalSodium += sodium;

      const mealType = log.mealType as MealType;
      summary.mealBreakdown[mealType].calories += calories;
      summary.mealBreakdown[mealType].protein += protein;
      summary.mealBreakdown[mealType].carbohydrates += carbohydrates;
      summary.mealBreakdown[mealType].fat += fat;
    }
  }

  // Round values
  summary.totalCalories = Math.round(summary.totalCalories);
  summary.totalProtein = Math.round(summary.totalProtein * 10) / 10;
  summary.totalCarbohydrates = Math.round(summary.totalCarbohydrates * 10) / 10;
  summary.totalFat = Math.round(summary.totalFat * 10) / 10;
  summary.totalFiber = Math.round(summary.totalFiber * 10) / 10;
  summary.totalSugar = Math.round(summary.totalSugar * 10) / 10;
  summary.totalSodium = Math.round(summary.totalSodium * 10) / 10;

  (Object.keys(summary.mealBreakdown) as MealType[]).forEach(meal => {
    const mealData = summary.mealBreakdown[meal];
    mealData.calories = Math.round(mealData.calories);
    mealData.protein = Math.round(mealData.protein * 10) / 10;
    mealData.carbohydrates = Math.round(mealData.carbohydrates * 10) / 10;
    mealData.fat = Math.round(mealData.fat * 10) / 10;
  });

  return summary;
};

foodLogSchema.statics.getWeeklyNutritionSummary = async function(
  userId: string, 
  startDate: Date
): Promise<any> {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  
  const logs = await this.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).populate('food', 'nutritionPer100g');

  const summary = {
    weeklyAverages: {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0
    },
    dailyData: [] as Array<{ date: string; nutrition: any }>
  };

  // Group by days
  const dailyGroups: Record<string, any[]> = {};
  for (const log of logs) {
    const dateKey = log.date.toISOString().split('T')[0];
    if (!dailyGroups[dateKey]) {
      dailyGroups[dateKey] = [];
    }
    dailyGroups[dateKey].push(log);
  }

  // Calculate daily summaries
  let totalDays = 0;
  let weeklyTotals = { calories: 0, protein: 0, carbohydrates: 0, fat: 0 };

  for (const [date, dayLogs] of Object.entries(dailyGroups)) {
    let dayTotals = { calories: 0, protein: 0, carbohydrates: 0, fat: 0 };
    
    for (const log of dayLogs) {
      if (log.food && log.food.nutritionPer100g) {
        const nutrition = log.food.nutritionPer100g;
        const factor = log.quantity / 100;

        dayTotals.calories += (nutrition.calories || 0) * factor;
        dayTotals.protein += (nutrition.protein || 0) * factor;
        dayTotals.carbohydrates += (nutrition.carbohydrates || 0) * factor;
        dayTotals.fat += (nutrition.fat || 0) * factor;
      }
    }

    summary.dailyData.push({
      date,
      nutrition: {
        calories: Math.round(dayTotals.calories),
        protein: Math.round(dayTotals.protein * 10) / 10,
        carbohydrates: Math.round(dayTotals.carbohydrates * 10) / 10,
        fat: Math.round(dayTotals.fat * 10) / 10
      }
    });

    weeklyTotals.calories += dayTotals.calories;
    weeklyTotals.protein += dayTotals.protein;
    weeklyTotals.carbohydrates += dayTotals.carbohydrates;
    weeklyTotals.fat += dayTotals.fat;
    totalDays++;
  }

  // Calculate averages
  if (totalDays > 0) {
    summary.weeklyAverages.calories = Math.round(weeklyTotals.calories / totalDays);
    summary.weeklyAverages.protein = Math.round((weeklyTotals.protein / totalDays) * 10) / 10;
    summary.weeklyAverages.carbohydrates = Math.round((weeklyTotals.carbohydrates / totalDays) * 10) / 10;
    summary.weeklyAverages.fat = Math.round((weeklyTotals.fat / totalDays) * 10) / 10;
  }

  return summary;
};

export const FoodLog = mongoose.model<IFoodLogDocument, IFoodLogModel>(
  'FoodLog', 
  foodLogSchema
);

export default FoodLog;
