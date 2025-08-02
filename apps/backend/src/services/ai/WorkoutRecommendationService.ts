import OpenAI from 'openai';
import { User, Workout, Exercise, UserProfile } from '../../models';
import { RecommendationEngine, MLRecommendationInput, FeedbackData } from '../../ml/RecommendationEngine';

// Export interfaces needed by ML engine
export interface WorkoutRecommendationRequest {
  userId: string;
  timeAvailable: number; // in minutes
  fitnessGoal: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'general_fitness';
  equipment?: string[];
  preferredIntensity: 'low' | 'moderate' | 'high';
  targetMuscleGroups?: string[];
  excludeExercises?: string[];
}

export interface WorkoutRecommendation {
  id: string;
  title: string;
  description: string;
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: RecommendedExercise[];
  tags: string[];
  aiEnhancement?: {
    personalizedNotes: string;
    motivationalMessage: string;
    adaptationSuggestions: string[];
    expectedResults: string;
  };
  confidence: number; // 0-1
  createdAt: Date;
}

export interface RecommendedExercise {
  exerciseId: string;
  name: string;
  description: string;
  sets: number;
  reps: string; // e.g., "8-12" or "30 seconds"
  restTime: number; // seconds
  intensity: number; // 1-10
  muscleGroups: string[];
  equipment: string[];
  instructions: string[];
  videoUrl?: string;
  imageUrl?: string;
  modifications: string[];
}

export interface UserWorkoutHistory {
  completedWorkouts: Workout[];
  favoriteExercises: Exercise[];
  averageWorkoutDuration: number;
  preferredIntensity: number;
  consistencyScore: number;
  strengthProgression: Record<string, number>;
  recentPerformance: WorkoutPerformance[];
}

export interface WorkoutPerformance {
  workoutId: string;
  completionRate: number;
  averageRating: number;
  difficultyRating: number;
  timeSpent: number;
  exercisesFeedback: ExerciseFeedback[];
}

export interface ExerciseFeedback {
  exerciseId: string;
  rating: number; // 1-5
  difficulty: 'too_easy' | 'just_right' | 'too_hard';
  comments?: string;
}

/**
 * AI-powered Workout Recommendation Service
 */
export class WorkoutRecommendationService {
  private openai: OpenAI;
  private mlEngine: RecommendationEngine;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.mlEngine = new RecommendationEngine();
  }

  /**
   * Generate workout recommendations
   */
  async generateRecommendations(userId: string): Promise<any[]> {
    console.log(`Generating AI workout recommendations for user ${userId}`);
    
    try {
      // Basic implementation for Phase 13.1
      return [
        {
          id: 'rec_1',
          title: 'AI-Powered Strength Workout',
          description: 'Personalized strength training session',
          estimatedDuration: 45,
          difficulty: 'intermediate',
          exercises: [],
          tags: ['strength', 'ai-generated'],
          confidence: 0.85,
          createdAt: new Date()
        }
      ];
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw new Error('Failed to generate workout recommendations');
    }
  }
}

export default WorkoutRecommendationService;
