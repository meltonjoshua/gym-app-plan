import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'workout' | 'nutrition' | 'progress' | 'social' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number;
  requirement: {
    type: 'streak' | 'total' | 'single' | 'time' | 'percentage';
    value: number;
    metric: string;
  };
  unlockedAt?: Date;
  progress: number; // 0-100
  isUnlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserStats {
  totalWorkouts: number;
  totalSets: number;
  totalReps: number;
  totalTimeMinutes: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  level: number;
  experiencePoints: number;
  experienceToNextLevel: number;
  weeklyGoalProgress: number;
  monthlyGoalProgress: number;
  caloriesBurned: number;
  averageWorkoutDuration: number;
  favoriteExercise: string;
  strongestLift: { exercise: string; weight: number };
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  category: 'workout' | 'nutrition' | 'social';
  target: number;
  progress: number;
  reward: {
    points: number;
    achievement?: string;
    badge?: string;
  };
  startDate: Date;
  endDate: Date;
  isCompleted: boolean;
  isActive: boolean;
}

export interface Leaderboard {
  userId: string;
  username: string;
  avatar?: string;
  points: number;
  level: number;
  rank: number;
  weeklyWorkouts: number;
  currentStreak: number;
  badges: string[];
}

interface GamificationState {
  userStats: UserStats;
  achievements: Achievement[];
  challenges: Challenge[];
  leaderboard: Leaderboard[];
  recentUnlocks: Achievement[];
  dailyStreak: number;
  weeklyProgress: {
    workouts: number;
    target: number;
  };
  pointsToday: number;
  isLoading: boolean;
  error?: string;
}

const initialUserStats: UserStats = {
  totalWorkouts: 0,
  totalSets: 0,
  totalReps: 0,
  totalTimeMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalPoints: 0,
  level: 1,
  experiencePoints: 0,
  experienceToNextLevel: 100,
  weeklyGoalProgress: 0,
  monthlyGoalProgress: 0,
  caloriesBurned: 0,
  averageWorkoutDuration: 0,
  favoriteExercise: '',
  strongestLift: { exercise: '', weight: 0 },
};

const sampleAchievements: Achievement[] = [
  {
    id: 'first_workout',
    title: 'First Steps',
    description: 'Complete your first workout',
    icon: 'fitness',
    category: 'workout',
    tier: 'bronze',
    points: 50,
    requirement: { type: 'total', value: 1, metric: 'workouts' },
    progress: 0,
    isUnlocked: false,
    rarity: 'common'
  },
  {
    id: 'workout_streak_7',
    title: 'Consistency Champion',
    description: 'Maintain a 7-day workout streak',
    icon: 'flame',
    category: 'workout',
    tier: 'gold',
    points: 200,
    requirement: { type: 'streak', value: 7, metric: 'days' },
    progress: 0,
    isUnlocked: false,
    rarity: 'rare'
  },
  {
    id: 'hundred_sets',
    title: 'Century Club',
    description: 'Complete 100 total sets',
    icon: 'trophy',
    category: 'workout',
    tier: 'silver',
    points: 150,
    requirement: { type: 'total', value: 100, metric: 'sets' },
    progress: 0,
    isUnlocked: false,
    rarity: 'common'
  },
  {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Complete all weekly workout goals',
    icon: 'star',
    category: 'workout',
    tier: 'platinum',
    points: 500,
    requirement: { type: 'percentage', value: 100, metric: 'weekly_goal' },
    progress: 0,
    isUnlocked: false,
    rarity: 'epic'
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete 10 workouts before 8 AM',
    icon: 'sunny',
    category: 'workout',
    tier: 'gold',
    points: 300,
    requirement: { type: 'total', value: 10, metric: 'early_workouts' },
    progress: 0,
    isUnlocked: false,
    rarity: 'rare'
  },
  {
    id: 'marathon_session',
    title: 'Marathon Session',
    description: 'Complete a workout longer than 90 minutes',
    icon: 'time',
    category: 'workout',
    tier: 'diamond',
    points: 750,
    requirement: { type: 'single', value: 90, metric: 'workout_minutes' },
    progress: 0,
    isUnlocked: false,
    rarity: 'legendary'
  },
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Share 5 workout achievements',
    icon: 'share-social',
    category: 'social',
    tier: 'bronze',
    points: 100,
    requirement: { type: 'total', value: 5, metric: 'shares' },
    progress: 0,
    isUnlocked: false,
    rarity: 'common'
  },
  {
    id: 'milestone_1000',
    title: 'Thousand Reps',
    description: 'Complete 1000 total reps',
    icon: 'analytics',
    category: 'progress',
    tier: 'platinum',
    points: 1000,
    requirement: { type: 'total', value: 1000, metric: 'reps' },
    progress: 0,
    isUnlocked: false,
    rarity: 'epic'
  }
];

