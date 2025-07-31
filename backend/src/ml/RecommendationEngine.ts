import { UserWorkoutHistory, WorkoutRecommendationRequest, WorkoutRecommendation, RecommendedExercise } from '../services/ai/WorkoutRecommendationService';

export interface MLRecommendationInput {
  userHistory: UserWorkoutHistory;
  request: WorkoutRecommendationRequest;
  userProfile: any;
}

export interface FeedbackData {
  recommendationId: string;
  userId: string;
  feedback: {
    rating: number;
    completed: boolean;
    difficulty: 'too_easy' | 'just_right' | 'too_hard';
    timeAccurate: boolean;
    exerciseReplacements?: string[];
    comments?: string;
  };
  timestamp: Date;
}

export class RecommendationEngine {
  private exerciseDatabase: ExerciseTemplate[];
  private userFeedbackHistory: Map<string, FeedbackData[]>;

  constructor() {
    this.exerciseDatabase = this.initializeExerciseDatabase();
    this.userFeedbackHistory = new Map();
  }

  /**
   * Generate ML-based workout recommendations
   */
  async generateRecommendations(input: MLRecommendationInput): Promise<Partial<WorkoutRecommendation>[]> {
    const { userHistory, request, userProfile } = input;

    try {
      // 1. Filter exercises based on constraints
      const availableExercises = this.filterExercisesByConstraints(request);

      // 2. Generate multiple workout combinations
      const workoutCombinations = this.generateWorkoutCombinations(
        availableExercises,
        request,
        userHistory
      );

      // 3. Score and rank combinations
      const scoredWorkouts = workoutCombinations.map(workout => ({
        ...workout,
        score: this.calculateWorkoutScore(workout, userHistory, request)
      }));

      // 4. Return top recommendations
      return scoredWorkouts
        .sort((a, b) => b.score - a.score)
        .slice(0, 8) // Generate 8 options for AI to enhance and filter
        .map(workout => this.formatRecommendation(workout, request));

    } catch (error) {
      console.error('Error in ML recommendation generation:', error);
      return this.getFallbackRecommendations(request);
    }
  }

  /**
   * Filter exercises based on user constraints
   */
  private filterExercisesByConstraints(request: WorkoutRecommendationRequest): ExerciseTemplate[] {
    return this.exerciseDatabase.filter(exercise => {
      // Equipment check
      if (request.equipment) {
        const hasRequiredEquipment = exercise.equipment.every(eq => 
          request.equipment!.includes(eq) || eq === 'bodyweight'
        );
        if (!hasRequiredEquipment) return false;
      }

      // Muscle group targeting
      if (request.targetMuscleGroups) {
        const targetsMuscle = exercise.muscleGroups.some(mg => 
          request.targetMuscleGroups!.includes(mg)
        );
        if (!targetsMuscle) return false;
      }

      // Excluded exercises
      if (request.excludeExercises) {
        if (request.excludeExercises.includes(exercise.id)) return false;
      }

      return true;
    });
  }

  /**
   * Generate multiple workout combinations
   */
  private generateWorkoutCombinations(
    exercises: ExerciseTemplate[],
    request: WorkoutRecommendationRequest,
    userHistory: UserWorkoutHistory
  ): WorkoutCombination[] {
    const combinations: WorkoutCombination[] = [];
    const targetDuration = request.timeAvailable;

    // Generate different workout structures
    const structures = this.getWorkoutStructures(request.fitnessGoal, targetDuration);

    for (const structure of structures) {
      try {
        const combination = this.buildWorkoutFromStructure(structure, exercises, request);
        if (combination && this.isValidWorkout(combination, request)) {
          combinations.push(combination);
        }
      } catch (error) {
        console.error('Error building workout combination:', error);
      }
    }

    return combinations;
  }

