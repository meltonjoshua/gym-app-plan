// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  height?: number; // in cm
  weight?: number; // in kg
  gender?: 'male' | 'female' | 'other';
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: FitnessGoal[];
  fitnessGoals?: FitnessGoal[];
  preferences?: UserPreferences;
  physicalLimitations?: string[];
  preferredWorkoutDays: number;
  preferredWorkoutDuration: number; // in minutes
  profilePhoto?: string;
  joinDate: Date;
  lastLogin: Date;
}

export interface UserPreferences {
  workoutTypes?: string[];
  equipmentAccess?: string[];
  workoutLocation?: 'home' | 'gym' | 'outdoor' | 'any';
  notifications?: {
    workoutReminders: boolean;
    progressUpdates: boolean;
    socialUpdates: boolean;
  };
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
  date: Date;
  intensity?: number; // 1-10 scale
  exercises?: WorkoutExercise[];
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

// Phase 3: Virtual Personal Trainer Types
export interface AITrainer {
  id: string;
  name: string;
  personality: 'motivational' | 'analytical' | 'supportive' | 'challenging';
  specialties: TrainerSpecialty[];
  certifications: string[];
  profilePhoto?: string;
  bio: string;
  experience: number; // years
  rating: number;
  clientCount: number;
}

export type TrainerSpecialty = 
  | 'weight_loss'
  | 'muscle_building'
  | 'endurance'
  | 'strength'
  | 'flexibility'
  | 'rehabilitation'
  | 'senior_fitness'
  | 'youth_fitness';

export interface TrainerChat {
  id: string;
  userId: string;
  trainerId: string;
  messages: TrainerMessage[];
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  lastMessageAt: Date;
}

export interface TrainerMessage {
  id: string;
  senderId: string; // userId or trainerId
  senderType: 'user' | 'ai_trainer' | 'human_trainer';
  message: string;
  messageType: 'text' | 'workout_plan' | 'form_feedback' | 'progress_analysis';
  timestamp: Date;
  metadata?: {
    workoutId?: string;
    exerciseId?: string;
    formScore?: number;
    suggestions?: string[];
  };
}

export interface FormAnalysis {
  exerciseId: string;
  videoUrl?: string;
  analysisTimestamp: Date;
  overallScore: number; // 0-100
  feedback: FormFeedback[];
  suggestions: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface FormFeedback {
  aspect: 'posture' | 'range_of_motion' | 'timing' | 'breathing' | 'balance';
  score: number; // 0-100
  feedback: string;
  correctionSuggestion: string;
}

export interface WorkoutCoaching {
  workoutSessionId: string;
  trainerId: string;
  realTimeGuidance: CoachingGuidance[];
  adaptations: WorkoutAdaptation[];
  motivationalMessages: string[];
  progressNotes: string;
}

export interface CoachingGuidance {
  exerciseId: string;
  setNumber: number;
  guidanceType: 'form_tip' | 'motivation' | 'rest_adjustment' | 'weight_adjustment';
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export interface WorkoutAdaptation {
  exerciseId: string;
  adaptationType: 'weight_increase' | 'weight_decrease' | 'rep_adjustment' | 'rest_adjustment' | 'exercise_substitution';
  originalValue: number;
  adaptedValue: number;
  reason: string;
}

// Phase 3: Trainer Marketplace Types
export interface HumanTrainer {
  id: string;
  name: string;
  profilePhoto?: string;
  bio: string;
  specialties: TrainerSpecialty[];
  certifications: TrainerCertification[];
  experience: number; // years
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  location?: {
    city: string;
    state: string;
    country: string;
    isOnlineOnly: boolean;
  };
  availability: TrainerAvailability[];
  languages: string[];
  isVerified: boolean;
  joinDate: Date;
}

export interface TrainerCertification {
  name: string;
  organization: string;
  certificationDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  isVerified: boolean;
}

export interface TrainerAvailability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  timeSlots: TimeSlot[];
  timezone: string;
}

export interface TimeSlot {
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isBooked?: boolean;
}

export interface TrainerBooking {
  id: string;
  clientId: string;
  trainerId: string;
  sessionDate: Date;
  startTime: string;
  duration: number; // minutes
  sessionType: 'consultation' | 'workout' | 'nutrition' | 'assessment';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  totalCost: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes?: string;
  createdAt: Date;
}

export interface TrainerReview {
  id: string;
  clientId: string;
  trainerId: string;
  bookingId: string;
  rating: number; // 1-5
  review: string;
  reviewDate: Date;
  trainerResponse?: string;
  isVerified: boolean;
}

// Phase 3: Enhanced Community Types
export interface FitnessGroup {
  id: string;
  name: string;
  description: string;
  groupType: 'public' | 'private' | 'invite_only';
  category: 'general' | 'weight_loss' | 'muscle_building' | 'running' | 'yoga' | 'crossfit' | 'bodybuilding';
  members: GroupMember[];
  admins: string[]; // user IDs
  createdBy: string;
  createdAt: Date;
  memberLimit?: number;
  joinRequirements?: string[];
  groupPhoto?: string;
  tags: string[];
  isActive: boolean;
}

export interface GroupMember {
  userId: string;
  joinDate: Date;
  role: 'member' | 'moderator' | 'admin';
  isActive: boolean;
}

export interface GroupEvent {
  id: string;
  groupId: string;
  title: string;
  description: string;
  eventType: 'group_workout' | 'challenge' | 'meetup' | 'workshop' | 'competition';
  startDate: Date;
  endDate: Date;
  location?: {
    type: 'online' | 'physical';
    address?: string;
    virtualLink?: string;
  };
  capacity?: number;
  participants: EventParticipant[];
  requirements?: string[];
  cost?: number;
  createdBy: string;
  createdAt: Date;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

export interface EventParticipant {
  userId: string;
  joinDate: Date;
  status: 'registered' | 'attended' | 'no_show' | 'cancelled';
  notes?: string;
}

export interface LiveWorkoutStream {
  id: string;
  hostId: string;
  title: string;
  description: string;
  workoutId: string;
  startTime: Date;
  estimatedDuration: number;
  viewerCount: number;
  isLive: boolean;
  streamUrl?: string;
  chatMessages: StreamChatMessage[];
  participants: StreamParticipant[];
  tags: string[];
}

export interface StreamChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  messageType: 'chat' | 'system' | 'exercise_tip';
}

export interface StreamParticipant {
  userId: string;
  joinTime: Date;
  isFollowingAlong: boolean;
  currentExercise?: string;
}

// Phase 3: Advanced Nutrition AI Types
export interface NutritionAI {
  id: string;
  name: string;
  personality: 'scientific' | 'holistic' | 'performance_focused' | 'weight_management';
  specialties: NutritionSpecialty[];
  profilePhoto?: string;
  bio: string;
}

export type NutritionSpecialty = 
  | 'weight_loss'
  | 'muscle_building'
  | 'sports_nutrition'
  | 'plant_based'
  | 'keto'
  | 'mediterranean'
  | 'diabetic_friendly'
  | 'heart_healthy'
  | 'allergen_free';

export interface SmartMealPlan {
  id: string;
  userId: string;
  createdBy: string; // AI nutritionist ID
  name: string;
  duration: number; // days
  goals: NutritionGoal[];
  restrictions: DietaryRestriction[];
  meals: PlannedMeal[];
  nutritionSummary: NutritionSummary;
  groceryList: GroceryItem[];
  estimatedCost: number;
  createdAt: Date;
  isActive: boolean;
}

export interface NutritionGoal {
  type: 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber' | 'custom';
  targetValue: number;
  unit: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DietaryRestriction {
  type: 'allergy' | 'intolerance' | 'preference' | 'medical';
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  alternatives?: string[];
}

export interface PlannedMeal {
  id: string;
  dayNumber: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe: Recipe;
  servings: number;
  prepTime: number;
  cookTime: number;
  nutritionInfo: NutritionSummary;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  cuisineType: string;
  dietaryTags: string[];
  imageUrl?: string;
  servings: number;
  nutritionPer100g: NutritionSummary;
}

export interface RecipeIngredient {
  foodId: string;
  quantity: number;
  unit: string;
  isOptional: boolean;
  substitutes?: string[];
}

export interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  vitamins?: { [key: string]: number };
  minerals?: { [key: string]: number };
}

export interface GroceryItem {
  foodId: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  isOptional: boolean;
  alternatives?: string[];
}

export interface FoodAnalysis {
  imageUrl: string;
  analysisDate: Date;
  identifiedFoods: IdentifiedFood[];
  confidence: number;
  nutritionEstimate: NutritionSummary;
  suggestions: string[];
}

export interface IdentifiedFood {
  name: string;
  confidence: number;
  estimatedQuantity: number;
  unit: string;
  nutritionPer100g: NutritionSummary;
}

export interface NutritionChat {
  id: string;
  userId: string;
  nutritionistId: string;
  messages: NutritionMessage[];
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  lastMessageAt: Date;
}

export interface NutritionMessage {
  id: string;
  senderId: string;
  senderType: 'user' | 'ai_nutritionist';
  message: string;
  messageType: 'text' | 'meal_plan' | 'food_analysis' | 'nutrition_advice';
  timestamp: Date;
  metadata?: {
    mealPlanId?: string;
    foodAnalysisId?: string;
    nutritionGoals?: NutritionGoal[];
  };
}

// Extended State Types for Phase 3
export interface VirtualTrainerState {
  aiTrainer?: AITrainer;
  chats: TrainerChat[];
  currentSession?: WorkoutCoaching;
  formAnalyses: FormAnalysis[];
  isLoading: boolean;
  error?: string;
}

export interface TrainerMarketplaceState {
  trainers: HumanTrainer[];
  bookings: TrainerBooking[];
  reviews: TrainerReview[];
  searchFilters: {
    specialties: TrainerSpecialty[];
    maxRate: number;
    location?: string;
    availability?: string;
  };
  isLoading: boolean;
  error?: string;
}

export interface CommunityState extends SocialState {
  groups: FitnessGroup[];
  events: GroupEvent[];
  liveStreams: LiveWorkoutStream[];
  currentStream?: LiveWorkoutStream;
}

export interface AdvancedNutritionState extends NutritionState {
  aiNutritionist?: NutritionAI;
  mealPlans: SmartMealPlan[];
  nutritionChats: NutritionChat[];
  foodAnalyses: FoodAnalysis[];
  recipes: Recipe[];
  groceryLists: GroceryItem[][];
}

// Phase 6: Enterprise & Monetization Types
export interface SubscriptionTier {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  limits: {
    maxWorkoutPlans?: number;
    maxNutritionPlans?: number;
    maxTrainerSessions?: number;
    maxGroupMemberships?: number;
    storageLimit?: number; // in MB
    aiInteractionsPerMonth?: number;
  };
  isPopular: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface UserSubscription {
  id: string;
  userId: string;
  tierId: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial' | 'past_due';
  startDate: Date;
  endDate: Date;
  trialEndDate?: Date;
  autoRenew: boolean;
  paymentMethodId?: string;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  createdAt: Date;
}

export interface UsageMetrics {
  userId: string;
  subscriptionId: string;
  period: Date;
  metrics: {
    workoutsCompleted: number;
    mealsLogged: number;
    trainerSessions: number;
    aiInteractions: number;
    storageUsed: number; // in MB
    groupsJoined: number;
    streamsWatched: number;
    recipesGenerated: number;
  };
  limits: {
    workoutPlansUsed: number;
    nutritionPlansUsed: number;
    trainerSessionsUsed: number;
    groupMembershipsUsed: number;
    aiInteractionsUsed: number;
  };
  overageCharges?: OverageCharge[];
}

export interface OverageCharge {
  type: string;
  unitsOver: number;
  pricePerUnit: number;
  totalCharge: number;
}

export interface CorporateAccount {
  id: string;
  companyName: string;
  domain: string;
  industry: string;
  employeeCount: number;
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    title: string;
  };
  subscriptionTier: string;
  customBranding: {
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    companyName: string;
  };
  wellnessProgram: WellnessProgram;
  settings: CorporateSettings;
  createdAt: Date;
  isActive: boolean;
}

export interface WellnessProgram {
  id: string;
  name: string;
  description: string;
  goals: WellnessGoal[];
  departments: Department[];
  challenges: CorporateChallenge[];
  incentives: Incentive[];
  reporting: ReportingSettings;
  privacy: PrivacySettings;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface ReportingSettings {
  frequency: 'weekly' | 'monthly' | 'quarterly';
  metrics: string[];
  recipients: string[];
  includePersonalData: boolean;
  dashboardAccess: string[];
}

export interface PrivacySettings {
  anonymizeData: boolean;
  aggregationLevel: 'individual' | 'department' | 'company';
  shareWithManagers: boolean;
  shareWithHR: boolean;
  retentionPeriod: number; // days
}

export interface WellnessGoal {
  type: 'participation_rate' | 'health_metrics' | 'engagement' | 'cost_savings';
  target: number;
  unit: string;
  timeframe: 'monthly' | 'quarterly' | 'yearly';
  description: string;
}

export interface Department {
  id: string;
  name: string;
  employeeCount: number;
  manager?: {
    name: string;
    email: string;
  };
  goals: WellnessGoal[];
  metrics: DepartmentMetrics;
  budget?: number;
}

export interface DepartmentMetrics {
  participationRate: number;
  averageWorkoutsPerWeek: number;
  healthScoreImprovement: number;
  stressReductionScore: number;
  engagementScore: number;
  roiMetrics: {
    healthcareCostSavings: number;
    productivityGain: number;
    absenteeismReduction: number;
  };
}

export interface CorporateChallenge extends Challenge {
  departmentId?: string;
  corporateAccountId: string;
  budget: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  complianceFlags: ComplianceFlag[];
}

export interface Incentive {
  id: string;
  name: string;
  description: string;
  type: 'points' | 'gift_card' | 'time_off' | 'merchandise' | 'cash_bonus';
  value: number;
  requirements: IncentiveRequirement[];
  eligibilityPeriod: {
    startDate: Date;
    endDate: Date;
  };
  claimDeadline: Date;
  isActive: boolean;
}

export interface IncentiveRequirement {
  type: 'workout_streak' | 'challenge_completion' | 'health_screening' | 'program_participation';
  value: number;
  timeframe: string;
}

export interface BusinessAnalytics {
  corporateAccountId?: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  revenue: RevenueAnalytics;
  userEngagement: EngagementAnalytics;
  healthOutcomes: HealthOutcomeAnalytics;
  predictiveInsights: PredictiveAnalytics;
  generatedAt: Date;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  subscriptionRevenue: number;
  corporateRevenue: number;
  trainerMarketplaceRevenue: number;
  overageRevenue: number;
  churnRate: number;
  averageRevenuePerUser: number;
  lifetimeValue: number;
  conversionRates: {
    trialToSubscription: number;
    freeToTrial: number;
    subscriptionUpgrade: number;
  };
  revenueByTier: { [tierName: string]: number };
  geographicBreakdown: { [region: string]: number };
}

export interface EngagementAnalytics {
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  sessionDuration: number;
  workoutCompletionRate: number;
  featureUsage: { [featureName: string]: number };
  userRetention: {
    day1: number;
    day7: number;
    day30: number;
    day90: number;
  };
  cohortAnalysis: CohortData[];
  satisfactionScores: {
    nps: number;
    csat: number;
    appStoreRating: number;
  };
}

export interface HealthOutcomeAnalytics {
  averageWeightLoss: number;
  fitnessLevelImprovement: number;
  adherenceRate: number;
  goalCompletionRate: number;
  healthRiskReduction: number;
  biometricImprovements: {
    bloodPressure: number;
    cholesterol: number;
    bodyFat: number;
    vo2Max: number;
  };
  corporateOutcomes?: {
    absenteeismReduction: number;
    productivityIncrease: number;
    healthcareCostSavings: number;
    employeeSatisfaction: number;
  };
}

export interface PredictiveAnalytics {
  churnPrediction: ChurnPrediction[];
  revenueForecasting: RevenueForecasting;
  userBehaviorPredictions: UserBehaviorPrediction[];
  marketTrends: MarketTrend[];
  riskAssessment: RiskAssessment[];
}

export interface ChurnPrediction {
  userId: string;
  churnProbability: number;
  riskFactors: string[];
  recommendedActions: string[];
  timeToChurn: number; // days
}

export interface RevenueForecasting {
  nextMonth: number;
  nextQuarter: number;
  nextYear: number;
  confidence: number;
  factors: string[];
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}

export interface UserBehaviorPrediction {
  userId: string;
  behaviorType: 'upgrade_likelihood' | 'feature_adoption' | 'engagement_drop' | 'trainer_booking';
  probability: number;
  timeframe: number; // days
  confidence: number;
}

export interface MarketTrend {
  category: 'fitness_trends' | 'competitor_analysis' | 'industry_growth' | 'technology_adoption';
  trend: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  timeframe: string;
}

export interface RiskAssessment {
  type: 'financial' | 'operational' | 'compliance' | 'competitive';
  risk: string;
  probability: number;
  impact: number;
  mitigation: string[];
  status: 'identified' | 'monitoring' | 'mitigating' | 'resolved';
}

export interface CohortData {
  cohortMonth: string;
  userCount: number;
  retentionByMonth: { [month: string]: number };
}

export interface FranchiseLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  franchiseeInfo: {
    name: string;
    email: string;
    phone: string;
    startDate: Date;
  };
  branding: FranchiseBranding;
  performance: LocationPerformance;
  subscription: {
    tierId: string;
    memberLimit: number;
    customFeatures: string[];
  };
  isActive: boolean;
  createdAt: Date;
}

export interface FranchiseBranding {
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  locationName: string;
  customDomain?: string;
  socialMediaHandles?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  brandingCompliance: ComplianceStatus;
}

export interface LocationPerformance {
  memberCount: number;
  monthlyRevenue: number;
  memberSatisfaction: number;
  classAttendance: number;
  trainerUtilization: number;
  equipmentUsage: number;
  marketPenetration: number;
  growthRate: number;
  kpis: { [metric: string]: number };
  benchmarks: { [metric: string]: number };
  lastUpdated: Date;
}

export interface ComplianceStatus {
  overall: 'compliant' | 'minor_issues' | 'major_issues' | 'non_compliant';
  brandGuidelines: boolean;
  contentStandards: boolean;
  serviceStandards: boolean;
  lastAudit: Date;
  nextAudit: Date;
  issues: ComplianceFlag[];
}

export interface ComplianceFlag {
  id: string;
  type: 'branding' | 'content' | 'service' | 'legal' | 'safety';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  status: 'open' | 'acknowledged' | 'resolving' | 'resolved';
  assignedTo?: string;
  dueDate?: Date;
  resolutionNotes?: string;
}

export interface EnterpriseSecurityConfig {
  authentication: {
    mfaRequired: boolean;
    biometricAuth: boolean;
    sessionTimeout: number; // minutes
    passwordPolicy: PasswordPolicy;
  };
  dataProtection: {
    encryptionStandard: string;
    keyRotationFrequency: number; // days
    backupEncryption: boolean;
    dataRetentionPeriod: number; // days
  };
  compliance: {
    frameworks: ComplianceFramework[];
    auditFrequency: number; // months
    lastAudit: Date;
    nextAudit: Date;
    complianceScore: number;
  };
  monitoring: {
    threatDetection: boolean;
    anomalyDetection: boolean;
    realTimeAlerts: boolean;
    logRetention: number; // days
  };
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  expirationDays: number;
  historyCount: number;
}

export interface ComplianceFramework {
  name: 'HIPAA' | 'GDPR' | 'SOC2' | 'ISO27001' | 'CCPA';
  status: 'compliant' | 'in_progress' | 'non_compliant';
  lastAssessment: Date;
  nextAssessment: Date;
  requirements: ComplianceRequirement[];
}

export interface ComplianceRequirement {
  id: string;
  description: string;
  status: 'met' | 'partially_met' | 'not_met';
  evidence?: string[];
  responsible: string;
  dueDate?: Date;
}

export interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'data_access' | 'permission_change' | 'threat_detected' | 'compliance_violation';
  severity: 'info' | 'warning' | 'critical';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  description: string;
  metadata: { [key: string]: any };
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
}

// Extended State Types for Phase 6
export interface SubscriptionState {
  currentSubscription?: UserSubscription;
  availableTiers: SubscriptionTier[];
  paymentMethods: PaymentMethod[];
  usageMetrics?: UsageMetrics;
  billingHistory: BillingRecord[];
  isLoading: boolean;
  error?: string;
}

export interface BillingRecord {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  billingDate: Date;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  invoiceUrl?: string;
  description: string;
}

export interface CorporateWellnessState {
  account?: CorporateAccount;
  wellnessProgram?: WellnessProgram;
  departments: Department[];
  challenges: CorporateChallenge[];
  analytics: BusinessAnalytics;
  employees: CorporateEmployee[];
  incentives: Incentive[];
  complianceStatus: ComplianceStatus;
  isLoading: boolean;
  error?: string;
}

export interface CorporateEmployee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  departmentId: string;
  role: string;
  joinDate: Date;
  wellnessMetrics: EmployeeWellnessMetrics;
  participationHistory: ParticipationRecord[];
  incentivesEarned: IncentiveRecord[];
  isActive: boolean;
}

