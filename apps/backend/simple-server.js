// Simple test server to verify basic functionality
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:8081',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'FitTracker Pro Backend is running!'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'FitTracker Pro API is ready',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      workouts: '/api/v1/workouts',
      nutrition: '/api/v1/nutrition',
      social: '/api/v1/social',
      analytics: '/api/v1/analytics'
    }
  });
});

// Simple test endpoints
app.get('/api/v1/exercises', (req, res) => {
  res.json({
    status: 'success',
    data: [
      { id: 1, name: 'Push-ups', category: 'Chest', difficulty: 'beginner' },
      { id: 2, name: 'Squats', category: 'Legs', difficulty: 'beginner' },
      { id: 3, name: 'Pull-ups', category: 'Back', difficulty: 'intermediate' }
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FitTracker Pro Backend Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API status: http://localhost:${PORT}/api/status`);
});
