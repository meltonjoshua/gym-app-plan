import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== AI RECOMMENDATION ENGINE =====
// Advanced ML-powered personalized recommendations for workouts, nutrition, and wellness

export interface UserProfile {
  userId: string;
  demographics: Demographics;
  fitnessGoals: FitnessGoal[];
  currentFitnessLevel: FitnessLevel;
  preferences: UserPreferences;
  healthMetrics: HealthMetrics;
  workoutHistory: WorkoutSession[];
  nutritionHistory: NutritionEntry[];
  progressData: ProgressData;
  behaviorPatterns: BehaviorPattern[];
}

export interface Demographics {
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  height: number; // cm
  weight: number; // kg
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  medicalConditions: string[];
  injuries: InjuryHistory[];
}

export interface FitnessGoal {
  id: string;
  type: 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'flexibility' | 'general_fitness' | 'sport_specific';
  targetValue?: number;
  targetDate?: Date;
  priority: 'high' | 'medium' | 'low';
  progress: number; // 0-100%
}

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface UserPreferences {
  workoutTypes: WorkoutType[];
  workoutDuration: [number, number]; // min, max minutes
  workoutDays: DayOfWeek[];
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'flexible';
  equipment: EquipmentType[];
  location: 'home' | 'gym' | 'outdoor' | 'mixed';
  musicGenres: string[];
  coachingStyle: 'gentle' | 'motivational' | 'challenging' | 'technical';
}

export type WorkoutType = 
  | 'strength' | 'cardio' | 'hiit' | 'yoga' | 'pilates' | 'crossfit'
  | 'boxing' | 'dance' | 'swimming' | 'running' | 'cycling' | 'sports';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type EquipmentType = 
  | 'bodyweight' | 'dumbbells' | 'barbell' | 'resistance_bands' | 'kettlebells'
  | 'pull_up_bar' | 'bench' | 'machine' | 'cardio_equipment' | 'yoga_mat';

export interface HealthMetrics {
  restingHeartRate: number;
  maxHeartRate: number;
  bloodPressure: { systolic: number; diastolic: number };
  bodyFatPercentage?: number;
  muscleMass?: number;
  vo2Max?: number;
  flexibility: FlexibilityScores;
  sleepQuality: number; // 1-10
  stressLevel: number; // 1-10
  energyLevel: number; // 1-10
}

export interface FlexibilityScores {
  shoulders: number; // 1-10
  hips: number;
  hamstrings: number;
  spine: number;
  ankles: number;
}

export interface WorkoutSession {
  id: string;
  date: Date;
  type: WorkoutType;
  duration: number; // minutes
  exercises: ExercisePerformance[];
  intensity: number; // 1-10
  enjoyment: number; // 1-10
  difficulty: number; // 1-10
  completionRate: number; // 0-100%
  caloriesBurned: number;
  heartRateData?: HeartRateData;
}

export interface ExercisePerformance {
  exerciseId: string;
  exerciseName: string;
  sets: Set[];
  formScore?: number; // from computer vision
  difficulty: number; // 1-10
  enjoyment: number; // 1-10
  technique: 'excellent' | 'good' | 'needs_improvement' | 'poor';
}

export interface Set {
  reps?: number;
  weight?: number; // kg
  duration?: number; // seconds for time-based exercises
  distance?: number; // meters for cardio
  restTime: number; // seconds
}

export interface HeartRateData {
  average: number;
  maximum: number;
  zones: HeartRateZone[];
}

export interface HeartRateZone {
  zone: 'recovery' | 'aerobic' | 'anaerobic' | 'vo2_max' | 'peak';
  timeInZone: number; // minutes
  percentage: number; // 0-100%
}

export interface NutritionEntry {
  date: Date;
  meals: Meal[];
  totalCalories: number;
  macros: Macronutrients;
  hydration: number; // liters
  supplements: string[];
  energyLevel: number; // 1-10 after meals
}

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItem[];
  calories: number;
  macros: Macronutrients;
  time: Date;
}

export interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  macros: Macronutrients;
  micronutrients?: Micronutrients;
}

export interface Macronutrients {
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber: number; // grams
}

export interface Micronutrients {
  vitamins: Record<string, number>;
  minerals: Record<string, number>;
}

export interface ProgressData {
  weightHistory: WeightEntry[];
  measurementHistory: MeasurementEntry[];
  strengthProgress: StrengthProgress[];
  enduranceProgress: EnduranceProgress[];
  flexibilityProgress: FlexibilityProgress[];
  photos: ProgressPhoto[];
}

export interface WeightEntry {
  date: Date;
  weight: number; // kg
  bodyFatPercentage?: number;
  muscleMass?: number;
}

export interface MeasurementEntry {
  date: Date;
  measurements: Record<string, number>; // body part -> cm
}

export interface StrengthProgress {
  exerciseId: string;
  exerciseName: string;
  oneRepMax: number;
  history: StrengthEntry[];
}

export interface StrengthEntry {
  date: Date;
  weight: number;
  reps: number;
  estimatedMax: number;
}

export interface EnduranceProgress {
  activity: string;
  distance?: number;
  duration?: number;
  pace?: number;
  heartRate?: number;
  date: Date;
}

export interface FlexibilityProgress {
  bodyPart: string;
  score: number; // 1-10
  date: Date;
  test: string; // e.g., "sit and reach"
}

export interface ProgressPhoto {
  id: string;
  date: Date;
  type: 'front' | 'side' | 'back' | 'specific_muscle';
  url: string;
  tags: string[];
}

export interface BehaviorPattern {
  pattern: string;
  frequency: number;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-1
  examples: string[];
}

export interface InjuryHistory {
  bodyPart: string;
  type: string;
  date: Date;
  severity: 'minor' | 'moderate' | 'severe';
  isRecovered: boolean;
  restrictions: string[];
}

