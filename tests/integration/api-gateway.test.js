const request = require('supertest');
const express = require('express');

// Import the API Gateway app
const gateway = require('../../apps/microservices/api-gateway/src/app');

describe('API Gateway Integration Tests', () => {
  describe('Gateway Health and Routing', () => {
    test('GET /health should return gateway status', async () => {
      const response = await request(gateway)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('service', 'api-gateway');
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body).toHaveProperty('services');
      expect(response.body.services).toHaveProperty('user-service');
      expect(response.body.services).toHaveProperty('workout-service');
      expect(response.body.services).toHaveProperty('ai-service');
      expect(response.body.services).toHaveProperty('notification-service');
    });

    test('GET /api/v1/status should return detailed service status', async () => {
      const response = await request(gateway)
        .get('/api/v1/status')
        .expect(200);

      expect(response.body).toHaveProperty('gateway');
      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('performance');
      expect(response.body.gateway).toHaveProperty('uptime');
      expect(response.body.gateway).toHaveProperty('requestCount');
      expect(response.body.gateway).toHaveProperty('errorRate');
    });

    test('GET /api/v1/metrics should return gateway metrics', async () => {
      const response = await request(gateway)
        .get('/api/v1/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('requests');
      expect(response.body).toHaveProperty('latency');
      expect(response.body).toHaveProperty('errors');
      expect(response.body).toHaveProperty('services');
      expect(response.body.requests).toHaveProperty('total');
      expect(response.body.requests).toHaveProperty('perMinute');
    });
  });

  describe('User Service Routing', () => {
    test('POST /api/v1/users/auth/register should route to user service', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'securePassword123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(gateway)
        .post('/api/v1/users/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.headers).toHaveProperty('x-gateway-service', 'user-service');
    });

    test('POST /api/v1/users/auth/login should route to user service', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'securePassword123'
      };

      const response = await request(gateway)
        .post('/api/v1/users/auth/login')
        .send(loginData);

      expect([200, 401]).toContain(response.status);
      expect(response.headers).toHaveProperty('x-gateway-service', 'user-service');
    });

    test('GET /api/v1/users/profile should route to user service with auth', async () => {
      const response = await request(gateway)
        .get('/api/v1/users/profile')
        .set('Authorization', 'Bearer mock_token');

      expect([200, 401]).toContain(response.status);
      expect(response.headers).toHaveProperty('x-gateway-service', 'user-service');
    });
  });

  describe('Workout Service Routing', () => {
    test('GET /api/v1/workouts should route to workout service', async () => {
      const response = await request(gateway)
        .get('/api/v1/workouts?userId=test_user_123')
        .expect(200);

      expect(response.body).toHaveProperty('workouts');
      expect(response.headers).toHaveProperty('x-gateway-service', 'workout-service');
    });

    test('POST /api/v1/workouts should route to workout service', async () => {
      const workoutData = {
        userId: 'test_user_123',
        name: 'Gateway Test Workout',
        type: 'strength',
        exercises: [
          { name: 'Push-ups', sets: 3, reps: 10 }
        ]
      };

      const response = await request(gateway)
        .post('/api/v1/workouts')
        .send(workoutData)
        .expect(201);

      expect(response.body).toHaveProperty('workout');
      expect(response.headers).toHaveProperty('x-gateway-service', 'workout-service');
    });

    test('GET /api/v1/exercises should route to workout service', async () => {
      const response = await request(gateway)
        .get('/api/v1/exercises')
        .expect(200);

      expect(response.body).toHaveProperty('exercises');
      expect(response.headers).toHaveProperty('x-gateway-service', 'workout-service');
    });

    test('GET /api/v1/routines should route to workout service', async () => {
      const response = await request(gateway)
        .get('/api/v1/routines')
        .expect(200);

      expect(response.body).toHaveProperty('routines');
      expect(response.headers).toHaveProperty('x-gateway-service', 'workout-service');
    });
  });

  describe('AI Service Routing', () => {
    test('GET /api/v1/ai/models should route to AI service', async () => {
      const response = await request(gateway)
        .get('/api/v1/ai/models')
        .expect(200);

      expect(response.body).toHaveProperty('models');
      expect(response.headers).toHaveProperty('x-gateway-service', 'ai-service');
    });

    test('POST /api/v1/ai/workouts/generate should route to AI service', async () => {
      const generationData = {
        userId: 'test_user_123',
        preferences: {
          type: 'strength',
          duration: 45,
          difficulty: 'intermediate'
        }
      };

      const response = await request(gateway)
        .post('/api/v1/ai/workouts/generate')
        .send(generationData)
        .expect(200);

      expect(response.body).toHaveProperty('workout');
      expect(response.headers).toHaveProperty('x-gateway-service', 'ai-service');
    });

    test('POST /api/v1/ai/analysis/form should route to AI service', async () => {
      const formData = {
        userId: 'test_user_123',
        exerciseId: 'bench_press',
        videoData: { url: 'test.mp4' }
      };

      const response = await request(gateway)
        .post('/api/v1/ai/analysis/form')
        .send(formData)
        .expect(200);

      expect(response.body).toHaveProperty('analysis');
      expect(response.headers).toHaveProperty('x-gateway-service', 'ai-service');
    });

    test('GET /api/v1/ai/recommendations/:userId should route to AI service', async () => {
      const userId = 'test_user_123';
      const response = await request(gateway)
        .get(`/api/v1/ai/recommendations/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('recommendations');
      expect(response.headers).toHaveProperty('x-gateway-service', 'ai-service');
    });
  });

  describe('Notification Service Routing', () => {
    test('GET /api/v1/notifications/:userId should route to notification service', async () => {
      const userId = 'test_user_123';
      const response = await request(gateway)
        .get(`/api/v1/notifications/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('notifications');
      expect(response.headers).toHaveProperty('x-gateway-service', 'notification-service');
    });

    test('POST /api/v1/notifications should route to notification service', async () => {
      const notificationData = {
        userId: 'test_user_123',
        type: 'workout_reminder',
        title: 'Test Notification',
        message: 'This is a test notification from the gateway'
      };

      const response = await request(gateway)
        .post('/api/v1/notifications')
        .send(notificationData)
        .expect(201);

      expect(response.body).toHaveProperty('notification');
      expect(response.headers).toHaveProperty('x-gateway-service', 'notification-service');
    });

    test('POST /api/v1/notifications/email/send should route to notification service', async () => {
      const emailData = {
        to: 'test@example.com',
        template: 'test_template',
        data: { userName: 'Test User' }
      };

      const response = await request(gateway)
        .post('/api/v1/notifications/email/send')
        .send(emailData)
        .expect(200);

      expect(response.body).toHaveProperty('messageId');
      expect(response.headers).toHaveProperty('x-gateway-service', 'notification-service');
    });

    test('POST /api/v1/notifications/push/send should route to notification service', async () => {
      const pushData = {
        userId: 'test_user_123',
        title: 'Test Push',
        body: 'Test push notification from gateway'
      };

      const response = await request(gateway)
        .post('/api/v1/notifications/push/send')
        .send(pushData)
        .expect(200);

      expect(response.body).toHaveProperty('messageId');
      expect(response.headers).toHaveProperty('x-gateway-service', 'notification-service');
    });
  });

  describe('Error Handling and Fallbacks', () => {
    test('should handle service unavailable errors', async () => {
      // Test with a non-existent endpoint that would fail routing
      const response = await request(gateway)
        .get('/api/v1/nonexistent/service')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Service not found');
    });

    test('should handle rate limiting', async () => {
      // Make multiple rapid requests to test rate limiting
      const requests = Array(10).fill().map(() => 
        request(gateway)
          .get('/api/v1/workouts?userId=rate_limit_test')
      );

      const responses = await Promise.all(requests);
      
      // At least some requests should succeed
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThan(0);
      
      // Check if rate limiting headers are present
      const firstResponse = responses[0];
      expect(firstResponse.headers).toHaveProperty('x-ratelimit-limit');
      expect(firstResponse.headers).toHaveProperty('x-ratelimit-remaining');
    });

    test('should handle authentication errors consistently', async () => {
      const response = await request(gateway)
        .get('/api/v1/users/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Authentication required');
    });

    test('should handle timeout errors gracefully', async () => {
      // Test with a request that might timeout
      const response = await request(gateway)
        .post('/api/v1/ai/analysis/complex-analysis')
        .send({ userId: 'timeout_test', complexData: 'large_dataset' })
        .timeout(5000);

      // Should either succeed or fail gracefully
      expect([200, 408, 500]).toContain(response.status);
      
      if (response.status !== 200) {
        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('Load Balancing and Circuit Breaker', () => {
    test('should distribute requests across service instances', async () => {
      const responses = [];
      
      // Make multiple requests to the same service
      for (let i = 0; i < 5; i++) {
        const response = await request(gateway)
          .get('/api/v1/workouts/health')
          .expect(200);
        
        responses.push(response);
      }

      // Check that requests are being processed
      responses.forEach(response => {
        expect(response.body).toHaveProperty('service', 'workouts');
        expect(response.body).toHaveProperty('status', 'operational');
      });
    });

    test('should handle circuit breaker patterns', async () => {
      // This test would check circuit breaker functionality
      // In a real scenario, we'd simulate service failures
      const response = await request(gateway)
        .get('/api/v1/status')
        .expect(200);

      expect(response.body.services).toBeDefined();
      
      // Check that each service status is monitored
      Object.values(response.body.services).forEach(service => {
        expect(service).toHaveProperty('status');
        expect(service).toHaveProperty('responseTime');
      });
    });
  });

  describe('API Versioning and Backward Compatibility', () => {
    test('should handle v1 API routes correctly', async () => {
      const response = await request(gateway)
        .get('/api/v1/workouts/health')
        .expect(200);

      expect(response.body).toHaveProperty('service');
      expect(response.headers).toHaveProperty('api-version', 'v1');
    });

    test('should provide API version information', async () => {
      const response = await request(gateway)
        .get('/api/version')
        .expect(200);

      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('supportedVersions');
      expect(response.body.supportedVersions).toContain('v1');
    });

    test('should handle invalid API versions gracefully', async () => {
      const response = await request(gateway)
        .get('/api/v99/workouts')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('API version not supported');
    });
  });

  describe('Security and CORS', () => {
    test('should include security headers', async () => {
      const response = await request(gateway)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
      expect(response.headers).toHaveProperty('x-xss-protection', '1; mode=block');
    });

    test('should handle CORS preflight requests', async () => {
      const response = await request(gateway)
        .options('/api/v1/workouts')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
    });

    test('should validate request size limits', async () => {
      const largePayload = {
        data: 'x'.repeat(10 * 1024 * 1024) // 10MB
      };

      const response = await request(gateway)
        .post('/api/v1/workouts')
        .send(largePayload);

      expect([413, 400]).toContain(response.status);
      
      if (response.status === 413) {
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('too large');
      }
    });
  });
});
