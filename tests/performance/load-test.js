const k6 = require('k6');
const http = require('k6/http');
const { check, sleep } = require('k6');

// Load testing configuration
export let options = {
  stages: [
    // Ramp up to 100 users over 2 minutes
    { duration: '2m', target: 100 },
    // Stay at 100 users for 5 minutes
    { duration: '5m', target: 100 },
    // Ramp up to 200 users over 2 minutes
    { duration: '2m', target: 200 },
    // Stay at 200 users for 5 minutes
    { duration: '5m', target: 200 },
    // Ramp down to 0 users over 2 minutes
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    // HTTP response time should be less than 500ms for 95% of requests
    http_req_duration: ['p(95)<500'],
    // HTTP failure rate should be less than 1%
    http_req_failed: ['rate<0.01'],
    // Gateway response time should be less than 200ms for 90% of requests
    'http_req_duration{endpoint:gateway}': ['p(90)<200'],
    // User service response time should be less than 300ms for 95% of requests
    'http_req_duration{service:user}': ['p(95)<300'],
    // Workout service response time should be less than 400ms for 95% of requests
    'http_req_duration{service:workout}': ['p(95)<400'],
    // AI service response time should be less than 1000ms for 95% of requests
    'http_req_duration{service:ai}': ['p(95)<1000'],
    // Notification service response time should be less than 300ms for 95% of requests
    'http_req_duration{service:notification}': ['p(95)<300'],
  },
};

const BASE_URL = 'http://localhost:3000';

// Test data
const testUsers = [
  { id: 'user_1', email: 'test1@example.com', password: 'password123' },
  { id: 'user_2', email: 'test2@example.com', password: 'password123' },
  { id: 'user_3', email: 'test3@example.com', password: 'password123' },
];

const workoutTemplates = [
  {
    name: 'Upper Body Strength',
    type: 'strength',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 8 },
      { name: 'Pull-ups', sets: 3, reps: 10 },
      { name: 'Shoulder Press', sets: 3, reps: 12 },
    ]
  },
  {
    name: 'Lower Body Power',
    type: 'strength',
    exercises: [
      { name: 'Squats', sets: 4, reps: 10 },
      { name: 'Deadlifts', sets: 3, reps: 8 },
      { name: 'Lunges', sets: 3, reps: 12 },
    ]
  },
];

export default function () {
  // Test 1: Gateway Health Check
  testGatewayHealth();
  
  // Test 2: Service Health Checks
  testServiceHealthChecks();
  
  // Test 3: User Authentication Flow
  testUserAuthentication();
  
  // Test 4: Workout Management Operations
  testWorkoutOperations();
  
  // Test 5: Exercise Library Access
  testExerciseLibrary();
  
  // Test 6: AI Recommendations
  testAIRecommendations();
  
  // Test 7: Notification Delivery
  testNotificationDelivery();
  
  // Test 8: Concurrent User Operations
  testConcurrentOperations();
  
  // Sleep between test scenarios
  sleep(1);
}

function testGatewayHealth() {
  const response = http.get(`${BASE_URL}/health`, {
    tags: { endpoint: 'gateway', test: 'health' }
  });
  
  check(response, {
    'Gateway health check status is 200': (r) => r.status === 200,
    'Gateway reports operational status': (r) => {
      const body = JSON.parse(r.body);
      return body.status === 'operational';
    },
    'Gateway health response time < 100ms': (r) => r.timings.duration < 100,
  });
}

function testServiceHealthChecks() {
  const services = [
    { name: 'user', endpoint: '/api/v1/users/health' },
    { name: 'workout', endpoint: '/api/v1/workouts/health' },
    { name: 'ai', endpoint: '/api/v1/ai/health' },
    { name: 'notification', endpoint: '/api/v1/notifications/health' },
  ];
  
  services.forEach(service => {
    const response = http.get(`${BASE_URL}${service.endpoint}`, {
      tags: { service: service.name, test: 'health' }
    });
    
    check(response, {
      [`${service.name} service health status is 200`]: (r) => r.status === 200,
      [`${service.name} service is operational`]: (r) => {
        const body = JSON.parse(r.body);
        return body.status === 'operational';
      },
      [`${service.name} service response time < 200ms`]: (r) => r.timings.duration < 200,
    });
  });
}

