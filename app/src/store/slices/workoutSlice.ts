import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WorkoutState, WorkoutPlan, Exercise, WorkoutSession } from '../../types';
import { 
  ErrorFactory, 
  ErrorHandler, 
  handleAsyncThunkError, 
  ValidationHelper,
  RetryHelper 
} from '../../utils/errorHandling';

const initialState: WorkoutState = {
  workoutPlans: [],
  currentSession: undefined,
  exercises: [],
  isLoading: false,
  error: undefined,
};

// Async thunk for fetching workout plans with error handling
export const fetchWorkoutPlans = createAsyncThunk(
  'workouts/fetchWorkoutPlans',
  async (userId: string, { rejectWithValue }) => {
    try {
      // Simulate API call with retry mechanism
      const response = await RetryHelper.withRetry(async () => {
        // Mock API call - replace with actual API endpoint
        const response = await fetch(`/api/users/${userId}/workout-plans`);
        
        if (!response.ok) {
          throw ErrorFactory.fromHttpError(response.status, 'Failed to fetch workout plans');
        }
        
        return response.json();
      }, 3, 1000);

      return response.workoutPlans;
    } catch (error: any) {
      const appError = handleAsyncThunkError(error, 'fetchWorkoutPlans');
      ErrorHandler.showUserFriendlyError(appError);
      return rejectWithValue(appError.message);
    }
  }
);

// Async thunk for creating a workout plan with validation
export const createWorkoutPlan = createAsyncThunk(
  'workouts/createWorkoutPlan',
  async (workoutPlan: Omit<WorkoutPlan, 'id'>, { rejectWithValue }) => {
    try {
      // Basic validation
      if (!workoutPlan.name || !workoutPlan.description) {
        const validationError = ErrorFactory.createValidationError(
          'Workout plan name and description are required'
        );
        ErrorHandler.showUserFriendlyError(validationError);
        return rejectWithValue(validationError.message);
      }

      if (!['beginner', 'intermediate', 'advanced'].includes(workoutPlan.difficulty)) {
        const validationError = ErrorFactory.createValidationError('Invalid difficulty level');
        ErrorHandler.showUserFriendlyError(validationError);
        return rejectWithValue(validationError.message);
      }

      // Simulate API call
      const response = await fetch('/api/workout-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workoutPlan),
      });

      if (!response.ok) {
        throw ErrorFactory.fromHttpError(response.status, 'Failed to create workout plan');
      }

      const createdPlan = await response.json();
      return createdPlan;
    } catch (error: any) {
      const appError = handleAsyncThunkError(error, 'createWorkoutPlan');
      ErrorHandler.showUserFriendlyError(appError);
      return rejectWithValue(appError.message);
    }
  }
);

