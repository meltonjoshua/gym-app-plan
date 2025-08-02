import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  SocialState, 
  Friend, 
  FriendRequest, 
  Challenge, 
  WorkoutShare, 
  Leaderboard, 
  Achievement,
  ChallengeParticipant 
} from '../../types';

const initialState: SocialState = {
  friends: [],
  friendRequests: [],
  challenges: [],
  workoutShares: [],
  leaderboards: [],
  achievements: [],
  isLoading: false,
  error: undefined,
};

const socialSlice = createSlice({
  name: 'social',
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

    // Friends Management
    setFriends: (state, action: PayloadAction<Friend[]>) => {
      state.friends = action.payload;
    },
    addFriend: (state, action: PayloadAction<Friend>) => {
      state.friends.push(action.payload);
    },
    removeFriend: (state, action: PayloadAction<string>) => {
      state.friends = state.friends.filter(friend => friend.id !== action.payload);
    },
    updateFriend: (state, action: PayloadAction<Friend>) => {
      const index = state.friends.findIndex(friend => friend.id === action.payload.id);
      if (index !== -1) {
        state.friends[index] = action.payload;
      }
    },

    // Friend Requests Management
    setFriendRequests: (state, action: PayloadAction<FriendRequest[]>) => {
      state.friendRequests = action.payload;
    },
    addFriendRequest: (state, action: PayloadAction<FriendRequest>) => {
      state.friendRequests.push(action.payload);
    },
    removeFriendRequest: (state, action: PayloadAction<string>) => {
      state.friendRequests = state.friendRequests.filter(request => request.id !== action.payload);
    },
    updateFriendRequest: (state, action: PayloadAction<FriendRequest>) => {
      const index = state.friendRequests.findIndex(request => request.id === action.payload.id);
      if (index !== -1) {
        state.friendRequests[index] = action.payload;
      }
    },

    // Challenges Management
    setChallenges: (state, action: PayloadAction<Challenge[]>) => {
      state.challenges = action.payload;
    },
    addChallenge: (state, action: PayloadAction<Challenge>) => {
      state.challenges.push(action.payload);
    },
    updateChallenge: (state, action: PayloadAction<Challenge>) => {
      const index = state.challenges.findIndex(challenge => challenge.id === action.payload.id);
      if (index !== -1) {
        state.challenges[index] = action.payload;
      }
    },
    removeChallenge: (state, action: PayloadAction<string>) => {
      state.challenges = state.challenges.filter(challenge => challenge.id !== action.payload);
    },
    joinChallenge: (state, action: PayloadAction<{ challengeId: string; participant: ChallengeParticipant }>) => {
      const challenge = state.challenges.find(c => c.id === action.payload.challengeId);
      if (challenge) {
        challenge.participants.push(action.payload.participant);
      }
    },
    updateChallengeProgress: (state, action: PayloadAction<{ challengeId: string; userId: string; value: number }>) => {
      const challenge = state.challenges.find(c => c.id === action.payload.challengeId);
      if (challenge) {
        const participant = challenge.participants.find(p => p.userId === action.payload.userId);
        if (participant) {
          participant.currentValue = action.payload.value;
        }
      }
    },

    // Workout Shares Management
    setWorkoutShares: (state, action: PayloadAction<WorkoutShare[]>) => {
      state.workoutShares = action.payload;
    },
    addWorkoutShare: (state, action: PayloadAction<WorkoutShare>) => {
      state.workoutShares.unshift(action.payload); // Add to beginning for chronological order
    },
    updateWorkoutShare: (state, action: PayloadAction<WorkoutShare>) => {
      const index = state.workoutShares.findIndex(share => share.id === action.payload.id);
      if (index !== -1) {
        state.workoutShares[index] = action.payload;
      }
    },
    likeWorkoutShare: (state, action: PayloadAction<{ shareId: string; userId: string }>) => {
      const share = state.workoutShares.find(s => s.id === action.payload.shareId);
      if (share) {
        const likeIndex = share.likes.indexOf(action.payload.userId);
        if (likeIndex === -1) {
          share.likes.push(action.payload.userId);
        } else {
          share.likes.splice(likeIndex, 1);
        }
      }
    },
    addWorkoutComment: (state, action: PayloadAction<{ shareId: string; comment: any }>) => {
      const share = state.workoutShares.find(s => s.id === action.payload.shareId);
      if (share) {
        share.comments.push(action.payload.comment);
      }
    },

    // Leaderboards Management
    setLeaderboards: (state, action: PayloadAction<Leaderboard[]>) => {
      state.leaderboards = action.payload;
    },
    updateLeaderboard: (state, action: PayloadAction<Leaderboard>) => {
      const index = state.leaderboards.findIndex(board => board.id === action.payload.id);
      if (index !== -1) {
        state.leaderboards[index] = action.payload;
      } else {
        state.leaderboards.push(action.payload);
      }
    },

    // Achievements Management
    setAchievements: (state, action: PayloadAction<Achievement[]>) => {
      state.achievements = action.payload;
    },
    unlockAchievement: (state, action: PayloadAction<Achievement>) => {
      const index = state.achievements.findIndex(achievement => achievement.id === action.payload.id);
      if (index !== -1) {
        state.achievements[index] = { ...action.payload, isUnlocked: true, unlockedDate: new Date() };
      } else {
        state.achievements.push({ ...action.payload, isUnlocked: true, unlockedDate: new Date() });
      }
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setFriends,
  addFriend,
  removeFriend,
  updateFriend,
  setFriendRequests,
  addFriendRequest,
  removeFriendRequest,
  updateFriendRequest,
  setChallenges,
  addChallenge,
  updateChallenge,
  removeChallenge,
  joinChallenge,
  updateChallengeProgress,
  setWorkoutShares,
  addWorkoutShare,
  updateWorkoutShare,
  likeWorkoutShare,
  addWorkoutComment,
  setLeaderboards,
  updateLeaderboard,
  setAchievements,
  unlockAchievement,
} = socialSlice.actions;

export default socialSlice.reducer;