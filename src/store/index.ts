import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import workoutReducer from './slices/workoutSlice';
import progressReducer from './slices/progressSlice';
import nutritionReducer from './slices/nutritionSlice';
import notificationReducer from './slices/notificationSlice';
// Phase 2 reducers
import socialReducer from './slices/socialSlice';
import aiReducer from './slices/aiSlice';
import wearableReducer from './slices/wearableSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    workouts: workoutReducer,
    progress: progressReducer,
    nutrition: nutritionReducer,
    notifications: notificationReducer,
    // Phase 2 reducers
    social: socialReducer,
    ai: aiReducer,
    wearable: wearableReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore specific paths that contain non-serializable data like Date objects
        ignoredActionsPaths: ['payload.createdAt', 'payload.date', 'payload.startDate', 'payload.endDate'],
        ignoredPaths: ['social.challenges.0.startDate', 'social.challenges.0.endDate'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;