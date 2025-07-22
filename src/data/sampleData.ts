import { 
  Exercise, 
  WorkoutPlan, 
  Workout, 
  WorkoutExercise, 
  Food,
  // Phase 2 imports
  SocialUser, 
  Friend, 
  FriendRequest, 
  Challenge, 
  WorkoutShare, 
  Achievement, 
  Leaderboard,
  WorkoutRecommendation,
  WearableData 
} from '../types';

// Sample exercises data
export const sampleExercises: Exercise[] = [
  {
    id: 'ex1',
    name: 'Push-ups',
    description: 'Classic upper body exercise targeting chest, shoulders, and triceps',
    instructions: [
      'Start in a plank position with hands slightly wider than shoulder-width apart',
      'Lower your body until your chest nearly touches the floor',
      'Push back up to the starting position',
      'Keep your body in a straight line throughout the movement',
    ],
    category: 'strength',
    muscleGroups: ['chest', 'shoulders', 'triceps', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    restTime: 60,
  },
  {
    id: 'ex2',
    name: 'Squats',
    description: 'Fundamental lower body exercise for legs and glutes',
    instructions: [
      'Stand with feet shoulder-width apart, toes slightly turned out',
      'Lower your hips as if sitting back into a chair',
      'Keep your chest up and knees aligned with your toes',
      'Push through your heels to return to standing',
    ],
    category: 'strength',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    restTime: 60,
  },
  {
    id: 'ex3',
    name: 'Plank',
    description: 'Core strengthening exercise',
    instructions: [
      'Start in a push-up position',
      'Lower down to your forearms',
      'Keep your body in a straight line from head to heels',
      'Hold the position while breathing normally',
    ],
    category: 'core',
    muscleGroups: ['core', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    duration: 30,
    restTime: 60,
  },
  {
    id: 'ex4',
    name: 'Burpees',
    description: 'Full-body exercise combining strength and cardio',
    instructions: [
      'Start in a standing position',
      'Drop into a squat and place hands on the floor',
      'Jump feet back into a plank position',
      'Do a push-up (optional)',
      'Jump feet back to squat position',
      'Explode up with arms overhead',
    ],
    category: 'plyometric',
    muscleGroups: ['fullBody'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    restTime: 90,
  },
  {
    id: 'ex5',
    name: 'Dumbbell Bench Press',
    description: 'Upper body pressing exercise using dumbbells',
    instructions: [
      'Lie on a bench with dumbbells in each hand',
      'Start with dumbbells at chest level',
      'Press weights up until arms are extended',
      'Lower weights back to chest level with control',
    ],
    category: 'strength',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    equipment: ['dumbbells', 'bench'],
    difficulty: 'intermediate',
    restTime: 90,
  },
  {
    id: 'ex6',
    name: 'Deadlift',
    description: 'Compound exercise targeting posterior chain',
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend at hips and knees to grip the bar',
      'Keep chest up and back neutral',
      'Drive through heels to lift the bar',
      'Stand tall, then lower with control',
    ],
    category: 'strength',
    muscleGroups: ['hamstrings', 'glutes', 'back', 'core'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    restTime: 120,
  },
];

// Sample workout exercises
const beginnerWorkoutExercises: WorkoutExercise[] = [
  { exerciseId: 'ex1', sets: 3, reps: 10, restTime: 60 },
  { exerciseId: 'ex2', sets: 3, reps: 15, restTime: 60 },
  { exerciseId: 'ex3', sets: 3, duration: 30, restTime: 60 },
];

const intermediateWorkoutExercises: WorkoutExercise[] = [
  { exerciseId: 'ex1', sets: 3, reps: 15, restTime: 60 },
  { exerciseId: 'ex2', sets: 3, reps: 20, restTime: 60 },
  { exerciseId: 'ex4', sets: 3, reps: 10, restTime: 90 },
  { exerciseId: 'ex5', sets: 3, reps: 12, weight: 15, restTime: 90 },
];

// Sample workouts
export const sampleWorkouts: Workout[] = [
  {
    id: 'w1',
    name: 'Beginner Full Body',
    description: 'A simple full-body workout perfect for beginners',
    exercises: beginnerWorkoutExercises,
    estimatedDuration: 30,
    difficulty: 'beginner',
    category: 'strength',
  },
  {
    id: 'w2',
    name: 'Upper Body Strength',
    description: 'Focus on building upper body strength',
    exercises: intermediateWorkoutExercises,
    estimatedDuration: 45,
    difficulty: 'intermediate',
    category: 'strength',
  },
  {
    id: 'w3',
    name: 'HIIT Cardio',
    description: 'High-intensity interval training for cardiovascular fitness',
    exercises: [
      { exerciseId: 'ex4', sets: 4, reps: 8, restTime: 30 },
      { exerciseId: 'ex1', sets: 4, reps: 10, restTime: 30 },
      { exerciseId: 'ex2', sets: 4, reps: 15, restTime: 30 },
    ],
    estimatedDuration: 25,
    difficulty: 'intermediate',
    category: 'cardio',
  },
];

// Sample workout plans
export const sampleWorkoutPlans: WorkoutPlan[] = [
  {
    id: 'p1',
    name: 'Beginner Fitness Journey',
    description: 'Perfect for those starting their fitness journey',
    duration: 8,
    difficulty: 'beginner',
    goal: 'weight_loss',
    workoutsPerWeek: 3,
    estimatedTimePerWorkout: 30,
    workouts: [sampleWorkouts[0]],
    isCustom: false,
  },
  {
    id: 'p2',
    name: 'Strength Builder',
    description: 'Build strength and muscle mass',
    duration: 12,
    difficulty: 'intermediate',
    goal: 'muscle_gain',
    workoutsPerWeek: 4,
    estimatedTimePerWorkout: 45,
    workouts: [sampleWorkouts[1], sampleWorkouts[0]],
    isCustom: false,
  },
  {
    id: 'p3',
    name: 'Fat Burn Challenge',
    description: 'High-intensity workouts for maximum calorie burn',
    duration: 6,
    difficulty: 'intermediate',
    goal: 'weight_loss',
    workoutsPerWeek: 5,
    estimatedTimePerWorkout: 25,
    workouts: [sampleWorkouts[2], sampleWorkouts[0]],
    isCustom: false,
  },
];

// Sample foods
export const sampleFoods: Food[] = [
  {
    id: 'f1',
    name: 'Banana',
    servingSize: 1,
    servingUnit: 'medium (118g)',
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    fiber: 3.1,
    sugar: 14.4,
  },
  {
    id: 'f2',
    name: 'Chicken Breast',
    servingSize: 100,
    servingUnit: 'grams',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
  },
  {
    id: 'f3',
    name: 'Brown Rice',
    servingSize: 100,
    servingUnit: 'grams cooked',
    calories: 112,
    protein: 2.6,
    carbs: 23,
    fat: 0.9,
    fiber: 1.8,
    sugar: 0.4,
  },
  {
    id: 'f4',
    name: 'Greek Yogurt',
    servingSize: 150,
    servingUnit: 'grams',
    calories: 130,
    protein: 15,
    carbs: 11,
    fat: 4,
    fiber: 0,
    sugar: 11,
  },
  {
    id: 'f5',
    name: 'Almonds',
    servingSize: 28,
    servingUnit: 'grams (about 23 nuts)',
    calories: 164,
    protein: 6,
    carbs: 6,
    fat: 14,
    fiber: 3.5,
    sugar: 1.2,
  },
];

// Phase 2: Social Features Sample Data

export const sampleSocialUsers: SocialUser[] = [
  {
    id: 'user1',
    name: 'Alex Chen',
    profilePhoto: 'https://via.placeholder.com/100x100?text=AC',
    fitnessLevel: 'intermediate',
    joinDate: new Date('2024-01-15'),
    totalWorkouts: 145,
    currentStreak: 7,
    achievements: [],
  },
  {
    id: 'user2', 
    name: 'Sarah Johnson',
    profilePhoto: 'https://via.placeholder.com/100x100?text=SJ',
    fitnessLevel: 'advanced',
    joinDate: new Date('2023-11-20'),
    totalWorkouts: 230,
    currentStreak: 12,
    achievements: [],
  },
  {
    id: 'user3',
    name: 'Mike Rodriguez', 
    profilePhoto: 'https://via.placeholder.com/100x100?text=MR',
    fitnessLevel: 'beginner',
    joinDate: new Date('2024-06-01'),
    totalWorkouts: 28,
    currentStreak: 3,
    achievements: [],
  },
];

export const sampleFriends: Friend[] = [
  {
    id: 'friend1',
    userId: 'currentUser',
    friendId: 'user1',
    status: 'accepted',
    createdDate: new Date('2024-07-01'),
    acceptedDate: new Date('2024-07-01'),
  },
  {
    id: 'friend2',
    userId: 'currentUser', 
    friendId: 'user2',
    status: 'accepted',
    createdDate: new Date('2024-07-10'),
    acceptedDate: new Date('2024-07-10'),
  },
];

export const sampleFriendRequests: FriendRequest[] = [
  {
    id: 'req1',
    senderId: 'user3',
    receiverId: 'currentUser',
    senderName: 'Mike Rodriguez',
    senderPhoto: 'https://via.placeholder.com/100x100?text=MR',
    message: 'Hey! I saw your workout progress and would love to connect!',
    status: 'pending',
    createdDate: new Date('2024-07-20'),
  },
];

export const sampleChallenges: Challenge[] = [
  {
    id: 'challenge1',
    title: '30-Day Push-up Challenge',
    description: 'Complete 1000 push-ups in 30 days',
    type: 'workout_count',
    targetValue: 1000,
    unit: 'push-ups',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-07-31'),
    participants: [
      {
        userId: 'currentUser',
        userName: 'You',
        currentValue: 450,
        joinDate: new Date('2024-07-01'),
        rank: 2,
      },
      {
        userId: 'user1',
        userName: 'Alex Chen',
        userPhoto: 'https://via.placeholder.com/100x100?text=AC',
        currentValue: 520,
        joinDate: new Date('2024-07-01'),
        rank: 1,
      },
      {
        userId: 'user2',
        userName: 'Sarah Johnson', 
        userPhoto: 'https://via.placeholder.com/100x100?text=SJ',
        currentValue: 380,
        joinDate: new Date('2024-07-03'),
        rank: 3,
      },
    ],
    createdBy: 'user1',
    isPublic: true,
    prize: 'Fitness gear voucher',
    status: 'active',
  },
  {
    id: 'challenge2',
    title: 'Summer Cardio Blast',
    description: 'Burn 10,000 calories through cardio exercises',
    type: 'calories',
    targetValue: 10000,
    unit: 'calories',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31'),
    participants: [
      {
        userId: 'currentUser',
        userName: 'You',
        currentValue: 3500,
        joinDate: new Date('2024-06-01'),
        rank: 1,
      },
    ],
    createdBy: 'currentUser',
    isPublic: false,
    status: 'active',
  },
];

export const sampleAchievements: Achievement[] = [
  {
    id: 'achieve1',
    title: 'First Workout',
    description: 'Complete your first workout session',
    iconName: 'trophy-outline',
    iconColor: '#FFD700',
    category: 'workout',
    isUnlocked: true,
    unlockedDate: new Date('2024-06-15'),
    requirement: {
      type: 'workout_count',
      value: 1,
    },
  },
  {
    id: 'achieve2',
    title: 'Week Warrior',
    description: 'Maintain a 7-day workout streak',
    iconName: 'flame',
    iconColor: '#FF4500',
    category: 'streak',
    isUnlocked: true,
    unlockedDate: new Date('2024-07-15'),
    requirement: {
      type: 'streak_days',
      value: 7,
    },
  },
  {
    id: 'achieve3',
    title: 'Social Butterfly',
    description: 'Add 5 friends to your network',
    iconName: 'people',
    iconColor: '#4169E1',
    category: 'social',
    isUnlocked: false,
    requirement: {
      type: 'friends_count',
      value: 5,
    },
  },
];

export const sampleWorkoutShares: WorkoutShare[] = [
  {
    id: 'share1',
    workoutSessionId: 'session1',
    userId: 'user1',
    userName: 'Alex Chen',
    userPhoto: 'https://via.placeholder.com/100x100?text=AC',
    workoutName: 'Upper Body Strength',
    duration: 45,
    completedAt: new Date('2024-07-21T10:30:00'),
    sharedAt: new Date('2024-07-21T10:35:00'),
    caption: 'Crushed my morning workout! Feeling stronger every day 💪',
    likes: ['currentUser', 'user2'],
    comments: [
      {
        id: 'comment1',
        userId: 'currentUser',
        userName: 'You',
        message: 'Great job! Your consistency is inspiring',
        createdAt: new Date('2024-07-21T11:00:00'),
      },
    ],
    isPublic: true,
  },
];

export const sampleLeaderboards: Leaderboard[] = [
  {
    id: 'weekly_workouts',
    type: 'weekly_workouts',
    title: 'This Week\'s Workout Champions',
    period: 'weekly',
    entries: [
      {
        userId: 'user2',
        userName: 'Sarah Johnson',
        userPhoto: 'https://via.placeholder.com/100x100?text=SJ',
        value: 6,
        rank: 1,
        change: 2,
      },
      {
        userId: 'user1', 
        userName: 'Alex Chen',
        userPhoto: 'https://via.placeholder.com/100x100?text=AC',
        value: 5,
        rank: 2,
        change: 0,
      },
      {
        userId: 'currentUser',
        userName: 'You',
        value: 4,
        rank: 3,
        change: -1,
      },
    ],
    lastUpdated: new Date(),
  },
];

export const sampleRecommendations: WorkoutRecommendation[] = [
  {
    id: 'rec1',
    userId: 'currentUser',
    recommendationType: 'next_workout',
    workoutPlanId: 'plan1',
    workoutId: 'workout1',
    title: 'Perfect Time for Upper Body',
    description: 'Based on your recent lower body focus, it\'s ideal to work on upper body today',
    reasoning: [
      'You\'ve done 2 lower body workouts this week',
      'Your chest and shoulders had 48+ hours of rest',
      'Today is typically your high-energy day'
    ],
    confidence: 0.85,
    createdAt: new Date(),
    isViewed: false,
    isApplied: false,
  },
  {
    id: 'rec2',
    userId: 'currentUser',
    recommendationType: 'rest_day',
    title: 'Recovery Day Recommended',
    description: 'Your body could benefit from a rest day or light stretching',
    reasoning: [
      'You\'ve done 5 intense workouts this week',
      'Your average workout intensity has been high',
      'Recovery promotes better gains'
    ],
    confidence: 0.92,
    createdAt: new Date(),
    isViewed: false,
    isApplied: false,
  },
];

export const sampleWearableData: WearableData[] = [
  {
    id: 'device1',
    userId: 'currentUser',
    deviceType: 'smartwatch',
    deviceName: 'Apple Watch Series 8',
    syncTime: new Date(),
    data: {
      heartRate: [72, 68, 75, 82, 79, 71, 69, 73, 77, 80, 85, 83, 78, 74, 70, 72, 69, 71, 73, 75, 78, 80, 76, 72],
      steps: 8547,
      calories: 2134,
      activeMinutes: 67,
      sleepHours: 7.5,
      restingHeartRate: 65,
    },
  },
];