  /**
   * Get workout structures based on fitness goal
   */
  private getWorkoutStructures(fitnessGoal: string, duration: number): WorkoutStructure[] {
    const structures: WorkoutStructure[] = [];

    switch (fitnessGoal) {
      case 'strength':
        structures.push(
          {
            name: 'Compound Strength',
            warmupTime: 5,
            mainTime: duration - 10,
            cooldownTime: 5,
            exerciseCount: Math.min(5, Math.floor(duration / 8)),
            focusAreas: ['compound_movements'],
            intensity: 'high'
          },
          {
            name: 'Progressive Overload',
            warmupTime: 8,
            mainTime: duration - 12,
            cooldownTime: 4,
            exerciseCount: Math.min(4, Math.floor(duration / 10)),
            focusAreas: ['progressive_loading'],
            intensity: 'high'
          }
        );
        break;

      case 'muscle_gain':
        structures.push(
          {
            name: 'Hypertrophy Focus',
            warmupTime: 5,
            mainTime: duration - 8,
            cooldownTime: 3,
            exerciseCount: Math.min(6, Math.floor(duration / 7)),
            focusAreas: ['volume_training'],
            intensity: 'moderate'
          },
          {
            name: 'Muscle Building',
            warmupTime: 6,
            mainTime: duration - 10,
            cooldownTime: 4,
            exerciseCount: Math.min(5, Math.floor(duration / 8)),
            focusAreas: ['isolation_compound'],
            intensity: 'moderate'
          }
        );
        break;

      case 'weight_loss':
        structures.push(
          {
            name: 'HIIT Circuit',
            warmupTime: 5,
            mainTime: duration - 8,
            cooldownTime: 3,
            exerciseCount: Math.min(8, Math.floor(duration / 5)),
            focusAreas: ['cardio_strength'],
            intensity: 'high'
          },
          {
            name: 'Fat Burning',
            warmupTime: 4,
            mainTime: duration - 7,
            cooldownTime: 3,
            exerciseCount: Math.min(7, Math.floor(duration / 6)),
            focusAreas: ['metabolic_training'],
            intensity: 'moderate'
          }
        );
        break;

      case 'endurance':
        structures.push(
          {
            name: 'Cardio Endurance',
            warmupTime: 8,
            mainTime: duration - 12,
            cooldownTime: 4,
            exerciseCount: Math.min(6, Math.floor(duration / 8)),
            focusAreas: ['cardiovascular'],
            intensity: 'moderate'
          }
        );
        break;

      default:
        structures.push(
          {
            name: 'Balanced Fitness',
            warmupTime: 5,
            mainTime: duration - 8,
            cooldownTime: 3,
            exerciseCount: Math.min(6, Math.floor(duration / 7)),
            focusAreas: ['general_fitness'],
            intensity: 'moderate'
          }
        );
    }

    return structures;
  }

  /**
   * Build workout from structure template
   */
  private buildWorkoutFromStructure(
    structure: WorkoutStructure,
    exercises: ExerciseTemplate[],
    request: WorkoutRecommendationRequest
  ): WorkoutCombination | null {
    try {
      // Select exercises based on structure focus
      const selectedExercises = this.selectExercisesForStructure(
        structure,
        exercises,
        request
      );

      if (selectedExercises.length < 3) {
        return null; // Not enough exercises for a valid workout
      }

      // Calculate sets and reps based on goal and time
      const workoutExercises = selectedExercises.map(exercise => 
        this.calculateExerciseParameters(exercise, structure, request)
      );

      return {
        id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: this.generateWorkoutTitle(structure, request),
        description: this.generateWorkoutDescription(structure, workoutExercises),
        structure,
        exercises: workoutExercises,
        estimatedDuration: this.calculateTotalDuration(workoutExercises, structure),
        difficulty: this.determineDifficulty(workoutExercises, structure),
        score: 0 // Will be calculated later
      };
    } catch (error) {
      console.error('Error building workout from structure:', error);
      return null;
    }
  }

  /**
   * Select exercises for a specific workout structure
   */
  private selectExercisesForStructure(
    structure: WorkoutStructure,
    exercises: ExerciseTemplate[],
    request: WorkoutRecommendationRequest
  ): ExerciseTemplate[] {
    const selected: ExerciseTemplate[] = [];
    const targetCount = structure.exerciseCount;

    // Ensure muscle group balance
    const muscleGroups = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
    const exercisesByMuscle = new Map<string, ExerciseTemplate[]>();

    // Group exercises by primary muscle group
    for (const exercise of exercises) {
      const primaryMuscle = exercise.muscleGroups[0];
      if (!exercisesByMuscle.has(primaryMuscle)) {
        exercisesByMuscle.set(primaryMuscle, []);
      }
      exercisesByMuscle.get(primaryMuscle)!.push(exercise);
    }

    // Select balanced set of exercises
    const muscleGroupsNeeded = request.targetMuscleGroups || muscleGroups;
    for (let i = 0; i < targetCount && selected.length < targetCount; i++) {
      const targetMuscle = muscleGroupsNeeded[i % muscleGroupsNeeded.length];
      const availableExercises = exercisesByMuscle.get(targetMuscle) || [];
      
      if (availableExercises.length > 0) {
        // Select exercise not already chosen
        const unselected = availableExercises.filter(ex => 
          !selected.some(sel => sel.id === ex.id)
        );
        
        if (unselected.length > 0) {
          // Pick best exercise for this slot
          const bestExercise = this.selectBestExercise(unselected, structure, request);
          selected.push(bestExercise);
        }
      }
    }

    return selected;
  }

