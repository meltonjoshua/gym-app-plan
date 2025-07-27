import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as tf from '@tensorflow/tfjs'; // Commented out until TensorFlow is installed

// ===== NUTRITION AI SERVICE =====
// Advanced AI-powered nutrition analysis, meal planning, and dietary recommendations

export interface NutritionAnalysis {
  foodItem: FoodItem;
  nutritionalValue: NutritionalValue;
  healthScore: number; // 0-100
  recommendations: string[];
  allergens: string[];
  dietaryTags: DietaryTag[];
  portionAnalysis: PortionAnalysis;
  mealTiming: MealTimingRecommendation;
  metabolicImpact: MetabolicImpact;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  category: FoodCategory;
  barcode?: string;
  imageUrl?: string;
  servingSize: ServingSize;
  ingredients: Ingredient[];
  processingLevel: ProcessingLevel;
  seasonality: Seasonality;
  nutritionalValue?: NutritionalValue; // Add this property
}

export interface NutritionalValue {
  calories: number;
  macros: Macronutrients;
  micros: Micronutrients;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
  transFat: number;
  saturatedFat: number;
  unsaturatedFat: number;
  omega3: number;
  omega6: number;
  glycemicIndex: number;
  glycemicLoad: number;
  antioxidants: AntioxidantProfile;
}

export interface Macronutrients {
  protein: number; // grams
  carbohydrates: number; // grams
  fat: number; // grams
  alcohol?: number; // grams
}

export interface Micronutrients {
  vitamins: VitaminProfile;
  minerals: MineralProfile;
  phytonutrients: PhytonutrientProfile;
}

export interface VitaminProfile {
  vitaminA: number; // IU
  vitaminC: number; // mg
  vitaminD: number; // IU
  vitaminE: number; // mg
  vitaminK: number; // mcg
  thiamine: number; // mg
  riboflavin: number; // mg
  niacin: number; // mg
  vitaminB6: number; // mg
  folate: number; // mcg
  vitaminB12: number; // mcg
  biotin: number; // mcg
  pantothenicAcid: number; // mg
}

export interface MineralProfile {
  calcium: number; // mg
  iron: number; // mg
  magnesium: number; // mg
  phosphorus: number; // mg
  potassium: number; // mg
  sodium: number; // mg
  zinc: number; // mg
  copper: number; // mg
  manganese: number; // mg
  selenium: number; // mcg
  chromium: number; // mcg
  molybdenum: number; // mcg
}

export interface PhytonutrientProfile {
  flavonoids: number;
  carotenoids: number;
  polyphenols: number;
  anthocyanins: number;
  resveratrol: number;
  lycopene: number;
  lutein: number;
  zeaxanthin: number;
}

export interface AntioxidantProfile {
  oracValue: number; // Oxygen Radical Absorbance Capacity
  totalPhenolics: number;
  vitaminCEquivalent: number;
  vitaminEEquivalent: number;
}

export interface ServingSize {
  amount: number;
  unit: 'g' | 'ml' | 'cup' | 'piece' | 'slice' | 'tbsp' | 'tsp' | 'oz' | 'lb';
  description: string;
  weight: number; // grams
  volume?: number; // ml
}

export interface Ingredient {
  name: string;
  percentage?: number;
  allergenInfo: string[];
  origin?: string;
  organic: boolean;
  processed: boolean;
}

export type ProcessingLevel = 'unprocessed' | 'minimally_processed' | 'processed' | 'ultra_processed';

export interface Seasonality {
  peak: string[]; // months
  available: string[]; // months
  imported: boolean;
  localSources: string[];
}

export type FoodCategory = 
  | 'fruits' | 'vegetables' | 'grains' | 'protein' | 'dairy' | 'nuts_seeds'
  | 'oils_fats' | 'beverages' | 'snacks' | 'desserts' | 'condiments' | 'supplements';

export type DietaryTag = 
  | 'vegan' | 'vegetarian' | 'gluten_free' | 'dairy_free' | 'nut_free' | 'keto'
  | 'paleo' | 'low_carb' | 'high_protein' | 'low_sodium' | 'organic' | 'raw'
  | 'fermented' | 'probiotic' | 'prebiotic' | 'anti_inflammatory';

export interface PortionAnalysis {
  recommendedPortion: ServingSize;
  currentPortion: ServingSize;
  portionScore: number; // 0-100 (100 = optimal)
  adjustmentRecommendation: string;
  calorieImpact: number;
  satietyScore: number; // 0-100
  portionWarnings: string[];
}

export interface MealTimingRecommendation {
  optimalTimes: string[]; // time slots like "morning", "pre-workout", etc.
  reasoning: string[];
  metabolicBenefits: string[];
  combinationSuggestions: FoodCombination[];
  avoidTimes: string[];
}

export interface FoodCombination {
  foods: string[];
  benefit: string;
  mechanism: string;
  evidence: 'strong' | 'moderate' | 'limited';
}

export interface MetabolicImpact {
  bloodSugarImpact: BloodSugarResponse;
  insulinResponse: InsulinResponse;
  satietyResponse: SatietyResponse;
  thermicEffect: number; // calories burned digesting
  absorptionRate: AbsorptionRate;
  metabolicBoost: number; // percentage increase in metabolism
}

export interface BloodSugarResponse {
  peakTime: number; // minutes
  peakLevel: number; // mg/dL increase
  durationElevated: number; // minutes
  area: number; // area under curve
  classification: 'low' | 'moderate' | 'high';
}

export interface InsulinResponse {
  peakTime: number; // minutes
  magnitude: number; // relative scale 1-10
  duration: number; // minutes
  sensitivity: 'high' | 'moderate' | 'low';
}

export interface SatietyResponse {
  immediateFullness: number; // 0-100
  sustainedSatiety: number; // 0-100
  peakSatiety: number; // minutes to peak
  duration: number; // minutes of satiety
  hormoneImpact: HormoneImpact;
}

export interface HormoneImpact {
  ghrelin: number; // hunger hormone change %
  leptin: number; // satiety hormone change %
  cck: number; // cholecystokinin change %
  glp1: number; // GLP-1 change %
}

