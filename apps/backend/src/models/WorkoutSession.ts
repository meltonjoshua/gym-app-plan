import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IWorkoutSession extends Document {
  _id: ObjectId;
  userId: ObjectId;
  workoutPlanId: ObjectId;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  exercises: ISessionExercise[];
  totalDuration?: number; // minutes
  caloriesBurned?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  completionPercentage: number;
}

export interface ISessionExercise {
  exerciseId: ObjectId;
  sets: ISessionSet[];
  notes?: string;
  skipped?: boolean;
}

export interface ISessionSet {
  setNumber: number;
  reps?: number;
  weight?: number; // kg
  duration?: number; // seconds
  restTime?: number; // seconds
  completed: boolean;
  timestamp: Date;
}

const SessionSetSchema = new Schema<ISessionSet>({
  setNumber: {
    type: Number,
    required: true,
    min: 1
  },
  reps: {
    type: Number,
    min: 0
  },
  weight: {
    type: Number,
    min: 0
  },
  duration: {
    type: Number,
    min: 0
  },
  restTime: {
    type: Number,
    min: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const SessionExerciseSchema = new Schema<ISessionExercise>({
  exerciseId: {
    type: Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  sets: [SessionSetSchema],
  notes: {
    type: String,
    maxlength: 500
  },
  skipped: {
    type: Boolean,
    default: false
  }
});

const WorkoutSessionSchema = new Schema<IWorkoutSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  workoutPlanId: {
    type: Schema.Types.ObjectId,
    ref: 'WorkoutPlan',
    required: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  exercises: [SessionExerciseSchema],
  totalDuration: {
    type: Number,
    min: 0
  },
  caloriesBurned: {
    type: Number,
    min: 0
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
WorkoutSessionSchema.index({ userId: 1, startTime: -1 });
WorkoutSessionSchema.index({ userId: 1, isCompleted: 1 });
WorkoutSessionSchema.index({ workoutPlanId: 1 });

// Calculate duration when session is completed
WorkoutSessionSchema.pre('save', function(next) {
  if (this.isCompleted && this.endTime && !this.totalDuration) {
    this.totalDuration = Math.round((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
  }
  next();
});

// Virtual for completion percentage
WorkoutSessionSchema.virtual('completionPercentage').get(function() {
  if (this.exercises.length === 0) return 0;
  
  const completedExercises = this.exercises.filter(ex => 
    !ex.skipped && ex.sets.some(set => set.completed)
  ).length;
  
  return Math.round((completedExercises / this.exercises.length) * 100);
});

// Virtual for total sets completed
WorkoutSessionSchema.virtual('totalSetsCompleted').get(function() {
  return this.exercises.reduce((total, exercise) => {
    return total + exercise.sets.filter(set => set.completed).length;
  }, 0);
});

// Virtual for average weight lifted
WorkoutSessionSchema.virtual('averageWeight').get(function() {
  const allSets = this.exercises.flatMap(ex => ex.sets);
  const setsWithWeight = allSets.filter(set => set.weight && set.completed);
  
  if (setsWithWeight.length === 0) return 0;
  
  const totalWeight = setsWithWeight.reduce((sum, set) => sum + (set.weight || 0), 0);
  return Math.round(totalWeight / setsWithWeight.length);
});

export const WorkoutSession = mongoose.model<IWorkoutSession>('WorkoutSession', WorkoutSessionSchema);