const sampleChallenges: Challenge[] = [
  {
    id: 'daily_pushups',
    title: 'Daily Push-up Challenge',
    description: 'Complete 50 push-ups today',
    type: 'daily',
    category: 'workout',
    target: 50,
    progress: 0,
    reward: { points: 25 },
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    isCompleted: false,
    isActive: true
  },
  {
    id: 'weekly_workouts',
    title: 'Weekly Warrior',
    description: 'Complete 5 workouts this week',
    type: 'weekly',
    category: 'workout',
    target: 5,
    progress: 0,
    reward: { points: 200, badge: 'weekly_warrior' },
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isCompleted: false,
    isActive: true
  }
];

const initialState: GamificationState = {
  userStats: initialUserStats,
  achievements: sampleAchievements,
  challenges: sampleChallenges,
  leaderboard: [],
  recentUnlocks: [],
  dailyStreak: 0,
  weeklyProgress: { workouts: 0, target: 5 },
  pointsToday: 0,
  isLoading: false,
  error: undefined,
};

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    // Update user stats
    updateUserStats: (state, action: PayloadAction<Partial<UserStats>>) => {
      state.userStats = { ...state.userStats, ...action.payload };
      
      // Check for level up
      while (state.userStats.experiencePoints >= state.userStats.experienceToNextLevel) {
        state.userStats.experiencePoints -= state.userStats.experienceToNextLevel;
        state.userStats.level += 1;
        state.userStats.experienceToNextLevel = state.userStats.level * 100; // Scaling XP requirement
      }
    },

    // Add points and experience
    addPoints: (state, action: PayloadAction<{ points: number; source: string }>) => {
      const { points, source } = action.payload;
      state.userStats.totalPoints += points;
      state.userStats.experiencePoints += points;
      state.pointsToday += points;
      
      console.log(`+${points} points from ${source}!`);
    },

    // Complete workout and update stats
    completeWorkout: (state, action: PayloadAction<{
      duration: number;
      sets: number;
      reps: number;
      exercises: string[];
    }>) => {
      const { duration, sets, reps, exercises } = action.payload;
      
      // Update basic stats
      state.userStats.totalWorkouts += 1;
      state.userStats.totalSets += sets;
      state.userStats.totalReps += reps;
      state.userStats.totalTimeMinutes += duration;
      state.userStats.caloriesBurned += Math.floor(sets * 8); // Rough estimate
      
      // Update averages
      state.userStats.averageWorkoutDuration = 
        state.userStats.totalTimeMinutes / state.userStats.totalWorkouts;
      
      // Update streak
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      // Simplified streak logic (in real app, this would be more sophisticated)
      state.userStats.currentStreak += 1;
      if (state.userStats.currentStreak > state.userStats.longestStreak) {
        state.userStats.longestStreak = state.userStats.currentStreak;
      }
      
      // Update weekly progress
      state.weeklyProgress.workouts += 1;
      
      // Award base points for workout completion
      const basePoints = 50 + (duration / 10) + (sets * 2);
      state.userStats.totalPoints += basePoints;
      state.userStats.experiencePoints += basePoints;
      state.pointsToday += basePoints;
    },

    // Unlock achievement
    unlockAchievement: (state, action: PayloadAction<string>) => {
      const achievementId = action.payload;
      const achievement = state.achievements.find(a => a.id === achievementId);
      
      if (achievement && !achievement.isUnlocked) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date();
        achievement.progress = 100;
        
        // Add to recent unlocks
        state.recentUnlocks.unshift(achievement);
        if (state.recentUnlocks.length > 5) {
          state.recentUnlocks.pop();
        }
        
        // Award points
        state.userStats.totalPoints += achievement.points;
        state.userStats.experiencePoints += achievement.points;
        state.pointsToday += achievement.points;
      }
    },

    // Update achievement progress
    updateAchievementProgress: (state, action: PayloadAction<{
      achievementId: string;
      progress: number;
    }>) => {
      const { achievementId, progress } = action.payload;
      const achievement = state.achievements.find(a => a.id === achievementId);
      
      if (achievement && !achievement.isUnlocked) {
        achievement.progress = Math.min(100, progress);
        
        // Auto-unlock if progress reaches 100%
        if (achievement.progress >= 100) {
          achievement.isUnlocked = true;
          achievement.unlockedAt = new Date();
          
          // Add to recent unlocks
          state.recentUnlocks.unshift(achievement);
          if (state.recentUnlocks.length > 5) {
            state.recentUnlocks.pop();
          }
          
          // Award points
          state.userStats.totalPoints += achievement.points;
          state.userStats.experiencePoints += achievement.points;
          state.pointsToday += achievement.points;
        }
      }
    },

    // Complete challenge
    completeChallenge: (state, action: PayloadAction<string>) => {
      const challengeId = action.payload;
      const challenge = state.challenges.find(c => c.id === challengeId);
      
      if (challenge && !challenge.isCompleted) {
        challenge.isCompleted = true;
        challenge.progress = challenge.target;
        
        // Award points
        state.userStats.totalPoints += challenge.reward.points;
        state.userStats.experiencePoints += challenge.reward.points;
        state.pointsToday += challenge.reward.points;
        
        // Unlock achievement if specified
        if (challenge.reward.achievement) {
          const achievement = state.achievements.find(a => a.id === challenge.reward.achievement);
          if (achievement && !achievement.isUnlocked) {
            achievement.isUnlocked = true;
            achievement.unlockedAt = new Date();
            state.recentUnlocks.unshift(achievement);
          }
        }
      }
    },

    // Update challenge progress
    updateChallengeProgress: (state, action: PayloadAction<{
      challengeId: string;
      progress: number;
    }>) => {
      const { challengeId, progress } = action.payload;
      const challenge = state.challenges.find(c => c.id === challengeId);
      
      if (challenge && !challenge.isCompleted) {
        challenge.progress = Math.min(challenge.target, progress);
        
        // Auto-complete if target reached
        if (challenge.progress >= challenge.target) {
          challenge.isCompleted = true;
          
          // Award points
          state.userStats.totalPoints += challenge.reward.points;
          state.userStats.experiencePoints += challenge.reward.points;
          state.pointsToday += challenge.reward.points;
        }
      }
    },

    // Update leaderboard
    updateLeaderboard: (state, action: PayloadAction<Leaderboard[]>) => {
      state.leaderboard = action.payload.sort((a, b) => b.points - a.points)
        .map((user, index) => ({ ...user, rank: index + 1 }));
    },

    // Add new challenge
    addChallenge: (state, action: PayloadAction<Challenge>) => {
      state.challenges.push(action.payload);
    },

    // Remove expired challenges
    removeExpiredChallenges: (state) => {
      const now = new Date();
      state.challenges = state.challenges.filter(challenge => 
        challenge.endDate > now || challenge.isCompleted
      );
    },

    // Reset daily progress
    resetDailyProgress: (state) => {
      state.pointsToday = 0;
      
      // Reset daily challenges
      state.challenges.forEach(challenge => {
        if (challenge.type === 'daily' && !challenge.isCompleted) {
          challenge.progress = 0;
          challenge.startDate = new Date();
          challenge.endDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }
      });
    },

    // Clear recent unlocks
    clearRecentUnlocks: (state) => {
      state.recentUnlocks = [];
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = undefined;
    },
  },
});

