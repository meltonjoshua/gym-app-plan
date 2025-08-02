import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  // Workout Plans
  createWorkoutPlan,
  getUserWorkoutPlans,
  getWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  
  // Workout Sessions
  startWorkoutSession,
  updateWorkoutSession,
  completeWorkoutSession,
  getUserSessions,
  
  // Exercise Library
  getExercises,
  getExercise
} from '../controllers/workoutController';

const router = Router();

// Exercise Library Routes (public)
router.get('/exercises', getExercises);
router.get('/exercises/:id', getExercise);

// Protected routes - require authentication
router.use(authenticate);

// Workout Plan Routes
router.post('/plans', createWorkoutPlan);
router.get('/plans', getUserWorkoutPlans);
router.get('/plans/:id', getWorkoutPlan);
router.put('/plans/:id', updateWorkoutPlan);
router.delete('/plans/:id', deleteWorkoutPlan);

// Workout Session Routes
router.post('/sessions', startWorkoutSession);
router.get('/sessions', getUserSessions);
router.put('/sessions/:id', updateWorkoutSession);
router.put('/sessions/:id/complete', completeWorkoutSession);

export { router as workoutRoutes };