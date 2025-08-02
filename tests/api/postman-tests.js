const newman = require('newman');
const fs = require('fs');
const path = require('path');

// Postman collection for API testing
const postmanCollection = {
  "info": {
    "name": "Gym App Microservices API Tests",
    "description": "Comprehensive API testing for the gym app microservices architecture",
    "version": "1.0.0",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000",
      "type": "string"
    },
    {
      "key": "auth_token",
      "value": "",
      "type": "string"
    },
    {
      "key": "user_id",
      "value": "",
      "type": "string"
    },
    {
      "key": "workout_id",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Gateway Health Check",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 200', function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test('Gateway is operational', function () {",
              "    const responseJson = pm.response.json();",
              "    pm.expect(responseJson.status).to.eql('operational');",
              "});",
              "",
              "pm.test('All services are reported', function () {",
              "    const responseJson = pm.response.json();",
              "    pm.expect(responseJson.services).to.have.property('user-service');",
              "    pm.expect(responseJson.services).to.have.property('workout-service');",
              "    pm.expect(responseJson.services).to.have.property('ai-service');",
              "    pm.expect(responseJson.services).to.have.property('notification-service');",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/health",
          "host": ["{{base_url}}"],
          "path": ["health"]
        }
      }
    },
    {
      "name": "User Registration",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 201', function () {",
              "    pm.response.to.have.status(201);",
              "});",
              "",
              "pm.test('Registration successful', function () {",
              "    const responseJson = pm.response.json();",
              "    pm.expect(responseJson).to.have.property('user');",
              "    pm.expect(responseJson.user).to.have.property('id');",
              "    pm.collectionVariables.set('user_id', responseJson.user.id);",
              "});",
              "",
              "pm.test('User email matches', function () {",
              "    const responseJson = pm.response.json();",
              "    const requestJson = JSON.parse(pm.request.body.raw);",
              "    pm.expect(responseJson.user.email).to.eql(requestJson.email);",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"api.test@example.com\",\n  \"password\": \"securePassword123\",\n  \"firstName\": \"API\",\n  \"lastName\": \"Test\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/v1/users/auth/register",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "users", "auth", "register"]
        }
      }
    },
    {
      "name": "User Login",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 200', function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test('Login successful', function () {",
              "    const responseJson = pm.response.json();",
              "    pm.expect(responseJson).to.have.property('token');",
              "    pm.collectionVariables.set('auth_token', responseJson.token);",
              "});",
              "",
              "pm.test('User data returned', function () {",
              "    const responseJson = pm.response.json();",
              "    pm.expect(responseJson).to.have.property('user');",
              "    pm.expect(responseJson.user).to.have.property('id');",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"api.test@example.com\",\n  \"password\": \"securePassword123\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/v1/users/auth/login",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "users", "auth", "login"]
        }
      }
    },
    {
      "name": "Get User Profile",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 200', function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test('Profile data returned', function () {",
              "    const responseJson = pm.response.json();",
              "    pm.expect(responseJson).to.have.property('user');",
              "    pm.expect(responseJson.user).to.have.property('email');",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{auth_token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/v1/users/profile",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "users", "profile"]
        }
      }
    },
    {
      "name": "Get Exercise Library",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 200', function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test('Exercise library returned', function () {",
              "    const responseJson = pm.response.json();",
              "    pm.expect(responseJson).to.have.property('exercises');",
              "    pm.expect(responseJson.exercises).to.be.an('array');",
              "});",
              "",
              "pm.test('Exercises have required fields', function () {",
              "    const responseJson = pm.response.json();",
              "    if (responseJson.exercises.length > 0) {",
              "        const exercise = responseJson.exercises[0];",
              "        pm.expect(exercise).to.have.property('id');",
              "        pm.expect(exercise).to.have.property('name');",
              "        pm.expect(exercise).to.have.property('category');",
              "    }",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/api/v1/exercises",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "exercises"]
        }
      }
    },
    {
      "name": "Create Workout",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 201', function () {",
              "    pm.response.to.have.status(201);",
              "});",
              "",
              "pm.test('Workout created successfully', function () {",
              "    const responseJson = pm.response.json();",
              "    pm.expect(responseJson).to.have.property('workout');",
              "    pm.expect(responseJson.workout).to.have.property('id');",
              "    pm.collectionVariables.set('workout_id', responseJson.workout.id);",
              "});",
              "",
              "pm.test('Workout has correct name', function () {",
              "    const responseJson = pm.response.json();",
              "    pm.expect(responseJson.workout.name).to.eql('API Test Workout');",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userId\": \"{{user_id}}\",\n  \"name\": \"API Test Workout\",\n  \"type\": \"strength\",\n  \"exercises\": [\n    {\n      \"name\": \"Push-ups\",\n      \"sets\": 3,\n      \"reps\": 10\n    },\n    {\n      \"name\": \"Squats\",\n      \"sets\": 3,\n      \"reps\": 15\n    }\n  ]\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/v1/workouts",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "workouts"]
        }
      }
    },
    {
      "name": "Get User Workouts",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 200', function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test('Workouts list returned', function () {",
              "    const responseJson = pm.response.json();",
              "    pm.expect(responseJson).to.have.property('workouts');",
              "    pm.expect(responseJson.workouts).to.be.an('array');",
              "});",
              "",
              "pm.test('Created workout is in list', function () {",
              "    const responseJson = pm.response.json();",
              "    const workoutId = pm.collectionVariables.get('workout_id');",
              "    const foundWorkout = responseJson.workouts.find(w => w.id === workoutId);",
              "    pm.expect(foundWorkout).to.not.be.undefined;",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/api/v1/workouts?userId={{user_id}}",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "workouts"],
          "query": [
            {
              "key": "userId",
              "value": "{{user_id}}"
            }
          ]
        }
      }
    },
    {
      "name": "Generate AI Workout",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 200', function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test('AI workout generated', function () {",
              "    const responseJson = pm.response.json();",
              "    pm.expect(responseJson).to.have.property('workout');",
              "    pm.expect(responseJson.workout).to.have.property('exercises');",
              "    pm.expect(responseJson.workout.exercises).to.be.an('array');",
              "});",
              "",
              "pm.test('Workout matches preferences', function () {",
              "    const responseJson = pm.response.json();",
              "    pm.expect(responseJson.workout.type).to.eql('strength');",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userId\": \"{{user_id}}\",\n  \"preferences\": {\n    \"type\": \"strength\",\n    \"duration\": 45,\n    \"difficulty\": \"intermediate\",\n    \"equipment\": [\"dumbbells\", \"barbell\"],\n    \"focusAreas\": [\"chest\", \"triceps\"]\n  }\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/v1/ai/workouts/generate",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "ai", "workouts", "generate"]
        }
      }
    },
    {
      "name": "Get AI Recommendations",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 200', function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test('Recommendations returned', function () {",
              "    const responseJson = pm.response.json();",
              "    pm.expect(responseJson).to.have.property('recommendations');",
              "    pm.expect(responseJson.recommendations).to.be.an('array');",
              "});",
              "",
              "pm.test('Recommendations have required fields', function () {",
              "    const responseJson = pm.response.json();",
              "    if (responseJson.recommendations.length > 0) {",
              "        const rec = responseJson.recommendations[0];",
              "        pm.expect(rec).to.have.property('type');",
              "        pm.expect(rec).to.have.property('confidence');",
              "    }",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/api/v1/ai/recommendations/{{user_id}}",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "ai", "recommendations", "{{user_id}}"]
        }
      }
    },
    {
      "name": "Create Notification",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 201', function () {",
              "    pm.response.to.have.status(201);",
              "});",
              "",
              "pm.test('Notification created', function () {",
              "    const responseJson = pm.response.json();",
              "    pm.expect(responseJson).to.have.property('notification');",
              "    pm.expect(responseJson.notification).to.have.property('id');",
              "});",
              "",
              "pm.test('Notification has correct title', function () {",
              "    const responseJson = pm.response.json();",
              "    pm.expect(responseJson.notification.title).to.eql('API Test Notification');",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userId\": \"{{user_id}}\",\n  \"type\": \"workout_reminder\",\n  \"title\": \"API Test Notification\",\n  \"message\": \"This is a test notification from the API test suite\",\n  \"priority\": \"medium\",\n  \"channels\": [\"push\", \"realtime\"]\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/v1/notifications",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "notifications"]
        }
      }
    },
    {
      "name": "Get User Notifications",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 200', function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test('Notifications list returned', function () {",
              "    const responseJson = pm.response.json();",
              "    pm.expect(responseJson).to.have.property('notifications');",
              "    pm.expect(responseJson.notifications).to.be.an('array');",
              "});",
              "",
              "pm.test('Created notification is in list', function () {",
              "    const responseJson = pm.response.json();",
              "    const foundNotification = responseJson.notifications.find(n => n.title === 'API Test Notification');",
              "    pm.expect(foundNotification).to.not.be.undefined;",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/api/v1/notifications/{{user_id}}",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "notifications", "{{user_id}}"]
        }
      }
    },
    {
      "name": "Complete Workout",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 200', function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test('Workout completed successfully', function () {",
              "    const responseJson = pm.response.json();",
              "    pm.expect(responseJson.workout.status).to.eql('completed');",
              "});",
              "",
              "pm.test('Completion time recorded', function () {",
              "    const responseJson = pm.response.json();",
              "    pm.expect(responseJson.workout).to.have.property('completedAt');",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"duration\": 42,\n  \"caloriesBurned\": 280,\n  \"exercises\": [\n    {\n      \"name\": \"Push-ups\",\n      \"sets\": 3,\n      \"reps\": 12,\n      \"completed\": true\n    },\n    {\n      \"name\": \"Squats\",\n      \"sets\": 3,\n      \"reps\": 15,\n      \"completed\": true\n    }\n  ]\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/v1/workouts/{{workout_id}}/complete",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "workouts", "{{workout_id}}", "complete"]
        }
      }
    },
    {
      "name": "Get Service Metrics",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 200', function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test('Metrics data returned', function () {",
              "    const responseJson = pm.response.json();",
              "    pm.expect(responseJson).to.have.property('requests');",
              "    pm.expect(responseJson).to.have.property('latency');",
              "    pm.expect(responseJson).to.have.property('errors');",
              "});",
              "",
              "pm.test('Service performance within limits', function () {",
              "    const responseJson = pm.response.json();",
              "    pm.expect(responseJson.latency.average).to.be.below(1000);",
              "    pm.expect(responseJson.errors.rate).to.be.below(0.05);",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/api/v1/metrics",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "metrics"]
        }
      }
    }
  ]
};