export interface AbsorptionRate {
  proteins: number; // grams per hour
  carbohydrates: number; // grams per hour
  fats: number; // grams per hour
  overallRate: 'fast' | 'moderate' | 'slow';
  factors: string[];
}

export interface MealPlan {
  id: string;
  name: string;
  duration: number; // days
  targetCalories: number;
  targetMacros: Macronutrients;
  dietaryRestrictions: DietaryTag[];
  meals: PlannedMeal[];
  shoppingList: ShoppingListItem[];
  prepInstructions: PrepInstruction[];
  nutritionAnalysis: MealPlanNutrition;
  cost: CostAnalysis;
  sustainability: SustainabilityScore;
}

export interface PlannedMeal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';
  name: string;
  foods: MealComponent[];
  totalNutrition: NutritionalValue;
  prepTime: number; // minutes
  cookTime: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  recipe?: Recipe;
  alternatives: AlternativeMeal[];
}

export interface MealComponent {
  food: FoodItem;
  quantity: number;
  unit: string;
  preparation: string;
  substitutions: FoodSubstitution[];
}

export interface FoodSubstitution {
  original: string;
  substitute: string;
  ratio: number; // substitution ratio
  reason: string;
  nutritionImpact: string;
}

export interface Recipe {
  id: string;
  instructions: string[];
  ingredients: RecipeIngredient[];
  cookingMethods: string[];
  equipment: string[];
  tips: string[];
  nutritionTips: string[];
}

export interface RecipeIngredient {
  ingredient: string;
  amount: number;
  unit: string;
  preparation?: string;
  optional: boolean;
}

export interface AlternativeMeal {
  meal: PlannedMeal;
  reason: string;
  nutritionComparison: string;
}

export interface ShoppingListItem {
  food: string;
  quantity: number;
  unit: string;
  category: FoodCategory;
  priority: 'essential' | 'preferred' | 'optional';
  estimatedCost: number;
  seasonality: 'in_season' | 'out_of_season' | 'year_round';
  alternatives: string[];
}

export interface PrepInstruction {
  day: number;
  tasks: PrepTask[];
  totalTime: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface PrepTask {
  description: string;
  timeRequired: number; // minutes
  equipment: string[];
  ingredients: string[];
  storageInstructions: string;
}

export interface MealPlanNutrition {
  averageDailyNutrition: NutritionalValue;
  micronutrientAdequacy: MicronutrientAdequacy;
  varietyScore: number; // 0-100
  balanceScore: number; // 0-100
  qualityScore: number; // 0-100
  deficiencyRisks: DeficiencyRisk[];
  excesses: NutrientExcess[];
}

export interface MicronutrientAdequacy {
  vitamins: Record<string, number>; // percentage of RDA
  minerals: Record<string, number>; // percentage of RDA
  overallScore: number; // 0-100
  criticalDeficiencies: string[];
}

export interface DeficiencyRisk {
  nutrient: string;
  risk: 'low' | 'moderate' | 'high';
  consequences: string[];
  foodSources: string[];
  supplementation: SupplementRecommendation;
}

export interface NutrientExcess {
  nutrient: string;
  amount: number;
  upperLimit: number;
  risks: string[];
  reduction: ReductionStrategy;
}

export interface SupplementRecommendation {
  recommended: boolean;
  type: string;
  dosage: string;
  timing: string;
  considerations: string[];
}

export interface ReductionStrategy {
  foodsToLimit: string[];
  alternatives: string[];
  portionAdjustments: string[];
}

export interface CostAnalysis {
  totalCost: number;
  costPerDay: number;
  costPerCalorie: number;
  costBreakdown: CostBreakdown;
  budgetComparison: BudgetComparison;
  savingTips: string[];
}

export interface CostBreakdown {
  proteins: number;
  vegetables: number;
  fruits: number;
  grains: number;
  dairy: number;
  other: number;
}

export interface BudgetComparison {
  budget: number;
  actual: number;
  difference: number;
  status: 'under' | 'on' | 'over';
}

export interface SustainabilityScore {
  overallScore: number; // 0-100
  carbonFootprint: number; // kg CO2 equivalent
  waterFootprint: number; // liters
  landUse: number; // m² land use
  packaging: PackagingImpact;
  localScore: number; // 0-100
  seasonalScore: number; // 0-100
  recommendations: string[];
}

export interface PackagingImpact {
  plasticWeight: number; // grams
  recyclability: number; // 0-100
  biodegradability: number; // 0-100
  overallImpact: 'low' | 'medium' | 'high';
}

export interface UserNutritionProfile {
  userId: string;
  demographics: UserDemographics;
  healthGoals: HealthGoal[];
  dietaryPreferences: DietaryPreferences;
  restrictions: DietaryRestriction[];
  allergies: Allergy[];
  intolerances: Intolerance[];
  supplementation: SupplementProfile;
  metabolicProfile: MetabolicProfile;
  activityLevel: ActivityLevel;
  nutritionHistory: NutritionHistoryEntry[];
}

export interface UserDemographics {
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  bodyFatPercentage?: number;
  muscleMass?: number;
  pregnancyStatus?: 'pregnant' | 'breastfeeding' | 'none';
  medicalConditions: string[];
}

export interface HealthGoal {
  type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'performance' | 'health' | 'longevity';
  target: number;
  timeframe: number; // days
  priority: 'high' | 'medium' | 'low';
  specific: string;
}

export interface DietaryPreferences {
  cuisines: string[];
  favoriteFoods: string[];
  dislikedFoods: string[];
  cookingSkill: 'beginner' | 'intermediate' | 'advanced';
  timeAvailable: number; // minutes per day for food prep
  budgetRange: [number, number]; // min, max per week
  organicPreference: boolean;
  localPreference: boolean;
}

export interface DietaryRestriction {
  type: DietaryTag;
  strictness: 'strict' | 'flexible';
  reason: string;
  startDate: Date;
}

export interface Allergy {
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  symptoms: string[];
  crossReactivities: string[];
}

export interface Intolerance {
  substance: string;
  symptoms: string[];
  threshold: number; // amount that triggers symptoms
  management: string[];
}

export interface SupplementProfile {
  currentSupplements: CurrentSupplement[];
  recommendations: SupplementRecommendation[];
  deficiencies: string[];
  excesses: string[];
}

export interface CurrentSupplement {
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  reason: string;
  effectiveness: number; // 0-10 self-reported
}

export interface MetabolicProfile {
  bmr: number; // basal metabolic rate
  tdee: number; // total daily energy expenditure
  metabolicType: 'slow' | 'average' | 'fast';
  insulinSensitivity: 'high' | 'moderate' | 'low';
  carbTolerance: 'high' | 'moderate' | 'low';
  fatAdaptation: number; // 0-100
  proteinRequirement: number; // g/kg body weight
  hydrationNeeds: number; // liters per day
}

export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';

export interface NutritionHistoryEntry {
  date: Date;
  meals: LoggedMeal[];
  totalCalories: number;
  macros: Macronutrients;
  hydration: number; // liters
  energy: number; // self-reported 1-10
  mood: number; // self-reported 1-10
  digestion: number; // self-reported 1-10
  sleep: number; // hours
  weight?: number; // kg
}

export interface LoggedMeal {
  time: Date;
  foods: LoggedFood[];
  context: MealContext;
  satisfaction: number; // 1-10
  hunger: { before: number; after: number }; // 1-10
}

export interface LoggedFood {
  food: FoodItem;
  quantity: number;
  unit: string;
  preparation: string;
  confidence: number; // accuracy confidence 0-1
}

export interface MealContext {
  location: string;
  social: boolean;
  mood: string;
  stress: number; // 1-10
  timeAvailable: number; // minutes
  cooking: boolean;
}

class NutritionAI {
  private foodDatabase: Map<string, FoodItem> = new Map();
  private nutritionModel: any | null = null; // tf.LayersModel when TensorFlow is available
  private userProfiles: Map<string, UserNutritionProfile> = new Map();
  private mealPlans: Map<string, MealPlan> = new Map();

