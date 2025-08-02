import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AIState, WorkoutRecommendation, ProgressPrediction } from '../../types';

const initialState: AIState = {
  recommendations: [],
  predictions: [],
  isLoading: false,
  error: undefined,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    // Loading and Error States
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = undefined;
    },

    // Workout Recommendations
    setRecommendations: (state, action: PayloadAction<WorkoutRecommendation[]>) => {
      state.recommendations = action.payload;
    },
    addRecommendation: (state, action: PayloadAction<WorkoutRecommendation>) => {
      // Add new recommendation and keep only the most recent 10
      state.recommendations.unshift(action.payload);
      if (state.recommendations.length > 10) {
        state.recommendations = state.recommendations.slice(0, 10);
      }
    },
    markRecommendationViewed: (state, action: PayloadAction<string>) => {
      const recommendation = state.recommendations.find(r => r.id === action.payload);
      if (recommendation) {
        recommendation.isViewed = true;
      }
    },
    markRecommendationApplied: (state, action: PayloadAction<string>) => {
      const recommendation = state.recommendations.find(r => r.id === action.payload);
      if (recommendation) {
        recommendation.isApplied = true;
      }
    },
    removeRecommendation: (state, action: PayloadAction<string>) => {
      state.recommendations = state.recommendations.filter(r => r.id !== action.payload);
    },
    clearOldRecommendations: (state, action: PayloadAction<Date>) => {
      state.recommendations = state.recommendations.filter(r => r.createdAt >= action.payload);
    },

    // Progress Predictions
    setPredictions: (state, action: PayloadAction<ProgressPrediction[]>) => {
      state.predictions = action.payload;
    },
    updatePrediction: (state, action: PayloadAction<ProgressPrediction>) => {
      const index = state.predictions.findIndex(p => p.goalId === action.payload.goalId);
      if (index !== -1) {
        state.predictions[index] = action.payload;
      } else {
        state.predictions.push(action.payload);
      }
    },
    removePrediction: (state, action: PayloadAction<string>) => {
      state.predictions = state.predictions.filter(p => p.goalId !== action.payload);
    },

    // Batch operations
    generateRecommendations: (state, action: PayloadAction<{ 
      userId: string; 
      userLevel: string; 
      recentWorkouts: any[]; 
      goals: any[] 
    }>) => {
      // This would typically trigger an async action to generate recommendations
      // For now, we'll mark as loading
      state.isLoading = true;
    },
    updatePredictions: (state, action: PayloadAction<{ 
      userId: string; 
      progressData: any[]; 
      goals: any[] 
    }>) => {
      // This would typically trigger an async action to update predictions
      state.isLoading = true;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setRecommendations,
  addRecommendation,
  markRecommendationViewed,
  markRecommendationApplied,
  removeRecommendation,
  clearOldRecommendations,
  setPredictions,
  updatePrediction,
  removePrediction,
  generateRecommendations,
  updatePredictions,
} = aiSlice.actions;

export default aiSlice.reducer;