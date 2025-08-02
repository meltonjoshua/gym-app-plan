import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { addWorkoutPlan } from '../../store/slices/workoutSlice';
import { Exercise, Workout, WorkoutExercise, WorkoutPlan } from '../../types';

const { width } = Dimensions.get('window');

interface WorkoutBuilderScreenProps {
  navigation: any;
}

interface SelectedExercise extends WorkoutExercise {
  exercise: Exercise;
}

export default function WorkoutBuilderScreen({ navigation }: WorkoutBuilderScreenProps) {
  const dispatch = useDispatch();
  const { exercises } = useSelector((state: RootState) => state.workouts);
  
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All', icon: 'grid' },
    { id: 'strength', name: 'Strength', icon: 'barbell' },
    { id: 'cardio', name: 'Cardio', icon: 'heart' },
    { id: 'flexibility', name: 'Flexibility', icon: 'body' },
    { id: 'core', name: 'Core', icon: 'fitness' },
  ];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addExerciseToWorkout = (exercise: Exercise) => {
    const newWorkoutExercise: SelectedExercise = {
      exerciseId: exercise.id,
      sets: 3,
      reps: 12,
      weight: 0,
      restTime: 60,
      exercise: exercise,
    };
    
    setSelectedExercises(prev => [...prev, newWorkoutExercise]);
    setShowExerciseModal(false);
  };

  const removeExerciseFromWorkout = (index: number) => {
    setSelectedExercises(prev => prev.filter((_, i) => i !== index));
  };

  const updateExerciseParameter = (index: number, field: keyof WorkoutExercise, value: number) => {
    setSelectedExercises(prev => 
      prev.map((exercise, i) => 
        i === index ? { ...exercise, [field]: value } : exercise
      )
    );
  };

  const calculateWorkoutDuration = () => {
    return selectedExercises.reduce((total, exercise) => {
      const exerciseTime = (exercise.duration || 30) * (exercise.sets || 1);
      const restTime = (exercise.restTime || 60) * (exercise.sets || 1);
      return total + exerciseTime + restTime;
    }, 0);
  };

  const saveWorkout = () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    const newWorkout: Workout = {
      id: `workout_${Date.now()}`,
      name: workoutName,
      description: workoutDescription,
      exercises: selectedExercises.map(({ exercise, ...rest }) => rest),
      estimatedDuration: Math.round(calculateWorkoutDuration() / 60), // Convert to minutes
      difficulty: determineDifficulty(),
      category: determineCategory(),
    };

    const newWorkoutPlan: WorkoutPlan = {
      id: `plan_${Date.now()}`,
      name: workoutName,
      description: workoutDescription,
      duration: 1, // Single workout plan
      difficulty: determineDifficulty(),
      goal: 'custom',
      workoutsPerWeek: 1,
      estimatedTimePerWorkout: Math.round(calculateWorkoutDuration() / 60),
      workouts: [newWorkout],
      isCustom: true,
    };

    dispatch(addWorkoutPlan(newWorkoutPlan));
    
    Alert.alert(
      'Success!',
      'Your workout has been saved successfully.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const determineDifficulty = (): 'beginner' | 'intermediate' | 'advanced' => {
    const avgDifficulty = selectedExercises.reduce((sum, exercise) => {
      const difficultyScore = exercise.exercise.difficulty === 'beginner' ? 1 :
                             exercise.exercise.difficulty === 'intermediate' ? 2 : 3;
      return sum + difficultyScore;
    }, 0) / selectedExercises.length;

    if (avgDifficulty <= 1.5) return 'beginner';
    if (avgDifficulty <= 2.5) return 'intermediate';
    return 'advanced';
  };

  const determineCategory = () => {
    const categoryCount: Record<string, number> = {};
    selectedExercises.forEach(exercise => {
      categoryCount[exercise.exercise.category] = (categoryCount[exercise.exercise.category] || 0) + 1;
    });

    return Object.keys(categoryCount).reduce((a, b) => 
      categoryCount[a] > categoryCount[b] ? a : b, 'strength'
    ) as any;
  };

  const renderExerciseInWorkout = (selectedExercise: SelectedExercise, index: number) => (
    <View key={index} style={styles.workoutExerciseCard}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{selectedExercise.exercise.name}</Text>
        <TouchableOpacity
          onPress={() => removeExerciseFromWorkout(index)}
          style={styles.removeButton}
        >
          <Ionicons name="close-circle" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.exerciseParameters}>
        <View style={styles.parameterGroup}>
          <Text style={styles.parameterLabel}>Sets</Text>
          <View style={styles.parameterInput}>
            <TouchableOpacity
              onPress={() => updateExerciseParameter(index, 'sets', Math.max(1, (selectedExercise.sets || 1) - 1))}
              style={styles.parameterButton}
            >
              <Ionicons name="remove" size={16} color="#667eea" />
            </TouchableOpacity>
            <Text style={styles.parameterValue}>{selectedExercise.sets}</Text>
            <TouchableOpacity
              onPress={() => updateExerciseParameter(index, 'sets', (selectedExercise.sets || 1) + 1)}
              style={styles.parameterButton}
            >
              <Ionicons name="add" size={16} color="#667eea" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.parameterGroup}>
          <Text style={styles.parameterLabel}>
            {selectedExercise.exercise.duration ? 'Duration (s)' : 'Reps'}
          </Text>
          <View style={styles.parameterInput}>
            <TouchableOpacity
              onPress={() => {
                const field = selectedExercise.exercise.duration ? 'duration' : 'reps';
                const currentValue = selectedExercise[field] || (selectedExercise.exercise.duration ? 30 : 12);
                updateExerciseParameter(index, field, Math.max(1, currentValue - 1));
              }}
              style={styles.parameterButton}
            >
              <Ionicons name="remove" size={16} color="#667eea" />
            </TouchableOpacity>
            <Text style={styles.parameterValue}>
              {selectedExercise.exercise.duration ? 
                (selectedExercise.duration || 30) : 
                (selectedExercise.reps || 12)
              }
            </Text>
            <TouchableOpacity
              onPress={() => {
                const field = selectedExercise.exercise.duration ? 'duration' : 'reps';
                const currentValue = selectedExercise[field] || (selectedExercise.exercise.duration ? 30 : 12);
                updateExerciseParameter(index, field, currentValue + 1);
              }}
              style={styles.parameterButton}
            >
              <Ionicons name="add" size={16} color="#667eea" />
            </TouchableOpacity>
          </View>
        </View>

        {!selectedExercise.exercise.equipment?.includes('bodyweight') && (
          <View style={styles.parameterGroup}>
            <Text style={styles.parameterLabel}>Weight (lbs)</Text>
            <View style={styles.parameterInput}>
              <TouchableOpacity
                onPress={() => updateExerciseParameter(index, 'weight', Math.max(0, (selectedExercise.weight || 0) - 5))}
                style={styles.parameterButton}
              >
                <Ionicons name="remove" size={16} color="#667eea" />
              </TouchableOpacity>
              <Text style={styles.parameterValue}>{selectedExercise.weight || 0}</Text>
              <TouchableOpacity
                onPress={() => updateExerciseParameter(index, 'weight', (selectedExercise.weight || 0) + 5)}
                style={styles.parameterButton}
              >
                <Ionicons name="add" size={16} color="#667eea" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.parameterGroup}>
          <Text style={styles.parameterLabel}>Rest (s)</Text>
          <View style={styles.parameterInput}>
            <TouchableOpacity
              onPress={() => updateExerciseParameter(index, 'restTime', Math.max(0, (selectedExercise.restTime || 60) - 15))}
              style={styles.parameterButton}
            >
              <Ionicons name="remove" size={16} color="#667eea" />
            </TouchableOpacity>
            <Text style={styles.parameterValue}>{selectedExercise.restTime || 60}</Text>
            <TouchableOpacity
              onPress={() => updateExerciseParameter(index, 'restTime', (selectedExercise.restTime || 60) + 15)}
              style={styles.parameterButton}
            >
              <Ionicons name="add" size={16} color="#667eea" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Workout Builder</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveWorkout}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Workout Details */}
        <View style={styles.workoutDetailsCard}>
          <Text style={styles.sectionTitle}>Workout Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Workout Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter workout name"
              value={workoutName}
              onChangeText={setWorkoutName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe your workout"
              value={workoutDescription}
              onChangeText={setWorkoutDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Workout Summary */}
        <View style={styles.workoutSummaryCard}>
          <Text style={styles.sectionTitle}>Workout Summary</Text>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="fitness" size={20} color="#667eea" />
              <Text style={styles.summaryLabel}>Exercises</Text>
              <Text style={styles.summaryValue}>{selectedExercises.length}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Ionicons name="time" size={20} color="#10b981" />
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>{Math.round(calculateWorkoutDuration() / 60)}min</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Ionicons name="speedometer" size={20} color="#f59e0b" />
              <Text style={styles.summaryLabel}>Difficulty</Text>
              <Text style={styles.summaryValue}>{selectedExercises.length > 0 ? determineDifficulty() : '-'}</Text>
            </View>
          </View>
        </View>

        {/* Selected Exercises */}
        <View style={styles.exercisesSection}>
          <View style={styles.exercisesSectionHeader}>
            <Text style={styles.sectionTitle}>Exercises ({selectedExercises.length})</Text>
            <TouchableOpacity
              style={styles.addExerciseButton}
              onPress={() => setShowExerciseModal(true)}
            >
              <Ionicons name="add-circle" size={24} color="#667eea" />
              <Text style={styles.addExerciseText}>Add Exercise</Text>
            </TouchableOpacity>
          </View>

          {selectedExercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="barbell" size={64} color="#d1d5db" />
              <Text style={styles.emptyStateTitle}>No exercises added yet</Text>
              <Text style={styles.emptyStateText}>
                Tap "Add Exercise" to start building your workout
              </Text>
            </View>
          ) : (
            selectedExercises.map((exercise, index) => renderExerciseInWorkout(exercise, index))
          )}
        </View>
      </ScrollView>

      {/* Exercise Selection Modal */}
      <Modal
        visible={showExerciseModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowExerciseModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Exercise</Text>
            <View style={styles.headerSpace} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#9ca3af" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={selectedCategory === category.id ? 'white' : '#667eea'}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category.id && styles.categoryChipTextActive
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Exercise List */}
          <ScrollView style={styles.exerciseList}>
            {filteredExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseItem}
                onPress={() => addExerciseToWorkout(exercise)}
              >
                <View style={styles.exerciseIcon}>
                  <Ionicons name="fitness" size={24} color="#667eea" />
                </View>
                <View style={styles.exerciseDetails}>
                  <Text style={styles.exerciseItemName}>{exercise.name}</Text>
                  <Text style={styles.exerciseItemCategory}>{exercise.category}</Text>
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
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
    padding: 15,
  },
  workoutDetailsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutSummaryCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
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
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  exercisesSection: {
    flex: 1,
  },
  exercisesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addExerciseText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  workoutExerciseCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  removeButton: {
    padding: 4,
  },
  exerciseParameters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  parameterGroup: {
    alignItems: 'center',
    minWidth: 80,
  },
  parameterLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  parameterInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  parameterButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 6,
  },
  parameterValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    minWidth: 30,
    textAlign: 'center',
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
  cancelText: {
    fontSize: 16,
    color: '#667eea',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSpace: {
    width: 60,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  categoriesContainer: {
    backgroundColor: 'white',
    paddingBottom: 15,
  },
  categoriesContent: {
    paddingHorizontal: 15,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#667eea',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#667eea',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: 'white',
  },
  exerciseList: {
    flex: 1,
    padding: 15,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  exerciseItemCategory: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
});