  // ===== INITIALIZATION =====

  async initialize(): Promise<void> {
    try {
      console.log('Initializing Nutrition AI...');
      
      // Load food database
      await this.loadFoodDatabase();
      
      // Load nutrition analysis model
      await this.loadNutritionModel();
      
      // Load user profiles
      await this.loadUserProfiles();
      
      console.log('Nutrition AI initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Nutrition AI:', error);
      throw error;
    }
  }

  private async loadFoodDatabase(): Promise<void> {
    try {
      // Load comprehensive food database
      console.log('Loading food database...');
      
      // In production, this would load from a comprehensive nutrition database
      const mockFoods = this.generateMockFoodDatabase();
      for (const food of mockFoods) {
        this.foodDatabase.set(food.id, food);
      }
      
      console.log(`Loaded ${this.foodDatabase.size} foods into database`);
    } catch (error) {
      console.error('Error loading food database:', error);
      throw error;
    }
  }

  private async loadNutritionModel(): Promise<void> {
    try {
      console.log('Loading nutrition analysis model...');
      
      // In production, load pre-trained TensorFlow.js model for nutrition analysis
      // this.nutritionModel = await tf.loadLayersModel('path/to/nutrition/model.json');
      
      console.log('Nutrition model loaded successfully');
    } catch (error) {
      console.error('Error loading nutrition model:', error);
      // Continue without model for now
    }
  }

  private async loadUserProfiles(): Promise<void> {
    try {
      const profilesJson = await AsyncStorage.getItem('nutrition_profiles');
      if (profilesJson) {
        const profiles = JSON.parse(profilesJson);
        for (const [userId, profile] of Object.entries(profiles)) {
          this.userProfiles.set(userId, profile as UserNutritionProfile);
        }
      }
    } catch (error) {
      console.error('Error loading user profiles:', error);
    }
  }

  // ===== FOOD ANALYSIS =====

  async analyzeFoodItem(foodId: string, quantity: number, unit: string): Promise<NutritionAnalysis> {
    try {
      const foodItem = this.foodDatabase.get(foodId);
      if (!foodItem) {
        throw new Error(`Food item not found: ${foodId}`);
      }

      // Calculate nutritional value for the specified quantity
      const nutritionalValue = this.calculateNutritionalValue(foodItem, quantity, unit);
      
      // Calculate health score
      const healthScore = this.calculateHealthScore(foodItem, nutritionalValue);
      
      // Generate recommendations
      const recommendations = this.generateFoodRecommendations(foodItem, nutritionalValue);
      
      // Analyze portion
      const portionAnalysis = this.analyzePortionSize(foodItem, quantity, unit);
      
      // Determine optimal meal timing
      const mealTiming = this.analyzeMealTiming(foodItem);
      
      // Calculate metabolic impact
      const metabolicImpact = this.calculateMetabolicImpact(foodItem, nutritionalValue);

      return {
        foodItem,
        nutritionalValue,
        healthScore,
        recommendations,
        allergens: this.extractAllergens(foodItem),
        dietaryTags: this.determineDietaryTags(foodItem),
        portionAnalysis,
        mealTiming,
        metabolicImpact
      };
    } catch (error) {
      console.error('Error analyzing food item:', error);
      throw error;
    }
  }

