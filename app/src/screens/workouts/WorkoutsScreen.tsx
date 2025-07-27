import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { WorkoutPlan } from '../../types';

export default function WorkoutsScreen({ navigation }: any) {
  const { workoutPlans } = useSelector((state: RootState) => state.workouts);
  const [selectedTab, setSelectedTab] = useState('all');

  const filteredPlans = workoutPlans.filter(plan => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'beginner') return plan.difficulty === 'beginner';
    if (selectedTab === 'intermediate') return plan.difficulty === 'intermediate';
    if (selectedTab === 'advanced') return plan.difficulty === 'advanced';
    return true;
  });

  const TabButton = ({ title, isActive, onPress }: any) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#52c41a';
      case 'intermediate': return '#fa8c16';
      case 'advanced': return '#f5222d';
      default: return '#667eea';
    }
  };

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case 'weight_loss': return 'trending-down';
      case 'muscle_gain': return 'barbell';
      case 'endurance': return 'heart';
      case 'strength': return 'fitness';
      default: return 'star';
    }
  };

  const WorkoutPlanCard = ({ item }: { item: WorkoutPlan }) => (
    <TouchableOpacity
      style={styles.planCard}
      onPress={() => navigation.navigate('WorkoutDetail', { workoutId: item.id })}
    >
      <LinearGradient
        colors={[getDifficultyColor(item.difficulty), `${getDifficultyColor(item.difficulty)}CC`]}
        style={styles.planCardHeader}
      >
        <View style={styles.planCardHeaderContent}>
          <Ionicons name={getGoalIcon(item.goal)} size={24} color="#fff" />
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyBadgeText}>
              {item.difficulty.toUpperCase()}
            </Text>
          </View>
        </View>
      </LinearGradient>
      
      <View style={styles.planCardContent}>
        <Text style={styles.planTitle}>{item.name}</Text>
        <Text style={styles.planDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.planStats}>
          <View style={styles.statItem}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.statText}>{item.duration} weeks</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.statText}>{item.workoutsPerWeek}/week</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="stopwatch" size={16} color="#666" />
            <Text style={styles.statText}>{item.estimatedTimePerWorkout} min</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: getDifficultyColor(item.difficulty) }]}
          onPress={() => navigation.navigate('WorkoutSession', { workoutId: item.workouts[0]?.id })}
        >
          <Text style={styles.startButtonText}>Start Workout</Text>
          <Ionicons name="play" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Workout Plans</Text>
        <Text style={styles.headerSubtitle}>
          Choose your path to fitness
        </Text>
      </LinearGradient>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        <TabButton
          title="All"
          isActive={selectedTab === 'all'}
          onPress={() => setSelectedTab('all')}
        />
        <TabButton
          title="Beginner"
          isActive={selectedTab === 'beginner'}
          onPress={() => setSelectedTab('beginner')}
        />
        <TabButton
          title="Intermediate"
          isActive={selectedTab === 'intermediate'}
          onPress={() => setSelectedTab('intermediate')}
        />
        <TabButton
          title="Advanced"
          isActive={selectedTab === 'advanced'}
          onPress={() => setSelectedTab('advanced')}
        />
      </ScrollView>

      {/* Workout Plans List */}
      <FlatList
        data={filteredPlans}
        renderItem={({ item }) => <WorkoutPlanCard item={item} />}
        keyExtractor={(item) => item.id}
        style={styles.plansList}
        contentContainerStyle={styles.plansListContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
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
  tabsContainer: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  activeTabButton: {
    backgroundColor: '#667eea',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  plansList: {
    flex: 1,
  },
  plansListContent: {
    padding: 20,
    paddingBottom: 100,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  planCardHeader: {
    height: 80,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  planCardHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planCardContent: {
    padding: 20,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 15,
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});