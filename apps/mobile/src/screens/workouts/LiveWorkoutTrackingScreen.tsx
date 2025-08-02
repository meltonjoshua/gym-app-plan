import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
  Vibration,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateWorkoutSession } from '../../store/slices/workoutSlice';
import { 
  completeWorkout as completeWorkoutAction, 
  addPoints, 
  updateAchievementProgress,
  updateChallengeProgress 
} from '../../store/slices/gamificationSlice';
import { ScreenErrorBoundary } from '../../components/ErrorBoundary';

const { width, height } = Dimensions.get('window');

interface ExerciseSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
  restTime: number;
  startTime?: Date;
  endTime?: Date;
}

interface LiveWorkoutExercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  currentSet: number;
  completed: boolean;
  muscleGroups: string[];
  instructions: string[];
}

const LiveWorkoutTrackingScreen: React.FC<{ navigation: any; route: any }> = ({ 
  navigation, 
  route 
}) => {
  const dispatch = useDispatch();
  const currentSession = useSelector((state: RootState) => state.workouts.currentSession);
  
  // Workout state
  const [exercises] = useState<LiveWorkoutExercise[]>([
    {
      id: '1',
      name: 'Push-ups',
      sets: [
        { id: '1-1', reps: 15, weight: 0, completed: false, restTime: 60 },
        { id: '1-2', reps: 12, weight: 0, completed: false, restTime: 60 },
        { id: '1-3', reps: 10, weight: 0, completed: false, restTime: 90 },
      ],
      currentSet: 0,
      completed: false,
      muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
      instructions: [
        'Start in plank position with hands shoulder-width apart',
        'Lower body until chest nearly touches floor',
        'Push back up to starting position',
        'Keep core engaged throughout movement'
      ]
    },
    {
      id: '2', 
      name: 'Squats',
      sets: [
        { id: '2-1', reps: 20, weight: 0, completed: false, restTime: 45 },
        { id: '2-2', reps: 18, weight: 0, completed: false, restTime: 45 },
        { id: '2-3', reps: 15, weight: 0, completed: false, restTime: 60 },
      ],
      currentSet: 0,
      completed: false,
      muscleGroups: ['Quadriceps', 'Glutes', 'Core'],
      instructions: [
        'Stand with feet shoulder-width apart',
        'Lower body as if sitting back into a chair',
        'Keep chest up and knees behind toes',
        'Drive through heels to return to standing'
      ]
    },
    {
      id: '3',
      name: 'Plank',
      sets: [
        { id: '3-1', reps: 30, weight: 0, completed: false, restTime: 30 },
        { id: '3-2', reps: 45, weight: 0, completed: false, restTime: 30 },
        { id: '3-3', reps: 60, weight: 0, completed: false, restTime: 0 },
      ],
      currentSet: 0,
      completed: false,
      muscleGroups: ['Core', 'Shoulders', 'Back'],
      instructions: [
        'Start in push-up position',
        'Hold body in straight line from head to heels',
        'Keep core tight and breathe normally',
        'Avoid sagging hips or raising butt'
      ]
    }
  ]);
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [workoutStartTime] = useState(new Date());
  const [totalSetsCompleted, setTotalSetsCompleted] = useState(0);
  const [workoutPaused, setWorkoutPaused] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const restTimerAnim = useRef(new Animated.Value(1)).current;
  const motivationAnim = useRef(new Animated.Value(0)).current;
  
  // Timer refs
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const workoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [workoutDuration, setWorkoutDuration] = useState(0);

  // Motivational messages
  const motivationalMessages = [
    "You're crushing it! 💪",
    "Keep pushing! 🔥",
    "Almost there! 🚀",
    "Beast mode activated! 💯",
    "You're stronger than yesterday! ⭐",
    "Every rep counts! 🎯",
    "Feeling the burn! 🔥",
    "Champions are made here! 🏆"
  ];

  useEffect(() => {
    // Start workout timer
    workoutTimerRef.current = setInterval(() => {
      if (!workoutPaused) {
        setWorkoutDuration(prev => prev + 1);
      }
    }, 1000);

    // Cleanup
    return () => {
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
    };
  }, [workoutPaused]);

  useEffect(() => {
    // Update progress animation
    const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const progress = totalSetsCompleted / totalSets;
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [totalSetsCompleted]);

  useEffect(() => {
    // Rest timer countdown
    if (isResting && restTimeLeft > 0) {
      // Vibration patterns for countdown
      const vibratePattern = [0, 100];
      
      restTimerRef.current = setTimeout(() => {
        setRestTimeLeft(prev => {
          const newTime = prev - 1;
          
          // Vibrate on last 3 seconds
          if (newTime <= 3 && newTime > 0) {
            Vibration.vibrate(vibratePattern);
          }
          
          // End rest period
          if (newTime <= 0) {
            setIsResting(false);
            Vibration.vibrate([0, 200, 100, 200]); // End rest vibration
            showMotivationalMessage();
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
    };
  }, [isResting, restTimeLeft]);

  const showMotivationalMessage = () => {
    const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    
    Animated.sequence([
      Animated.timing(motivationAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(motivationAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const completeSet = () => {
    const currentExercise = exercises[currentExerciseIndex];
    const currentSet = currentExercise.sets[currentExercise.currentSet];
    
    // Mark set as completed
    currentSet.completed = true;
    currentSet.endTime = new Date();
    
    setTotalSetsCompleted(prev => prev + 1);
    
    // Pulse animation for completion
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Check if exercise is complete
    if (currentExercise.currentSet === currentExercise.sets.length - 1) {
      currentExercise.completed = true;
      
      // Move to next exercise
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
      } else {
        // Workout complete!
        completeWorkout();
        return;
      }
    } else {
      // Move to next set
      currentExercise.currentSet += 1;
    }

    // Start rest period if not last set
    if (currentSet.restTime > 0) {
      setRestTimeLeft(currentSet.restTime);
      setIsResting(true);
      
      // Rest timer animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(restTimerAnim, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(restTimerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Update Redux state
    dispatch(updateWorkoutSession({
      completedExercises: [...(currentSession?.completedExercises || [])],
      notes: `Completed set ${currentExercise.currentSet + 1} of ${currentExercise.name}`,
    }));
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimeLeft(0);
    if (restTimerRef.current) clearTimeout(restTimerRef.current);
  };

  const pauseWorkout = () => {
    setWorkoutPaused(!workoutPaused);
    if (isResting && restTimerRef.current) {
      clearTimeout(restTimerRef.current);
    }
  };

  const completeWorkout = () => {
    const workoutEndTime = new Date();
    const duration = Math.floor((workoutEndTime.getTime() - workoutStartTime.getTime()) / 1000 / 60);
    
    // Calculate total reps completed
    const totalReps = exercises.reduce((total, exercise) => 
      total + exercise.sets.filter(set => set.completed).reduce((setTotal, set) => setTotal + set.reps, 0), 0
    );
    
    // Award gamification points and update stats
    dispatch(completeWorkoutAction({
      duration,
      sets: totalSetsCompleted,
      reps: totalReps,
      exercises: exercises.map(e => e.name)
    }));
    
    // Award bonus points for achievements
    dispatch(addPoints({ 
      points: 50 + Math.floor(duration / 10) + (totalSetsCompleted * 2), 
      source: 'workout_completion' 
    }));
    
    // Update achievement progress
    dispatch(updateAchievementProgress({
      achievementId: 'first_workout',
      progress: 100
    }));
    
    // Update challenge progress (example: daily push-ups)
    dispatch(updateChallengeProgress({
      challengeId: 'daily_pushups',
      progress: totalReps
    }));
    
    // Check for bonus achievements
    if (duration >= 90) {
      dispatch(updateAchievementProgress({
        achievementId: 'marathon_session',
        progress: 100
      }));
    }
    
    const currentHour = new Date().getHours();
    if (currentHour < 8) {
      dispatch(updateAchievementProgress({
        achievementId: 'early_bird',
        progress: Math.min(100, 10) // Track early workouts
      }));
    }
    
    Alert.alert(
      '🎉 Workout Complete!',
      `Amazing job! You completed your workout in ${duration} minutes.\n\nSets completed: ${totalSetsCompleted}\nReps completed: ${totalReps}\nCalories burned: ~${Math.floor(totalSetsCompleted * 8)}\n\n+${50 + Math.floor(duration / 10) + (totalSetsCompleted * 2)} points earned! 🏆`,
      [
        {
          text: 'Save & Continue',
          onPress: () => {
            // Save workout data
            dispatch(updateWorkoutSession({
              endTime: workoutEndTime,
              isCompleted: true,
              rating: 5,
              notes: `Completed ${totalSetsCompleted} sets in ${duration} minutes`
            }));
            navigation.goBack();
          }
        }
      ]
    );
  };

  const exitWorkout = () => {
    Alert.alert(
      'Exit Workout',
      'Are you sure you want to exit? Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', onPress: () => navigation.goBack() }
      ]
    );
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentExercise = exercises[currentExerciseIndex];
  const currentSet = currentExercise?.sets[currentExercise.currentSet];
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const progressPercentage = (totalSetsCompleted / totalSets) * 100;

  return (
    <ScreenErrorBoundary screenName="LiveWorkoutTracking">
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={exitWorkout} style={styles.exitButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.workoutTitle}>Live Workout</Text>
            <Text style={styles.workoutTime}>{formatTime(workoutDuration)}</Text>
          </View>
          
          <TouchableOpacity onPress={pauseWorkout} style={styles.pauseButton}>
            <Ionicons name={workoutPaused ? "play" : "pause"} size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {totalSetsCompleted} / {totalSets} sets • {Math.round(progressPercentage)}%
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Current Exercise Card */}
          {currentExercise && (
            <Animated.View 
              style={[styles.exerciseCard, { transform: [{ scale: pulseAnim }] }]}
            >
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{currentExercise.name}</Text>
                <TouchableOpacity 
                  onPress={() => setShowInstructions(!showInstructions)}
                  style={styles.infoButton}
                >
                  <Ionicons name="information-circle" size={24} color="#667eea" />
                </TouchableOpacity>
              </View>

              <View style={styles.muscleGroups}>
                {currentExercise.muscleGroups.map((muscle, index) => (
                  <View key={index} style={styles.muscleTag}>
                    <Text style={styles.muscleText}>{muscle}</Text>
                  </View>
                ))}
              </View>

              {showInstructions && (
                <View style={styles.instructions}>
                  {currentExercise.instructions.map((instruction, index) => (
                    <Text key={index} style={styles.instructionText}>
                      {index + 1}. {instruction}
                    </Text>
                  ))}
                </View>
              )}

              {/* Current Set Info */}
              {currentSet && (
                <View style={styles.currentSetInfo}>
                  <Text style={styles.setTitle}>
                    Set {currentExercise.currentSet + 1} of {currentExercise.sets.length}
                  </Text>
                  <View style={styles.setDetails}>
                    <View style={styles.setDetail}>
                      <Ionicons name="fitness" size={20} color="#667eea" />
                      <Text style={styles.setDetailText}>
                        {currentSet.reps} {currentExercise.name.includes('Plank') ? 'seconds' : 'reps'}
                      </Text>
                    </View>
                    {currentSet.weight > 0 && (
                      <View style={styles.setDetail}>
                        <Ionicons name="barbell" size={20} color="#667eea" />
                        <Text style={styles.setDetailText}>{currentSet.weight} lbs</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </Animated.View>
          )}

          {/* Rest Timer */}
          {isResting && (
            <Animated.View 
              style={[
                styles.restTimer,
                { transform: [{ scale: restTimerAnim }] }
              ]}
            >
              <Text style={styles.restTitle}>Rest Time</Text>
              <Text style={styles.restTime}>{formatTime(restTimeLeft)}</Text>
              <TouchableOpacity onPress={skipRest} style={styles.skipButton}>
                <Text style={styles.skipButtonText}>Skip Rest</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Action Button */}
          {!isResting && currentSet && !workoutPaused && (
            <TouchableOpacity onPress={completeSet} style={styles.completeButton}>
              <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={styles.buttonGradient}
              >
                <Ionicons name="checkmark-circle" size={24} color="white" />
                <Text style={styles.completeButtonText}>Complete Set</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Workout Paused */}
          {workoutPaused && (
            <View style={styles.pausedOverlay}>
              <Ionicons name="pause-circle" size={60} color="white" />
              <Text style={styles.pausedText}>Workout Paused</Text>
              <TouchableOpacity onPress={pauseWorkout} style={styles.resumeButton}>
                <Text style={styles.resumeButtonText}>Resume</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Exercise List */}
          <View style={styles.exerciseList}>
            <Text style={styles.listTitle}>Workout Plan</Text>
            {exercises.map((exercise, index) => (
              <View 
                key={exercise.id} 
                style={[
                  styles.exerciseListItem,
                  index === currentExerciseIndex && styles.activeExercise,
                  exercise.completed && styles.completedExercise,
                ]}
              >
                <View style={styles.exerciseListHeader}>
                  <Text style={[
                    styles.exerciseListName,
                    exercise.completed && styles.completedText
                  ]}>
                    {exercise.name}
                  </Text>
                  {exercise.completed && (
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  )}
                </View>
                <View style={styles.setsList}>
                  {exercise.sets.map((set, setIndex) => (
                    <View 
                      key={set.id}
                      style={[
                        styles.setIndicator,
                        set.completed && styles.completedSet,
                        index === currentExerciseIndex && 
                        setIndex === exercise.currentSet && 
                        styles.activeSet
                      ]}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Motivational Message Overlay */}
        <Animated.View 
          style={[
            styles.motivationOverlay,
            {
              opacity: motivationAnim,
              transform: [{
                scale: motivationAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                })
              }]
            }
          ]}
          pointerEvents="none"
        >
          <Text style={styles.motivationText}>
            {motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]}
          </Text>
        </Animated.View>
      </LinearGradient>
    </ScreenErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  exitButton: {
    padding: 8,
  },
  headerCenter: {
    alignItems: 'center',
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  workoutTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  pauseButton: {
    padding: 8,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  infoButton: {
    padding: 5,
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  muscleTag: {
    backgroundColor: '#667eea',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  muscleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  instructions: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
  currentSetInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  setTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  setDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  setDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setDetailText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  restTimer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  restTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  restTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 20,
  },
  skipButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  skipButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  completeButton: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  pausedOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  pausedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 20,
  },
  resumeButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resumeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  exerciseList: {
    marginBottom: 30,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  exerciseListItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  activeExercise: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  completedExercise: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  exerciseListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseListName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedText: {
    color: '#4CAF50',
  },
  setsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  setIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 5,
    marginBottom: 5,
  },
  completedSet: {
    backgroundColor: '#4CAF50',
  },
  activeSet: {
    backgroundColor: '#FFD700',
    transform: [{ scale: 1.3 }],
  },
  motivationOverlay: {
    position: 'absolute',
    top: height * 0.4,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motivationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
});

export default LiveWorkoutTrackingScreen;