// Async thunk for updating a workout plan
export const updateWorkoutPlanAsync = createAsyncThunk(
  'workouts/updateWorkoutPlanAsync',
  async (workoutPlan: WorkoutPlan, { rejectWithValue }) => {
    try {
      // Validate required ID
      if (!workoutPlan.id) {
        const error = ErrorFactory.createValidationError('Workout plan ID is required for update');
        ErrorHandler.showUserFriendlyError(error);
        return rejectWithValue(error.message);
      }

      const response = await fetch(`/api/workout-plans/${workoutPlan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workoutPlan),
      });

      if (!response.ok) {
        throw ErrorFactory.fromHttpError(response.status, 'Failed to update workout plan');
      }

      const updatedPlan = await response.json();
      return updatedPlan;
    } catch (error: any) {
      const appError = handleAsyncThunkError(error, 'updateWorkoutPlan');
      ErrorHandler.showUserFriendlyError(appError);
      return rejectWithValue(appError.message);
    }
  }
);

// Async thunk for deleting a workout plan
export const deleteWorkoutPlan = createAsyncThunk(
  'workouts/deleteWorkoutPlan',
  async (workoutPlanId: string, { rejectWithValue }) => {
    try {
      if (!workoutPlanId) {
        const error = ErrorFactory.createValidationError('Workout plan ID is required for deletion');
        ErrorHandler.showUserFriendlyError(error);
        return rejectWithValue(error.message);
      }

      const response = await fetch(`/api/workout-plans/${workoutPlanId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw ErrorFactory.fromHttpError(response.status, 'Failed to delete workout plan');
      }

      return workoutPlanId;
    } catch (error: any) {
      const appError = handleAsyncThunkError(error, 'deleteWorkoutPlan');
      ErrorHandler.showUserFriendlyError(appError);
      return rejectWithValue(appError.message);
    }
  }
);

// Async thunk for fetching exercises
export const fetchExercises = createAsyncThunk(
  'workouts/fetchExercises',
  async (filters: { category?: string; difficulty?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);

      const response = await RetryHelper.withRetry(async () => {
        const response = await fetch(`/api/exercises?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw ErrorFactory.fromHttpError(response.status, 'Failed to fetch exercises');
        }
        
        return response.json();
      }, 2, 1000);

      return response.exercises;
    } catch (error: any) {
      const appError = handleAsyncThunkError(error, 'fetchExercises');
      ErrorHandler.showUserFriendlyError(appError);
      return rejectWithValue(appError.message);
    }
  }
);

// Async thunk for starting a workout session
export const startWorkoutSessionAsync = createAsyncThunk(
  'workouts/startWorkoutSessionAsync',
  async (workoutPlanId: string, { rejectWithValue }) => {
    try {
      if (!workoutPlanId) {
        const error = ErrorFactory.createValidationError('Workout plan ID is required to start session');
        ErrorHandler.showUserFriendlyError(error);
        return rejectWithValue(error.message);
      }

      const response = await fetch('/api/workout-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutPlanId,
          startTime: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw ErrorFactory.fromHttpError(response.status, 'Failed to start workout session');
      }

      const session = await response.json();
      return session;
    } catch (error: any) {
      const appError = handleAsyncThunkError(error, 'startWorkoutSession');
      ErrorHandler.showUserFriendlyError(appError);
      return rejectWithValue(appError.message);
    }
  }
);

const workoutSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {
    // Synchronous reducers with error handling
    addWorkoutPlan: (state, action: PayloadAction<WorkoutPlan>) => {
      try {
        state.workoutPlans.push(action.payload);
        state.error = undefined;
      } catch (error) {
        state.error = 'Failed to add workout plan';
      }
    },
    updateWorkoutPlan: (state, action: PayloadAction<WorkoutPlan>) => {
      try {
        const index = state.workoutPlans.findIndex(plan => plan.id === action.payload.id);
        if (index !== -1) {
          state.workoutPlans[index] = action.payload;
          state.error = undefined;
        } else {
          state.error = 'Workout plan not found';
        }
      } catch (error) {
        state.error = 'Failed to update workout plan';
      }
    },
    removeWorkoutPlan: (state, action: PayloadAction<string>) => {
      try {
        const initialLength = state.workoutPlans.length;
        state.workoutPlans = state.workoutPlans.filter(plan => plan.id !== action.payload);
        
        if (state.workoutPlans.length === initialLength) {
          state.error = 'Workout plan not found';
        } else {
          state.error = undefined;
        }
      } catch (error) {
        state.error = 'Failed to remove workout plan';
      }
    },
    startWorkoutSession: (state, action: PayloadAction<WorkoutSession>) => {
      try {
        state.currentSession = action.payload;
        state.error = undefined;
      } catch (error) {
        state.error = 'Failed to start workout session';
      }
    },
    updateWorkoutSession: (state, action: PayloadAction<Partial<WorkoutSession>>) => {
      try {
        if (state.currentSession) {
          state.currentSession = { ...state.currentSession, ...action.payload };
          state.error = undefined;
        } else {
          state.error = 'No active workout session to update';
        }
      } catch (error) {
        state.error = 'Failed to update workout session';
      }
    },
    endWorkoutSession: (state) => {
      try {
        state.currentSession = undefined;
        state.error = undefined;
      } catch (error) {
        state.error = 'Failed to end workout session';
      }
    },
    setWorkoutPlans: (state, action: PayloadAction<WorkoutPlan[]>) => {
      try {
        state.workoutPlans = action.payload;
        state.error = undefined;
      } catch (error) {
        state.error = 'Failed to set workout plans';
      }
    },
    setExercises: (state, action: PayloadAction<Exercise[]>) => {
      try {
        state.exercises = action.payload;
        state.error = undefined;
      } catch (error) {
        state.error = 'Failed to set exercises';
      }
    },
    clearError: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    // Fetch workout plans
    builder
      .addCase(fetchWorkoutPlans.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(fetchWorkoutPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workoutPlans = action.payload;
        state.error = undefined;
      })
      .addCase(fetchWorkoutPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch workout plans';
      })
      
      // Create workout plan
      .addCase(createWorkoutPlan.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(createWorkoutPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workoutPlans.push(action.payload);
        state.error = undefined;
      })
      .addCase(createWorkoutPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to create workout plan';
      })
      
      // Update workout plan
      .addCase(updateWorkoutPlanAsync.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(updateWorkoutPlanAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.workoutPlans.findIndex(plan => plan.id === action.payload.id);
        if (index !== -1) {
          state.workoutPlans[index] = action.payload;
        }
        state.error = undefined;
      })
      .addCase(updateWorkoutPlanAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to update workout plan';
      })
      
      // Delete workout plan
      .addCase(deleteWorkoutPlan.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(deleteWorkoutPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workoutPlans = state.workoutPlans.filter(plan => plan.id !== action.payload);
        state.error = undefined;
      })
      .addCase(deleteWorkoutPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to delete workout plan';
      })
      
      // Fetch exercises
      .addCase(fetchExercises.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(fetchExercises.fulfilled, (state, action) => {
        state.isLoading = false;
        state.exercises = action.payload;
        state.error = undefined;
      })
      .addCase(fetchExercises.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch exercises';
      })
      
      // Start workout session
      .addCase(startWorkoutSessionAsync.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(startWorkoutSessionAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload;
        state.error = undefined;
      })
      .addCase(startWorkoutSessionAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to start workout session';
      });
  },
});

export const {
  addWorkoutPlan,
  updateWorkoutPlan,
  removeWorkoutPlan,
  setWorkoutPlans,
  setExercises,
  startWorkoutSession,
  updateWorkoutSession,
  endWorkoutSession,
  clearError,
} = workoutSlice.actions;

export default workoutSlice.reducer;