export interface EmployeeWellnessMetrics {
  healthScore: number;
  fitnessLevel: number;
  participationRate: number;
  workoutsPerWeek: number;
  stressLevel: number;
  sleepQuality: number;
  nutritionScore: number;
  goalCompletionRate: number;
  lastUpdated: Date;
}

export interface ParticipationRecord {
  activityType: 'workout' | 'challenge' | 'health_screening' | 'workshop';
  activityId: string;
  date: Date;
  duration: number;
  outcome: string;
  points: number;
}

export interface IncentiveRecord {
  incentiveId: string;
  earnedDate: Date;
  claimedDate?: Date;
  value: number;
  status: 'earned' | 'claimed' | 'expired';
}

export interface CorporateSettings {
  privacy: {
    shareAggregatedData: boolean;
    shareIndividualData: boolean;
    dataRetentionPeriod: number;
  };
  features: {
    enableSocialFeatures: boolean;
    enableTrainerBookings: boolean;
    enableNutritionTracking: boolean;
    enableWearableSync: boolean;
    enableAICoaching: boolean;
  };
  notifications: {
    weeklyReports: boolean;
    monthlyReports: boolean;
    complianceAlerts: boolean;
    performanceAlerts: boolean;
  };
  integrations: {
    hrSystem?: string;
    healthPlatform?: string;
    benefitsProvider?: string;
  };
}