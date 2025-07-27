import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SocialFitnessHubProps {
  navigation: any;
}

const SocialFitnessHub: React.FC<SocialFitnessHubProps> = ({ navigation }) => {
  const socialFeatures = [
    {
      id: 'live_workouts',
      title: 'Live Workouts',
      description: 'Join real-time workout sessions with friends and the community',
      icon: 'fitness',
      color: '#FF6B6B',
      route: 'LiveSocialWorkout',
      badges: ['🔥 2 Live Now'],
    },
    {
      id: 'challenges',
      title: 'Social Challenges',
      description: 'Compete in fitness challenges and win rewards',
      icon: 'trophy',
      color: '#FFD700',
      route: 'SocialChallenge',
      badges: ['⚡ 3 Active'],
    },
    {
      id: 'communities',
      title: 'Community Groups',
      description: 'Connect with like-minded fitness enthusiasts',
      icon: 'people',
      color: '#32D74B',
      route: 'CommunityGroups',
      badges: ['👥 156 Members'],
    },
    {
      id: 'mentorship',
      title: 'Fitness Mentorship',
      description: 'Get guidance from experienced trainers and mentors',
      icon: 'school',
      color: '#007AFF',
      route: 'FitnessMentorship',
      badges: ['🎯 Find Mentor'],
    },
    {
      id: 'leaderboards',
      title: 'Global Leaderboards',
      description: 'See how you rank against the global fitness community',
      icon: 'podium',
      color: '#FF9500',
      route: 'GlobalLeaderboards',
      badges: ['📈 #47 This Week'],
    },
    {
      id: 'social_feed',
      title: 'Social Feed',
      description: 'Share progress, celebrate achievements, and get inspired',
      icon: 'newspaper',
      color: '#8B5CF6',
      route: 'SocialFeed',
      badges: ['💬 5 New Posts'],
    },
  ];

  const quickStats = {
    activeFriends: 23,
    weeklyWorkouts: 156,
    communityRank: 47,
    streakDays: 12,
  };

  const renderFeatureCard = (feature: typeof socialFeatures[0]) => (
    <TouchableOpacity
      key={feature.id}
      style={[styles.featureCard, { borderLeftColor: feature.color }]}
      onPress={() => navigation.navigate(feature.route)}
    >
      <View style={styles.featureHeader}>
        <View style={[styles.iconContainer, { backgroundColor: feature.color }]}>
          <Ionicons name={feature.icon as any} size={24} color="#FFF" />
        </View>
        <View style={styles.featureInfo}>
          <Text style={styles.featureTitle}>{feature.title}</Text>
          <Text style={styles.featureDescription}>{feature.description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
      
      {feature.badges.length > 0 && (
        <View style={styles.featureBadges}>
          {feature.badges.map((badge, index) => (
            <View key={index} style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Social Fitness</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Social Fitness! 🏋️‍♀️</Text>
          <Text style={styles.welcomeSubtitle}>
            Connect, compete, and achieve your fitness goals together with the community
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Social Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{quickStats.activeFriends}</Text>
              <Text style={styles.statLabel}>Active Friends</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{quickStats.weeklyWorkouts}</Text>
              <Text style={styles.statLabel}>Community Workouts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>#{quickStats.communityRank}</Text>
              <Text style={styles.statLabel}>Global Rank</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{quickStats.streakDays}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Live Activity Banner */}
        <View style={styles.liveActivityBanner}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE NOW</Text>
          </View>
          <Text style={styles.liveActivityTitle}>Morning HIIT Session</Text>
          <Text style={styles.liveActivitySubtitle}>12 people working out • Join now!</Text>
          <TouchableOpacity 
            style={styles.joinLiveButton}
            onPress={() => navigation.navigate('LiveSocialWorkout', { sessionId: 'live_session_1' })}
          >
            <Text style={styles.joinLiveButtonText}>Join Live Session</Text>
            <Ionicons name="flash" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Social Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Social Features</Text>
          {socialFeatures.map(renderFeatureCard)}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="add-circle" size={32} color="#007AFF" />
              <Text style={styles.quickActionText}>Start Live Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="people-circle" size={32} color="#32D74B" />
              <Text style={styles.quickActionText}>Invite Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="trophy" size={32} color="#FFD700" />
              <Text style={styles.quickActionText}>Create Challenge</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="chatbubble" size={32} color="#8B5CF6" />
              <Text style={styles.quickActionText}>Join Discussion</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="trophy" size={16} color="#FFD700" />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Challenge Completed!</Text>
                <Text style={styles.activitySubtitle}>You finished the 7-Day Plank Challenge</Text>
              </View>
              <Text style={styles.activityTime}>2h ago</Text>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="people" size={16} color="#32D74B" />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>New Group Member</Text>
                <Text style={styles.activitySubtitle}>Alex joined "Morning Workout Crew"</Text>
              </View>
              <Text style={styles.activityTime}>4h ago</Text>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="fitness" size={16} color="#FF6B6B" />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Workout Session</Text>
                <Text style={styles.activitySubtitle}>Completed live HIIT session with 8 people</Text>
              </View>
              <Text style={styles.activityTime}>6h ago</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#111',
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  welcomeTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    color: '#999',
    fontSize: 16,
    lineHeight: 22,
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  liveActivityBanner: {
    margin: 20,
    marginTop: 0,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    marginRight: 6,
  },
  liveText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: 'bold',
  },
  liveActivityTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  liveActivitySubtitle: {
    color: '#999',
    fontSize: 14,
    marginBottom: 16,
  },
  joinLiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  joinLiveButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  featuresSection: {
    padding: 20,
    paddingTop: 0,
  },
  featureCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDescription: {
    color: '#999',
    fontSize: 14,
    lineHeight: 20,
  },
  featureBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  quickActionsSection: {
    padding: 20,
    paddingTop: 0,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (SCREEN_WIDTH - 60) / 2,
    marginBottom: 12,
  },
  quickActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  recentActivitySection: {
    padding: 20,
    paddingTop: 0,
  },
  activityList: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  activitySubtitle: {
    color: '#999',
    fontSize: 12,
  },
  activityTime: {
    color: '#666',
    fontSize: 12,
  },
});

export default SocialFitnessHub;
