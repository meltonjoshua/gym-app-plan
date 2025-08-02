// User-related interfaces
export interface User {
  id: string;
  email: string;
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  age?: number;
  height?: number; // in cm
  weight?: number; // in kg
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  fitnessGoals: string[]; // e.g., ['weight_loss', 'muscle_gain']
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  medicalConditions?: string[];
  injuries?: string[];
  preferredWorkoutDuration: number; // minutes
  availableEquipment: string[];
  workoutFrequency: number; // per week
  experienceLevel: Record<string, number>; // exercise type -> experience level (1-10)
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  preferredWorkoutTypes: string[]; // e.g., ['strength', 'cardio', 'flexibility']
  dislikedExercises: string[];
  favoriteExercises: string[];
  preferredIntensity: 'low' | 'moderate' | 'high';
  restDayPreferences: string[];
  workoutTimePreferences: string[]; // e.g., ['morning', 'evening']
  musicPreferences?: string[];
  coachingStyle: 'encouraging' | 'instructional' | 'minimal';
}

// Workout-related interfaces
export interface Workout {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: string; // e.g., 'strength', 'cardio', 'flexibility'
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // minutes
  actualDuration?: number; // minutes
  exercises: WorkoutExercise[];
  tags: string[];
  isCustom: boolean;
  createdBy: 'user' | 'ai' | 'template';
  status: 'draft' | 'published' | 'archived';
  stats?: WorkoutStats;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  order: number;
  sets: ExerciseSet[];
  restTime: number; // seconds
  instructions?: string[];
  modifications?: string[];
  supersetWith?: string; // ID of another exercise in the workout
}

export interface ExerciseSet {
  setNumber: number;
  reps?: number;
  weight?: number; // in kg
  duration?: number; // seconds for time-based exercises
  distance?: number; // meters for cardio
  restTime?: number; // seconds
  completed: boolean;
  actualReps?: number;
  actualWeight?: number;
  actualDuration?: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  notes?: string;
}

export interface WorkoutStats {
  totalVolume: number; // total weight lifted
  averageIntensity: number;
  totalCaloriesBurned?: number;
  heartRateData?: HeartRateData;
  completionRate: number; // percentage of exercises completed
}

export interface HeartRateData {
  average: number;
  maximum: number;
  minimum: number;
  zones: HeartRateZone[];
}

export interface HeartRateZone {
  zone: string; // e.g., 'fat_burn', 'cardio', 'peak'
  timeInZone: number; // seconds
  percentage: number;
}

// Exercise-related interfaces
export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  primaryMuscleGroups: string[];
  secondaryMuscleGroups: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  tips?: string[];
  commonMistakes?: string[];
  progressions?: ExerciseProgression[];
  regressions?: ExerciseProgression[];
  variations?: ExerciseVariation[];
  videoUrl?: string;
  imageUrls?: string[];
  isCompound: boolean;
  estimatedCaloriesPerMinute: number;
  safetyRating: number; // 1-10
  popularityScore: number; // 1-10
  effectivenessRating: number; // 1-10
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseCategory {
  id: string;
  name: string;
  description: string;
  parentCategoryId?: string;
}

export interface ExerciseProgression {
  id: string;
  name: string;
  description: string;
  difficulty: 'easier' | 'harder';
  instructions: string[];
}

export interface ExerciseVariation {
  id: string;
  name: string;
  description: string;
  equipmentChanges?: string[];
  instructions: string[];
}

// Analytics and Progress interfaces
export interface UserProgress {
  userId: string;
  metric: string; // e.g., 'weight', 'body_fat', 'strength_level'
  value: number;
  unit: string;
  recordedAt: Date;
  context?: string; // e.g., 'morning_weigh_in', 'post_workout'
}

export interface ExerciseProgress {
  userId: string;
  exerciseId: string;
  metric: 'max_weight' | 'max_reps' | 'best_time' | 'volume';
  value: number;
  achievedAt: Date;
  workoutId?: string;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutId: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'in_progress' | 'completed' | 'paused' | 'cancelled';
  exercises: CompletedExercise[];
  notes?: string;
  rating?: number; // 1-5 stars
  feedback?: SessionFeedback;
  environmentData?: EnvironmentData;
}

