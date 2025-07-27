import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export default function WorkoutDetailScreen({ route, navigation }: any) {
  const { workoutId } = route.params;
  const { workoutPlans, exercises } = useSelector((state: RootState) => state.workouts);
  
  // Find the workout plan
  const workoutPlan = workoutPlans.find(plan => plan.id === workoutId);
  const workout = workoutPlan?.workouts[0]; // Get first workout for demo

  if (!workoutPlan || !workout) {
    return (
      <View style={styles.container}>
        <Text>Workout not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{workout.name}</Text>
        <Text style={styles.headerSubtitle}>{workout.description}</Text>
        <View style={styles.headerStats}>
          <Text style={styles.headerStat}>{workout.estimatedDuration} min</Text>
          <Text style={styles.headerStat}>{workout.exercises.length} exercises</Text>
          <Text style={styles.headerStat}>{workout.difficulty}</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Exercises</Text>
        {workout.exercises.map((workoutExercise, index) => {
          const exercise = exercises.find(ex => ex.id === workoutExercise.exerciseId);
          if (!exercise) return null;

          return (
            <View key={index} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <View style={styles.exerciseDetails}>
                  <Text style={styles.exerciseDetail}>
                    {workoutExercise.sets} sets
                  </Text>
                  {workoutExercise.reps && (
                    <Text style={styles.exerciseDetail}>
                      {workoutExercise.reps} reps
                    </Text>
                  )}
                  {workoutExercise.duration && (
                    <Text style={styles.exerciseDetail}>
                      {workoutExercise.duration}s
                    </Text>
                  )}
                </View>
              </View>
              <Text style={styles.exerciseDescription}>
                {exercise.description}
              </Text>
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate('WorkoutSession', { workoutId: workout.id })}
      >
        <Text style={styles.startButtonText}>Start Workout</Text>
        <Ionicons name="play" size={20} color="#fff" />
      </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  headerStats: {
    flexDirection: 'row',
    marginTop: 15,
  },
  headerStat: {
    color: '#fff',
    fontSize: 14,
    marginRight: 20,
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  exerciseDetails: {
    flexDirection: 'row',
  },
  exerciseDetail: {
    fontSize: 14,
    color: '#667eea',
    marginLeft: 10,
    fontWeight: '500',
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    margin: 20,
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
});