  /**
   * Select best exercise from options
   */
  private selectBestExercise(
    exercises: ExerciseTemplate[],
    structure: WorkoutStructure,
    request: WorkoutRecommendationRequest
  ): ExerciseTemplate {
    // Score exercises based on multiple criteria
    const scored = exercises.map(exercise => ({
      exercise,
      score: this.scoreExerciseForStructure(exercise, structure, request)
    }));

    // Return highest scoring exercise
    scored.sort((a, b) => b.score - a.score);
    return scored[0].exercise;
  }

  /**
   * Score exercise for structure compatibility
   */
  private scoreExerciseForStructure(
    exercise: ExerciseTemplate,
    structure: WorkoutStructure,
    request: WorkoutRecommendationRequest
  ): number {
    let score = 0;

    // Base effectiveness score
    score += exercise.effectiveness || 7;

    // Equipment preference match
    if (request.equipment) {
      const hasPreferredEquipment = exercise.equipment.some(eq => 
        request.equipment!.includes(eq)
      );
      if (hasPreferredEquipment) score += 2;
    }

    // Intensity match
    const intensityMap: Record<string, number> = { low: 1, moderate: 2, high: 3 };
    const requestIntensity = intensityMap[request.preferredIntensity as keyof typeof intensityMap];
    const exerciseIntensity = exercise.intensity;
    const intensityDiff = Math.abs(requestIntensity - exerciseIntensity);
    score += Math.max(0, 3 - intensityDiff);

    // Focus area alignment
    if (structure.focusAreas.some(focus => exercise.categories.includes(focus))) {
      score += 3;
    }

    return score;
  }

  /**
   * Calculate exercise parameters (sets, reps, rest)
   */
  private calculateExerciseParameters(
    exercise: ExerciseTemplate,
    structure: WorkoutStructure,
    request: WorkoutRecommendationRequest
  ): RecommendedExercise {
    const goal = request.fitnessGoal;
    const intensity = request.preferredIntensity;

    let sets = 3;
    let reps = '8-12';
    let restTime = 60;

    // Adjust based on fitness goal
    switch (goal) {
      case 'strength':
        sets = 4;
        reps = '4-6';
        restTime = 90;
        break;
      case 'muscle_gain':
        sets = 3;
        reps = '8-12';
        restTime = 75;
        break;
      case 'weight_loss':
        sets = 3;
        reps = '12-15';
        restTime = 45;
        break;
      case 'endurance':
        sets = 2;
        reps = '15-20';
        restTime = 30;
        break;
    }

    // Adjust based on intensity preference
    if (intensity === 'low') {
      sets = Math.max(2, sets - 1);
      restTime += 15;
    } else if (intensity === 'high') {
      sets += 1;
      restTime -= 15;
    }

    return {
      exerciseId: exercise.id,
      name: exercise.name,
      description: exercise.description,
      sets,
      reps,
      restTime,
      intensity: exercise.intensity,
      muscleGroups: exercise.muscleGroups,
      equipment: exercise.equipment,
      instructions: exercise.instructions,
      videoUrl: exercise.videoUrl,
      imageUrl: exercise.imageUrl,
      modifications: exercise.modifications || []
    };
  }