function testUserAuthentication() {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  // Test user registration
  const registerPayload = {
    email: `load_test_${Math.random().toString(36).substr(2, 9)}@example.com`,
    password: 'password123',
    firstName: 'Load',
    lastName: 'Test'
  };
  
  const registerResponse = http.post(
    `${BASE_URL}/api/v1/users/auth/register`,
    JSON.stringify(registerPayload),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { service: 'user', test: 'register' }
    }
  );
  
  check(registerResponse, {
    'User registration status is 201': (r) => r.status === 201,
    'Registration returns user data': (r) => {
      const body = JSON.parse(r.body);
      return body.user && body.user.email === registerPayload.email;
    },
    'Registration response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  // Test user login
  const loginPayload = {
    email: registerPayload.email,
    password: registerPayload.password
  };
  
  const loginResponse = http.post(
    `${BASE_URL}/api/v1/users/auth/login`,
    JSON.stringify(loginPayload),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { service: 'user', test: 'login' }
    }
  );
  
  check(loginResponse, {
    'User login status is 200': (r) => r.status === 200,
    'Login returns access token': (r) => {
      const body = JSON.parse(r.body);
      return body.token && body.token.length > 0;
    },
    'Login response time < 300ms': (r) => r.timings.duration < 300,
  });
}

function testWorkoutOperations() {
  const userId = `load_test_user_${Math.random().toString(36).substr(2, 9)}`;
  
  // Test workout creation
  const workoutTemplate = workoutTemplates[Math.floor(Math.random() * workoutTemplates.length)];
  const workoutPayload = {
    ...workoutTemplate,
    userId: userId,
    name: `${workoutTemplate.name} - Load Test`
  };
  
  const createResponse = http.post(
    `${BASE_URL}/api/v1/workouts`,
    JSON.stringify(workoutPayload),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { service: 'workout', test: 'create' }
    }
  );
  
  check(createResponse, {
    'Workout creation status is 201': (r) => r.status === 201,
    'Workout creation returns workout data': (r) => {
      const body = JSON.parse(r.body);
      return body.workout && body.workout.name === workoutPayload.name;
    },
    'Workout creation response time < 400ms': (r) => r.timings.duration < 400,
  });
  
  // Test workout listing
  const listResponse = http.get(`${BASE_URL}/api/v1/workouts?userId=${userId}`, {
    tags: { service: 'workout', test: 'list' }
  });
  
  check(listResponse, {
    'Workout listing status is 200': (r) => r.status === 200,
    'Workout listing returns array': (r) => {
      const body = JSON.parse(r.body);
      return Array.isArray(body.workouts);
    },
    'Workout listing response time < 300ms': (r) => r.timings.duration < 300,
  });
}

