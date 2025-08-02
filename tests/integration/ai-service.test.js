const request = require('supertest');
const express = require('express');

// Import the AI service routes
const aiRoutes = require('../../apps/microservices/ai-service/src/routes/ai');
const workoutRoutes = require('../../apps/microservices/ai-service/src/routes/workouts');
const analysisRoutes = require('../../apps/microservices/ai-service/src/routes/analysis');
const recommendationRoutes = require('../../apps/microservices/ai-service/src/routes/recommendations');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/ai/workouts', workoutRoutes);
app.use('/api/v1/ai/analysis', analysisRoutes);
app.use('/api/v1/ai/recommendations', recommendationRoutes);

describe('AI Service Integration Tests', () => {
  describe('AI Service Core Endpoints', () => {
    test('GET /api/v1/ai/health should return service status', async () => {
      const response = await request(app)
        .get('/api/v1/ai/health')
        .expect(200);

      expect(response.body).toHaveProperty('service', 'ai');
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body.features).toContain('recommendations');
      expect(response.body.features).toContain('analysis');
      expect(response.body.features).toContain('optimization');
    });

    test('GET /api/v1/ai/models should return available models', async () => {
      const response = await request(app)
        .get('/api/v1/ai/models')
        .expect(200);

      expect(response.body).toHaveProperty('models');
      expect(Array.isArray(response.body.models)).toBe(true);
      
      if (response.body.models.length > 0) {
        const model = response.body.models[0];
        expect(model).toHaveProperty('id');
        expect(model).toHaveProperty('name');
        expect(model).toHaveProperty('type');
        expect(model).toHaveProperty('status');
      }
    });

    test('GET /api/v1/ai/capabilities should return AI capabilities', async () => {
      const response = await request(app)
        .get('/api/v1/ai/capabilities')
        .expect(200);

      expect(response.body).toHaveProperty('capabilities');
      expect(response.body.capabilities).toHaveProperty('workoutRecommendations');
      expect(response.body.capabilities).toHaveProperty('formAnalysis');
      expect(response.body.capabilities).toHaveProperty('progressPrediction');
      expect(response.body.capabilities).toHaveProperty('injuryPrevention');
    });

    test('POST /api/v1/ai/analyze should analyze user data', async () => {
      const analysisData = {
        userId: 'test_user_123',
        type: 'workout_analysis',
        data: {
          workoutHistory: ['workout1', 'workout2'],
          currentGoals: ['strength', 'muscle_gain'],
          preferences: { duration: 45, difficulty: 'intermediate' }
        }
      };

      const response = await request(app)
        .post('/api/v1/ai/analyze')
        .send(analysisData)
        .expect(200);

      expect(response.body).toHaveProperty('analysis');
      expect(response.body.analysis).toHaveProperty('insights');
      expect(response.body.analysis).toHaveProperty('recommendations');
      expect(response.body.analysis).toHaveProperty('confidence');
    });
  });

  describe('Workout AI Endpoints', () => {
    test('GET /api/v1/ai/workouts/health should return service status', async () => {
      const response = await request(app)
        .get('/api/v1/ai/workouts/health')
        .expect(200);

      expect(response.body).toHaveProperty('service', 'ai-workouts');
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body.features).toContain('generation');
      expect(response.body.features).toContain('optimization');
    });

    test('POST /api/v1/ai/workouts/generate should generate workout', async () => {
      const generationData = {
        userId: 'test_user_123',
        preferences: {
          type: 'strength',
          duration: 45,
          difficulty: 'intermediate',
          equipment: ['dumbbells', 'barbell'],
          focusAreas: ['chest', 'triceps']
        },
        constraints: {
          injuries: [],
          timeConstraints: 'none'
        }
      };

      const response = await request(app)
        .post('/api/v1/ai/workouts/generate')
        .send(generationData)
        .expect(200);

      expect(response.body).toHaveProperty('workout');
      expect(response.body.workout).toHaveProperty('id');
      expect(response.body.workout).toHaveProperty('name');
      expect(response.body.workout).toHaveProperty('exercises');
      expect(response.body.workout).toHaveProperty('estimatedDuration');
      expect(Array.isArray(response.body.workout.exercises)).toBe(true);
    });

    test('POST /api/v1/ai/workouts/optimize should optimize existing workout', async () => {
      const optimizationData = {
        workoutId: 'workout_123',
        userId: 'test_user_123',
        feedback: {
          difficulty: 'too_easy',
          duration: 'perfect',
          enjoyment: 8
        },
        performanceData: {
          completedSets: 12,
          totalSets: 12,
          avgRestTime: 90,
          fatigueLevels: [3, 4, 5, 6]
        }
      };

      const response = await request(app)
        .post('/api/v1/ai/workouts/optimize')
        .send(optimizationData)
        .expect(200);

      expect(response.body).toHaveProperty('optimizedWorkout');
      expect(response.body).toHaveProperty('changes');
      expect(response.body.optimizedWorkout).toHaveProperty('exercises');
      expect(Array.isArray(response.body.changes)).toBe(true);
    });

    test('GET /api/v1/ai/workouts/:userId/suggestions should get workout suggestions', async () => {
      const userId = 'test_user_123';
      const response = await request(app)
        .get(`/api/v1/ai/workouts/${userId}/suggestions`)
        .expect(200);

      expect(response.body).toHaveProperty('suggestions');
      expect(Array.isArray(response.body.suggestions)).toBe(true);
      
      if (response.body.suggestions.length > 0) {
        const suggestion = response.body.suggestions[0];
        expect(suggestion).toHaveProperty('type');
        expect(suggestion).toHaveProperty('reason');
        expect(suggestion).toHaveProperty('confidence');
        expect(suggestion).toHaveProperty('workoutPreview');
      }
    });

    test('POST /api/v1/ai/workouts/adapt should adapt workout to user feedback', async () => {
      const adaptationData = {
        workoutId: 'workout_123',
        userId: 'test_user_123',
        adaptations: {
          increaseIntensity: true,
          addExercises: ['pull-ups'],
          removeExercises: [],
          adjustReps: { 'exercise_1': 12, 'exercise_2': 10 }
        },
        reason: 'User requested more challenging workout'
      };

      const response = await request(app)
        .post('/api/v1/ai/workouts/adapt')
        .send(adaptationData)
        .expect(200);

      expect(response.body).toHaveProperty('adaptedWorkout');
      expect(response.body).toHaveProperty('adaptationSummary');
      expect(response.body.adaptedWorkout).toHaveProperty('exercises');
    });
  });

  describe('Analysis Endpoints', () => {
    test('GET /api/v1/ai/analysis/health should return service status', async () => {
      const response = await request(app)
        .get('/api/v1/ai/analysis/health')
        .expect(200);

      expect(response.body).toHaveProperty('service', 'ai-analysis');
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body.features).toContain('form');
      expect(response.body.features).toContain('progress');
    });

    test('POST /api/v1/ai/analysis/form should analyze exercise form', async () => {
      const formData = {
        userId: 'test_user_123',
        exerciseId: 'bench_press',
        videoData: {
          url: 'https://example.com/video.mp4',
          duration: 30,
          frameRate: 30
        },
        sensorData: {
          accelerometer: [/* mock data */],
          gyroscope: [/* mock data */]
        }
      };

      const response = await request(app)
        .post('/api/v1/ai/analysis/form')
        .send(formData)
        .expect(200);

      expect(response.body).toHaveProperty('analysis');
      expect(response.body.analysis).toHaveProperty('formScore');
      expect(response.body.analysis).toHaveProperty('feedback');
      expect(response.body.analysis).toHaveProperty('corrections');
      expect(Array.isArray(response.body.analysis.corrections)).toBe(true);
    });

    test('POST /api/v1/ai/analysis/progress should analyze user progress', async () => {
      const progressData = {
        userId: 'test_user_123',
        timeframe: '3_months',
        metrics: ['strength', 'endurance', 'body_composition'],
        workoutHistory: [
          { date: '2024-01-01', type: 'strength', duration: 45 },
          { date: '2024-01-03', type: 'cardio', duration: 30 }
        ]
      };

      const response = await request(app)
        .post('/api/v1/ai/analysis/progress')
        .send(progressData)
        .expect(200);

      expect(response.body).toHaveProperty('progressAnalysis');
      expect(response.body.progressAnalysis).toHaveProperty('trends');
      expect(response.body.progressAnalysis).toHaveProperty('achievements');
      expect(response.body.progressAnalysis).toHaveProperty('predictions');
      expect(response.body.progressAnalysis).toHaveProperty('recommendations');
    });

    test('POST /api/v1/ai/analysis/injury-risk should assess injury risk', async () => {
      const riskData = {
        userId: 'test_user_123',
        workoutPlan: {
          exercises: ['squat', 'deadlift', 'bench_press'],
          frequency: 4,
          intensity: 'high'
        },
        userProfile: {
          age: 28,
          fitnessLevel: 'intermediate',
          injuryHistory: ['lower_back_strain'],
          currentCondition: 'healthy'
        }
      };

      const response = await request(app)
        .post('/api/v1/ai/analysis/injury-risk')
        .send(riskData)
        .expect(200);

      expect(response.body).toHaveProperty('riskAssessment');
      expect(response.body.riskAssessment).toHaveProperty('overallRisk');
      expect(response.body.riskAssessment).toHaveProperty('specificRisks');
      expect(response.body.riskAssessment).toHaveProperty('preventionTips');
      expect(Array.isArray(response.body.riskAssessment.preventionTips)).toBe(true);
    });

    test('GET /api/v1/ai/analysis/:userId/insights should get user insights', async () => {
      const userId = 'test_user_123';
      const response = await request(app)
        .get(`/api/v1/ai/analysis/${userId}/insights`)
        .expect(200);

      expect(response.body).toHaveProperty('insights');
      expect(response.body.insights).toHaveProperty('performance');
      expect(response.body.insights).toHaveProperty('patterns');
      expect(response.body.insights).toHaveProperty('opportunities');
      expect(Array.isArray(response.body.insights.opportunities)).toBe(true);
    });
  });

  describe('Recommendation Endpoints', () => {
    test('GET /api/v1/ai/recommendations/health should return service status', async () => {
      const response = await request(app)
        .get('/api/v1/ai/recommendations/health')
        .expect(200);

      expect(response.body).toHaveProperty('service', 'ai-recommendations');
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body.features).toContain('personalized');
      expect(response.body.features).toContain('adaptive');
    });

    test('GET /api/v1/ai/recommendations/:userId should get personalized recommendations', async () => {
      const userId = 'test_user_123';
      const response = await request(app)
        .get(`/api/v1/ai/recommendations/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('recommendations');
      expect(Array.isArray(response.body.recommendations)).toBe(true);
      
      if (response.body.recommendations.length > 0) {
        const recommendation = response.body.recommendations[0];
        expect(recommendation).toHaveProperty('type');
        expect(recommendation).toHaveProperty('priority');
        expect(recommendation).toHaveProperty('title');
        expect(recommendation).toHaveProperty('description');
        expect(recommendation).toHaveProperty('confidence');
      }
    });

    test('POST /api/v1/ai/recommendations/:userId/exercises should get exercise recommendations', async () => {
      const userId = 'test_user_123';
      const requestData = {
        goals: ['strength', 'muscle_gain'],
        equipment: ['dumbbells', 'resistance_bands'],
        timeAvailable: 45,
        fitnessLevel: 'intermediate',
        muscleGroups: ['chest', 'shoulders']
      };

      const response = await request(app)
        .post(`/api/v1/ai/recommendations/${userId}/exercises`)
        .send(requestData)
        .expect(200);

      expect(response.body).toHaveProperty('exercises');
      expect(Array.isArray(response.body.exercises)).toBe(true);
      
      if (response.body.exercises.length > 0) {
        const exercise = response.body.exercises[0];
        expect(exercise).toHaveProperty('id');
        expect(exercise).toHaveProperty('name');
        expect(exercise).toHaveProperty('recommendationScore');
        expect(exercise).toHaveProperty('reasoning');
      }
    });

    test('POST /api/v1/ai/recommendations/:userId/nutrition should get nutrition recommendations', async () => {
      const userId = 'test_user_123';
      const nutritionData = {
        goals: ['muscle_gain', 'fat_loss'],
        currentWeight: 75,
        targetWeight: 78,
        activityLevel: 'high',
        dietaryRestrictions: ['vegetarian'],
        mealPreferences: ['quick_prep', 'high_protein']
      };

      const response = await request(app)
        .post(`/api/v1/ai/recommendations/${userId}/nutrition`)
        .send(nutritionData)
        .expect(200);

      expect(response.body).toHaveProperty('nutritionPlan');
      expect(response.body.nutritionPlan).toHaveProperty('dailyCalories');
      expect(response.body.nutritionPlan).toHaveProperty('macroBreakdown');
      expect(response.body.nutritionPlan).toHaveProperty('mealSuggestions');
      expect(Array.isArray(response.body.nutritionPlan.mealSuggestions)).toBe(true);
    });

    test('POST /api/v1/ai/recommendations/:userId/recovery should get recovery recommendations', async () => {
      const userId = 'test_user_123';
      const recoveryData = {
        recentWorkouts: [
          { date: '2024-01-15', intensity: 'high', type: 'strength' },
          { date: '2024-01-14', intensity: 'moderate', type: 'cardio' }
        ],
        sleepQuality: 7,
        stressLevel: 5,
        musclesSoreness: ['legs', 'shoulders'],
        hydrationLevel: 'good'
      };

      const response = await request(app)
        .post(`/api/v1/ai/recommendations/${userId}/recovery`)
        .send(recoveryData)
        .expect(200);

      expect(response.body).toHaveProperty('recoveryPlan');
      expect(response.body.recoveryPlan).toHaveProperty('restDays');
      expect(response.body.recoveryPlan).toHaveProperty('activeRecovery');
      expect(response.body.recoveryPlan).toHaveProperty('sleepRecommendations');
      expect(response.body.recoveryPlan).toHaveProperty('nutritionFocus');
    });

    test('PUT /api/v1/ai/recommendations/:userId/feedback should provide recommendation feedback', async () => {
      const userId = 'test_user_123';
      const feedbackData = {
        recommendationId: 'rec_123',
        feedback: 'helpful',
        rating: 4,
        implemented: true,
        results: 'positive',
        comments: 'Great suggestion, saw improvement in form'
      };

      const response = await request(app)
        .put(`/api/v1/ai/recommendations/${userId}/feedback`)
        .send(feedbackData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Feedback recorded successfully');
      expect(response.body).toHaveProperty('learningUpdate');
      expect(response.body.learningUpdate).toHaveProperty('modelUpdated');
    });

    test('GET /api/v1/ai/recommendations/:userId/trends should get recommendation trends', async () => {
      const userId = 'test_user_123';
      const response = await request(app)
        .get(`/api/v1/ai/recommendations/${userId}/trends`)
        .expect(200);

      expect(response.body).toHaveProperty('trends');
      expect(response.body.trends).toHaveProperty('accuracy');
      expect(response.body.trends).toHaveProperty('userSatisfaction');
      expect(response.body.trends).toHaveProperty('implementationRate');
      expect(response.body.trends).toHaveProperty('improvementAreas');
    });
  });
});
