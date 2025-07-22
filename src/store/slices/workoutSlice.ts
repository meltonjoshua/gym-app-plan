import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WorkoutState, WorkoutPlan, Exercise, WorkoutSession } from '../../types';

const initialState: WorkoutState = {
  workoutPlans: [],
  currentSession: undefined,
  exercises: [],
  isLoading: false,
  error: undefined,
};

const workoutSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {
    setWorkoutPlans: (state, action: PayloadAction<WorkoutPlan[]>) => {
      state.workoutPlans = action.payload;
      state.error = undefined;
    },
    addWorkoutPlan: (state, action: PayloadAction<WorkoutPlan>) => {
      state.workoutPlans.push(action.payload);
    },
    updateWorkoutPlan: (state, action: PayloadAction<WorkoutPlan>) => {
      const index = state.workoutPlans.findIndex(plan => plan.id === action.payload.id);
      if (index !== -1) {
        state.workoutPlans[index] = action.payload;
      }
    },
    removeWorkoutPlan: (state, action: PayloadAction<string>) => {
      state.workoutPlans = state.workoutPlans.filter(plan => plan.id !== action.payload);
    },
    setExercises: (state, action: PayloadAction<Exercise[]>) => {
      state.exercises = action.payload;
      state.error = undefined;
    },
    startWorkoutSession: (state, action: PayloadAction<WorkoutSession>) => {
      state.currentSession = action.payload;
    },
    updateWorkoutSession: (state, action: PayloadAction<Partial<WorkoutSession>>) => {
      if (state.currentSession) {
        state.currentSession = { ...state.currentSession, ...action.payload };
      }
    },
    endWorkoutSession: (state) => {
      state.currentSession = undefined;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = undefined;
    },
  },
});

export const {
  setWorkoutPlans,
  addWorkoutPlan,
  updateWorkoutPlan,
  removeWorkoutPlan,
  setExercises,
  startWorkoutSession,
  updateWorkoutSession,
  endWorkoutSession,
  setLoading,
  setError,
  clearError,
} = workoutSlice.actions;

export default workoutSlice.reducer;