// Advanced Workout Intelligence Service - Phase 9.1
// Implements adaptive workout difficulty, smart rest timing, and progressive overload automation

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workout, Exercise, WorkoutSession, User as UserProfile, MuscleGroup, Equipment } from '../types';

export interface AdaptiveWorkoutConfig {
  id: string;
  baseWorkout: Workout;
  difficulty: DifficultyLevel;
  personalizedModifications: PersonalizedModification[];
  progressiveOverload: ProgressionPlan;
  adaptations: WorkoutAdaptation[];
  lastPerformance: PerformanceMetrics;
}

export interface DifficultyLevel {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  intensity: number; // 0.1 - 1.0
  volume: number; // 0.5 - 2.0
  complexity: number; // 0.1 - 1.0
  autoAdjust: boolean;
}

export interface PersonalizedModification {
  exerciseId: string;
  modification: 'weight_reduction' | 'rep_reduction' | 'substitute_exercise' | 'add_rest' | 'remove_exercise';
  reason: 'injury_history' | 'equipment_unavailable' | 'user_preference' | 'fatigue_level';
  parameters: Record<string, any>;
  applied: boolean;
}

export interface ProgressionPlan {
  type: 'linear' | 'double_progression' | 'percentage_based' | 'autoregulation';
  parameters: {
    weightIncrease?: number;
    repIncrease?: number;
    frequencyAdjustment?: number;
    deloadThreshold?: number;
  };
  nextProgression: Date;
  lastDeload?: Date;
}

export interface WorkoutAdaptation {
  trigger: 'fatigue' | 'performance_drop' | 'heart_rate_high' | 'user_feedback' | 'injury_risk';
  modification: 'reduce_intensity' | 'increase_rest' | 'substitute_exercise' | 'add_warmup' | 'end_workout';
  severity: 'minor' | 'moderate' | 'major';
  parameters: Record<string, any>;
  confidence: number;
  timestamp: Date;
}

export interface PerformanceMetrics {
  workoutId: string;
  date: Date;
  duration: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  fatigue: FatigueLevel;
  completionRate: number;
  perceivedExertion: number; // 1-10 RPE scale
  exercisePerformance: ExercisePerformance[];
}

export interface FatigueLevel {
  overall: number; // 1-10
  muscular: number; // 1-10
  cardiovascular: number; // 1-10
  mental: number; // 1-10
  recovery: number; // 1-10
}

export interface ExercisePerformance {
  exerciseId: string;
  sets: SetPerformance[];
  formQuality: number; // 1-10
  difficultyRating: number; // 1-10
  timeUnderTension?: number;
  restTime: number;
}

export interface SetPerformance {
  setNumber: number;
  weight?: number;
  reps: number;
  duration?: number;
  distance?: number;
  completed: boolean;
  rpe: number; // Rate of Perceived Exertion
}

export interface SmartRestTimer {
  baseRestTime: number;
  adaptiveRest: boolean;
  factors: RestingFactors;
  currentRest: number;
  recommendations: RestRecommendation[];
}

export interface RestingFactors {
  heartRateRecovery?: number;
  previousSetIntensity: number;
  muscleGroupFatigue: number;
  exerciseType: 'compound' | 'isolation' | 'cardio';
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  sleepQuality?: number;
}

export interface RestRecommendation {
  type: 'extend_rest' | 'reduce_rest' | 'active_recovery' | 'hydrate' | 'adjust_weight';
  reason: string;
  adjustment: number;
  priority: 'low' | 'medium' | 'high';
}

class AdaptiveWorkoutService {
  private readonly STORAGE_KEYS = {
    ADAPTIVE_CONFIGS: 'adaptive_workout_configs',
    PERFORMANCE_HISTORY: 'performance_history',
    PROGRESSION_DATA: 'progression_data',
    REST_PREFERENCES: 'rest_preferences',
  };