// Recommendation Types
export interface WorkoutRecommendation {
  id: string;
  type: 'workout_plan' | 'single_workout' | 'exercise_modification' | 'rest_day';
  title: string;
  description: string;
  workoutPlan?: WorkoutPlan;
  singleWorkout?: Workout;
  reasoning: string[];
  benefits: string[];
  difficulty: FitnessLevel;
  estimatedDuration: number; // minutes
  equipment: EquipmentType[];
  confidence: number; // 0-1
  personalizedFactors: string[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  duration: number; // weeks
  workoutsPerWeek: number;
  phases: WorkoutPhase[];
  progressionStrategy: string;
}

export interface WorkoutPhase {
  id: string;
  name: string;
  duration: number; // weeks
  workouts: Workout[];
  focus: string;
  progressionCriteria: string[];
}

export interface Workout {
  id: string;
  name: string;
  type: WorkoutType;
  duration: number; // minutes
  exercises: Exercise[];
  warmup: Exercise[];
  cooldown: Exercise[];
  intensity: number; // 1-10
  targetHeartRate?: [number, number]; // min, max BPM
}

export interface Exercise {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'plyometric';
  muscleGroups: string[];
  equipment: EquipmentType[];
  instructions: string[];
  sets: number;
  reps?: number | [number, number]; // or range
  weight?: number | 'bodyweight' | 'progressive';
  duration?: number; // seconds
  restTime: number; // seconds
  modifications: ExerciseModification[];
  safetyTips: string[];
  videoUrl?: string;
  imageUrl?: string;
}

export interface ExerciseModification {
  level: 'easier' | 'harder' | 'alternative';
  description: string;
  reason: string;
}

export interface NutritionRecommendation {
  id: string;
  type: 'meal_plan' | 'single_meal' | 'supplement' | 'hydration' | 'timing';
  title: string;
  description: string;
  mealPlan?: MealPlan;
  meal?: Meal;
  supplement?: SupplementRecommendation;
  reasoning: string[];
  benefits: string[];
  targetCalories?: number;
  targetMacros?: Macronutrients;
  confidence: number;
  personalizedFactors: string[];
}

export interface MealPlan {
  id: string;
  name: string;
  duration: number; // days
  dailyCalories: number;
  dailyMacros: Macronutrients;
  meals: Meal[];
  shoppingList: ShoppingItem[];
  prepTime: number; // minutes per day
}

export interface ShoppingItem {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  optional: boolean;
}

export interface SupplementRecommendation {
  name: string;
  dosage: string;
  timing: string;
  purpose: string;
  evidence: 'strong' | 'moderate' | 'limited';
  sideEffects: string[];
}

export interface WellnessRecommendation {
  id: string;
  type: 'sleep' | 'stress' | 'recovery' | 'mental_health' | 'lifestyle';
  title: string;
  description: string;
  actionItems: string[];
  reasoning: string[];
  benefits: string[];
  timeframe: string;
  confidence: number;
  personalizedFactors: string[];
}

class AIRecommendationEngine {
  private userProfiles: Map<string, UserProfile> = new Map();
  private recommendationCache: Map<string, any[]> = new Map();
  private mlModels: Map<string, any> = new Map();

  // ===== INITIALIZATION =====

  async initialize(): Promise<void> {
    try {
      console.log('Initializing AI Recommendation Engine...');
      
      // Load ML models for different recommendation types
      await this.loadRecommendationModels();
      
      // Load user profiles
      await this.loadUserProfiles();
      
      console.log('AI Recommendation Engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI Recommendation Engine:', error);
      throw error;
    }
  }

  private async loadRecommendationModels(): Promise<void> {
    // Mock model loading - in reality would load trained ML models
    const modelTypes = [
      'workout_recommendation',
      'nutrition_recommendation',
      'progression_prediction',
      'injury_prevention',
      'recovery_optimization'
    ];

    for (const modelType of modelTypes) {
      console.log(`Loading ${modelType} model...`);
      // Mock model - would load actual TensorFlow.js or other ML models
      this.mlModels.set(modelType, { type: modelType, accuracy: 0.85 });
    }
  }

  private async loadUserProfiles(): Promise<void> {
    try {
      const profilesJson = await AsyncStorage.getItem('user_profiles');
      if (profilesJson) {
        const profiles = JSON.parse(profilesJson);
        for (const [userId, profile] of Object.entries(profiles)) {
          this.userProfiles.set(userId, profile as UserProfile);
        }
      }
    } catch (error) {
      console.error('Error loading user profiles:', error);
    }
  }

  // ===== MAIN RECOMMENDATION METHODS =====

  async generateWorkoutRecommendations(userId: string): Promise<WorkoutRecommendation[]> {
    try {
      const userProfile = this.userProfiles.get(userId);
      if (!userProfile) {
        throw new Error(`User profile not found for ${userId}`);
      }

      const recommendations: WorkoutRecommendation[] = [];

      // Analyze user's current state
      const currentState = this.analyzeUserCurrentState(userProfile);
      
      // Generate different types of workout recommendations
      recommendations.push(...await this.generatePersonalizedWorkouts(userProfile, currentState));
      recommendations.push(...await this.generateProgressionWorkouts(userProfile, currentState));
      recommendations.push(...await this.generateRecoveryWorkouts(userProfile, currentState));
      recommendations.push(...await this.generateVarietyWorkouts(userProfile, currentState));

      // Sort by confidence and relevance
      recommendations.sort((a, b) => b.confidence - a.confidence);

      // Cache recommendations
      this.recommendationCache.set(`workout_${userId}`, recommendations);

      return recommendations.slice(0, 10); // Return top 10
    } catch (error) {
      console.error('Error generating workout recommendations:', error);
      throw error;
    }
  }

  async generateNutritionRecommendations(userId: string): Promise<NutritionRecommendation[]> {
    try {
      const userProfile = this.userProfiles.get(userId);
      if (!userProfile) {
        throw new Error(`User profile not found for ${userId}`);
      }

      const recommendations: NutritionRecommendation[] = [];

      // Analyze nutrition needs
      const nutritionNeeds = this.analyzeNutritionNeeds(userProfile);
      
      // Generate meal plan recommendations
      recommendations.push(...await this.generateMealPlanRecommendations(userProfile, nutritionNeeds));
      
      // Generate supplement recommendations
      recommendations.push(...await this.generateSupplementRecommendations(userProfile, nutritionNeeds));
      
      // Generate hydration recommendations
      recommendations.push(...await this.generateHydrationRecommendations(userProfile, nutritionNeeds));

      // Sort by confidence
      recommendations.sort((a, b) => b.confidence - a.confidence);

      return recommendations.slice(0, 8);
    } catch (error) {
      console.error('Error generating nutrition recommendations:', error);
      throw error;
    }
  }

