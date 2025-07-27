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
// Phase 3 reducers
import virtualTrainerReducer from './slices/virtualTrainerSlice';
import trainerMarketplaceReducer from './slices/trainerMarketplaceSlice';
import advancedNutritionReducer from './slices/advancedNutritionSlice';
// Phase 6 reducers
import subscriptionReducer from './slices/subscriptionSlice';
import corporateWellnessReducer from './slices/corporateWellnessSlice';
// Phase 8 reducers
import quantumAIReducer from './slices/quantumAISlice';
// Gamification
import gamificationReducer from './slices/gamificationSlice';
// Error handling
import errorReducer from './slices/errorSlice';
import { errorHandlingMiddleware } from '../utils/errorHandling';

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
    // Phase 3 reducers
    virtualTrainer: virtualTrainerReducer,
    trainerMarketplace: trainerMarketplaceReducer,
    advancedNutrition: advancedNutritionReducer,
    // Phase 6 reducers
    subscription: subscriptionReducer,
    corporateWellness: corporateWellnessReducer,
    // Phase 8 reducers
    quantumAI: quantumAIReducer,
    // Gamification
    gamification: gamificationReducer,
    // Error handling
    error: errorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disabled to allow Date objects in state
    }).concat(errorHandlingMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;