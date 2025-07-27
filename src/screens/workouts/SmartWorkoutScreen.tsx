import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import AdaptiveWorkoutService from '../../services/AdaptiveWorkoutService';
import { User, Workout } from '../../types';

const { width } = Dimensions.get('window');

interface SmartWorkoutScreenProps {
  navigation: any;
}

interface WorkoutAdaptation {
  type: 'intensity' | 'rest' | 'exercise' | 'volume';
  message: string;
  applied: boolean;
  timestamp: Date;
}

interface RestTimerState {
  isActive: boolean;
  timeRemaining: number;
  recommendedTime: number;
  exerciseName: string;
}

export default function SmartWorkoutScreen({ navigation }: SmartWorkoutScreenProps) {
  const dispatch = useDispatch();
  const { userId } = useSelector((state: RootState) => state.auth);
  // Note: currentWorkout would be available when integrated with full workout state

  const [adaptiveWorkout, setAdaptiveWorkout] = useState<any>(null);
  const [adaptations, setAdaptations] = useState<WorkoutAdaptation[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restTimer, setRestTimer] = useState<RestTimerState>({
    isActive: false,
    timeRemaining: 0,
    recommendedTime: 90,
    exerciseName: '',
  });
  const [performanceRating, setPerformanceRating] = useState(5);
  const [fatigueLevel, setFatigueLevel] = useState(5);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [heartRate, setHeartRate] = useState<number | null>(null);

  // Mock user profile for demo
  const mockUser: User = {
    id: userId || 'demo-user',
    email: 'demo@example.com',
    name: 'Demo User',
    fitnessLevel: 'intermediate',
    goals: [],
    preferredWorkoutDays: 4,
    preferredWorkoutDuration: 60,
    joinDate: new Date(),
    lastLogin: new Date(),
    physicalLimitations: [],
    availableEquipment: ['dumbbells', 'bodyweight', 'resistance_bands'],
    createdAt: new Date(),
  };

  // Mock workout for demo
  const mockWorkout: Workout = {
    id: 'smart-workout-1',
    name: 'Smart Upper Body Workout',
    description: 'AI-optimized upper body routine',
    estimatedDuration: 45,
    difficulty: 'intermediate',
    category: 'strength',
    exercises: [
      {
        exerciseId: 'push-ups',
        sets: 3,
        reps: 12,
        weight: 0,
        restTime: 90,
      },
      {
        exerciseId: 'dumbbell-rows',
        sets: 3,
        reps: 10,
        weight: 20,
        restTime: 120,
      },
      {
        exerciseId: 'shoulder-press',
        sets: 3,
        reps: 8,
        weight: 15,
        restTime: 90,
      },
    ],
    notes: 'AI-adapted workout based on your performance',
  };

  useEffect(() => {
    initializeAdaptiveWorkout();
    // Simulate heart rate monitoring
    const heartRateInterval = setInterval(() => {
      setHeartRate(Math.floor(Math.random() * 40) + 120); // 120-160 bpm
    }, 5000);

    return () => clearInterval(heartRateInterval);
  }, []);

  const initializeAdaptiveWorkout = async () => {
    try {
      const adaptive = await AdaptiveWorkoutService.createAdaptiveWorkout(
        mockWorkout,
        mockUser
      );
      setAdaptiveWorkout(adaptive);
    } catch (error) {
      console.error('Error initializing adaptive workout:', error);
    }
  };

  const startSmartRest = async () => {
    const currentExercise = mockWorkout.exercises[currentExerciseIndex];
    const setPerformance = {
      setNumber: currentSetIndex + 1,
      reps: currentExercise.reps || 0,
      completed: true,
      rpe: performanceRating,
    };

    try {
      const smartTimer = await AdaptiveWorkoutService.calculateSmartRestTime(
        {
          id: currentExercise.exerciseId,
          name: currentExercise.exerciseId.replace('-', ' '),
          description: '',
          instructions: [],
          category: 'strength',
          muscleGroups: [],
          equipment: [],
          difficulty: 'intermediate',
        },
        setPerformance,
        {
          heartRateRecovery: heartRate ? Math.floor(Math.random() * 30) + 20 : undefined,
          sleepQuality: 0.8,
        }
      );

      setRestTimer({
        isActive: true,
        timeRemaining: smartTimer.currentRest,
        recommendedTime: smartTimer.currentRest,
        exerciseName: currentExercise.exerciseId.replace('-', ' '),
      });
      setShowRestTimer(true);

      // Start countdown
      const countdown = setInterval(() => {
        setRestTimer(prev => {
          if (prev.timeRemaining <= 1) {
            clearInterval(countdown);
            return { ...prev, isActive: false, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);

    } catch (error) {
      console.error('Error calculating smart rest:', error);
    }
  };

  const completeSet = () => {
    setShowFeedbackModal(true);
  };

  const submitSetFeedback = async () => {
    setShowFeedbackModal(false);
    
    // Check for adaptations based on performance
    if (performanceRating <= 3 || fatigueLevel >= 8) {
      const adaptation: WorkoutAdaptation = {
        type: 'intensity',
        message: performanceRating <= 3 
          ? 'Reducing intensity by 15% based on difficulty rating'
          : 'Adding extra rest due to high fatigue level',
        applied: true,
        timestamp: new Date(),
      };
      setAdaptations(prev => [...prev, adaptation]);
      
      Alert.alert(
        'Workout Adapted',
        adaptation.message,
        [{ text: 'Continue', style: 'default' }]
      );
    }

    // Move to next set or exercise
    if (currentSetIndex < (mockWorkout.exercises[currentExerciseIndex].sets - 1)) {
      setCurrentSetIndex(prev => prev + 1);
      startSmartRest();
    } else if (currentExerciseIndex < mockWorkout.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSetIndex(0);
    } else {
      // Workout complete
      Alert.alert(
        'Workout Complete!',
        'Great job! Your performance data has been saved for future workout optimization.',
        [{ text: 'View Summary', onPress: () => navigation.goBack() }]
      );
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentExercise = mockWorkout.exercises[currentExerciseIndex];
  const currentSet = currentSetIndex + 1;
  const totalSets = currentExercise.sets;

  return (
    <View style={styles.container}>
      {/* Header */}
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
        <Text style={styles.headerTitle}>Smart Workout</Text>
        <TouchableOpacity
          style={styles.adaptButton}
          onPress={() => Alert.alert('AI Insights', `${adaptations.length} adaptations applied`)}
        >
          <Ionicons name="bulb" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Workout Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Workout Progress</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${((currentExerciseIndex + 1) / mockWorkout.exercises.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            Exercise {currentExerciseIndex + 1} of {mockWorkout.exercises.length}
          </Text>
        </View>

        {/* Current Exercise */}
        <View style={styles.exerciseSection}>
          <Text style={styles.exerciseName}>
            {currentExercise.exerciseId.replace('-', ' ').toUpperCase()}
          </Text>
          <Text style={styles.setInfo}>
            Set {currentSet} of {totalSets}
          </Text>
          
          <View style={styles.exerciseDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="fitness" size={20} color="#667eea" />
              <Text style={styles.detailText}>
                {currentExercise.reps} reps
              </Text>
            </View>
            {(currentExercise.weight && currentExercise.weight > 0) && (
              <View style={styles.detailItem}>
                <Ionicons name="barbell" size={20} color="#667eea" />
                <Text style={styles.detailText}>
                  {currentExercise.weight} kg
                </Text>
              </View>
            )}
            <View style={styles.detailItem}>
              <Ionicons name="time" size={20} color="#667eea" />
              <Text style={styles.detailText}>
                {currentExercise.restTime}s rest
              </Text>
            </View>
          </View>
        </View>

        {/* Real-time Metrics */}
        {heartRate && (
          <View style={styles.metricsSection}>
            <Text style={styles.sectionTitle}>Real-time Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Ionicons name="heart" size={24} color="#ef4444" />
                <Text style={styles.metricValue}>{heartRate}</Text>
                <Text style={styles.metricLabel}>BPM</Text>
              </View>
              <View style={styles.metricCard}>
                <Ionicons name="flash" size={24} color="#f59e0b" />
                <Text style={styles.metricValue}>{fatigueLevel}/10</Text>
                <Text style={styles.metricLabel}>Fatigue</Text>
              </View>
              <View style={styles.metricCard}>
                <Ionicons name="trophy" size={24} color="#10b981" />
                <Text style={styles.metricValue}>{performanceRating}/10</Text>
                <Text style={styles.metricLabel}>Performance</Text>
              </View>
            </View>
          </View>
        )}

        {/* AI Adaptations */}
        {adaptations.length > 0 && (
          <View style={styles.adaptationsSection}>
            <Text style={styles.sectionTitle}>AI Adaptations</Text>
            {adaptations.slice(-3).map((adaptation, index) => (
              <View key={index} style={styles.adaptationCard}>
                <View style={styles.adaptationHeader}>
                  <Ionicons 
                    name="bulb" 
                    size={16} 
                    color="#667eea" 
                  />
                  <Text style={styles.adaptationType}>
                    {adaptation.type.toUpperCase()}
                  </Text>
                  {adaptation.applied && (
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  )}
                </View>
                <Text style={styles.adaptationMessage}>
                  {adaptation.message}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={completeSet}
          >
            <Text style={styles.completeButtonText}>Complete Set</Text>
          </TouchableOpacity>
          
          {currentSetIndex > 0 && (
            <TouchableOpacity
              style={styles.adaptButton}
              onPress={() => Alert.alert('Adaptation', 'What would you like to adjust?')}
            >
              <Ionicons name="settings" size={20} color="#667eea" />
              <Text style={styles.adaptButtonText}>Request Adaptation</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Smart Rest Timer Modal */}
      <Modal
        visible={showRestTimer}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timerModal}>
            <Text style={styles.timerTitle}>Smart Rest Timer</Text>
            <Text style={styles.timerExercise}>{restTimer.exerciseName}</Text>
            
            <View style={styles.timerDisplay}>
              <Text style={styles.timerTime}>
                {formatTime(restTimer.timeRemaining)}
              </Text>
              <Text style={styles.timerRecommended}>
                Recommended: {formatTime(restTimer.recommendedTime)}
              </Text>
            </View>

            <View style={styles.timerActions}>
              <TouchableOpacity
                style={styles.timerButton}
                onPress={() => setRestTimer(prev => ({ ...prev, timeRemaining: prev.timeRemaining + 30 }))}
              >
                <Text style={styles.timerButtonText}>+30s</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.timerButton, styles.skipButton]}
                onPress={() => setShowRestTimer(false)}
              >
                <Text style={styles.timerButtonText}>Skip Rest</Text>
              </TouchableOpacity>
            </View>

            {!restTimer.isActive && (
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => setShowRestTimer(false)}
              >
                <Text style={styles.continueButtonText}>Continue Workout</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Performance Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.feedbackModal}>
            <Text style={styles.feedbackTitle}>How was that set?</Text>
            
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Difficulty Rating</Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    onPress={() => setPerformanceRating(rating)}
                  >
                    <Ionicons
                      name={rating <= performanceRating ? 'star' : 'star-outline'}
                      size={24}
                      color={rating <= performanceRating ? '#f59e0b' : '#d1d5db'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Fatigue Level</Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    onPress={() => setFatigueLevel(rating)}
                  >
                    <Ionicons
                      name={rating <= fatigueLevel ? 'battery-full' : 'battery-dead'}
                      size={24}
                      color={rating <= fatigueLevel ? '#ef4444' : '#d1d5db'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={submitSetFeedback}
            >
              <Text style={styles.submitButtonText}>Submit & Continue</Text>
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
  adaptButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  progressSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  exerciseSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  setInfo: {
    fontSize: 16,
    color: '#667eea',
    textAlign: 'center',
    marginBottom: 20,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 4,
  },
  metricsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  adaptationsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adaptationCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#667eea',
  },
  adaptationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  adaptationType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#667eea',
    marginLeft: 8,
    marginRight: 8,
  },
  adaptationMessage: {
    fontSize: 14,
    color: '#4b5563',
  },
  actionSection: {
    marginBottom: 40,
  },
  completeButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  adaptButtonText: {
    color: '#667eea',
    fontSize: 14,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 20,
    minWidth: width * 0.8,
  },
  timerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  timerExercise: {
    fontSize: 16,
    color: '#667eea',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#667eea',
  },
  timerRecommended: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  timerActions: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timerButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 8,
  },
  skipButton: {
    backgroundColor: '#fef3c7',
  },
  timerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  continueButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  feedbackModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    marginHorizontal: 20,
    minWidth: width * 0.9,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 30,
  },
  ratingSection: {
    marginBottom: 25,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  ratingStars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  submitButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
