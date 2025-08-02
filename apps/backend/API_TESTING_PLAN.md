# 🧪 API Testing Plan - Phase 10.1 Backend APIs

## 🚀 **Quick Start Commands**

### **1. Start Development Environment**
```bash
# Start MongoDB
cd /workspaces/gym-app-plan/backend
docker run -d --name mongodb -p 27017:27017 mongo:7

# Start Backend Server (after fixing path aliases)
npm run build && npm start
# OR with ts-node (preferred for development)
npx ts-node --project tsconfig.json src/server.ts
```

### **2. Environment Setup**
```bash
# Verify .env file exists with:
# MONGODB_URI=mongodb://localhost:27017/fittracker-pro
# JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
# PORT=5000
```

---

## 🔧 **API Endpoint Testing**

### **Exercise Library APIs (Public)**
```bash
# Get all exercises
curl -X GET http://localhost:5000/api/workouts/exercises

# Get specific exercise
curl -X GET http://localhost:5000/api/workouts/exercises/{exercise_id}

# Search exercises
curl -X GET "http://localhost:5000/api/workouts/exercises?category=strength&muscleGroup=chest"
```

### **Authentication Required APIs**

#### **Get JWT Token** (Need to implement user registration/login first)
```bash
# TODO: Implement auth endpoints
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### **Workout Plan Management**
```bash
# Create workout plan
curl -X POST http://localhost:5000/api/workouts/plans \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Upper Body Strength",
    "description": "Focus on chest, back, and shoulders",
    "difficulty": "intermediate",
    "duration": 60,
    "exercises": [
      {
        "exerciseId": "{exercise_id}",
        "sets": 3,
        "reps": 10,
        "restTime": 60
      }
    ],
    "tags": ["strength", "upper-body"]
  }'

# Get user's workout plans
curl -X GET http://localhost:5000/api/workouts/plans \
  -H "Authorization: Bearer {jwt_token}"

# Get specific workout plan
curl -X GET http://localhost:5000/api/workouts/plans/{plan_id} \
  -H "Authorization: Bearer {jwt_token}"
```

#### **Workout Session Tracking**
```bash
# Start workout session
curl -X POST http://localhost:5000/api/workouts/sessions \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{"workoutPlanId": "{plan_id}"}'

# Update exercise set
curl -X PUT http://localhost:5000/api/workouts/sessions/{session_id} \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "exerciseIndex": 0,
    "setIndex": 0,
    "setData": {
      "reps": 12,
      "weight": 50,
      "completed": true
    }
  }'

# Complete workout session
curl -X PUT http://localhost:5000/api/workouts/sessions/{session_id}/complete \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "caloriesBurned": 250,
    "notes": "Great workout, felt strong!"
  }'
```

---

## 🐛 **Known Issues to Fix**

### **1. Path Alias Compilation**
```bash
# Current Error:
# Error: Cannot find module '@/utils/database'

# Solution Options:
# A) Install module-alias for runtime resolution
npm install module-alias

# B) Use tsconfig-paths
npm install --save-dev tsconfig-paths
npx ts-node -r tsconfig-paths/register src/server.ts

# C) Replace all @/ imports with relative paths
```

### **2. User Authentication Setup**
```bash
# Need to implement:
# - POST /api/auth/register
# - POST /api/auth/login  
# - JWT token generation and validation
# - User model and controller
```

---

## 📊 **Testing Checklist**

### **✅ Completed**
- [x] Database Models Created and Compiled
- [x] Controllers Implemented
- [x] Routes Configured  
- [x] MongoDB Container Running
- [x] Sample Data Seeded

### **🔄 In Progress** 
- [ ] Fix path alias compilation (@/ imports)
- [ ] Start backend development server
- [ ] Test exercise library endpoints
- [ ] Implement user authentication

### **📋 Next Steps**
- [ ] Create Postman collection
- [ ] Test all CRUD operations
- [ ] Verify data persistence
- [ ] Add error handling tests
- [ ] Performance testing

---

## 🚀 **Success Criteria for API Testing**

1. **✅ Server Starts Successfully**: Backend runs on localhost:5000
2. **✅ Database Connected**: MongoDB connection established
3. **✅ Exercise Library Works**: Can fetch exercises without auth
4. **✅ Authentication Works**: Can generate and validate JWT tokens
5. **✅ CRUD Operations**: All workout plan operations functional
6. **✅ Session Tracking**: Can start, update, and complete workout sessions
7. **✅ Data Persistence**: All data survives server restarts
8. **✅ Error Handling**: Proper error responses for invalid requests

---

**Ready for Phase 10.2**: Once API testing is complete, proceed with Nutrition API implementation and frontend integration.
