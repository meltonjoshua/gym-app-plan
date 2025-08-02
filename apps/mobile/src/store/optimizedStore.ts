import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';

/**
 * Optimized Redux store configuration with performance enhancements
 * - Smart caching strategies
 * - Memoized selectors
 * - Optimized state updates
 * - Performance monitoring
 */

// Performance monitoring for Redux operations
interface PerformanceMetrics {
  actionCount: number;
  averageActionTime: number;
  slowActions: string[];
  lastActionTime: number;
}

interface OptimizedState {
  // Core app state
  user: UserState;
  workouts: WorkoutState;
  ai: AIState;
  performance: PerformanceState;
  
  // UI state (not persisted)
  ui: UIState;
  
  // Cache state
  cache: CacheState;
}

interface UserState {
  profile: UserProfile | null;
  preferences: UserPreferences;
  authentication: AuthState;
  isLoading: boolean;
  error: string | null;
  lastSynced: string | null;
}

interface WorkoutState {
  currentWorkout: Workout | null;
  workoutHistory: Workout[];
  templates: WorkoutTemplate[];
  progress: ProgressData;
  isLoading: boolean;
  error: string | null;
  
  // Optimized for quick access
  recentWorkouts: Workout[];
  favoriteExercises: Exercise[];
}

interface AIState {
  formAnalysis: {
    currentSession: FormAnalysisSession | null;
    history: FormAnalysisResult[];
    isAnalyzing: boolean;
    error: string | null;
  };
  
  recommendations: {
    current: WorkoutRecommendation[];
    cached: Map<string, WorkoutRecommendation[]>;
    lastUpdated: string | null;
    isLoading: boolean;
    error: string | null;
  };
  
  // Performance optimization
  processingQueue: AIRequest[];
  batchingEnabled: boolean;
}

interface PerformanceState {
  metrics: PerformanceMetrics;
  enableProfiling: boolean;
  optimizationsEnabled: {
    memoization: boolean;
    debouncing: boolean;
    virtualization: boolean;
    imageOptimization: boolean;
    stateBatching: boolean;
  };
}

interface UIState {
  navigation: NavigationState;
  modals: ModalState;
  toasts: ToastMessage[];
  theme: ThemeState;
  loading: LoadingState;
}

interface CacheState {
  // Smart caching with TTL
  workoutCache: Map<string, { data: any; expiry: number }>;
  userCache: Map<string, { data: any; expiry: number }>;
  aiCache: Map<string, { data: any; expiry: number }>;
  
  // Cache statistics
  stats: {
    hits: number;
    misses: number;
    evictions: number;
  };
}

// Performance-optimized async thunks
// Performance monitoring middleware
export const performanceMiddleware = (store: any) => (next: any) => (action: any) => {
  const startTime = performance.now();
  const result = next(action);
  const endTime = performance.now();
  
  const actionTime = endTime - startTime;
  
  // Update performance metrics for slow actions
  if (actionTime > 5) { // Log actions taking longer than 5ms
    store.dispatch(performanceActions.updatePerformanceMetrics({
      actionType: action.type,
      executionTime: actionTime
    }));
  }
  
  return result;
};

// Optimized selectors with memoization
export const selectUserProfile = createSelector(
  [(state: OptimizedState) => state.user.profile],
  (profile) => profile
);

export const selectRecentWorkouts = createSelector(
  [(state: OptimizedState) => state.workouts.recentWorkouts],
  (workouts) => workouts.slice(0, 10) // Only return last 10 for performance
);

export const selectCachedRecommendations = createSelector(
  [
    (state: OptimizedState) => state.ai.recommendations.cached,
    (_: OptimizedState, userId: string) => userId
  ],
  (cache, userId) => cache.get(userId) || []
);

export const selectPerformanceMetrics = createSelector(
  [(state: OptimizedState) => state.performance.metrics],
  (metrics) => metrics
);

// Cache utilities
const CACHE_TTL = {
  USER_DATA: 5 * 60 * 1000, // 5 minutes
  WORKOUT_DATA: 10 * 60 * 1000, // 10 minutes
  AI_RESULTS: 2 * 60 * 1000, // 2 minutes
  RECOMMENDATIONS: 15 * 60 * 1000, // 15 minutes
};

function isCacheValid(expiry: number): boolean {
  return Date.now() < expiry;
}

function createCacheEntry<T>(data: T, ttl: number): { data: T; expiry: number } {
  return {
    data,
    expiry: Date.now() + ttl
  };
}

// Optimized User Slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    preferences: {
      theme: 'light',
      notifications: true,
      units: 'metric',
      language: 'en'
    },
    authentication: {
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      expiresAt: null
    },
    isLoading: false,
    error: null,
    lastSynced: null
  } as UserState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
      state.lastSynced = new Date().toISOString();
    },
    
    updateUserPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    setAuthentication: (state, action: PayloadAction<AuthState>) => {
      state.authentication = action.payload;
    },
    
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setUserError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