  async generateWellnessRecommendations(userId: string): Promise<WellnessRecommendation[]> {
    try {
      const userProfile = this.userProfiles.get(userId);
      if (!userProfile) {
        throw new Error(`User profile not found for ${userId}`);
      }

      const recommendations: WellnessRecommendation[] = [];

      // Analyze wellness factors
      const wellnessAnalysis = this.analyzeWellnessFactors(userProfile);
      
      // Generate different wellness recommendations
      recommendations.push(...await this.generateSleepRecommendations(userProfile, wellnessAnalysis));
      recommendations.push(...await this.generateStressManagementRecommendations(userProfile, wellnessAnalysis));

      return recommendations.slice(0, 6);
    } catch (error) {
      console.error('Error generating wellness recommendations:', error);
      throw error;
    }
  }

  // ===== ANALYSIS METHODS =====

  private analyzeUserCurrentState(userProfile: UserProfile): any {
    const recentWorkouts = userProfile.workoutHistory.slice(-10);
    const recentNutrition = userProfile.nutritionHistory.slice(-7);
    
    return {
      fatigue: this.calculateFatigueLevel(recentWorkouts),
      motivation: this.calculateMotivationLevel(userProfile),
      progress: this.calculateProgressRate(userProfile),
      consistency: this.calculateConsistency(recentWorkouts),
      recovery: this.calculateRecoveryStatus(userProfile),
      nutrition: this.analyzeNutritionTrends(recentNutrition),
      timeAvailable: this.estimateAvailableTime(userProfile),
      equipment: userProfile.preferences.equipment,
      location: userProfile.preferences.location
    };
  }

  private calculateFatigueLevel(recentWorkouts: WorkoutSession[]): number {
    if (recentWorkouts.length === 0) return 0;
    
    const avgIntensity = recentWorkouts.reduce((sum, w) => sum + w.intensity, 0) / recentWorkouts.length;
    const recentIntensity = recentWorkouts.slice(-3).reduce((sum, w) => sum + w.intensity, 0) / Math.min(3, recentWorkouts.length);
    
    // High recent intensity relative to average indicates fatigue
    return Math.min(10, Math.max(0, (recentIntensity - avgIntensity) * 2 + 5));
  }

  private calculateMotivationLevel(userProfile: UserProfile): number {
    const recentWorkouts = userProfile.workoutHistory.slice(-5);
    if (recentWorkouts.length === 0) return 5;
    
    const avgEnjoyment = recentWorkouts.reduce((sum, w) => sum + w.enjoyment, 0) / recentWorkouts.length;
    const completionRate = recentWorkouts.reduce((sum, w) => sum + w.completionRate, 0) / recentWorkouts.length / 100;
    
    return (avgEnjoyment + completionRate * 10) / 2;
  }

  private calculateProgressRate(userProfile: UserProfile): number {
    // Analyze strength progress
    const strengthProgress = userProfile.progressData.strengthProgress;
    if (strengthProgress.length === 0) return 5;
    
    let progressRate = 0;
    for (const exercise of strengthProgress) {
      const recentEntries = exercise.history.slice(-5);
      if (recentEntries.length >= 2) {
        const firstEntry = recentEntries[0];
        const lastEntry = recentEntries[recentEntries.length - 1];
        const improvement = (lastEntry.estimatedMax - firstEntry.estimatedMax) / firstEntry.estimatedMax;
        progressRate += improvement;
      }
    }
    
    return Math.min(10, Math.max(0, progressRate * 100 + 5));
  }

  private calculateConsistency(recentWorkouts: WorkoutSession[]): number {
    if (recentWorkouts.length === 0) return 0;
    
    const targetWorkoutsPerWeek = 4; // Assume 4 workouts per week target
    const weeks = Math.max(1, recentWorkouts.length / 7);
    const actualWorkoutsPerWeek = recentWorkouts.length / weeks;
    
    return Math.min(10, (actualWorkoutsPerWeek / targetWorkoutsPerWeek) * 10);
  }

  private calculateRecoveryStatus(userProfile: UserProfile): number {
    const metrics = userProfile.healthMetrics;
    const sleepScore = metrics.sleepQuality || 5;
    const stressScore = 10 - (metrics.stressLevel || 5); // Invert stress
    const energyScore = metrics.energyLevel || 5;
    
    return (sleepScore + stressScore + energyScore) / 3;
  }

  private analyzeNutritionTrends(recentNutrition: NutritionEntry[]): any {
    if (recentNutrition.length === 0) {
      return { consistency: 0, balance: 5, hydration: 5 };
    }
    
    const avgCalories = recentNutrition.reduce((sum, n) => sum + n.totalCalories, 0) / recentNutrition.length;
    const avgHydration = recentNutrition.reduce((sum, n) => sum + n.hydration, 0) / recentNutrition.length;
    
    return {
      consistency: recentNutrition.length >= 7 ? 8 : recentNutrition.length,
      balance: this.assessMacroBalance(recentNutrition),
      hydration: Math.min(10, avgHydration * 5), // Assume 2L target
      avgCalories
    };
  }

  private assessMacroBalance(nutritionEntries: NutritionEntry[]): number {
    if (nutritionEntries.length === 0) return 5;
    
    const avgMacros = nutritionEntries.reduce((acc, entry) => {
      acc.protein += entry.macros.protein;
      acc.carbs += entry.macros.carbs;
      acc.fat += entry.macros.fat;
      return acc;
    }, { protein: 0, carbs: 0, fat: 0 });
    
    const count = nutritionEntries.length;
    avgMacros.protein /= count;
    avgMacros.carbs /= count;
    avgMacros.fat /= count;
    
    // Ideal ratios: 25-30% protein, 40-45% carbs, 25-30% fat
    const totalMacros = avgMacros.protein + avgMacros.carbs + avgMacros.fat;
    const proteinRatio = avgMacros.protein / totalMacros;
    const carbRatio = avgMacros.carbs / totalMacros;
    const fatRatio = avgMacros.fat / totalMacros;
    
    const proteinScore = this.scoreRatio(proteinRatio, 0.25, 0.30);
    const carbScore = this.scoreRatio(carbRatio, 0.40, 0.45);
    const fatScore = this.scoreRatio(fatRatio, 0.25, 0.30);
    
    return (proteinScore + carbScore + fatScore) / 3;
  }