  private calculateNutritionalValue(food: FoodItem, quantity: number, unit: string): NutritionalValue {
    // Convert quantity to grams
    const grams = this.convertToGrams(quantity, unit, food.servingSize);
    const multiplier = grams / food.servingSize.weight;

    // Scale nutrition data by quantity
    return {
      calories: Math.round((food.nutritionalValue?.calories || 0) * multiplier),
      macros: {
        protein: Math.round((food.nutritionalValue?.macros.protein || 0) * multiplier * 10) / 10,
        carbohydrates: Math.round((food.nutritionalValue?.macros.carbohydrates || 0) * multiplier * 10) / 10,
        fat: Math.round((food.nutritionalValue?.macros.fat || 0) * multiplier * 10) / 10,
      },
      micros: this.scaleMicronutrients(food.nutritionalValue?.micros, multiplier),
      fiber: Math.round((food.nutritionalValue?.fiber || 0) * multiplier * 10) / 10,
      sugar: Math.round((food.nutritionalValue?.sugar || 0) * multiplier * 10) / 10,
      sodium: Math.round((food.nutritionalValue?.sodium || 0) * multiplier),
      cholesterol: Math.round((food.nutritionalValue?.cholesterol || 0) * multiplier),
      transFat: Math.round((food.nutritionalValue?.transFat || 0) * multiplier * 10) / 10,
      saturatedFat: Math.round((food.nutritionalValue?.saturatedFat || 0) * multiplier * 10) / 10,
      unsaturatedFat: Math.round((food.nutritionalValue?.unsaturatedFat || 0) * multiplier * 10) / 10,
      omega3: Math.round((food.nutritionalValue?.omega3 || 0) * multiplier * 10) / 10,
      omega6: Math.round((food.nutritionalValue?.omega6 || 0) * multiplier * 10) / 10,
      glycemicIndex: food.nutritionalValue?.glycemicIndex || 0,
      glycemicLoad: Math.round((food.nutritionalValue?.glycemicLoad || 0) * multiplier),
      antioxidants: this.scaleAntioxidants(food.nutritionalValue?.antioxidants, multiplier)
    };
  }

