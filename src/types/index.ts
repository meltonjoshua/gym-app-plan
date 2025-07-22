// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  height?: number; // in cm
  weight?: number; // in kg
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: FitnessGoal[];
  preferredWorkoutDays: number;
  preferredWorkoutDuration: number; // in minutes
  profilePhoto?: string;
  joinDate: Date;
  lastLogin: Date;
}

export interface FitnessGoal {
  id: string;
  type: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'maintenance' | 'custom';
  title: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  targetDate: Date;
  isCompleted: boolean;
  createdDate: Date;
}

// Exercise Types
export interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  equipment: Equipment[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  videoUrl?: string;
  imageUrl?: string;
  duration?: number; // for time-based exercises
  restTime: number; // in seconds
}

export type ExerciseCategory = 
  | 'strength'
  | 'cardio'
  | 'flexibility'
  | 'balance'
  | 'plyometric'
  | 'core'
  | 'warmup'
  | 'cooldown';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'glutes'
  | 'quadriceps'
  | 'hamstrings'
  | 'calves'
  | 'fullBody';

export type Equipment =
  | 'bodyweight'
  | 'dumbbells'
  | 'barbell'
  | 'kettlebell'
  | 'resistance_bands'
  | 'pull_up_bar'
  | 'bench'
  | 'cable_machine'
  | 'treadmill'
  | 'bike';

// Workout Types
export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // in weeks
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  goal: FitnessGoal['type'];
  workoutsPerWeek: number;
  estimatedTimePerWorkout: number;
  workouts: Workout[];
  isCustom: boolean;
  createdBy?: string; // user id for custom plans
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  exercises: WorkoutExercise[];
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: ExerciseCategory;
  notes?: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps?: number; // for rep-based exercises
  duration?: number; // for time-based exercises (in seconds)
  weight?: number; // in kg
  restTime: number; // in seconds
  notes?: string;
}

// Session Types
export interface WorkoutSession {
  id: string;
  workoutId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  completedExercises: CompletedExercise[];
  notes?: string;
  rating?: number; // 1-5 stars
}

export interface CompletedExercise {
  exerciseId: string;
  completedSets: CompletedSet[];
  notes?: string;
}

export interface CompletedSet {
  setNumber: number;
  reps?: number;
  duration?: number; // in seconds
  weight?: number; // in kg
  isCompleted: boolean;
  restTime?: number; // actual rest time taken
}

// Progress Types
export interface ProgressEntry {
  id: string;
  userId: string;
  date: Date;
  type: 'weight' | 'measurement' | 'photo' | 'performance';
  value?: number;
  unit?: string;
  notes?: string;
  photoUrl?: string;
  measurements?: BodyMeasurements;
  performanceData?: PerformanceData;
}

export interface BodyMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  thighs?: number;
  bodyFat?: number;
}

export interface PerformanceData {
  exerciseId: string;
  maxWeight?: number;
  maxReps?: number;
  bestTime?: number;
  volume?: number; // total weight lifted
}

// Nutrition Types
export interface Food {
  id: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  barcode?: string;
}

export interface MealEntry {
  id: string;
  userId: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface FoodEntry {
  foodId: string;
  quantity: number;
  unit: string;
}

// Notification Types
export interface NotificationSettings {
  workoutReminders: boolean;
  workoutReminderTime: string; // HH:MM format
  progressReminders: boolean;
  hydrationReminders: boolean;
  socialNotifications: boolean;
  achievementNotifications: boolean;
}

// App State Types
export interface RootState {
  auth: AuthState;
  user: UserState;
  workouts: WorkoutState;
  progress: ProgressState;
  nutrition: NutritionState;
  notifications: NotificationState;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
  token?: string;
}

export interface UserState {
  currentUser?: User;
  isLoading: boolean;
  error?: string;
}

export interface WorkoutState {
  workoutPlans: WorkoutPlan[];
  currentSession?: WorkoutSession;
  exercises: Exercise[];
  isLoading: boolean;
  error?: string;
}

export interface ProgressState {
  entries: ProgressEntry[];
  isLoading: boolean;
  error?: string;
}

export interface NutritionState {
  meals: MealEntry[];
  foods: Food[];
  dailyGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  isLoading: boolean;
  error?: string;
}

export interface NotificationState {
  settings: NotificationSettings;
  isLoading: boolean;
  error?: string;
}