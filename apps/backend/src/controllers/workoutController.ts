import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { WorkoutPlan, IWorkoutPlan } from '../models/WorkoutPlan';
import { WorkoutSession, IWorkoutSession } from '../models/WorkoutSession';
import { Exercise, IExercise } from '../models/Exercise';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

// Workout Plans Controllers

export const createWorkoutPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { name, description, difficulty, duration, exercises, tags, isPublic } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  // Validate exercises exist
  if (exercises && exercises.length > 0) {
    const exerciseIds = exercises.map((ex: any) => ex.exerciseId);
    const existingExercises = await Exercise.find({ _id: { $in: exerciseIds } });
    
    if (existingExercises.length !== exerciseIds.length) {
      return next(new AppError('One or more exercises not found', 400));
    }
  }

  const workoutPlan = await WorkoutPlan.create({
    userId,
    name,
    description,
    difficulty,
    duration,
    exercises: exercises || [],
    tags: tags || [],
    isPublic: isPublic || false
  });

  logger.info('Workout plan created', {
    userId,
    workoutPlanId: workoutPlan._id,
    name: workoutPlan.name
  });

  res.status(201).json({
    status: 'success',
    data: {
      workoutPlan
    }
  });
});

export const getUserWorkoutPlans = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const workoutPlans = await WorkoutPlan.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('exercises.exerciseId', 'name category muscleGroups difficulty');

  const total = await WorkoutPlan.countDocuments({ userId });

  res.status(200).json({
    status: 'success',
    results: workoutPlans.length,
    totalResults: total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      workoutPlans
    }
  });
});

export const getWorkoutPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid workout plan ID', 400));
  }

  const workoutPlan = await WorkoutPlan.findOne({
    _id: id,
    $or: [
      { userId },
      { isPublic: true }
    ]
  }).populate('exercises.exerciseId');

  if (!workoutPlan) {
    return next(new AppError('Workout plan not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      workoutPlan
    }
  });
});

export const updateWorkoutPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?._id;
  const updates = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid workout plan ID', 400));
  }

  // Validate exercises if being updated
  if (updates.exercises && updates.exercises.length > 0) {
    const exerciseIds = updates.exercises.map((ex: any) => ex.exerciseId);
    const existingExercises = await Exercise.find({ _id: { $in: exerciseIds } });
    
    if (existingExercises.length !== exerciseIds.length) {
      return next(new AppError('One or more exercises not found', 400));
    }
  }

  const workoutPlan = await WorkoutPlan.findOneAndUpdate(
    { _id: id, userId },
    updates,
    { new: true, runValidators: true }
  ).populate('exercises.exerciseId');

  if (!workoutPlan) {
    return next(new AppError('Workout plan not found or unauthorized', 404));
  }

  logger.info('Workout plan updated', {
    userId,
    workoutPlanId: workoutPlan._id,
    updates: Object.keys(updates)
  });

  res.status(200).json({
    status: 'success',
    data: {
      workoutPlan
    }
  });
});

export const deleteWorkoutPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid workout plan ID', 400));
  }

  const workoutPlan = await WorkoutPlan.findOneAndDelete({ _id: id, userId });

  if (!workoutPlan) {
    return next(new AppError('Workout plan not found or unauthorized', 404));
  }

  logger.info('Workout plan deleted', {
    userId,
    workoutPlanId: id
  });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Workout Sessions Controllers

export const startWorkoutSession = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { workoutPlanId } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  if (!mongoose.Types.ObjectId.isValid(workoutPlanId)) {
    return next(new AppError('Invalid workout plan ID', 400));
  }

  // Verify workout plan exists and user has access
  const workoutPlan = await WorkoutPlan.findOne({
    _id: workoutPlanId,
    $or: [
      { userId },
      { isPublic: true }
    ]
  }).populate('exercises.exerciseId');

  if (!workoutPlan) {
    return next(new AppError('Workout plan not found or unauthorized', 404));
  }

  // Check if user already has an active session
  const activeSession = await WorkoutSession.findOne({
    userId,
    isCompleted: false
  });

  if (activeSession) {
    return next(new AppError('You already have an active workout session. Please complete or cancel it first.', 400));
  }

  // Create session exercises from workout plan
  const sessionExercises = workoutPlan.exercises.map(planExercise => ({
    exerciseId: planExercise.exerciseId,
    sets: Array.from({ length: planExercise.sets }, (_, index) => ({
      setNumber: index + 1,
      reps: planExercise.reps,
      weight: planExercise.weight,
      duration: planExercise.duration,
      restTime: planExercise.restTime,
      completed: false,
      timestamp: new Date()
    })),
    notes: '',
    skipped: false
  }));

  const workoutSession = await WorkoutSession.create({
    userId,
    workoutPlanId,
    startTime: new Date(),
    isCompleted: false,
    exercises: sessionExercises
  });

  logger.info('Workout session started', {
    userId,
    sessionId: workoutSession._id,
    workoutPlanId
  });

  res.status(201).json({
    status: 'success',
    data: {
      workoutSession
    }
  });
});