  private scoreRatio(actual: number, min: number, max: number): number {
    if (actual >= min && actual <= max) return 10;
    const distance = Math.min(Math.abs(actual - min), Math.abs(actual - max));
    return Math.max(0, 10 - distance * 20);
  }

  private estimateAvailableTime(userProfile: UserProfile): number {
    const [minDuration, maxDuration] = userProfile.preferences.workoutDuration;
    const avgPreferredDuration = (minDuration + maxDuration) / 2;
    
    // Factor in recent workout durations
    const recentWorkouts = userProfile.workoutHistory.slice(-5);
    if (recentWorkouts.length > 0) {
      const avgActualDuration = recentWorkouts.reduce((sum, w) => sum + w.duration, 0) / recentWorkouts.length;
      return (avgPreferredDuration + avgActualDuration) / 2;
    }
    
    return avgPreferredDuration;
  }

  private analyzeNutritionNeeds(userProfile: UserProfile): any {
    const { demographics, fitnessGoals, healthMetrics } = userProfile;
    
    // Calculate BMR using Mifflin-St Jeor equation
    const bmr = demographics.gender === 'male' 
      ? 10 * demographics.weight + 6.25 * demographics.height - 5 * demographics.age + 5
      : 10 * demographics.weight + 6.25 * demographics.height - 5 * demographics.age - 161;
    
    // Activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };
    
    const tdee = bmr * activityMultipliers[demographics.activityLevel];
    
    // Adjust for goals
    let targetCalories = tdee;
    const primaryGoal = fitnessGoals.find(g => g.priority === 'high');
    if (primaryGoal) {
      switch (primaryGoal.type) {
        case 'weight_loss':
          targetCalories = tdee * 0.85; // 15% deficit
          break;
        case 'muscle_gain':
          targetCalories = tdee * 1.15; // 15% surplus
          break;
      }
    }
    
    return {
      targetCalories,
      targetProtein: demographics.weight * 2.2, // 2.2g per kg
      targetCarbs: targetCalories * 0.45 / 4, // 45% of calories
      targetFat: targetCalories * 0.25 / 9, // 25% of calories
      hydrationTarget: demographics.weight * 0.035, // 35ml per kg
      bmr,
      tdee,
      primaryGoal: primaryGoal?.type
    };
  }

  private analyzeWellnessFactors(userProfile: UserProfile): any {
    const { healthMetrics, workoutHistory } = userProfile;
    
    const recentWorkouts = workoutHistory.slice(-7);
    const workoutLoad = recentWorkouts.reduce((sum, w) => sum + w.intensity * w.duration, 0);
    
    return {
      sleepQuality: healthMetrics.sleepQuality,
      stressLevel: healthMetrics.stressLevel,
      energyLevel: healthMetrics.energyLevel,
      workoutLoad,
      recoveryNeeded: workoutLoad > 2000, // High workout load threshold
      burnoutRisk: healthMetrics.stressLevel > 7 && healthMetrics.sleepQuality < 5
    };
  }

  // ===== WORKOUT RECOMMENDATION GENERATION =====

  private async generatePersonalizedWorkouts(userProfile: UserProfile, currentState: any): Promise<WorkoutRecommendation[]> {
    const recommendations: WorkoutRecommendation[] = [];
    
    // Primary goal-based workout
    const primaryGoal = userProfile.fitnessGoals.find(g => g.priority === 'high');
    if (primaryGoal) {
      recommendations.push(await this.createGoalBasedWorkout(userProfile, primaryGoal, currentState));
    }
    
    // Weakness-focused workout
    const weakness = this.identifyWeaknesses(userProfile);
    if (weakness) {
      recommendations.push(await this.createWeaknessWorkout(userProfile, weakness, currentState));
    }
    
    return recommendations;
  }

  private async generateProgressionWorkouts(userProfile: UserProfile, currentState: any): Promise<WorkoutRecommendation[]> {
    const recommendations: WorkoutRecommendation[] = [];
    
    // Progressive overload recommendations
    const strengthProgress = userProfile.progressData.strengthProgress;
    for (const exercise of strengthProgress.slice(0, 3)) {
      if (this.shouldProgressExercise(exercise)) {
        recommendations.push(await this.createProgressionWorkout(userProfile, exercise, currentState));
      }
    }
    
    return recommendations;
  }

  private async generateRecoveryWorkouts(userProfile: UserProfile, currentState: any): Promise<WorkoutRecommendation[]> {
    const recommendations: WorkoutRecommendation[] = [];
    
    if (currentState.fatigue > 7 || currentState.recovery < 5) {
      recommendations.push(await this.createRecoveryWorkout(userProfile, currentState));
    }
    
    return recommendations;
  }

  private async generateVarietyWorkouts(userProfile: UserProfile, currentState: any): Promise<WorkoutRecommendation[]> {
    const recommendations: WorkoutRecommendation[] = [];
    
    // Check for workout routine staleness
    const recentTypes = userProfile.workoutHistory.slice(-10).map(w => w.type);
    const typeVariety = new Set(recentTypes).size;
    
    if (typeVariety < 3) {
      recommendations.push(await this.createVarietyWorkout(userProfile, recentTypes, currentState));
    }
    
    return recommendations;
  }

  // ===== SPECIFIC WORKOUT CREATORS =====

  private async createGoalBasedWorkout(userProfile: UserProfile, goal: FitnessGoal, currentState: any): Promise<WorkoutRecommendation> {
    const workoutTemplates = {
      weight_loss: this.createWeightLossWorkout(userProfile, currentState),
      muscle_gain: this.createMuscleGainWorkout(userProfile, currentState),
      strength: this.createStrengthWorkout(userProfile, currentState),
      endurance: this.createEnduranceWorkout(userProfile, currentState),
      flexibility: this.createFlexibilityWorkout(userProfile, currentState)
    };
    
    const workout = workoutTemplates[goal.type as keyof typeof workoutTemplates] || workoutTemplates.strength;
    
    return {
      id: `goal_${goal.type}_${Date.now()}`,
      type: 'single_workout',
      title: `${goal.type.replace('_', ' ').toUpperCase()} Focused Workout`,
      description: `Personalized workout targeting your ${goal.type.replace('_', ' ')} goal`,
      singleWorkout: workout,
      reasoning: [
        `Aligned with your primary goal: ${goal.type.replace('_', ' ')}`,
        `Adapted to your ${userProfile.currentFitnessLevel} fitness level`,
        `Optimized for your available equipment: ${userProfile.preferences.equipment.join(', ')}`
      ],
      benefits: this.getGoalBenefits(goal.type),
      difficulty: userProfile.currentFitnessLevel,
      estimatedDuration: workout.duration,
      equipment: workout.exercises.flatMap(e => e.equipment),
      confidence: 0.9,
      personalizedFactors: [
        'Primary fitness goal',
        'Current fitness level',
        'Equipment availability',
        'Time constraints'
      ]
    };
  }

