import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import AdvancedNutritionService, { 
  NutritionGoals, 
  WeeklyMealPlan, 
  SmartGroceryList,
  FoodPhotoAnalysis 
} from '../../services/AdvancedNutritionService';
import { User } from '../../types';

const { width } = Dimensions.get('window');

interface SmartNutritionScreenProps {
  navigation: any;
}

interface MacroCard {
  name: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  icon: string;
}

export default function SmartNutritionScreen({ navigation }: SmartNutritionScreenProps) {
  const { userId } = useSelector((state: RootState) => state.auth);
  
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan | null>(null);
  const [groceryList, setGroceryList] = useState<SmartGroceryList | null>(null);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals>({
    primary: 'muscle_gain',
    timeline: 'moderate',
    dietaryRestrictions: [],
    allergies: [],
    preferences: [],
    macroStrategy: 'balanced',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showPhotoAnalysis, setShowPhotoAnalysis] = useState(false);
  const [photoAnalysis, setPhotoAnalysis] = useState<FoodPhotoAnalysis | null>(null);
  const [weeklyBudget, setWeeklyBudget] = useState('100');

  // Mock user for demo
  const mockUser: User = {
    id: userId || 'demo-user',
    email: 'demo@example.com',
    name: 'Demo User',
    age: 28,
    height: 175,
    weight: 75,
    gender: 'male',
    fitnessLevel: 'intermediate',
    goals: [],
    preferredWorkoutDays: 4,
    preferredWorkoutDuration: 60,
    joinDate: new Date(),
    lastLogin: new Date(),
    physicalLimitations: [],
    createdAt: new Date(),
  };

  useEffect(() => {
    // Auto-generate initial meal plan
    generateMealPlan();
  }, []);

  const generateMealPlan = async () => {
    setIsGenerating(true);
    try {
      const nutritionService = AdvancedNutritionService.getInstance();
      const plan = await nutritionService.generateSmartMealPlan(
        mockUser,
        nutritionGoals,
        'week',
        parseFloat(weeklyBudget)
      );
      setMealPlan(plan);
      if (plan.shoppingLists.length > 0) {
        setGroceryList(plan.shoppingLists[0]);
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
      Alert.alert('Error', 'Failed to generate meal plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeFoodPhoto = async () => {
    try {
      const nutritionService = AdvancedNutritionService.getInstance();
      // In a real app, this would use camera/image picker
      const analysis = await nutritionService.analyzeFoodPhoto('mock://food-image.jpg');
      setPhotoAnalysis(analysis);
      setShowPhotoAnalysis(true);
    } catch (error) {
      console.error('Error analyzing photo:', error);
      Alert.alert('Error', 'Failed to analyze food photo.');
    }
  };

  const calculateNutritionTargets = async () => {
    try {
      const nutritionService = AdvancedNutritionService.getInstance();
      const targets = await nutritionService.calculateNutritionTargets(mockUser, nutritionGoals);
      return targets;
    } catch (error) {
      console.error('Error calculating targets:', error);
      return null;
    }
  };

  const macroCards: MacroCard[] = mealPlan?.weeklyTargets ? [
    {
      name: 'Calories',
      current: mealPlan.dailyPlans[0]?.totalNutrition.calories || 0,
      target: mealPlan.weeklyTargets.calories,
      unit: 'kcal',
      color: '#667eea',
      icon: 'flame',
    },
    {
      name: 'Protein',
      current: mealPlan.dailyPlans[0]?.totalNutrition.protein || 0,
      target: mealPlan.weeklyTargets.protein,
      unit: 'g',
      color: '#ef4444',
      icon: 'barbell',
    },
    {
      name: 'Carbs',
      current: mealPlan.dailyPlans[0]?.totalNutrition.carbs || 0,
      target: mealPlan.weeklyTargets.carbs,
      unit: 'g',
      color: '#f59e0b',
      icon: 'nutrition',
    },
    {
      name: 'Fat',
      current: mealPlan.dailyPlans[0]?.totalNutrition.fat || 0,
      target: mealPlan.weeklyTargets.fat,
      unit: 'g',
      color: '#10b981',
      icon: 'water',
    },
  ] : [];

  const renderMacroCard = (macro: MacroCard) => {
    const percentage = (macro.current / macro.target) * 100;
    return (
      <View key={macro.name} style={styles.macroCard}>
        <View style={styles.macroHeader}>
          <Ionicons name={macro.icon as any} size={20} color={macro.color} />
          <Text style={styles.macroName}>{macro.name}</Text>
        </View>
        <Text style={[styles.macroValue, { color: macro.color }]}>
          {macro.current.toFixed(0)}
        </Text>
        <Text style={styles.macroTarget}>/ {macro.target.toFixed(0)} {macro.unit}</Text>
        <View style={styles.macroProgress}>
          <View 
            style={[
              styles.macroProgressFill,
              { width: `${Math.min(percentage, 100)}%`, backgroundColor: macro.color }
            ]} 
          />
        </View>
        <Text style={styles.macroPercentage}>{percentage.toFixed(0)}%</Text>
      </View>
    );
  };

  const renderMealCard = (meal: any, index: number) => (
    <TouchableOpacity 
      key={index} 
      style={styles.mealCard}
      onPress={() => Alert.alert(meal.recipe.name, meal.recipe.description)}
    >
      <View style={styles.mealImageContainer}>
        <View style={styles.mealImagePlaceholder}>
          <Ionicons name="restaurant" size={32} color="#d1d5db" />
        </View>
        <View style={styles.mealTimeContainer}>
          <Text style={styles.mealTime}>{meal.timing}</Text>
        </View>
      </View>
      <View style={styles.mealContent}>
        <Text style={styles.mealName}>{meal.recipe.name}</Text>
        <Text style={styles.mealType}>{meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}</Text>
        <View style={styles.mealNutrition}>
          <Text style={styles.mealCalories}>{meal.recipe.nutrition.calories} cal</Text>
          <Text style={styles.mealMacro}>P: {meal.recipe.nutrition.protein}g</Text>
          <Text style={styles.mealMacro}>C: {meal.recipe.nutrition.carbs}g</Text>
          <Text style={styles.mealMacro}>F: {meal.recipe.nutrition.fat}g</Text>
        </View>
      </View>
      <View style={styles.mealActions}>
        <TouchableOpacity style={styles.mealActionButton}>
          <Ionicons name="heart-outline" size={20} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mealActionButton}>
          <Ionicons name="share-outline" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#10b981', '#059669']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smart Nutrition</Text>
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={analyzeFoodPhoto}
        >
          <Ionicons name="camera" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={() => setShowGoalsModal(true)}
          >
            <Ionicons name="settings" size={20} color="white" />
            <Text style={styles.actionButtonText}>Set Goals</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryAction]}
            onPress={generateMealPlan}
            disabled={isGenerating}
          >
            <Ionicons 
              name={isGenerating ? 'refresh' : 'restaurant'} 
              size={20} 
              color="#10b981" 
            />
            <Text style={[styles.actionButtonText, styles.secondaryActionText]}>
              {isGenerating ? 'Generating...' : 'New Plan'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Macro Overview */}
        {mealPlan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Nutrition Targets</Text>
            <View style={styles.macroGrid}>
              {macroCards.map(renderMacroCard)}
            </View>
          </View>
        )}

        {/* Today's Meals */}
        {mealPlan && mealPlan.dailyPlans.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Meals</Text>
              <TouchableOpacity
                onPress={() => Alert.alert('Meal Plan', 'View full week meal plan')}
              >
                <Text style={styles.viewAllText}>View Week</Text>
              </TouchableOpacity>
            </View>
            {mealPlan.dailyPlans[0].meals.map(renderMealCard)}
          </View>
        )}

        {/* Smart Grocery List */}
        {groceryList && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Smart Grocery List</Text>
              <TouchableOpacity
                onPress={() => Alert.alert('Grocery List', `Total: $${groceryList.totalCost.toFixed(2)}`)}
              >
                <Text style={styles.costText}>${groceryList.totalCost.toFixed(2)}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.groceryCard}>
              <View style={styles.groceryHeader}>
                <Ionicons name="storefront" size={24} color="#10b981" />
                <Text style={styles.groceryStoreName}>
                  {groceryList.storeOptimization.recommendedStores[0]?.name || 'Recommended Store'}
                </Text>
              </View>
              
              <View style={styles.groceryStats}>
                <View style={styles.groceryStat}>
                  <Text style={styles.groceryStatValue}>{groceryList.items.length}</Text>
                  <Text style={styles.groceryStatLabel}>Items</Text>
                </View>
                <View style={styles.groceryStat}>
                  <Text style={styles.groceryStatValue}>
                    {groceryList.storeOptimization.timeEstimate}min
                  </Text>
                  <Text style={styles.groceryStatLabel}>Shop Time</Text>
                </View>
                <View style={styles.groceryStat}>
                  <Text style={styles.groceryStatValue}>
                    {groceryList.sustainabilityScore.toFixed(1)}
                  </Text>
                  <Text style={styles.groceryStatLabel}>Eco Score</Text>
                </View>
              </View>

              <View style={styles.groceryActions}>
                <TouchableOpacity style={styles.groceryActionButton}>
                  <Ionicons name="list" size={16} color="#10b981" />
                  <Text style={styles.groceryActionText}>View List</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.groceryActionButton}>
                  <Ionicons name="car" size={16} color="#10b981" />
                  <Text style={styles.groceryActionText}>Pickup</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.groceryActionButton}>
                  <Ionicons name="bicycle" size={16} color="#10b981" />
                  <Text style={styles.groceryActionText}>Delivery</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* AI Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Nutrition Insights</Text>
          
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons name="bulb" size={20} color="#f59e0b" />
              <Text style={styles.insightTitle}>Meal Timing Optimization</Text>
            </View>
            <Text style={styles.insightText}>
              Based on your workout schedule, consider having your largest meal post-workout 
              to maximize muscle protein synthesis.
            </Text>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons name="analytics" size={20} color="#8b5cf6" />
              <Text style={styles.insightTitle}>Macro Balance</Text>
            </View>
            <Text style={styles.insightText}>
              Your current protein intake is optimal for muscle gain. Consider adding 
              complex carbs before training for better performance.
            </Text>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons name="leaf" size={20} color="#10b981" />
              <Text style={styles.insightTitle}>Micronutrient Focus</Text>
            </View>
            <Text style={styles.insightText}>
              Add more dark leafy greens to boost iron and magnesium intake. 
              Consider vitamin D supplementation.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Goals Modal */}
      <Modal
        visible={showGoalsModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.goalsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nutrition Goals</Text>
              <TouchableOpacity onPress={() => setShowGoalsModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.goalSection}>
                <Text style={styles.goalSectionTitle}>Primary Goal</Text>
                <View style={styles.goalOptions}>
                  {[
                    { key: 'weight_loss', label: 'Weight Loss', icon: 'trending-down' },
                    { key: 'muscle_gain', label: 'Muscle Gain', icon: 'barbell' },
                    { key: 'maintenance', label: 'Maintenance', icon: 'analytics' },
                    { key: 'performance', label: 'Performance', icon: 'flash' },
                  ].map((goal) => (
                    <TouchableOpacity
                      key={goal.key}
                      style={[
                        styles.goalOption,
                        nutritionGoals.primary === goal.key && styles.goalOptionSelected
                      ]}
                      onPress={() => setNutritionGoals(prev => ({ ...prev, primary: goal.key as any }))}
                    >
                      <Ionicons 
                        name={goal.icon as any} 
                        size={20} 
                        color={nutritionGoals.primary === goal.key ? '#10b981' : '#6b7280'} 
                      />
                      <Text style={[
                        styles.goalOptionText,
                        nutritionGoals.primary === goal.key && styles.goalOptionTextSelected
                      ]}>
                        {goal.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.goalSection}>
                <Text style={styles.goalSectionTitle}>Timeline</Text>
                <View style={styles.goalOptions}>
                  {[
                    { key: 'conservative', label: 'Conservative' },
                    { key: 'moderate', label: 'Moderate' },
                    { key: 'aggressive', label: 'Aggressive' },
                  ].map((timeline) => (
                    <TouchableOpacity
                      key={timeline.key}
                      style={[
                        styles.goalOption,
                        nutritionGoals.timeline === timeline.key && styles.goalOptionSelected
                      ]}
                      onPress={() => setNutritionGoals(prev => ({ ...prev, timeline: timeline.key as any }))}
                    >
                      <Text style={[
                        styles.goalOptionText,
                        nutritionGoals.timeline === timeline.key && styles.goalOptionTextSelected
                      ]}>
                        {timeline.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.goalSection}>
                <Text style={styles.goalSectionTitle}>Weekly Budget</Text>
                <TextInput
                  style={styles.budgetInput}
                  value={weeklyBudget}
                  onChangeText={setWeeklyBudget}
                  placeholder="Enter weekly grocery budget"
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                setShowGoalsModal(false);
                generateMealPlan();
              }}
            >
              <Text style={styles.applyButtonText}>Apply Goals</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Photo Analysis Modal */}
      <Modal
        visible={showPhotoAnalysis}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.photoModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Food Analysis</Text>
              <TouchableOpacity onPress={() => setShowPhotoAnalysis(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {photoAnalysis && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.photoResult}>
                  <Text style={styles.detectedFood}>
                    Detected: {photoAnalysis.detectedFoods[0]?.name || 'Unknown Food'}
                  </Text>
                  <Text style={styles.confidence}>
                    Confidence: {(photoAnalysis.confidence * 100).toFixed(0)}%
                  </Text>
                  
                  <View style={styles.nutritionSummary}>
                    <Text style={styles.nutritionTitle}>Estimated Nutrition:</Text>
                    <Text style={styles.nutritionDetail}>
                      Calories: {photoAnalysis.estimatedNutrition.calories}
                    </Text>
                    <Text style={styles.nutritionDetail}>
                      Protein: {photoAnalysis.estimatedNutrition.protein}g
                    </Text>
                    <Text style={styles.nutritionDetail}>
                      Carbs: {photoAnalysis.estimatedNutrition.carbs}g
                    </Text>
                    <Text style={styles.nutritionDetail}>
                      Fat: {photoAnalysis.estimatedNutrition.fat}g
                    </Text>
                  </View>

                  {photoAnalysis.suggestions.length > 0 && (
                    <View style={styles.suggestions}>
                      <Text style={styles.suggestionsTitle}>Suggestions:</Text>
                      {photoAnalysis.suggestions.map((suggestion, index) => (
                        <Text key={index} style={styles.suggestion}>
                          • {suggestion.message}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.addToLogButton}
              onPress={() => {
                setShowPhotoAnalysis(false);
                Alert.alert('Added to Log', 'Food has been added to your nutrition log');
              }}
            >
              <Text style={styles.addToLogButtonText}>Add to Food Log</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  cameraButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  primaryAction: {
    backgroundColor: '#10b981',
  },
  secondaryAction: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryActionText: {
    color: '#10b981',
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
    color: '#10b981',
    fontWeight: '600',
  },
  costText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  macroCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: (width - 52) / 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginLeft: 8,
  },
  macroValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  macroTarget: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  macroProgress: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  macroProgressFill: {
    height: '100%',
  },
  macroPercentage: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  mealCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  mealImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealTimeContainer: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mealTime: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  mealContent: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  mealType: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  mealNutrition: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mealCalories: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
    marginRight: 12,
    marginBottom: 4,
  },
  mealMacro: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 8,
    marginBottom: 4,
  },
  mealActions: {
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  mealActionButton: {
    padding: 8,
  },
  groceryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groceryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  groceryStoreName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 12,
  },
  groceryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  groceryStat: {
    alignItems: 'center',
  },
  groceryStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  groceryStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  groceryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  groceryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
  },
  groceryActionText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 4,
  },
  insightCard: {
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
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalsModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: '80%',
  },
  photoModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  goalSection: {
    marginBottom: 24,
  },
  goalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  goalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  goalOptionSelected: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  goalOptionText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  goalOptionTextSelected: {
    color: '#10b981',
    fontWeight: '600',
  },
  budgetInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  applyButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    margin: 20,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoResult: {
    alignItems: 'center',
  },
  detectedFood: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  confidence: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  nutritionSummary: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  nutritionDetail: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  suggestions: {
    backgroundColor: '#fefce8',
    borderRadius: 8,
    padding: 16,
    width: '100%',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d97706',
    marginBottom: 8,
  },
  suggestion: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 4,
  },
  addToLogButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    margin: 20,
  },
  addToLogButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
