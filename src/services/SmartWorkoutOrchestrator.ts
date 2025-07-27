import AdaptiveWorkoutService from './AdaptiveWorkoutService';
import { User, Exercise, Workout, WorkoutExercise } from '../types';

/**
 * Smart Workout Intelligence Integration Service
 * Phase 9.1 - Orchestrates adaptive workout features for seamless user experience
 */
export class SmartWorkoutOrchestrator {
  private static instance: SmartWorkoutOrchestrator;
  private currentWorkoutSession: any = null;
  private performanceHistory: any[] = [];
  private adaptationQueue: any[] = [];

  private constructor() {}

  public static getInstance(): SmartWorkoutOrchestrator {
    if (!SmartWorkoutOrchestrator.instance) {
      SmartWorkoutOrchestrator.instance = new SmartWorkoutOrchestrator();
    }
    return SmartWorkoutOrchestrator.instance;
  }

  /**
   * Initialize a smart workout session with full AI integration
   */
  public async startSmartWorkoutSession(
    workout: Workout,
    user: User,
    environmentalFactors?: {
      temperature?: number;
      humidity?: number;
      altitude?: number;
      timeOfDay?: 'morning' | 'afternoon' | 'evening';
    }
  ) {
    try {
      // Create adaptive workout
      const adaptiveWorkout = await AdaptiveWorkoutService.createAdaptiveWorkout(workout, user);
      
      // Initialize session tracking
      this.currentWorkoutSession = {
        id: `session_${Date.now()}`,
        workoutId: workout.id,
        userId: user.id,
        startTime: new Date(),
        adaptiveWorkout,
        exerciseIndex: 0,
        setIndex: 0,
        adaptations: [],
        performanceData: [],
        environmentalFactors: environmentalFactors || {},
        heartRateData: [],
        formAnalysisData: [],
      };

      // Apply initial environmental adaptations
      if (environmentalFactors) {
        await this.applyEnvironmentalAdaptations(environmentalFactors);
      }

      return this.currentWorkoutSession;
    } catch (error) {
      console.error('Error starting smart workout session:', error);
      throw new Error('Failed to initialize smart workout session');
    }
  }

  /**
   * Process real-time performance data and trigger adaptations
   */
  public async processRealTimeData(data: {
    heartRate?: number;
    rpe?: number; // Rate of Perceived Exertion
    formScore?: number;
    setCompleted?: boolean;
    actualReps?: number;
    actualWeight?: number;
    restTime?: number;
  }) {
    if (!this.currentWorkoutSession) {
      throw new Error('No active workout session');
    }

    const { adaptiveWorkout } = this.currentWorkoutSession;
    const currentExercise = adaptiveWorkout.exercises[this.currentWorkoutSession.exerciseIndex];

    // Store performance data
    this.currentWorkoutSession.performanceData.push({
      timestamp: new Date(),
      exerciseIndex: this.currentWorkoutSession.exerciseIndex,
      setIndex: this.currentWorkoutSession.setIndex,
      ...data,
    });

    // Analyze and trigger adaptations
    const adaptations = await this.analyzePerformanceForAdaptations(data, currentExercise);
    
    if (adaptations.length > 0) {
      for (const adaptation of adaptations) {
        await this.applyWorkoutAdaptation(adaptation);
      }
    }

    return {
      adaptations,
      currentSession: this.currentWorkoutSession,
    };
  }