export const {
  updateUserStats,
  addPoints,
  completeWorkout,
  unlockAchievement,
  updateAchievementProgress,
  completeChallenge,
  updateChallengeProgress,
  updateLeaderboard,
  addChallenge,
  removeExpiredChallenges,
  resetDailyProgress,
  clearRecentUnlocks,
  setLoading,
  setError,
  clearError,
} = gamificationSlice.actions;

// Selectors
export const selectUserStats = (state: { gamification: GamificationState }) => 
  state.gamification.userStats;

export const selectAchievements = (state: { gamification: GamificationState }) => 
  state.gamification.achievements;

export const selectUnlockedAchievements = (state: { gamification: GamificationState }) => 
  state.gamification.achievements.filter(a => a.isUnlocked);

export const selectActiveAchievements = (state: { gamification: GamificationState }) => 
  state.gamification.achievements.filter(a => !a.isUnlocked);

export const selectAchievementsByCategory = (state: { gamification: GamificationState }, category: string) => 
  state.gamification.achievements.filter(a => a.category === category);

export const selectActiveChallenges = (state: { gamification: GamificationState }) => 
  state.gamification.challenges.filter(c => c.isActive && !c.isCompleted);

export const selectCompletedChallenges = (state: { gamification: GamificationState }) => 
  state.gamification.challenges.filter(c => c.isCompleted);

export const selectLeaderboard = (state: { gamification: GamificationState }) => 
  state.gamification.leaderboard;

export const selectRecentUnlocks = (state: { gamification: GamificationState }) => 
  state.gamification.recentUnlocks;

export const selectUserRank = (state: { gamification: GamificationState }, userId: string) => {
  const user = state.gamification.leaderboard.find(u => u.userId === userId);
  return user?.rank || 0;
};

export const selectProgressToNextLevel = (state: { gamification: GamificationState }) => {
  const stats = state.gamification.userStats;
  return (stats.experiencePoints / stats.experienceToNextLevel) * 100;
};

export default gamificationSlice.reducer;