// Environment configuration
const postmanEnvironment = {
  "name": "Gym App Test Environment",
  "values": [
    {
      "key": "base_url",
      "value": "http://localhost:3000",
      "enabled": true
    },
    {
      "key": "test_email",
      "value": "api.test@example.com",
      "enabled": true
    },
    {
      "key": "test_password",
      "value": "securePassword123",
      "enabled": true
    }
  ]
};

// Run the Newman test suite
function runApiTests() {
  return new Promise((resolve, reject) => {
    newman.run({
      collection: postmanCollection,
      environment: postmanEnvironment,
      reporters: ['cli', 'json', 'html'],
      reporter: {
        html: {
          export: './tests/reports/api-test-report.html'
        },
        json: {
          export: './tests/reports/api-test-results.json'
        }
      },
      iterationCount: 1,
      delayRequest: 500, // 500ms delay between requests
      timeout: 30000, // 30 second timeout
      insecure: true, // Allow self-signed certificates
      bail: false, // Continue on test failure
    }, function (err, summary) {
      if (err) {
        console.error('❌ Newman test execution failed:', err);
        reject(err);
        return;
      }

      console.log('\n🚀 API Test Suite Completed!');
      console.log('===============================');
      
      // Print summary statistics
      const stats = summary.run.stats;
      console.log(`📊 Total Requests: ${stats.requests.total}`);
      console.log(`✅ Successful Requests: ${stats.requests.total - stats.requests.failed}`);
      console.log(`❌ Failed Requests: ${stats.requests.failed}`);
      console.log(`🧪 Total Tests: ${stats.tests.total}`);
      console.log(`✅ Passed Tests: ${stats.tests.passed}`);
      console.log(`❌ Failed Tests: ${stats.tests.failed}`);
      console.log(`⏱️  Average Response Time: ${stats.responses.average}ms`);
      
      // Print failure details if any
      if (summary.run.failures && summary.run.failures.length > 0) {
        console.log('\n❌ Test Failures:');
        summary.run.failures.forEach((failure, index) => {
          console.log(`${index + 1}. ${failure.source.name}: ${failure.error.message}`);
        });
      }
      
      // Print execution details
      console.log('\n📋 Execution Summary:');
      summary.run.executions.forEach((execution, index) => {
        const request = execution.item.name;
        const status = execution.response ? execution.response.code : 'No Response';
        const responseTime = execution.response ? execution.response.responseTime : 'N/A';
        const testResults = execution.assertions ? 
          `${execution.assertions.filter(a => !a.error).length}/${execution.assertions.length} passed` : 
          'No tests';
        
        console.log(`  ${index + 1}. ${request}: ${status} (${responseTime}ms) - ${testResults}`);
      });
      
      // Overall result
      const success = stats.tests.failed === 0 && stats.requests.failed === 0;
      if (success) {
        console.log('\n🎉 All API tests passed successfully!');
        console.log('✅ Microservices architecture is functioning correctly');
        console.log('✅ All endpoints are responding as expected');
        console.log('✅ Authentication and authorization working properly');
        console.log('✅ Data persistence and retrieval validated');
      } else {
        console.log('\n⚠️  Some tests failed - please review the results');
      }
      
      console.log(`\n📄 Detailed reports generated:`);
      console.log(`   HTML Report: ./tests/reports/api-test-report.html`);
      console.log(`   JSON Results: ./tests/reports/api-test-results.json`);
      
      resolve(summary);
    });
  });
}

// Export for use in other test files
module.exports = {
  runApiTests,
  postmanCollection,
  postmanEnvironment
};

// Run tests if this file is executed directly
if (require.main === module) {
  console.log('🚀 Starting API Test Suite...');
  console.log('Testing Gym App Microservices Architecture');
  console.log('=========================================\n');
  
  runApiTests()
    .then(() => {
      console.log('\n✅ API testing completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ API testing failed:', error);
      process.exit(1);
    });
}