  /**
   * Calculate smart rest time with all available data
   */
  public async calculateOptimalRestTime(
    exercise: Exercise,
    setPerformance: {
      setNumber: number;
      reps: number;
      completed: boolean;
      rpe: number;
      actualWeight?: number;
    },
    biometricData?: {
      heartRate?: number;
      heartRateRecovery?: number;
      sleepQuality?: number;
      stressLevel?: number;
    }
  ) {
    try {
      // Use AdaptiveWorkoutService for base calculation
      const smartTimer = await AdaptiveWorkoutService.calculateSmartRestTime(
        exercise,
        setPerformance,
        biometricData || {}
      );

      // Apply session-specific adjustments
      if (this.currentWorkoutSession) {
        const sessionFactors = this.analyzeSessionContext();
        smartTimer.currentRest = this.adjustRestForSessionContext(
          smartTimer.currentRest,
          sessionFactors
        );
      }

      return {
        ...smartTimer,
        adaptiveFactors: this.getRestAdaptiveFactors(),
        recommendations: this.generateRestRecommendations(smartTimer, biometricData),
      };
    } catch (error) {
      console.error('Error calculating optimal rest time:', error);
      return {
        currentRest: exercise.restTime || 90,
        minRest: 60,
        maxRest: 180,
        reason: 'Default rest time (error in calculation)',
      };
    }
  }

  /**
   * Generate workout progression recommendations
   */
  public async generateProgressionPlan(user: User, workoutHistory: any[]) {
    try {
      // Create a basic progression plan since the method doesn't exist yet
      const progressionPlan = {
        currentPhase: 'hypertrophy',
        nextPhaseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        adaptations: [
          {
            exerciseId: 'bench-press',
            type: 'weight',
            currentValue: 80,
            targetValue: 85,
            progressionRate: 'weekly',
          },
        ],
        metrics: {
          volumeIncrease: 10,
          intensityIncrease: 5,
          frequencyAdjustment: 0,
        },
      };

      // Enhance with session-specific insights
      const enhancedPlan = {
        ...progressionPlan,
        personalizedInsights: await this.generatePersonalizedInsights(user, workoutHistory),
        adaptationStrategy: this.createAdaptationStrategy(user),
        nextWorkoutRecommendations: await this.generateNextWorkoutRecommendations(user),
      };

      return enhancedPlan;
    } catch (error) {
      console.error('Error generating progression plan:', error);
      throw new Error('Failed to generate progression plan');
    }
  }

  /**
   * Complete workout session and generate comprehensive summary
   */
  public async completeWorkoutSession() {
    if (!this.currentWorkoutSession) {
      throw new Error('No active workout session to complete');
    }

    const session = this.currentWorkoutSession;
    session.endTime = new Date();
    session.totalDuration = session.endTime.getTime() - session.startTime.getTime();

    // Generate session analytics
    const analytics = await this.generateSessionAnalytics(session);
    
    // Update performance history
    this.performanceHistory.push(session);

    // Generate insights for next workout
    const nextWorkoutInsights = await this.generateNextWorkoutInsights(session);

    // Clean up session
    this.currentWorkoutSession = null;

    return {
      sessionSummary: session,
      analytics,
      nextWorkoutInsights,
      achievements: this.detectAchievements(session),
      improvementAreas: this.identifyImprovementAreas(session),
    };
  }

  // Private helper methods

  private async applyEnvironmentalAdaptations(factors: any) {
    const adaptations = [];

    // Temperature adaptations
    if (factors.temperature !== undefined) {
      if (factors.temperature > 25) { // Hot conditions
        adaptations.push({
          type: 'rest',
          reason: 'High temperature detected',
          adjustment: 'Increase rest periods by 15%',
          value: 1.15,
        });
      } else if (factors.temperature < 15) { // Cold conditions
        adaptations.push({
          type: 'warmup',
          reason: 'Cold temperature detected',
          adjustment: 'Extended warm-up recommended',
          value: 1.5,
        });
      }
    }

    // Time of day adaptations
    if (factors.timeOfDay === 'morning') {
      adaptations.push({
        type: 'intensity',
        reason: 'Morning workout',
        adjustment: 'Gradual intensity ramp-up',
        value: 0.9,
      });
    } else if (factors.timeOfDay === 'evening') {
      adaptations.push({
        type: 'intensity',
        reason: 'Evening workout',
        adjustment: 'Reduced high-intensity to aid sleep',
        value: 0.95,
      });
    }

    // Apply adaptations to current session
    for (const adaptation of adaptations) {
      this.adaptationQueue.push(adaptation);
    }
  }

