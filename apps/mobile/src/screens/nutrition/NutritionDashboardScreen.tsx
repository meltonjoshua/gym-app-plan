import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { addMealEntry, updateDailyGoals, addFood } from '../../store/slices/nutritionSlice';
import { Food, MealEntry, FoodEntry } from '../../types';

const { width } = Dimensions.get('window');

export default function NutritionDashboardScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { dailyGoals, meals, foods } = useSelector((state: RootState) => state.nutrition);
  const { userId } = useSelector((state: RootState) => state.auth);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showFoodSearchModal, setShowFoodSearchModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<FoodEntry[]>([]);

  // Sample food database
  const foodDatabase: Food[] = [
    {
      id: '1',
      name: 'Chicken Breast',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      servingSize: 100,
      servingUnit: 'g',
    },
    {
      id: '2',
      name: 'Brown Rice',
      calories: 111,
      protein: 2.6,
      carbs: 23,
      fat: 0.9,
      fiber: 1.8,
      servingSize: 100,
      servingUnit: 'g',
    },
    {
      id: '3',
      name: 'Broccoli',
      calories: 25,
      protein: 3,
      carbs: 5,
      fat: 0.4,
      fiber: 3,
      servingSize: 100,
      servingUnit: 'g',
    },
    {
      id: '4',
      name: 'Salmon',
      calories: 208,
      protein: 25,
      carbs: 0,
      fat: 12,
      fiber: 0,
      servingSize: 100,
      servingUnit: 'g',
    },
    {
      id: '5',
      name: 'Sweet Potato',
      calories: 86,
      protein: 1.6,
      carbs: 20,
      fat: 0.1,
      fiber: 3,
      servingSize: 100,
      servingUnit: 'g',
    },
    {
      id: '6',
      name: 'Greek Yogurt',
      calories: 59,
      protein: 10,
      carbs: 3.6,
      fat: 0.4,
      fiber: 0,
      servingSize: 100,
      servingUnit: 'g',
    },
    {
      id: '7',
      name: 'Avocado',
      calories: 160,
      protein: 2,
      carbs: 9,
      fat: 15,
      fiber: 7,
      servingSize: 100,
      servingUnit: 'g',
    },
    {
      id: '8',
      name: 'Eggs',
      calories: 155,
      protein: 13,
      carbs: 1.1,
      fat: 11,
      fiber: 0,
      servingSize: 100,
      servingUnit: 'g',
    },
    {
      id: '9',
      name: 'Oatmeal',
      calories: 68,
      protein: 2.4,
      carbs: 12,
      fat: 1.4,
      fiber: 1.7,
      servingSize: 100,
      servingUnit: 'g',
    },
    {
      id: '10',
      name: 'Banana',
      calories: 89,
      protein: 1.1,
      carbs: 23,
      fat: 0.3,
      fiber: 2.6,
      servingSize: 100,
      servingUnit: 'g',
    },
  ];

  const mealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = ['breakfast', 'lunch', 'dinner', 'snack'];

  const getFoodById = (id: string): Food | undefined => {
    return [...foodDatabase, ...foods].find(food => food.id === id);
  };

  const calculateTodaysTotals = () => {
    const today = new Date().toDateString();
    const todayMeals = meals.filter(meal => 
      new Date(meal.date).toDateString() === today
    );

    return todayMeals.reduce(
      (totals, meal) => ({
        calories: totals.calories + meal.totalCalories,
        protein: totals.protein + meal.totalProtein,
        carbs: totals.carbs + meal.totalCarbs,
        fat: totals.fat + meal.totalFat,
        fiber: totals.fiber + meal.foods.reduce((f, foodEntry) => {
          const food = getFoodById(foodEntry.foodId);
          return f + (food?.fiber || 0) * foodEntry.quantity;
        }, 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  };

  const todaysTotals = calculateTodaysTotals();

  const getMealsByType = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    const today = new Date().toDateString();
    return meals.filter(meal => 
      meal.mealType === type && 
      new Date(meal.date).toDateString() === today
    );
  };

  const addFoodToMeal = (food: Food, quantity: number) => {
    const foodEntry: FoodEntry = {
      foodId: food.id,
      quantity,
      unit: food.servingUnit,
    };
    setSelectedFoods(prev => [...prev, foodEntry]);
  };

  const removeFoodFromMeal = (index: number) => {
    setSelectedFoods(prev => prev.filter((_, i) => i !== index));
  };

  const saveMeal = () => {
    if (selectedFoods.length === 0) {
      Alert.alert('No Foods Selected', 'Please add at least one food item to your meal.');
      return;
    }

    const totals = selectedFoods.reduce(
      (acc, foodEntry) => {
        const food = getFoodById(foodEntry.foodId);
        if (food) {
          return {
            calories: acc.calories + (food.calories * foodEntry.quantity),
            protein: acc.protein + (food.protein * foodEntry.quantity),
            carbs: acc.carbs + (food.carbs * foodEntry.quantity),
            fat: acc.fat + (food.fat * foodEntry.quantity),
          };
        }
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const newMeal: MealEntry = {
      id: Date.now().toString(),
      userId: userId || 'demo-user',
      date: new Date(),
      mealType: selectedMealType,
      foods: selectedFoods,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
    };

    dispatch(addMealEntry(newMeal));
    setSelectedFoods([]);
    setShowAddMealModal(false);
    setShowFoodSearchModal(false);
  };

  const filteredFoods = foodDatabase.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMacroProgress = (current: number, goal: number, label: string, color: string) => {
    const percentage = Math.min((current / goal) * 100, 100);
    
    return (
      <View style={styles.macroItem}>
        <Text style={styles.macroLabel}>{label}</Text>
        <View style={styles.macroProgressContainer}>
          <View style={styles.macroProgressBar}>
            <View
              style={[
                styles.macroProgressFill,
                { width: `${percentage}%`, backgroundColor: color }
              ]}
            />
          </View>
          <Text style={styles.macroText}>
            {Math.round(current)}g / {goal}g
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nutrition Dashboard</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            Alert.alert('Settings', 'Nutrition settings coming soon!');
          }}
        >
          <Ionicons name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Daily Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          
          {/* Calories Progress */}
          <View style={styles.caloriesContainer}>
            <View style={styles.caloriesProgress}>
              <Text style={styles.caloriesNumber}>{Math.round(todaysTotals.calories)}</Text>
              <Text style={styles.caloriesLabel}>/ {dailyGoals.calories} cal</Text>
            </View>
            <View style={styles.caloriesBar}>
              <View
                style={[
                  styles.caloriesBarFill,
                  { width: `${Math.min((todaysTotals.calories / dailyGoals.calories) * 100, 100)}%` }
                ]}
              />
            </View>
            <Text style={styles.caloriesRemaining}>
              {Math.max(dailyGoals.calories - todaysTotals.calories, 0)} calories remaining
            </Text>
          </View>

          {/* Macros Progress */}
          <View style={styles.macrosContainer}>
            {renderMacroProgress(todaysTotals.protein, dailyGoals.protein, 'Protein', '#10b981')}
            {renderMacroProgress(todaysTotals.carbs, dailyGoals.carbs, 'Carbs', '#f59e0b')}
            {renderMacroProgress(todaysTotals.fat, dailyGoals.fat, 'Fat', '#ef4444')}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStatsCard}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.quickStatsGrid}>
            <View style={styles.quickStatItem}>
              <Ionicons name="water" size={24} color="#3b82f6" />
              <Text style={styles.quickStatNumber}>2.1L</Text>
              <Text style={styles.quickStatLabel}>Water</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Ionicons name="nutrition" size={24} color="#10b981" />
              <Text style={styles.quickStatNumber}>{Math.round(todaysTotals.fiber)}g</Text>
              <Text style={styles.quickStatLabel}>Fiber</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Ionicons name="restaurant" size={24} color="#f59e0b" />
              <Text style={styles.quickStatNumber}>{meals.filter(m => new Date(m.date).toDateString() === new Date().toDateString()).length}</Text>
              <Text style={styles.quickStatLabel}>Meals</Text>
            </View>
          </View>
        </View>

        {/* Meals */}
        <View style={styles.mealsSection}>
          <View style={styles.mealsHeader}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddMealModal(true)}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Add Meal</Text>
            </TouchableOpacity>
          </View>

          {mealTypes.map((mealType) => {
            const mealsByType = getMealsByType(mealType);
            const totalCalories = mealsByType.reduce((sum, meal) => sum + meal.totalCalories, 0);

            return (
              <View key={mealType} style={styles.mealTypeCard}>
                <View style={styles.mealTypeHeader}>
                  <Text style={styles.mealTypeName}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
                  <Text style={styles.mealTypeCalories}>{Math.round(totalCalories)} cal</Text>
                </View>
                
                {mealsByType.length > 0 ? (
                  mealsByType.map((meal) => (
                    <View key={meal.id} style={styles.mealItem}>
                      <View style={styles.mealInfo}>
                        <Text style={styles.mealTime}>
                          {new Date(meal.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                        <View style={styles.mealFoods}>
                          {meal.foods.map((foodEntry, index) => {
                            const food = getFoodById(foodEntry.foodId);
                            return (
                              <Text key={index} style={styles.mealFoodItem}>
                                {food?.name || 'Unknown'} ({foodEntry.quantity}x)
                              </Text>
                            );
                          })}
                        </View>
                      </View>
                      <Text style={styles.mealCalories}>{Math.round(meal.totalCalories)} cal</Text>
                    </View>
                  ))
                ) : (
                  <TouchableOpacity
                    style={styles.addMealButton}
                    onPress={() => {
                      setSelectedMealType(mealType);
                      setShowFoodSearchModal(true);
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#667eea" />
                    <Text style={styles.addMealText}>Add {mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Add Meal Modal */}
      <Modal
        visible={showAddMealModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddMealModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Meal</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            {mealTypes.map((mealType) => (
              <TouchableOpacity
                key={mealType}
                style={styles.mealTypeOption}
                onPress={() => {
                  setSelectedMealType(mealType);
                  setShowAddMealModal(false);
                  setShowFoodSearchModal(true);
                }}
              >
                <Ionicons 
                  name={
                    mealType === 'breakfast' ? 'sunny' :
                    mealType === 'lunch' ? 'partly-sunny' :
                    mealType === 'dinner' ? 'moon' : 'cafe'
                  } 
                  size={24} 
                  color="#667eea" 
                />
                <Text style={styles.mealTypeOptionText}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Food Search Modal */}
      <Modal
        visible={showFoodSearchModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowFoodSearchModal(false);
              setSelectedFoods([]);
            }}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add to {selectedMealType}</Text>
            <TouchableOpacity
              onPress={saveMeal}
              disabled={selectedFoods.length === 0}
            >
              <Text style={[styles.saveButton, selectedFoods.length === 0 && styles.saveButtonDisabled]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search foods..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Selected Foods */}
          {selectedFoods.length > 0 && (
            <View style={styles.selectedFoodsContainer}>
              <Text style={styles.selectedFoodsTitle}>Selected Foods:</Text>
              {selectedFoods.map((item, index) => {
                const food = getFoodById(item.foodId);
                return (
                  <View key={index} style={styles.selectedFoodItem}>
                    <Text style={styles.selectedFoodName}>
                      {food?.name || 'Unknown'} ({item.quantity}x)
                    </Text>
                    <TouchableOpacity onPress={() => removeFoodFromMeal(index)}>
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {/* Food List */}
          <ScrollView style={styles.foodList}>
            {filteredFoods.map((food) => (
              <TouchableOpacity
                key={food.id}
                style={styles.foodItem}
                onPress={() => addFoodToMeal(food, 1)}
              >
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <Text style={styles.foodDetails}>
                    {food.calories} cal, {food.protein}g protein per {food.servingSize}
                  </Text>
                </View>
                <Ionicons name="add-circle-outline" size={24} color="#667eea" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  settingsButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  caloriesContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  caloriesProgress: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  caloriesNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
  },
  caloriesLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 5,
  },
  caloriesBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  caloriesBarFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  caloriesRemaining: {
    fontSize: 14,
    color: '#6b7280',
  },
  macrosContainer: {
    gap: 15,
  },
  macroItem: {},
  macroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
  },
  macroProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  macroProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
  },
  macroProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  macroText: {
    fontSize: 12,
    color: '#6b7280',
    minWidth: 80,
  },
  quickStatsCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickStatItem: {
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  mealsSection: {
    margin: 15,
  },
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  mealTypeCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mealTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mealTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  mealTypeCalories: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  mealInfo: {
    flex: 1,
  },
  mealTime: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  mealFoods: {},
  mealFoodItem: {
    fontSize: 14,
    color: '#374151',
  },
  mealCalories: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  addMealText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  placeholder: {
    width: 24,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  mealTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    gap: 15,
  },
  mealTypeOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  selectedFoodsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
  },
  selectedFoodsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  selectedFoodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  selectedFoodName: {
    fontSize: 14,
    color: '#1f2937',
  },
  foodList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  foodDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  saveButton: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    color: '#9ca3af',
  },
});
