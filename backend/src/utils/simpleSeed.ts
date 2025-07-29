import mongoose from 'mongoose';
import { Exercise } from '../models/Exercise';
import { logger } from './logger';

const sampleExercises = [
  {
    name: 'Push-ups',
    description: 'Classic bodyweight exercise targeting chest, shoulders, and triceps',
    category: 'strength',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Start in a plank position with hands shoulder-width apart',
      'Lower your body until your chest nearly touches the floor',
      'Push back up to the starting position',
      'Keep your core engaged throughout the movement'
    ],
    isCustom: false
  },
  {
    name: 'Squats',
    description: 'Fundamental lower body exercise targeting quads and glutes',
    category: 'strength',
    muscleGroups: ['quadriceps', 'glutes'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your hips back and down as if sitting in a chair',
      'Keep your chest up and knees aligned over toes',
      'Return to standing position'
    ],
    isCustom: false
  },
  {
    name: 'Pull-ups',
    description: 'Compound bodyweight exercise targeting back and biceps',
    category: 'strength',
    muscleGroups: ['back', 'biceps'],
    equipment: ['pull-up-bar'],
    difficulty: 'intermediate',
    instructions: [
      'Hang from pull-up bar with palms facing away',
      'Pull your body up until chin clears the bar',
      'Lower yourself back down with control',
      'Keep your core engaged throughout'
    ],
    isCustom: false
  },
  {
    name: 'Plank',
    description: 'Isometric core strengthening exercise',
    category: 'strength',
    muscleGroups: ['core', 'abs'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Start in push-up position',
      'Hold your body in straight line',
      'Keep core engaged, breathe normally',
      'Hold for desired time'
    ],
    isCustom: false
  },
  {
    name: 'Running',
    description: 'Cardiovascular exercise for endurance and health',
    category: 'cardio',
    muscleGroups: ['full-body'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Start with light warm-up walk',
      'Gradually increase pace to comfortable run',
      'Maintain steady breathing',
      'Cool down with walking'
    ],
    isCustom: false
  }
];

export const seedExercises = async (): Promise<void> => {
  try {
    const existingCount = await Exercise.countDocuments();
    if (existingCount > 0) {
      logger.info(`Database already has ${existingCount} exercises, skipping seed`);
      return;
    }

    await Exercise.insertMany(sampleExercises);
    logger.info(`Seeded ${sampleExercises.length} exercises successfully`);
    
  } catch (error) {
    logger.error('Error seeding exercises:', error);
    throw error;
  }
};