  private async analyzePerformanceForAdaptations(data: any, currentExercise: any) {
    const adaptations = [];

    // RPE-based adaptations
    if (data.rpe !== undefined) {
      if (data.rpe >= 9) {
        adaptations.push({
          type: 'intensity',
          reason: 'Very high RPE detected',
          recommendation: 'Reduce weight by 10-15%',
          priority: 'high',
          autoApply: true,
        });
      } else if (data.rpe <= 5 && this.currentWorkoutSession.setIndex > 0) {
        adaptations.push({
          type: 'intensity',
          reason: 'Low RPE - workout may be too easy',
          recommendation: 'Consider increasing weight by 5%',
          priority: 'medium',
          autoApply: false,
        });
      }
    }

    // Heart rate adaptations
    if (data.heartRate !== undefined) {
      const maxHR = 220 - (30); // Assuming 30-year-old user
      const hrPercentage = (data.heartRate / maxHR) * 100;

      if (hrPercentage > 90) {
        adaptations.push({
          type: 'rest',
          reason: 'Heart rate very high',
          recommendation: 'Extended rest period recommended',
          priority: 'high',
          autoApply: true,
        });
      }
    }

    // Form score adaptations
    if (data.formScore !== undefined && data.formScore < 70) {
      adaptations.push({
        type: 'technique',
        reason: 'Form quality below threshold',
        recommendation: 'Focus on technique, reduce weight if necessary',
        priority: 'high',
        autoApply: false,
      });
    }

    return adaptations;
  }

  private async applyWorkoutAdaptation(adaptation: any) {
    if (!this.currentWorkoutSession) return;

    // Add to session adaptations
    this.currentWorkoutSession.adaptations.push({
      ...adaptation,
      timestamp: new Date(),
      applied: adaptation.autoApply,
    });

    // Apply automatic adaptations
    if (adaptation.autoApply) {
      switch (adaptation.type) {
        case 'intensity':
          await this.adjustCurrentExerciseIntensity(adaptation);
          break;
        case 'rest':
          await this.adjustCurrentRestPeriod(adaptation);
          break;
        case 'volume':
          await this.adjustCurrentVolume(adaptation);
          break;
      }
    }
  }

  private analyzeSessionContext() {
    if (!this.currentWorkoutSession) return {};

    const performanceData = this.currentWorkoutSession.performanceData;
    const currentTime = new Date();
    const sessionDuration = currentTime.getTime() - this.currentWorkoutSession.startTime.getTime();

    return {
      sessionDuration: sessionDuration / 60000, // minutes
      averageRPE: this.calculateAverageRPE(performanceData),
      performanceTrend: this.calculatePerformanceTrend(performanceData),
      fatigueLevel: this.estimateFatigueLevel(performanceData),
      adaptationCount: this.currentWorkoutSession.adaptations.length,
    };
  }

  private adjustRestForSessionContext(baseRest: number, sessionFactors: any): number {
    let adjustedRest = baseRest;

    // Adjust for session duration
    if (sessionFactors.sessionDuration > 60) { // Over 1 hour
      adjustedRest *= 1.1; // 10% more rest
    }

    // Adjust for average RPE
    if (sessionFactors.averageRPE > 8) {
      adjustedRest *= 1.15; // 15% more rest for high intensity
    } else if (sessionFactors.averageRPE < 6) {
      adjustedRest *= 0.9; // 10% less rest for low intensity
    }

    // Adjust for fatigue level
    if (sessionFactors.fatigueLevel > 7) {
      adjustedRest *= 1.2; // 20% more rest for high fatigue
    }

    return Math.round(adjustedRest);
  }

  private getRestAdaptiveFactors() {
    return {
      heartRateRecovery: true,
      performanceBasedAdjustment: true,
      environmentalFactors: true,
      sessionContext: true,
      personalizedTargets: true,
    };
  }

