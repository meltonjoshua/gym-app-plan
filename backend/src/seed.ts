import { connectDatabase } from './utils/database';
import { seedExercises } from './utils/simpleSeed';
import { logger } from './utils/logger';

async function runSeed() {
  try {
    await connectDatabase();
    logger.info('Connected to database, starting seed...');
    
    await seedExercises();
    
    logger.info('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seed failed:', error);
    process.exit(1);
  }
}

runSeed();
