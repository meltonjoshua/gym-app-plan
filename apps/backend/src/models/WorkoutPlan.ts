import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IWorkoutPlan extends Document {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  exercises: IWorkoutExercise[];
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkoutExercise {
  exerciseId: ObjectId;
  sets: number;
  reps?: number;
  duration?: number; // seconds
  weight?: number; // kg
  restTime: number; // seconds
  notes?: string;
}

const WorkoutExerciseSchema = new Schema<IWorkoutExercise>({
  exerciseId: {
    type: Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  sets: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  reps: {
    type: Number,
    min: 1,
    max: 1000
  },
  duration: {
    type: Number,
    min: 1,
    max: 3600 // 1 hour max
  },
  weight: {
    type: Number,
    min: 0,
    max: 1000
  },
  restTime: {
    type: Number,
    required: true,
    min: 0,
    max: 600, // 10 minutes max
    default: 60
  },
  notes: {
    type: String,
    maxlength: 500
  }
});

const WorkoutPlanSchema = new Schema<IWorkoutPlan>({
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
    minlength: 2,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
    default: 'beginner'
  },
  duration: {
    type: Number,
    required: true,
    min: 5,
    max: 300 // 5 hours max
  },
  exercises: [WorkoutExerciseSchema],
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 50
  }],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
WorkoutPlanSchema.index({ userId: 1, createdAt: -1 });
WorkoutPlanSchema.index({ isPublic: 1, difficulty: 1 });
WorkoutPlanSchema.index({ tags: 1 });

// Validation
WorkoutPlanSchema.pre('save', function(next) {
  if (this.exercises.length === 0) {
    next(new Error('Workout plan must have at least one exercise'));
  }
  next();
});

// Virtual for exercise count
WorkoutPlanSchema.virtual('exerciseCount').get(function() {
  return this.exercises.length;
});

// Virtual for estimated calories (rough calculation)
WorkoutPlanSchema.virtual('estimatedCalories').get(function() {
  // Rough calculation: 5 calories per minute
  return Math.round(this.duration * 5);
});

export const WorkoutPlan = mongoose.model<IWorkoutPlan>('WorkoutPlan', WorkoutPlanSchema);
