// API Integration Test Service
// This service will test the connection between React Native app and backend APIs

import { Alert } from 'react-native';

const API_BASE_URL = 'http://localhost:5000';

interface ApiResponse<T = any> {
  status: string;
  data?: T;
  message?: string;
  error?: string;
}

class APIIntegrationTestService {
  private async makeRequest<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      console.log(`🌐 Testing API: ${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Success: ${endpoint}`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Error: ${endpoint}`, error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Test backend health
  async testHealthCheck(): Promise<boolean> {
    const result = await this.makeRequest('/health');
    return result.status === 'healthy';
  }

  // Test API status
  async testApiStatus(): Promise<ApiResponse> {
    return await this.makeRequest('/api/status');
  }

  // Test workout endpoints
  async testWorkoutAPIs(): Promise<{
    workouts: ApiResponse;
    exercises: ApiResponse;
  }> {
    const [workouts, exercises] = await Promise.all([
      this.makeRequest('/api/v1/workouts'),
      this.makeRequest('/api/v1/exercises')
    ]);

    return { workouts, exercises };
  }

  // Test nutrition endpoints
  async testNutritionAPIs(): Promise<ApiResponse> {
    return await this.makeRequest('/api/v1/nutrition');
  }

  // Test analytics endpoints
  async testAnalyticsAPIs(): Promise<ApiResponse> {
    return await this.makeRequest('/api/v1/analytics/dashboard');
  }

  // Run comprehensive integration test
  async runFullIntegrationTest(): Promise<{
    health: boolean;
    apiStatus: ApiResponse;
    workouts: ApiResponse;
    exercises: ApiResponse;
    nutrition: ApiResponse;
    analytics: ApiResponse;
    summary: {
      totalTests: number;
      passed: number;
      failed: number;
      successRate: string;
    };
  }> {
    console.log('🚀 Starting Full-Stack Integration Test...');
    
    const results = {
      health: false,
      apiStatus: { status: 'error' },
      workouts: { status: 'error' },
      exercises: { status: 'error' },
      nutrition: { status: 'error' },
      analytics: { status: 'error' },
      summary: {
        totalTests: 6,
        passed: 0,
        failed: 0,
        successRate: '0%'
      }
    };

    try {
      // Test 1: Health Check
      results.health = await this.testHealthCheck();
      if (results.health) results.summary.passed++;

      // Test 2: API Status
      results.apiStatus = await this.testApiStatus();
      if (results.apiStatus.status === 'success') results.summary.passed++;

      // Test 3 & 4: Workout APIs
      const workoutTests = await this.testWorkoutAPIs();
      results.workouts = workoutTests.workouts;
      results.exercises = workoutTests.exercises;
      if (results.workouts.status === 'success') results.summary.passed++;
      if (results.exercises.status === 'success') results.summary.passed++;

      // Test 5: Nutrition APIs
      results.nutrition = await this.testNutritionAPIs();
      if (results.nutrition.status === 'success') results.summary.passed++;

      // Test 6: Analytics APIs
      results.analytics = await this.testAnalyticsAPIs();
      if (results.analytics.status === 'success') results.summary.passed++;

      // Calculate summary
      results.summary.failed = results.summary.totalTests - results.summary.passed;
      results.summary.successRate = `${Math.round((results.summary.passed / results.summary.totalTests) * 100)}%`;

      console.log('📊 Integration Test Results:', results.summary);
      
      if (results.summary.passed === results.summary.totalTests) {
        console.log('🎉 All tests passed! Full-stack integration successful!');
        Alert.alert(
          '🎉 Integration Test Success!', 
          `All ${results.summary.totalTests} API tests passed!\n\nFitTracker Pro backend is fully operational!`
        );
      } else {
        console.log(`⚠️  ${results.summary.failed} tests failed. Check backend status.`);
        Alert.alert(
          '⚠️ Integration Test Results', 
          `${results.summary.passed}/${results.summary.totalTests} tests passed (${results.summary.successRate})\n\nSome APIs may need attention.`
        );
      }

    } catch (error) {
      console.error('💥 Integration test failed:', error);
      Alert.alert('❌ Integration Test Failed', 'Unable to connect to backend server. Please ensure the backend is running on port 5000.');
    }

    return results;
  }

  // Test specific workout data consumption
  async testWorkoutDataIntegration(): Promise<{
    canLoadWorkouts: boolean;
    workoutCount: number;
    sampleWorkout?: any;
    exerciseCount: number;
    sampleExercise?: any;
  }> {
    const workoutTests = await this.testWorkoutAPIs();
    
    const result = {
      canLoadWorkouts: false,
      workoutCount: 0,
      sampleWorkout: undefined,
      exerciseCount: 0,
      sampleExercise: undefined
    };

    if (workoutTests.workouts.status === 'success' && workoutTests.workouts.data) {
      result.canLoadWorkouts = true;
      result.workoutCount = workoutTests.workouts.data.length;
      result.sampleWorkout = workoutTests.workouts.data[0];
    }

    if (workoutTests.exercises.status === 'success' && workoutTests.exercises.data) {
      result.exerciseCount = workoutTests.exercises.data.length;
      result.sampleExercise = workoutTests.exercises.data[0];
    }

    return result;
  }

  // Test nutrition data consumption  
  async testNutritionDataIntegration(): Promise<{
    canLoadNutrition: boolean;
    dailyCalories?: number;
    macros?: any;
    meals?: any[];
  }> {
    const nutritionTest = await this.testNutritionAPIs();
    
    const result = {
      canLoadNutrition: false,
      dailyCalories: undefined,
      macros: undefined,
      meals: undefined
    };

    if (nutritionTest.status === 'success' && nutritionTest.data) {
      result.canLoadNutrition = true;
      result.dailyCalories = nutritionTest.data.daily_calories;
      result.macros = nutritionTest.data.macros;
      result.meals = nutritionTest.data.recent_meals;
    }

    return result;
  }
}

export const apiIntegrationTest = new APIIntegrationTestService();

// Export for easy testing in development
export { APIIntegrationTestService };

// Usage example:
// import { apiIntegrationTest } from '../services/apiIntegrationTest';
// 
// // In a component or test
// const testIntegration = async () => {
//   const results = await apiIntegrationTest.runFullIntegrationTest();
//   console.log('Integration test results:', results);
// };
