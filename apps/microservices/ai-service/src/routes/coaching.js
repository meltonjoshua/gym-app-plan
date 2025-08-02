const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Health check for coaching service
router.get('/health', (req, res) => {
  res.json({
    service: 'ai-coaching',
    status: 'operational',
    features: ['personalized_coaching', 'technique_tips', 'motivation', 'progress_guidance'],
    timestamp: new Date().toISOString()
  });
});

// Get personalized coaching advice
router.get('/:userId/advice', (req, res) => {
  const { userId } = req.params;
  const { context } = req.query; // workout, exercise, recovery, etc.

  logger.info({
    service: 'ai-service',
    action: 'get_coaching_advice',
    userId: userId,
    context: context
  });

  // Mock coaching advice based on context
  const adviceMap = {
    workout: [
      'Remember to warm up properly before starting your workout',
      'Focus on quality over quantity - perfect form leads to better results',
      'Stay hydrated throughout your session'
    ],
    exercise: [
      'Engage your core throughout the movement',
      'Control both the lifting and lowering phases',
      'Breathe out during the exertion phase'
    ],
    recovery: [
      'Your body grows during rest, not just during workouts',
      'Aim for 7-9 hours of quality sleep tonight',
      'Consider some light stretching or yoga today'
    ],
    nutrition: [
      'Fuel your body with protein within 30 minutes post-workout',
      'Stay consistent with your nutrition - small changes add up',
      'Listen to your body\'s hunger and fullness cues'
    ]
  };

  const advice = adviceMap[context] || adviceMap.workout;
  const selectedAdvice = advice[Math.floor(Math.random() * advice.length)];

  res.json({
    advice: selectedAdvice,
    context: context || 'general',
    userId,
    coachingTips: [
      'Progressive overload is key to continuous improvement',
      'Consistency beats perfection every time',
      'Celebrate small wins along your fitness journey'
    ],
    motivationalQuote: 'The only bad workout is the one that didn\'t happen',
    timestamp: new Date().toISOString()
  });
});

// Get technique tips for specific exercises
router.get('/technique/:exerciseId', (req, res) => {
  const { exerciseId } = req.params;

  logger.info({
    service: 'ai-service',
    action: 'get_technique_tips',
    exercise: exerciseId
  });

  // Mock technique tips based on exercise
  const techniqueTips = {
    squat: [
      'Keep your feet shoulder-width apart',
      'Drive through your heels when standing up',
      'Keep your knees in line with your toes',
      'Maintain a neutral spine throughout the movement'
    ],
    deadlift: [
      'Keep the bar close to your body',
      'Start with your shoulders over the bar',
      'Engage your lats to maintain bar position',
      'Drive through your heels and push the floor away'
    ],
    bench_press: [
      'Retract your shoulder blades for stability',
      'Keep your feet firmly planted on the ground',
      'Lower the bar to your chest with control',
      'Press up in a slight arc, not straight up'
    ]
  };

  const tips = techniqueTips[exerciseId] || [
    'Focus on proper form over heavy weight',
    'Control the movement throughout full range of motion',
    'Breathe properly during each repetition'
  ];

  res.json({
    exerciseId,
    techniqueTips: tips,
    commonMistakes: [
      'Rushing through repetitions',
      'Using too much weight too soon',
      'Neglecting proper warm-up'
    ],
    progressionTips: [
      'Master bodyweight version first',
      'Add weight gradually (2.5-5lbs per week)',
      'Focus on time under tension'
    ],
    timestamp: new Date().toISOString()
  });
});

// Provide motivational coaching
router.post('/:userId/motivation', (req, res) => {
  const { userId } = req.params;
  const { mood, energy, goal } = req.body;

  logger.info({
    service: 'ai-service',
    action: 'provide_motivation',
    userId: userId,
    mood: mood
  });

  // Generate personalized motivation based on user state
  const motivationMessages = {
    low_energy: [
      'Every champion was once a beginner who refused to give up',
      'You don\'t have to be great to get started, but you have to get started to be great',
      'Even a 10-minute workout is better than no workout at all'
    ],
    high_energy: [
      'Channel this energy into crushing your workout today!',
      'Great energy means great potential for an amazing session',
      'Ride this wave of motivation and push your limits today'
    ],
    frustrated: [
      'Progress isn\'t always linear - trust the process',
      'Every setback is a setup for a comeback',
      'Focus on what you can control: effort, consistency, and attitude'
    ],
    confident: [
      'Confidence is your superpower - use it wisely today',
      'Build on this momentum and set a new personal record',
      'Your confidence is earned through consistent effort'
    ]
  };

  const messages = motivationMessages[mood] || motivationMessages.confident;
  const selectedMessage = messages[Math.floor(Math.random() * messages.length)];

  res.json({
    motivationalMessage: selectedMessage,
    personalizedTip: `Based on your ${goal} goal, remember that consistency is more important than intensity`,
    actionItem: 'Set one small, achievable goal for today\'s session',
    affirmation: 'You are stronger than you think and more capable than you know',
    userId,
    timestamp: new Date().toISOString()
  });
});

// Weekly coaching summary
router.get('/:userId/weekly-summary', (req, res) => {
  const { userId } = req.params;

  logger.info({
    service: 'ai-service',
    action: 'weekly_coaching_summary',
    userId: userId
  });

  const summary = {
    weeklyHighlights: [
      'Completed 4 out of 5 planned workouts',
      'Improved squat form significantly',
      'Consistent with nutrition tracking'
    ],
    areasForImprovement: [
      'Focus on sleep quality this week',
      'Add more mobility work to routine',
      'Increase water intake'
    ],
    nextWeekFocus: 'Progressive overload on compound movements',
    celebrationMoment: 'You lifted heavier on deadlifts than ever before!',
    coachNotes: 'Great week overall. Your consistency is paying off. Keep up the excellent work!',
    weeklyGoal: 'Aim for 5 complete workouts next week'
  };

  res.json({
    summary,
    userId,
    weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    weekEnd: new Date().toISOString()
  });
});

module.exports = router;
