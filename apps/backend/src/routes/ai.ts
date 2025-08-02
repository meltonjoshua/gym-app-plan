import { Router } from 'express';
import { FormAnalysisService } from '../services/ai/FormAnalysisService';
import { WorkoutRecommendationService } from '../services/ai/WorkoutRecommendationService';
import OptimizedOpenAIService from '../services/ai/OptimizedOpenAIService';
import { CacheConfigs } from '../middleware/cacheMiddleware';
import performanceMiddleware from '../middleware/performanceMiddleware';

const router = Router();

// Initialize services
const formAnalysisService = new FormAnalysisService();
const workoutRecommendationService = new WorkoutRecommendationService();
const optimizedOpenAI = OptimizedOpenAIService.getInstance();

// Apply performance monitoring to all AI routes
router.use(performanceMiddleware());

// Health check endpoint with service status
router.get('/health', async (req, res) => {
  try {
    const openAIHealth = await optimizedOpenAI.healthCheck();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        formAnalysis: 'active',
        workoutRecommendations: 'active',
        computerVision: 'active',
        openAI: openAIHealth.status,
        cache: 'active'
      },
      performance: {
        openAI: openAIHealth.stats
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Form Analysis Routes with caching
router.get('/form-analysis/supported-exercises', CacheConfigs.exerciseLibrary, async (req, res) => {
  try {
    const exercises = formAnalysisService.getSupportedExercises();
    res.json({ 
      exercises,
      cached: res.get('X-Cache') === 'HIT',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get supported exercises'
    });
  }
});

router.post('/form-analysis/start-session', async (req, res) => {
  try {
    const { userId, exerciseType } = req.body;

    // Validate required fields
    if (!userId || !exerciseType) {
      return res.status(400).json({
        error: 'Missing required fields: userId and exerciseType are required'
      });
    }

    // Validate input types
    if (typeof userId !== 'string' || typeof exerciseType !== 'string') {
      return res.status(400).json({
        error: 'Invalid data types: userId and exerciseType must be strings'
      });
    }

    // Sanitize inputs (basic XSS prevention)
    const cleanUserId = userId.replace(/<[^>]*>/g, '');
    const cleanExerciseType = exerciseType.replace(/<[^>]*>/g, '');

    if (cleanUserId !== userId || cleanExerciseType !== exerciseType) {
      return res.status(400).json({
        error: 'Invalid characters detected in input'
      });
    }

    const sessionId = await formAnalysisService.startSession(cleanUserId, cleanExerciseType);

    res.json({
      sessionId,
      userId: cleanUserId,
      exerciseType: cleanExerciseType,
      startTime: new Date().toISOString(),
      status: 'session_started'
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to start analysis session'
    });
  }
});

router.post('/form-analysis/analyze', async (req, res) => {
  try {
    const { userId, exerciseType, sessionId, imageData, timestamp } = req.body;

    // Validate required fields
    if (!userId || !exerciseType || !sessionId) {
      return res.status(400).json({
        error: 'Missing required fields: userId, exerciseType, and sessionId are required'
      });
    }

    // Validate exerciseType is supported
    const supportedExercises = formAnalysisService.getSupportedExercises();
    if (!supportedExercises.includes(exerciseType)) {
      return res.status(400).json({
        error: `Unsupported exercise type. Supported exercises: ${supportedExercises.join(', ')}`
      });
    }

    const analysisRequest = {
      userId,
      exerciseType,
      sessionId,
      imageData,
      timestamp: timestamp || new Date().toISOString()
    };

    const analysis = await formAnalysisService.analyzeForm(analysisRequest);

    res.json({
      analysisId: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      overallScore: analysis.overallScore,
      recommendations: analysis.recommendations,
      corrections: analysis.corrections,
      safetyWarnings: analysis.safetyWarnings,
      analysis: analysis.analysis,
      repetitionAnalysis: analysis.repetitionAnalysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in form analysis:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to analyze form'
    });
  }
});

router.post('/form-analysis/end-session', async (req, res) => {
  try {
    const { userId, sessionId } = req.body;

    if (!userId || !sessionId) {
      return res.status(400).json({
        error: 'Missing required fields: userId and sessionId are required'
      });
    }

    const summary = await formAnalysisService.endSession(sessionId);

    res.json({
      sessionId,
      exerciseType: summary.exerciseType,
      duration: summary.duration,
      totalReps: summary.totalReps,
      averageScore: summary.averageScore,
      improvementAreas: summary.improvementAreas,
      achievements: summary.achievements,
      nextSessionRecommendations: summary.nextSessionRecommendations,
      endTime: new Date().toISOString(),
      status: 'session_ended'
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to end analysis session'
    });
  }
});

// Workout Recommendation Routes with optimized OpenAI
router.post('/workout-recommendations', CacheConfigs.workoutRecommendations, async (req, res) => {
  try {
    const { userId, timeAvailable, fitnessGoal, equipment, preferredIntensity, fitnessLevel, restrictions } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        error: 'Missing required field: userId is required'
      });
    }

    // Validate data types
    if (typeof userId !== 'string') {
      return res.status(400).json({
        error: 'Invalid data type: userId must be a string'
      });
    }

    // Sanitize string inputs
    const cleanUserId = userId.replace(/<[^>]*>/g, '');
    if (cleanUserId !== userId) {
      return res.status(400).json({
        error: 'Invalid characters detected in userId'
      });
    }

    // Set defaults for optional parameters
    const params = {
      userId: cleanUserId,
      fitnessLevel: fitnessLevel || 'intermediate',
      goals: fitnessGoal ? [fitnessGoal] : ['general_fitness'],
      availableTime: timeAvailable || 30,
      equipment: equipment || ['bodyweight'],
      restrictions: restrictions || []
    };

    // Use optimized OpenAI service for enhanced recommendations, fallback to basic service
    const startTime = Date.now();
    let recommendations;
    let aiOptimized = true;
    
    try {
      recommendations = await optimizedOpenAI.generateWorkoutRecommendations(
        params.userId,
        params.fitnessLevel,
        params.goals,
        params.availableTime,
        params.equipment,
        params.restrictions
      );
    } catch (aiError) {
      console.warn('OpenAI service failed, falling back to basic recommendations:', aiError);
      aiOptimized = false;
      // Fallback to basic recommendations
      recommendations = await workoutRecommendationService.generateRecommendations(params.userId);
    }
    
    const processingTime = Date.now() - startTime;

    res.json({
      recommendations,
      requestedPreferences: {
        timeAvailable: params.availableTime,
        fitnessGoal: params.goals,
        equipment: params.equipment,
        preferredIntensity,
        fitnessLevel: params.fitnessLevel
      },
      performance: {
        processingTime,
        cached: res.get('X-Cache') === 'HIT',
        aiOptimized
      },
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to generate workout recommendations'
    });
  }
});

