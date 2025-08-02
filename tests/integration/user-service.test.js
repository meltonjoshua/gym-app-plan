const request = require('supertest');
const express = require('express');

// Import the user service routes
const authRoutes = require('../../apps/microservices/user-service/src/routes/auth');
const userRoutes = require('../../apps/microservices/user-service/src/routes/users');
const profileRoutes = require('../../apps/microservices/user-service/src/routes/profiles');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/profiles', profileRoutes);

describe('User Service Integration Tests', () => {
  describe('Authentication Endpoints', () => {
    test('GET /api/v1/auth/health should return service status', async () => {
      const response = await request(app)
        .get('/api/v1/auth/health')
        .expect(200);

      expect(response.body).toHaveProperty('service', 'auth');
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body.features).toContain('login');
      expect(response.body.features).toContain('register');
    });

    test('POST /api/v1/auth/register should create new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'securePassword123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('userId');
    });

    test('POST /api/v1/auth/login should authenticate user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'securePassword123'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', loginData.email);
    });

    test('POST /api/v1/auth/login with invalid credentials should fail', async () => {
      const invalidLogin = {
        email: 'test@example.com',
        password: 'wrongPassword'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(invalidLogin)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Login failed');
    });

    test('POST /api/v1/auth/refresh should return new token', async () => {
      const refreshData = {
        refreshToken: 'valid_refresh_token'
      };

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send(refreshData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Token refreshed');
      expect(response.body).toHaveProperty('token');
    });

    test('POST /api/v1/auth/logout should logout user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });
  });

  describe('User Management Endpoints', () => {
    test('GET /api/v1/users/health should return service status', async () => {
      const response = await request(app)
        .get('/api/v1/users/health')
        .expect(200);

      expect(response.body).toHaveProperty('service', 'users');
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body.features).toContain('create');
      expect(response.body.features).toContain('read');
    });

    test('GET /api/v1/users should return user list with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
    });

    test('GET /api/v1/users/:id should return specific user', async () => {
      const userId = 'test_user_123';
      const response = await request(app)
        .get(`/api/v1/users/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', userId);
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('createdAt');
    });

    test('PUT /api/v1/users/:id should update user', async () => {
      const userId = 'test_user_123';
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith'
      };

      const response = await request(app)
        .put(`/api/v1/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User updated successfully');
      expect(response.body.user).toHaveProperty('id', userId);
      expect(response.body.user).toHaveProperty('updatedAt');
    });

    test('DELETE /api/v1/users/:id should delete user', async () => {
      const userId = 'test_user_123';
      const response = await request(app)
        .delete(`/api/v1/users/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User deleted successfully');
      expect(response.body).toHaveProperty('userId', userId);
    });
  });

  describe('Profile Management Endpoints', () => {
    test('GET /api/v1/profiles/health should return service status', async () => {
      const response = await request(app)
        .get('/api/v1/profiles/health')
        .expect(200);

      expect(response.body).toHaveProperty('service', 'profiles');
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body.features).toContain('fitness-goals');
      expect(response.body.features).toContain('preferences');
    });

    test('GET /api/v1/profiles/:userId should return user profile', async () => {
      const userId = 'test_user_123';
      const response = await request(app)
        .get(`/api/v1/profiles/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('profile');
      expect(response.body.profile).toHaveProperty('userId', userId);
      expect(response.body.profile).toHaveProperty('fitnessGoals');
      expect(response.body.profile).toHaveProperty('preferences');
      expect(response.body.profile).toHaveProperty('stats');
    });

    test('PUT /api/v1/profiles/:userId should update profile', async () => {
      const userId = 'test_user_123';
      const profileData = {
        fitnessGoals: ['muscle_gain', 'strength'],
        preferences: {
          workoutTypes: ['strength', 'powerlifting'],
          difficultyLevel: 'advanced',
          workoutDuration: 60
        }
      };

      const response = await request(app)
        .put(`/api/v1/profiles/${userId}`)
        .send(profileData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Profile updated successfully');
      expect(response.body.profile).toHaveProperty('userId', userId);
      expect(response.body.profile).toHaveProperty('updatedAt');
    });

    test('GET /api/v1/profiles/:userId/achievements should return achievements', async () => {
      const userId = 'test_user_123';
      const response = await request(app)
        .get(`/api/v1/profiles/${userId}/achievements`)
        .expect(200);

      expect(response.body).toHaveProperty('achievements');
      expect(Array.isArray(response.body.achievements)).toBe(true);
      
      if (response.body.achievements.length > 0) {
        const achievement = response.body.achievements[0];
        expect(achievement).toHaveProperty('id');
        expect(achievement).toHaveProperty('title');
        expect(achievement).toHaveProperty('description');
        expect(achievement).toHaveProperty('unlockedAt');
      }
    });
  });

  describe('Error Handling', () => {
    test('Invalid route should return 404', async () => {
      const response = await request(app)
        .get('/api/v1/invalid-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
    });

    test('Invalid JSON should return 400', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });
  });
});
