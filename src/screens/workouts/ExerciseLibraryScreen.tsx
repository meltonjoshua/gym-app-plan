import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setExercises } from '../../store/slices/workoutSlice';
import { Exercise } from '../../types';

const { width } = Dimensions.get('window');

interface ExerciseLibraryScreenProps {
  navigation: any;
}

export default function ExerciseLibraryScreen({ navigation }: ExerciseLibraryScreenProps) {
  const dispatch = useDispatch();
  const { exercises } = useSelector((state: RootState) => state.workouts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const categories = [
    { id: 'all', name: 'All', icon: 'grid', color: '#667eea' },
    { id: 'strength', name: 'Strength', icon: 'barbell', color: '#ef4444' },
    { id: 'cardio', name: 'Cardio', icon: 'heart', color: '#10b981' },
    { id: 'flexibility', name: 'Flexibility', icon: 'body', color: '#f59e0b' },
    { id: 'core', name: 'Core', icon: 'fitness', color: '#8b5cf6' },
    { id: 'balance', name: 'Balance', icon: 'balance', color: '#06b6d4' },
  ];

  const sampleExercises: Exercise[] = [
    {
      id: 'ex1',
      name: 'Push-ups',
      category: 'strength',
      difficulty: 'beginner',
      muscleGroups: ['chest', 'triceps', 'shoulders'],
      equipment: ['bodyweight'],
      description: 'A classic bodyweight exercise that targets the chest, triceps, and shoulders.',
      instructions: [
        'Start in a plank position with hands shoulder-width apart',
        'Lower your body until chest nearly touches the floor',
        'Push back up to starting position',
        'Keep your body in a straight line throughout the movement'
      ],
      imageUrl: undefined,
      videoUrl: undefined,
      duration: undefined,
      caloriesPerMinute: 8,
      tips: [
        'Keep your core engaged',
        'Don\'t let your hips sag',
        'Control the movement',
        'Breathe out as you push up'
      ]
    },
    {
      id: 'ex2',
      name: 'Squats',
      category: 'strength',
      difficulty: 'beginner',
      muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
      equipment: ['bodyweight'],
      description: 'A fundamental lower body exercise that builds strength and power.',
      instructions: [
        'Stand with feet shoulder-width apart',
        'Lower your body as if sitting back into a chair',
        'Keep your knees behind your toes',
        'Push through your heels to return to starting position'
      ],
      imageUrl: undefined,
      videoUrl: undefined,
      duration: undefined,
      caloriesPerMinute: 6,
      tips: [
        'Keep your chest up',
        'Don\'t let knees cave inward',
        'Go as deep as mobility allows',
        'Keep weight in your heels'
      ]
    },
    {
      id: 'ex3',
      name: 'Plank',
      category: 'core',
      difficulty: 'beginner',
      muscleGroups: ['core', 'shoulders'],
      equipment: ['bodyweight'],
      description: 'An isometric core exercise that builds stability and endurance.',
      instructions: [
        'Start in a push-up position',
        'Lower onto your forearms',
        'Keep your body in a straight line',
        'Hold the position while breathing normally'
      ],
      imageUrl: undefined,
      videoUrl: undefined,
      duration: 60,
      caloriesPerMinute: 4,
      tips: [
        'Don\'t let hips sag or pike up',
        'Keep breathing steady',
        'Engage your glutes',
        'Focus on form over time'
      ]
    },
    {
      id: 'ex4',
      name: 'Burpees',
      category: 'cardio',
      difficulty: 'intermediate',
      muscleGroups: ['fullBody'],
      equipment: ['bodyweight'],
      description: 'A high-intensity full-body exercise that combines strength and cardio.',
      instructions: [
        'Start standing upright',
        'Drop into a squat and place hands on floor',
        'Jump feet back into plank position',
        'Do a push-up (optional)',
        'Jump feet back to squat position',
        'Jump up with arms overhead'
      ],
      imageUrl: undefined,
      videoUrl: undefined,
      duration: undefined,
      caloriesPerMinute: 12,
      tips: [
        'Start slow and build speed',
        'Modify by stepping instead of jumping',
        'Keep core engaged throughout',
        'Land softly on your feet'
      ]
    },
    {
      id: 'ex5',
      name: 'Mountain Climbers',
      category: 'cardio',
      difficulty: 'intermediate',
      muscleGroups: ['core', 'shoulders', 'legs'],
      equipment: ['bodyweight'],
      description: 'A dynamic exercise that targets core and provides cardiovascular benefits.',
      instructions: [
        'Start in a plank position',
        'Bring one knee toward your chest',
        'Quickly switch legs',
        'Continue alternating at a rapid pace',
        'Keep your hips level'
      ],
      imageUrl: undefined,
      videoUrl: undefined,
      duration: undefined,
      caloriesPerMinute: 10,
      tips: [
        'Keep your core tight',
        'Don\'t bounce your hips',
        'Maintain plank position',
        'Start slow then increase speed'
      ]
    },
    {
      id: 'ex6',
      name: 'Deadlifts',
      category: 'strength',
      difficulty: 'intermediate',
      muscleGroups: ['hamstrings', 'glutes', 'back'],
      equipment: ['weights'],
      description: 'A compound exercise that targets the posterior chain and builds overall strength.',
      instructions: [
        'Stand with feet hip-width apart, bar over mid-foot',
        'Bend at hips and knees to grip the bar',
        'Keep chest up and back straight',
        'Drive through heels to lift the bar',
        'Stand tall, then lower with control'
      ],
      imageUrl: undefined,
      videoUrl: undefined,
      duration: undefined,
      caloriesPerMinute: 7,
      tips: [
        'Keep the bar close to your body',
        'Don\'t round your back',
        'Engage your lats',
        'Drive through your heels'
      ]
    },
    {
      id: 'ex7',
      name: 'Yoga Flow',
      category: 'flexibility',
      difficulty: 'beginner',
      muscleGroups: ['fullBody'],
      equipment: ['yoga mat'],
      description: 'A gentle flowing sequence that improves flexibility and mindfulness.',
      instructions: [
        'Start in mountain pose',
        'Flow through sun salutation sequence',
        'Hold each pose for 3-5 breaths',
        'Move slowly and mindfully',
        'End in child\'s pose'
      ],
      imageUrl: undefined,
      videoUrl: undefined,
      duration: 900, // 15 minutes
      caloriesPerMinute: 3,
      tips: [
        'Focus on your breath',
        'Don\'t force the poses',
        'Listen to your body',
        'Use props if needed'
      ]
    },
    {
      id: 'ex8',
      name: 'Single-Leg Stand',
      category: 'balance',
      difficulty: 'beginner',
      muscleGroups: ['legs', 'core'],
      equipment: ['bodyweight'],
      description: 'A simple balance exercise that improves stability and proprioception.',
      instructions: [
        'Stand on one foot',
        'Keep the other foot slightly off the ground',
        'Hold for 30 seconds',
        'Switch legs and repeat',
        'Keep your core engaged'
      ],
      imageUrl: undefined,
      videoUrl: undefined,
      duration: 60,
      caloriesPerMinute: 2,
      tips: [
        'Start with eyes open',
        'Progress to eyes closed',
        'Use a wall for support if needed',
        'Focus on a fixed point'
      ]
    }
  ];

  useEffect(() => {
    if (exercises.length === 0) {
      dispatch(setExercises(sampleExercises));
    }
  }, []);

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.muscleGroups.some(muscle => 
                           muscle.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength': return 'barbell';
      case 'cardio': return 'heart';
      case 'flexibility': return 'body';
      case 'core': return 'fitness';
      case 'balance': return 'balance';
      default: return 'fitness';
    }
  };

  const showExerciseDetail = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowDetailModal(true);
  };

  const renderExerciseCard = (exercise: Exercise) => (
    <TouchableOpacity
      key={exercise.id}
      style={styles.exerciseCard}
      onPress={() => showExerciseDetail(exercise)}
    >
      <View style={styles.exerciseImageContainer}>
        <View style={styles.exerciseImagePlaceholder}>
          <Ionicons name={getCategoryIcon(exercise.category) as any} size={32} color="#667eea" />
        </View>
        <View style={styles.exerciseBadges}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty) }]}>
            <Text style={styles.difficultyText}>{exercise.difficulty}</Text>
          </View>
          <View style={styles.calorieBadge}>
            <Ionicons name="flame" size={12} color="#ef4444" />
            <Text style={styles.calorieText}>{exercise.caloriesPerMinute}/min</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseDescription} numberOfLines={2}>
          {exercise.description}
        </Text>
        
        <View style={styles.exerciseDetails}>
          <View style={styles.muscleGroups}>
            {exercise.muscleGroups.slice(0, 2).map((muscle, index) => (
              <View key={index} style={styles.muscleTag}>
                <Text style={styles.muscleTagText}>{muscle}</Text>
              </View>
            ))}
            {exercise.muscleGroups.length > 2 && (
              <Text style={styles.moreText}>+{exercise.muscleGroups.length - 2}</Text>
            )}
          </View>
          
          <View style={styles.exerciseFooter}>
            <View style={styles.equipmentInfo}>
              <Ionicons name="build" size={14} color="#6b7280" />
              <Text style={styles.equipmentText}>
                {exercise.equipment.includes('bodyweight') ? 'No equipment' : exercise.equipment.join(', ')}
              </Text>
            </View>
            {exercise.duration && (
              <View style={styles.durationInfo}>
                <Ionicons name="time" size={14} color="#6b7280" />
                <Text style={styles.durationText}>
                  {exercise.duration >= 60 ? `${Math.floor(exercise.duration / 60)}min` : `${exercise.duration}s`}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Exercise Library</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            Alert.alert('Filters', 'Advanced filters coming soon!');
          }}
        >
          <Ionicons name="filter" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

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
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
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
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive,
              { borderColor: category.color }
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons
              name={category.icon as any}
              size={20}
              color={selectedCategory === category.id ? 'white' : category.color}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
                { color: selectedCategory === category.id ? 'white' : category.color }
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exercise List */}
      <ScrollView style={styles.exerciseList} contentContainerStyle={styles.exerciseListContent}>
        <View style={styles.exerciseGrid}>
          {filteredExercises.map(renderExerciseCard)}
        </View>

        {filteredExercises.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>No exercises found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or category filter
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Exercise Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedExercise && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedExercise.name}</Text>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Add Exercise', 'Exercise added to workout plan!');
                  setSelectedExercise(null);
                }}
              >
                <Ionicons name="add-circle" size={24} color="#667eea" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Exercise Image/Video */}
              <View style={styles.modalImageContainer}>
                <View style={styles.modalImagePlaceholder}>
                  <Ionicons name={getCategoryIcon(selectedExercise.category) as any} size={64} color="#667eea" />
                </View>
              </View>

              {/* Exercise Info */}
              <View style={styles.modalExerciseInfo}>
                <Text style={styles.modalDescription}>{selectedExercise.description}</Text>
                
                <View style={styles.modalBadges}>
                  <View style={[styles.modalDifficultyBadge, { backgroundColor: getDifficultyColor(selectedExercise.difficulty) }]}>
                    <Text style={styles.modalDifficultyText}>{selectedExercise.difficulty}</Text>
                  </View>
                  <View style={styles.modalCalorieBadge}>
                    <Ionicons name="flame" size={14} color="#ef4444" />
                    <Text style={styles.modalCalorieText}>{selectedExercise.caloriesPerMinute} cal/min</Text>
                  </View>
                </View>
              </View>

              {/* Instructions */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Instructions</Text>
                {selectedExercise.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                ))}
              </View>

              {/* Tips */}
              {selectedExercise.tips && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Tips</Text>
                  {selectedExercise.tips.map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <Ionicons name="bulb" size={16} color="#f59e0b" />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Muscle Groups */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Target Muscles</Text>
                <View style={styles.modalMuscleGroups}>
                  {selectedExercise.muscleGroups.map((muscle, index) => (
                    <View key={index} style={styles.modalMuscleTag}>
                      <Text style={styles.modalMuscleTagText}>{muscle}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Equipment */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Equipment Needed</Text>
                <View style={styles.equipmentList}>
                  {selectedExercise.equipment.map((item, index) => (
                    <View key={index} style={styles.equipmentItem}>
                      <Ionicons name="build" size={16} color="#667eea" />
                      <Text style={styles.equipmentItemText}>
                        {item === 'bodyweight' ? 'No equipment (bodyweight)' : item}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        )}
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
  filterButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
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
    paddingBottom: 10,
  },
  categoriesContent: {
    paddingHorizontal: 15,
    gap: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: 'white',
  },
  exerciseList: {
    flex: 1,
  },
  exerciseListContent: {
    padding: 15,
  },
  exerciseGrid: {
    gap: 15,
  },
  exerciseCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseImageContainer: {
    position: 'relative',
    height: 120,
  },
  exerciseImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  exerciseBadges: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  calorieBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 2,
  },
  calorieText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
  exerciseInfo: {
    padding: 15,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  exerciseDetails: {
    gap: 8,
  },
  muscleGroups: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  muscleTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  muscleTagText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  moreText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  exerciseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  equipmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  equipmentText: {
    fontSize: 12,
    color: '#6b7280',
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
  },
  modalImageContainer: {
    height: 200,
    backgroundColor: 'white',
  },
  modalImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  modalExerciseInfo: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 15,
  },
  modalBadges: {
    flexDirection: 'row',
    gap: 10,
  },
  modalDifficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  modalDifficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  modalCalorieBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 4,
  },
  modalCalorieText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  modalSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  modalMuscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalMuscleTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalMuscleTagText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  equipmentList: {
    gap: 8,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  equipmentItemText: {
    fontSize: 14,
    color: '#374151',
  },
});