  private createWeightLossWorkout(userProfile: UserProfile, currentState: any): Workout {
    return {
      id: `weight_loss_${Date.now()}`,
      name: 'Fat Burning HIIT',
      type: 'hiit',
      duration: Math.min(currentState.timeAvailable, 45),
      exercises: [
        this.createExercise('burpees', 'plyometric', ['full_body'], ['bodyweight'], 4, 12, 30),
        this.createExercise('mountain_climbers', 'cardio', ['core', 'shoulders'], ['bodyweight'], 4, 20, 30),
        this.createExercise('jump_squats', 'plyometric', ['legs', 'glutes'], ['bodyweight'], 4, 15, 30),
        this.createExercise('high_knees', 'cardio', ['legs', 'core'], ['bodyweight'], 4, 30, 30),
        this.createExercise('plank_jacks', 'plyometric', ['core', 'shoulders'], ['bodyweight'], 4, 15, 30)
      ],
      warmup: [
        this.createExercise('arm_circles', 'flexibility', ['shoulders'], ['bodyweight'], 1, 10, 0),
        this.createExercise('leg_swings', 'flexibility', ['hips', 'legs'], ['bodyweight'], 1, 10, 0)
      ],
      cooldown: [
        this.createExercise('walking', 'cardio', ['legs'], ['bodyweight'], 1, 300, 0),
        this.createExercise('stretching', 'flexibility', ['full_body'], ['bodyweight'], 1, 300, 0)
      ],
      intensity: 8,
      targetHeartRate: [140, 180]
    };
  }

  private createMuscleGainWorkout(userProfile: UserProfile, currentState: any): Workout {
    return {
      id: `muscle_gain_${Date.now()}`,
      name: 'Hypertrophy Training',
      type: 'strength',
      duration: Math.min(currentState.timeAvailable, 60),
      exercises: [
        this.createExercise('bench_press', 'strength', ['chest', 'triceps'], ['barbell', 'bench'], 4, [8, 12], 90),
        this.createExercise('rows', 'strength', ['back', 'biceps'], ['dumbbells'], 4, [8, 12], 90),
        this.createExercise('squats', 'strength', ['legs', 'glutes'], ['barbell'], 4, [8, 12], 120),
        this.createExercise('overhead_press', 'strength', ['shoulders', 'triceps'], ['dumbbells'], 3, [8, 12], 90),
        this.createExercise('deadlifts', 'strength', ['back', 'legs'], ['barbell'], 3, [6, 10], 120)
      ],
      warmup: [
        this.createExercise('dynamic_warmup', 'flexibility', ['full_body'], ['bodyweight'], 1, 600, 0)
      ],
      cooldown: [
        this.createExercise('static_stretching', 'flexibility', ['full_body'], ['bodyweight'], 1, 600, 0)
      ],
      intensity: 7
    };
  }

  private createStrengthWorkout(userProfile: UserProfile, currentState: any): Workout {
    return {
      id: `strength_${Date.now()}`,
      name: 'Strength Development',
      type: 'strength',
      duration: Math.min(currentState.timeAvailable, 75),
      exercises: [
        this.createExercise('deadlifts', 'strength', ['back', 'legs'], ['barbell'], 5, [3, 5], 180),
        this.createExercise('squats', 'strength', ['legs', 'glutes'], ['barbell'], 5, [3, 5], 180),
        this.createExercise('bench_press', 'strength', ['chest', 'triceps'], ['barbell'], 5, [3, 5], 180),
        this.createExercise('overhead_press', 'strength', ['shoulders'], ['barbell'], 4, [3, 5], 150),
        this.createExercise('rows', 'strength', ['back'], ['barbell'], 4, [5, 8], 120)
      ],
      warmup: [
        this.createExercise('movement_prep', 'flexibility', ['full_body'], ['bodyweight'], 1, 900, 0)
      ],
      cooldown: [
        this.createExercise('mobility_work', 'flexibility', ['full_body'], ['bodyweight'], 1, 600, 0)
      ],
      intensity: 9
    };
  }

  private createEnduranceWorkout(userProfile: UserProfile, currentState: any): Workout {
    return {
      id: `endurance_${Date.now()}`,
      name: 'Cardiovascular Endurance',
      type: 'cardio',
      duration: Math.min(currentState.timeAvailable, 50),
      exercises: [
        this.createExercise('running', 'cardio', ['legs'], ['bodyweight'], 1, 1800, 0), // 30 min run
        this.createExercise('cycling', 'cardio', ['legs'], ['cardio_equipment'], 1, 1200, 0) // 20 min bike
      ],
      warmup: [
        this.createExercise('easy_walk', 'cardio', ['legs'], ['bodyweight'], 1, 300, 0)
      ],
      cooldown: [
        this.createExercise('cool_down_walk', 'cardio', ['legs'], ['bodyweight'], 1, 300, 0)
      ],
      intensity: 6,
      targetHeartRate: [120, 150]
    };
  }

  private createFlexibilityWorkout(userProfile: UserProfile, currentState: any): Workout {
    return {
      id: `flexibility_${Date.now()}`,
      name: 'Flexibility & Mobility',
      type: 'yoga',
      duration: Math.min(currentState.timeAvailable, 45),
      exercises: [
        this.createExercise('yoga_flow', 'flexibility', ['full_body'], ['yoga_mat'], 1, 1800, 0),
        this.createExercise('hip_stretches', 'flexibility', ['hips'], ['yoga_mat'], 3, 60, 30),
        this.createExercise('shoulder_stretches', 'flexibility', ['shoulders'], ['bodyweight'], 3, 60, 30),
        this.createExercise('spine_mobility', 'flexibility', ['spine'], ['yoga_mat'], 3, 60, 30)
      ],
      warmup: [
        this.createExercise('gentle_movement', 'flexibility', ['full_body'], ['bodyweight'], 1, 300, 0)
      ],
      cooldown: [
        this.createExercise('relaxation', 'flexibility', ['full_body'], ['yoga_mat'], 1, 300, 0)
      ],
      intensity: 3
    };
  }