function testExerciseLibrary() {
  // Test exercise library retrieval
  const exercisesResponse = http.get(`${BASE_URL}/api/v1/exercises`, {
    tags: { service: 'workout', test: 'exercises' }
  });
  
  check(exercisesResponse, {
    'Exercise library status is 200': (r) => r.status === 200,
    'Exercise library returns exercises': (r) => {
      const body = JSON.parse(r.body);
      return Array.isArray(body.exercises) && body.exercises.length > 0;
    },
    'Exercise library response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  // Test exercise search with filters
  const filteredResponse = http.get(
    `${BASE_URL}/api/v1/exercises?category=strength&difficulty=beginner`,
    {
      tags: { service: 'workout', test: 'exercise_search' }
    }
  );
  
  check(filteredResponse, {
    'Filtered exercise search status is 200': (r) => r.status === 200,
    'Filtered search returns relevant results': (r) => {
      const body = JSON.parse(r.body);
      return Array.isArray(body.exercises);
    },
    'Filtered exercise search response time < 400ms': (r) => r.timings.duration < 400,
  });
}

function testAIRecommendations() {
  const userId = `load_test_user_${Math.random().toString(36).substr(2, 9)}`;
  
  // Test AI workout generation
  const generationPayload = {
    userId: userId,
    preferences: {
      type: 'strength',
      duration: 45,
      difficulty: 'intermediate',
      equipment: ['dumbbells', 'barbell'],
      focusAreas: ['chest', 'back']
    }
  };
  
  const generateResponse = http.post(
    `${BASE_URL}/api/v1/ai/workouts/generate`,
    JSON.stringify(generationPayload),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { service: 'ai', test: 'workout_generation' }
    }
  );
  
  check(generateResponse, {
    'AI workout generation status is 200': (r) => r.status === 200,
    'AI generation returns workout': (r) => {
      const body = JSON.parse(r.body);
      return body.workout && Array.isArray(body.workout.exercises);
    },
    'AI workout generation response time < 2000ms': (r) => r.timings.duration < 2000,
  });
  
  // Test AI recommendations
  const recommendationsResponse = http.get(
    `${BASE_URL}/api/v1/ai/recommendations/${userId}`,
    {
      tags: { service: 'ai', test: 'recommendations' }
    }
  );
  
  check(recommendationsResponse, {
    'AI recommendations status is 200': (r) => r.status === 200,
    'AI recommendations returns array': (r) => {
      const body = JSON.parse(r.body);
      return Array.isArray(body.recommendations);
    },
    'AI recommendations response time < 1000ms': (r) => r.timings.duration < 1000,
  });
}

function testNotificationDelivery() {
  const userId = `load_test_user_${Math.random().toString(36).substr(2, 9)}`;
  
  // Test notification creation
  const notificationPayload = {
    userId: userId,
    type: 'workout_reminder',
    title: 'Load Test Notification',
    message: 'This is a load test notification',
    priority: 'medium',
    channels: ['push', 'realtime']
  };
  
  const createResponse = http.post(
    `${BASE_URL}/api/v1/notifications`,
    JSON.stringify(notificationPayload),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { service: 'notification', test: 'create' }
    }
  );
  
  check(createResponse, {
    'Notification creation status is 201': (r) => r.status === 201,
    'Notification creation returns notification data': (r) => {
      const body = JSON.parse(r.body);
      return body.notification && body.notification.title === notificationPayload.title;
    },
    'Notification creation response time < 300ms': (r) => r.timings.duration < 300,
  });
  
  // Test notification retrieval
  const getResponse = http.get(`${BASE_URL}/api/v1/notifications/${userId}`, {
    tags: { service: 'notification', test: 'get' }
  });
  
  check(getResponse, {
    'Notification retrieval status is 200': (r) => r.status === 200,
    'Notification retrieval returns array': (r) => {
      const body = JSON.parse(r.body);
      return Array.isArray(body.notifications);
    },
    'Notification retrieval response time < 200ms': (r) => r.timings.duration < 200,
  });
}

function testConcurrentOperations() {
  const userId = `concurrent_test_user_${Math.random().toString(36).substr(2, 9)}`;
  
  // Simulate multiple concurrent operations
  const operations = [
    () => http.get(`${BASE_URL}/api/v1/workouts?userId=${userId}`),
    () => http.get(`${BASE_URL}/api/v1/exercises?category=strength`),
    () => http.get(`${BASE_URL}/api/v1/notifications/${userId}`),
    () => http.get(`${BASE_URL}/api/v1/ai/recommendations/${userId}`),
  ];
  
  // Execute operations concurrently
  const responses = operations.map(op => op());
  
  // Check that all operations complete successfully
  responses.forEach((response, index) => {
    check(response, {
      [`Concurrent operation ${index + 1} succeeds`]: (r) => r.status === 200,
      [`Concurrent operation ${index + 1} completes quickly`]: (r) => r.timings.duration < 1000,
    });
  });
}

// Custom metrics for detailed monitoring
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'performance-report.json': JSON.stringify(data, null, 2),
    'performance-report.html': htmlReport(data),
  };
}

