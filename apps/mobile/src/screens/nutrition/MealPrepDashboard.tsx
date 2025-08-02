import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import AdvancedNutritionService, { WeeklyMealPlan, MealPrepPlan } from '../../services/AdvancedNutritionService';

const { width } = Dimensions.get('window');

interface MealPrepDashboardProps {
  navigation: any;
}

interface PrepCard {
  id: string;
  title: string;
  prepTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  calories: number;
  protein: number;
  status: 'planned' | 'in_progress' | 'completed';
}

export default function MealPrepDashboard({ navigation }: MealPrepDashboardProps) {
  const { userId } = useSelector((state: RootState) => state.auth);
  
  const [mealPrepPlan, setMealPrepPlan] = useState<MealPrepPlan | null>(null);
  const [currentWeekPlan, setCurrentWeekPlan] = useState<WeeklyMealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0); // 0 = today
  const [prepProgress, setPrepProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadMealPrepData();
  }, []);

  const loadMealPrepData = async () => {
    setIsLoading(true);
    try {
      const nutritionService = AdvancedNutritionService.getInstance();
      
      // Create a simple meal prep plan for demo
      const prepPlan: MealPrepPlan = {
        id: 'prep-plan-1',
        userId: userId || 'demo',
        weekId: 'week-plan-1',
        prepSessions: [
          {
            date: new Date(),
            startTime: '10:00',
            duration: 180,
            recipes: [],
            sequence: [],
            equipmentSetup: ['Large pot', 'Mixing bowls', 'Food containers'],
            cleanupTime: 30,
          },
        ],
        timeRequired: 180,
        equipmentNeeded: ['Large pot', 'Mixing bowls', 'Food containers', 'Measuring cups'],
        storageInstructions: [
          {
            recipeId: 'recipe-1',
            containerType: 'Glass jar with lid',
            storageLocation: 'refrigerator',
            maxDays: 5,
            reheatingMethod: ['ready-to-eat'],
            qualityNotes: ['Best consumed within 3 days for optimal texture'],
          },
          {
            recipeId: 'recipe-2',
            containerType: 'Airtight meal prep containers',
            storageLocation: 'refrigerator',
            maxDays: 4,
            reheatingMethod: ['microwave', 'stovetop'],
            qualityNotes: ['Reheat thoroughly before serving'],
          },
        ],
        reheatingInstructions: [
          {
            method: 'microwave',
            temperature: 165,
            duration: '90 seconds',
            qualityTips: ['Stir halfway through heating for even temperature'],
            safetyNotes: ['Ensure internal temperature reaches 165°F before serving'],
          },
        ],
      };

      // In a real app, this would come from API
      const mockMealPlan: WeeklyMealPlan = {
        id: 'week-plan-1',
        userId: userId || 'demo',
        weekStartDate: new Date(),
        weeklyTargets: {
          calories: 2200,
          protein: 165,
          carbs: 275,
          fat: 73,
          fiber: 35,
          sugar: 50,
          sodium: 2300,
          micronutrients: {},
        },
        budgetTarget: 100,
        actualCost: 85.50,
        dailyPlans: generateMockDailyPlans(),
        shoppingLists: [],
        mealPrepSchedule: prepPlan,
      };

      setCurrentWeekPlan(mockMealPlan);
      setMealPrepPlan(prepPlan);
    } catch (error) {
      console.error('Error loading meal prep data:', error);
      Alert.alert('Error', 'Failed to load meal prep data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockDailyPlans = () => {
    const meals = [
      {
        id: '1',
        type: 'breakfast' as const,
        timing: '08:00',
        recipe: {
          id: 'recipe-1',
          name: 'Protein Overnight Oats',
          description: 'High-protein breakfast with berries',
          prepTime: 5,
          cookTime: 0,
          servings: 1,
          difficulty: 'easy' as const,
          nutrition: { 
            calories: 350, 
            protein: 25, 
            carbs: 45, 
            fat: 8,
            fiber: 8,
            sugar: 12,
            sodium: 150,
            vitamins: {},
            minerals: {},
          },
          ingredients: [],
          instructions: [],
          tags: ['high-protein', 'make-ahead'],
          mealType: 'breakfast' as const,
          rating: 4.5,
          reviews: 125,
          images: [],
          macroBalance: {
            proteinPercentage: 30,
            carbPercentage: 50,
            fatPercentage: 20,
            qualityScore: 8,
            satiationScore: 7,
          },
        },
        portionSize: 1,
        hydrationRecommendation: 250,
      },
      {
        id: '2',
        type: 'lunch' as const,
        timing: '12:30',
        recipe: {
          id: 'recipe-2',
          name: 'Chicken & Quinoa Bowl',
          description: 'Balanced meal with lean protein and complex carbs',
          prepTime: 15,
          cookTime: 20,
          servings: 4,
          difficulty: 'medium' as const,
          nutrition: { 
            calories: 520, 
            protein: 45, 
            carbs: 55, 
            fat: 12,
            fiber: 10,
            sugar: 8,
            sodium: 280,
            vitamins: {},
            minerals: {},
          },
          ingredients: [],
          instructions: [],
          tags: ['meal-prep-friendly', 'balanced'],
          mealType: 'lunch' as const,
          rating: 4.7,
          reviews: 89,
          images: [],
          macroBalance: {
            proteinPercentage: 35,
            carbPercentage: 45,
            fatPercentage: 20,
            qualityScore: 9,
            satiationScore: 8,
          },
        },
        portionSize: 1,
        hydrationRecommendation: 300,
      },
      {
        id: '3',
        type: 'dinner' as const,
        timing: '19:00',
        recipe: {
          id: 'recipe-3',
          name: 'Salmon with Roasted Vegetables',
          description: 'Omega-3 rich dinner with seasonal vegetables',
          prepTime: 10,
          cookTime: 25,
          servings: 2,
          difficulty: 'medium' as const,
          nutrition: { 
            calories: 480, 
            protein: 38, 
            carbs: 30, 
            fat: 22,
            fiber: 12,
            sugar: 6,
            sodium: 200,
            vitamins: {},
            minerals: {},
          },
          ingredients: [],
          instructions: [],
          tags: ['heart-healthy', 'omega-3'],
          mealType: 'dinner' as const,
          rating: 4.8,
          reviews: 156,
          images: [],
          macroBalance: {
            proteinPercentage: 32,
            carbPercentage: 25,
            fatPercentage: 43,
            qualityScore: 9,
            satiationScore: 9,
          },
        },
        portionSize: 1,
        hydrationRecommendation: 400,
      },
    ];

    return Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      meals: meals,
      totalNutrition: {
        calories: meals.reduce((sum, meal) => sum + meal.recipe.nutrition.calories, 0),
        protein: meals.reduce((sum, meal) => sum + meal.recipe.nutrition.protein, 0),
        carbs: meals.reduce((sum, meal) => sum + meal.recipe.nutrition.carbs, 0),
        fat: meals.reduce((sum, meal) => sum + meal.recipe.nutrition.fat, 0),
        fiber: meals.reduce((sum, meal) => sum + (meal.recipe.nutrition.fiber || 0), 0),
        sugar: meals.reduce((sum, meal) => sum + (meal.recipe.nutrition.sugar || 0), 0),
        sodium: meals.reduce((sum, meal) => sum + (meal.recipe.nutrition.sodium || 0), 0),
        vitamins: {},
        minerals: {},
      },
      shoppingItems: [],
      targetCompletion: Date.now() + i * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000,
      hydrationGoal: 2500,
      supplementStack: [],
      notes: [],
      calorieDistribution: {
        breakfast: 25,
        lunch: 35,
        dinner: 30,
        snacks: 5,
        preworkout: 3,
        postworkout: 2,
      },
    }));
  };

  const togglePrepTask = (taskId: string) => {
    setPrepProgress(prev => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const renderPrepTaskCard = ({ item }: { item: any }) => {
    const isCompleted = prepProgress[item.id] || false;
    
    return (
      <TouchableOpacity
        style={[styles.prepCard, isCompleted && styles.prepCardCompleted]}
        onPress={() => togglePrepTask(item.id)}
      >
        <View style={styles.prepCardHeader}>
          <View style={styles.prepCardTitle}>
            <Ionicons 
              name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'} 
              size={24} 
              color={isCompleted ? '#10b981' : '#d1d5db'} 
            />
            <Text style={[styles.prepCardName, isCompleted && styles.prepCardNameCompleted]}>
              {item.title}
            </Text>
          </View>
          <View style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(item.difficulty) }
          ]}>
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </View>

        <View style={styles.prepCardDetails}>
          <View style={styles.prepDetail}>
            <Ionicons name="time" size={16} color="#6b7280" />
            <Text style={styles.prepDetailText}>{item.prepTime} min</Text>
          </View>
          <View style={styles.prepDetail}>
            <Ionicons name="people" size={16} color="#6b7280" />
            <Text style={styles.prepDetailText}>{item.servings} servings</Text>
          </View>
          <View style={styles.prepDetail}>
            <Ionicons name="nutrition" size={16} color="#6b7280" />
            <Text style={styles.prepDetailText}>{item.calories} cal</Text>
          </View>
        </View>

        <View style={styles.prepCardFooter}>
          <Text style={styles.prepCategory}>{item.category}</Text>
          <Text style={styles.prepProtein}>{item.protein}g protein</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#d1fae5';
      case 'medium': return '#fef3c7';
      case 'hard': return '#fee2e2';
      default: return '#f3f4f6';
    }
  };

  const renderWeekDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    
    return (
      <View style={styles.weekDays}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayButton,
              selectedDay === index && styles.dayButtonSelected,
              index === today && styles.dayButtonToday,
            ]}
            onPress={() => setSelectedDay(index)}
          >
            <Text style={[
              styles.dayText,
              selectedDay === index && styles.dayTextSelected,
              index === today && styles.dayTextToday,
            ]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const mockPrepCards: PrepCard[] = [
    {
      id: '1',
      title: 'Protein Overnight Oats (7 servings)',
      prepTime: 15,
      servings: 7,
      difficulty: 'easy',
      category: 'Breakfast Prep',
      calories: 350,
      protein: 25,
      status: 'planned',
    },
    {
      id: '2', 
      title: 'Chicken & Quinoa Bowl Batch',
      prepTime: 45,
      servings: 12,
      difficulty: 'medium',
      category: 'Lunch/Dinner Prep',
      calories: 520,
      protein: 45,
      status: 'planned',
    },
    {
      id: '3',
      title: 'Roasted Vegetable Mix',
      prepTime: 20,
      servings: 8,
      difficulty: 'easy',
      category: 'Side Prep',
      calories: 120,
      protein: 4,
      status: 'in_progress',
    },
    {
      id: '4',
      title: 'Protein Energy Balls',
      prepTime: 25,
      servings: 20,
      difficulty: 'easy',
      category: 'Snack Prep',
      calories: 180,
      protein: 8,
      status: 'planned',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#8b5cf6', '#7c3aed']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meal Prep Dashboard</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert('Add Recipe', 'Add custom meal prep recipe')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {mockPrepCards.filter(card => prepProgress[card.id]).length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {mockPrepCards.reduce((sum, card) => sum + card.servings, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Servings</Text>
            <Ionicons name="restaurant" size={20} color="#3b82f6" />
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.round(mockPrepCards.reduce((sum, card) => sum + card.prepTime, 0) / 60 * 10) / 10}h
            </Text>
            <Text style={styles.statLabel}>Prep Time</Text>
            <Ionicons name="time" size={20} color="#f59e0b" />
          </View>
        </View>

        {/* Week Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          {renderWeekDays()}
        </View>

        {/* Today's Meals Preview */}
        {currentWeekPlan && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Meals</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('SmartNutrition')}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.mealsPreview}>
              {currentWeekPlan.dailyPlans[selectedDay]?.meals.slice(0, 3).map((meal, index) => (
                <View key={index} style={styles.mealPreviewCard}>
                  <View style={styles.mealPreviewHeader}>
                    <Text style={styles.mealPreviewType}>
                      {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                    </Text>
                    <Text style={styles.mealPreviewTime}>{meal.timing}</Text>
                  </View>
                  <Text style={styles.mealPreviewName}>{meal.recipe.name}</Text>
                  <View style={styles.mealPreviewNutrition}>
                    <Text style={styles.mealPreviewCalories}>
                      {meal.recipe.nutrition.calories} cal
                    </Text>
                    <Text style={styles.mealPreviewProtein}>
                      {meal.recipe.nutrition.protein}g protein
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Meal Prep Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Prep Tasks</Text>
            <TouchableOpacity
              onPress={() => Alert.alert('Filter', 'Filter prep tasks by category')}
            >
              <Ionicons name="filter" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={mockPrepCards}
            renderItem={renderPrepTaskCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Smart Suggestions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Suggestions</Text>
          
          <View style={styles.suggestionCard}>
            <View style={styles.suggestionHeader}>
              <Ionicons name="bulb" size={20} color="#f59e0b" />
              <Text style={styles.suggestionTitle}>Prep Optimization</Text>
            </View>
            <Text style={styles.suggestionText}>
              Combine your quinoa cooking for both lunch bowls and dinner sides 
              to save 15 minutes of prep time.
            </Text>
          </View>

          <View style={styles.suggestionCard}>
            <View style={styles.suggestionHeader}>
              <Ionicons name="leaf" size={20} color="#10b981" />
              <Text style={styles.suggestionTitle}>Ingredient Efficiency</Text>
            </View>
            <Text style={styles.suggestionText}>
              Use leftover roasted vegetables from Sunday's prep in Tuesday's 
              wrap for zero waste cooking.
            </Text>
          </View>

          <View style={styles.suggestionCard}>
            <View style={styles.suggestionHeader}>
              <Ionicons name="time" size={20} color="#8b5cf6" />
              <Text style={styles.suggestionTitle}>Time Management</Text>
            </View>
            <Text style={styles.suggestionText}>
              Start your overnight oats prep while vegetables are roasting 
              to maximize efficiency.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionBarButton}
          onPress={() => navigation.navigate('SmartNutrition')}
        >
          <Ionicons name="nutrition" size={20} color="#8b5cf6" />
          <Text style={styles.actionBarText}>Meal Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBarButton}
          onPress={() => navigation.navigate('AIFoodScanner')}
        >
          <Ionicons name="camera" size={20} color="#8b5cf6" />
          <Text style={styles.actionBarText}>Scan Food</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBarButton}
          onPress={() => Alert.alert('Grocery List', 'View optimized shopping list')}
        >
          <Ionicons name="list" size={20} color="#8b5cf6" />
          <Text style={styles.actionBarText}>Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dayButtonSelected: {
    backgroundColor: '#8b5cf6',
  },
  dayButtonToday: {
    backgroundColor: '#f3f4f6',
  },
  dayText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  dayTextSelected: {
    color: 'white',
  },
  dayTextToday: {
    color: '#8b5cf6',
  },
  mealsPreview: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealPreviewCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  mealPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealPreviewType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8b5cf6',
    textTransform: 'uppercase',
  },
  mealPreviewTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  mealPreviewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  mealPreviewNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mealPreviewCalories: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
  mealPreviewProtein: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  prepCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prepCardCompleted: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  prepCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  prepCardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  prepCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 12,
    flex: 1,
  },
  prepCardNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
  },
  prepCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  prepDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prepDetailText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  prepCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prepCategory: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  prepProtein: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  suggestionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  actionBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionBarButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionBarText: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '600',
    marginTop: 4,
  },
});
