import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export default function NutritionScreen() {
  const { dailyGoals } = useSelector((state: RootState) => state.nutrition);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample daily intake data
  const dailyIntake = {
    calories: 1250,
    protein: 85,
    carbs: 120,
    fat: 35,
  };

  const getMealIcon = (meal: string) => {
    switch (meal) {
      case 'breakfast': return 'sunny';
      case 'lunch': return 'partly-sunny';
      case 'dinner': return 'moon';
      case 'snack': return 'cafe';
      default: return 'restaurant';
    }
  };

  const NutrientCard = ({ title, current, goal, unit, color }: any) => (
    <View style={styles.nutrientCard}>
      <Text style={styles.nutrientTitle}>{title}</Text>
      <Text style={[styles.nutrientValue, { color }]}>
        {current}/{goal}
      </Text>
      <Text style={styles.nutrientUnit}>{unit}</Text>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${Math.min((current / goal) * 100, 100)}%`, backgroundColor: color }
          ]} 
        />
      </View>
    </View>
  );

  const MealButton = ({ meal, isActive, onPress }: any) => (
    <TouchableOpacity
      style={[styles.mealButton, isActive && styles.activeMealButton]}
      onPress={onPress}
    >
      <Ionicons 
        name={getMealIcon(meal)} 
        size={20} 
        color={isActive ? '#fff' : '#667eea'} 
      />
      <Text style={[styles.mealButtonText, isActive && styles.activeMealButtonText]}>
        {meal.charAt(0).toUpperCase() + meal.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const handleAddFood = () => {
    Alert.alert('Add Food', 'Food logging feature coming soon!');
  };

  const handleScanBarcode = () => {
    Alert.alert('Scan Barcode', 'Barcode scanning feature coming soon!');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Nutrition Tracking</Text>
        <Text style={styles.headerSubtitle}>
          Monitor your daily intake
        </Text>
      </LinearGradient>

      {/* Daily Goals Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Progress</Text>
        <View style={styles.nutrientsContainer}>
          <NutrientCard
            title="Calories"
            current={dailyIntake.calories}
            goal={dailyGoals.calories}
            unit="kcal"
            color="#667eea"
          />
          <NutrientCard
            title="Protein"
            current={dailyIntake.protein}
            goal={dailyGoals.protein}
            unit="g"
            color="#52c41a"
          />
          <NutrientCard
            title="Carbs"
            current={dailyIntake.carbs}
            goal={dailyGoals.carbs}
            unit="g"
            color="#fa8c16"
          />
          <NutrientCard
            title="Fat"
            current={dailyIntake.fat}
            goal={dailyGoals.fat}
            unit="g"
            color="#f5222d"
          />
        </View>
      </View>

      {/* Meal Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Food</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.mealsContainer}
        >
          {['breakfast', 'lunch', 'dinner', 'snack'].map(meal => (
            <MealButton
              key={meal}
              meal={meal}
              isActive={selectedMeal === meal}
              onPress={() => setSelectedMeal(meal)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Search and Add Food */}
      <View style={styles.section}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={handleScanBarcode}>
            <Ionicons name="barcode" size={24} color="#667eea" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addFoodButton} onPress={handleAddFood}>
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.addFoodButtonText}>Add Food to {selectedMeal}</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Foods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Foods</Text>
        <TouchableOpacity style={styles.foodItem}>
          <View style={styles.foodInfo}>
            <Text style={styles.foodName}>Chicken Breast</Text>
            <Text style={styles.foodDetails}>100g • 165 cal • 31g protein</Text>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={20} color="#667eea" />
          </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity style={styles.foodItem}>
          <View style={styles.foodInfo}>
            <Text style={styles.foodName}>Brown Rice</Text>
            <Text style={styles.foodDetails}>100g • 112 cal • 2.6g protein</Text>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={20} color="#667eea" />
          </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity style={styles.foodItem}>
          <View style={styles.foodInfo}>
            <Text style={styles.foodName}>Greek Yogurt</Text>
            <Text style={styles.foodDetails}>150g • 130 cal • 15g protein</Text>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={20} color="#667eea" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="water" size={24} color="#667eea" />
          <Text style={styles.actionButtonText}>Log Water Intake</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="settings" size={24} color="#667eea" />
          <Text style={styles.actionButtonText}>Set Daily Goals</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  nutrientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutrientCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  nutrientTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  nutrientValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  nutrientUnit: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  mealsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  mealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  activeMealButton: {
    backgroundColor: '#667eea',
  },
  mealButtonText: {
    fontSize: 14,
    color: '#667eea',
    marginLeft: 5,
    fontWeight: '500',
  },
  activeMealButtonText: {
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  addFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 12,
  },
  addFoodButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  foodItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  foodDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    padding: 5,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 15,
  },
  bottomPadding: {
    height: 50,
  },
});