router.post('/enhanced-recommendations', async (req, res) => {
  try {
    const { userId, timeAvailable, fitnessGoal, equipment, preferredIntensity, userProfile } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        error: 'Missing required field: userId is required'
      });
    }

    // Generate basic recommendations first
    const basicRecommendations = await workoutRecommendationService.generateRecommendations(userId);

    // For now, return enhanced response format with basic recommendations
    // OpenAI enhancement will be added when the method is implemented
    res.json({
      recommendations: basicRecommendations,
      requestedPreferences: {
        timeAvailable,
        fitnessGoal,
        equipment,
        preferredIntensity
      },
      userProfile: userProfile || {},
      aiEnhancement: {
        motivationalMessage: "Keep pushing towards your fitness goals!",
        coachingTips: [
          "Focus on proper form over speed",
          "Stay consistent with your workout routine",
          "Listen to your body and rest when needed"
        ],
        personalizedNotes: "This workout is tailored to help you achieve your fitness goals safely and effectively."
      },
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to generate enhanced recommendations'
    });
  }
});

// AI-powered form feedback route
router.post('/form-analysis/ai-feedback', async (req, res) => {
  try {
    const { sessionId, exercise, formScore, detectedIssues, userLevel } = req.body;

    // Validate required fields
    if (!sessionId || !exercise || formScore === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: sessionId, exercise, and formScore are required'
      });
    }

    // Validate data types
    if (typeof formScore !== 'number' || formScore < 0 || formScore > 100) {
      return res.status(400).json({
        error: 'Invalid formScore: must be a number between 0 and 100'
      });
    }

    const startTime = Date.now();
    const aiFeedback = await optimizedOpenAI.generateFormFeedback(
      exercise,
      formScore,
      detectedIssues || [],
      userLevel || 'intermediate'
    );
    const processingTime = Date.now() - startTime;

    res.json({
      sessionId,
      exercise,
      formScore,
      aiFeedback,
      performance: {
        processingTime,
        aiOptimized: true
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to generate AI feedback'
    });
  }
});

// Performance statistics endpoint
router.get('/performance-stats', async (req, res) => {
  try {
    const openAIStats = optimizedOpenAI.getPerformanceStats();
    
    res.json({
      aiServices: {
        openAI: openAIStats
      },
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get performance stats'
    });
  }
});

export default router;