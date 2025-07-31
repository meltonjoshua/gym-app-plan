import mongoose from 'mongoose';
import { Exercise } from '../models/Exercise';
import { logger } from '../utils/logger';

const sampleExercises = [
  // Chest Exercises
  {
    name: 'Push-ups',
    category: 'strength',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: [
      'Start in a plank position with hands shoulder-width apart',
      'Lower your body until your chest nearly touches the floor',
      'Push back up to the starting position',
      'Keep your core engaged throughout the movement'
    ],
    tips: [
      'Keep your body in a straight line',
      'Don\'t let your hips sag or pike up',
      'Control the movement, don\'t rush'
    ],
    variations: ['knee push-ups', 'diamond push-ups', 'incline push-ups'],
    targetMuscles: {
      primary: ['chest'],
      secondary: ['shoulders', 'triceps', 'core']
    },
    caloriesPerMinute: 8,
    isCustom: false
  },
  {
    name: 'Bench Press',
    category: 'strength',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
    instructions: [
      'Lie on bench with feet flat on floor',
      'Grip the bar slightly wider than shoulder-width',
      'Lower the bar to your chest with control',
      'Press the bar back up to full arm extension'
    ],
    tips: [
      'Keep your shoulder blades retracted',
      'Don\'t bounce the bar off your chest',
      'Use a spotter for safety'
    ],
    variations: ['dumbbell bench press', 'incline bench press', 'close-grip bench press'],
    targetMuscles: {
      primary: ['chest'],
      secondary: ['shoulders', 'triceps']
    },
    caloriesPerMinute: 6,
    isCustom: false
  },

  // Back Exercises
  {
    name: 'Pull-ups',
    category: 'strength',
    muscleGroups: ['back', 'biceps'],
    equipment: ['pull-up bar'],
    difficulty: 'intermediate',
    instructions: [
      'Hang from a pull-up bar with palms facing away',
      'Pull your body up until your chin is over the bar',
      'Lower yourself back down with control',
      'Repeat for desired reps'
    ],
    tips: [
      'Engage your core throughout',
      'Don\'t swing or use momentum',
      'Full range of motion is key'
    ],
    variations: ['chin-ups', 'wide-grip pull-ups', 'assisted pull-ups'],
    targetMuscles: {
      primary: ['back'],
      secondary: ['biceps', 'core']
    },
    caloriesPerMinute: 10,
    isCustom: false
  },
  {
    name: 'Bent-over Row',
    category: 'strength',
    muscleGroups: ['back', 'biceps'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    instructions: [
      'Stand with feet hip-width apart, holding a barbell',
      'Hinge at hips and lean forward, keeping back straight',
      'Pull the bar towards your lower chest/upper abdomen',
      'Lower the bar back down with control'
    ],
    tips: [
      'Keep your core engaged',
      'Don\'t round your back',
      'Squeeze shoulder blades together at the top'
    ],
    variations: ['dumbbell row', 'T-bar row', 'cable row'],
    targetMuscles: {
      primary: ['back'],
      secondary: ['biceps', 'rear delts']
    },
    caloriesPerMinute: 7,
    isCustom: false
  },

  // Leg Exercises
  {
    name: 'Squats',
    category: 'strength',
    muscleGroups: ['legs', 'glutes'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your hips back and down as if sitting in a chair',
      'Keep your chest up and knees over your toes',
      'Return to standing position'
    ],
    tips: [
      'Keep your weight on your heels',
      'Don\'t let knees cave inward',
      'Go as low as your mobility allows'
    ],
    variations: ['goblet squats', 'jump squats', 'single-leg squats'],
    targetMuscles: {
      primary: ['quadriceps', 'glutes'],
      secondary: ['hamstrings', 'calves', 'core']
    },
    caloriesPerMinute: 8,
    isCustom: false
  },
  {
    name: 'Deadlift',
    category: 'strength',
    muscleGroups: ['legs', 'back', 'glutes'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend at hips and knees to grip the bar',
      'Keep chest up and back straight',
      'Drive through heels to lift the bar, extending hips and knees'
    ],
    tips: [
      'Keep the bar close to your body',
      'Don\'t round your back',
      'Engage your lats and core'
    ],
    variations: ['Romanian deadlift', 'sumo deadlift', 'trap bar deadlift'],
    targetMuscles: {
      primary: ['hamstrings', 'glutes', 'erector spinae'],
      secondary: ['quadriceps', 'traps', 'forearms']
    },
    caloriesPerMinute: 9,
    isCustom: false
  },

  // Cardio Exercises
  {
    name: 'Running',
    category: 'cardio',
    muscleGroups: ['legs', 'core'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: [
      'Maintain an upright posture',
      'Land on the balls of your feet',
      'Keep arms relaxed and swinging naturally',
      'Breathe rhythmically'
    ],
    tips: [
      'Start with a comfortable pace',
      'Gradually increase distance and speed',
      'Stay hydrated'
    ],
    variations: ['jogging', 'sprinting', 'interval running'],
    targetMuscles: {
      primary: ['quadriceps', 'hamstrings', 'calves'],
      secondary: ['glutes', 'core']
    },
    caloriesPerMinute: 12,
    isCustom: false
  },
  {
    name: 'Burpees',
    category: 'cardio',
    muscleGroups: ['full body'],
    equipment: ['none'],
    difficulty: 'intermediate',
    instructions: [
      'Start standing, then squat down and place hands on floor',
      'Jump feet back into plank position',
      'Do a push-up (optional)',
      'Jump feet back to squat position, then jump up with arms overhead'
    ],
    tips: [
      'Move at your own pace',
      'Modify by stepping instead of jumping',
      'Keep core engaged throughout'
    ],
    variations: ['half burpees', 'burpee box jumps', 'single-arm burpees'],
    targetMuscles: {
      primary: ['full body'],
      secondary: []
    },
    caloriesPerMinute: 15,
    isCustom: false
  },

  // Core Exercises
  {
    name: 'Plank',
    category: 'core',
    muscleGroups: ['core'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: [
      'Start in push-up position on forearms',
      'Keep body in straight line from head to heels',
      'Engage core and hold position',
      'Breathe normally throughout'
    ],
    tips: [
      'Don\'t let hips sag or pike up',
      'Keep neck neutral',
      'Start with shorter holds and build up'
    ],
    variations: ['side plank', 'plank up-downs', 'plank with leg lifts'],
    targetMuscles: {
      primary: ['core'],
      secondary: ['shoulders', 'glutes']
    },
    caloriesPerMinute: 4,
    isCustom: false
  },
  {
    name: 'Mountain Climbers',
    category: 'cardio',
    muscleGroups: ['core', 'legs'],
    equipment: ['none'],
    difficulty: 'intermediate',
    instructions: [
      'Start in plank position',
      'Bring one knee towards chest, then quickly switch legs',
      'Continue alternating legs rapidly',
      'Keep hips level and core engaged'
    ],
    tips: [
      'Maintain plank position throughout',
      'Don\'t let form break down with speed',
      'Land lightly on balls of feet'
    ],
    variations: ['slow mountain climbers', 'cross-body mountain climbers'],
    targetMuscles: {
      primary: ['core', 'hip flexors'],
      secondary: ['shoulders', 'quadriceps']
    },
    caloriesPerMinute: 12,
    isCustom: false
  }
];

export const seedExercises = async (): Promise<void> => {
  try {
    // Check if exercises already exist
    const existingCount = await Exercise.countDocuments({ isCustom: false });
    
    if (existingCount > 0) {
      logger.info(`${existingCount} exercises already exist in database`);
      return;
    }

    // Insert sample exercises
    await Exercise.insertMany(sampleExercises);
    logger.info(`Successfully seeded ${sampleExercises.length} exercises`);
    
  } catch (error) {
    logger.error('Error seeding exercises:', error);
    throw error;
  }
};

// Run seed function if called directly
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fittracker')
    .then(() => {
      logger.info('Connected to MongoDB');
      return seedExercises();
    })
    .then(() => {
      logger.info('Exercise seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}
