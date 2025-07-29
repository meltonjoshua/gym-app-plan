/**
 * Mock Services for FitTracker Pro
 * Provides mock implementations for API calls during development/testing
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  WorkoutPlan, 
  Exercise, 
  WorkoutSession, 
  Food,
  SocialUser,
  Challenge 
} from '../types';
import { 
  sampleExercises, 
  sampleWorkoutPlans, 
  sampleFoods,
  sampleChallenges,
  sampleFriends 
} from '../data/sampleData';

// Mock API delay simulation
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export class MockAuthService {
  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await mockDelay();
    
    // Mock validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    // Create mock user
    const user: User = {
      id: '1',
      email,
      name: 'Demo User',
      age: 25,
      height: 175,
      weight: 70,
      fitnessLevel: 'beginner',
      goals: ['general_fitness' as any],
      preferredWorkoutDays: 3,
      preferredWorkoutDuration: 45,
      joinDate: new Date(),
      lastLogin: new Date(),
      createdAt: new Date(),
    };
    
    const token = 'mock-jwt-token-' + Date.now();
    
    // Store in AsyncStorage
    await AsyncStorage.setItem('user', JSON.stringify(user));
    await AsyncStorage.setItem('token', token);
    
    return { user, token };
  }
  
  static async register(userData: Partial<User>): Promise<{ user: User; token: string }> {
    await mockDelay();
    
    const user: User = {
      id: Date.now().toString(),
      ...userData,
      joinDate: new Date(),
      lastLogin: new Date(),
      createdAt: new Date(),
    } as User;
    
    const token = 'mock-jwt-token-' + Date.now();
    
    await AsyncStorage.setItem('user', JSON.stringify(user));
    await AsyncStorage.setItem('token', token);
    
    return { user, token };
  }
  
  static async logout(): Promise<void> {
    await mockDelay(200);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
  }
}

export class MockWorkoutService {
  static async getWorkoutPlans(): Promise<WorkoutPlan[]> {
    await mockDelay();
    return sampleWorkoutPlans;
  }
  
  static async getExercises(): Promise<Exercise[]> {
    await mockDelay();
    return sampleExercises;
  }
  
  static async startWorkoutSession(workoutId: string): Promise<WorkoutSession> {
    await mockDelay();
    
    const session: WorkoutSession = {
      id: Date.now().toString(),
      workoutId,
      userId: '1',
      startTime: new Date(),
      date: new Date(),
      isCompleted: false,
      completedExercises: [],
    };
    
    await AsyncStorage.setItem(`session_${session.id}`, JSON.stringify(session));
    return session;
  }
  
  static async endWorkoutSession(sessionId: string): Promise<WorkoutSession> {
    await mockDelay();
    
    const sessionData = await AsyncStorage.getItem(`session_${sessionId}`);
    if (!sessionData) {
      throw new Error('Session not found');
    }
    
    const session: WorkoutSession = JSON.parse(sessionData);
    session.endTime = new Date();
    session.isCompleted = true;
    
    await AsyncStorage.setItem(`session_${sessionId}`, JSON.stringify(session));
    return session;
  }
}

export class MockNutritionService {
  static async getFoods(): Promise<Food[]> {
    await mockDelay();
    return sampleFoods;
  }
  
  static async logFood(foodId: string, quantity: number): Promise<void> {
    await mockDelay();
    
    const logs = await AsyncStorage.getItem('foodLogs') || '[]';
    const foodLogs = JSON.parse(logs);
    
    foodLogs.push({
      id: Date.now().toString(),
      foodId,
      quantity,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date(),
    });
    
    await AsyncStorage.setItem('foodLogs', JSON.stringify(foodLogs));
  }
  
  static async getDailyNutrition(date: string): Promise<any> {
    await mockDelay();
    
    // Return mock daily nutrition data
    return {
      calories: 1850,
      protein: 120,
      carbs: 200,
      fat: 65,
      fiber: 28,
      sugar: 45,
    };
  }
}

export class MockSocialService {
  static async getFriends(): Promise<SocialUser[]> {
    await mockDelay();
    // Return mock social users
    return [
      {
        id: '1',
        name: 'Alex Johnson',
        fitnessLevel: 'intermediate' as any,
        joinDate: new Date(),
        totalWorkouts: 25,
        currentStreak: 5,
        achievements: [],
      },
      {
        id: '2',
        name: 'Sarah Wilson',
        fitnessLevel: 'advanced' as any,
        joinDate: new Date(),
        totalWorkouts: 42,
        currentStreak: 12,
        achievements: [],
      }
    ];
  }
  
  static async getChallenges(): Promise<Challenge[]> {
    await mockDelay();
    return sampleChallenges;
  }
  
  static async joinChallenge(challengeId: string): Promise<void> {
    await mockDelay();
    // Mock joining challenge logic
  }
  
  static async shareWorkout(workoutData: any): Promise<void> {
    await mockDelay();
    // Mock workout sharing logic
  }
}

export class MockAnalyticsService {
  static async getProgressData(userId: string, period: string): Promise<any> {
    await mockDelay();
    
    // Return mock progress data
    return {
      weightProgress: [75, 74, 72, 71, 70, 69],
      workoutCount: 42,
      strengthProgress: 85,
      cardioMinutes: 320,
      streakDays: 12,
    };
  }
  
  static async logWorkoutMetrics(sessionId: string, metrics: any): Promise<void> {
    await mockDelay();
    
    const logs = await AsyncStorage.getItem('workoutMetrics') || '[]';
    const metricLogs = JSON.parse(logs);
    
    metricLogs.push({
      sessionId,
      ...metrics,
      timestamp: new Date(),
    });
    
    await AsyncStorage.setItem('workoutMetrics', JSON.stringify(metricLogs));
  }
}

// Utility function to check if we're in mock mode
export const isMockMode = (): boolean => {
  return __DEV__ || process.env.NODE_ENV === 'development';
};

// Export all services as a combined object
export const MockServices = {
  auth: MockAuthService,
  workout: MockWorkoutService,
  nutrition: MockNutritionService,
  social: MockSocialService,
  analytics: MockAnalyticsService,
};
