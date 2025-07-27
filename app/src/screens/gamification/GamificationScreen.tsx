import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import {
  selectUserStats,
  selectActiveAchievements,
  selectUnlockedAchievements,
  selectActiveChallenges,
  selectLeaderboard,
  selectRecentUnlocks,
  selectProgressToNextLevel,
  updateAchievementProgress,
  completeChallenge,
  clearRecentUnlocks,
  Achievement,
  Challenge,
  Leaderboard,
} from '../../store/slices/gamificationSlice';
import { RootState } from '../../store';

const { width } = Dimensions.get('window');

const GamificationScreen: React.FC = () => {
  const dispatch = useDispatch();
  const userStats = useSelector((state: RootState) => selectUserStats(state));
  const activeAchievements = useSelector((state: RootState) => selectActiveAchievements(state));
  const unlockedAchievements = useSelector((state: RootState) => selectUnlockedAchievements(state));
  const activeChallenges = useSelector((state: RootState) => selectActiveChallenges(state));
  const leaderboard = useSelector((state: RootState) => selectLeaderboard(state));
  const recentUnlocks = useSelector((state: RootState) => selectRecentUnlocks(state));
  const progressToNextLevel = useSelector((state: RootState) => selectProgressToNextLevel(state));

  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements' | 'challenges' | 'leaderboard'>('overview');
  const [animatedValues] = useState({
    levelProgress: new Animated.Value(0),
    pointsAnimation: new Animated.Value(0),
    achievementCard: new Animated.Value(0),
  });

  useEffect(() => {
    // Animate level progress
    Animated.timing(animatedValues.levelProgress, {
      toValue: progressToNextLevel,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    // Animate points counter
    Animated.timing(animatedValues.pointsAnimation, {
      toValue: userStats.totalPoints,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    // Animate achievement cards
    Animated.stagger(100, 
      activeAchievements.slice(0, 3).map(() =>
        Animated.spring(animatedValues.achievementCard, {
          toValue: 1,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [userStats, activeAchievements]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      case 'diamond': return '#B9F2FF';
      default: return '#999';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#888';
      case 'rare': return '#0080FF';
      case 'epic': return '#8A2BE2';
      case 'legendary': return '#FFD700';
      default: return '#666';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workout': return 'fitness';
      case 'nutrition': return 'nutrition';
      case 'progress': return 'trending-up';
      case 'social': return 'people';
      case 'special': return 'star';
      default: return 'trophy';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* User Level Card */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.levelCard}
      >
        <View style={styles.levelHeader}>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>Level {userStats.level}</Text>
            <Text style={styles.pointsText}>
              {userStats.totalPoints.toLocaleString()} Points
            </Text>
          </View>
          <View style={styles.levelBadge}>
            <Ionicons name="trophy" size={32} color="#FFD700" />
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {userStats.experiencePoints} / {userStats.experienceToNextLevel} XP
          </Text>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: animatedValues.levelProgress.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp',
                  }),
                },
              ]}
            />
          </View>
        </View>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="fitness" size={24} color="#667eea" />
          <Text style={styles.statNumber}>{userStats.totalWorkouts}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={24} color="#FF6B6B" />
          <Text style={styles.statNumber}>{userStats.currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color="#4ECDC4" />
          <Text style={styles.statNumber}>{formatTime(userStats.totalTimeMinutes)}</Text>
          <Text style={styles.statLabel}>Total Time</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="analytics" size={24} color="#45B7D1" />
          <Text style={styles.statNumber}>{userStats.totalSets}</Text>
          <Text style={styles.statLabel}>Total Sets</Text>
        </View>
      </View>

      {/* Recent Unlocks */}
      {recentUnlocks.length > 0 && (
        <View style={styles.recentUnlocksContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <TouchableOpacity
              onPress={() => dispatch(clearRecentUnlocks())}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
          {recentUnlocks.map((achievement, index) => (
            <Animated.View
              key={achievement.id}
              style={[
                styles.recentUnlockCard,
                {
                  transform: [{
                    translateX: animatedValues.achievementCard.interpolate({
                      inputRange: [0, 1],
                      outputRange: [width, 0],
                    }),
                  }],
                },
              ]}
            >
              <View style={[styles.achievementIcon, { backgroundColor: getTierColor(achievement.tier) }]}>
                <Ionicons 
                  name={getCategoryIcon(achievement.category) as any} 
                  size={20} 
                  color="white" 
                />
              </View>
              <View style={styles.unlockInfo}>
                <Text style={styles.unlockTitle}>{achievement.title}</Text>
                <Text style={styles.unlockPoints}>+{achievement.points} points</Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </Animated.View>
          ))}
        </View>
      )}

      {/* Active Challenges Preview */}
      <View style={styles.challengesPreview}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Challenges</Text>
          <TouchableOpacity onPress={() => setSelectedTab('challenges')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {activeChallenges.slice(0, 2).map((challenge) => (
          <TouchableOpacity key={challenge.id} style={styles.challengePreviewCard}>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <Text style={styles.challengeProgress}>
                {challenge.progress} / {challenge.target}
              </Text>
            </View>
            <View style={styles.challengeProgressBar}>
              <View
                style={[
                  styles.challengeProgressFill,
                  { width: `${(challenge.progress / challenge.target) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.challengeReward}>+{challenge.reward.points} pts</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderAchievementsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.achievementStats}>
        <Text style={styles.achievementStatsText}>
          {unlockedAchievements.length} / {activeAchievements.length + unlockedAchievements.length} Unlocked
        </Text>
      </View>

      {/* Active Achievements */}
      <Text style={styles.categoryTitle}>In Progress</Text>
      {activeAchievements.map((achievement) => (
        <TouchableOpacity
          key={achievement.id}
          style={[
            styles.achievementCard,
            { borderLeftColor: getTierColor(achievement.tier) },
          ]}
          onPress={() => {
            Alert.alert(
              achievement.title,
              achievement.description,
              [{ text: 'OK' }]
            );
          }}
        >
          <View style={styles.achievementHeader}>
            <View style={[styles.achievementIcon, { backgroundColor: getTierColor(achievement.tier) }]}>
              <Ionicons 
                name={getCategoryIcon(achievement.category) as any} 
                size={24} 
                color="white" 
              />
            </View>
            <View style={styles.achievementInfo}>
              <View style={styles.achievementTitleRow}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(achievement.rarity) }]}>
                  <Text style={styles.rarityText}>{achievement.rarity.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
              <Text style={styles.achievementPoints}>{achievement.points} points</Text>
            </View>
          </View>
          
          <View style={styles.achievementProgressContainer}>
            <View style={styles.achievementProgressBar}>
              <View
                style={[
                  styles.achievementProgressFill,
                  { 
                    width: `${achievement.progress}%`,
                    backgroundColor: getTierColor(achievement.tier),
                  },
                ]}
              />
            </View>
            <Text style={styles.achievementProgressText}>{achievement.progress.toFixed(0)}%</Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <>
          <Text style={styles.categoryTitle}>Unlocked</Text>
          {unlockedAchievements.map((achievement) => (
            <TouchableOpacity
              key={achievement.id}
              style={[
                styles.achievementCard,
                styles.unlockedAchievement,
                { borderLeftColor: getTierColor(achievement.tier) },
              ]}
            >
              <View style={styles.achievementHeader}>
                <View style={[styles.achievementIcon, { backgroundColor: getTierColor(achievement.tier) }]}>
                  <Ionicons 
                    name={getCategoryIcon(achievement.category) as any} 
                    size={24} 
                    color="white" 
                  />
                </View>
                <View style={styles.achievementInfo}>
                  <View style={styles.achievementTitleRow}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  <Text style={styles.achievementPoints}>{achievement.points} points</Text>
                  {achievement.unlockedAt && (
                    <Text style={styles.unlockedDate}>
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );

  const renderChallengesTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Active Challenges */}
      <Text style={styles.categoryTitle}>Active Challenges</Text>
      {activeChallenges.map((challenge) => (
        <TouchableOpacity
          key={challenge.id}
          style={[
            styles.challengeCard,
            { borderLeftColor: challenge.type === 'daily' ? '#FF6B6B' : '#4ECDC4' },
          ]}
        >
          <View style={styles.challengeHeader}>
            <View style={styles.challengeTypeContainer}>
              <Text style={[
                styles.challengeType,
                { color: challenge.type === 'daily' ? '#FF6B6B' : '#4ECDC4' },
              ]}>
                {challenge.type.toUpperCase()}
              </Text>
              <Ionicons 
                name={challenge.category === 'workout' ? 'fitness' : 'nutrition'} 
                size={16} 
                color="#666" 
              />
            </View>
            <Text style={styles.challengeRewardText}>+{challenge.reward.points} pts</Text>
          </View>
          
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDescription}>{challenge.description}</Text>
          
          <View style={styles.challengeProgressContainer}>
            <View style={styles.challengeProgressInfo}>
              <Text style={styles.challengeProgressLabel}>Progress</Text>
              <Text style={styles.challengeProgressValue}>
                {challenge.progress} / {challenge.target}
              </Text>
            </View>
            <View style={styles.challengeProgressBar}>
              <View
                style={[
                  styles.challengeProgressFill,
                  { 
                    width: `${(challenge.progress / challenge.target) * 100}%`,
                    backgroundColor: challenge.type === 'daily' ? '#FF6B6B' : '#4ECDC4',
                  },
                ]}
              />
            </View>
          </View>
          
          <View style={styles.challengeTimeContainer}>
            <Ionicons name="time" size={14} color="#666" />
            <Text style={styles.challengeTimeText}>
              Ends {new Date(challenge.endDate).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      {activeChallenges.length === 0 && (
        <View style={styles.emptyChallenges}>
          <Ionicons name="trophy-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No active challenges</Text>
          <Text style={styles.emptySubtext}>Check back tomorrow for new challenges!</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderLeaderboardTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.leaderboardHeader}>
        <Text style={styles.leaderboardTitle}>Global Leaderboard</Text>
        <Text style={styles.leaderboardSubtitle}>Compete with fitness enthusiasts worldwide</Text>
      </View>

      {leaderboard.length === 0 ? (
        <View style={styles.emptyLeaderboard}>
          <Ionicons name="people-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Leaderboard coming soon!</Text>
          <Text style={styles.emptySubtext}>Complete workouts to climb the ranks</Text>
        </View>
      ) : (
        leaderboard.map((user, index) => (
          <View
            key={user.userId}
            style={[
              styles.leaderboardCard,
              index < 3 && styles.topThreeCard,
            ]}
          >
            <View style={styles.rankContainer}>
              <Text style={[
                styles.rankText,
                index < 3 && styles.topThreeRank,
              ]}>
                {user.rank}
              </Text>
              {index === 0 && <Ionicons name="trophy" size={16} color="#FFD700" />}
              {index === 1 && <Ionicons name="medal" size={16} color="#C0C0C0" />}
              {index === 2 && <Ionicons name="medal" size={16} color="#CD7F32" />}
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.username}>{user.username}</Text>
              <Text style={styles.userLevel}>Level {user.level}</Text>
            </View>
            
            <View style={styles.userStats}>
              <Text style={styles.userPoints}>{user.points.toLocaleString()}</Text>
              <Text style={styles.userPointsLabel}>points</Text>
            </View>
            
            <View style={styles.userBadges}>
              <Ionicons name="flame" size={14} color="#FF6B6B" />
              <Text style={styles.streakText}>{user.currentStreak}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderTabButton = (tab: typeof selectedTab, title: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, selectedTab === tab && styles.activeTabButton]}
      onPress={() => setSelectedTab(tab)}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={selectedTab === tab ? '#667eea' : '#666'} 
      />
      <Text style={[
        styles.tabButtonText,
        selectedTab === tab && styles.activeTabButtonText,
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Achievements & Challenges</Text>
        <Text style={styles.headerSubtitle}>Track your fitness journey</Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {renderTabButton('overview', 'Overview', 'home')}
        {renderTabButton('achievements', 'Achievements', 'trophy')}
        {renderTabButton('challenges', 'Challenges', 'flag')}
        {renderTabButton('leaderboard', 'Leaderboard', 'podium')}
      </View>

      {/* Tab Content */}
      {selectedTab === 'overview' && renderOverviewTab()}
      {selectedTab === 'achievements' && renderAchievementsTab()}
      {selectedTab === 'challenges' && renderChallengesTab()}
      {selectedTab === 'leaderboard' && renderLeaderboardTab()}
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
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  tabButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: '#667eea',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  levelCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  pointsText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  recentUnlocksContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#667eea',
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  viewAllText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  recentUnlockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  unlockInfo: {
    flex: 1,
  },
  unlockTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  unlockPoints: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  challengesPreview: {
    marginBottom: 20,
  },
  challengePreviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  challengeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  challengeProgress: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  challengeProgressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 3,
  },
  challengeReward: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'right',
  },
  achievementStats: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  achievementStatsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  achievementCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  unlockedAchievement: {
    opacity: 0.8,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  achievementInfo: {
    flex: 1,
    marginLeft: 12,
  },
  achievementTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rarityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  achievementPoints: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  unlockedDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  achievementProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  achievementProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  achievementProgressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  challengeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeType: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  challengeRewardText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  challengeProgressContainer: {
    marginBottom: 8,
  },
  challengeProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  challengeProgressLabel: {
    fontSize: 12,
    color: '#666',
  },
  challengeProgressValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  challengeTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeTimeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyChallenges: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  leaderboardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  leaderboardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  emptyLeaderboard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  topThreeCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 40,
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 4,
  },
  topThreeRank: {
    color: '#FFD700',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userLevel: {
    fontSize: 12,
    color: '#666',
  },
  userStats: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  userPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  userPointsLabel: {
    fontSize: 12,
    color: '#666',
  },
  userBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: 2,
  },
});

export default GamificationScreen;
