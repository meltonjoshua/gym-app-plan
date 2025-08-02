// Test server without database dependencies
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'FitTracker Pro Backend is running!',
    version: '1.0.0'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'FitTracker Pro API is ready',
    version: '1.0.0',
    environment: 'development',
    endpoints: {
      auth: '/api/v1/auth',
      workouts: '/api/v1/workouts',
      nutrition: '/api/v1/nutrition',
      social: '/api/v1/social',
      analytics: '/api/v1/analytics'
    }
  });
});

// Mock workout endpoints
app.get('/api/v1/workouts', (req, res) => {
  res.json({
    status: 'success',
    data: [
      {
        id: '1',
        name: 'Morning Routine',
        description: 'Quick morning workout',
        duration: 30,
        exercises: [
          { name: 'Push-ups', sets: 3, reps: 10 },
          { name: 'Squats', sets: 3, reps: 15 },
          { name: 'Plank', sets: 1, duration: 60 }
        ]
      },
      {
        id: '2',
        name: 'Evening Strength',
        description: 'Strength training session',
        duration: 45,
        exercises: [
          { name: 'Pull-ups', sets: 3, reps: 8 },
          { name: 'Deadlifts', sets: 3, reps: 5 },
          { name: 'Lunges', sets: 3, reps: 12 }
        ]
      }
    ]
  });
});

app.get('/api/v1/exercises', (req, res) => {
  res.json({
    status: 'success',
    data: [
      { id: 1, name: 'Push-ups', category: 'Chest', difficulty: 'beginner', muscle_groups: ['chest', 'triceps', 'shoulders'] },
      { id: 2, name: 'Squats', category: 'Legs', difficulty: 'beginner', muscle_groups: ['quadriceps', 'glutes', 'hamstrings'] },
      { id: 3, name: 'Pull-ups', category: 'Back', difficulty: 'intermediate', muscle_groups: ['back', 'biceps'] },
      { id: 4, name: 'Plank', category: 'Core', difficulty: 'beginner', muscle_groups: ['core', 'shoulders'] },
      { id: 5, name: 'Deadlifts', category: 'Full Body', difficulty: 'advanced', muscle_groups: ['back', 'legs', 'core'] }
    ]
  });
});

// Mock nutrition endpoints
app.get('/api/v1/nutrition', (req, res) => {
  res.json({
    status: 'success',
    data: {
      daily_calories: 2000,
      consumed: 1650,
      remaining: 350,
      macros: {
        protein: { target: 150, consumed: 120 },
        carbs: { target: 200, consumed: 180 },
        fat: { target: 67, consumed: 55 }
      },
      recent_meals: [
        { name: 'Breakfast', calories: 450, time: '08:00' },
        { name: 'Lunch', calories: 650, time: '12:30' },
        { name: 'Snack', calories: 200, time: '15:00' },
        { name: 'Dinner', calories: 350, time: '18:00' }
      ]
    }
  });
});

// Mock analytics endpoints
app.get('/api/v1/analytics/dashboard', (req, res) => {
  res.json({
    status: 'success',
    data: {
      workouts_this_week: 4,
      calories_burned: 1200,
      active_minutes: 180,
      streak_days: 7,
      weight_progress: {
        current: 75,
        change: -2.5,
        unit: 'kg'
      },
      recent_activities: [
        { type: 'workout', name: 'Morning Routine', date: '2025-08-01' },
        { type: 'nutrition', name: 'Meal logged', date: '2025-08-01' },
        { type: 'weight', value: 75, date: '2025-08-01' }
      ]
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FitTracker Pro Test Backend Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API status: http://localhost:${PORT}/api/status`);
  console.log(`Environment: development (no database required)`);
  console.log(`Server ready to accept connections!`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});
