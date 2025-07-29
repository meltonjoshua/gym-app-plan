import mongoose from 'mongoose';
import { Food } from '../models/Food';
import { logger } from '../utils/logger';

const sampleFoods = [
  {
    description: 'Apple, raw, with skin',
    foodCategory: 'Fruits and Fruit Juices',
    dataType: 'foundation',
    nutritionPer100g: {
      calories: 52,
      protein: 0.3,
      carbohydrates: 13.8,
      fat: 0.2,
      fiber: 2.4,
      sugar: 10.4,
      sodium: 1,
      cholesterol: 0,
      saturatedFat: 0.1,
      transFat: 0
    },
    servingSizes: [
      {
        amount: 1,
        unit: 'medium',
        description: 'medium apple',
        gramWeight: 182
      },
      {
        amount: 1,
        unit: 'large',
        description: 'large apple', 
        gramWeight: 223
      }
    ],
    searchTerms: ['apple', 'fruit', 'raw', 'fresh'],
    commonNames: ['red apple', 'green apple'],
    isCustom: false,
    isVerified: true,
    searchCount: 0
  },
  {
    description: 'Chicken breast, skinless, boneless, raw',
    foodCategory: 'Poultry Products',
    dataType: 'foundation',
    nutritionPer100g: {
      calories: 165,
      protein: 31.0,
      carbohydrates: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      sodium: 74,
      cholesterol: 85,
      saturatedFat: 1.0,
      transFat: 0
    },
    servingSizes: [
      {
        amount: 1,
        unit: 'breast',
        description: 'chicken breast',
        gramWeight: 174
      },
      {
        amount: 100,
        unit: 'g',
        description: '100 grams',
        gramWeight: 100
      }
    ],
    searchTerms: ['chicken', 'breast', 'poultry', 'protein'],
    commonNames: ['chicken breast', 'boneless chicken'],
    isCustom: false,
    isVerified: true,
    searchCount: 0
  },
  {
    description: 'Rice, white, long-grain, regular, cooked',
    foodCategory: 'Cereal Grains and Pasta',
    dataType: 'foundation',
    nutritionPer100g: {
      calories: 130,
      protein: 2.7,
      carbohydrates: 28.2,
      fat: 0.3,
      fiber: 0.4,
      sugar: 0.1,
      sodium: 1,
      cholesterol: 0,
      saturatedFat: 0.1,
      transFat: 0
    },
    servingSizes: [
      {
        amount: 1,
        unit: 'cup',
        description: 'cup cooked',
        gramWeight: 158
      },
      {
        amount: 0.5,
        unit: 'cup',
        description: 'half cup cooked',
        gramWeight: 79
      }
    ],
    searchTerms: ['rice', 'white', 'grain', 'carbs'],
    commonNames: ['white rice', 'steamed rice'],
    isCustom: false,
    isVerified: true,
    searchCount: 0
  },
  {
    description: 'Broccoli, raw',
    foodCategory: 'Vegetables and Vegetable Products',
    dataType: 'foundation',
    nutritionPer100g: {
      calories: 34,
      protein: 2.8,
      carbohydrates: 6.6,
      fat: 0.4,
      fiber: 2.6,
      sugar: 1.5,
      sodium: 33,
      cholesterol: 0,
      saturatedFat: 0.1,
      transFat: 0
    },
    servingSizes: [
      {
        amount: 1,
        unit: 'cup',
        description: 'cup chopped',
        gramWeight: 91
      },
      {
        amount: 1,
        unit: 'head',
        description: 'medium head',
        gramWeight: 608
      }
    ],
    searchTerms: ['broccoli', 'vegetable', 'green', 'cruciferous'],
    commonNames: ['broccoli florets'],
    isCustom: false,
    isVerified: true,
    searchCount: 0
  },
  {
    description: 'Salmon, Atlantic, farmed, cooked, dry heat',
    foodCategory: 'Finfish and Shellfish Products',
    dataType: 'foundation',
    nutritionPer100g: {
      calories: 206,
      protein: 22.1,
      carbohydrates: 0,
      fat: 12.4,
      fiber: 0,
      sugar: 0,
      sodium: 59,
      cholesterol: 63,
      saturatedFat: 3.1,
      transFat: 0
    },
    servingSizes: [
      {
        amount: 1,
        unit: 'fillet',
        description: 'salmon fillet',
        gramWeight: 154
      },
      {
        amount: 3,
        unit: 'oz',
        description: '3 ounces',
        gramWeight: 85
      }
    ],
    searchTerms: ['salmon', 'fish', 'omega3', 'protein'],
    commonNames: ['atlantic salmon', 'farmed salmon'],
    isCustom: false,
    isVerified: true,
    searchCount: 0
  },
  {
    description: 'Banana, raw',
    foodCategory: 'Fruits and Fruit Juices',
    dataType: 'foundation',
    nutritionPer100g: {
      calories: 89,
      protein: 1.1,
      carbohydrates: 22.8,
      fat: 0.3,
      fiber: 2.6,
      sugar: 12.2,
      sodium: 1,
      cholesterol: 0,
      saturatedFat: 0.1,
      transFat: 0
    },
    servingSizes: [
      {
        amount: 1,
        unit: 'medium',
        description: 'medium banana',
        gramWeight: 118
      },
      {
        amount: 1,
        unit: 'large',
        description: 'large banana',
        gramWeight: 136
      }
    ],
    searchTerms: ['banana', 'fruit', 'potassium', 'yellow'],
    commonNames: ['yellow banana'],
    isCustom: false,
    isVerified: true,
    searchCount: 0
  },
  {
    description: 'Egg, whole, raw, fresh',
    foodCategory: 'Dairy and Egg Products',
    dataType: 'foundation',
    nutritionPer100g: {
      calories: 155,
      protein: 13.0,
      carbohydrates: 1.1,
      fat: 11.0,
      fiber: 0,
      sugar: 1.1,
      sodium: 124,
      cholesterol: 373,
      saturatedFat: 3.1,
      transFat: 0
    },
    servingSizes: [
      {
        amount: 1,
        unit: 'large',
        description: 'large egg',
        gramWeight: 50
      },
      {
        amount: 1,
        unit: 'medium',
        description: 'medium egg',
        gramWeight: 44
      }
    ],
    searchTerms: ['egg', 'whole', 'protein', 'breakfast'],
    commonNames: ['chicken egg', 'fresh egg'],
    isCustom: false,
    isVerified: true,
    searchCount: 0
  },
  {
    description: 'Oats, rolled, old-fashioned, dry',
    foodCategory: 'Cereal Grains and Pasta',
    dataType: 'foundation',
    nutritionPer100g: {
      calories: 389,
      protein: 16.9,
      carbohydrates: 66.3,
      fat: 6.9,
      fiber: 10.6,
      sugar: 0.9,
      sodium: 2,
      cholesterol: 0,
      saturatedFat: 1.2,
      transFat: 0
    },
    servingSizes: [
      {
        amount: 0.5,
        unit: 'cup',
        description: 'half cup dry',
        gramWeight: 40
      },
      {
        amount: 1,
        unit: 'cup',
        description: 'cup dry',
        gramWeight: 80
      }
    ],
    searchTerms: ['oats', 'oatmeal', 'rolled', 'breakfast', 'fiber'],
    commonNames: ['old fashioned oats', 'rolled oats'],
    isCustom: false,
    isVerified: true,
    searchCount: 0
  }
];

export const seedFoods = async (): Promise<void> => {
  try {
    // Check if foods already exist
    const existingCount = await Food.countDocuments({ isCustom: false });
    
    if (existingCount > 0) {
      logger.info(`${existingCount} foods already exist in database`);
      return;
    }

    // Insert sample foods
    await Food.insertMany(sampleFoods);
    logger.info(`Successfully seeded ${sampleFoods.length} foods`);
    
  } catch (error) {
    logger.error('Error seeding foods:', error);
    throw error;
  }
};

// Allow this file to be run directly for seeding
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fittracker')
    .then(() => {
      logger.info('Connected to MongoDB for food seeding');
      return seedFoods();
    })
    .then(() => {
      logger.info('Food seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Food seeding failed:', error);
      process.exit(1);
    });
}
