import mongoose from 'mongoose';
import { FoodFavorite } from '../models/FoodFavorite';
import { MealTemplate } from '../models/MealTemplate';
import { FoodLog } from '../models/FoodLog';
import { Food } from '../models/Food';
import { User } from '../models/User';

const seedEnhancedNutritionData = async () => {
  try {
    console.log('🌱 Starting Enhanced Nutrition Data Seeding...');

    // Connect to MongoDB if not connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fittracker');
    }

    // Get sample user and foods
    let sampleUser = await User.findOne({});
    if (!sampleUser) {
      console.log('👤 Creating sample user...');
      sampleUser = await User.create({
        email: 'demo@fittracker.com',
        password: 'Demo123!',
        passwordConfirm: 'Demo123!',
        name: 'Demo User',
        role: 'user',
        active: true,
        verified: true,
        goals: ['weight_loss', 'muscle_gain']
      });
      console.log('✅ Sample user created');
    }

    const foods = await Food.find({}).limit(10);
    if (foods.length === 0) {
      console.log('❌ No foods found. Please seed foods first.');
      return;
    }

    console.log(`📦 Found ${foods.length} foods to work with`);

    // 1. Create Food Favorites
    console.log('🎯 Creating food favorites...');
    
    const favoriteData = [
      {
        userId: sampleUser._id,
        foodId: foods[0]._id,
        customName: 'My Morning Oats',
        defaultQuantity: 50,
        defaultUnit: 'g',
        category: 'breakfast',
        notes: 'Perfect for busy mornings',
        useCount: 15
      },
      {
        userId: sampleUser._id,
        foodId: foods[1]._id,
        customName: 'Power Protein',
        defaultQuantity: 30,
        defaultUnit: 'g',
        category: 'snack',
        notes: 'Post-workout favorite',
        useCount: 8
      },
      {
        userId: sampleUser._id,
        foodId: foods[2]._id,
        defaultQuantity: 200,
        defaultUnit: 'g',
        category: 'lunch',
        notes: 'Filling and nutritious',
        useCount: 12
      }
    ];

    // Clear existing favorites for this user
    await FoodFavorite.deleteMany({ userId: sampleUser._id });
    
    const favorites = await FoodFavorite.insertMany(favoriteData);
    console.log(`✅ Created ${favorites.length} food favorites`);

    // 2. Create Meal Templates
    console.log('🍽️ Creating meal templates...');

    const mealTemplateData = [
      {
        userId: sampleUser._id,
        name: 'High Protein Breakfast',
        description: 'Perfect start to a workout day',
        mealType: 'breakfast',
        foods: [
          { foodId: foods[0]._id, quantity: 50, unit: 'g', notes: 'Base carbs' },
          { foodId: foods[1]._id, quantity: 30, unit: 'g', notes: 'Protein boost' },
          { foodId: foods[2]._id, quantity: 150, unit: 'ml', notes: 'Healthy fats' }
        ],
        isPublic: true,
        tags: ['high-protein', 'workout', 'energy'],
        useCount: 5
      },
      {
        userId: sampleUser._id,
        name: 'Light Lunch Combo',
        description: 'Balanced nutrition for midday fuel',
        mealType: 'lunch',
        foods: [
          { foodId: foods[3]._id, quantity: 100, unit: 'g', notes: 'Main component' },
          { foodId: foods[4]._id, quantity: 80, unit: 'g', notes: 'Side dish' }
        ],
        isPublic: false,
        tags: ['balanced', 'light', 'energy'],
        useCount: 3
      },
      {
        userId: sampleUser._id,
        name: 'Evening Snack',
        description: 'Light but satisfying evening option',
        mealType: 'snack',
        foods: [
          { foodId: foods[5]._id, quantity: 25, unit: 'g', notes: 'Sweet treat' }
        ],
        isPublic: true,
        tags: ['snack', 'evening', 'sweet'],
        useCount: 8
      }
    ];

    // Clear existing templates for this user
    await MealTemplate.deleteMany({ userId: sampleUser._id });
    
    const templates = await MealTemplate.insertMany(mealTemplateData);
    console.log(`✅ Created ${templates.length} meal templates`);

    // 3. Create Sample Food Logs for recent/frequent tracking
    console.log('📊 Creating sample food logs...');

    const currentDate = new Date();
    const foodLogData = [];

    // Create logs for the past 7 days
    for (let i = 0; i < 7; i++) {
      const logDate = new Date(currentDate);
      logDate.setDate(logDate.getDate() - i);

      // Add breakfast logs
      foodLogData.push({
        userId: sampleUser._id,
        foodId: foods[0]._id,
        quantity: 50,
        unit: 'g',
        mealType: 'breakfast',
        date: logDate,
        source: 'manual',
        notes: i === 0 ? 'Today\'s breakfast' : undefined
      });

      // Add lunch logs (every other day)
      if (i % 2 === 0) {
        foodLogData.push({
          userId: sampleUser._id,
          foodId: foods[3]._id,
          quantity: 150,
          unit: 'g',
          mealType: 'lunch',
          date: logDate,
          source: 'manual'
        });
      }

      // Add dinner logs
      foodLogData.push({
        userId: sampleUser._id,
        foodId: foods[6]._id,
        quantity: 200,
        unit: 'g',
        mealType: 'dinner',
        date: logDate,
        source: 'manual'
      });

      // Add some snacks
      if (i < 3) {
        foodLogData.push({
          userId: sampleUser._id,
          foodId: foods[1]._id,
          quantity: 25,
          unit: 'g',
          mealType: 'snack',
          date: logDate,
          source: 'manual',
          notes: 'Post-workout'
        });
      }
    }

    // Clear existing food logs for this user
    await FoodLog.deleteMany({ userId: sampleUser._id });
    
    const foodLogs = await FoodLog.insertMany(foodLogData);
    console.log(`✅ Created ${foodLogs.length} food log entries`);

    // 4. Update favorites with realistic use counts based on logs
    console.log('🔄 Updating favorite use counts...');
    
    for (const favorite of favorites) {
      const logCount = await FoodLog.countDocuments({
        userId: sampleUser._id,
        foodId: favorite.foodId
      });
      
      if (logCount > 0) {
        await FoodFavorite.findByIdAndUpdate(favorite._id, {
          useCount: favorite.useCount + logCount,
          lastUsed: new Date()
        });
      }
    }

    console.log('✅ Updated favorite use counts');

    // 5. Display summary
    console.log('\n📈 ENHANCED NUTRITION DATA SEEDING SUMMARY:');
    console.log('============================================');
    console.log(`👤 User: ${sampleUser.name}`);
    console.log(`🎯 Food Favorites: ${favorites.length}`);
    console.log(`🍽️ Meal Templates: ${templates.length}`);
    console.log(`📊 Food Log Entries: ${foodLogs.length}`);
    console.log('');
    
    console.log('🎯 FAVORITES CREATED:');
    favorites.forEach((fav, index) => {
      console.log(`   ${index + 1}. ${fav.customName || 'Custom Food'} (${fav.category}) - Used ${fav.useCount} times`);
    });
    
    console.log('\n🍽️ MEAL TEMPLATES CREATED:');
    templates.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.name} (${template.mealType}) - ${template.foods.length} ingredients - Used ${template.useCount} times`);
    });

    console.log('\n🎉 Enhanced Nutrition Data Seeding Complete!');
    console.log('\n🚀 AVAILABLE ENHANCED FEATURES:');
    console.log('   • Food favorites with custom names and default quantities');
    console.log('   • Meal templates for quick logging');
    console.log('   • Recent and frequent food tracking');
    console.log('   • Batch logging capabilities');
    console.log('   • Meal duplication functionality');
    console.log('   • Recipe-to-meal logging');

  } catch (error) {
    console.error('❌ Enhanced nutrition seeding failed:', error);
    throw error;
  }
};

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedEnhancedNutritionData()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedEnhancedNutritionData;
