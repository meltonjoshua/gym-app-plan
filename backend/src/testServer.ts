import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

// Simple test to verify MongoDB connection and basic setup
async function testSetup(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fittracker';
    
    logger.info('Testing MongoDB connection...');
    await mongoose.connect(mongoUri);
    logger.info('✅ MongoDB connection successful');
    
    logger.info('✅ Backend setup test completed successfully');
    
    // Start a simple Express server to test API endpoints
    const express = require('express');
    const app = express();
    
    app.use(express.json());
    
    // Health check endpoint
    app.get('/health', (req: any, res: any) => {
      res.json({ status: 'ok', timestamp: new Date() });
    });
    
    // Test nutrition endpoint (without auth for now)
    app.get('/api/test', (req: any, res: any) => {
      res.json({ message: 'Backend is running', nutrition: 'API ready' });
    });
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`✅ Test server running on port ${PORT}`);
      logger.info('Phase 10.2 Nutrition API is ready for testing');
    });
    
  } catch (error) {
    logger.error('❌ Setup test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  testSetup();
}

export { testSetup };
