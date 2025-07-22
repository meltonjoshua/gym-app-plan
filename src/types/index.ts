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
  // Phase 2 states
  social: SocialState;
  ai: AIState;
  wearable: WearableState;
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

// Social Feature Types (Phase 2)
export interface SocialUser {
  id: string;
  name: string;
  profilePhoto?: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  joinDate: Date;
  totalWorkouts: number;
  currentStreak: number;
  achievements: Achievement[];
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdDate: Date;
  acceptedDate?: Date;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  senderPhoto?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdDate: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  iconColor: string;
  category: 'workout' | 'streak' | 'progress' | 'social' | 'special';
  unlockedDate?: Date;
  isUnlocked: boolean;
  requirement: {
    type: 'workout_count' | 'streak_days' | 'weight_lifted' | 'friends_count' | 'challenge_wins';
    value: number;
  };
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'workout_count' | 'distance' | 'calories' | 'streak' | 'weight_lifted';
  targetValue: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  participants: ChallengeParticipant[];
  createdBy: string;
  isPublic: boolean;
  prize?: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

export interface ChallengeParticipant {
  userId: string;
  userName: string;
  userPhoto?: string;
  currentValue: number;
  joinDate: Date;
  rank?: number;
}

export interface WorkoutShare {
  id: string;
  workoutSessionId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  workoutName: string;
  duration: number;
  completedAt: Date;
  sharedAt: Date;
  caption?: string;
  likes: string[]; // user IDs who liked
  comments: WorkoutComment[];
  isPublic: boolean;
}

export interface WorkoutComment {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  message: string;
  createdAt: Date;
}

export interface Leaderboard {
  id: string;
  type: 'weekly_workouts' | 'monthly_streak' | 'total_workouts' | 'friends_challenges';
  title: string;
  period: 'weekly' | 'monthly' | 'all_time';
  entries: LeaderboardEntry[];
  lastUpdated: Date;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userPhoto?: string;
  value: number;
  rank: number;
  change: number; // +/- from previous period
}

// AI Recommendation Types (Phase 2)
export interface WorkoutRecommendation {
  id: string;
  userId: string;
  recommendationType: 'next_workout' | 'rest_day' | 'progression' | 'variety';
  workoutPlanId?: string;
  workoutId?: string;
  title: string;
  description: string;
  reasoning: string[];
  confidence: number; // 0-1
  createdAt: Date;
  isViewed: boolean;
  isApplied: boolean;
}

export interface ProgressPrediction {
  goalId: string;
  predictedCompletionDate: Date;
  confidence: number;
  currentTrajectory: 'on_track' | 'ahead' | 'behind';
  adjustmentSuggestions: string[];
}

// Wearable Integration Types (Phase 2 - Simulated)
export interface WearableData {
  id: string;
  userId: string;
  deviceType: 'smartwatch' | 'fitness_tracker' | 'heart_rate_monitor';
  deviceName: string;
  syncTime: Date;
  data: {
    heartRate?: number[];
    steps?: number;
    calories?: number;
    activeMinutes?: number;
    sleepHours?: number;
    restingHeartRate?: number;
  };
}

export interface HeartRateZone {
  zone: 'resting' | 'fat_burn' | 'cardio' | 'peak';
  minBpm: number;
  maxBpm: number;
  timeInZone: number; // minutes
  percentage: number;
}

// Extended State Types for Phase 2
export interface SocialState {
  friends: Friend[];
  friendRequests: FriendRequest[];
  challenges: Challenge[];
  workoutShares: WorkoutShare[];
  leaderboards: Leaderboard[];
  achievements: Achievement[];
  isLoading: boolean;
  error?: string;
}

export interface AIState {
  recommendations: WorkoutRecommendation[];
  predictions: ProgressPrediction[];
  isLoading: boolean;
  error?: string;
}

export interface WearableState {
  devices: WearableData[];
  currentHeartRate?: number;
  todaysData?: WearableData;
  isLoading: boolean;
  error?: string;
}