// Optimized Workout Slice with smart caching
const workoutSlice = createSlice({
  name: 'workouts',
  initialState: {
    currentWorkout: null,
    workoutHistory: [],
    templates: [],
    progress: {
      totalWorkouts: 0,
      totalExercises: 0,
      personalRecords: [],
      weeklyProgress: []
    },
    isLoading: false,
    error: null,
    recentWorkouts: [],
    favoriteExercises: []
  } as WorkoutState,
  reducers: {
    setCurrentWorkout: (state, action: PayloadAction<Workout | null>) => {
      state.currentWorkout = action.payload;
    },
    
    addWorkoutToHistory: (state, action: PayloadAction<Workout>) => {
      state.workoutHistory.unshift(action.payload);
      
      // Update recent workouts (keep only last 20)
      state.recentWorkouts = state.workoutHistory.slice(0, 20);
      
      // Update progress
      state.progress.totalWorkouts += 1;
    },
    
    updateFavoriteExercises: (state, action: PayloadAction<Exercise[]>) => {
      state.favoriteExercises = action.payload.slice(0, 10); // Limit to 10 favorites
    },
    
    setWorkoutLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setWorkoutError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

// Optimized AI Slice with intelligent caching
const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    formAnalysis: {
      currentSession: null,
      history: [],
      isAnalyzing: false,
      error: null
    },
    recommendations: {
      current: [],
      cached: new Map(),
      lastUpdated: null,
      isLoading: false,
      error: null
    },
    processingQueue: [],
    batchingEnabled: true
  } as AIState,
  reducers: {
    setFormAnalysisSession: (state, action: PayloadAction<FormAnalysisSession | null>) => {
      state.formAnalysis.currentSession = action.payload;
    },
    
    addFormAnalysisResult: (state, action: PayloadAction<FormAnalysisResult>) => {
      state.formAnalysis.history.unshift(action.payload);
      
      // Keep only last 50 results for performance
      if (state.formAnalysis.history.length > 50) {
        state.formAnalysis.history = state.formAnalysis.history.slice(0, 50);
      }
    },
    
    setRecommendations: (state, action: PayloadAction<{ userId: string; recommendations: WorkoutRecommendation[] }>) => {
      const { userId, recommendations } = action.payload;
      state.recommendations.current = recommendations;
      state.recommendations.cached.set(userId, recommendations);
      state.recommendations.lastUpdated = new Date().toISOString();
    },
    
    addToProcessingQueue: (state, action: PayloadAction<AIRequest>) => {
      if (state.batchingEnabled) {
        state.processingQueue.push(action.payload);
      }
    },
    
    clearProcessingQueue: (state) => {
      state.processingQueue = [];
    },
    
    setAILoading: (state, action: PayloadAction<boolean>) => {
      state.recommendations.isLoading = action.payload;
      state.formAnalysis.isAnalyzing = action.payload;
    }
  }
});

// Performance monitoring slice
const performanceSlice = createSlice({
  name: 'performance',
  initialState: {
    metrics: {
      actionCount: 0,
      averageActionTime: 0,
      slowActions: [],
      lastActionTime: 0
    },
    enableProfiling: __DEV__,
    optimizationsEnabled: {
      memoization: true,
      debouncing: true,
      virtualization: true,
      imageOptimization: true,
      stateBatching: true
    }
  } as PerformanceState,
  reducers: {
    updatePerformanceMetrics: (state, action: PayloadAction<{ actionType: string; executionTime: number }>) => {
      const { actionType, executionTime } = action.payload;
      
      state.metrics.actionCount += 1;
      state.metrics.lastActionTime = executionTime;
      
      // Update average
      state.metrics.averageActionTime = 
        (state.metrics.averageActionTime * (state.metrics.actionCount - 1) + executionTime) / state.metrics.actionCount;
      
      // Track slow actions
      if (executionTime > 10) {
        state.metrics.slowActions.push(actionType);
        if (state.metrics.slowActions.length > 100) {
          state.metrics.slowActions.shift();
        }
      }
    },
    
    toggleOptimization: (state, action: PayloadAction<{ key: keyof PerformanceState['optimizationsEnabled']; enabled: boolean }>) => {
      const { key, enabled } = action.payload;
      state.optimizationsEnabled[key] = enabled;
    },
    
    resetPerformanceMetrics: (state) => {
      state.metrics = {
        actionCount: 0,
        averageActionTime: 0,
        slowActions: [],
        lastActionTime: 0
      };
    }
  }
});

