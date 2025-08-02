const express = require('express');
const router = express.Router();

// GET /api/v1/realtime/health
router.get('/health', (req, res) => {
  const connectedUsers = req.app.get('connectedUsers');
  res.json({
    service: 'realtime',
    status: 'operational',
    features: ['websockets', 'live-updates', 'workout-tracking', 'social-feeds'],
    connectedUsers: connectedUsers.size
  });
});

// POST /api/v1/realtime/broadcast
router.post('/broadcast', async (req, res) => {
  try {
    const { message, type, data, targetUsers } = req.body;
    const io = req.app.get('io');
    
    const broadcastData = {
      id: `broadcast_${Date.now()}`,
      type,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    
    if (targetUsers && targetUsers.length > 0) {
      // Send to specific users
      targetUsers.forEach(userId => {
        io.to(`user_${userId}`).emit('broadcast', broadcastData);
      });
    } else {
      // Send to all connected users
      io.emit('broadcast', broadcastData);
    }
    
    res.json({
      message: 'Broadcast sent successfully',
      broadcast: broadcastData,
      targetCount: targetUsers ? targetUsers.length : 'all'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Failed to send broadcast',
      message: error.message
    });
  }
});

// POST /api/v1/realtime/workout-update
router.post('/workout-update', async (req, res) => {
  try {
    const { userId, workoutId, exercise, progress, timestamp } = req.body;
    const io = req.app.get('io');
    
    const workoutUpdate = {
      type: 'workout_progress',
      userId,
      workoutId,
      exercise,
      progress,
      timestamp: timestamp || new Date().toISOString()
    };
    
    // Send to user's connected devices
    io.to(`user_${userId}`).emit('workout_update', workoutUpdate);
    
    // Optional: Send to workout buddies or trainers
    // TODO: Implement workout sharing logic
    
    res.json({
      message: 'Workout update sent',
      update: workoutUpdate
    });
  } catch (error) {
    res.status(400).json({
      error: 'Failed to send workout update',
      message: error.message
    });
  }
});

// POST /api/v1/realtime/achievement
router.post('/achievement', async (req, res) => {
  try {
    const { userId, achievement, celebrationType = 'fireworks' } = req.body;
    const io = req.app.get('io');
    
    const achievementData = {
      type: 'achievement_unlocked',
      userId,
      achievement: {
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        rarity: achievement.rarity
      },
      celebration: {
        type: celebrationType,
        duration: 3000
      },
      timestamp: new Date().toISOString()
    };
    
    // Send achievement notification
    io.to(`user_${userId}`).emit('achievement', achievementData);
    
    res.json({
      message: 'Achievement notification sent',
      achievement: achievementData
    });
  } catch (error) {
    res.status(400).json({
      error: 'Failed to send achievement notification',
      message: error.message
    });
  }
});

// GET /api/v1/realtime/connected-users
router.get('/connected-users', (req, res) => {
  try {
    const connectedUsers = req.app.get('connectedUsers');
    const userList = Array.from(connectedUsers.keys());
    
    res.json({
      connectedUsers: userList,
      count: userList.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get connected users',
      message: error.message
    });
  }
});

// POST /api/v1/realtime/social-update
router.post('/social-update', async (req, res) => {
  try {
    const { userId, updateType, content, targetUsers } = req.body;
    const io = req.app.get('io');
    
    const socialUpdate = {
      type: 'social_update',
      userId,
      updateType, // 'workout_completed', 'pr_achieved', 'goal_reached'
      content,
      timestamp: new Date().toISOString()
    };
    
    // Send to followers or friends
    if (targetUsers && targetUsers.length > 0) {
      targetUsers.forEach(targetUserId => {
        io.to(`user_${targetUserId}`).emit('social_update', socialUpdate);
      });
    }
    
    res.json({
      message: 'Social update sent',
      update: socialUpdate,
      targetCount: targetUsers ? targetUsers.length : 0
    });
  } catch (error) {
    res.status(400).json({
      error: 'Failed to send social update',
      message: error.message
    });
  }
});

module.exports = router;