  /**
   * Calculate workout score for ranking
   */
  private calculateWorkoutScore(
    workout: WorkoutCombination,
    userHistory: UserWorkoutHistory,
    request: WorkoutRecommendationRequest
  ): number {
    let score = 0;

    // Time match (25% weight)
    const timeDiff = Math.abs(workout.estimatedDuration - request.timeAvailable);
    score += Math.max(0, 25 - (timeDiff / request.timeAvailable) * 25);

    // Exercise variety (20% weight)
    const uniqueMuscleGroups = new Set(workout.exercises.flatMap(ex => ex.muscleGroups));
    score += Math.min(20, uniqueMuscleGroups.size * 3);

    // Equipment efficiency (15% weight)
    const availableEquipment = new Set(request.equipment || []);
    const requiredEquipment = new Set(workout.exercises.flatMap(ex => ex.equipment));
    const equipmentEfficiency = [...requiredEquipment].filter(eq => 
      availableEquipment.has(eq) || eq === 'bodyweight'
    ).length / requiredEquipment.size;
    score += equipmentEfficiency * 15;

    // Goal alignment (25% weight)
    const goalAlignment = this.calculateGoalAlignment(workout, request.fitnessGoal);
    score += goalAlignment * 25;

    // User history preference (15% weight)
    const historyAlignment = this.calculateHistoryAlignment(workout, userHistory);
    score += historyAlignment * 15;

    return score;
  }

  /**
   * Calculate goal alignment score
   */
  private calculateGoalAlignment(workout: WorkoutCombination, goal: string): number {
    // Implementation based on workout structure and goal compatibility
    const structureName = workout.structure.name.toLowerCase();
    
    switch (goal) {
      case 'strength':
        return structureName.includes('strength') || structureName.includes('compound') ? 1 : 0.6;
      case 'muscle_gain':
        return structureName.includes('hypertrophy') || structureName.includes('muscle') ? 1 : 0.7;
      case 'weight_loss':
        return structureName.includes('hiit') || structureName.includes('fat') ? 1 : 0.5;
      case 'endurance':
        return structureName.includes('endurance') || structureName.includes('cardio') ? 1 : 0.4;
      default:
        return 0.8;
    }
  }

  /**
   * Calculate history alignment score
   */
  private calculateHistoryAlignment(workout: WorkoutCombination, history: UserWorkoutHistory): number {
    // Prefer exercises similar to user's favorites
    const favoriteExerciseIds = new Set(history.favoriteExercises.map((ex: any) => ex.id));
    const workoutExerciseIds = new Set(workout.exercises.map(ex => ex.exerciseId));
    
    const overlap = [...favoriteExerciseIds].filter(id => workoutExerciseIds.has(id)).length;
    return Math.min(1, overlap / Math.max(1, favoriteExerciseIds.size));
  }

  /**
   * Generate workout title
   */
  private generateWorkoutTitle(structure: WorkoutStructure, request: WorkoutRecommendationRequest): string {
    const goalTitles: Record<string, string> = {
      strength: 'Strength Building',
      muscle_gain: 'Muscle Growth',
      weight_loss: 'Fat Burning',
      endurance: 'Endurance Boost',
      general_fitness: 'Complete Fitness'
    };

    const baseTitle = goalTitles[request.fitnessGoal as keyof typeof goalTitles] || 'Custom Workout';
    const timeLabel = request.timeAvailable < 30 ? 'Quick' : 
                     request.timeAvailable < 60 ? 'Power' : 'Extended';
    
    return `${timeLabel} ${baseTitle} Session`;
  }

  /**
   * Generate workout description
   */
  private generateWorkoutDescription(structure: WorkoutStructure, exercises: RecommendedExercise[]): string {
    const muscleGroups = [...new Set(exercises.flatMap(ex => ex.muscleGroups))];
    return `A ${structure.intensity} intensity workout targeting ${muscleGroups.join(', ')} with ${exercises.length} exercises.`;
  }

  /**
   * Calculate total workout duration
   */
  private calculateTotalDuration(exercises: RecommendedExercise[], structure: WorkoutStructure): number {
    const exerciseTime = exercises.reduce((total, exercise) => {
      const avgReps = 10; // Average reps estimate
      const timePerRep = 3; // Seconds per rep
      const exerciseWorkTime = exercise.sets * avgReps * timePerRep;
      const restTime = exercise.sets * exercise.restTime;
      return total + exerciseWorkTime + restTime;
    }, 0);

    return Math.round((structure.warmupTime + exerciseTime / 60 + structure.cooldownTime));
  }

  /**
   * Determine workout difficulty
   */
  private determineDifficulty(exercises: RecommendedExercise[], structure: WorkoutStructure): 'beginner' | 'intermediate' | 'advanced' {
    const avgIntensity = exercises.reduce((sum, ex) => sum + ex.intensity, 0) / exercises.length;
    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);

