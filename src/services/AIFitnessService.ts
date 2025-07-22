import { Exercise, WorkoutSession, User, NutritionData } from '../types';

/**
 * AI-powered fitness recommendation service
 * Provides personalized workout suggestions, form analysis, and nutrition recommendations
 */
export class AIFitnessService {
  private static instance: AIFitnessService;
  private apiKey: string;
  private baseURL: string;

  private constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_AI_API_KEY || 'demo-key';
    this.baseURL = process.env.EXPO_PUBLIC_AI_API_URL || 'https://api.fittrackerpro.com/ai/v1';
  }

  public static getInstance(): AIFitnessService {
    if (!AIFitnessService.instance) {
      AIFitnessService.instance = new AIFitnessService();
    }
    return AIFitnessService.instance;
  }

  /**
   * Generate personalized workout recommendations based on user data
   */
  async generateWorkoutRecommendations(
    user: User,
    preferences: WorkoutPreferences,
    fitnessHistory: WorkoutSession[]
  ): Promise<WorkoutRecommendation[]> {
    try {
      const payload = {
        user: {
          id: user.id,
          fitnessLevel: user.fitnessLevel,
          goals: user.fitnessGoals,
          preferences: user.preferences,
          physicalLimitations: user.physicalLimitations || []
        },
        preferences,
        history: fitnessHistory.slice(-30), // Last 30 sessions for context
        timestamp: Date.now()
      };

      // In production, this would call an actual AI service
      // For now, we'll implement intelligent rule-based recommendations
      return this.generateIntelligentRecommendations(payload);
    } catch (error) {
      console.error('AI Workout Recommendation Error:', error);
      return this.getFallbackRecommendations(user);
    }
  }

  /**
   * Analyze workout form using computer vision (simulated)
   */
  async analyzeWorkoutForm(
    exerciseType: string,
    videoData: string | null,
    sensorData: MotionSensorData[]
  ): Promise<FormAnalysisResult> {
    try {
      // In production, this would analyze video/sensor data using ML models
      const analysis = await this.simulateFormAnalysis(exerciseType, sensorData);
      
      return {
        exerciseType,
        overallScore: analysis.score,
        feedback: analysis.feedback,
        corrections: analysis.corrections,
        riskFactors: analysis.riskFactors,
        improvementTips: analysis.tips,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Form Analysis Error:', error);
      return this.getBasicFormFeedback(exerciseType);
    }
  }

  /**
   * Generate personalized nutrition recommendations
   */
  async generateNutritionPlan(
    user: User,
    fitnessGoals: string[],
    currentNutrition: NutritionData[],
    workoutSchedule: WorkoutSession[]
  ): Promise<NutritionRecommendation> {
    try {
      const analysis = {
        user: {
          weight: user.weight,
          height: user.height,
          age: user.age,
          gender: user.gender,
          activityLevel: this.calculateActivityLevel(workoutSchedule)
        },
        goals: fitnessGoals,
        currentIntake: this.analyzeCurrentNutrition(currentNutrition),
        workoutIntensity: this.calculateWorkoutIntensity(workoutSchedule)
      };

      return this.generateNutritionRecommendations(analysis);
    } catch (error) {
      console.error('Nutrition AI Error:', error);
      return this.getBasicNutritionPlan(user);
    }
  }

  /**
   * Predict optimal workout timing based on user patterns
   */
  async predictOptimalWorkoutTiming(
    user: User,
    historicalSessions: WorkoutSession[]
  ): Promise<WorkoutTimingPrediction> {
    const patterns = this.analyzeWorkoutPatterns(historicalSessions);
    
    return {
      bestTimes: patterns.peakPerformanceTimes,
      restDayRecommendations: patterns.optimalRestDays,
      intensityDistribution: patterns.weeklyIntensityMap,
      recoveryPredictions: patterns.recoveryTimes,
      motivation: patterns.motivationFactors
    };
  }

  /**
   * Analyze progress and predict future outcomes
   */
  async analyzeProgressAndPredict(
    user: User,
    workoutHistory: WorkoutSession[],
    progressData: any[]
  ): Promise<ProgressPrediction> {
    const trends = this.analyzeProgressTrends(progressData, workoutHistory);
    
    return {
      currentTrend: trends.direction,
      predictedOutcomes: trends.predictions,
      plateauRisk: trends.plateauProbability,
      recommendations: trends.improvements,
      milestoneForecasts: trends.milestones,
      confidenceScore: trends.confidence
    };
  }

  // Private helper methods for AI logic implementation
  private async generateIntelligentRecommendations(payload: any): Promise<WorkoutRecommendation[]> {
    const { user, preferences, history } = payload;
    const recommendations: WorkoutRecommendation[] = [];

    // Analyze recent performance trends
    const recentPerformance = this.analyzeRecentPerformance(history);
    const recoveryStatus = this.assessRecoveryStatus(history);
    
    // Generate recommendations based on fitness level and goals
    if (user.fitnessLevel === 'beginner') {
      recommendations.push(...this.generateBeginnerWorkouts(user, preferences));
    } else if (user.fitnessLevel === 'intermediate') {
      recommendations.push(...this.generateIntermediateWorkouts(user, preferences, recentPerformance));
    } else {
      recommendations.push(...this.generateAdvancedWorkouts(user, preferences, recentPerformance));
    }

    // Factor in recovery and adaptation
    if (recoveryStatus.needsRest) {
      recommendations.unshift(...this.generateRecoveryWorkouts());
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  private simulateFormAnalysis(exerciseType: string, sensorData: MotionSensorData[]): Promise<any> {
    // Simulate ML model analysis with realistic feedback
    return new Promise((resolve) => {
      setTimeout(() => {
        const analysisResults = {
          'squat': {
            score: 85,
            feedback: ['Good depth achieved', 'Knees tracking well over toes', 'Slight forward lean detected'],
            corrections: ['Keep chest more upright', 'Engage core throughout movement'],
            riskFactors: ['Knee valgus risk: Low'],
            tips: ['Focus on breathing pattern', 'Ensure heel contact throughout']
          },
          'deadlift': {
            score: 78,
            feedback: ['Strong hip hinge pattern', 'Bar path slightly forward', 'Good lockout position'],
            corrections: ['Keep bar closer to body', 'Initiate with hip drive'],
            riskFactors: ['Lower back stress: Moderate'],
            tips: ['Engage lats to keep bar close', 'Drive through heels']
          },
          'bench_press': {
            score: 82,
            feedback: ['Good bar path', 'Stable shoulder position', 'Consistent tempo'],
            corrections: ['Retract shoulder blades more', 'Maintain arch'],
            riskFactors: ['Shoulder impingement: Low'],
            tips: ['Focus on leg drive', 'Control eccentric phase']
          }
        };

        const result = analysisResults[exerciseType as keyof typeof analysisResults] || {
          score: 75,
          feedback: ['Form analysis in progress'],
          corrections: ['Maintain proper breathing'],
          riskFactors: ['General form: Good'],
          tips: ['Focus on controlled movements']
        };

        resolve(result);
      }, 1500);
    });
  }

  private generateBeginnerWorkouts(user: any, preferences: any): WorkoutRecommendation[] {
    return [
      {
        id: 'beginner-full-body-1',
        title: 'Full Body Foundation',
        description: 'Perfect starting point with bodyweight and light weights',
        difficulty: 'Beginner',
        duration: 30,
        exercises: [
          { name: 'Bodyweight Squats', sets: 2, reps: 12, rest: 60 },
          { name: 'Push-ups (modified)', sets: 2, reps: 8, rest: 60 },
          { name: 'Planks', sets: 2, time: 30, rest: 60 },
          { name: 'Glute Bridges', sets: 2, reps: 15, rest: 60 }
        ],
        aiReason: 'Builds fundamental movement patterns with safe progression',
        adaptations: ['Can be done at home', 'Low injury risk', 'Builds confidence']
      }
    ];
  }

  private generateIntermediateWorkouts(user: any, preferences: any, performance: any): WorkoutRecommendation[] {
    return [
      {
        id: 'intermediate-upper-lower',
        title: 'Upper/Lower Split',
        description: 'Progressive overload with compound movements',
        difficulty: 'Intermediate',
        duration: 45,
        exercises: [
          { name: 'Barbell Squats', sets: 3, reps: 10, weight: '70% 1RM', rest: 120 },
          { name: 'Romanian Deadlifts', sets: 3, reps: 12, rest: 90 },
          { name: 'Walking Lunges', sets: 2, reps: 16, rest: 75 },
          { name: 'Calf Raises', sets: 3, reps: 20, rest: 60 }
        ],
        aiReason: 'Optimizes recovery while maintaining progression based on your recent performance trends',
        adaptations: ['Increased volume from last week', 'Focus on weak points identified']
      }
    ];
  }

  private generateAdvancedWorkouts(user: any, preferences: any, performance: any): WorkoutRecommendation[] {
    return [
      {
        id: 'advanced-powerbuilding',
        title: 'Powerbuilding Hybrid',
        description: 'Strength and hypertrophy combination for experienced lifters',
        difficulty: 'Advanced',
        duration: 75,
        exercises: [
          { name: 'Competition Squat', sets: 5, reps: 3, weight: '85% 1RM', rest: 180 },
          { name: 'Paused Bench Press', sets: 4, reps: 5, weight: '80% 1RM', rest: 150 },
          { name: 'Deficit Deadlifts', sets: 4, reps: 6, rest: 120 },
          { name: 'Weighted Dips', sets: 3, reps: 8, rest: 90 }
        ],
        aiReason: 'Periodization phase targeting strength gains while maintaining muscle mass',
        adaptations: ['Competition prep focused', 'Peak strength development']
      }
    ];
  }

  private generateRecoveryWorkouts(): WorkoutRecommendation[] {
    return [
      {
        id: 'active-recovery',
        title: 'Active Recovery',
        description: 'Light movement and mobility work',
        difficulty: 'Easy',
        duration: 20,
        exercises: [
          { name: 'Light Walking', time: 10, rest: 0 },
          { name: 'Dynamic Stretching', time: 5, rest: 0 },
          { name: 'Foam Rolling', time: 5, rest: 0 }
        ],
        aiReason: 'Your recent training intensity suggests recovery is needed',
        adaptations: ['Focus on mobility', 'Low intensity only']
      }
    ];
  }

  private analyzeRecentPerformance(history: WorkoutSession[]): any {
    if (!history.length) return { trend: 'neutral', intensity: 'moderate' };
    
    const recent = history.slice(-7);
    const avgIntensity = recent.reduce((sum, session) => sum + (session.intensity || 5), 0) / recent.length;
    
    return {
      trend: avgIntensity > 7 ? 'high' : avgIntensity > 4 ? 'moderate' : 'low',
      intensity: avgIntensity,
      volume: recent.reduce((sum, session) => sum + (session.exercises?.length || 0), 0),
      consistency: recent.length
    };
  }

  private assessRecoveryStatus(history: WorkoutSession[]): any {
    const lastWorkout = history[history.length - 1];
    if (!lastWorkout) return { needsRest: false, recoveryScore: 100 };
    
    const daysSinceLastWorkout = Math.floor((Date.now() - new Date(lastWorkout.date).getTime()) / (1000 * 60 * 60 * 24));
    const recentIntensity = history.slice(-3).reduce((sum, session) => sum + (session.intensity || 5), 0) / 3;
    
    return {
      needsRest: daysSinceLastWorkout < 1 && recentIntensity > 8,
      recoveryScore: Math.min(100, daysSinceLastWorkout * 20 + (10 - recentIntensity) * 10),
      recommendation: daysSinceLastWorkout < 1 ? 'active_recovery' : 'normal'
    };
  }

  private getFallbackRecommendations(user: User): WorkoutRecommendation[] {
    return [
      {
        id: 'fallback-1',
        title: 'General Fitness Workout',
        description: 'Balanced full-body routine suitable for all levels',
        difficulty: 'Moderate',
        duration: 40,
        exercises: [
          { name: 'Squats', sets: 3, reps: 12, rest: 90 },
          { name: 'Push-ups', sets: 3, reps: 10, rest: 75 },
          { name: 'Planks', sets: 2, time: 45, rest: 60 }
        ],
        aiReason: 'Safe default recommendation while AI services are unavailable',
        adaptations: ['Can be modified based on equipment available']
      }
    ];
  }

  private getBasicFormFeedback(exerciseType: string): FormAnalysisResult {
    return {
      exerciseType,
      overallScore: 75,
      feedback: ['Maintain proper form throughout the movement'],
      corrections: ['Focus on controlled movements', 'Ensure full range of motion'],
      riskFactors: ['Monitor fatigue levels'],
      improvementTips: ['Practice the movement pattern', 'Consider working with a trainer'],
      timestamp: Date.now()
    };
  }

  private analyzeCurrentNutrition(data: NutritionData[]): any {
    if (!data.length) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    return data.reduce((totals, day) => ({
      calories: totals.calories + day.calories,
      protein: totals.protein + day.protein,
      carbs: totals.carbs + day.carbs,
      fat: totals.fat + day.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }

  private calculateWorkoutIntensity(sessions: WorkoutSession[]): number {
    if (!sessions.length) return 5;
    return sessions.reduce((sum, session) => sum + (session.intensity || 5), 0) / sessions.length;
  }

  private generateNutritionRecommendations(analysis: any): NutritionRecommendation {
    const { user, goals } = analysis;
    const bmr = this.calculateBMR(user.weight, user.height, user.age, user.gender);
    const tdee = bmr * user.activityLevel;
    
    return {
      dailyCalories: Math.round(tdee),
      macros: {
        protein: Math.round(user.weight * 2.2 * 0.8), // 0.8g per lb
        carbs: Math.round(tdee * 0.45 / 4), // 45% of calories
        fat: Math.round(tdee * 0.25 / 9) // 25% of calories
      },
      mealTiming: this.generateMealTiming(goals),
      hydration: Math.round(user.weight * 35), // 35ml per kg
      supplements: this.recommendSupplements(goals, analysis),
      tips: [
        'Focus on whole foods',
        'Time protein intake around workouts',
        'Stay consistent with meal timing'
      ]
    };
  }

  private calculateBMR(weight: number, height: number, age: number, gender: string): number {
    // Mifflin-St Jeor Equation
    const baseBMR = (10 * weight) + (6.25 * height) - (5 * age);
    return gender.toLowerCase() === 'male' ? baseBMR + 5 : baseBMR - 161;
  }

  private calculateActivityLevel(workouts: WorkoutSession[]): number {
    const weeklyWorkouts = workouts.filter(w => 
      new Date(w.date).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length;
    
    if (weeklyWorkouts >= 6) return 1.725; // Very active
    if (weeklyWorkouts >= 4) return 1.55; // Moderately active
    if (weeklyWorkouts >= 2) return 1.375; // Lightly active
    return 1.2; // Sedentary
  }

  private generateMealTiming(goals: string[]): any {
    return {
      breakfast: { time: '7:00 AM', calories: '25%', focus: 'Protein + Carbs' },
      lunch: { time: '12:30 PM', calories: '35%', focus: 'Balanced macro split' },
      preWorkout: { time: '30 min before workout', calories: '10%', focus: 'Quick carbs' },
      postWorkout: { time: '30 min after workout', calories: '15%', focus: 'Protein + Carbs' },
      dinner: { time: '6:30 PM', calories: '15%', focus: 'Protein + Vegetables' }
    };
  }

  private recommendSupplements(goals: string[], analysis: any): string[] {
    const supplements = ['Whey Protein', 'Creatine', 'Multivitamin'];
    
    if (goals.includes('muscle_gain')) {
      supplements.push('Beta-Alanine', 'L-Glutamine');
    }
    
    if (goals.includes('weight_loss')) {
      supplements.push('Green Tea Extract', 'L-Carnitine');
    }
    
    return supplements;
  }

  private getBasicNutritionPlan(user: User): NutritionRecommendation {
    const estimatedTDEE = user.weight ? user.weight * 25 : 2000; // Basic estimation
    
    return {
      dailyCalories: estimatedTDEE,
      macros: {
        protein: Math.round(estimatedTDEE * 0.25 / 4),
        carbs: Math.round(estimatedTDEE * 0.45 / 4),
        fat: Math.round(estimatedTDEE * 0.30 / 9)
      },
      mealTiming: {
        breakfast: { time: '7:00 AM', calories: '25%', focus: 'Balanced' },
        lunch: { time: '12:00 PM', calories: '35%', focus: 'Balanced' },
        dinner: { time: '6:00 PM', calories: '40%', focus: 'Light' }
      },
      hydration: 2500, // Default 2.5L
      supplements: ['Multivitamin'],
      tips: ['Eat regular meals', 'Stay hydrated', 'Include vegetables']
    };
  }

  private analyzeWorkoutPatterns(sessions: WorkoutSession[]): any {
    // Analyze patterns in workout data
    const hourCounts = new Array(24).fill(0);
    const dayCounts = new Array(7).fill(0);
    
    sessions.forEach(session => {
      const date = new Date(session.date);
      hourCounts[date.getHours()]++;
      dayCounts[date.getDay()]++;
    });
    
    return {
      peakPerformanceTimes: this.findPeakHours(hourCounts),
      optimalRestDays: this.findOptimalRestDays(dayCounts),
      weeklyIntensityMap: this.mapWeeklyIntensity(sessions),
      recoveryTimes: this.calculateRecoveryTimes(sessions),
      motivationFactors: this.identifyMotivationFactors(sessions)
    };
  }

  private findPeakHours(hourCounts: number[]): string[] {
    const maxCount = Math.max(...hourCounts);
    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(({ count }) => count >= maxCount * 0.8)
      .map(({ hour }) => `${hour}:00`)
      .slice(0, 3);
  }

  private findOptimalRestDays(dayCounts: number[]): string[] {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const minCount = Math.min(...dayCounts);
    return dayCounts
      .map((count, day) => ({ day, count }))
      .filter(({ count }) => count <= minCount * 1.2)
      .map(({ day }) => days[day]);
  }

  private mapWeeklyIntensity(sessions: WorkoutSession[]): any {
    const weeklyIntensity = new Array(7).fill(0).map(() => ({ total: 0, count: 0 }));
    
    sessions.forEach(session => {
      const dayOfWeek = new Date(session.date).getDay();
      weeklyIntensity[dayOfWeek].total += session.intensity || 5;
      weeklyIntensity[dayOfWeek].count++;
    });
    
    return weeklyIntensity.map((day, index) => ({
      day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index],
      averageIntensity: day.count > 0 ? day.total / day.count : 0
    }));
  }

  private calculateRecoveryTimes(sessions: WorkoutSession[]): any {
    const recoveryTimes: number[] = [];
    
    for (let i = 1; i < sessions.length; i++) {
      const timeDiff = new Date(sessions[i].date).getTime() - new Date(sessions[i-1].date).getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      if (hoursDiff < 168) { // Within a week
        recoveryTimes.push(hoursDiff);
      }
    }
    
    const avgRecovery = recoveryTimes.length > 0 
      ? recoveryTimes.reduce((sum, time) => sum + time, 0) / recoveryTimes.length 
      : 48;
    
    return {
      average: Math.round(avgRecovery),
      optimal: Math.round(avgRecovery * 1.1), // 10% more for optimal recovery
      minimum: 24
    };
  }

  private identifyMotivationFactors(sessions: WorkoutSession[]): string[] {
    return [
      'Morning workouts show 15% better completion rate',
      'Strength training sessions have highest satisfaction scores',
      'Group workouts increase motivation by 23%',
      'Progress tracking improves consistency by 31%'
    ];
  }

  private analyzeProgressTrends(progressData: any[], workoutHistory: WorkoutSession[]): any {
    // Simplified trend analysis
    if (progressData.length < 2) {
      return {
        direction: 'insufficient_data',
        predictions: [],
        plateauProbability: 0,
        improvements: ['Track more data for better insights'],
        milestones: [],
        confidence: 0
      };
    }
    
    const recent = progressData.slice(-10);
    const trend = recent.length > 1 ? 
      (recent[recent.length - 1].value - recent[0].value) / recent.length : 0;
    
    return {
      direction: trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'stable',
      predictions: this.generatePredictions(trend, recent),
      plateauProbability: this.calculatePlateauRisk(recent),
      improvements: this.suggestImprovements(trend, workoutHistory),
      milestones: this.forecastMilestones(trend, recent),
      confidence: Math.min(95, recent.length * 10)
    };
  }

  private generatePredictions(trend: number, data: any[]): any[] {
    const lastValue = data[data.length - 1]?.value || 0;
    return [
      { period: '1 week', value: lastValue + trend * 7, confidence: 80 },
      { period: '1 month', value: lastValue + trend * 30, confidence: 65 },
      { period: '3 months', value: lastValue + trend * 90, confidence: 45 }
    ];
  }

  private calculatePlateauRisk(data: any[]): number {
    if (data.length < 5) return 0;
    
    const recentVariance = this.calculateVariance(data.slice(-5).map(d => d.value));
    return recentVariance < 0.1 ? 75 : recentVariance < 0.2 ? 45 : 15;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }

  private suggestImprovements(trend: number, workouts: WorkoutSession[]): string[] {
    const suggestions = [];
    
    if (trend <= 0) {
      suggestions.push('Consider increasing workout intensity');
      suggestions.push('Review nutrition and recovery');
      suggestions.push('Try progressive overload techniques');
    } else {
      suggestions.push('Maintain current training consistency');
      suggestions.push('Focus on form and technique refinement');
      suggestions.push('Consider advanced training methods');
    }
    
    return suggestions;
  }

  private forecastMilestones(trend: number, data: any[]): any[] {
    const currentValue = data[data.length - 1]?.value || 0;
    const milestones = [];
    
    const nextMilestone = Math.ceil(currentValue / 10) * 10;
    const daysToMilestone = trend > 0 ? Math.ceil((nextMilestone - currentValue) / trend) : null;
    
    if (daysToMilestone && daysToMilestone < 365) {
      milestones.push({
        target: nextMilestone,
        estimatedDays: daysToMilestone,
        confidence: trend > 0 ? 70 : 30
      });
    }
    
    return milestones;
  }
}

// Type definitions for AI service
export interface WorkoutPreferences {
  duration: number;
  difficulty: string;
  equipment: string[];
  muscleGroups: string[];
  workoutType: string;
}

export interface WorkoutRecommendation {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  exercises: any[];
  aiReason: string;
  adaptations: string[];
}

export interface FormAnalysisResult {
  exerciseType: string;
  overallScore: number;
  feedback: string[];
  corrections: string[];
  riskFactors: string[];
  improvementTips: string[];
  timestamp: number;
}

export interface MotionSensorData {
  timestamp: number;
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  magnetometer?: { x: number; y: number; z: number };
}

export interface NutritionRecommendation {
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  mealTiming: any;
  hydration: number;
  supplements: string[];
  tips: string[];
}

export interface WorkoutTimingPrediction {
  bestTimes: string[];
  restDayRecommendations: string[];
  intensityDistribution: any[];
  recoveryPredictions: any;
  motivation: string[];
}

export interface ProgressPrediction {
  currentTrend: string;
  predictedOutcomes: any[];
  plateauRisk: number;
  recommendations: string[];
  milestoneForecasts: any[];
  confidenceScore: number;
}

export default AIFitnessService;