  private createExercise(
    name: string,
    type: Exercise['type'],
    muscleGroups: string[],
    equipment: EquipmentType[],
    sets: number,
    reps: number | [number, number],
    restTime: number
  ): Exercise {
    return {
      id: `${name}_${Date.now()}`,
      name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      type,
      muscleGroups,
      equipment,
      instructions: this.getExerciseInstructions(name),
      sets,
      reps,
      restTime,
      modifications: this.getExerciseModifications(name),
      safetyTips: this.getExerciseSafetyTips(name)
    };
  }

  // ===== HELPER METHODS =====

  private getGoalBenefits(goalType: string): string[] {
    const benefits: Record<string, string[]> = {
      weight_loss: ['Burn calories efficiently', 'Boost metabolism', 'Improve cardiovascular health'],
      muscle_gain: ['Build lean muscle mass', 'Increase strength', 'Improve body composition'],
      strength: ['Increase maximal strength', 'Improve bone density', 'Enhance functional movement'],
      endurance: ['Improve cardiovascular fitness', 'Increase stamina', 'Better heart health'],
      flexibility: ['Improve range of motion', 'Reduce injury risk', 'Better movement quality']
    };
    
    return benefits[goalType] || ['Improve overall fitness'];
  }

  private getExerciseInstructions(exerciseName: string): string[] {
    const instructions: Record<string, string[]> = {
      squats: [
        'Stand with feet shoulder-width apart',
        'Lower your body as if sitting back into a chair',
        'Keep your chest up and knees tracking over toes',
        'Push through your heels to return to start'
      ],
      deadlifts: [
        'Stand with feet hip-width apart, bar over mid-foot',
        'Hinge at hips, keep back straight',
        'Grip bar just outside legs',
        'Drive through heels, extend hips and knees'
      ],
      bench_press: [
        'Lie on bench with eyes under the bar',
        'Grip bar slightly wider than shoulder-width',
        'Lower bar to chest with control',
        'Press bar up in straight line'
      ],
      burpees: [
        'Start in standing position',
        'Drop into squat, place hands on floor',
        'Jump feet back to plank position',
        'Do a pushup, jump feet forward, jump up'
      ]
      // Add more exercises...
    };
    
    return instructions[exerciseName] || ['Follow proper form for this exercise'];
  }

  private getExerciseModifications(exerciseName: string): ExerciseModification[] {
    // Return exercise modifications based on difficulty levels
    return [
      {
        level: 'easier',
        description: 'Reduce range of motion or use assistance',
        reason: 'For beginners or those with limitations'
      },
      {
        level: 'harder',
        description: 'Add weight, increase reps, or add complexity',
        reason: 'For advanced practitioners'
      }
    ];
  }

  private getExerciseSafetyTips(exerciseName: string): string[] {
    return [
      'Warm up properly before starting',
      'Use proper form over heavy weight',
      'Stop if you feel pain',
      'Breathe consistently throughout movement'
    ];
  }

  private identifyWeaknesses(userProfile: UserProfile): string | null {
    // Analyze user's strength progress to identify weak points
    const strengthProgress = userProfile.progressData.strengthProgress;
    if (strengthProgress.length === 0) return null;
    
    // Find exercises with slowest progress
    let slowestProgress = 1000;
    let weakness = null;
    
    for (const exercise of strengthProgress) {
      const recentEntries = exercise.history.slice(-5);
      if (recentEntries.length >= 2) {
        const firstEntry = recentEntries[0];
        const lastEntry = recentEntries[recentEntries.length - 1];
        const progressRate = (lastEntry.estimatedMax - firstEntry.estimatedMax) / firstEntry.estimatedMax;
        
        if (progressRate < slowestProgress) {
          slowestProgress = progressRate;
          weakness = exercise.exerciseName;
        }
      }
    }
    
    return weakness;
  }

  private async createWeaknessWorkout(userProfile: UserProfile, weakness: string, currentState: any): Promise<WorkoutRecommendation> {
    // Create workout targeting identified weakness
    const workout = this.createStrengthWorkout(userProfile, currentState); // Simplified
    
    return {
      id: `weakness_${Date.now()}`,
      type: 'single_workout',
      title: `${weakness} Focused Workout`,
      description: `Special workout to address your identified weakness in ${weakness}`,
      singleWorkout: workout,
      reasoning: [
        `Targets your identified weakness: ${weakness}`,
        'Includes accessory exercises for improvement',
        'Progressive overload approach'
      ],
      benefits: ['Improve weak point', 'Balanced development', 'Injury prevention'],
      difficulty: userProfile.currentFitnessLevel,
      estimatedDuration: workout.duration,
      equipment: workout.exercises.flatMap(e => e.equipment),
      confidence: 0.85,
      personalizedFactors: ['Performance analysis', 'Weakness identification', 'Targeted improvement']
    };
  }

  private shouldProgressExercise(exercise: StrengthProgress): boolean {
    const recentEntries = exercise.history.slice(-3);
    if (recentEntries.length < 2) return false;
    
    // Check if user has been consistent with current weight
    const lastWeight = recentEntries[recentEntries.length - 1].weight;
    const consistentSessions = recentEntries.filter(e => e.weight === lastWeight).length;
    
    return consistentSessions >= 2; // If they've done current weight 2+ times
  }

  private async createProgressionWorkout(userProfile: UserProfile, exercise: StrengthProgress, currentState: any): Promise<WorkoutRecommendation> {
    const workout = this.createStrengthWorkout(userProfile, currentState); // Simplified
    
    return {
      id: `progression_${Date.now()}`,
      type: 'single_workout',
      title: `${exercise.exerciseName} Progression`,
      description: `Ready to progress your ${exercise.exerciseName} - time to challenge yourself!`,
      singleWorkout: workout,
      reasoning: [
        `You've been consistent with current ${exercise.exerciseName} weight`,
        'Progressive overload for continued gains',
        'Optimal timing for strength progression'
      ],
      benefits: ['Strength gains', 'Progressive overload', 'Continued improvement'],
      difficulty: userProfile.currentFitnessLevel,
      estimatedDuration: workout.duration,
      equipment: workout.exercises.flatMap(e => e.equipment),
      confidence: 0.88,
      personalizedFactors: ['Strength tracking', 'Progressive overload', 'Readiness assessment']
    };
  }

