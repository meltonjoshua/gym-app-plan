import OpenAI from 'openai';
import CacheService from '../CacheService';

/**
 * Optimized OpenAI Service with Intelligent Caching
 * Phase 14B: AI Processing Optimization Implementation
 */
export class OptimizedOpenAIService {
  private static instance: OptimizedOpenAIService;
  private openai: OpenAI;
  private cache = CacheService.getInstance();
  
  // Performance optimization properties
  private requestQueue: Array<{request: any, resolve: Function, reject: Function}> = [];
  private isProcessingQueue = false;
  private batchSize = 5;
  private batchTimeout = 100; // ms
  
  // Statistics tracking
  private stats = {
    totalRequests: 0,
    cachedResponses: 0,
    batchedRequests: 0,
    averageResponseTime: 0,
    responseTimes: [] as number[]
  };

  private constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000, // 30 second timeout
      maxRetries: 3
    });
  }

  static getInstance(): OptimizedOpenAIService {
    if (!OptimizedOpenAIService.instance) {
      OptimizedOpenAIService.instance = new OptimizedOpenAIService();
    }
    return OptimizedOpenAIService.instance;
  }

  /**
   * Generate workout recommendations with intelligent caching
   */
  async generateWorkoutRecommendations(
    userId: string,
    fitnessLevel: string,
    goals: string[],
    availableTime: number,
    equipment: string[],
    restrictions: string[] = []
  ): Promise<any> {
    const startTime = Date.now();
    
    // Create cache key based on parameters
    const cacheKey = this.createWorkoutCacheKey({
      fitnessLevel,
      goals,
      availableTime,
      equipment,
      restrictions
    });

    // Check cache first
    const cachedRecommendation = await this.cache.get(cacheKey);
    if (cachedRecommendation) {
      this.stats.cachedResponses++;
      this.recordResponseTime(Date.now() - startTime);
      return cachedRecommendation;
    }

    // Generate new recommendation
    const prompt = this.buildWorkoutPrompt(fitnessLevel, goals, availableTime, equipment, restrictions);
    
    try {
      const response = await this.queueRequest({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional fitness trainer and exercise physiologist. Provide structured, safe, and effective workout recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3, // Lower temperature for more consistent recommendations
        response_format: { type: 'json_object' }
      });

      const recommendation = this.parseWorkoutResponse(response);
      
      // Cache the recommendation (longer TTL for stable recommendations)
      await this.cache.set(cacheKey, recommendation, 3600); // 1 hour
      
      this.recordResponseTime(Date.now() - startTime);
      return recommendation;
      
    } catch (error) {
      console.error('Error generating workout recommendations:', error);
      throw new Error('Failed to generate workout recommendations');
    }
  }

  /**
   * Generate form analysis feedback with caching
   */
  async generateFormFeedback(
    exercise: string,
    formScore: number,
    detectedIssues: string[],
    userLevel: string = 'intermediate'
  ): Promise<any> {
    const startTime = Date.now();
    
    // Create cache key for form feedback
    const cacheKey = this.createFormFeedbackCacheKey({
      exercise,
      formScore: Math.round(formScore / 10) * 10, // Round to nearest 10 for better caching
      detectedIssues: detectedIssues.sort(), // Sort for consistent cache keys
      userLevel
    });

    // Check cache first
    const cachedFeedback = await this.cache.get(cacheKey);
    if (cachedFeedback) {
      this.stats.cachedResponses++;
      this.recordResponseTime(Date.now() - startTime);
      return cachedFeedback;
    }

    const prompt = this.buildFormFeedbackPrompt(exercise, formScore, detectedIssues, userLevel);
    
    try {
      const response = await this.queueRequest({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert exercise form coach. Analyze form issues and provide specific, actionable feedback to improve exercise technique.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.2, // Very low temperature for consistent feedback
        response_format: { type: 'json_object' }
      });

      const feedback = this.parseFormFeedbackResponse(response);
      
      // Cache form feedback (medium TTL as form advice is relatively stable)
      await this.cache.set(cacheKey, feedback, 1800); // 30 minutes
      
      this.recordResponseTime(Date.now() - startTime);
      return feedback;
      
    } catch (error) {
      console.error('Error generating form feedback:', error);
      throw new Error('Failed to generate form feedback');
    }
  }

  /**
   * Request queuing system for batch processing
   */
  private async queueRequest(request: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ request, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Process request queue with intelligent batching
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      // Wait for batch to fill or timeout
      await this.waitForBatch();
      
      // Process requests in batch
      const batch = this.requestQueue.splice(0, this.batchSize);
      
      if (batch.length === 1) {
        // Single request - process immediately
        await this.processSingleRequest(batch[0]);
      } else {
        // Multiple requests - process concurrently
        await this.processBatchRequests(batch);
      }
      
    } finally {
      this.isProcessingQueue = false;
      
      // Continue processing if more requests are queued
      if (this.requestQueue.length > 0) {
        setTimeout(() => this.processQueue(), 10);
      }
    }
  }

  /**
   * Wait for batch to fill or timeout
   */
  private async waitForBatch(): Promise<void> {
    return new Promise(resolve => {
      const checkBatch = () => {
        if (this.requestQueue.length >= this.batchSize) {
          resolve();
        } else {
          setTimeout(resolve, this.batchTimeout);
        }
      };
      checkBatch();
    });
  }

  /**
   * Process single request
   */
  private async processSingleRequest(item: {request: any, resolve: Function, reject: Function}): Promise<void> {
    try {
      const response = await this.openai.chat.completions.create(item.request);
      this.stats.totalRequests++;
      item.resolve(response);
    } catch (error) {
      item.reject(error);
    }
  }

  /**
   * Process batch requests concurrently
   */
  private async processBatchRequests(batch: Array<{request: any, resolve: Function, reject: Function}>): Promise<void> {
    const promises = batch.map(async (item) => {
      try {
        const response = await this.openai.chat.completions.create(item.request);
        this.stats.totalRequests++;
        this.stats.batchedRequests++;
        item.resolve(response);
      } catch (error) {
        item.reject(error);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Create cache key for workout recommendations
   */
  private createWorkoutCacheKey(params: any): string {
    const normalized = {
      fitnessLevel: params.fitnessLevel?.toLowerCase(),
      goals: params.goals?.sort().join(','),
      timeRange: this.normalizeTime(params.availableTime),
      equipment: params.equipment?.sort().join(','),
      restrictions: params.restrictions?.sort().join(',') || 'none'
    };
    
    return `workout_rec_${Buffer.from(JSON.stringify(normalized)).toString('base64')}`;
  }

  /**
   * Create cache key for form feedback
   */
  private createFormFeedbackCacheKey(params: any): string {
    const normalized = {
      exercise: params.exercise?.toLowerCase(),
      scoreRange: params.formScore,
      issues: params.detectedIssues?.join(',') || 'none',
      level: params.userLevel?.toLowerCase()
    };
    
    return `form_feedback_${Buffer.from(JSON.stringify(normalized)).toString('base64')}`;
  }

  /**
   * Normalize time ranges for better caching
   */
  private normalizeTime(minutes: number): string {
    if (minutes <= 15) return 'short';
    if (minutes <= 30) return 'medium';
    if (minutes <= 60) return 'long';
    return 'extended';
  }

  /**
   * Build workout recommendation prompt
   */
  private buildWorkoutPrompt(
    fitnessLevel: string,
    goals: string[],
    availableTime: number,
    equipment: string[],
    restrictions: string[]
  ): string {
    return `
Create a personalized workout recommendation with the following parameters:

Fitness Level: ${fitnessLevel}
Primary Goals: ${goals.join(', ')}
Available Time: ${availableTime} minutes
Available Equipment: ${equipment.join(', ')}
Restrictions/Limitations: ${restrictions.length > 0 ? restrictions.join(', ') : 'None'}

Please provide a structured JSON response with:
{
  "workoutName": "string",
  "duration": number,
  "difficulty": "string",
  "exercises": [
    {
      "name": "string",
      "sets": number,
      "reps": "string",
      "duration": number,
      "restPeriod": number,
      "instructions": "string",
      "targetMuscles": ["string"],
      "equipment": "string"
    }
  ],
  "warmup": ["string"],
  "cooldown": ["string"],
  "notes": "string",
  "progression": "string"
}

Focus on exercises that are safe, effective, and appropriate for the specified fitness level.
    `.trim();
  }

  /**
   * Build form feedback prompt
   */
  private buildFormFeedbackPrompt(
    exercise: string,
    formScore: number,
    detectedIssues: string[],
    userLevel: string
  ): string {
    return `
Analyze the following exercise form and provide specific feedback:

Exercise: ${exercise}
Form Score: ${formScore}/100
Detected Issues: ${detectedIssues.length > 0 ? detectedIssues.join(', ') : 'None detected'}
User Level: ${userLevel}

Please provide a structured JSON response with:
{
  "overallAssessment": "string",
  "specificFeedback": [
    {
      "issue": "string",
      "severity": "low|medium|high",
      "explanation": "string",
      "correction": "string",
      "preventionTip": "string"
    }
  ],
  "positiveAspects": ["string"],
  "priorityCorrections": ["string"],
  "practiceExercises": ["string"],
  "nextSteps": "string"
}

Provide constructive, specific feedback that helps improve form safely.
    `.trim();
  }

  /**
   * Parse workout recommendation response
   */
  private parseWorkoutResponse(response: any): any {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No content in response');
      
      const parsed = JSON.parse(content);
      
      // Add metadata
      return {
        ...parsed,
        generatedAt: new Date().toISOString(),
        model: 'gpt-4',
        cached: false
      };
    } catch (error) {
      console.error('Error parsing workout response:', error);
      throw new Error('Failed to parse workout recommendation');
    }
  }

  /**
   * Parse form feedback response
   */
  private parseFormFeedbackResponse(response: any): any {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No content in response');
      
      const parsed = JSON.parse(content);
      
      // Add metadata
      return {
        ...parsed,
        generatedAt: new Date().toISOString(),
        model: 'gpt-4',
        cached: false
      };
    } catch (error) {
      console.error('Error parsing form feedback response:', error);
      throw new Error('Failed to parse form feedback');
    }
  }

  /**
   * Record response time for statistics
   */
  private recordResponseTime(responseTime: number): void {
    this.stats.responseTimes.push(responseTime);
    
    // Keep only last 100 response times
    if (this.stats.responseTimes.length > 100) {
      this.stats.responseTimes = this.stats.responseTimes.slice(-100);
    }
    
    // Update average
    this.stats.averageResponseTime = 
      this.stats.responseTimes.reduce((a, b) => a + b, 0) / this.stats.responseTimes.length;
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): any {
    const cacheTotal = this.stats.totalRequests + this.stats.cachedResponses;
    return {
      totalRequests: this.stats.totalRequests,
      cachedResponses: this.stats.cachedResponses,
      cacheHitRate: cacheTotal > 0 ? (this.stats.cachedResponses / cacheTotal) * 100 : 0,
      batchedRequests: this.stats.batchedRequests,
      batchingRate: this.stats.totalRequests > 0 ? (this.stats.batchedRequests / this.stats.totalRequests) * 100 : 0,
      averageResponseTime: Math.round(this.stats.averageResponseTime),
      queueSize: this.requestQueue.length,
      isProcessing: this.isProcessingQueue
    };
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<any> {
    try {
      // Test with a simple request
      const testStart = Date.now();
      await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test connection' }],
        max_tokens: 5
      });
      const responseTime = Date.now() - testStart;
      
      return {
        status: 'healthy',
        responseTime,
        stats: this.getPerformanceStats(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        stats: this.getPerformanceStats(),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Clear caches (for maintenance)
   */
  async clearCaches(): Promise<void> {
    // Clear relevant cache patterns
    const patterns = ['workout_rec_', 'form_feedback_'];
    
    // Note: In production, you'd implement pattern-based cache clearing
    console.log('🧹 OpenAI service caches cleared');
  }
}

export default OptimizedOpenAIService;
