import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  completeWorkout,
  addPoints,
  unlockAchievement,
  updateAchievementProgress,
  completeChallenge,
  updateChallengeProgress,
  resetDailyProgress,
  selectUserStats,
  selectActiveAchievements,
  selectActiveChallenges,
} from '../../store/slices/gamificationSlice';
import AchievementNotification from '../../components/AchievementNotification';

const GameTestScreen: React.FC = () => {
  const dispatch = useDispatch();
  const userStats = useSelector((state: RootState) => selectUserStats(state));
  const activeAchievements = useSelector((state: RootState) => selectActiveAchievements(state));
  const activeChallenges = useSelector((state: RootState) => selectActiveChallenges(state));

  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);

  const simulateWorkout = () => {
    const duration = Math.floor(Math.random() * 60) + 30; // 30-90 minutes
    const sets = Math.floor(Math.random() * 15) + 5; // 5-20 sets
    const reps = Math.floor(Math.random() * 100) + 50; // 50-150 reps

    dispatch(completeWorkout({
      duration,
      sets,
      reps,
      exercises: ['Push-ups', 'Squats', 'Burpees']
    }));

    Alert.alert(
      '🏋️ Workout Simulated!',
      `Duration: ${duration} min\nSets: ${sets}\nReps: ${reps}\n\nCheck your stats and achievements!`
    );
  };

  const awardBonusPoints = () => {
    const points = Math.floor(Math.random() * 500) + 100;
    dispatch(addPoints({ points, source: 'bonus_reward' }));
    
    Alert.alert('🎁 Bonus Points!', `You earned ${points} bonus points!`);
  };

  const triggerAchievement = (achievementId: string) => {
    const achievement = activeAchievements.find(a => a.id === achievementId);
    if (achievement) {
      dispatch(unlockAchievement(achievementId));
      setCurrentAchievement(achievement as any);
      setShowAchievement(true);
    } else {
      Alert.alert('Achievement not found', 'This achievement may already be unlocked.');
    }
  };

  const updateProgress = (achievementId: string, progress: number) => {
    dispatch(updateAchievementProgress({ achievementId, progress }));
    Alert.alert('Progress Updated', `Achievement progress set to ${progress}%`);
  };

  const completeRandomChallenge = () => {
    if (activeChallenges.length > 0) {
      const randomChallenge = activeChallenges[Math.floor(Math.random() * activeChallenges.length)];
      dispatch(completeChallenge(randomChallenge.id));
      Alert.alert('🏆 Challenge Complete!', `You completed: ${randomChallenge.title}`);
    } else {
      Alert.alert('No Active Challenges', 'There are no active challenges to complete.');
    }
  };

  const resetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset daily progress?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            dispatch(resetDailyProgress());
            Alert.alert('Progress Reset', 'Daily progress has been reset.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Gamification Test</Text>
        <Text style={styles.headerSubtitle}>Test achievements and challenges</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Current Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Current Stats</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Level:</Text>
            <Text style={styles.statValue}>{userStats.level}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Points:</Text>
            <Text style={styles.statValue}>{userStats.totalPoints.toLocaleString()}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Workouts:</Text>
            <Text style={styles.statValue}>{userStats.totalWorkouts}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Current Streak:</Text>
            <Text style={styles.statValue}>{userStats.currentStreak} days</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Experience:</Text>
            <Text style={styles.statValue}>
              {userStats.experiencePoints} / {userStats.experienceToNextLevel}
            </Text>
          </View>
        </View>

        {/* Test Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Test Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={simulateWorkout}>
            <Ionicons name="fitness" size={24} color="white" />
            <Text style={styles.actionButtonText}>Simulate Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={awardBonusPoints}>
            <Ionicons name="diamond" size={24} color="white" />
            <Text style={styles.actionButtonText}>Award Bonus Points</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={completeRandomChallenge}>
            <Ionicons name="flag" size={24} color="white" />
            <Text style={styles.actionButtonText}>Complete Challenge</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.resetButton]} onPress={resetProgress}>
            <Ionicons name="refresh" size={24} color="white" />
            <Text style={styles.actionButtonText}>Reset Daily Progress</Text>
          </TouchableOpacity>
        </View>

        {/* Achievement Tests */}
        <View style={styles.achievementsCard}>
          <Text style={styles.sectionTitle}>Unlock Achievements</Text>
          
          {activeAchievements.slice(0, 5).map((achievement) => (
            <View key={achievement.id} style={styles.achievementRow}>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>{achievement.title}</Text>
                <Text style={styles.achievementDesc}>{achievement.description}</Text>
                <Text style={styles.achievementProgress}>
                  Progress: {achievement.progress.toFixed(0)}%
                </Text>
              </View>
              <View style={styles.achievementActions}>
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => updateProgress(achievement.id, 50)}
                >
                  <Text style={styles.smallButtonText}>50%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => triggerAchievement(achievement.id)}
                >
                  <Text style={styles.smallButtonText}>Unlock</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Active Challenges */}
        <View style={styles.challengesCard}>
          <Text style={styles.sectionTitle}>Active Challenges</Text>
          
          {activeChallenges.map((challenge) => (
            <View key={challenge.id} style={styles.challengeRow}>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeName}>{challenge.title}</Text>
                <Text style={styles.challengeDesc}>{challenge.description}</Text>
                <Text style={styles.challengeProgress}>
                  {challenge.progress} / {challenge.target}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => {
                  dispatch(updateChallengeProgress({
                    challengeId: challenge.id,
                    progress: challenge.target
                  }));
                  Alert.alert('Challenge Updated', 'Challenge marked as complete!');
                }}
              >
                <Text style={styles.smallButtonText}>Complete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Achievement Notification */}
      <AchievementNotification
        achievement={currentAchievement}
        visible={showAchievement}
        onClose={() => {
          setShowAchievement(false);
          setCurrentAchievement(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  resetButton: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  achievementsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  achievementInfo: {
    flex: 1,
    marginRight: 12,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  achievementProgress: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  achievementActions: {
    flexDirection: 'row',
  },
  smallButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 4,
  },
  smallButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  challengesCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  challengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  challengeInfo: {
    flex: 1,
    marginRight: 12,
  },
  challengeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  challengeDesc: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  challengeProgress: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '500',
  },
});

export default GameTestScreen;