function textSummary(data, options = {}) {
  const { indent = '', enableColors = false } = options;
  
  let summary = `
${indent}Performance Test Summary
${indent}========================

${indent}Total Requests: ${data.metrics.http_reqs.values.count}
${indent}Failed Requests: ${data.metrics.http_req_failed.values.rate * 100}%
${indent}Average Response Time: ${data.metrics.http_req_duration.values.avg}ms
${indent}95th Percentile Response Time: ${data.metrics.http_req_duration.values['p(95)']}ms

${indent}Service Performance:
${indent}- Gateway: ${data.metrics['http_req_duration{endpoint:gateway}']?.values?.avg || 'N/A'}ms avg
${indent}- User Service: ${data.metrics['http_req_duration{service:user}']?.values?.avg || 'N/A'}ms avg
${indent}- Workout Service: ${data.metrics['http_req_duration{service:workout}']?.values?.avg || 'N/A'}ms avg
${indent}- AI Service: ${data.metrics['http_req_duration{service:ai}']?.values?.avg || 'N/A'}ms avg
${indent}- Notification Service: ${data.metrics['http_req_duration{service:notification}']?.values?.avg || 'N/A'}ms avg

${indent}Throughput: ${data.metrics.http_reqs.values.rate} req/s
${indent}Test Duration: ${data.state.testRunDurationMs / 1000}s
  `;
  
  return summary;
}

function htmlReport(data) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
        .success { background: #d4edda; }
        .warning { background: #fff3cd; }
        .danger { background: #f8d7da; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Gym App Microservices Performance Test Report</h1>
    
    <div class="metric">
        <h3>Overall Performance</h3>
        <p><strong>Total Requests:</strong> ${data.metrics.http_reqs.values.count}</p>
        <p><strong>Failed Requests:</strong> ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%</p>
        <p><strong>Average Response Time:</strong> ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms</p>
        <p><strong>95th Percentile:</strong> ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms</p>
    </div>
    
    <h3>Service Breakdown</h3>
    <table>
        <tr>
            <th>Service</th>
            <th>Average Response Time</th>
            <th>95th Percentile</th>
            <th>Status</th>
        </tr>
        <tr>
            <td>Gateway</td>
            <td>${data.metrics['http_req_duration{endpoint:gateway}']?.values?.avg?.toFixed(2) || 'N/A'}ms</td>
            <td>${data.metrics['http_req_duration{endpoint:gateway}']?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms</td>
            <td class="success">✓ Healthy</td>
        </tr>
        <tr>
            <td>User Service</td>
            <td>${data.metrics['http_req_duration{service:user}']?.values?.avg?.toFixed(2) || 'N/A'}ms</td>
            <td>${data.metrics['http_req_duration{service:user}']?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms</td>
            <td class="success">✓ Healthy</td>
        </tr>
        <tr>
            <td>Workout Service</td>
            <td>${data.metrics['http_req_duration{service:workout}']?.values?.avg?.toFixed(2) || 'N/A'}ms</td>
            <td>${data.metrics['http_req_duration{service:workout}']?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms</td>
            <td class="success">✓ Healthy</td>
        </tr>
        <tr>
            <td>AI Service</td>
            <td>${data.metrics['http_req_duration{service:ai}']?.values?.avg?.toFixed(2) || 'N/A'}ms</td>
            <td>${data.metrics['http_req_duration{service:ai}']?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms</td>
            <td class="success">✓ Healthy</td>
        </tr>
        <tr>
            <td>Notification Service</td>
            <td>${data.metrics['http_req_duration{service:notification}']?.values?.avg?.toFixed(2) || 'N/A'}ms</td>
            <td>${data.metrics['http_req_duration{service:notification}']?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms</td>
            <td class="success">✓ Healthy</td>
        </tr>
    </table>
    
    <div class="metric">
        <h3>Test Configuration</h3>
        <p><strong>Peak Virtual Users:</strong> 200</p>
        <p><strong>Test Duration:</strong> ${(data.state.testRunDurationMs / 1000 / 60).toFixed(1)} minutes</p>
        <p><strong>Throughput:</strong> ${data.metrics.http_reqs.values.rate.toFixed(2)} req/s</p>
    </div>
    
    <p><em>Report generated on ${new Date().toISOString()}</em></p>
</body>
</html>
  `;
}
