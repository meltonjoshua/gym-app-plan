import mongoose, { Schema, Document } from 'mongoose';

export interface IFoodFavorite extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  foodId: mongoose.Types.ObjectId;
  customName?: string;
  defaultQuantity?: number;
  defaultUnit?: string;
  category?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'general';
  notes?: string;
  useCount: number;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Instance methods
export interface IFoodFavoriteDocument extends IFoodFavorite {
  incrementUseCount(): Promise<IFoodFavoriteDocument>;
  updateLastUsed(): Promise<IFoodFavoriteDocument>;
}

// Static methods
export interface IFoodFavoriteModel extends mongoose.Model<IFoodFavoriteDocument> {
  getUserFavorites(userId: string, category?: string): Promise<IFoodFavoriteDocument[]>;
  getMostUsedFavorites(userId: string, limit?: number): Promise<IFoodFavoriteDocument[]>;
  getRecentlyUsedFavorites(userId: string, limit?: number): Promise<IFoodFavoriteDocument[]>;
}

const foodFavoriteSchema = new Schema<IFoodFavoriteDocument>({
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
  customName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  defaultQuantity: {
    type: Number,
    min: 0,
    default: 100
  },
  defaultUnit: {
    type: String,
    default: 'g',
    enum: ['g', 'oz', 'cup', 'ml', 'tbsp', 'tsp', 'piece', 'slice', 'serving']
  },
  category: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'general'],
    default: 'general'
  },
  notes: {
    type: String,
    maxlength: 500
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
foodFavoriteSchema.index({ userId: 1, foodId: 1 }, { unique: true });
foodFavoriteSchema.index({ userId: 1, category: 1 });
foodFavoriteSchema.index({ userId: 1, useCount: -1 });
foodFavoriteSchema.index({ userId: 1, lastUsed: -1 });

// Virtual for populated food details
foodFavoriteSchema.virtual('food', {
  ref: 'Food',
  localField: 'foodId',
  foreignField: '_id',
  justOne: true
});

// Instance methods
foodFavoriteSchema.methods.incrementUseCount = async function(): Promise<IFoodFavoriteDocument> {
  this.useCount += 1;
  this.lastUsed = new Date();
  return await this.save();
};

foodFavoriteSchema.methods.updateLastUsed = async function(): Promise<IFoodFavoriteDocument> {
  this.lastUsed = new Date();
  return await this.save();
};

// Static methods
foodFavoriteSchema.statics.getUserFavorites = async function(
  userId: string, 
  category?: string
): Promise<IFoodFavoriteDocument[]> {
  const query: any = { userId };
  if (category && category !== 'all') {
    query.category = category;
  }
  
  return await this.find(query)
    .populate('food', 'description brandName foodCategory nutritionPer100g servingSizes')
    .sort({ useCount: -1, lastUsed: -1 })
    .lean();
};

foodFavoriteSchema.statics.getMostUsedFavorites = async function(
  userId: string, 
  limit: number = 10
): Promise<IFoodFavoriteDocument[]> {
  return await this.find({ userId })
    .populate('food', 'description brandName foodCategory nutritionPer100g')
    .sort({ useCount: -1, lastUsed: -1 })
    .limit(limit)
    .lean();
};

foodFavoriteSchema.statics.getRecentlyUsedFavorites = async function(
  userId: string, 
  limit: number = 10
): Promise<IFoodFavoriteDocument[]> {
  return await this.find({ userId })
    .populate('food', 'description brandName foodCategory nutritionPer100g')
    .sort({ lastUsed: -1 })
    .limit(limit)
    .lean();
};

export const FoodFavorite = mongoose.model<IFoodFavoriteDocument, IFoodFavoriteModel>(
  'FoodFavorite', 
  foodFavoriteSchema
);

export default FoodFavorite;
