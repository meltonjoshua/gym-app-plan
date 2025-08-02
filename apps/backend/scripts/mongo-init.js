#!/usr/bin/env node

// MongoDB Initialization Script for Production
// This script sets up the database with proper indexes and initial data

// Switch to the target database
db = db.getSiblingDB('fittracker-pro');

// Create collections with validation schemas
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "firstName", "lastName"],
      properties: {
        email: { bsonType: "string", pattern: "^.+@.+\..+$" },
        password: { bsonType: "string", minLength: 6 },
        firstName: { bsonType: "string", minLength: 1 },
        lastName: { bsonType: "string", minLength: 1 },
        role: { enum: ["user", "premium", "admin"] },
        createdAt: { bsonType: "date" },
        lastActive: { bsonType: "date" }
      }
    }
  }
});

db.createCollection("workouts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "name", "exercises"],
      properties: {
        userId: { bsonType: "objectId" },
        name: { bsonType: "string", minLength: 1 },
        exercises: { bsonType: "array" },
        duration: { bsonType: "number", minimum: 0 },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.createCollection("exercises", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "category", "muscleGroups"],
      properties: {
        name: { bsonType: "string", minLength: 1 },
        category: { bsonType: "string" },
        muscleGroups: { bsonType: "array" },
        difficulty: { enum: ["beginner", "intermediate", "advanced"] }
      }
    }
  }
});

// Create performance-optimized indexes
print("Creating performance indexes...");

// User indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });
db.users.createIndex({ "lastActive": 1 });
db.users.createIndex({ "role": 1, "createdAt": 1 });

// Workout indexes  
db.workouts.createIndex({ "userId": 1, "createdAt": -1 });
db.workouts.createIndex({ "name": "text", "description": "text" });
db.workouts.createIndex({ "exercises.exerciseId": 1 });
db.workouts.createIndex({ "duration": 1 });
db.workouts.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 31536000 }); // 1 year TTL

// Exercise indexes
db.exercises.createIndex({ "name": "text", "description": "text" });
db.exercises.createIndex({ "category": 1, "difficulty": 1 });
db.exercises.createIndex({ "muscleGroups": 1 });

// Progress tracking indexes
db.userProgress.createIndex({ "userId": 1, "date": -1 });
db.userProgress.createIndex({ "userId": 1, "exerciseId": 1, "date": -1 });

// Session indexes for quick lookups
db.sessions.createIndex({ "sessionId": 1 }, { unique: true });
db.sessions.createIndex({ "userId": 1 });
db.sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

// AI recommendations cache
db.aiCache.createIndex({ "userId": 1, "type": 1 });
db.aiCache.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 86400 }); // 24 hours TTL

print("Database initialization completed successfully!");
print("Collections created: " + db.getCollectionNames().length);
print("Indexes created for optimal performance");

// Create initial admin user (optional)
const adminExists = db.users.findOne({ email: "admin@fittracker.app" });
if (!adminExists) {
  db.users.insertOne({
    email: "admin@fittracker.app",
    password: "$2b$10$placeholder", // This should be properly hashed
    firstName: "System",
    lastName: "Administrator", 
    role: "admin",
    createdAt: new Date(),
    lastActive: new Date()
  });
  print("Admin user created");
}