  // Adaptive Workout Engine
  async createAdaptiveWorkout(
    baseWorkout: Workout, 
    userProfile: UserProfile,
    recentPerformance?: PerformanceMetrics[]
  ): Promise<AdaptiveWorkoutConfig> {
    const difficultyLevel = await this.calculateDifficultyLevel(userProfile, recentPerformance);
    const personalizedMods = await this.generatePersonalizedModifications(baseWorkout, userProfile);
    const progressionPlan = await this.createProgressionPlan(userProfile, baseWorkout);

    const adaptiveConfig: AdaptiveWorkoutConfig = {
      id: this.generateId(),
      baseWorkout,
      difficulty: difficultyLevel,
      personalizedModifications: personalizedMods,
      progressiveOverload: progressionPlan,
      adaptations: [],
      lastPerformance: recentPerformance?.[0] || this.getDefaultPerformance(),
    };

    await this.saveAdaptiveConfig(adaptiveConfig);
    return adaptiveConfig;
  }

  async adaptWorkoutRealTime(
    workoutId: string,
    currentPerformance: Partial<PerformanceMetrics>
  ): Promise<WorkoutAdaptation[]> {
    const config = await this.getAdaptiveConfig(workoutId);
    if (!config) return [];

    const adaptations: WorkoutAdaptation[] = [];

    // Check for fatigue indicators
    if (currentPerformance.fatigue && currentPerformance.fatigue.overall > 7) {
      adaptations.push({
        trigger: 'fatigue',
        modification: 'reduce_intensity',
        severity: 'moderate',
        parameters: { intensityReduction: 0.15 },
        confidence: 0.85,
        timestamp: new Date(),
      });
    }

    // Check heart rate if available
    if (currentPerformance.avgHeartRate && currentPerformance.avgHeartRate > 180) {
      adaptations.push({
        trigger: 'heart_rate_high',
        modification: 'increase_rest',
        severity: 'minor',
        parameters: { restIncrease: 30 },
        confidence: 0.9,
        timestamp: new Date(),
      });
    }

    // Check completion rate
    if (currentPerformance.completionRate !== undefined && currentPerformance.completionRate < 0.6) {
      adaptations.push({
        trigger: 'performance_drop',
        modification: 'substitute_exercise',
        severity: 'major',
        parameters: { targetMuscleGroup: 'maintain', difficultyReduction: 0.3 },
        confidence: 0.75,
        timestamp: new Date(),
      });
    }

    // Apply adaptations
    for (const adaptation of adaptations) {
      await this.applyAdaptation(config, adaptation);
    }

    return adaptations;
  }

  // Smart Rest Timer System
  async calculateSmartRestTime(
    exercise: Exercise,
    previousSetPerformance: SetPerformance,
    currentFactors: Partial<RestingFactors>
  ): Promise<SmartRestTimer> {
    const baseRest = this.getBaseRestTime(exercise);
    
    const factors: RestingFactors = {
      previousSetIntensity: this.calculateSetIntensity(previousSetPerformance),
      muscleGroupFatigue: await this.estimateMuscleGroupFatigue(exercise.targetMuscles || exercise.muscleGroups || []),
      exerciseType: this.classifyExerciseType(exercise),
      timeOfDay: this.getTimeOfDay(),
      ...currentFactors,
    };

    const adaptiveRest = this.calculateAdaptiveRestTime(baseRest, factors);
    const recommendations = this.generateRestRecommendations(factors, adaptiveRest);

    return {
      baseRestTime: baseRest,
      adaptiveRest: true,
      factors,
      currentRest: adaptiveRest,
      recommendations,
    };
  }

  // Progressive Overload Automation
  async updateProgressiveOverload(
    workoutId: string,
    performance: PerformanceMetrics
  ): Promise<ProgressionPlan> {
    const config = await this.getAdaptiveConfig(workoutId);
    if (!config) throw new Error('Workout configuration not found');

    const currentPlan = config.progressiveOverload;
    const performanceHistory = await this.getPerformanceHistory(workoutId);
    
    // Analyze recent performance trends
    const progressionReady = this.analyzeProgressionReadiness(performance, performanceHistory);
    const deloadNeeded = this.checkDeloadNecessary(performanceHistory);

    if (deloadNeeded) {
      return this.executeDeload(currentPlan);
    }

    if (progressionReady) {
      return this.executeProgression(currentPlan, performance);
    }

    return currentPlan;
  }