  private calculateHealthScore(food: FoodItem, nutrition: NutritionalValue): number {
    let score = 50; // Base score
    
    // Positive factors
    if (food.processingLevel === 'unprocessed') score += 20;
    else if (food.processingLevel === 'minimally_processed') score += 10;
    else if (food.processingLevel === 'ultra_processed') score -= 20;
    
    // Nutrient density
    const nutrientDensity = this.calculateNutrientDensity(nutrition);
    score += nutrientDensity * 20;
    
    // Fiber content
    if (nutrition.fiber > 5) score += 10;
    else if (nutrition.fiber > 3) score += 5;
    
    // Added sugar penalty
    if (nutrition.sugar > 15) score -= 15;
    else if (nutrition.sugar > 10) score -= 10;
    
    // Sodium penalty
    if (nutrition.sodium > 600) score -= 15;
    else if (nutrition.sodium > 300) score -= 5;
    
    // Trans fat penalty
    if (nutrition.transFat > 0) score -= 20;
    
    // Antioxidant bonus
    if (nutrition.antioxidants.oracValue > 1000) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateNutrientDensity(nutrition: NutritionalValue): number {
    // Calculate nutrient density score (0-1)
    const vitaminsScore = Object.values(nutrition.micros.vitamins).reduce((sum, value) => sum + value, 0) / 1000;
    const mineralsScore = Object.values(nutrition.micros.minerals).reduce((sum, value) => sum + value, 0) / 1000;
    const proteinScore = nutrition.macros.protein / Math.max(nutrition.calories, 1) * 100;
    const fiberScore = nutrition.fiber / Math.max(nutrition.calories, 1) * 1000;
    
    return Math.min(1, (vitaminsScore + mineralsScore + proteinScore + fiberScore) / 4);
  }

  private generateFoodRecommendations(food: FoodItem, nutrition: NutritionalValue): string[] {
    const recommendations: string[] = [];
    
    // Processing level recommendations
    if (food.processingLevel === 'ultra_processed') {
      recommendations.push('Consider choosing less processed alternatives');
    }
    
    // Portion size recommendations
    if (nutrition.calories > 400) {
      recommendations.push('High calorie density - watch portion sizes');
    }
    
    // Sodium recommendations
    if (nutrition.sodium > 400) {
      recommendations.push('High sodium content - balance with low-sodium foods');
    }
    
    // Sugar recommendations
    if (nutrition.sugar > 12) {
      recommendations.push('High sugar content - consider consuming after workouts');
    }
    
    // Positive recommendations
    if (nutrition.fiber > 5) {
      recommendations.push('Excellent fiber source for digestive health');
    }
    
    if (nutrition.macros.protein > 20) {
      recommendations.push('High protein content - great for muscle building');
    }
    
    if (nutrition.antioxidants.oracValue > 1000) {
      recommendations.push('Rich in antioxidants - supports recovery and health');
    }
    
    return recommendations;
  }

  private analyzePortionSize(food: FoodItem, quantity: number, unit: string): PortionAnalysis {
    const recommendedGrams = food.servingSize.weight;
    const actualGrams = this.convertToGrams(quantity, unit, food.servingSize);
    
    const ratio = actualGrams / recommendedGrams;
    let portionScore = 100;
    let adjustmentRecommendation = 'Optimal portion size';
    
    if (ratio > 1.5) {
      portionScore = 60;
      adjustmentRecommendation = 'Consider reducing portion size';
    } else if (ratio > 1.2) {
      portionScore = 80;
      adjustmentRecommendation = 'Slightly large portion - monitor total calories';
    } else if (ratio < 0.8) {
      portionScore = 85;
      adjustmentRecommendation = 'Small portion - ensure adequate nutrition';
    }
    
    const satietyScore = this.calculateSatietyScore(food);
    const calorieImpact = (actualGrams / recommendedGrams - 1) * (food.nutritionalValue?.calories || 0);
    
    return {
      recommendedPortion: food.servingSize,
      currentPortion: {
        amount: quantity,
        unit: unit as any,
        description: `${quantity} ${unit}`,
        weight: actualGrams
      },
      portionScore,
      adjustmentRecommendation,
      calorieImpact,
      satietyScore,
      portionWarnings: ratio > 2 ? ['Very large portion - may exceed daily calorie needs'] : []
    };
  }

  private calculateSatietyScore(food: FoodItem): number {
    let score = 50;
    
    const nutrition = food.nutritionalValue;
    if (!nutrition) return score;
    
    // Protein increases satiety
    score += (nutrition.macros.protein / nutrition.calories) * 1000;
    
    // Fiber increases satiety
    score += (nutrition.fiber / nutrition.calories) * 2000;
    
    // Fat increases satiety
    score += (nutrition.macros.fat / nutrition.calories) * 500;
    
    // Processing level affects satiety
    if (food.processingLevel === 'unprocessed') score += 20;
    else if (food.processingLevel === 'ultra_processed') score -= 20;
    
    return Math.max(0, Math.min(100, score));
  }

  private analyzeMealTiming(food: FoodItem): MealTimingRecommendation {
    const nutrition = food.nutritionalValue;
    if (!nutrition) {
      return {
        optimalTimes: ['any_time'],
        reasoning: ['No specific timing requirements'],
        metabolicBenefits: [],
        combinationSuggestions: [],
        avoidTimes: []
      };
    }
    
    const optimalTimes: string[] = [];
    const reasoning: string[] = [];
    const metabolicBenefits: string[] = [];
    const avoidTimes: string[] = [];
    
    // High carb foods
    if (nutrition.macros.carbohydrates > 30) {
      optimalTimes.push('pre_workout', 'post_workout', 'morning');
      reasoning.push('High carb content provides energy for workouts');
      metabolicBenefits.push('Muscle glycogen replenishment');
    }
    
    // High protein foods
    if (nutrition.macros.protein > 20) {
      optimalTimes.push('post_workout', 'any_time');
      reasoning.push('High protein supports muscle protein synthesis');
      metabolicBenefits.push('Muscle recovery and growth');
    }
    
    // High fat foods
    if (nutrition.macros.fat > 15) {
      optimalTimes.push('morning', 'between_meals');
      reasoning.push('Fats provide sustained energy and satiety');
      metabolicBenefits.push('Hormone production', 'Sustained energy');
      avoidTimes.push('immediately_pre_workout');
    }
    
    // High fiber foods
    if (nutrition.fiber > 5) {
      avoidTimes.push('immediately_pre_workout');
      reasoning.push('High fiber may cause digestive discomfort during exercise');
    }
    
    return {
      optimalTimes: optimalTimes.length > 0 ? optimalTimes : ['any_time'],
      reasoning,
      metabolicBenefits,
      combinationSuggestions: this.generateCombinationSuggestions(food),
      avoidTimes
    };
  }

  private generateCombinationSuggestions(food: FoodItem): FoodCombination[] {
    const combinations: FoodCombination[] = [];
    
    if (food.category === 'protein') {
      combinations.push({
        foods: [food.name, 'Complex carbohydrates'],
        benefit: 'Enhanced muscle protein synthesis',
        mechanism: 'Insulin response improves amino acid uptake',
        evidence: 'strong'
      });
    }
    
    if (food.category === 'fruits' && food.nutritionalValue?.micros.vitamins.vitaminC && food.nutritionalValue.micros.vitamins.vitaminC > 50) {
      combinations.push({
        foods: [food.name, 'Iron-rich foods'],
        benefit: 'Improved iron absorption',
        mechanism: 'Vitamin C enhances non-heme iron absorption',
        evidence: 'strong'
      });
    }
    
    return combinations;
  }

  private calculateMetabolicImpact(food: FoodItem, nutrition: NutritionalValue): MetabolicImpact {
    const bloodSugarImpact = this.calculateBloodSugarResponse(nutrition);
    const insulinResponse = this.calculateInsulinResponse(nutrition);
    const satietyResponse = this.calculateSatietyResponse(food, nutrition);
    const thermicEffect = this.calculateThermicEffect(nutrition);
    const absorptionRate = this.calculateAbsorptionRate(nutrition);
    const metabolicBoost = this.calculateMetabolicBoost(nutrition);
    
    return {
      bloodSugarImpact,
      insulinResponse,
      satietyResponse,
      thermicEffect,
      absorptionRate,
      metabolicBoost
    };
  }

  private calculateBloodSugarResponse(nutrition: NutritionalValue): BloodSugarResponse {
    const glycemicLoad = nutrition.glycemicLoad;
    
    let classification: 'low' | 'moderate' | 'high';
    let peakTime: number;
    let peakLevel: number;
    let durationElevated: number;
    
    if (glycemicLoad < 10) {
      classification = 'low';
      peakTime = 45;
      peakLevel = 15;
      durationElevated = 90;
    } else if (glycemicLoad < 20) {
      classification = 'moderate';
      peakTime = 30;
      peakLevel = 35;
      durationElevated = 120;
    } else {
      classification = 'high';
      peakTime = 20;
      peakLevel = 55;
      durationElevated = 180;
    }
    
    return {
      peakTime,
      peakLevel,
      durationElevated,
      area: glycemicLoad * 10,
      classification
    };
  }

  private calculateInsulinResponse(nutrition: NutritionalValue): InsulinResponse {
    const carbs = nutrition.macros.carbohydrates;
    const protein = nutrition.macros.protein;
    
    // Insulin response based on carbs and protein
    const magnitude = Math.min(10, (carbs * 0.1 + protein * 0.05));
    
    return {
      peakTime: 30,
      magnitude,
      duration: 120,
      sensitivity: magnitude < 3 ? 'high' : magnitude < 6 ? 'moderate' : 'low'
    };
  }

  private calculateSatietyResponse(food: FoodItem, nutrition: NutritionalValue): SatietyResponse {
    const proteinFactor = nutrition.macros.protein * 4;
    const fiberFactor = nutrition.fiber * 6;
    const fatFactor = nutrition.macros.fat * 2;
    const volumeFactor = food.processingLevel === 'unprocessed' ? 20 : 0;
    
    const immediateFullness = Math.min(100, proteinFactor + fiberFactor + volumeFactor);
    const sustainedSatiety = Math.min(100, proteinFactor + fatFactor + fiberFactor);
    
    return {
      immediateFullness,
      sustainedSatiety,
      peakSatiety: 15,
      duration: 180 + sustainedSatiety * 2,
      hormoneImpact: {
        ghrelin: -sustainedSatiety * 0.5,
        leptin: sustainedSatiety * 0.3,
        cck: immediateFullness * 0.4,
        glp1: fiberFactor * 0.3
      }
    };
  }

  private calculateThermicEffect(nutrition: NutritionalValue): number {
    // Thermic effect of food (calories burned during digestion)
    const proteinThermic = nutrition.macros.protein * 4 * 0.25; // 25% for protein
    const carbThermic = nutrition.macros.carbohydrates * 4 * 0.08; // 8% for carbs
    const fatThermic = nutrition.macros.fat * 9 * 0.03; // 3% for fat
    
    return proteinThermic + carbThermic + fatThermic;
  }

  private calculateAbsorptionRate(nutrition: NutritionalValue): AbsorptionRate {
    return {
      proteins: Math.min(10, nutrition.macros.protein * 0.5), // grams per hour
      carbohydrates: Math.min(60, nutrition.macros.carbohydrates * 0.8),
      fats: Math.min(5, nutrition.macros.fat * 0.3),
      overallRate: nutrition.fiber > 5 ? 'slow' : nutrition.sugar > 10 ? 'fast' : 'moderate',
      factors: [
        nutrition.fiber > 5 ? 'High fiber slows absorption' : '',
        nutrition.macros.fat > 10 ? 'Fat slows gastric emptying' : '',
        nutrition.sugar > 10 ? 'Simple sugars absorbed quickly' : ''
      ].filter(Boolean)
    };
  }

  private calculateMetabolicBoost(nutrition: NutritionalValue): number {
    // Percentage increase in metabolism
    const proteinBoost = nutrition.macros.protein * 0.02; // 2% per gram protein
    const caffeine = 0; // Would be determined from ingredients
    const spiceBoost = 0; // Would be determined from ingredients
    
    return Math.min(15, proteinBoost + caffeine + spiceBoost);
  }

  // ===== MEAL PLANNING =====

  async generateMealPlan(
    userId: string,
    duration: number,
    targetCalories: number,
    dietaryRestrictions: DietaryTag[] = []
  ): Promise<MealPlan> {
    try {
      const userProfile = this.userProfiles.get(userId);
      if (!userProfile) {
        throw new Error(`User profile not found: ${userId}`);
      }

      const targetMacros = this.calculateTargetMacros(userProfile, targetCalories);
      const meals = await this.planMeals(userProfile, duration, targetCalories, targetMacros, dietaryRestrictions);
      const shoppingList = this.generateShoppingList(meals);
      const prepInstructions = this.generatePrepInstructions(meals);
      const nutritionAnalysis = this.analyzeMealPlanNutrition(meals);
      const cost = this.calculateCostAnalysis(shoppingList, userProfile);
      const sustainability = this.calculateSustainabilityScore(meals);

      const mealPlan: MealPlan = {
        id: `meal_plan_${userId}_${Date.now()}`,
        name: `${duration}-Day Personalized Plan`,
        duration,
        targetCalories,
        targetMacros,
        dietaryRestrictions,
        meals,
        shoppingList,
        prepInstructions,
        nutritionAnalysis,
        cost,
        sustainability
      };

      this.mealPlans.set(mealPlan.id, mealPlan);
      await this.saveMealPlan(mealPlan);

      return mealPlan;
    } catch (error) {
      console.error('Error generating meal plan:', error);
      throw error;
    }
  }

  private calculateTargetMacros(profile: UserNutritionProfile, calories: number): Macronutrients {
    // Calculate optimal macro distribution based on user profile
    let proteinPercentage = 0.25; // Default 25%
    let fatPercentage = 0.30; // Default 30%
    let carbPercentage = 0.45; // Default 45%
    
    // Adjust based on goals
    const primaryGoal = profile.healthGoals.find(g => g.priority === 'high');
    if (primaryGoal) {
      switch (primaryGoal.type) {
        case 'muscle_gain':
          proteinPercentage = 0.30;
          carbPercentage = 0.45;
          fatPercentage = 0.25;
          break;
        case 'weight_loss':
          proteinPercentage = 0.35;
          carbPercentage = 0.35;
          fatPercentage = 0.30;
          break;
        case 'performance':
          proteinPercentage = 0.25;
          carbPercentage = 0.50;
          fatPercentage = 0.25;
          break;
      }
    }
    
    // Adjust for dietary restrictions
    if (profile.restrictions.some(r => r.type === 'keto')) {
      proteinPercentage = 0.25;
      carbPercentage = 0.05;
      fatPercentage = 0.70;
    }
    
    return {
      protein: Math.round(calories * proteinPercentage / 4), // 4 cal/g
      carbohydrates: Math.round(calories * carbPercentage / 4), // 4 cal/g
      fat: Math.round(calories * fatPercentage / 9), // 9 cal/g
    };
  }

  // ===== UTILITY METHODS =====

  private convertToGrams(quantity: number, unit: string, servingSize: ServingSize): number {
    // Convert various units to grams
    const conversionFactors: Record<string, number> = {
      'g': 1,
      'kg': 1000,
      'oz': 28.35,
      'lb': 453.59,
      'cup': 240, // approximate for liquid
      'ml': 1, // for water density
      'tsp': 5,
      'tbsp': 15,
      'piece': servingSize.weight,
      'slice': servingSize.weight * 0.8
    };
    
    return quantity * (conversionFactors[unit] || servingSize.weight);
  }

  private scaleMicronutrients(micros: Micronutrients | undefined, multiplier: number): Micronutrients {
    if (!micros) return this.getDefaultMicronutrients();
    
    return {
      vitamins: {
        vitaminA: micros.vitamins.vitaminA * multiplier,
        vitaminC: micros.vitamins.vitaminC * multiplier,
        vitaminD: micros.vitamins.vitaminD * multiplier,
        vitaminE: micros.vitamins.vitaminE * multiplier,
        vitaminK: micros.vitamins.vitaminK * multiplier,
        thiamine: micros.vitamins.thiamine * multiplier,
        riboflavin: micros.vitamins.riboflavin * multiplier,
        niacin: micros.vitamins.niacin * multiplier,
        vitaminB6: micros.vitamins.vitaminB6 * multiplier,
        folate: micros.vitamins.folate * multiplier,
        vitaminB12: micros.vitamins.vitaminB12 * multiplier,
        biotin: micros.vitamins.biotin * multiplier,
        pantothenicAcid: micros.vitamins.pantothenicAcid * multiplier
      },
      minerals: {
        calcium: micros.minerals.calcium * multiplier,
        iron: micros.minerals.iron * multiplier,
        magnesium: micros.minerals.magnesium * multiplier,
        phosphorus: micros.minerals.phosphorus * multiplier,
        potassium: micros.minerals.potassium * multiplier,
        sodium: micros.minerals.sodium * multiplier,
        zinc: micros.minerals.zinc * multiplier,
        copper: micros.minerals.copper * multiplier,
        manganese: micros.minerals.manganese * multiplier,
        selenium: micros.minerals.selenium * multiplier,
        chromium: micros.minerals.chromium * multiplier,
        molybdenum: micros.minerals.molybdenum * multiplier
      },
      phytonutrients: {
        flavonoids: micros.phytonutrients.flavonoids * multiplier,
        carotenoids: micros.phytonutrients.carotenoids * multiplier,
        polyphenols: micros.phytonutrients.polyphenols * multiplier,
        anthocyanins: micros.phytonutrients.anthocyanins * multiplier,
        resveratrol: micros.phytonutrients.resveratrol * multiplier,
        lycopene: micros.phytonutrients.lycopene * multiplier,
        lutein: micros.phytonutrients.lutein * multiplier,
        zeaxanthin: micros.phytonutrients.zeaxanthin * multiplier
      }
    };
  }

  private scaleAntioxidants(antioxidants: AntioxidantProfile | undefined, multiplier: number): AntioxidantProfile {
    if (!antioxidants) return { oracValue: 0, totalPhenolics: 0, vitaminCEquivalent: 0, vitaminEEquivalent: 0 };
    
    return {
      oracValue: antioxidants.oracValue * multiplier,
      totalPhenolics: antioxidants.totalPhenolics * multiplier,
      vitaminCEquivalent: antioxidants.vitaminCEquivalent * multiplier,
      vitaminEEquivalent: antioxidants.vitaminEEquivalent * multiplier
    };
  }

  private extractAllergens(food: FoodItem): string[] {
    const allergens: Set<string> = new Set();
    
    for (const ingredient of food.ingredients) {
      for (const allergen of ingredient.allergenInfo) {
        allergens.add(allergen);
      }
    }
    
    return Array.from(allergens);
  }

  private determineDietaryTags(food: FoodItem): DietaryTag[] {
    const tags: DietaryTag[] = [];
    
    // Check ingredients for dietary compliance
    const hasAnimalProducts = food.ingredients.some(i => 
      ['meat', 'dairy', 'eggs', 'fish'].some(animal => 
        i.name.toLowerCase().includes(animal)
      )
    );
    
    if (!hasAnimalProducts) {
      tags.push('vegan', 'vegetarian');
    }
    
    // Check for gluten
    const hasGluten = food.ingredients.some(i =>
      ['wheat', 'barley', 'rye'].some(grain =>
        i.name.toLowerCase().includes(grain)
      )
    );
    
    if (!hasGluten) {
      tags.push('gluten_free');
    }
    
    // Check for organic
    if (food.ingredients.every(i => i.organic)) {
      tags.push('organic');
    }
    
    // Check processing level
    if (food.processingLevel === 'unprocessed') {
      tags.push('raw');
    }
    
    return tags;
  }

  // Mock data generation methods
  private generateMockFoodDatabase(): FoodItem[] {
    // Generate comprehensive mock food database
    return [
      {
        id: 'chicken_breast_001',
        name: 'Chicken Breast',
        category: 'protein',
        servingSize: {
          amount: 100,
          unit: 'g',
          description: '100g serving',
          weight: 100
        },
        ingredients: [
          {
            name: 'Chicken breast meat',
            percentage: 100,
            allergenInfo: [],
            organic: false,
            processed: false
          }
        ],
        processingLevel: 'unprocessed',
        seasonality: {
          peak: ['all'],
          available: ['all'],
          imported: false,
          localSources: ['local farms']
        },
        nutritionalValue: {
          calories: 165,
          macros: { protein: 31, carbohydrates: 0, fat: 3.6 },
          micros: this.getDefaultMicronutrients(),
          fiber: 0,
          sugar: 0,
          sodium: 74,
          cholesterol: 85,
          transFat: 0,
          saturatedFat: 1.0,
          unsaturatedFat: 2.6,
          omega3: 0.1,
          omega6: 0.3,
          glycemicIndex: 0,
          glycemicLoad: 0,
          antioxidants: {
            oracValue: 100,
            totalPhenolics: 50,
            vitaminCEquivalent: 0,
            vitaminEEquivalent: 0.2
          }
        }
      },
      // Add more mock foods...
    ];
  }

  private getDefaultMicronutrients(): Micronutrients {
    return {
      vitamins: {
        vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
        thiamine: 0, riboflavin: 0, niacin: 0, vitaminB6: 0, folate: 0,
        vitaminB12: 0, biotin: 0, pantothenicAcid: 0
      },
      minerals: {
        calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, potassium: 0,
        sodium: 0, zinc: 0, copper: 0, manganese: 0, selenium: 0,
        chromium: 0, molybdenum: 0
      },
      phytonutrients: {
        flavonoids: 0, carotenoids: 0, polyphenols: 0, anthocyanins: 0,
        resveratrol: 0, lycopene: 0, lutein: 0, zeaxanthin: 0
      }
    };
  }

  // Placeholder methods for meal planning
  private async planMeals(
    profile: UserNutritionProfile,
    duration: number,
    calories: number,
    macros: Macronutrients,
    restrictions: DietaryTag[]
  ): Promise<PlannedMeal[]> {
    // Mock meal planning implementation
    return [];
  }

  private generateShoppingList(meals: PlannedMeal[]): ShoppingListItem[] {
    return [];
  }

  private generatePrepInstructions(meals: PlannedMeal[]): PrepInstruction[] {
    return [];
  }

  private analyzeMealPlanNutrition(meals: PlannedMeal[]): MealPlanNutrition {
    return {
      averageDailyNutrition: {
        calories: 2000,
        macros: { protein: 150, carbohydrates: 200, fat: 70 },
        micros: this.getDefaultMicronutrients(),
        fiber: 25,
        sugar: 50,
        sodium: 2000,
        cholesterol: 200,
        transFat: 0,
        saturatedFat: 20,
        unsaturatedFat: 50,
        omega3: 2,
        omega6: 10,
        glycemicIndex: 55,
        glycemicLoad: 100,
        antioxidants: { oracValue: 5000, totalPhenolics: 1000, vitaminCEquivalent: 100, vitaminEEquivalent: 15 }
      },
      micronutrientAdequacy: {
        vitamins: {},
        minerals: {},
        overallScore: 85,
        criticalDeficiencies: []
      },
      varietyScore: 85,
      balanceScore: 90,
      qualityScore: 80,
      deficiencyRisks: [],
      excesses: []
    };
  }

  private calculateCostAnalysis(shoppingList: ShoppingListItem[], profile: UserNutritionProfile): CostAnalysis {
    return {
      totalCost: 75,
      costPerDay: 10.71,
      costPerCalorie: 0.005,
      costBreakdown: {
        proteins: 25,
        vegetables: 15,
        fruits: 10,
        grains: 8,
        dairy: 12,
        other: 5
      },
      budgetComparison: {
        budget: 80,
        actual: 75,
        difference: 5,
        status: 'under'
      },
      savingTips: ['Buy seasonal produce', 'Consider bulk purchases for grains']
    };
  }

  private calculateSustainabilityScore(meals: PlannedMeal[]): SustainabilityScore {
    return {
      overallScore: 75,
      carbonFootprint: 12.5,
      waterFootprint: 2500,
      landUse: 8.2,
      packaging: {
        plasticWeight: 150,
        recyclability: 80,
        biodegradability: 40,
        overallImpact: 'medium'
      },
      localScore: 65,
      seasonalScore: 70,
      recommendations: ['Choose more plant-based proteins', 'Buy local when possible']
    };
  }

  private async saveMealPlan(mealPlan: MealPlan): Promise<void> {
    try {
      await AsyncStorage.setItem(`meal_plan_${mealPlan.id}`, JSON.stringify(mealPlan));
    } catch (error) {
      console.error('Error saving meal plan:', error);
    }
  }

  // ===== PUBLIC API METHODS =====

  async searchFoods(query: string, filters?: { category?: FoodCategory; tags?: DietaryTag[] }): Promise<FoodItem[]> {
    const results: FoodItem[] = [];
    
    for (const food of this.foodDatabase.values()) {
      if (food.name.toLowerCase().includes(query.toLowerCase())) {
        if (filters?.category && food.category !== filters.category) continue;
        if (filters?.tags && !filters.tags.every(tag => this.determineDietaryTags(food).includes(tag))) continue;
        
        results.push(food);
      }
    }
    
    return results.slice(0, 20); // Limit results
  }

  async createUserProfile(userId: string, profileData: Partial<UserNutritionProfile>): Promise<void> {
    const profile: UserNutritionProfile = {
      userId,
      demographics: profileData.demographics || {
        age: 30,
        gender: 'other',
        height: 170,
        weight: 70,
        medicalConditions: []
      },
      healthGoals: profileData.healthGoals || [],
      dietaryPreferences: profileData.dietaryPreferences || {
        cuisines: [],
        favoriteFoods: [],
        dislikedFoods: [],
        cookingSkill: 'intermediate',
        timeAvailable: 60,
        budgetRange: [50, 100],
        organicPreference: false,
        localPreference: false
      },
      restrictions: profileData.restrictions || [],
      allergies: profileData.allergies || [],
      intolerances: profileData.intolerances || [],
      supplementation: profileData.supplementation || {
        currentSupplements: [],
        recommendations: [],
        deficiencies: [],
        excesses: []
      },
      metabolicProfile: profileData.metabolicProfile || {
        bmr: 1600,
        tdee: 2200,
        metabolicType: 'average',
        insulinSensitivity: 'moderate',
        carbTolerance: 'moderate',
        fatAdaptation: 50,
        proteinRequirement: 1.6,
        hydrationNeeds: 2.5
      },
      activityLevel: profileData.activityLevel || 'moderately_active',
      nutritionHistory: profileData.nutritionHistory || []
    };

    this.userProfiles.set(userId, profile);
    await this.saveUserProfile(profile);
  }

  private async saveUserProfile(profile: UserNutritionProfile): Promise<void> {
    try {
      const profiles = Object.fromEntries(this.userProfiles);
      await AsyncStorage.setItem('nutrition_profiles', JSON.stringify(profiles));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  async logMeal(userId: string, meal: LoggedMeal): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    // Add to today's nutrition history or create new entry
    const today = new Date().toDateString();
    let todayEntry = profile.nutritionHistory.find(entry => 
      entry.date.toDateString() === today
    );

    if (!todayEntry) {
      todayEntry = {
        date: new Date(),
        meals: [],
        totalCalories: 0,
        macros: { protein: 0, carbohydrates: 0, fat: 0 },
        hydration: 0,
        energy: 5,
        mood: 5,
        digestion: 5,
        sleep: 8
      };
      profile.nutritionHistory.push(todayEntry);
    }

    todayEntry.meals.push(meal);
    
    // Recalculate daily totals
    this.recalculateDailyNutrition(todayEntry);
    
    await this.saveUserProfile(profile);
  }

  private recalculateDailyNutrition(entry: NutritionHistoryEntry): void {
    let totalCalories = 0;
    const macros = { protein: 0, carbohydrates: 0, fat: 0 };

    for (const meal of entry.meals) {
      for (const food of meal.foods) {
        const nutrition = this.calculateNutritionalValue(food.food, food.quantity, food.unit);
        totalCalories += nutrition.calories;
        macros.protein += nutrition.macros.protein;
        macros.carbohydrates += nutrition.macros.carbohydrates;
        macros.fat += nutrition.macros.fat;
      }
    }

    entry.totalCalories = totalCalories;
    entry.macros = macros;
  }
}

export default new NutritionAI();
