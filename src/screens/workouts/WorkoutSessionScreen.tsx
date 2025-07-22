import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { startWorkoutSession, endWorkoutSession } from '../../store/slices/workoutSlice';

export default function WorkoutSessionScreen({ route, navigation }: any) {
  const { workoutId } = route.params;
  const { exercises } = useSelector((state: RootState) => state.workouts);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(60);
  const [sessionTimer, setSessionTimer] = useState(0);
  const dispatch = useDispatch();

  // Mock workout exercises for demo
  const workoutExercises = [
    { exerciseId: 'ex1', sets: 3, reps: 10, restTime: 60 },
    { exerciseId: 'ex2', sets: 3, reps: 15, restTime: 60 },
    { exerciseId: 'ex3', sets: 3, duration: 30, restTime: 60 },
  ];

  const currentExerciseData = exercises.find(ex => 
    ex.id === workoutExercises[currentExercise]?.exerciseId
  );

  const currentWorkoutExercise = workoutExercises[currentExercise];

  useEffect(() => {
    // Start session timer
    const timer = setInterval(() => {
      setSessionTimer(prev => prev + 1);
    }, 1000);

    // Initialize workout session
    dispatch(startWorkoutSession({
      id: Date.now().toString(),
      workoutId: workoutId,
      userId: '1',
      startTime: new Date(),
      date: new Date(),
      isCompleted: false,
      completedExercises: [],
    }));

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isResting && restTimer > 0) {
      timer = setInterval(() => {
        setRestTimer(prev => prev - 1);
      }, 1000);
    } else if (isResting && restTimer === 0) {
      setIsResting(false);
      setRestTimer(currentWorkoutExercise?.restTime || 60);
    }
    return () => clearInterval(timer);
  }, [isResting, restTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteSet = () => {
    if (currentSet < currentWorkoutExercise.sets) {
      setCurrentSet(currentSet + 1);
      setIsResting(true);
      setRestTimer(currentWorkoutExercise.restTime);
    } else {
      // Move to next exercise
      if (currentExercise < workoutExercises.length - 1) {
        setCurrentExercise(currentExercise + 1);
        setCurrentSet(1);
        setIsResting(true);
        setRestTimer(workoutExercises[currentExercise + 1]?.restTime || 60);
      } else {
        // Workout complete
        handleCompleteWorkout();
      }
    }
  };

  const handleCompleteWorkout = () => {
    Alert.alert(
      'Workout Complete!',
      '🎉 Great job! You\'ve completed your workout.',
      [
        {
          text: 'Finish',
          onPress: () => {
            dispatch(endWorkoutSession());
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleEndWorkout = () => {
    Alert.alert(
      'End Workout?',
      'Are you sure you want to end this workout session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Workout',
          style: 'destructive',
          onPress: () => {
            dispatch(endWorkoutSession());
            navigation.goBack();
          }
        }
      ]
    );
  };

  if (!currentExerciseData) {
    return (
      <View style={styles.container}>
        <Text>Exercise not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleEndWorkout}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.sessionTime}>{formatTime(sessionTimer)}</Text>
          <TouchableOpacity>
            <Ionicons name="pause" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Exercise {currentExercise + 1} of {workoutExercises.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentExercise) / workoutExercises.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.content}>
        {isResting ? (
          <View style={styles.restScreen}>
            <Ionicons name="time" size={80} color="#667eea" />
            <Text style={styles.restTitle}>Rest Time</Text>
            <Text style={styles.restTimer}>{formatTime(restTimer)}</Text>
            <Text style={styles.nextExercise}>
              Next: Set {currentSet} of {currentExerciseData.name}
            </Text>
            <TouchableOpacity 
              style={styles.skipRestButton}
              onPress={() => {
                setIsResting(false);
                setRestTimer(currentWorkoutExercise.restTime);
              }}
            >
              <Text style={styles.skipRestText}>Skip Rest</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.exerciseScreen}>
            <Text style={styles.exerciseName}>{currentExerciseData.name}</Text>
            <Text style={styles.exerciseDescription}>
              {currentExerciseData.description}
            </Text>
            
            <View style={styles.setInfo}>
              <Text style={styles.setNumber}>Set {currentSet}</Text>
              <Text style={styles.setDetails}>
                {currentWorkoutExercise.reps && `${currentWorkoutExercise.reps} reps`}
                {currentWorkoutExercise.duration && `${currentWorkoutExercise.duration} seconds`}
              </Text>
            </View>

            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Instructions:</Text>
              {currentExerciseData.instructions.map((instruction, index) => (
                <Text key={index} style={styles.instruction}>
                  {index + 1}. {instruction}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Bottom Button */}
      {!isResting && (
        <TouchableOpacity style={styles.completeButton} onPress={handleCompleteSet}>
          <Text style={styles.completeButtonText}>
            {currentSet === currentWorkoutExercise.sets && 
             currentExercise === workoutExercises.length - 1 
              ? 'Complete Workout' 
              : 'Complete Set'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sessionTime: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  restScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  restTimer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#667eea',
    marginVertical: 20,
  },
  nextExercise: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  skipRestButton: {
    marginTop: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: '#667eea',
    borderWidth: 2,
    borderRadius: 8,
  },
  skipRestText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseScreen: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  exerciseDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  setInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  setNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#667eea',
  },
  setDetails: {
    fontSize: 18,
    color: '#333',
    marginTop: 5,
  },
  instructionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  completeButton: {
    backgroundColor: '#667eea',
    margin: 20,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});