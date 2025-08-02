import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IExercise extends Document {
  _id: ObjectId;
  name: string;
  description: string;
  instructions: string[];
  category: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl?: string;
  videoUrl?: string;
  isCustom: boolean;
  createdBy?: ObjectId; // For custom exercises
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema<IExercise>({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  instructions: [{
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  }],
  category: {
    type: String,
    required: true,
    enum: [
      'strength',
      'cardio',
      'flexibility',
      'balance',
      'plyometric',
      'functional',
      'rehabilitation'
    ],
    index: true
  },
  muscleGroups: [{
    type: String,
    required: true,
    enum: [
      'chest',
      'back',
      'shoulders',
      'biceps',
      'triceps',
      'forearms',
      'abs',
      'core',
      'quadriceps',
      'hamstrings',
      'glutes',
      'calves',
      'full-body'
    ],
    index: true
  }],
  equipment: [{
    type: String,
    enum: [
      'bodyweight',
      'dumbbells',
      'barbell',
      'kettlebell',
      'resistance-bands',
      'pull-up-bar',
      'bench',
      'cable-machine',
      'smith-machine',
      'treadmill',
      'stationary-bike',
      'rowing-machine',
      'medicine-ball',
      'stability-ball',
      'foam-roller',
      'yoga-mat'
    ],
    index: true
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
    default: 'beginner',
    index: true
  },
  imageUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Invalid image URL format'
    }
  },
  videoUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/i.test(v);
      },
      message: 'Invalid video URL format'
    }
  },
  isCustom: {
    type: Boolean,
    default: false,
    index: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: function(this: IExercise) {
      return this.isCustom;
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for common queries
ExerciseSchema.index({ category: 1, difficulty: 1 });
ExerciseSchema.index({ muscleGroups: 1, equipment: 1 });
ExerciseSchema.index({ isCustom: 1, createdBy: 1 });

// Text index for search functionality
ExerciseSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  muscleGroups: 'text'
});

// Validation for instructions array
ExerciseSchema.pre('save', function(next) {
  if (this.instructions.length === 0) {
    next(new Error('Exercise must have at least one instruction'));
  }
  if (this.muscleGroups.length === 0) {
    next(new Error('Exercise must target at least one muscle group'));
  }
  next();
});

// Virtual for instruction count
ExerciseSchema.virtual('instructionCount').get(function() {
  return this.instructions.length;
});

// Virtual for equipment summary
ExerciseSchema.virtual('equipmentSummary').get(function() {
  if (this.equipment.includes('bodyweight')) {
    return 'Bodyweight';
  }
  return this.equipment.length > 2 ? 
    `${this.equipment.slice(0, 2).join(', ')} + ${this.equipment.length - 2} more` :
    this.equipment.join(', ');
});

// Static method to find exercises by muscle group
ExerciseSchema.statics.findByMuscleGroup = function(muscleGroup: string, limit: number = 20) {
  return this.find({ 
    muscleGroups: muscleGroup,
    isCustom: false 
  }).limit(limit);
};

// Static method to find exercises by equipment
ExerciseSchema.statics.findByEquipment = function(equipment: string[], limit: number = 20) {
  return this.find({ 
    equipment: { $in: equipment },
    isCustom: false 
  }).limit(limit);
};

// Static method for search
ExerciseSchema.statics.search = function(query: string, limit: number = 20) {
  return this.find({
    $text: { $search: query },
    isCustom: false
  }, {
    score: { $meta: 'textScore' }
  }).sort({
    score: { $meta: 'textScore' }
  }).limit(limit);
};

export const Exercise = mongoose.model<IExercise>('Exercise', ExerciseSchema);
