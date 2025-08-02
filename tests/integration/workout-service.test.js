const request = require('supertest');
const express = require('express');

// Import the workout service routes
const workoutRoutes = require('../../apps/microservices/workout-service/src/routes/workouts');
const exerciseRoutes = require('../../apps/microservices/workout-service/src/routes/exercises');
const routineRoutes = require('../../apps/microservices/workout-service/src/routes/routines');
const trackingRoutes = require('../../apps/microservices/workout-service/src/routes/tracking');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/v1/workouts', workoutRoutes);
app.use('/api/v1/exercises', exerciseRoutes);
app.use('/api/v1/routines', routineRoutes);
app.use('/api/v1/tracking', trackingRoutes);

describe('Workout Service Integration Tests', () => {
  describe('Workout Management Endpoints', () => {
    test('GET /api/v1/workouts/health should return service status', async () => {
      const response = await request(app)
        .get('/api/v1/workouts/health')
        .expect(200);

      expect(response.body).toHaveProperty('service', 'workouts');
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body.features).toContain('create');
      expect(response.body.features).toContain('analytics');
    });

    test('GET /api/v1/workouts should return workout list', async () => {
      const response = await request(app)
        .get('/api/v1/workouts?userId=test_user_123')
        .expect(200);

      expect(response.body).toHaveProperty('workouts');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.workouts)).toBe(true);
      
      if (response.body.workouts.length > 0) {
        const workout = response.body.workouts[0];
        expect(workout).toHaveProperty('id');
        expect(workout).toHaveProperty('name');
        expect(workout).toHaveProperty('type');
        expect(workout).toHaveProperty('exercises');
      }
    });

    test('POST /api/v1/workouts should create new workout', async () => {
      const workoutData = {
        userId: 'test_user_123',
        name: 'Test Workout',
        type: 'strength',
        exercises: [
          { name: 'Push-ups', sets: 3, reps: 10 },
          { name: 'Squats', sets: 3, reps: 15 }
        ]
      };

      const response = await request(app)
        .post('/api/v1/workouts')
        .send(workoutData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Workout created successfully');
      expect(response.body).toHaveProperty('workout');
      expect(response.body.workout).toHaveProperty('id');
      expect(response.body.workout).toHaveProperty('name', workoutData.name);
      expect(response.body.workout).toHaveProperty('type', workoutData.type);
    });

    test('GET /api/v1/workouts/:id should return specific workout', async () => {
      const workoutId = 'test_workout_123';
      const response = await request(app)
        .get(`/api/v1/workouts/${workoutId}`)
        .expect(200);

      expect(response.body).toHaveProperty('workout');
      expect(response.body.workout).toHaveProperty('id', workoutId);
      expect(response.body.workout).toHaveProperty('exercises');
      expect(Array.isArray(response.body.workout.exercises)).toBe(true);
    });

    test('PUT /api/v1/workouts/:id should update workout', async () => {
      const workoutId = 'test_workout_123';
      const updateData = {
        name: 'Updated Workout Name',
        status: 'in_progress'
      };

      const response = await request(app)
        .put(`/api/v1/workouts/${workoutId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Workout updated successfully');
      expect(response.body.workout).toHaveProperty('id', workoutId);
      expect(response.body.workout).toHaveProperty('updatedAt');
    });

    test('POST /api/v1/workouts/:id/complete should complete workout', async () => {
      const workoutId = 'test_workout_123';
      const completionData = {
        duration: 45,
        caloriesBurned: 350,
        exercises: [
          { name: 'Push-ups', sets: 3, reps: 12, completed: true },
          { name: 'Squats', sets: 3, reps: 15, completed: true }
        ]
      };

      const response = await request(app)
        .post(`/api/v1/workouts/${workoutId}/complete`)
        .send(completionData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Workout completed successfully');
      expect(response.body.workout).toHaveProperty('status', 'completed');
      expect(response.body.workout).toHaveProperty('completedAt');
    });
  });

  describe('Exercise Library Endpoints', () => {
    test('GET /api/v1/exercises/health should return service status', async () => {
      const response = await request(app)
        .get('/api/v1/exercises/health')
        .expect(200);

      expect(response.body).toHaveProperty('service', 'exercises');
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body.features).toContain('library');
      expect(response.body.features).toContain('search');
    });

    test('GET /api/v1/exercises should return exercise library', async () => {
      const response = await request(app)
        .get('/api/v1/exercises')
        .expect(200);

      expect(response.body).toHaveProperty('exercises');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.exercises)).toBe(true);
      
      if (response.body.exercises.length > 0) {
        const exercise = response.body.exercises[0];
        expect(exercise).toHaveProperty('id');
        expect(exercise).toHaveProperty('name');
        expect(exercise).toHaveProperty('category');
        expect(exercise).toHaveProperty('muscleGroups');
        expect(exercise).toHaveProperty('difficulty');
      }
    });

    test('GET /api/v1/exercises with filters should return filtered results', async () => {
      const response = await request(app)
        .get('/api/v1/exercises?category=strength&difficulty=beginner')
        .expect(200);

      expect(response.body).toHaveProperty('exercises');
      
      response.body.exercises.forEach(exercise => {
        expect(exercise.category).toBe('strength');
        expect(exercise.difficulty).toBe('beginner');
      });
    });

    test('GET /api/v1/exercises/:id should return specific exercise', async () => {
      const exerciseId = 'ex_bench_press';
      const response = await request(app)
        .get(`/api/v1/exercises/${exerciseId}`)
        .expect(200);

      expect(response.body).toHaveProperty('exercise');
      expect(response.body.exercise).toHaveProperty('id', exerciseId);
      expect(response.body.exercise).toHaveProperty('instructions');
      expect(response.body.exercise).toHaveProperty('tips');
      expect(Array.isArray(response.body.exercise.instructions)).toBe(true);
    });

    test('GET /api/v1/exercises/categories should return exercise categories', async () => {
      const response = await request(app)
        .get('/api/v1/exercises/categories')
        .expect(200);

      expect(response.body).toHaveProperty('categories');
      expect(Array.isArray(response.body.categories)).toBe(true);
      
      if (response.body.categories.length > 0) {
        const category = response.body.categories[0];
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('count');
      }
    });

    test('GET /api/v1/exercises/muscle-groups should return muscle groups', async () => {
      const response = await request(app)
        .get('/api/v1/exercises/muscle-groups')
        .expect(200);

      expect(response.body).toHaveProperty('muscleGroups');
      expect(Array.isArray(response.body.muscleGroups)).toBe(true);
      
      if (response.body.muscleGroups.length > 0) {
        const muscleGroup = response.body.muscleGroups[0];
        expect(muscleGroup).toHaveProperty('id');
        expect(muscleGroup).toHaveProperty('name');
        expect(muscleGroup).toHaveProperty('exercises');
      }
    });
  });

  describe('Routine Management Endpoints', () => {
    test('GET /api/v1/routines/health should return service status', async () => {
      const response = await request(app)
        .get('/api/v1/routines/health')
        .expect(200);

      expect(response.body).toHaveProperty('service', 'routines');
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body.features).toContain('templates');
      expect(response.body.features).toContain('custom');
    });

    test('GET /api/v1/routines should return routine list', async () => {
      const response = await request(app)
        .get('/api/v1/routines')
        .expect(200);

      expect(response.body).toHaveProperty('routines');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.routines)).toBe(true);
      
      if (response.body.routines.length > 0) {
        const routine = response.body.routines[0];
        expect(routine).toHaveProperty('id');
        expect(routine).toHaveProperty('name');
        expect(routine).toHaveProperty('type');
        expect(routine).toHaveProperty('difficulty');
        expect(routine).toHaveProperty('exercises');
      }
    });

    test('POST /api/v1/routines should create new routine', async () => {
      const routineData = {
        name: 'Test Routine',
        type: 'strength',
        difficulty: 'intermediate',
        exercises: [
          { exerciseId: 'ex_1', sets: 4, reps: 8, rest: 90 },
          { exerciseId: 'ex_2', sets: 3, reps: 12, rest: 60 }
        ],
        userId: 'test_user_123'
      };

      const response = await request(app)
        .post('/api/v1/routines')
        .send(routineData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Routine created successfully');
      expect(response.body).toHaveProperty('routine');
      expect(response.body.routine).toHaveProperty('id');
      expect(response.body.routine).toHaveProperty('name', routineData.name);
    });

    test('GET /api/v1/routines/:id should return specific routine', async () => {
      const routineId = 'routine_upper_lower';
      const response = await request(app)
        .get(`/api/v1/routines/${routineId}`)
        .expect(200);

      expect(response.body).toHaveProperty('routine');
      expect(response.body.routine).toHaveProperty('id', routineId);
      expect(response.body.routine).toHaveProperty('exercises');
      expect(response.body.routine).toHaveProperty('weeks');
    });

    test('GET /api/v1/routines/popular should return popular routines', async () => {
      const response = await request(app)
        .get('/api/v1/routines/popular')
        .expect(200);

      expect(response.body).toHaveProperty('routines');
      expect(Array.isArray(response.body.routines)).toBe(true);
      
      if (response.body.routines.length > 0) {
        const routine = response.body.routines[0];
        expect(routine).toHaveProperty('id');
        expect(routine).toHaveProperty('name');
        expect(routine).toHaveProperty('usedBy');
        expect(routine).toHaveProperty('rating');
      }
    });
  });

  describe('Progress Tracking Endpoints', () => {
    test('GET /api/v1/tracking/health should return service status', async () => {
      const response = await request(app)
        .get('/api/v1/tracking/health')
        .expect(200);

      expect(response.body).toHaveProperty('service', 'tracking');
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body.features).toContain('progress');
      expect(response.body.features).toContain('analytics');
    });

    test('GET /api/v1/tracking/:userId/progress should return user progress', async () => {
      const userId = 'test_user_123';
      const response = await request(app)
        .get(`/api/v1/tracking/${userId}/progress`)
        .expect(200);

      expect(response.body).toHaveProperty('progress');
      expect(response.body.progress).toHaveProperty('userId', userId);
      expect(response.body.progress).toHaveProperty('metrics');
      expect(response.body.progress.metrics).toHaveProperty('workoutsCompleted');
      expect(response.body.progress.metrics).toHaveProperty('strengthGains');
    });

    test('POST /api/v1/tracking/:userId/measurements should record measurements', async () => {
      const userId = 'test_user_123';
      const measurementData = {
        weight: 75.5,
        bodyFat: 15.2,
        muscleMass: 62.8,
        measurements: {
          chest: 102,
          waist: 82,
          bicep: 38
        }
      };

      const response = await request(app)
        .post(`/api/v1/tracking/${userId}/measurements`)
        .send(measurementData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Measurements recorded successfully');
      expect(response.body.measurement).toHaveProperty('userId', userId);
      expect(response.body.measurement).toHaveProperty('recordedAt');
    });

    test('GET /api/v1/tracking/:userId/analytics should return analytics', async () => {
      const userId = 'test_user_123';
      const response = await request(app)
        .get(`/api/v1/tracking/${userId}/analytics`)
        .expect(200);

      expect(response.body).toHaveProperty('analytics');
      expect(response.body.analytics).toHaveProperty('summary');
      expect(response.body.analytics).toHaveProperty('trends');
      expect(response.body.analytics).toHaveProperty('goals');
    });

    test('POST /api/v1/tracking/:userId/workout-log should log workout', async () => {
      const userId = 'test_user_123';
      const workoutLog = {
        workoutId: 'workout_123',
        exercises: [
          { exerciseId: 'ex_1', sets: 3, reps: 10, weight: 80 },
          { exerciseId: 'ex_2', sets: 3, reps: 12, weight: 60 }
        ],
        duration: 45,
        caloriesBurned: 320,
        notes: 'Great workout, felt strong today'
      };

      const response = await request(app)
        .post(`/api/v1/tracking/${userId}/workout-log`)
        .send(workoutLog)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Workout logged successfully');
      expect(response.body.log).toHaveProperty('userId', userId);
      expect(response.body.log).toHaveProperty('loggedAt');
    });

    test('GET /api/v1/tracking/:userId/personal-records should return PRs', async () => {
      const userId = 'test_user_123';
      const response = await request(app)
        .get(`/api/v1/tracking/${userId}/personal-records`)
        .expect(200);

      expect(response.body).toHaveProperty('personalRecords');
      expect(Array.isArray(response.body.personalRecords)).toBe(true);
      
      if (response.body.personalRecords.length > 0) {
        const pr = response.body.personalRecords[0];
        expect(pr).toHaveProperty('exercise');
        expect(pr).toHaveProperty('type');
        expect(pr).toHaveProperty('value');
        expect(pr).toHaveProperty('achievedAt');
      }
    });
  });
});
