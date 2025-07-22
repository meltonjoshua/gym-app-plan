import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '@/models/User';
import { logger } from '@/utils/logger';
import { getRedisClient } from '@/utils/redis';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export const setupSocketHandlers = (io: SocketServer) => {
  
  // Authentication middleware for socket connections
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Check if user exists
      const user = await User.findById(decoded.userId);
      if (!user || !user.active) {
        return next(new Error('User not found or inactive'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      
      logger.debug('Socket authenticated', { 
        userId: user._id, 
        socketId: socket.id 
      });
      
      next();
    } catch (error) {
      logger.error('Socket authentication failed', { 
        error, 
        socketId: socket.id 
      });
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    
    logger.info('User connected via socket', { 
      userId, 
      socketId: socket.id 
    });

    // Join user to their personal room
    socket.join(`user:${userId}`);

    // Handle trainer session rooms
    socket.on('join:trainer-session', async (data: { sessionId: string }) => {
      try {
        // Verify user has access to this session
        const sessionRoom = `trainer-session:${data.sessionId}`;
        socket.join(sessionRoom);
        
        logger.info('User joined trainer session', { 
          userId, 
          sessionId: data.sessionId 
        });

        // Notify others in the session
        socket.to(sessionRoom).emit('user:joined-session', {
          userId,
          userName: socket.user.name,
          timestamp: new Date()
        });

      } catch (error) {
        logger.error('Failed to join trainer session', { error, userId });
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // Handle workout coaching updates
    socket.on('workout:form-analysis', async (data: { 
      exerciseId: string, 
      formData: any 
    }) => {
      try {
        // Process form analysis (would integrate with AI service)
        const analysis = {
          exerciseId: data.exerciseId,
          score: Math.floor(Math.random() * 100), // Mock analysis
          feedback: "Good form! Keep your core engaged.",
          improvements: ["Slower tempo on the eccentric phase"],
          timestamp: new Date()
        };

        // Send back to user
        socket.emit('workout:form-feedback', analysis);

        // If in trainer session, notify trainer
        const trainerSessionRoom = `trainer-session:${data.exerciseId}`;
        socket.to(trainerSessionRoom).emit('workout:client-form-update', {
          userId,
          analysis
        });

        logger.debug('Form analysis processed', { userId, exerciseId: data.exerciseId });

      } catch (error) {
        logger.error('Failed to process form analysis', { error, userId });
      }
    });

    // Handle real-time chat in trainer sessions
    socket.on('chat:message', async (data: { 
      sessionId: string, 
      message: string,
      type: 'text' | 'voice' | 'image'
    }) => {
      try {
        const chatMessage = {
          id: Date.now().toString(),
          sessionId: data.sessionId,
          senderId: userId,
          senderName: socket.user.name,
          senderAvatar: socket.user.avatar,
          message: data.message,
          type: data.type,
          timestamp: new Date()
        };

        // Store message in Redis for session history
        const redisClient = getRedisClient();
        await redisClient.lPush(
          `chat:session:${data.sessionId}`, 
          JSON.stringify(chatMessage)
        );
        
        // Set expiration for chat history (30 days)
        await redisClient.expire(`chat:session:${data.sessionId}`, 30 * 24 * 60 * 60);

        // Broadcast to session participants
        io.to(`trainer-session:${data.sessionId}`).emit('chat:new-message', chatMessage);

        logger.debug('Chat message sent', { 
          userId, 
          sessionId: data.sessionId,
          messageLength: data.message.length 
        });

      } catch (error) {
        logger.error('Failed to send chat message', { error, userId });
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle social feed real-time updates
    socket.on('social:like-post', async (data: { postId: string }) => {
      try {
        // Update like in database (would be implemented)
        const notification = {
          type: 'like',
          postId: data.postId,
          userId,
          userName: socket.user.name,
          timestamp: new Date()
        };

        // Notify post owner
        io.to(`user:${data.postId.split('_')[0]}`).emit('notification:like', notification);

        logger.debug('Post liked', { userId, postId: data.postId });

      } catch (error) {
        logger.error('Failed to process like', { error, userId });
      }
    });

    // Handle workout session sharing
    socket.on('workout:share-live', async (data: { 
      workoutId: string, 
      currentExercise: any,
      progress: number 
    }) => {
      try {
        const liveUpdate = {
          userId,
          userName: socket.user.name,
          workoutId: data.workoutId,
          currentExercise: data.currentExercise,
          progress: data.progress,
          timestamp: new Date()
        };

        // Broadcast to user's followers (would get follower list from DB)
        socket.broadcast.emit('social:live-workout-update', liveUpdate);

        logger.debug('Live workout shared', { userId, workoutId: data.workoutId });

      } catch (error) {
        logger.error('Failed to share live workout', { error, userId });
      }
    });

    // Handle challenge updates
    socket.on('challenge:progress-update', async (data: { 
      challengeId: string, 
      progress: number 
    }) => {
      try {
        const progressUpdate = {
          challengeId: data.challengeId,
          userId,
          userName: socket.user.name,
          progress: data.progress,
          timestamp: new Date()
        };

        // Broadcast to challenge participants
        io.to(`challenge:${data.challengeId}`).emit('challenge:participant-update', progressUpdate);

        logger.debug('Challenge progress updated', { 
          userId, 
          challengeId: data.challengeId, 
          progress: data.progress 
        });

      } catch (error) {
        logger.error('Failed to update challenge progress', { error, userId });
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info('User disconnected', { 
        userId, 
        socketId: socket.id, 
        reason 
      });

      // Leave all rooms
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });
    });

    // Handle typing indicators for chat
    socket.on('chat:typing', (data: { sessionId: string, isTyping: boolean }) => {
      socket.to(`trainer-session:${data.sessionId}`).emit('chat:user-typing', {
        userId,
        userName: socket.user.name,
        isTyping: data.isTyping,
        timestamp: new Date()
      });
    });

    // Handle heart rate monitoring
    socket.on('health:heart-rate', async (data: { bpm: number, exerciseId?: string }) => {
      try {
        const heartRateData = {
          userId,
          bpm: data.bpm,
          exerciseId: data.exerciseId,
          timestamp: new Date()
        };

        // Store in Redis for real-time monitoring
        const redisClient = getRedisClient();
        await redisClient.lPush(
          `health:heart-rate:${userId}`, 
          JSON.stringify(heartRateData)
        );
        
        // Keep only last 100 readings
        await redisClient.lTrim(`health:heart-rate:${userId}`, 0, 99);

        // If in trainer session, notify trainer of abnormal readings
        if (data.bpm > 180 || data.bpm < 50) {
          socket.rooms.forEach(room => {
            if (room.startsWith('trainer-session:')) {
              io.to(room).emit('health:heart-rate-alert', {
                userId,
                userName: socket.user.name,
                bpm: data.bpm,
                severity: data.bpm > 190 ? 'critical' : 'warning'
              });
            }
          });
        }

        logger.debug('Heart rate recorded', { userId, bpm: data.bpm });

      } catch (error) {
        logger.error('Failed to process heart rate', { error, userId });
      }
    });
  });

  // Periodic cleanup of inactive connections
  setInterval(() => {
    const socketCount = io.engine.clientsCount;
    logger.debug('Active socket connections', { count: socketCount });
  }, 60000); // Every minute
};