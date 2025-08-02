const request = require('supertest');
const express = require('express');
const { Server } = require('socket.io');
const { createServer } = require('http');

// Import the notification service routes
const notificationRoutes = require('../../apps/microservices/notification-service/src/routes/notifications');
const emailRoutes = require('../../apps/microservices/notification-service/src/routes/email');
const pushRoutes = require('../../apps/microservices/notification-service/src/routes/push');
const smsRoutes = require('../../apps/microservices/notification-service/src/routes/sms');

// Create test app with Socket.IO
const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/notifications/email', emailRoutes);
app.use('/api/v1/notifications/push', pushRoutes);
app.use('/api/v1/notifications/sms', smsRoutes);

describe('Notification Service Integration Tests', () => {
  let socketClient;

  beforeAll((done) => {
    server.listen(() => {
      const port = server.address().port;
      const Client = require('socket.io-client');
      socketClient = new Client(`http://localhost:${port}`);
      socketClient.on('connect', done);
    });
  });

  afterAll(() => {
    server.close();
    if (socketClient) {
      socketClient.close();
    }
  });

  describe('Notification Core Endpoints', () => {
    test('GET /api/v1/notifications/health should return service status', async () => {
      const response = await request(app)
        .get('/api/v1/notifications/health')
        .expect(200);

      expect(response.body).toHaveProperty('service', 'notifications');
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body.features).toContain('realtime');
      expect(response.body.features).toContain('email');
      expect(response.body.features).toContain('push');
      expect(response.body.features).toContain('sms');
    });

    test('GET /api/v1/notifications/:userId should get user notifications', async () => {
      const userId = 'test_user_123';
      const response = await request(app)
        .get(`/api/v1/notifications/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('notifications');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.notifications)).toBe(true);
      
      if (response.body.notifications.length > 0) {
        const notification = response.body.notifications[0];
        expect(notification).toHaveProperty('id');
        expect(notification).toHaveProperty('type');
        expect(notification).toHaveProperty('title');
        expect(notification).toHaveProperty('message');
        expect(notification).toHaveProperty('read');
        expect(notification).toHaveProperty('createdAt');
      }
    });

    test('POST /api/v1/notifications should create notification', async () => {
      const notificationData = {
        userId: 'test_user_123',
        type: 'workout_reminder',
        title: 'Time for your workout!',
        message: 'Your scheduled upper body workout is starting in 15 minutes.',
        priority: 'medium',
        channels: ['push', 'realtime'],
        data: {
          workoutId: 'workout_123',
          scheduledTime: new Date().toISOString()
        }
      };

      const response = await request(app)
        .post('/api/v1/notifications')
        .send(notificationData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Notification created successfully');
      expect(response.body).toHaveProperty('notification');
      expect(response.body.notification).toHaveProperty('id');
      expect(response.body.notification).toHaveProperty('deliveryStatus');
    });

    test('PUT /api/v1/notifications/:id/read should mark notification as read', async () => {
      const notificationId = 'notif_123';
      const response = await request(app)
        .put(`/api/v1/notifications/${notificationId}/read`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Notification marked as read');
      expect(response.body.notification).toHaveProperty('read', true);
      expect(response.body.notification).toHaveProperty('readAt');
    });

    test('DELETE /api/v1/notifications/:id should delete notification', async () => {
      const notificationId = 'notif_123';
      const response = await request(app)
        .delete(`/api/v1/notifications/${notificationId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Notification deleted successfully');
    });

    test('GET /api/v1/notifications/:userId/unread-count should get unread count', async () => {
      const userId = 'test_user_123';
      const response = await request(app)
        .get(`/api/v1/notifications/${userId}/unread-count`)
        .expect(200);

      expect(response.body).toHaveProperty('unreadCount');
      expect(typeof response.body.unreadCount).toBe('number');
      expect(response.body.unreadCount).toBeGreaterThanOrEqual(0);
    });

    test('POST /api/v1/notifications/:userId/mark-all-read should mark all as read', async () => {
      const userId = 'test_user_123';
      const response = await request(app)
        .post(`/api/v1/notifications/${userId}/mark-all-read`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'All notifications marked as read');
      expect(response.body).toHaveProperty('updatedCount');
      expect(typeof response.body.updatedCount).toBe('number');
    });
  });

  describe('Email Notification Endpoints', () => {
    test('GET /api/v1/notifications/email/health should return service status', async () => {
      const response = await request(app)
        .get('/api/v1/notifications/email/health')
        .expect(200);

      expect(response.body).toHaveProperty('service', 'email');
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body.features).toContain('templates');
      expect(response.body.features).toContain('personalization');
    });

    test('POST /api/v1/notifications/email/send should send email', async () => {
      const emailData = {
        to: 'test@example.com',
        template: 'workout_summary',
        data: {
          userName: 'John Doe',
          workoutDate: '2024-01-15',
          exercisesCompleted: 8,
          duration: 45,
          caloriesBurned: 350
        },
        priority: 'normal'
      };

      const response = await request(app)
        .post('/api/v1/notifications/email/send')
        .send(emailData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Email sent successfully');
      expect(response.body).toHaveProperty('messageId');
      expect(response.body).toHaveProperty('status', 'sent');
    });

    test('GET /api/v1/notifications/email/templates should get email templates', async () => {
      const response = await request(app)
        .get('/api/v1/notifications/email/templates')
        .expect(200);

      expect(response.body).toHaveProperty('templates');
      expect(Array.isArray(response.body.templates)).toBe(true);
      
      if (response.body.templates.length > 0) {
        const template = response.body.templates[0];
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('subject');
        expect(template).toHaveProperty('variables');
      }
    });

    test('POST /api/v1/notifications/email/bulk-send should send bulk emails', async () => {
      const bulkData = {
        template: 'weekly_progress_report',
        recipients: [
          {
            email: 'user1@example.com',
            data: { userName: 'John', weeklyProgress: 85 }
          },
          {
            email: 'user2@example.com',
            data: { userName: 'Jane', weeklyProgress: 92 }
          }
        ],
        priority: 'low'
      };

      const response = await request(app)
        .post('/api/v1/notifications/email/bulk-send')
        .send(bulkData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Bulk emails queued successfully');
      expect(response.body).toHaveProperty('queuedCount', 2);
      expect(response.body).toHaveProperty('batchId');
    });

    test('GET /api/v1/notifications/email/status/:messageId should get email status', async () => {
      const messageId = 'msg_123456';
      const response = await request(app)
        .get(`/api/v1/notifications/email/status/${messageId}`)
        .expect(200);

      expect(response.body).toHaveProperty('messageId', messageId);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('sentAt');
      expect(['sent', 'delivered', 'bounced', 'failed']).toContain(response.body.status);
    });
  });

  describe('Push Notification Endpoints', () => {
    test('GET /api/v1/notifications/push/health should return service status', async () => {
      const response = await request(app)
        .get('/api/v1/notifications/push/health')
        .expect(200);

      expect(response.body).toHaveProperty('service', 'push');
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body.features).toContain('ios');
      expect(response.body.features).toContain('android');
      expect(response.body.features).toContain('web');
    });

    test('POST /api/v1/notifications/push/send should send push notification', async () => {
      const pushData = {
        userId: 'test_user_123',
        title: 'Workout Complete!',
        body: 'Great job! You completed your chest workout in 42 minutes.',
        data: {
          type: 'workout_complete',
          workoutId: 'workout_123',
          achievements: ['personal_record']
        },
        priority: 'high',
        sound: 'achievement.wav'
      };

      const response = await request(app)
        .post('/api/v1/notifications/push/send')
        .send(pushData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Push notification sent successfully');
      expect(response.body).toHaveProperty('messageId');
      expect(response.body).toHaveProperty('deliveredTo');
    });

    test('POST /api/v1/notifications/push/register-token should register device token', async () => {
      const tokenData = {
        userId: 'test_user_123',
        token: 'fcm_token_abc123xyz',
        platform: 'ios',
        appVersion: '1.0.0',
        deviceInfo: {
          model: 'iPhone 12',
          osVersion: '15.0'
        }
      };

      const response = await request(app)
        .post('/api/v1/notifications/push/register-token')
        .send(tokenData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Device token registered successfully');
      expect(response.body).toHaveProperty('tokenId');
    });

    test('DELETE /api/v1/notifications/push/unregister-token should unregister token', async () => {
      const tokenData = {
        userId: 'test_user_123',
        token: 'fcm_token_abc123xyz'
      };

      const response = await request(app)
        .delete('/api/v1/notifications/push/unregister-token')
        .send(tokenData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Device token unregistered successfully');
    });

    test('POST /api/v1/notifications/push/topic-subscribe should subscribe to topic', async () => {
      const subscriptionData = {
        userId: 'test_user_123',
        topic: 'workout_tips',
        preferences: {
          frequency: 'weekly',
          time: '09:00'
        }
      };

      const response = await request(app)
        .post('/api/v1/notifications/push/topic-subscribe')
        .send(subscriptionData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Subscribed to topic successfully');
      expect(response.body).toHaveProperty('topicId');
    });

    test('POST /api/v1/notifications/push/topic-broadcast should broadcast to topic', async () => {
      const broadcastData = {
        topic: 'workout_tips',
        title: 'Weekly Workout Tip',
        body: 'Focus on form over weight - perfect technique builds strength safely!',
        data: {
          type: 'tip',
          category: 'form',
          tipId: 'tip_123'
        }
      };

      const response = await request(app)
        .post('/api/v1/notifications/push/topic-broadcast')
        .send(broadcastData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Topic broadcast sent successfully');
      expect(response.body).toHaveProperty('messageId');
      expect(response.body).toHaveProperty('estimatedRecipients');
    });
  });

  describe('SMS Notification Endpoints', () => {
    test('GET /api/v1/notifications/sms/health should return service status', async () => {
      const response = await request(app)
        .get('/api/v1/notifications/sms/health')
        .expect(200);

      expect(response.body).toHaveProperty('service', 'sms');
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body.features).toContain('international');
      expect(response.body.features).toContain('delivery_reports');
    });

    test('POST /api/v1/notifications/sms/send should send SMS', async () => {
      const smsData = {
        to: '+1234567890',
        message: 'Your workout reminder: Upper body session starts in 15 minutes. Ready to crush it? 💪',
        userId: 'test_user_123',
        type: 'workout_reminder'
      };

      const response = await request(app)
        .post('/api/v1/notifications/sms/send')
        .send(smsData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'SMS sent successfully');
      expect(response.body).toHaveProperty('messageId');
      expect(response.body).toHaveProperty('status', 'sent');
    });

    test('POST /api/v1/notifications/sms/verify-phone should send verification SMS', async () => {
      const verificationData = {
        phoneNumber: '+1234567890',
        userId: 'test_user_123'
      };

      const response = await request(app)
        .post('/api/v1/notifications/sms/verify-phone')
        .send(verificationData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Verification code sent');
      expect(response.body).toHaveProperty('verificationId');
      expect(response.body).toHaveProperty('expiresIn');
    });

    test('POST /api/v1/notifications/sms/confirm-verification should confirm verification', async () => {
      const confirmationData = {
        verificationId: 'verify_123',
        code: '123456',
        userId: 'test_user_123'
      };

      const response = await request(app)
        .post('/api/v1/notifications/sms/confirm-verification')
        .send(confirmationData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Phone number verified successfully');
      expect(response.body).toHaveProperty('verified', true);
    });

    test('GET /api/v1/notifications/sms/status/:messageId should get SMS status', async () => {
      const messageId = 'sms_123456';
      const response = await request(app)
        .get(`/api/v1/notifications/sms/status/${messageId}`)
        .expect(200);

      expect(response.body).toHaveProperty('messageId', messageId);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('sentAt');
      expect(['sent', 'delivered', 'failed', 'undelivered']).toContain(response.body.status);
    });
  });

  describe('Real-time WebSocket Communication', () => {
    test('should connect to WebSocket server', (done) => {
      socketClient.on('connect', () => {
        expect(socketClient.connected).toBe(true);
        done();
      });
    });

    test('should handle user join events', (done) => {
      const userData = {
        userId: 'test_user_123',
        userType: 'member'
      };

      socketClient.emit('user:join', userData);
      
      socketClient.on('user:joined', (response) => {
        expect(response).toHaveProperty('status', 'success');
        expect(response).toHaveProperty('userId', userData.userId);
        done();
      });
    });

    test('should handle real-time notifications', (done) => {
      const notificationData = {
        userId: 'test_user_123',
        type: 'achievement',
        title: 'New Personal Record!',
        message: 'You just set a new PR on bench press: 225 lbs!',
        data: {
          exercise: 'bench_press',
          weight: 225,
          previousPR: 215
        }
      };

      socketClient.emit('notification:send', notificationData);
      
      socketClient.on('notification:received', (notification) => {
        expect(notification).toHaveProperty('type', 'achievement');
        expect(notification).toHaveProperty('title', notificationData.title);
        expect(notification).toHaveProperty('timestamp');
        done();
      });
    });

    test('should handle workout status updates', (done) => {
      const workoutUpdate = {
        userId: 'test_user_123',
        workoutId: 'workout_123',
        status: 'in_progress',
        currentExercise: 'bench_press',
        progress: {
          exercisesCompleted: 3,
          totalExercises: 8,
          timeElapsed: 25
        }
      };

      socketClient.emit('workout:status_update', workoutUpdate);
      
      socketClient.on('workout:status_updated', (response) => {
        expect(response).toHaveProperty('workoutId', workoutUpdate.workoutId);
        expect(response).toHaveProperty('status', 'in_progress');
        expect(response.progress).toHaveProperty('exercisesCompleted', 3);
        done();
      });
    });

    test('should handle trainer-client messaging', (done) => {
      const messageData = {
        from: 'trainer_123',
        to: 'test_user_123',
        type: 'coaching_tip',
        message: 'Great form on those squats! Try to go a bit deeper next set.',
        context: {
          workoutId: 'workout_123',
          exerciseId: 'squat'
        }
      };

      socketClient.emit('message:send', messageData);
      
      socketClient.on('message:received', (message) => {
        expect(message).toHaveProperty('from', messageData.from);
        expect(message).toHaveProperty('type', 'coaching_tip');
        expect(message).toHaveProperty('timestamp');
        done();
      });
    });

    test('should handle user disconnect', (done) => {
      socketClient.on('disconnect', () => {
        expect(socketClient.connected).toBe(false);
        done();
      });
      
      socketClient.disconnect();
    });
  });
});