export interface CompletedExercise {
  exerciseId: string;
  sets: CompletedSet[];
  actualRestTimes: number[]; // seconds between sets
  totalTime: number; // seconds
  notes?: string;
  perceivedDifficulty?: number; // 1-10
}

export interface CompletedSet {
  setNumber: number;
  targetReps?: number;
  actualReps: number;
  targetWeight?: number;
  actualWeight?: number;
  targetDuration?: number;
  actualDuration?: number;
  rpe?: number; // Rate of Perceived Exertion
  completed: boolean;
  skipped?: boolean;
  skipReason?: string;
}

export interface SessionFeedback {
  overallRating: number; // 1-5
  difficultyRating: number; // 1-10
  enjoymentRating: number; // 1-10
  energyLevel: 'low' | 'moderate' | 'high';
  musclesSore: string[]; // muscle groups
  improvements: string[];
  suggestions: string;
  wouldRepeat: boolean;
}

export interface EnvironmentData {
  location: 'home' | 'gym' | 'outdoor' | 'other';
  temperature?: number;
  humidity?: number;
  equipmentAvailable: string[];
  spaceConstraints?: string[];
}

// AI and ML related interfaces
export interface AIRecommendation {
  id: string;
  userId: string;
  type: 'workout' | 'exercise' | 'nutrition' | 'recovery';
  title: string;
  description: string;
  confidence: number; // 0-1
  reasoning: string[];
  data: any; // recommendation-specific data
  status: 'pending' | 'accepted' | 'rejected' | 'ignored';
  createdAt: Date;
  expiresAt?: Date;
}

export interface UserBehaviorData {
  userId: string;
  eventType: string;
  eventData: any;
  timestamp: Date;
  sessionId?: string;
  deviceInfo?: DeviceInfo;
}

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  version: string;
  deviceModel?: string;
  screenSize?: string;
}

// Nutrition related interfaces (for AI nutrition features)
export interface NutritionProfile {
  userId: string;
  dailyCalorieGoal: number;
  macroTargets: MacroTargets;
  dietaryRestrictions: string[];
  allergies: string[];
  foodPreferences: string[];
  mealTimingPreferences: MealTiming[];
  supplementation: Supplement[];
}

export interface MacroTargets {
  protein: number; // grams
  carbohydrates: number; // grams
  fat: number; // grams
  fiber?: number; // grams
}

export interface MealTiming {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';
  preferredTime: string; // HH:mm format
  calorieDistribution: number; // percentage of daily calories
}

export interface Supplement {
  name: string;
  dosage: string;
  timing: string;
  purpose: string;
}

// Health and wellness interfaces
export interface HealthMetrics {
  userId: string;
  metrics: HealthMetric[];
  recordedAt: Date;
}

export interface HealthMetric {
  type: 'heart_rate' | 'blood_pressure' | 'sleep_hours' | 'stress_level' | 'energy_level';
  value: number;
  unit: string;
  context?: string;
}

export interface SleepData {
  userId: string;
  date: Date;
  bedtime: Date;
  wakeTime: Date;
  totalSleep: number; // hours
  sleepQuality: number; // 1-10
  sleepStages?: SleepStage[];
  notes?: string;
}

export interface SleepStage {
  stage: 'light' | 'deep' | 'rem' | 'awake';
  duration: number; // minutes
  startTime: Date;
}

export interface StressData {
  userId: string;
  level: number; // 1-10
  factors: string[];
  recordedAt: Date;
  notes?: string;
}

// Error and validation interfaces
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: ValidationError[];
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// Export commonly used type unions
export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'general_fitness' | 'flexibility' | 'sports_performance';
export type IntensityLevel = 'low' | 'moderate' | 'high';
export type EquipmentType = 'bodyweight' | 'dumbbells' | 'barbell' | 'resistance_bands' | 'kettlebell' | 'medicine_ball' | 'pull_up_bar' | 'bench' | 'treadmill' | 'stationary_bike';
export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'core' | 'legs' | 'glutes' | 'calves' | 'forearms' | 'neck';
export type WorkoutType = 'strength' | 'cardio' | 'flexibility' | 'sports' | 'rehabilitation' | 'yoga' | 'pilates' | 'martial_arts' | 'dance';

// All interfaces are already exported above with their declarations
