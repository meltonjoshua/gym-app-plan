const request = require('supertest');
const cluster = require('cluster');
const os = require('os');

/**
 * Performance Testing Suite
 * Phase 14B: Performance Optimization Validation
 */

class PerformanceTester {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      responseTimes: [],
      cacheHits: 0,
      cacheMisses: 0,
      startTime: 0,
      endTime: 0
    };
  }

  /**
   * Load testing with concurrent users
   */
  async loadTest(concurrentUsers = 50, requestsPerUser = 10) {
    console.log(`🚀 Starting load test: ${concurrentUsers} concurrent users, ${requestsPerUser} requests each`);
    
    this.metrics.startTime = Date.now();
    
    const userPromises = [];
    for (let i = 0; i < concurrentUsers; i++) {
      userPromises.push(this.simulateUser(i, requestsPerUser));
    }

    await Promise.all(userPromises);
    
    this.metrics.endTime = Date.now();
    this.calculateMetrics();
    this.printResults();
  }

  /**
   * Simulate individual user behavior
   */
  async simulateUser(userId, requestCount) {
    const userMetrics = {
      requests: 0,
      responses: 0,
      errors: 0
    };

    for (let i = 0; i < requestCount; i++) {
      try {
        await this.makeRandomRequest(userId, i);
        userMetrics.responses++;
      } catch (error) {
        userMetrics.errors++;
      }
      userMetrics.requests++;

      // Random delay between requests (0-500ms)
      await this.delay(Math.random() * 500);
    }

    return userMetrics;
  }

  /**
   * Make a random API request
   */
  async makeRandomRequest(userId, requestId) {
    const endpoints = [
      { method: 'GET', path: '/health', weight: 0.3 },
      { method: 'GET', path: '/health/detailed', weight: 0.2 },
      { method: 'GET', path: '/metrics', weight: 0.1 },
      { method: 'POST', path: '/api/v1/ai/workout-recommendations', weight: 0.2, body: this.generateWorkoutRequest(userId) },
      { method: 'POST', path: '/api/v1/ai/form-analysis/start-session', weight: 0.1, body: this.generateFormAnalysisRequest(userId) },
      { method: 'GET', path: '/api/v1/exercises', weight: 0.1 }
    ];

    const endpoint = this.selectWeightedEndpoint(endpoints);
    const startTime = Date.now();

    try {
      let response;
      const agent = request(this.baseUrl);

      if (endpoint.method === 'GET') {
        response = await agent.get(endpoint.path);
      } else if (endpoint.method === 'POST') {
        response = await agent
          .post(endpoint.path)
          .send(endpoint.body || {});
      }

      const responseTime = Date.now() - startTime;
      this.recordMetrics(response, responseTime);

      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.recordError(responseTime);
      throw error;
    }
  }

  /**
   * Generate workout recommendation request data
   */
  generateWorkoutRequest(userId) {
    return {
      userId: `perf-test-user-${userId}`,
      fitnessLevel: Math.random() > 0.5 ? 'intermediate' : 'beginner',
      goals: ['strength', 'endurance'][Math.floor(Math.random() * 2)],
      availableTime: 30 + Math.floor(Math.random() * 60),
      equipment: ['dumbbells', 'resistance_bands', 'bodyweight'][Math.floor(Math.random() * 3)]
    };
  }

  /**
   * Generate form analysis request data
   */
  generateFormAnalysisRequest(userId) {
    return {
      userId: `perf-test-user-${userId}`,
      exercise: ['squat', 'deadlift', 'bench_press', 'push_up'][Math.floor(Math.random() * 4)],
      difficulty: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)]
    };
  }

  /**
   * Select endpoint based on weights
   */
  selectWeightedEndpoint(endpoints) {
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (const endpoint of endpoints) {
      cumulativeWeight += endpoint.weight;
      if (random <= cumulativeWeight) {
        return endpoint;
      }
    }
    
    return endpoints[endpoints.length - 1];
  }

  /**
   * Record successful request metrics
   */
  recordMetrics(response, responseTime) {
    this.metrics.totalRequests++;
    this.metrics.responseTimes.push(responseTime);
    
    if (response.status >= 200 && response.status < 400) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Check for cache headers
    if (response.headers['x-cache'] === 'HIT') {
      this.metrics.cacheHits++;
    } else if (response.headers['x-cache'] === 'MISS') {
      this.metrics.cacheMisses++;
    }

    this.metrics.minResponseTime = Math.min(this.metrics.minResponseTime, responseTime);
    this.metrics.maxResponseTime = Math.max(this.metrics.maxResponseTime, responseTime);
  }

  /**
   * Record failed request metrics
   */
  recordError(responseTime) {
    this.metrics.totalRequests++;
    this.metrics.failedRequests++;
    this.metrics.responseTimes.push(responseTime);
  }

  /**
   * Calculate final metrics
   */
  calculateMetrics() {
    const totalTime = this.metrics.endTime - this.metrics.startTime;
    this.metrics.averageResponseTime = this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length;
    this.metrics.requestsPerSecond = (this.metrics.totalRequests / totalTime) * 1000;
    this.metrics.successRate = (this.metrics.successfulRequests / this.metrics.totalRequests) * 100;
    this.metrics.cacheHitRate = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100;
  }

  /**
   * Print test results
   */
  printResults() {
    console.log('\n📊 PERFORMANCE TEST RESULTS');
    console.log('=' .repeat(50));
    
    console.log(`📈 Overall Performance:`);
    console.log(`   Total Requests: ${this.metrics.totalRequests}`);
    console.log(`   Successful: ${this.metrics.successfulRequests} (${this.metrics.successRate.toFixed(1)}%)`);
    console.log(`   Failed: ${this.metrics.failedRequests}`);
    console.log(`   Requests/sec: ${this.metrics.requestsPerSecond.toFixed(2)}`);
    
    console.log(`\n⏱️  Response Times:`);
    console.log(`   Average: ${this.metrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`   Min: ${this.metrics.minResponseTime}ms`);
    console.log(`   Max: ${this.metrics.maxResponseTime}ms`);
    console.log(`   95th percentile: ${this.getPercentile(95).toFixed(2)}ms`);
    console.log(`   99th percentile: ${this.getPercentile(99).toFixed(2)}ms`);
    
    console.log(`\n🗄️  Cache Performance:`);
    console.log(`   Cache Hits: ${this.metrics.cacheHits}`);
    console.log(`   Cache Misses: ${this.metrics.cacheMisses}`);
    console.log(`   Hit Rate: ${this.metrics.cacheHitRate.toFixed(1)}%`);
    
    console.log(`\n🎯 Performance Targets:`);
    console.log(`   API Response (<100ms): ${this.checkTarget(this.metrics.averageResponseTime, 100)}`);
    console.log(`   Cache Hit Rate (>60%): ${this.checkTarget(this.metrics.cacheHitRate, 60, true)}`);
    console.log(`   Success Rate (>95%): ${this.checkTarget(this.metrics.successRate, 95, true)}`);
    console.log(`   Requests/sec (>10): ${this.checkTarget(this.metrics.requestsPerSecond, 10, true)}`);
  }

  /**
   * Get response time percentile
   */
  getPercentile(percentile) {
    const sorted = this.metrics.responseTimes.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  /**
   * Check if target is met
   */
  checkTarget(value, target, higherIsBetter = false) {
    const met = higherIsBetter ? value >= target : value <= target;
    return met ? `✅ ${value.toFixed(2)}` : `❌ ${value.toFixed(2)} (target: ${higherIsBetter ? '≥' : '≤'}${target})`;
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test cache effectiveness
   */
  async testCacheEffectiveness() {
    console.log('\n🧪 Testing Cache Effectiveness...');
    
    const endpoint = '/health/detailed';
    const requestCount = 10;
    
    // First request (should be cache miss)
    const startTime = Date.now();
    for (let i = 0; i < requestCount; i++) {
      await request(this.baseUrl).get(endpoint);
    }
    const coldTime = Date.now() - startTime;
    
    // Wait a moment
    await this.delay(100);
    
    // Subsequent requests (should be cache hits)
    const warmStartTime = Date.now();
    for (let i = 0; i < requestCount; i++) {
      await request(this.baseUrl).get(endpoint);
    }
    const warmTime = Date.now() - warmStartTime;
    
    const improvement = ((coldTime - warmTime) / coldTime) * 100;
    
    console.log(`Cold cache (${requestCount} requests): ${coldTime}ms`);
    console.log(`Warm cache (${requestCount} requests): ${warmTime}ms`);
    console.log(`Performance improvement: ${improvement.toFixed(1)}%`);
    
    return improvement;
  }

  /**
   * Memory usage monitoring
   */
  async monitorMemoryUsage(durationMs = 30000) {
    console.log('\n🧠 Monitoring Memory Usage...');
    
    const measurements = [];
    const interval = 1000; // 1 second intervals
    const iterations = durationMs / interval;
    
    for (let i = 0; i < iterations; i++) {
      try {
        const response = await request(this.baseUrl).get('/health/detailed');
        if (response.body.memory) {
          measurements.push({
            timestamp: Date.now(),
            used: response.body.memory.used,
            total: response.body.memory.total
          });
        }
      } catch (error) {
        console.warn('Failed to get memory metrics:', error.message);
      }
      
      await this.delay(interval);
    }
    
    if (measurements.length > 0) {
      const avgMemory = measurements.reduce((sum, m) => sum + m.used, 0) / measurements.length;
      const maxMemory = Math.max(...measurements.map(m => m.used));
      const minMemory = Math.min(...measurements.map(m => m.used));
      
      console.log(`Average memory usage: ${avgMemory.toFixed(1)}MB`);
      console.log(`Peak memory usage: ${maxMemory}MB`);
      console.log(`Min memory usage: ${minMemory}MB`);
      console.log(`Memory stability: ${maxMemory - minMemory <= 50 ? '✅ Stable' : '⚠️ Variable'}`);
    }
  }
}

/**
 * Run performance tests
 */
async function runPerformanceTests() {
  const tester = new PerformanceTester();
  
  try {
    console.log('🏁 Starting Performance Validation Suite');
    console.log('Phase 14B: Performance Optimization Testing\n');
    
    // Test 1: Cache effectiveness
    await tester.testCacheEffectiveness();
    
    // Test 2: Load testing
    await tester.loadTest(25, 5); // 25 users, 5 requests each
    
    // Test 3: Memory monitoring
    await tester.monitorMemoryUsage(10000); // 10 seconds
    
    console.log('\n✅ Performance validation completed!');
    
  } catch (error) {
    console.error('❌ Performance tests failed:', error);
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = { PerformanceTester, runPerformanceTests };

// Run if called directly
if (require.main === module) {
  runPerformanceTests();
}
