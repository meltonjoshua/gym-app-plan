# 📚 Microservices Performance Testing Suite

## Load Testing Scripts for Phase 16 Implementation

### Prerequisites
```bash
npm install -g k6
npm install -g artillery
```

### Service Load Tests

#### 1. API Gateway Load Test
```javascript
// k6-api-gateway-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 500 }, // Stay at 500 users
    { duration: '2m', target: 1000 }, // Ramp to 1000 users
    { duration: '5m', target: 1000 }, // Stay at 1000 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
};

export default function() {
  // Test API Gateway health
  let response = http.get('http://localhost:3000/health');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 100ms': (r) => r.timings.duration < 100,
  });
  
  // Test User Service through Gateway
  response = http.get('http://localhost:3000/api/v1/auth/health');
  check(response, {
    'auth service healthy': (r) => r.status === 200,
  });
  
  // Test Workout Service through Gateway
  response = http.get('http://localhost:3000/api/v1/workouts/health');
  check(response, {
    'workout service healthy': (r) => r.status === 200,
  });
  
  sleep(1);
}
```

#### 2. Workout Service Stress Test
```javascript
// k6-workout-service-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 200 },
    { duration: '1m', target: 0 },
  ],
};

export default function() {
  let params = {
    headers: { 'Content-Type': 'application/json' },
  };
  
  // Test workout creation
  let workoutData = JSON.stringify({
    userId: `user_${__VU}`,
    name: 'Load Test Workout',
    type: 'strength',
    exercises: [
      { name: 'Push-ups', sets: 3, reps: 10 },
      { name: 'Squats', sets: 3, reps: 15 }
    ]
  });
  
  let response = http.post('http://localhost:3000/api/v1/workouts', workoutData, params);
  check(response, {
    'workout created': (r) => r.status === 201,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  // Test exercise library
  response = http.get('http://localhost:3000/api/v1/exercises?category=strength&limit=20');
  check(response, {
    'exercises fetched': (r) => r.status === 200,
    'has exercises': (r) => JSON.parse(r.body).exercises.length > 0,
  });
  
  sleep(0.5);
}
```

#### 3. Real-time Notification Test
```javascript
// k6-realtime-test.js
import ws from 'k6/ws';
import { check } from 'k6';

export let options = {
  vus: 100,
  duration: '2m',
};

export default function() {
  let url = 'ws://localhost:3004';
  let params = { tags: { my_tag: 'websocket' } };

  let response = ws.connect(url, params, function(socket) {
    socket.on('open', function() {
      console.log('WebSocket connection opened');
      
      // Join user room
      socket.send(JSON.stringify({
        event: 'join',
        userId: `load_test_user_${__VU}`
      }));
    });

    socket.on('message', function(message) {
      let data = JSON.parse(message);
      check(data, {
        'notification received': (d) => d.type === 'notification',
      });
    });

    socket.setTimeout(function() {
      socket.close();
    }, 30000);
  });

  check(response, { 'status is 101': (r) => r && r.status === 101 });
}
```

### Performance Benchmarks

#### Target Metrics for Phase 16
```yaml
api_gateway:
  response_time_p95: 150ms
  throughput: 10000 rps
  uptime: 99.99%
  
user_service:
  response_time_p95: 80ms
  throughput: 5000 rps
  auth_operations: 1000 rps
  
workout_service:
  response_time_p95: 120ms
  throughput: 3000 rps
  concurrent_workouts: 500
  
notification_service:
  websocket_connections: 10000
  push_throughput: 1000 rps
  email_throughput: 500 rps
  
system_wide:
  memory_usage: <2GB per service
  cpu_usage: <70% per service
  database_connections: <100 per service
```

### Chaos Engineering Tests

#### Network Partition Simulation
```bash
# Simulate API Gateway failure
docker stop fittracker-api-gateway

# Monitor service behavior and recovery
curl http://localhost:3001/health  # Direct service access
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health

# Restart and test recovery
docker start fittracker-api-gateway
```

#### Database Connection Issues
```bash
# Simulate database latency
tc qdisc add dev lo root netem delay 200ms

# Test service degradation gracefully
k6 run --vus 100 --duration 1m k6-database-stress-test.js

# Remove latency
tc qdisc del dev lo root
```

### Performance Monitoring Dashboard

#### Key Metrics to Track
- **Response Times**: P50, P95, P99 percentiles
- **Throughput**: Requests per second by service
- **Error Rates**: 4xx and 5xx responses
- **Resource Usage**: CPU, Memory, Disk I/O
- **Database Performance**: Query times, connection pools
- **Cache Hit Rates**: Redis performance metrics

#### Alerting Thresholds
```yaml
critical_alerts:
  - response_time_p95 > 500ms
  - error_rate > 5%
  - cpu_usage > 90%
  - memory_usage > 90%
  
warning_alerts:
  - response_time_p95 > 200ms
  - error_rate > 1%
  - cpu_usage > 70%
  - cache_hit_rate < 80%
```

### Load Testing Commands

```bash
# Basic API Gateway test
k6 run --vus 100 --duration 5m k6-api-gateway-test.js

# Workout service stress test
k6 run --vus 200 --duration 3m k6-workout-service-test.js

# WebSocket load test
k6 run --vus 100 --duration 2m k6-realtime-test.js

# Full system integration test
artillery run artillery-config.yml

# Continuous load testing
k6 run --vus 50 --duration 30m k6-sustained-load-test.js
```

This testing suite validates our Phase 16 performance targets and ensures the microservices architecture can handle production loads.