export const updateWorkoutSession = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { exerciseIndex, setIndex, setData, notes } = req.body;
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid session ID', 400));
  }

  const session = await WorkoutSession.findOne({ _id: id, userId, isCompleted: false });

  if (!session) {
    return next(new AppError('Active workout session not found', 404));
  }

  // Update specific set if provided
  if (typeof exerciseIndex === 'number' && typeof setIndex === 'number' && setData) {
    if (session.exercises[exerciseIndex] && session.exercises[exerciseIndex].sets[setIndex]) {
      Object.assign(session.exercises[exerciseIndex].sets[setIndex], {
        ...setData,
        timestamp: new Date()
      });
    }
  }

  // Update exercise notes if provided
  if (typeof exerciseIndex === 'number' && notes !== undefined) {
    if (session.exercises[exerciseIndex]) {
      session.exercises[exerciseIndex].notes = notes;
    }
  }

  // Update general session notes if provided
  if (notes && typeof exerciseIndex === 'undefined') {
    session.notes = notes;
  }

  await session.save();

  res.status(200).json({
    status: 'success',
    data: {
      workoutSession: session
    }
  });
});

export const completeWorkoutSession = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { caloriesBurned, notes } = req.body;
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid session ID', 400));
  }

  const session = await WorkoutSession.findOne({ _id: id, userId, isCompleted: false });

  if (!session) {
    return next(new AppError('Active workout session not found', 404));
  }

  session.endTime = new Date();
  session.isCompleted = true;
  
  if (caloriesBurned) {
    session.caloriesBurned = caloriesBurned;
  }
  
  if (notes) {
    session.notes = notes;
  }

  await session.save();

  logger.info('Workout session completed', {
    userId,
    sessionId: session._id,
    duration: session.totalDuration,
    completionPercentage: session.completionPercentage
  });

  res.status(200).json({
    status: 'success',
    data: {
      workoutSession: session
    }
  });
});

export const getUserSessions = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const { startDate, endDate, completed } = req.query;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  // Build query filters
  const filter: any = { userId };
  
  if (startDate || endDate) {
    filter.startTime = {};
    if (startDate) filter.startTime.$gte = new Date(startDate as string);
    if (endDate) filter.startTime.$lte = new Date(endDate as string);
  }
  
  if (completed !== undefined) {
    filter.isCompleted = completed === 'true';
  }

  const sessions = await WorkoutSession.find(filter)
    .sort({ startTime: -1 })
    .skip(skip)
    .limit(limit)
    .populate('workoutPlanId', 'name difficulty duration')
    .populate('exercises.exerciseId', 'name category muscleGroups');

  const total = await WorkoutSession.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: sessions.length,
    totalResults: total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      sessions
    }
  });
});

// Exercise Library Controllers

export const getExercises = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;
  const { category, muscleGroup, equipment, difficulty, search } = req.query;

  // Build query filters
  const filter: any = { isCustom: false };
  
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  if (muscleGroup) filter.muscleGroups = muscleGroup;
  if (equipment) filter.equipment = equipment;

  let exercises;
  
  if (search) {
    // Use text search if search query provided
    exercises = await Exercise.find({
      ...filter,
      $text: { $search: search as string }
    }, {
      score: { $meta: 'textScore' }
    })
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit);
  } else {
    exercises = await Exercise.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);
  }

  const total = await Exercise.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: exercises.length,
    totalResults: total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      exercises
    }
  });
});

export const getExercise = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid exercise ID', 400));
  }

  const exercise = await Exercise.findById(id);

  if (!exercise) {
    return next(new AppError('Exercise not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      exercise
    }
  });
});