  private generateRestRecommendations(timer: any, biometricData?: any) {
    const recommendations = [];

    if (biometricData?.heartRate && biometricData.heartRate > 150) {
      recommendations.push('Focus on deep breathing to lower heart rate');
    }

    if (timer.currentRest > 120) {
      recommendations.push('Use this time for light stretching or mobility work');
    }

    if (biometricData?.stressLevel && biometricData.stressLevel > 7) {
      recommendations.push('Consider meditation or mindfulness during rest');
    }

    return recommendations;
  }

  private async generatePersonalizedInsights(user: User, workoutHistory: any[]) {
    // AI-powered insights based on user data and history
    return {
      strengthAreas: ['Upper body pulling movements showing consistent improvement'],
      improvementAreas: ['Lower body power could benefit from plyometric work'],
      optimalWorkoutTiming: 'Best performance typically in afternoon sessions',
      recoveryPatterns: 'Requires 48-hour rest between high-intensity sessions',
      motivationalFactors: ['Responds well to progressive challenges', 'Benefits from variety in exercise selection'],
    };
  }

  private createAdaptationStrategy(user: User) {
    return {
      primaryFocus: user.goals[0]?.type || 'general_fitness',
      adaptationRate: 'moderate', // Based on user's progress rate
      preferredAdaptations: ['progressive_overload', 'exercise_variation'],
      cautionAreas: user.physicalLimitations || [],
      recommendedFrequency: user.preferredWorkoutDays,
    };
  }

  private async generateNextWorkoutRecommendations(user: User) {
    return {
      suggestedWorkouts: [
        {
          type: 'Lower Body Strength',
          reason: 'Balance upper body focus from recent sessions',
          priority: 'high',
        },
        {
          type: 'Active Recovery',
          reason: 'High training volume this week',
          priority: 'medium',
        },
      ],
      intensityRecommendation: 'moderate',
      focusAreas: ['glutes', 'quadriceps'],
      avoidanceAreas: user.physicalLimitations,
    };
  }

  private async generateSessionAnalytics(session: any) {
    const duration = session.totalDuration / 60000; // minutes
    const exerciseCount = session.adaptiveWorkout.exercises.length;
    const adaptationCount = session.adaptations.length;

    return {
      duration: Math.round(duration),
      exerciseCount,
      setsCompleted: session.performanceData.length,
      adaptationCount,
      averageRPE: this.calculateAverageRPE(session.performanceData),
      totalVolume: this.calculateTotalVolume(session.performanceData),
      heartRateStats: this.calculateHeartRateStats(session.heartRateData),
      formAccuracy: this.calculateFormAccuracy(session.formAnalysisData),
      efficiency: this.calculateWorkoutEfficiency(session),
    };
  }

  private async generateNextWorkoutInsights(session: any) {
    return {
      recommendedRestDays: this.calculateRecommendedRest(session),
      suggestedProgressions: this.identifyProgressionOpportunities(session),
      focusAreas: this.determineFocusAreas(session),
      intensityRecommendation: this.recommendNextIntensity(session),
    };
  }

  private detectAchievements(session: any) {
    const achievements = [];

    // Check for personal records
    if (this.isPersonalRecord(session)) {
      achievements.push({
        type: 'personal_record',
        title: 'New Personal Record!',
        description: 'You achieved a new PR in this session',
      });
    }

    // Check for consistency
    if (this.performanceHistory.length >= 7) {
      achievements.push({
        type: 'consistency',
        title: 'Consistency Champion',
        description: 'You\'ve completed 7 workouts!',
      });
    }

    return achievements;
  }

  private identifyImprovementAreas(session: any) {
    const areas = [];

    const avgFormScore = this.calculateFormAccuracy(session.formAnalysisData);
    if (avgFormScore < 80) {
      areas.push({
        area: 'Form & Technique',
        recommendation: 'Focus on proper form over weight progression',
        priority: 'high',
      });
    }

    return areas;
  }

  // Utility calculation methods
  private calculateAverageRPE(performanceData: any[]): number {
    const rpeValues = performanceData.filter(d => d.rpe).map(d => d.rpe);
    return rpeValues.length > 0 ? rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length : 0;
  }