    if (avgIntensity < 5 && totalSets < 12) return 'beginner';
    if (avgIntensity < 7 && totalSets < 18) return 'intermediate';
    return 'advanced';
  }

  /**
   * Format recommendation for output
   */
  private formatRecommendation(workout: WorkoutCombination, request: WorkoutRecommendationRequest): Partial<WorkoutRecommendation> {
    return {
      id: workout.id,
      title: workout.title,
      description: workout.description,
      estimatedDuration: workout.estimatedDuration,
      difficulty: workout.difficulty,
      exercises: workout.exercises,
      tags: [request.fitnessGoal, request.preferredIntensity, `${workout.exercises.length}_exercises`]
    };
  }

  /**
   * Check if workout is valid
   */
  private isValidWorkout(workout: WorkoutCombination, request: WorkoutRecommendationRequest): boolean {
    // Minimum requirements
    if (workout.exercises.length < 3) return false;
    if (workout.estimatedDuration < 10 || workout.estimatedDuration > request.timeAvailable * 1.2) return false;
    
    // Equipment requirements met
    const availableEquipment = new Set(request.equipment || ['bodyweight']);
    const requiredEquipment = new Set(workout.exercises.flatMap(ex => ex.equipment));
    const hasAllEquipment = [...requiredEquipment].every(eq => 
      availableEquipment.has(eq) || eq === 'bodyweight'
    );
    
    return hasAllEquipment;
  }

  /**
   * Get fallback recommendations when ML fails
   */
  private getFallbackRecommendations(request: WorkoutRecommendationRequest): Partial<WorkoutRecommendation>[] {
    // Return basic workout templates as fallback
    return [
      {
        id: 'fallback_1',
        title: 'Basic Bodyweight Workout',
        description: 'Simple bodyweight exercises for general fitness',
        estimatedDuration: Math.min(30, request.timeAvailable),
        difficulty: 'beginner',
        exercises: this.getBasicBodyweightExercises(),
        tags: ['fallback', 'bodyweight'],
      }
    ];
  }

  /**
   * Get basic bodyweight exercises for fallback
   */
  private getBasicBodyweightExercises(): RecommendedExercise[] {
    return [
      {
        exerciseId: 'pushups',
        name: 'Push-ups',
        description: 'Classic upper body exercise',
        sets: 3,
        reps: '8-12',
        restTime: 60,
        intensity: 6,
        muscleGroups: ['chest', 'arms'],
        equipment: ['bodyweight'],
        instructions: ['Start in plank position', 'Lower chest to ground', 'Push back up'],
        modifications: ['Knee push-ups for beginners']
      },
      {
        exerciseId: 'squats',
        name: 'Bodyweight Squats',
        description: 'Lower body strength exercise',
        sets: 3,
        reps: '12-15',
        restTime: 45,
        intensity: 5,
        muscleGroups: ['legs'],
        equipment: ['bodyweight'],
        instructions: ['Stand with feet shoulder-width apart', 'Lower into squat position', 'Return to standing'],
        modifications: ['Chair-assisted squats']
      }
    ];
  }

  /**
   * Process user feedback for model improvement
   */
  async processFeedback(feedbackData: FeedbackData): Promise<void> {
    const { userId } = feedbackData;
    
    if (!this.userFeedbackHistory.has(userId)) {
      this.userFeedbackHistory.set(userId, []);
    }
    
    this.userFeedbackHistory.get(userId)!.push(feedbackData);
    
    // In production, this would update ML models
    console.log(`Processed feedback for user ${userId}: ${feedbackData.feedback.rating}/5 stars`);
  }

  /**
   * Update user preferences based on usage patterns
   */
  async updateUserPreferences(userId: string, userHistory: UserWorkoutHistory): Promise<void> {
    // Analyze patterns and update preferences
    const feedback = this.userFeedbackHistory.get(userId) || [];
    
    // In production, this would use ML to infer preferences
    console.log(`Updated preferences for user ${userId} based on ${feedback.length} feedback entries`);
  }

  /**
   * Initialize exercise database
   */
  private initializeExerciseDatabase(): ExerciseTemplate[] {
    return [
      {
        id: 'push_ups',
        name: 'Push-ups',
        description: 'Classic upper body bodyweight exercise',
        muscleGroups: ['chest', 'arms', 'core'],
        equipment: ['bodyweight'],
        intensity: 6,
        effectiveness: 8,
        categories: ['compound_movements', 'bodyweight'],
        instructions: [
          'Start in a high plank position',
          'Lower your body until chest nearly touches the floor',
          'Push back up to starting position'
        ],
        videoUrl: 'https://example.com/pushups-video',
        imageUrl: 'https://example.com/pushups-image',
        modifications: ['Knee push-ups', 'Wall push-ups', 'Incline push-ups']
      },
      {
        id: 'squats',
        name: 'Bodyweight Squats',
        description: 'Fundamental lower body exercise',
        muscleGroups: ['legs', 'glutes'],
        equipment: ['bodyweight'],
        intensity: 5,
        effectiveness: 9,
        categories: ['compound_movements', 'bodyweight'],
        instructions: [
          'Stand with feet shoulder-width apart',
          'Lower body as if sitting back into a chair',
          'Keep knees behind toes and chest up',
          'Return to standing position'
        ],
        modifications: ['Chair-assisted squats', 'Jump squats', 'Single-leg squats']
      },
      {
        id: 'deadlifts',
        name: 'Deadlifts',
        description: 'Compound exercise for posterior chain',
        muscleGroups: ['back', 'legs', 'glutes'],
        equipment: ['barbell', 'dumbbells'],
        intensity: 8,
        effectiveness: 10,
        categories: ['compound_movements', 'strength'],
        instructions: [
          'Stand with feet hip-width apart',
          'Grip the bar with hands just outside legs',
          'Keep back straight and lift by driving through heels',
          'Stand tall and squeeze glutes at the top'
        ],
        modifications: ['Romanian deadlifts', 'Sumo deadlifts', 'Single-leg deadlifts']
      },
      {
        id: 'bench_press',
        name: 'Bench Press',
        description: 'Primary chest exercise',
        muscleGroups: ['chest', 'arms', 'shoulders'],
        equipment: ['barbell', 'bench'],
        intensity: 7,
        effectiveness: 9,
        categories: ['compound_movements', 'strength'],
        instructions: [
          'Lie on bench with feet on floor',
          'Grip bar slightly wider than shoulders',
          'Lower bar to chest with control',
          'Press bar back to starting position'
        ],
        modifications: ['Dumbbell press', 'Incline press', 'Close-grip press']
      },
      {
        id: 'pull_ups',
        name: 'Pull-ups',
        description: 'Upper body pulling exercise',
        muscleGroups: ['back', 'arms'],
        equipment: ['pull_up_bar'],
        intensity: 8,
        effectiveness: 9,
        categories: ['compound_movements', 'bodyweight'],
        instructions: [
          'Hang from bar with palms facing away',
          'Pull body up until chin clears the bar',
          'Lower with control to full extension'
        ],
        modifications: ['Assisted pull-ups', 'Negative pull-ups', 'Chin-ups']
      },
      {
        id: 'planks',
        name: 'Plank',
        description: 'Core stability exercise',
        muscleGroups: ['core'],
        equipment: ['bodyweight'],
        intensity: 5,
        effectiveness: 8,
        categories: ['core', 'isometric'],
        instructions: [
          'Start in forearm plank position',
          'Keep body in straight line from head to heels',
          'Hold position while breathing normally'
        ],
        modifications: ['Knee plank', 'Side plank', 'Plank variations']
      },
      // Add more exercises as needed...
    ];
  }
}

// Supporting interfaces
interface ExerciseTemplate {
  id: string;
  name: string;
  description: string;
  muscleGroups: string[];
  equipment: string[];
  intensity: number; // 1-10
  effectiveness: number; // 1-10
  categories: string[];
  instructions: string[];
  videoUrl?: string;
  imageUrl?: string;
  modifications?: string[];
}

interface WorkoutStructure {
  name: string;
  warmupTime: number;
  mainTime: number;
  cooldownTime: number;
  exerciseCount: number;
  focusAreas: string[];
  intensity: string;
}

interface WorkoutCombination {
  id: string;
  title: string;
  description: string;
  structure: WorkoutStructure;
  exercises: RecommendedExercise[];
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  score: number;
}

export default RecommendationEngine;
