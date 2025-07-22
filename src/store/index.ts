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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore specific paths that contain non-serializable data like Date objects
        ignoredActionsPaths: [
          'payload.createdAt', 
          'payload.date', 
          'payload.startDate', 
          'payload.endDate', 
          'payload.timestamp',
          'payload.completedAt',
          'payload.sharedAt',
          'payload.lastUpdated',
          'payload.createdDate',
          'payload.acceptedDate',
          'payload.joinDate',
          'payload.certificationDate',
          // Handle array payloads with date fields
          'payload.0.createdAt',
          'payload.0.startDate',
          'payload.0.endDate',
          'payload.0.completedAt',
          'payload.0.sharedAt',
          'payload.0.lastUpdated',
          'payload.0.createdDate',
          'payload.0.acceptedDate',
          'payload.0.joinDate',
          'payload.0.certifications.0.certificationDate',
          'payload.1.createdAt',
          'payload.1.startDate',
          'payload.1.endDate'
        ],
        ignoredPaths: [
          // Social slice date paths
          'social.challenges.0.startDate', 
          'social.challenges.0.endDate',
          'social.challenges.0.participants.0.joinDate',
          'social.friends.0.createdDate',
          'social.friends.0.acceptedDate',
          'social.friendRequests.0.createdDate',
          'social.workoutShares.0.completedAt',
          'social.workoutShares.0.sharedAt',
          'social.leaderboards.0.lastUpdated',
          // AI slice date paths
          'ai.recommendations.0.createdAt',
          'ai.recommendations.1.createdAt',
          // Trainer marketplace date paths
          'trainerMarketplace.trainers.0.certifications.0.certificationDate',
          'trainerMarketplace.trainers.1.certifications.0.certificationDate',
          // Quantum AI date paths
          'quantumAI.consciousness.lastThought',
          'quantumAI.consciousness.experiences',
          'quantumAI.metaverse.environments',
          'quantumAI.metaverse.environments.0.createdAt'
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;