  private async createRecoveryWorkout(userProfile: UserProfile, currentState: any): Promise<WorkoutRecommendation> {
    const workout: Workout = {
      id: `recovery_${Date.now()}`,
      name: 'Active Recovery Session',
      type: 'yoga',
      duration: 30,
      exercises: [
        this.createExercise('gentle_yoga', 'flexibility', ['full_body'], ['yoga_mat'], 1, 1200, 0),
        this.createExercise('foam_rolling', 'flexibility', ['full_body'], ['bodyweight'], 1, 600, 0),
        this.createExercise('breathing_exercises', 'flexibility', ['core'], ['bodyweight'], 3, 60, 30)
      ],
      warmup: [],
      cooldown: [],
      intensity: 2
    };
    
    return {
      id: `recovery_${Date.now()}`,
      type: 'single_workout',
      title: 'Active Recovery Session',
      description: 'Gentle movement to promote recovery and reduce fatigue',
      singleWorkout: workout,
      reasoning: [
        `High fatigue level detected (${currentState.fatigue}/10)`,
        'Active recovery promotes blood flow',
        'Helps maintain movement without stress'
      ],
      benefits: ['Improved recovery', 'Reduced muscle tension', 'Better sleep quality'],
      difficulty: 'beginner',
      estimatedDuration: 30,
      equipment: ['yoga_mat'],
      confidence: 0.95,
      personalizedFactors: ['Fatigue assessment', 'Recovery optimization', 'Stress reduction']
    };
  }

  private async createVarietyWorkout(userProfile: UserProfile, recentTypes: WorkoutType[], currentState: any): Promise<WorkoutRecommendation> {
    // Find workout types not done recently
    const allTypes: WorkoutType[] = ['strength', 'cardio', 'hiit', 'yoga', 'pilates', 'boxing'];
    const unusedTypes = allTypes.filter(type => !recentTypes.includes(type));
    const newType = unusedTypes[0] || 'hiit';
    
    const workout = this.createWorkoutByType(newType, userProfile, currentState);
    
    return {
      id: `variety_${Date.now()}`,
      type: 'single_workout',
      title: `${newType.toUpperCase()} Challenge`,
      description: `Mix up your routine with this ${newType} workout`,
      singleWorkout: workout,
      reasoning: [
        'Add variety to prevent workout staleness',
        `You haven't done ${newType} recently`,
        'Challenges different movement patterns'
      ],
      benefits: ['Prevent adaptation', 'Mental engagement', 'Skill development'],
      difficulty: userProfile.currentFitnessLevel,
      estimatedDuration: workout.duration,
      equipment: workout.exercises.flatMap(e => e.equipment),
      confidence: 0.75,
      personalizedFactors: ['Workout variety analysis', 'Routine optimization', 'Engagement enhancement']
    };
  }

  private createWorkoutByType(type: WorkoutType, userProfile: UserProfile, currentState: any): Workout {
    switch (type) {
      case 'hiit':
        return this.createWeightLossWorkout(userProfile, currentState);
      case 'yoga':
        return this.createFlexibilityWorkout(userProfile, currentState);
      case 'cardio':
        return this.createEnduranceWorkout(userProfile, currentState);
      default:
        return this.createStrengthWorkout(userProfile, currentState);
    }
  }

  // ===== NUTRITION RECOMMENDATION METHODS =====

  private async generateMealPlanRecommendations(userProfile: UserProfile, nutritionNeeds: any): Promise<NutritionRecommendation[]> {
    const recommendations: NutritionRecommendation[] = [];
    
    // Create personalized meal plan
    const mealPlan = await this.createPersonalizedMealPlan(userProfile, nutritionNeeds);
    
    recommendations.push({
      id: `meal_plan_${Date.now()}`,
      type: 'meal_plan',
      title: 'Personalized Weekly Meal Plan',
      description: 'Custom meal plan aligned with your fitness goals and preferences',
      mealPlan,
      reasoning: [
        `Targets ${nutritionNeeds.targetCalories} calories daily`,
        `Optimized for ${nutritionNeeds.primaryGoal || 'general fitness'}`,
        'Includes variety and balanced nutrition'
      ],
      benefits: ['Supports fitness goals', 'Convenient planning', 'Nutritional balance'],
      targetCalories: nutritionNeeds.targetCalories,
      targetMacros: {
        protein: nutritionNeeds.targetProtein,
        carbs: nutritionNeeds.targetCarbs,
        fat: nutritionNeeds.targetFat,
        fiber: 25
      },
      confidence: 0.85,
      personalizedFactors: ['Caloric needs', 'Macro targets', 'Food preferences']
    });
    
    return recommendations;
  }

  private async generateSupplementRecommendations(userProfile: UserProfile, nutritionNeeds: any): Promise<NutritionRecommendation[]> {
    const recommendations: NutritionRecommendation[] = [];
    
    // Basic supplements based on goals
    const supplements = this.getRecommendedSupplements(userProfile, nutritionNeeds);
    
    for (const supplement of supplements) {
      recommendations.push({
        id: `supplement_${supplement.name}_${Date.now()}`,
        type: 'supplement',
        title: `${supplement.name} Supplement`,
        description: `${supplement.purpose} supplement recommendation`,
        supplement,
        reasoning: [`Supports ${supplement.purpose}`, `Evidence level: ${supplement.evidence}`],
        benefits: [supplement.purpose],
        confidence: supplement.evidence === 'strong' ? 0.9 : supplement.evidence === 'moderate' ? 0.7 : 0.5,
        personalizedFactors: ['Goal alignment', 'Nutritional gaps', 'Evidence base']
      });
    }
    
    return recommendations;
  }