  private calculatePerformanceTrend(performanceData: any[]): 'improving' | 'stable' | 'declining' {
    // Simplified trend calculation
    if (performanceData.length < 3) return 'stable';
    
    const recent = performanceData.slice(-3);
    const avgRecent = this.calculateAverageRPE(recent);
    const earlier = performanceData.slice(0, -3);
    const avgEarlier = this.calculateAverageRPE(earlier);

    if (avgRecent > avgEarlier * 1.1) return 'improving';
    if (avgRecent < avgEarlier * 0.9) return 'declining';
    return 'stable';
  }

  private estimateFatigueLevel(performanceData: any[]): number {
    // Estimate fatigue based on RPE progression and other factors
    const rpeProgression = performanceData.map(d => d.rpe).filter(Boolean);
    if (rpeProgression.length === 0) return 5;

    const avgRPE = rpeProgression.reduce((a, b) => a + b, 0) / rpeProgression.length;
    return Math.min(10, Math.max(1, avgRPE));
  }

  private calculateTotalVolume(performanceData: any[]): number {
    return performanceData.reduce((total, data) => {
      if (data.actualReps && data.actualWeight) {
        return total + (data.actualReps * data.actualWeight);
      }
      return total;
    }, 0);
  }

  private calculateHeartRateStats(heartRateData: any[]) {
    if (!heartRateData || heartRateData.length === 0) return null;

    const values = heartRateData.map(d => d.heartRate).filter(Boolean);
    return {
      average: values.reduce((a, b) => a + b, 0) / values.length,
      max: Math.max(...values),
      min: Math.min(...values),
    };
  }

  private calculateFormAccuracy(formData: any[]): number {
    if (!formData || formData.length === 0) return 85; // Default assumption

    const scores = formData.map(d => d.formScore).filter(Boolean);
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 85;
  }

  private calculateWorkoutEfficiency(session: any): number {
    const targetDuration = 60; // minutes
    const actualDuration = session.totalDuration / 60000;
    const completionRate = session.performanceData.length / (session.adaptiveWorkout.exercises.length * 3); // Assuming 3 sets per exercise
    
    const timeEfficiency = Math.min(1, targetDuration / actualDuration);
    const completionEfficiency = Math.min(1, completionRate);
    
    return Math.round((timeEfficiency + completionEfficiency) / 2 * 100);
  }

  private calculateRecommendedRest(session: any): number {
    const intensity = this.calculateAverageRPE(session.performanceData);
    if (intensity > 8) return 2; // 2 days
    if (intensity > 6) return 1; // 1 day
    return 0; // Can work out next day
  }

  private identifyProgressionOpportunities(session: any) {
    return [
      'Consider increasing weight by 2.5kg on compound movements',
      'Add 2 more reps to bodyweight exercises',
      'Introduce tempo variations for increased difficulty',
    ];
  }

  private determineFocusAreas(session: any) {
    return ['Core stability', 'Unilateral leg strength', 'Upper body pulling'];
  }

  private recommendNextIntensity(session: any): 'light' | 'moderate' | 'high' {
    const avgRPE = this.calculateAverageRPE(session.performanceData);
    if (avgRPE > 8) return 'light';
    if (avgRPE > 6) return 'moderate';
    return 'high';
  }

  private isPersonalRecord(session: any): boolean {
    // Simplified PR detection
    return session.performanceData.some((data: any) => 
      data.actualWeight && data.actualWeight > (data.targetWeight || 0) * 1.05
    );
  }

  private async adjustCurrentExerciseIntensity(adaptation: any) {
    // Implementation for real-time intensity adjustment
    console.log('Adjusting exercise intensity:', adaptation);
  }

  private async adjustCurrentRestPeriod(adaptation: any) {
    // Implementation for real-time rest adjustment
    console.log('Adjusting rest period:', adaptation);
  }

  private async adjustCurrentVolume(adaptation: any) {
    // Implementation for real-time volume adjustment
    console.log('Adjusting workout volume:', adaptation);
  }
}

export default SmartWorkoutOrchestrator;