  // Exercise Substitution Engine
  async suggestExerciseSubstitutions(
    originalExercise: Exercise,
    reason: 'equipment_unavailable' | 'injury_avoidance' | 'difficulty_adjustment' | 'variety',
    userProfile: UserProfile
  ): Promise<Exercise[]> {
    const substitutions: Exercise[] = [];
    const targetMuscles = originalExercise.targetMuscles || originalExercise.muscleGroups || [];
    const exerciseType = originalExercise.type || originalExercise.category;

    // Get exercise database
    const exerciseDatabase = await this.getExerciseDatabase();
    
    // Filter exercises by muscle groups and availability
    const candidates = exerciseDatabase.filter(exercise => {
      const hasMatchingMuscles = (exercise.targetMuscles || exercise.muscleGroups || []).some((muscle: MuscleGroup) => 
        targetMuscles.includes(muscle)
      );
      const equipmentAvailable = this.checkEquipmentAvailability(
        exercise.equipment || [], 
        userProfile.availableEquipment || []
      );
      
      return hasMatchingMuscles && equipmentAvailable && exercise.id !== originalExercise.id;
    });

    // Rank substitutions by suitability
    const rankedCandidates = candidates
      .map(exercise => ({
        exercise,
        score: this.calculateSubstitutionScore(originalExercise, exercise, reason, userProfile),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.exercise);

    return rankedCandidates;
  }

  // Performance Analysis
  async analyzeWorkoutPerformance(
    workoutSession: WorkoutSession
  ): Promise<{
    overallScore: number;
    strengths: string[];
    improvements: string[];
    nextWorkoutRecommendations: string[];
  }> {
    const performance = await this.calculatePerformanceMetrics(workoutSession);
    
    const analysis = {
      overallScore: this.calculateOverallScore(performance),
      strengths: this.identifyStrengths(performance),
      improvements: this.identifyImprovements(performance),
      nextWorkoutRecommendations: await this.generateNextWorkoutRecommendations(performance),
    };

    return analysis;
  }

  // Helper Methods
  private async calculateDifficultyLevel(
    userProfile: UserProfile,
    recentPerformance?: PerformanceMetrics[]
  ): Promise<DifficultyLevel> {
    const baseLevel = userProfile.fitnessLevel;
    const performanceModifier = recentPerformance 
      ? this.calculatePerformanceModifier(recentPerformance)
      : 0;

    const levelMapping = {
      beginner: { intensity: 0.6, volume: 0.8, complexity: 0.4 },
      intermediate: { intensity: 0.75, volume: 1.0, complexity: 0.6 },
      advanced: { intensity: 0.85, volume: 1.2, complexity: 0.8 },
    };

    const base = levelMapping[baseLevel] || levelMapping.intermediate;

    return {
      level: baseLevel,
      intensity: Math.max(0.1, Math.min(1.0, base.intensity + performanceModifier)),
      volume: Math.max(0.5, Math.min(2.0, base.volume + performanceModifier)),
      complexity: Math.max(0.1, Math.min(1.0, base.complexity + performanceModifier)),
      autoAdjust: true,
    };
  }

  private calculatePerformanceModifier(performances: PerformanceMetrics[]): number {
    const avgCompletion = performances.reduce((sum, p) => sum + p.completionRate, 0) / performances.length;
    const avgRPE = performances.reduce((sum, p) => sum + p.perceivedExertion, 0) / performances.length;
    
    // Adjust difficulty based on recent performance
    if (avgCompletion > 0.9 && avgRPE < 7) return 0.1; // Increase difficulty
    if (avgCompletion < 0.7 || avgRPE > 8.5) return -0.15; // Decrease difficulty
    return 0; // Maintain current level
  }

  private async generatePersonalizedModifications(
    workout: Workout,
    userProfile: UserProfile
  ): Promise<PersonalizedModification[]> {
    const modifications: PersonalizedModification[] = [];

    // Check for injury history
    if (userProfile.physicalLimitations) {
      for (const limitation of userProfile.physicalLimitations) {
        const affectedExercises = workout.exercises.filter(ex => 
          this.checkExerciseConflictById(ex.exerciseId, limitation)
        );
        
        for (const exercise of affectedExercises) {
          modifications.push({
            exerciseId: exercise.exerciseId,
            modification: 'substitute_exercise',
            reason: 'injury_history',
            parameters: { limitation, safetyLevel: 'high' },
            applied: false,
          });
        }
      }
    }

    // Check equipment availability
    const availableEquipment = userProfile.availableEquipment || [];
    for (const exercise of workout.exercises) {
      // For WorkoutExercise, we would need to fetch the full Exercise details
      // to check equipment. For now, we'll skip this check.
      // In a real implementation, you'd fetch Exercise by exerciseId
    }

    return modifications;
  }

  private getBaseRestTime(exercise: Exercise): number {
    const exerciseType = this.classifyExerciseType(exercise);
    const intensity = exercise.sets?.[0]?.reps ? (exercise.sets[0].reps < 6 ? 'high' : exercise.sets[0].reps < 12 ? 'medium' : 'low') : 'medium';

    const restTimes = {
      compound: { high: 180, medium: 120, low: 90 },
      isolation: { high: 120, medium: 90, low: 60 },
      cardio: { high: 60, medium: 45, low: 30 },
    };

    return restTimes[exerciseType][intensity];
  }

  private calculateAdaptiveRestTime(baseRest: number, factors: RestingFactors): number {
    let adaptiveRest = baseRest;

    // Adjust based on heart rate recovery
    if (factors.heartRateRecovery) {
      if (factors.heartRateRecovery < 20) adaptiveRest *= 1.3; // Slow recovery
      else if (factors.heartRateRecovery > 40) adaptiveRest *= 0.8; // Fast recovery
    }

    // Adjust based on previous set intensity
    adaptiveRest *= (0.7 + factors.previousSetIntensity * 0.6);

    // Adjust based on muscle group fatigue
    adaptiveRest *= (0.8 + factors.muscleGroupFatigue * 0.4);

    // Adjust based on sleep quality
    if (factors.sleepQuality) {
      adaptiveRest *= (1.3 - factors.sleepQuality * 0.3);
    }

    return Math.round(Math.max(30, Math.min(300, adaptiveRest)));
  }

  private classifyExerciseType(exercise: Exercise): 'compound' | 'isolation' | 'cardio' {
    const muscleGroups = (exercise.targetMuscles || exercise.muscleGroups || []).length;
    
    if (exercise.category === 'cardio') return 'cardio';
    if (muscleGroups > 2) return 'compound';
    return 'isolation';
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getDefaultPerformance(): PerformanceMetrics {
    return {
      workoutId: '',
      date: new Date(),
      duration: 0,
      fatigue: { overall: 5, muscular: 5, cardiovascular: 5, mental: 5, recovery: 5 },
      completionRate: 1.0,
      perceivedExertion: 6,
      exercisePerformance: [],
    };
  }

  // Storage methods
  private async saveAdaptiveConfig(config: AdaptiveWorkoutConfig): Promise<void> {
    try {
      const configs = await this.loadAdaptiveConfigs();
      const existingIndex = configs.findIndex(c => c.id === config.id);
      
      if (existingIndex >= 0) {
        configs[existingIndex] = config;
      } else {
        configs.push(config);
      }
      
      await AsyncStorage.setItem(this.STORAGE_KEYS.ADAPTIVE_CONFIGS, JSON.stringify(configs));
    } catch (error) {
      console.error('Error saving adaptive config:', error);
    }
  }

  private async loadAdaptiveConfigs(): Promise<AdaptiveWorkoutConfig[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.ADAPTIVE_CONFIGS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading adaptive configs:', error);
      return [];
    }
  }

  private async getAdaptiveConfig(workoutId: string): Promise<AdaptiveWorkoutConfig | null> {
    const configs = await this.loadAdaptiveConfigs();
    return configs.find(c => c.baseWorkout.id === workoutId) || null;
  }

  // Additional helper methods would be implemented here...
  private calculateSetIntensity(setPerformance: SetPerformance): number {
    // Calculate based on RPE and completion
    return setPerformance.rpe / 10 * (setPerformance.completed ? 1 : 0.7);
  }

  private async estimateMuscleGroupFatigue(muscles: MuscleGroup[]): Promise<number> {
    // This would integrate with recent workout history
    return 0.5; // Placeholder
  }

  private checkExerciseConflictById(exerciseId: string, limitation: string): boolean {
    // Implementation would check if exercise conflicts with physical limitation
    // For now, use a simple string match
    return exerciseId.toLowerCase().includes(limitation.toLowerCase().split(' ')[0]);
  }

  private checkExerciseConflict(exercise: Exercise, limitation: string): boolean {
    // Implementation would check if exercise conflicts with physical limitation
    return exercise.name.toLowerCase().includes(limitation.toLowerCase().split(' ')[0]);
  }

  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  private generateRestRecommendations(factors: RestingFactors, restTime: number): RestRecommendation[] {
    const recommendations: RestRecommendation[] = [];

    if (factors.heartRateRecovery && factors.heartRateRecovery < 20) {
      recommendations.push({
        type: 'extend_rest',
        reason: 'Heart rate not fully recovered',
        adjustment: 30,
        priority: 'high',
      });
    }

    if (factors.muscleGroupFatigue > 0.7) {
      recommendations.push({
        type: 'active_recovery',
        reason: 'High muscle fatigue detected',
        adjustment: 0,
        priority: 'medium',
      });
    }

    return recommendations;
  }

  private async applyAdaptation(config: AdaptiveWorkoutConfig, adaptation: WorkoutAdaptation): Promise<void> {
    config.adaptations.push(adaptation);
    await this.saveAdaptiveConfig(config);
  }

  private analyzeProgressionReadiness(performance: PerformanceMetrics, history: PerformanceMetrics[]): boolean {
    // Check if user is ready for progression based on consistent performance
    const recentPerformances = history.slice(-3);
    const avgCompletion = recentPerformances.reduce((sum, p) => sum + p.completionRate, 0) / recentPerformances.length;
    const avgRPE = recentPerformances.reduce((sum, p) => sum + p.perceivedExertion, 0) / recentPerformances.length;
    
    return avgCompletion > 0.85 && avgRPE < 8;
  }

  private checkDeloadNecessary(history: PerformanceMetrics[]): boolean {
    // Check if deload is needed based on declining performance
    if (history.length < 4) return false;
    
    const recent = history.slice(-2);
    const earlier = history.slice(-4, -2);
    
    const recentAvgCompletion = recent.reduce((sum, p) => sum + p.completionRate, 0) / recent.length;
    const earlierAvgCompletion = earlier.reduce((sum, p) => sum + p.completionRate, 0) / earlier.length;
    
    return recentAvgCompletion < earlierAvgCompletion * 0.85; // 15% drop in performance
  }

  private executeDeload(currentPlan: ProgressionPlan): ProgressionPlan {
    return {
      ...currentPlan,
      parameters: {
        ...currentPlan.parameters,
        weightIncrease: (currentPlan.parameters.weightIncrease || 2.5) * 0.7,
        repIncrease: (currentPlan.parameters.repIncrease || 1) * 0.7,
      },
      lastDeload: new Date(),
    };
  }

  private executeProgression(currentPlan: ProgressionPlan, performance: PerformanceMetrics): ProgressionPlan {
    return {
      ...currentPlan,
      parameters: {
        ...currentPlan.parameters,
        weightIncrease: (currentPlan.parameters.weightIncrease || 2.5),
        repIncrease: (currentPlan.parameters.repIncrease || 1),
      },
      nextProgression: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
    };
  }

  private async getPerformanceHistory(workoutId: string): Promise<PerformanceMetrics[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.PERFORMANCE_HISTORY);
      const allHistory: PerformanceMetrics[] = data ? JSON.parse(data) : [];
      return allHistory.filter(h => h.workoutId === workoutId).slice(-10); // Last 10 sessions
    } catch (error) {
      console.error('Error loading performance history:', error);
      return [];
    }
  }

