import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
// Phase 2: AI Recommendations
import { setRecommendations, addRecommendation } from '../../store/slices/aiSlice';
import { sampleRecommendations } from '../../data/sampleData';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { currentSession } = useSelector((state: RootState) => state.workouts);
  // Phase 2: AI Recommendations
  const { recommendations } = useSelector((state: RootState) => state.ai);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  useEffect(() => {
    // Load AI recommendations on component mount
    if (recommendations.length === 0) {
      dispatch(setRecommendations(sampleRecommendations));
    }
  }, [dispatch, recommendations.length]);

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const QuickActionCard = ({ title, icon, color, onPress, description }: any) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <LinearGradient
        colors={[color, `${color}CC`]}
        style={styles.quickActionGradient}
      >
        <Ionicons name={icon} size={30} color="#fff" />
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionDescription}>{description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const StatCard = ({ title, value, unit, icon }: any) => (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={24} color="#667eea" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>
              {getCurrentGreeting()}, {currentUser?.name || 'User'}!
            </Text>
            <Text style={styles.headerSubtitle}>
              Ready to crush your fitness goals?
            </Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={40} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Current Workout Session */}
      {currentSession && (
        <View style={styles.currentWorkoutCard}>
          <Text style={styles.currentWorkoutTitle}>Workout in Progress</Text>
          <Text style={styles.currentWorkoutSubtitle}>
            Continue your {currentSession.workoutId} session
          </Text>
          <TouchableOpacity style={styles.continueButton}>
            <Text style={styles.continueButtonText}>Continue Workout</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsContainer}>
          <StatCard
            title="Streak"
            value="7"
            unit="days"
            icon="flame"
          />
          <StatCard
            title="Calories"
            value="285"
            unit="burned"
            icon="flash"
          />
          <StatCard
            title="Weight"
            value={currentUser?.weight || 70}
            unit="kg"
            icon="scale"
          />
        </View>
      </View>

      {/* AI Recommendations - Phase 2 */}
      {recommendations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Recommendations</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('AIInsights')}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>Full Analysis</Text>
              <Ionicons name="analytics" size={16} color="#667eea" />
            </TouchableOpacity>
          </View>
          
          {recommendations.slice(0, showAllRecommendations ? recommendations.length : 2).map((rec) => (
            <View key={rec.id} style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <View style={styles.recommendationTitleContainer}>
                  <Ionicons 
                    name={rec.recommendationType === 'next_workout' ? 'fitness' : rec.recommendationType === 'rest_day' ? 'bed' : 'bulb'} 
                    size={20} 
                    color="#667eea" 
                  />
                  <Text style={styles.recommendationTitle}>{rec.title}</Text>
                </View>
                <View style={styles.confidenceContainer}>
                  <Ionicons name="analytics" size={14} color="#52c41a" />
                  <Text style={styles.confidenceText}>
                    {Math.round(rec.confidence * 100)}% match
                  </Text>
                </View>
              </View>
              
              <Text style={styles.recommendationDescription}>{rec.description}</Text>
              
              <View style={styles.reasoningContainer}>
                <Text style={styles.reasoningTitle}>Why this recommendation:</Text>
                {rec.reasoning.map((reason, index) => (
                  <Text key={index} style={styles.reasoningItem}>• {reason}</Text>
                ))}
              </View>
              
              <View style={styles.recommendationActions}>
                <TouchableOpacity 
                  style={styles.acceptButton}
                  onPress={() => {
                    // In a real app, this would navigate to the recommended workout
                    console.log('Accepting recommendation:', rec.id);
                  }}
                >
                  <Ionicons name="checkmark" size={16} color="white" />
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dismissButton}
                  onPress={() => {
                    // In a real app, this would remove the recommendation
                    console.log('Dismissing recommendation:', rec.id);
                  }}
                >
                  <Ionicons name="close" size={16} color="#666" />
                  <Text style={styles.dismissButtonText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          <QuickActionCard
            title="Start Workout"
            description="Begin your training session"
            icon="fitness"
            color="#667eea"
            onPress={() => navigation.navigate('Workouts')}
          />
          <QuickActionCard
            title="Log Progress"
            description="Track your measurements"
            icon="analytics"
            color="#52c41a"
            onPress={() => navigation.navigate('Progress')}
          />
          <QuickActionCard
            title="Add Meal"
            description="Track your nutrition"
            icon="restaurant"
            color="#fa8c16"
            onPress={() => navigation.navigate('Nutrition')}
          />
          <QuickActionCard
            title="AI Trainer"
            description="Get personalized coaching"
            icon="person"
            color="#667eea"
            onPress={() => navigation.navigate('VirtualTrainer')}
          />
          <QuickActionCard
            title="Gamification Test"
            description="Test achievements & rewards"
            icon="trophy"
            color="#ff6b6b"
            onPress={() => navigation.navigate('GameTest')}
          />
          <QuickActionCard
            title="Quantum AI"
            description="Next-gen consciousness computing"
            icon="sparkles"
            color="#9c27b0"
            onPress={() => navigation.navigate('QuantumAIControlCenter')}
          />
          <QuickActionCard
            title="View Plans"
            description="Explore workout programs"
            icon="list"
            color="#722ed1"
            onPress={() => navigation.navigate('Workouts')}
          />
        </View>
      </View>

      {/* Today's Motivation */}
      <View style={styles.section}>
        <View style={styles.motivationCard}>
          <Ionicons name="bulb" size={24} color="#ffc107" />
          <Text style={styles.motivationTitle}>Daily Motivation</Text>
          <Text style={styles.motivationText}>
            "The groundwork for all happiness is good health." - Leigh Hunt
          </Text>
        </View>
      </View>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
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
  profileButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentWorkoutCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currentWorkoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  currentWorkoutSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  continueButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 15,
    alignSelf: 'flex-start',
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: '600',
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statUnit: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statTitle: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
    textAlign: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 50) / 2,
    marginBottom: 15,
  },
  quickActionGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
    textAlign: 'center',
  },
  motivationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 20,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  motivationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  // Phase 2: AI Recommendations styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f7ff',
    borderRadius: 20,
  },
  viewAllText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
    marginRight: 4,
  },
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6ffed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    color: '#52c41a',
    fontWeight: '600',
    marginLeft: 4,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  reasoningContainer: {
    backgroundColor: '#f8f9ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  reasoningTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 6,
  },
  reasoningItem: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 2,
  },
  recommendationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  dismissButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dismissButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});