// Cache slice
const cacheSlice = createSlice({
  name: 'cache',
  initialState: {
    workoutCache: new Map(),
    userCache: new Map(),
    aiCache: new Map(),
    stats: {
      hits: 0,
      misses: 0,
      evictions: 0
    }
  } as CacheState,
  reducers: {
    setCacheEntry: (state, action: PayloadAction<{ type: 'workout' | 'user' | 'ai'; key: string; data: any; ttl: number }>) => {
      const { type, key, data, ttl } = action.payload;
      const entry = createCacheEntry(data, ttl);
      
      switch (type) {
        case 'workout':
          state.workoutCache.set(key, entry);
          break;
        case 'user':
          state.userCache.set(key, entry);
          break;
        case 'ai':
          state.aiCache.set(key, entry);
          break;
      }
    },
    
    incrementCacheHit: (state) => {
      state.stats.hits += 1;
    },
    
    incrementCacheMiss: (state) => {
      state.stats.misses += 1;
    },
    
    evictExpiredCache: (state) => {
      const now = Date.now();
      
      // Evict expired entries
      for (const [key, entry] of state.workoutCache.entries()) {
        if (!isCacheValid(entry.expiry)) {
          state.workoutCache.delete(key);
          state.stats.evictions += 1;
        }
      }
      
      for (const [key, entry] of state.userCache.entries()) {
        if (!isCacheValid(entry.expiry)) {
          state.userCache.delete(key);
          state.stats.evictions += 1;
        }
      }
      
      for (const [key, entry] of state.aiCache.entries()) {
        if (!isCacheValid(entry.expiry)) {
          state.aiCache.delete(key);
          state.stats.evictions += 1;
        }
      }
    }
  }
});

// UI state slice (not persisted)
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    navigation: {
      currentRoute: 'Home',
      history: [],
      canGoBack: false
    },
    modals: {
      activeModals: [],
      backdrop: false
    },
    toasts: [],
    theme: {
      mode: 'light',
      primaryColor: '#007AFF',
      accentColor: '#FF3B30'
    },
    loading: {
      global: false,
      components: new Set<string>()
    }
  } as UIState,
  reducers: {
    setCurrentRoute: (state, action: PayloadAction<string>) => {
      state.navigation.history.push(state.navigation.currentRoute);
      state.navigation.currentRoute = action.payload;
      state.navigation.canGoBack = state.navigation.history.length > 0;
    },
    
    showToast: (state, action: PayloadAction<ToastMessage>) => {
      state.toasts.push(action.payload);
      
      // Auto-remove after timeout
      setTimeout(() => {
        state.toasts.shift();
      }, action.payload.duration || 3000);
    },
    
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    
    setComponentLoading: (state, action: PayloadAction<{ component: string; loading: boolean }>) => {
      if (action.payload.loading) {
        state.loading.components.add(action.payload.component);
      } else {
        state.loading.components.delete(action.payload.component);
      }
    }
  }
});

// Export actions
export const userActions = userSlice.actions;
export const workoutActions = workoutSlice.actions;
export const aiActions = aiSlice.actions;
export const performanceActions = performanceSlice.actions;
export const cacheActions = cacheSlice.actions;
export const uiActions = uiSlice.actions;

// Export reducers (without persistence for now)
export const userReducer = userSlice.reducer;
export const workoutReducer = workoutSlice.reducer;
export const aiReducer = aiSlice.reducer;
export const performanceReducer = performanceSlice.reducer;
export const cacheReducer = cacheSlice.reducer;
export const uiReducer = uiSlice.reducer;

// Type definitions
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  dateOfBirth?: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  units: 'metric' | 'imperial';
  language: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  startTime: string;
  endTime?: string;
  duration?: number;
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  restTime?: number;
  notes?: string;
}

export interface ExerciseSet {
  id: string;
  reps: number;
  weight?: number;
  duration?: number;
  distance?: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Exercise[];
  estimatedDuration: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ProgressData {
  totalWorkouts: number;
  totalExercises: number;
  personalRecords: PersonalRecord[];
  weeklyProgress: WeeklyProgress[];
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  type: 'weight' | 'reps' | 'duration' | 'distance';
  value: number;
  date: string;
}

export interface WeeklyProgress {
  week: string;
  workouts: number;
  totalDuration: number;
  caloriesBurned?: number;
}

export interface FormAnalysisSession {
  id: string;
  userId: string;
  exerciseType: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface FormAnalysisResult {
  id: string;
  sessionId: string;
  timestamp: string;
  overallScore: number;
  feedback: FormFeedback[];
  recommendations: string[];
}

export interface FormFeedback {
  type: 'excellent' | 'good' | 'warning' | 'error';
  message: string;
  bodyPart: string;
  severity: number;
}

export interface WorkoutRecommendation {
  id: string;
  type: 'exercise' | 'workout' | 'rest';
  title: string;
  description: string;
  difficulty: number;
  estimatedDuration: number;
  exercises?: Exercise[];
}

export interface AIRequest {
  id: string;
  type: 'form_analysis' | 'recommendation' | 'feedback';
  payload: any;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface NavigationState {
  currentRoute: string;
  history: string[];
  canGoBack: boolean;
}

export interface ModalState {
  activeModals: string[];
  backdrop: boolean;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface ThemeState {
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
}

export interface LoadingState {
  global: boolean;
  components: Set<string>;
}