  private async createProgressionPlan(userProfile: UserProfile, workout: Workout): Promise<ProgressionPlan> {
    // Create progression plan based on user level and workout type
    const plan: ProgressionPlan = {
      type: userProfile.fitnessLevel === 'beginner' ? 'linear' : 'double_progression',
      parameters: {
        weightIncrease: userProfile.fitnessLevel === 'beginner' ? 2.5 : 5,
        repIncrease: 1,
        frequencyAdjustment: 0,
        deloadThreshold: 0.15, // 15% performance drop triggers deload
      },
      nextProgression: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    return plan;
  }

  // Additional placeholder methods for completeness
  private checkEquipmentAvailability(required: Equipment[], available: Equipment[]): boolean {
    return required.every(req => available.includes(req));
  }

  private calculateSubstitutionScore(
    original: Exercise, 
    candidate: Exercise, 
    reason: string, 
    userProfile: UserProfile
  ): number {
    // Implementation would calculate how suitable the substitution is
    let score = 0.5;
    
    // Same muscle groups = higher score
    const muscleOverlap = (original.targetMuscles || original.muscleGroups || []).filter((m: MuscleGroup) => 
      (candidate.targetMuscles || candidate.muscleGroups || []).includes(m)
    ).length || 0;
    score += muscleOverlap * 0.2;
    
    // Similar difficulty = higher score
    if (original.difficulty === candidate.difficulty) score += 0.2;
    
    return Math.min(1, score);
  }

  private async getExerciseDatabase(): Promise<Exercise[]> {
    // This would return the full exercise database
    // For now, return a placeholder
    return [];
  }

  private calculateOverallScore(performance: PerformanceMetrics): number {
    // Calculate overall workout performance score (0-100)
    const completionScore = performance.completionRate * 40;
    const effortScore = (10 - performance.perceivedExertion) * 4; // Inverse RPE
    const durationScore = Math.min(20, performance.duration / 60 * 2); // Up to 20 points for duration
    
    return Math.round(Math.max(0, Math.min(100, completionScore + effortScore + durationScore)));
  }

  private identifyStrengths(performance: PerformanceMetrics): string[] {
    const strengths: string[] = [];
    
    if (performance.completionRate > 0.9) {
      strengths.push('Excellent workout completion rate');
    }
    
    if (performance.perceivedExertion < 7 && performance.completionRate > 0.8) {
      strengths.push('Good strength endurance');
    }
    
    if (performance.duration > 45 && performance.duration < 90) {
      strengths.push('Optimal workout duration');
    }
    
    return strengths;
  }

  private identifyImprovements(performance: PerformanceMetrics): string[] {
    const improvements: string[] = [];
    
    if (performance.completionRate < 0.8) {
      improvements.push('Focus on completing all sets and reps');
    }
    
    if (performance.perceivedExertion > 8.5) {
      improvements.push('Consider reducing intensity or adding more rest');
    }
    
    if (performance.duration < 30) {
      improvements.push('Try to extend workout duration for better results');
    }
    
    return improvements;
  }

  private async generateNextWorkoutRecommendations(performance: PerformanceMetrics): Promise<string[]> {
    const recommendations: string[] = [];
    
    if (performance.completionRate > 0.9 && performance.perceivedExertion < 7) {
      recommendations.push('Consider increasing intensity for your next workout');
    }
    
    if (performance.fatigue.overall > 7) {
      recommendations.push('Focus on recovery and lighter intensity next session');
    }
    
    if (performance.perceivedExertion > 8.5) {
      recommendations.push('Allow extra rest day before next workout');
    }
    
    return recommendations;
  }

  private async calculatePerformanceMetrics(workoutSession: WorkoutSession): Promise<PerformanceMetrics> {
    // Calculate comprehensive performance metrics from workout session
    // This would be implemented based on the WorkoutSession structure
    return this.getDefaultPerformance();
  }
}

export default new AdaptiveWorkoutService();