  private async generateHydrationRecommendations(userProfile: UserProfile, nutritionNeeds: any): Promise<NutritionRecommendation[]> {
    const recommendations: NutritionRecommendation[] = [];
    
    const currentHydration = userProfile.nutritionHistory.slice(-7)
      .reduce((sum, n) => sum + n.hydration, 0) / 7;
    
    if (currentHydration < nutritionNeeds.hydrationTarget * 0.8) {
      recommendations.push({
        id: `hydration_${Date.now()}`,
        type: 'hydration',
        title: 'Increase Daily Hydration',
        description: `Aim for ${nutritionNeeds.hydrationTarget.toFixed(1)}L of water daily`,
        reasoning: [
          `Current intake: ${currentHydration.toFixed(1)}L/day`,
          `Target: ${nutritionNeeds.hydrationTarget.toFixed(1)}L/day`,
          'Supports performance and recovery'
        ],
        benefits: ['Improved performance', 'Better recovery', 'Enhanced energy'],
        confidence: 0.95,
        personalizedFactors: ['Current intake analysis', 'Body weight calculation', 'Activity level']
      });
    }
    
    return recommendations;
  }

  // ===== WELLNESS RECOMMENDATION METHODS =====

  private async generateSleepRecommendations(userProfile: UserProfile, wellnessAnalysis: any): Promise<WellnessRecommendation[]> {
    const recommendations: WellnessRecommendation[] = [];
    
    if (wellnessAnalysis.sleepQuality < 7) {
      recommendations.push({
        id: `sleep_${Date.now()}`,
        type: 'sleep',
        title: 'Improve Sleep Quality',
        description: 'Strategies to enhance your sleep for better recovery',
        actionItems: [
          'Maintain consistent sleep schedule',
          'Create relaxing bedtime routine',
          'Limit screen time before bed',
          'Keep bedroom cool and dark',
          'Avoid caffeine 6 hours before sleep'
        ],
        reasoning: [
          `Current sleep quality: ${wellnessAnalysis.sleepQuality}/10`,
          'Poor sleep affects recovery and performance',
          'Sleep is crucial for muscle growth and fat loss'
        ],
        benefits: ['Better recovery', 'Improved performance', 'Enhanced mood'],
        timeframe: '2-4 weeks',
        confidence: 0.9,
        personalizedFactors: ['Sleep quality assessment', 'Recovery needs', 'Performance optimization']
      });
    }
    
    return recommendations;
  }

  private async generateStressManagementRecommendations(userProfile: UserProfile, wellnessAnalysis: any): Promise<WellnessRecommendation[]> {
    const recommendations: WellnessRecommendation[] = [];
    
    if (wellnessAnalysis.stressLevel > 6) {
      recommendations.push({
        id: `stress_${Date.now()}`,
        type: 'stress',
        title: 'Stress Management Strategies',
        description: 'Techniques to manage stress and improve overall wellbeing',
        actionItems: [
          'Practice daily meditation (10-15 minutes)',
          'Try deep breathing exercises',
          'Schedule regular breaks during work',
          'Engage in enjoyable activities',
          'Consider talking to a counselor'
        ],
        reasoning: [
          `Current stress level: ${wellnessAnalysis.stressLevel}/10`,
          'High stress impairs recovery and immune function',
          'Stress management improves training adaptations'
        ],
        benefits: ['Better recovery', 'Improved immune function', 'Enhanced quality of life'],
        timeframe: 'Ongoing',
        confidence: 0.85,
        personalizedFactors: ['Stress level assessment', 'Lifestyle factors', 'Holistic health']
      });
    }
    
    return recommendations;
  }

  // ===== UTILITY METHODS =====

  private async createPersonalizedMealPlan(userProfile: UserProfile, nutritionNeeds: any): Promise<MealPlan> {
    // Mock meal plan creation - would be more sophisticated in real implementation
    return {
      id: `meal_plan_${Date.now()}`,
      name: 'Personalized Weekly Plan',
      duration: 7,
      dailyCalories: nutritionNeeds.targetCalories,
      dailyMacros: {
        protein: nutritionNeeds.targetProtein,
        carbs: nutritionNeeds.targetCarbs,
        fat: nutritionNeeds.targetFat,
        fiber: 25
      },
      meals: [], // Would include actual meal recommendations
      shoppingList: [], // Would include shopping list
      prepTime: 90 // minutes per day
    };
  }

  private getRecommendedSupplements(userProfile: UserProfile, nutritionNeeds: any): SupplementRecommendation[] {
    const supplements: SupplementRecommendation[] = [];
    
    // Basic recommendations
    supplements.push({
      name: 'Whey Protein',
      dosage: '20-30g post-workout',
      timing: 'Within 30 minutes after training',
      purpose: 'Muscle protein synthesis',
      evidence: 'strong',
      sideEffects: ['Digestive issues in lactose intolerant individuals']
    });
    
    if (nutritionNeeds.primaryGoal === 'muscle_gain') {
      supplements.push({
        name: 'Creatine Monohydrate',
        dosage: '5g daily',
        timing: 'Any time of day',
        purpose: 'Strength and power enhancement',
        evidence: 'strong',
        sideEffects: ['Potential water retention']
      });
    }
    
    return supplements;
  }

  // ===== PUBLIC API METHODS =====

  async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
    const existingProfile = this.userProfiles.get(userId);
    if (existingProfile) {
      const updatedProfile = { ...existingProfile, ...profileData };
      this.userProfiles.set(userId, updatedProfile);
      await this.saveUserProfile(userId, updatedProfile);
    }
  }

  async addWorkoutSession(userId: string, workout: WorkoutSession): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (profile) {
      profile.workoutHistory.push(workout);
      await this.saveUserProfile(userId, profile);
    }
  }

  async addNutritionEntry(userId: string, nutrition: NutritionEntry): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (profile) {
      profile.nutritionHistory.push(nutrition);
      await this.saveUserProfile(userId, profile);
    }
  }

  private async saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
    try {
      const profiles = this.userProfiles;
      profiles.set(userId, profile);
      
      const profilesObject = Object.fromEntries(profiles);
      await AsyncStorage.setItem('user_profiles', JSON.stringify(profilesObject));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  async getCachedRecommendations(userId: string, type: 'workout' | 'nutrition' | 'wellness'): Promise<any[]> {
    return this.recommendationCache.get(`${type}_${userId}`) || [];
  }

  async clearRecommendationCache(userId: string): Promise<void> {
    const keys = Array.from(this.recommendationCache.keys()).filter(key => key.includes(userId));
    keys.forEach(key => this.recommendationCache.delete(key));
  }
}

export default new AIRecommendationEngine();
