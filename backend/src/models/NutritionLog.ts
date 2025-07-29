import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface INutritionLog extends Document {
  _id: ObjectId;
  userId: ObjectId;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  loggedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NutritionLogSchema = new Schema<INutritionLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  foodName: { type: String, required: true, trim: true },
  calories: { type: Number, required: true, min: 0 },
  protein: { type: Number, required: true, min: 0 },
  carbs: { type: Number, required: true, min: 0 },
  fat: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0.01 },
  unit: { type: String, required: true, trim: true },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
  loggedAt: { type: Date, required: true, default: Date.now },
  notes: { type: String, maxlength: 500 },
}, { timestamps: true });

export const NutritionLog = mongoose.model<INutritionLog>('NutritionLog', NutritionLogSchema);
